import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';
import { MODULES, resolveQuestionForEngine } from '$lib/data/questions';
import { fetchDynamicPreview, fetchAllDynamicPreviews, getQuestionPreviewData } from '$lib/data/previewData';
import { t } from '$lib/data/locale';

describe('Dynamic WASM Table Preview Synchronization', () => {
	const engines: Array<'postgres' | 'mysql'> = ['postgres', 'mysql'];

	engines.forEach((dbms) => {
		describe(`Engine: ${dbms}`, () => {
			let engine: IDbEngine;

			beforeEach(async () => {
				engine = createDbEngine(dbms);
			});

			afterEach(async () => {
				if (engine) {
					await engine.destroy();
				}
			});

			it('Module 2 Slot 7: Dynamic preview syncs identically with live WASM database state', async () => {
				// Module 2 Slot 7: Deduplication with DISTINCT (Var #3) - id 223
				const mod2 = MODULES.find((m) => m.id === 2)!;
				const rawQ = mod2.questions.find((q) => q.id === 223)!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				expect(q).toBeDefined();
				expect(q.table_names).toContain('items');

				// 1. Initialize engine with question seed_sql
				await engine.init(q.seed_sql);

				// 2. Fetch preview limited to 10 rows
				const preview10 = await fetchDynamicPreview(engine, 'items', q, 10);
				expect(preview10).toBeDefined();
				expect(preview10!.columns).toEqual(['id', 'name', 'category', 'price', 'stock', 'status']);
				expect(preview10!.rows.length).toBe(10);
				expect(preview10!.totalRowCount).toBe(12);
				expect(preview10!.isDynamic).toBe(true);

				// 3. Execute query: SELECT * FROM items;
				const liveResult = await engine.query('SELECT * FROM items;');
				expect(liveResult.columns).toEqual(['id', 'name', 'category', 'price', 'stock', 'status']);
				expect(liveResult.rows.length).toBe(12);

				// 4. Confirm preview rows match the first 10 rows of live query output identically
				for (let i = 0; i < 10; i++) {
					expect(preview10!.rows[i]).toEqual(liveResult.rows[i]);
				}

				// 5. Fetch full preview (limit = 0 or 12)
				const previewAll = await fetchDynamicPreview(engine, 'items', q, 0);
				expect(previewAll!.rows.length).toBe(12);
				expect(previewAll!.totalRowCount).toBe(12);
				expect(previewAll!.rows).toEqual(liveResult.rows);
			});

			it('Module 1 Slot 3: CREATE TABLE tasks retain mock blueprint schema preview without crashing', async () => {
				// Module 1 Slot 3: CREATE TABLE with Identity (Var #1) - id 103
				const mod1 = MODULES.find((m) => m.id === 1)!;
				const rawQ = mod1.questions.find((q) => q.categorySlot === 3 && q.isDdlCreate)!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				expect(q.isDdlCreate).toBe(true);
				expect(q.mockPreviewData).toBeDefined();

				// fetchDynamicPreview should gracefully return mock preview without throwing
				const preview = await fetchDynamicPreview(engine, 'books', q, 10);
				expect(preview).toBeDefined();
				expect(preview!.columns).toEqual(['id', 'title', 'price']);
				expect(preview!.rows.length).toBeGreaterThan(0);

				// fetchAllDynamicPreviews should also handle DDL questions correctly
				const allPreviews = await fetchAllDynamicPreviews(engine, q, 10);
				expect(allPreviews['books']).toBeDefined();
				expect(allPreviews['books'].columns).toEqual(['id', 'title', 'price']);
			});

			it('Multi-table tasks: fetchAllDynamicPreviews populates all participating tables from engine', async () => {
				// Module 5 Slot 1: INNER JOIN Employees & Departments - id 501
				const mod5 = MODULES.find((m) => m.id === 5)!;
				const rawQ = mod5.questions.find((q) => q.id === 501)!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				expect(q.table_names).toContain('departments');
				expect(q.table_names).toContain('employees');

				await engine.init(q.seed_sql);

				const allPreviews = await fetchAllDynamicPreviews(engine, q, 10);
				expect(allPreviews['departments']).toBeDefined();
				expect(allPreviews['departments'].totalRowCount).toBe(4);
				expect(allPreviews['departments'].rows.length).toBe(4);

				expect(allPreviews['employees']).toBeDefined();
				expect(allPreviews['employees'].totalRowCount).toBe(8);
				expect(allPreviews['employees'].rows.length).toBe(8);
			});
		});
	});

	describe('Locale and Row Limit Indicators', () => {
		it('formats row limit indicator in English correctly', () => {
			const infoLimited = t.en.showingRowsInfo(10, 12);
			expect(infoLimited).toBe('Showing first 10 of 12 rows');
			expect(t.en.initialTablePreview('items', infoLimited)).toBe(
				'Initial Table Preview (items - Showing first 10 of 12 rows)'
			);

			const infoAll = t.en.showingRowsInfo(12, 12);
			expect(infoAll).toBe('12 rows');
			expect(t.en.initialTablePreview('items', infoAll)).toBe('Initial Table Preview (items - 12 rows)');

			expect(t.en.initialTablePreview('books')).toBe('Initial Table Preview (books)');
			expect(t.en.showAllRows(12)).toBe('Show all (12)');
			expect(t.en.showFewerRows(10)).toBe('Show first 10');
		});

		it('formats row limit indicator in Indonesian correctly', () => {
			const infoLimited = t.id.showingRowsInfo(10, 12);
			expect(infoLimited).toBe('Menampilkan 10 dari 12 baris');
			expect(t.id.initialTablePreview('items', infoLimited)).toBe(
				'Preview Tabel (items - Menampilkan 10 dari 12 baris)'
			);

			const infoAll = t.id.showingRowsInfo(12, 12);
			expect(infoAll).toBe('12 baris');
			expect(t.id.initialTablePreview('items', infoAll)).toBe('Preview Tabel (items - 12 baris)');

			expect(t.id.initialTablePreview('books')).toBe('Preview Tabel (books)');
			expect(t.id.showAllRows(12)).toBe('Tampilkan semua (12)');
			expect(t.id.showFewerRows(10)).toBe('Tampilkan 10 baris');
		});
	});
});
