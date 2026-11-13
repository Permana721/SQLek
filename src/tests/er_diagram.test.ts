import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parsePgArray, introspectDatabase } from '$lib/db/introspect';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';

describe('Visual ER Diagram & Schema Introspection Test Suite', () => {
	describe('parsePgArray Parser - Resilient Array & Literal Decoding', () => {
		it('handles native JS arrays of strings and numbers', () => {
			expect(parsePgArray(['id', 'department_id'])).toEqual(['id', 'department_id']);
			expect(parsePgArray([1, 2, 3])).toEqual(['1', '2', '3']);
		});

		it('parses PostgreSQL array string literals', () => {
			expect(parsePgArray('{id}')).toEqual(['id']);
			expect(parsePgArray('{col1,col2}')).toEqual(['col1', 'col2']);
			expect(parsePgArray('{ col1 , col2 }')).toEqual(['col1', 'col2']);
		});

		it('handles quoted elements with escaped characters or commas', () => {
			expect(parsePgArray('{"col,with,comma",col2}')).toEqual(['col,with,comma', 'col2']);
			expect(parsePgArray('{"user id","order id"}')).toEqual(['user id', 'order id']);
		});

		it('handles empty, null, and malformed inputs gracefully without throwing', () => {
			expect(parsePgArray('{}')).toEqual([]);
			expect(parsePgArray('{   }')).toEqual([]);
			expect(parsePgArray('')).toEqual([]);
			expect(parsePgArray(null)).toEqual([]);
			expect(parsePgArray(undefined)).toEqual([]);
			expect(parsePgArray('single_col')).toEqual(['single_col']);
		});
	});

	describe('PostgreSQL Introspection (PGlite)', () => {
		let engine: IDbEngine;

		beforeEach(() => {
			engine = createDbEngine('postgres');
		});

		afterEach(async () => {
			await engine.destroy();
		});

		it('extracts tables, columns, data types, PK, UNIQUE, and FK with ON DELETE CASCADE', async () => {
			const seed = `
				CREATE TABLE departments (
					id SERIAL PRIMARY KEY,
					dept_name VARCHAR(100) UNIQUE NOT NULL
				);
				CREATE TABLE employees (
					id SERIAL PRIMARY KEY,
					name VARCHAR(100) NOT NULL,
					department_id INT REFERENCES departments(id) ON DELETE CASCADE,
					manager_id INT REFERENCES employees(id) ON DELETE SET NULL
				);
			`;
			await engine.init(seed);

			const schema = await introspectDatabase(engine, 'postgres');

			expect(schema.tables.length).toBe(2);

			const dept = schema.tables.find((t) => t.name === 'departments');
			expect(dept).toBeDefined();
			expect(dept?.primaryKeys).toEqual(['id']);

			const deptIdCol = dept?.columns.find((c) => c.name === 'id');
			expect(deptIdCol?.isPk).toBe(true);
			expect(deptIdCol?.type).toBe('INT');

			const deptNameCol = dept?.columns.find((c) => c.name === 'dept_name');
			expect(deptNameCol?.isUnique).toBe(true);
			expect(deptNameCol?.type).toBe('VARCHAR');

			const emp = schema.tables.find((t) => t.name === 'employees');
			expect(emp).toBeDefined();
			expect(emp?.primaryKeys).toEqual(['id']);

			const empDeptCol = emp?.columns.find((c) => c.name === 'department_id');
			expect(empDeptCol?.isFk).toBe(true);

			const empMgrCol = emp?.columns.find((c) => c.name === 'manager_id');
			expect(empMgrCol?.isFk).toBe(true);

			// Check Foreign Key Relationships
			expect(schema.relationships.length).toBe(2);

			const deptRel = schema.relationships.find(
				(r) => r.sourceTable === 'employees' && r.sourceColumn === 'department_id'
			);
			expect(deptRel).toBeDefined();
			expect(deptRel?.targetTable).toBe('departments');
			expect(deptRel?.targetColumn).toBe('id');
			expect(deptRel?.onDelete).toBe('CASCADE');

			const mgrRel = schema.relationships.find(
				(r) => r.sourceTable === 'employees' && r.sourceColumn === 'manager_id'
			);
			expect(mgrRel).toBeDefined();
			expect(mgrRel?.targetTable).toBe('employees');
			expect(mgrRel?.targetColumn).toBe('id');
			expect(mgrRel?.onDelete).toBe('SET NULL');
		});

		it('supports composite primary keys correctly in PGlite', async () => {
			const seed = `
				CREATE TABLE cart_items (
					user_id INT,
					product_id INT,
					quantity INT,
					PRIMARY KEY (user_id, product_id)
				);
			`;
			await engine.init(seed);

			const schema = await introspectDatabase(engine, 'postgres');
			const cart = schema.tables.find((t) => t.name === 'cart_items');

			expect(cart).toBeDefined();
			expect(cart?.primaryKeys).toContain('user_id');
			expect(cart?.primaryKeys).toContain('product_id');

			const userCol = cart?.columns.find((c) => c.name === 'user_id');
			const prodCol = cart?.columns.find((c) => c.name === 'product_id');
			const qtyCol = cart?.columns.find((c) => c.name === 'quantity');

			expect(userCol?.isPk).toBe(true);
			expect(prodCol?.isPk).toBe(true);
			expect(qtyCol?.isPk).toBe(false);
		});

		it('dynamically refreshes when DDL queries are executed', async () => {
			await engine.init('');

			let schema = await introspectDatabase(engine, 'postgres');
			expect(schema.tables.length).toBe(0);

			// Execute DDL statement
			await engine.query(`
				CREATE TABLE projects (
					id SERIAL PRIMARY KEY,
					project_title TEXT NOT NULL
				);
			`);

			schema = await introspectDatabase(engine, 'postgres');
			expect(schema.tables.length).toBe(1);
			expect(schema.tables[0].name).toBe('projects');
			expect(schema.tables[0].columns.find((c) => c.name === 'id')?.isPk).toBe(true);
		});
	});

	describe('MySQL / SQLite Introspection (sql.js)', () => {
		let engine: IDbEngine;

		beforeEach(() => {
			engine = createDbEngine('mysql');
		});

		afterEach(async () => {
			await engine.destroy();
		});

		it('extracts tables, columns, PK, UNIQUE, and FK with ON DELETE rules', async () => {
			const seed = `
				CREATE TABLE categories (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					category_name TEXT UNIQUE NOT NULL
				);
				CREATE TABLE products (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					category_id INTEGER,
					FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
				);
			`;
			await engine.init(seed);

			const schema = await introspectDatabase(engine, 'mysql');

			expect(schema.tables.length).toBe(2);

			const cat = schema.tables.find((t) => t.name === 'categories');
			expect(cat).toBeDefined();
			expect(cat?.primaryKeys).toEqual(['id']);

			const catNameCol = cat?.columns.find((c) => c.name === 'category_name');
			expect(catNameCol?.isUnique).toBe(true);

			const prod = schema.tables.find((t) => t.name === 'products');
			expect(prod).toBeDefined();
			expect(prod?.primaryKeys).toEqual(['id']);

			const catIdCol = prod?.columns.find((c) => c.name === 'category_id');
			expect(catIdCol?.isFk).toBe(true);

			// Check Foreign Key
			expect(schema.relationships.length).toBe(1);
			const rel = schema.relationships[0];
			expect(rel.sourceTable).toBe('products');
			expect(rel.sourceColumn).toBe('category_id');
			expect(rel.targetTable).toBe('categories');
			expect(rel.targetColumn).toBe('id');
			expect(rel.onDelete).toBe('CASCADE');
		});

		it('supports composite primary keys in sql.js', async () => {
			const seed = `
				CREATE TABLE user_roles (
					user_id INT,
					role_id INT,
					assigned_at TEXT,
					PRIMARY KEY (user_id, role_id)
				);
			`;
			await engine.init(seed);

			const schema = await introspectDatabase(engine, 'mysql');
			const table = schema.tables.find((t) => t.name === 'user_roles');

			expect(table).toBeDefined();
			expect(table?.primaryKeys).toContain('user_id');
			expect(table?.primaryKeys).toContain('role_id');

			const uCol = table?.columns.find((c) => c.name === 'user_id');
			const rCol = table?.columns.find((c) => c.name === 'role_id');
			const aCol = table?.columns.find((c) => c.name === 'assigned_at');

			expect(uCol?.isPk).toBe(true);
			expect(rCol?.isPk).toBe(true);
			expect(aCol?.isPk).toBe(false);
		});

		it('dynamically refreshes when DDL CREATE TABLE is executed in sql.js', async () => {
			await engine.init('');

			let schema = await introspectDatabase(engine, 'mysql');
			expect(schema.tables.length).toBe(0);

			await engine.query('CREATE TABLE dynamic_demo (id INT PRIMARY KEY, val TEXT);');

			schema = await introspectDatabase(engine, 'mysql');
			expect(schema.tables.length).toBe(1);
			expect(schema.tables[0].name).toBe('dynamic_demo');
			expect(schema.tables[0].columns.find((c) => c.name === 'id')?.isPk).toBe(true);
		});
	});
});
