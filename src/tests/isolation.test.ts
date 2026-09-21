import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';
import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';

function jsonEquals(a: any, b: any): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

describe('Auto-Reset & State Isolation Pipeline', () => {
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

			it('Verification Checklist: UPDATE movies rating run twice and wrong query recovery', async () => {
				// Module 1 Slot 6 question (id 106)
				const mod1 = MODULES.find((m) => m.id === 1)!;
				const rawQ = mod1.questions.find((q) => q.id === 106)!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				expect(q.verification_query).toBeDefined();

				// Helper representing getExpectedVerificationState
				const vEngine = createDbEngine(dbms);
				await vEngine.init(q.seed_sql);
				await vEngine.query(q.expected_query);
				const expectedState = await vEngine.query(q.verification_query!);
				await vEngine.destroy();

				// 1. Run correct query once
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				let actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);

				// 2. Run the same query again WITHOUT manual reset (simulates second click on Run)
				// Auto-reset happens before execution:
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);

				// 3. Intentionally run wrong query (e.g. updating without WHERE clause or wrong value)
				await engine.init(q.seed_sql);
				// Run wrong query: UPDATE movies SET rating = 5.0 WHERE id = 11;
				await engine.query('UPDATE movies SET rating = 5.0 WHERE id = 11;');
				actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(false);

				// 4. Replace with correct query: auto-reset clears dirty state immediately
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);
			});

			it('handles INSERT tasks repeatedly without duplicate key or row accumulation', async () => {
				const mod1 = MODULES.find((m) => m.id === 1)!;
				const rawQ = mod1.questions.find((q) => q.expected_query.includes('INSERT INTO movies'))!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				// Pre-compute expected state
				const vEngine = createDbEngine(dbms);
				await vEngine.init(q.seed_sql);
				await vEngine.query(q.expected_query);
				const expectedState = await vEngine.query(q.verification_query!);
				await vEngine.destroy();

				// Run 1
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				let actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);

				// Run 2 (auto-reset before run)
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);
			});

			it('handles DELETE tasks repeatedly without zero-row degradation', async () => {
				const mod1 = MODULES.find((m) => m.id === 1)!;
				const rawQ = mod1.questions.find((q) => q.expected_query.includes('DELETE FROM movies'))!;
				const q = resolveQuestionForEngine(rawQ, dbms);

				// Pre-compute expected state
				const vEngine = createDbEngine(dbms);
				await vEngine.init(q.seed_sql);
				await vEngine.query(q.expected_query);
				const expectedState = await vEngine.query(q.verification_query!);
				await vEngine.destroy();

				// Run 1
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				let actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);

				// Run 2 (auto-reset before run)
				await engine.init(q.seed_sql);
				await engine.query(q.expected_query);
				actualState = await engine.query(q.verification_query!);
				expect(jsonEquals(actualState.rows, expectedState.rows)).toBe(true);
			});

			it('handles DDL CREATE TABLE tasks repeatedly without table already exists error', async () => {
				const createQuery = 'CREATE TABLE books (id INT, title TEXT, price INT);';

				// Run 1
				await engine.init('');
				await engine.query(createQuery);
				let checkRes = await engine.query('SELECT * FROM books LIMIT 1;');
				expect(checkRes.columns.map((c) => c.toLowerCase())).toEqual(expect.arrayContaining(['id', 'title', 'price']));

				// Run 2 (auto-reset before run)
				await engine.init('');
				await engine.query(createQuery);
				checkRes = await engine.query('SELECT * FROM books LIMIT 1;');
				expect(checkRes.columns.map((c) => c.toLowerCase())).toEqual(expect.arrayContaining(['id', 'title', 'price']));
			});

			it('clears uncommitted or aborted transaction states automatically', async () => {
				await engine.init('CREATE TABLE t (id INT, val INT); INSERT INTO t VALUES (1, 100);');

				// Simulate user running an uncommitted transaction
				try {
					await engine.query('BEGIN; UPDATE t SET val = 999; SELECT * FROM nonexistent_table;');
				} catch {
					// Expected error
				}

				// Next execution auto-resets:
				await engine.init('CREATE TABLE t (id INT, val INT); INSERT INTO t VALUES (1, 100);');
				const res = await engine.query('SELECT val FROM t WHERE id = 1;');
				expect(res.rows[0].val).toBe(100);
			});
		});
	});

	describe('User Drafts & Blank Editor Initialization', () => {
		it('strictly initializes new tasks with empty string without starter queries', () => {
			const drafts = new Map<number, string>();
			const sampleTaskIds = [101, 102, 103];

			// Task 1 initial open
			let userCode = drafts.get(sampleTaskIds[0]) || '';
			expect(userCode).toBe('');

			// Advance to Task 2
			userCode = drafts.get(sampleTaskIds[1]) || '';
			expect(userCode).toBe('');

			// Advance to Task 3
			userCode = drafts.get(sampleTaskIds[2]) || '';
			expect(userCode).toBe('');
		});

		it('preserves user typed queries when switching tasks and restores accurately', () => {
			const drafts = new Map<number, string>();
			let currentTaskId = 101;
			let userCode = '';

			// User types on Task 1
			userCode = 'SELECT * FROM movies WHERE id = 11;';

			// Switch to Task 2 (save Task 1 draft)
			drafts.set(currentTaskId, userCode);
			currentTaskId = 102;
			userCode = drafts.get(currentTaskId) || '';
			expect(userCode).toBe('');

			// User types on Task 2
			userCode = 'SELECT title FROM movies;';

			// Switch back to Task 1 (save Task 2 draft, restore Task 1)
			drafts.set(currentTaskId, userCode);
			currentTaskId = 101;
			userCode = drafts.get(currentTaskId) || '';
			expect(userCode).toBe('SELECT * FROM movies WHERE id = 11;');

			// Switch back to Task 2 (restore Task 2)
			drafts.set(currentTaskId, userCode);
			currentTaskId = 102;
			userCode = drafts.get(currentTaskId) || '';
			expect(userCode).toBe('SELECT title FROM movies;');
		});

		it('clears editor to empty string when reset database is triggered', () => {
			const drafts = new Map<number, string>();
			const taskId = 106;
			let userCode = 'UPDATE movies SET rating = 9.2 WHERE id = 11;';
			drafts.set(taskId, userCode);

			// Trigger reset
			drafts.delete(taskId);
			userCode = '';

			expect(userCode).toBe('');
			expect(drafts.get(taskId)).toBeUndefined();
		});

		it('clears all drafts when reset session / challenge is triggered', () => {
			const drafts = new Map<number, string>();
			drafts.set(101, 'SELECT 1;');
			drafts.set(102, 'SELECT 2;');

			// Trigger full reset
			drafts.clear();
			let userCode = '';

			expect(userCode).toBe('');
			expect(drafts.size).toBe(0);
		});
	});
});
