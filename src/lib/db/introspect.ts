import type { IDbEngine, DbResult } from './engine';
import type { DatabaseSchema, TableEntity, ColumnMetadata, ForeignKeyRelationship } from './schema';

export type { DatabaseSchema, TableEntity, ColumnMetadata, ForeignKeyRelationship };

/**
 * Parses PostgreSQL array output safely, handling both native JS arrays
 * and string literal representations (e.g. "{col1,col2}" or "{\"col,with,comma\",col2}").
 */
export function parsePgArray(val: any): string[] {
	if (!val) return [];
	if (Array.isArray(val)) {
		return val.map((x) => String(x).trim()).filter((x) => x.length > 0);
	}
	if (typeof val === 'string') {
		const trimmed = val.trim();
		if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
			const inner = trimmed.slice(1, -1).trim();
			if (!inner) return [];
			const result: string[] = [];
			let current = '';
			let inQuotes = false;
			for (let i = 0; i < inner.length; i++) {
				const char = inner[i];
				if (char === '"' && (i === 0 || inner[i - 1] !== '\\')) {
					inQuotes = !inQuotes;
				} else if (char === ',' && !inQuotes) {
					const item = current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
					if (item) result.push(item);
					current = '';
				} else {
					current += char;
				}
			}
			const lastItem = current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
			if (lastItem) result.push(lastItem);
			return result;
		}
		if (trimmed.length > 0) {
			return [trimmed];
		}
	}
	return [];
}

function mapPgOnDeleteAction(actionCode: string | null | undefined): string {
	if (!actionCode) return 'NO ACTION';
	const code = actionCode.trim().toLowerCase();
	switch (code) {
		case 'c':
			return 'CASCADE';
		case 'r':
			return 'RESTRICT';
		case 'n':
			return 'SET NULL';
		case 'd':
			return 'SET DEFAULT';
		case 'a':
		default:
			return 'NO ACTION';
	}
}

function formatDataType(dataType: string, udtName?: string): string {
	const raw = (udtName || dataType || '').toLowerCase();
	if (raw.includes('int8') || raw === 'bigint') return 'BIGINT';
	if (raw.includes('int4') || raw === 'integer' || raw === 'int') return 'INT';
	if (raw.includes('int2') || raw === 'smallint') return 'SMALLINT';
	if (raw.includes('varchar') || raw.includes('character varying')) return 'VARCHAR';
	if (raw.includes('text')) return 'TEXT';
	if (raw.includes('bool')) return 'BOOLEAN';
	if (raw.includes('float') || raw.includes('double') || raw.includes('real')) return 'FLOAT';
	if (raw.includes('numeric') || raw.includes('decimal')) return 'DECIMAL';
	if (raw.includes('timestamp')) return 'TIMESTAMP';
	if (raw.includes('date')) return 'DATE';
	if (raw.includes('time')) return 'TIME';
	if (raw.includes('jsonb')) return 'JSONB';
	if (raw.includes('json')) return 'JSON';
	if (raw.includes('bytea') || raw.includes('blob')) return 'BLOB';
	return (dataType || udtName || 'TEXT').toUpperCase();
}

/**
 * Dynamic schema introspection for PostgreSQL (PGlite).
 */
async function introspectPostgres(engine: IDbEngine): Promise<DatabaseSchema> {
	// 1. Fetch tables and columns
	const colRes: DbResult = await engine.query(`
		SELECT
			c.table_name,
			c.column_name,
			c.data_type,
			c.udt_name,
			c.is_nullable,
			c.ordinal_position,
			c.column_default
		FROM information_schema.columns c
		JOIN information_schema.tables t 
			ON c.table_schema = t.table_schema 
		   AND c.table_name = t.table_name
		WHERE c.table_schema = 'public' 
		  AND t.table_type = 'BASE TABLE'
		ORDER BY c.table_name, c.ordinal_position;
	`);

	// 2. Fetch constraints: primary key (p), foreign key (f), unique (u)
	const constraintRes: DbResult = await engine.query(`
		SELECT
			c.conname AS constraint_name,
			c.contype AS constraint_type,
			tc.relname AS table_name,
			ARRAY(
				SELECT a.attname
				FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
				ORDER BY k.ord
			) AS column_names,
			fc.relname AS foreign_table_name,
			ARRAY(
				SELECT fa.attname
				FROM unnest(c.confkey) WITH ORDINALITY AS fk(attnum, ord)
				JOIN pg_attribute fa ON fa.attrelid = c.confrelid AND fa.attnum = fk.attnum
				ORDER BY fk.ord
			) AS foreign_column_names,
			c.confdeltype AS on_delete_action,
			c.confupdtype AS on_update_action
		FROM pg_constraint c
		JOIN pg_class tc ON c.conrelid = tc.oid
		JOIN pg_namespace tn ON tc.relnamespace = tn.oid
		LEFT JOIN pg_class fc ON c.confrelid = fc.oid
		WHERE tn.nspname = 'public'
		  AND c.contype IN ('p', 'f', 'u');
	`);

	const tableMap = new Map<string, { columns: ColumnMetadata[]; primaryKeys: string[] }>();
	const relationships: ForeignKeyRelationship[] = [];

	// Initialize tables and columns
	for (const row of colRes.rows) {
		const tableName = String(row.table_name);
		const colName = String(row.column_name);
		const dataType = formatDataType(String(row.data_type), String(row.udt_name));
		const isNullable = String(row.is_nullable).toUpperCase() === 'YES';

		if (!tableMap.has(tableName)) {
			tableMap.set(tableName, { columns: [], primaryKeys: [] });
		}

		tableMap.get(tableName)!.columns.push({
			name: colName,
			type: dataType,
			isPk: false,
			isFk: false,
			isUnique: false,
			isNullable,
			defaultValue: row.column_default ? String(row.column_default) : null
		});
	}

	// Process constraints
	for (const con of constraintRes.rows) {
		const tableName = String(con.table_name);
		const contype = String(con.constraint_type);
		const colNames = parsePgArray(con.column_names);
		const targetTable = con.foreign_table_name ? String(con.foreign_table_name) : '';
		const targetCols = parsePgArray(con.foreign_column_names);
		const tableData = tableMap.get(tableName);

		if (contype === 'p') {
			// Primary key
			if (tableData) {
				tableData.primaryKeys.push(...colNames);
				for (const cName of colNames) {
					const col = tableData.columns.find((c) => c.name === cName);
					if (col) col.isPk = true;
				}
			}
		} else if (contype === 'u') {
			// Unique constraint
			if (tableData) {
				for (const cName of colNames) {
					const col = tableData.columns.find((c) => c.name === cName);
					if (col) col.isUnique = true;
				}
			}
		} else if (contype === 'f') {
			// Foreign key
			if (tableData) {
				for (let i = 0; i < colNames.length; i++) {
					const srcCol = colNames[i];
					const tgtCol = targetCols[i] || targetCols[0] || 'id';
					const col = tableData.columns.find((c) => c.name === srcCol);
					if (col) col.isFk = true;

					relationships.push({
						constraintName: con.constraint_name ? String(con.constraint_name) : undefined,
						sourceTable: tableName,
						sourceColumn: srcCol,
						targetTable,
						targetColumn: tgtCol,
						onDelete: mapPgOnDeleteAction(con.on_delete_action),
						onUpdate: mapPgOnDeleteAction(con.on_update_action)
					});
				}
			}
		}
	}

	const tables: TableEntity[] = Array.from(tableMap.entries()).map(([name, data]) => ({
		name,
		columns: data.columns,
		primaryKeys: data.primaryKeys
	}));

	return { tables, relationships };
}

/**
 * Dynamic schema introspection for MySQL / SQLite (sql.js).
 */
async function introspectSqlJs(engine: IDbEngine): Promise<DatabaseSchema> {
	// 1. Fetch user tables
	const tablesRes = await engine.query(`
		SELECT name FROM sqlite_master 
		WHERE type = 'table' AND name NOT LIKE 'sqlite_%' 
		ORDER BY name;
	`);

	const tableNames = tablesRes.rows.map((r) => String(r.name || Object.values(r)[0]));
	const tables: TableEntity[] = [];
	const relationships: ForeignKeyRelationship[] = [];

	for (const tableName of tableNames) {
		// 2. Fetch column information
		const infoRes = await engine.query(`PRAGMA table_info("${tableName}");`);
		const primaryKeys: string[] = [];
		const columns: ColumnMetadata[] = [];

		for (const colRow of infoRes.rows) {
			const colName = String(colRow.name);
			const colType = formatDataType(String(colRow.type || 'TEXT'));
			const isPk = Number(colRow.pk) > 0;
			const isNullable = Number(colRow.notnull) === 0;

			if (isPk) {
				primaryKeys.push(colName);
			}

			columns.push({
				name: colName,
				type: colType,
				isPk,
				isFk: false,
				isUnique: false,
				isNullable,
				defaultValue: colRow.dflt_value !== null && colRow.dflt_value !== undefined ? String(colRow.dflt_value) : null
			});
		}

		// 3. Fetch foreign keys
		try {
			const fkRes = await engine.query(`PRAGMA foreign_key_list("${tableName}");`);
			for (const fkRow of fkRes.rows) {
				const srcCol = String(fkRow.from);
				const targetTable = String(fkRow.table);
				const targetCol = String(fkRow.to);
				const onDelete = fkRow.on_delete ? String(fkRow.on_delete).toUpperCase() : 'NO ACTION';
				const onUpdate = fkRow.on_update ? String(fkRow.on_update).toUpperCase() : 'NO ACTION';

				const col = columns.find((c) => c.name === srcCol);
				if (col) col.isFk = true;

				relationships.push({
					sourceTable: tableName,
					sourceColumn: srcCol,
					targetTable,
					targetColumn: targetCol,
					onDelete,
					onUpdate
				});
			}
		} catch (e) {
			// Ignore foreign key pragma error
		}

		// 4. Fetch unique constraints
		try {
			const idxListRes = await engine.query(`PRAGMA index_list("${tableName}");`);
			for (const idxRow of idxListRes.rows) {
				const isUnique = Number(idxRow.unique) === 1;
				const origin = String(idxRow.origin || '').toLowerCase();
				// SQLite creates autoindexes for PK (origin: 'pk'), skip PK autoindexes
				if (isUnique && origin !== 'pk') {
					const idxName = String(idxRow.name);
					const idxInfoRes = await engine.query(`PRAGMA index_info("${idxName}");`);
					for (const uColRow of idxInfoRes.rows) {
						const uColName = String(uColRow.name);
						const col = columns.find((c) => c.name === uColName);
						if (col && !col.isPk) {
							col.isUnique = true;
						}
					}
				}
			}
		} catch (e) {
			// Ignore index pragma error
		}

		tables.push({
			name: tableName,
			columns,
			primaryKeys
		});
	}

	return { tables, relationships };
}

/**
 * Universal database schema introspection for SQLek.
 * Extracts tables, columns, data types, PK, FK, UNIQUE, and relationships
 * from the active WASM database engine.
 */
export async function introspectDatabase(
	engine: IDbEngine | null,
	dbms: 'postgres' | 'mysql'
): Promise<DatabaseSchema> {
	if (!engine) {
		return { tables: [], relationships: [] };
	}

	try {
		if (dbms === 'postgres') {
			return await introspectPostgres(engine);
		} else {
			return await introspectSqlJs(engine);
		}
	} catch (error) {
		console.warn('Failed to introspect database schema:', error);
		return { tables: [], relationships: [] };
	}
}
