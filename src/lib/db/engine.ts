import type { IDbEngine, DbResult } from './types';
import { PGlite } from '@electric-sql/pglite';
import initSqlJs from 'sql.js';

export type { IDbEngine, DbResult };

export class PgliteEngine implements IDbEngine {
	private db: PGlite | null = null;

	async init(seedSql: string): Promise<void> {
		if (this.db) {
			try {
				await this.db.exec(`
					ROLLBACK;
					SET search_path TO public;
					DO $$ 
					DECLARE 
						s text;
						r text;
					BEGIN
						FOR s IN 
							SELECT nspname FROM pg_namespace 
							WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast') 
							  AND nspname NOT LIKE 'pg_temp_%' 
							  AND nspname NOT LIKE 'pg_toast_temp_%'
						LOOP
							EXECUTE 'DROP SCHEMA IF EXISTS ' || quote_ident(s) || ' CASCADE';
						END LOOP;
						FOR r IN 
							SELECT rolname FROM pg_roles 
							WHERE rolname NOT LIKE 'pg_%' AND rolname <> 'postgres'
						LOOP
							BEGIN
								EXECUTE 'DROP OWNED BY ' || quote_ident(r);
							EXCEPTION WHEN OTHERS THEN
								NULL;
							END;
							EXECUTE 'DROP ROLE IF EXISTS ' || quote_ident(r);
						END LOOP;
					END $$;
					CREATE SCHEMA public;
					GRANT ALL ON SCHEMA public TO public;
				`);
				try {
					const extraDbs = await this.db.query(
						"SELECT datname FROM pg_database WHERE datname NOT IN ('postgres', 'template0', 'template1');"
					);
					for (const row of extraDbs.rows as any[]) {
						try {
							await this.db.query(`DROP DATABASE IF EXISTS "${row.datname}";`);
						} catch {}
					}
				} catch {}
				if (seedSql && seedSql.trim()) {
					await this.db.exec(seedSql);
				}
				return;
			} catch (e) {
				await this.destroy();
			}
		}

		this.db = new PGlite();
		if (seedSql && seedSql.trim()) {
			await this.db.exec(seedSql);
		}
	}

	async query(sql: string): Promise<DbResult> {
		if (!this.db) throw new Error('Database engine not initialized');
		try {
			const res = await this.db.query(sql);
			const rows = (res.rows || []) as Record<string, any>[];
			const columns = res.fields ? res.fields.map(f => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);
			return { columns, rows };
		} catch (e: any) {
			if (e && (e.code === '42601' || /cannot insert multiple commands/i.test(e.message || ''))) {
				const execRes = await this.db.exec(sql);
				const lastRes = execRes.length > 0 ? execRes[execRes.length - 1] : { rows: [], fields: [] };
				const rows = (lastRes.rows || []) as Record<string, any>[];
				const columns = lastRes.fields ? lastRes.fields.map(f => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);
				return { columns, rows };
			}
			throw e;
		}
	}

	async dumpDataDir(compression: 'none' | 'gzip' = 'none'): Promise<Blob | File> {
		if (!this.db) throw new Error('Database engine not initialized');
		return await (this.db as any).dumpDataDir(compression);
	}

	async loadDataDir(file: Blob | File): Promise<void> {
		await this.destroy();
		this.db = await PGlite.create({ loadDataDir: file });
	}

	getInternalDb(): PGlite | null {
		return this.db;
	}

	async destroy(): Promise<void> {
		if (this.db) {
			try {
				await this.db.close();
			} catch (e) {
				// Ignore close error
			}
			this.db = null;
		}
	}
}


let sqlInstance: any = null;

function preprocessSqlForSqlJs(sql: string): string {
	return sql
		.replace(/\bUNSIGNED\b/gi, '')
		.replace(/\b(?:INT|INTEGER|BIGINT)?\s*AUTO_INCREMENT\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
		.replace(/\b(?:INT|INTEGER|BIGINT)?\s*GENERATED\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY(?:\s+PRIMARY\s+KEY)?\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
		.replace(/\bSERIAL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
		.replace(/\bAUTO_INCREMENT\b/gi, 'AUTOINCREMENT')
		.replace(/\bLAST_INSERT_ID\(\)/gi, 'last_insert_rowid()')
		.replace(/\bIF\s*\((?!NOT\s+EXISTS|EXISTS)/gi, 'IIF(')
		.replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/gi, 'ON CONFLICT DO UPDATE SET')
		.replace(/\bVALUES\s*\(\s*(\w+)\s*\)/gi, 'excluded.$1')
		.replace(/GROUP_CONCAT\s*\(\s*(?:DISTINCT\s+)?([\w.]+)(?:\s+ORDER\s+BY\s+[^)]+?)?\s+SEPARATOR\s+(['"][^'"]+['"])\s*\)/gi, 'GROUP_CONCAT($1, $2)')
		.replace(/JSON_UNQUOTE\s*\(\s*JSON_EXTRACT\s*\(([^,]+),\s*([^)]+)\)\s*\)/gi, 'json_extract($1, $2)')
		.replace(/JSON_EXTRACT\s*\(([^,]+),\s*([^)]+)\)/gi, 'json_extract($1, $2)')
		.replace(/JSON_UNQUOTE\s*\(([^)]+)\)/gi, '$1')
		.replace(/JSON_CONTAINS_PATH\s*\(([^,]+),\s*['"](?:one|all)['"],\s*(['"][^'"]+['"])\)/gi, 'json_extract($1, $2) IS NOT NULL')
		.replace(/\bENUM\s*\([^)]*\)/gi, 'TEXT')
		.replace(/\bJSONB\b/gi, 'TEXT')
		.replace(/\bVARCHAR\(\d+\)/gi, 'TEXT')
		.replace(/\bEXTRACT\s*\(\s*YEAR\s+FROM\s+([^)]+)\s*\)/gi, "strftime('%Y', $1)")
		.replace(/\bTRUNCATE\s+TABLE\s+(\w+);?/gi, 'DELETE FROM $1;')
		.replace(/\bTRUNCATE\s+(\w+);?/gi, 'DELETE FROM $1;')
		.replace(/\bSTART\s+TRANSACTION;?/gi, 'BEGIN TRANSACTION;')
		.replace(/\s+FOR\s+UPDATE;?/gi, ';')
		.replace(/\bCREATE\s+SCHEMA\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+);?/gi, ';')
		.replace(/\bCREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+);?/gi, ';')
		.replace(/\bUSE\s+(\w+);?/gi, ';')
		.replace(/\bSET\s+search_path\s+TO\s+[^;]+;?/gi, ';')
		.replace(/\bCREATE\s+TYPE\s+[^;]+;?/gi, ';')
		.replace(/\bALTER\s+TABLE\s+\w+\s+MODIFY\b[^;]+;?/gi, ';')
		.replace(/\bLOCK\s+TABLES\b[^;]+;?/gi, ';')
		.replace(/\bUNLOCK\s+TABLES;?/gi, ';')
		.replace(/\bLOCK\s+INSTANCE\s+FOR\s+BACKUP;?/gi, ';')
		.replace(/\bUNLOCK\s+INSTANCE;?/gi, ';')
		.replace(/\bCREATE\s+USER\b[^;]+;?/gi, ';')
		.replace(/\bALTER\s+USER\b[^;]+;?/gi, ';')
		.replace(/\bGRANT\b[^;]+;?/gi, ';')
		.replace(/\bREVOKE\b[^;]+;?/gi, ';')
		.replace(/\bLOCK\s+TABLE\b[^;]+;?/gi, ';')
		.replace(/\bCHECKPOINT;?/gi, ';')
		.replace(/MATCH\s*\(([^)]+)\)\s+AGAINST\s*\(\s*['"]([^'"]+)['"]\s*(?:IN\s+([^)]+)\s+MODE)?\s*\)/gi, (_match, cols, term, mode) => {
			const colList = cols.split(',').map((c: string) => c.trim());
			const isBoolean = mode && /BOOLEAN/i.test(mode);
			if (isBoolean) {
				const tokens = term.trim().split(/\s+/);
				const conditions: string[] = [];
				for (const token of tokens) {
					if (token.startsWith('+')) {
						const word = token.slice(1);
						conditions.push(`(${colList.map((c: string) => `${c} LIKE '%${word}%'`).join(' OR ')})`);
					} else if (token.startsWith('-')) {
						const word = token.slice(1);
						conditions.push(`(${colList.map((c: string) => `${c} NOT LIKE '%${word}%'`).join(' AND ')})`);
					} else {
						const word = token.replace(/[+*~<>()"]/g, '');
						conditions.push(`(${colList.map((c: string) => `${c} LIKE '%${word}%'`).join(' OR ')})`);
					}
				}
				return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
			}
			const terms = term.replace(/[+*~<>()"]/g, '').trim().split(/\s+/);
			const conditions: string[] = [];
			for (const t of terms) {
				const sub = colList.map((c: string) => `${c} LIKE '%${t}%'`).join(' OR ');
				conditions.push(`(${sub})`);
			}
			return conditions.join(' AND ');
		});
}

export class SqlJsEngine implements IDbEngine {
	private db: any = null;

	async init(seedSql: string): Promise<void> {
		await this.destroy();
		if (!sqlInstance) {
			const options = typeof window !== 'undefined' ? {
				locateFile: (file: string) => {
					if (file === 'sql-wasm-browser.wasm') {
						return '/sql-wasm.wasm';
					}
					return `/${file}`;
				}
			} : undefined;
			sqlInstance = await initSqlJs(options);
		}
		this.db = new sqlInstance.Database();
		this.db.create_function('JSON_CONTAINS', (target: string, candidate: string, path?: string) => {
			try {
				let obj = JSON.parse(target);
				if (path) {
					const cleanPath = path.replace(/^\$\./, '');
					obj = obj[cleanPath];
				}
				const cand = JSON.parse(candidate);
				return JSON.stringify(obj) === JSON.stringify(cand) || (typeof obj === 'object' && obj !== null && cand in obj) ? 1 : 0;
			} catch {
				return 0;
			}
		});
		this.db.create_function('JSON_CONTAINS_PATH', (target: string, _oneOrAll: string, path: string) => {
			try {
				let obj = JSON.parse(target);
				const cleanPath = path.replace(/^\$\./, '');
				return obj && typeof obj === 'object' && cleanPath in obj ? 1 : 0;
			} catch {
				return 0;
			}
		});
		if (seedSql.trim()) {
			this.db.exec(preprocessSqlForSqlJs(seedSql));
		}
	}

	async query(sql: string): Promise<DbResult> {
		if (!this.db) throw new Error('Database engine not initialized');
		const processed = preprocessSqlForSqlJs(sql);
		const res = this.db.exec(processed);
		if (!res || res.length === 0) {
			try {
				if (sql.trim().toUpperCase().startsWith('SELECT')) {
					const stmt = this.db.prepare(sql);
					const columns = stmt.getColumnNames();
					stmt.free();
					return { columns, rows: [] };
				}
			} catch (e) {
				// Ignore statement prepare error
			}
			return { columns: [], rows: [] };
		}
		const lastResult = res[res.length - 1];
		const columns: string[] = lastResult.columns;
		const rows = lastResult.values.map((row: any[]) => {
			const obj: Record<string, any> = {};
			columns.forEach((col, idx) => {
				obj[col] = row[idx];
			});
			return obj;
		});
		return { columns, rows };
	}

	async destroy(): Promise<void> {
		if (this.db) {
			try {
				this.db.close();
			} catch (e) {
				// Ignore close error
			}
			this.db = null;
		}
	}
}

export function createDbEngine(type: 'postgres' | 'mysql'): IDbEngine {
	if (type === 'postgres') {
		return new PgliteEngine();
	} else {
		return new SqlJsEngine();
	}
}
