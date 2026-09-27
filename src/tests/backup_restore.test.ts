import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';

describe('Feature 3: Backup & Restore (pg_dump / psql WASM equivalent)', () => {
	let engine: IDbEngine;

	beforeEach(async () => {
		engine = createDbEngine('postgres');
	});

	afterEach(async () => {
		if (engine) {
			await engine.destroy();
		}
	});

	it('PgliteEngine implements dumpDataDir and loadDataDir methods', () => {
		expect(typeof engine.dumpDataDir).toBe('function');
		expect(typeof engine.loadDataDir).toBe('function');
	});

	it('dumpDataDir exports a valid File/Blob snapshot of the active database', async () => {
		await engine.init(`
			CREATE TABLE customers (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL
			);
			INSERT INTO customers (name) VALUES ('Alice'), ('Bob');
		`);

		const dump = await engine.dumpDataDir!('none');
		expect(dump).toBeDefined();
		expect(dump.size).toBeGreaterThan(0);
	});

	it('loadDataDir restores database state and swaps active database directory', async () => {
		await engine.init(`
			CREATE TABLE inventory (
				sku TEXT PRIMARY KEY,
				qty INT
			);
			INSERT INTO inventory VALUES ('ITEM-1', 42), ('ITEM-2', 99);
		`);

		// Export backup snapshot
		const backupSnapshot = await engine.dumpDataDir!('none');
		expect(backupSnapshot).toBeDefined();

		// Mutate original database: delete items and insert a new one
		await engine.query("DELETE FROM inventory WHERE sku = 'ITEM-1';");
		await engine.query("INSERT INTO inventory VALUES ('ITEM-MUTATED', 999);");

		const mutatedRes = await engine.query('SELECT sku, qty FROM inventory ORDER BY sku;');
		expect(mutatedRes.rows).toEqual([
			{ sku: 'ITEM-2', qty: 99 },
			{ sku: 'ITEM-MUTATED', qty: 999 }
		]);

		// Restore database from snapshot
		await engine.loadDataDir!(backupSnapshot);

		// Verify that database was restored back to the pristine snapshot state
		const restoredRes = await engine.query('SELECT sku, qty FROM inventory ORDER BY sku;');
		expect(restoredRes.rows).toEqual([
			{ sku: 'ITEM-1', qty: 42 },
			{ sku: 'ITEM-2', qty: 99 }
		]);
	});

	it('multiple tables, roles, and schema objects persist through backup and restore', async () => {
		await engine.init(`
			CREATE SCHEMA analytics;
			CREATE TABLE analytics.events (
				id SERIAL PRIMARY KEY,
				event_name TEXT NOT NULL
			);
			INSERT INTO analytics.events (event_name) VALUES ('page_view'), ('click');
			CREATE ROLE analyst_role;
		`);

		const backup = await engine.dumpDataDir!('none');

		// Create another engine instance and restore
		const newEngine = createDbEngine('postgres');
		await newEngine.loadDataDir!(backup);

		const events = await newEngine.query('SELECT event_name FROM analytics.events ORDER BY id;');
		expect(events.rows).toEqual([
			{ event_name: 'page_view' },
			{ event_name: 'click' }
		]);

		const role = await newEngine.query("SELECT rolname FROM pg_roles WHERE rolname = 'analyst_role';");
		expect(role.rows).toEqual([{ rolname: 'analyst_role' }]);

		await newEngine.destroy();
	});

	it('MySQL engine does not advertise PGlite dumpDataDir', () => {
		const mysqlEngine = createDbEngine('mysql');
		expect(mysqlEngine.dumpDataDir).toBeUndefined();
	});
});
