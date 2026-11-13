import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';
import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';
import {
	saveProgress,
	getProgress,
	unmarkTaskCompleted,
	isTaskUnlocked
} from '$lib/data/progress';

describe('Feature: Scoped Task Reset on "Reset Database" Click', () => {
	class MockStorage {
		store: Record<string, string> = {};
		getItem(key: string) {
			return this.store[key] ?? null;
		}
		setItem(key: string, value: string) {
			this.store[key] = String(value);
		}
		removeItem(key: string) {
			delete this.store[key];
		}
		clear() {
			this.store = {};
		}
	}

	describe('Progress, Editor & State Scoped Invalidation Flow', () => {
		let originalWindow: any;
		let originalLocalStorage: any;
		let mockStorage: MockStorage;

		beforeEach(() => {
			mockStorage = new MockStorage();
			originalWindow = (globalThis as any).window;
			originalLocalStorage = (globalThis as any).localStorage;
			(globalThis as any).window = {
				localStorage: mockStorage
			};
			(globalThis as any).localStorage = mockStorage;
		});

		afterEach(() => {
			(globalThis as any).window = originalWindow;
			(globalThis as any).localStorage = originalLocalStorage;
		});

		it('Complete Task 1, Complete Task 2, then Reset Database on Task 2: resets Task 2 only, preserves Task 1', () => {
			const mod1 = MODULES.find((m) => m.id === 1)!;
			const q1 = mod1.questions[0]; // Task 1 (id 101)
			const q2 = mod1.questions[1]; // Task 2 (id 102)
			const sampledQuestions = [q1, q2];

			// Component state simulation (+page.svelte)
			let currentIndex = 0;
			let completedIndices: number[] = [];
			let userCode = '';
			let queryResult: any = null;
			let queryError: string | null = null;
			const userDrafts = new Map<number, string>();

			// Initial state
			saveProgress('postgres', {
				completedModules: [],
				modules: {
					1: {
						questionIds: sampledQuestions.map((q) => q.id),
						completedTasks: []
					}
				}
			});

			// 1. Complete Task 1 (verify it gets completed status)
			currentIndex = 0;
			userCode = q1.expected_query;
			userDrafts.set(q1.id, userCode);
			mockStorage.setItem(`sqlek_draft_${q1.id}`, userCode);
			queryResult = { rows: [{ id: 1 }], columns: ['id'] };
			completedIndices = [...completedIndices, 0];
			saveProgress('postgres', {
				completedModules: [],
				modules: {
					1: {
						questionIds: sampledQuestions.map((q) => q.id),
						completedTasks: completedIndices
					}
				}
			});

			expect(completedIndices.includes(0)).toBe(true);

			// 2. Navigate to Task 2, enter correct query, run it, confirm it gets marked as completed
			currentIndex = 1;
			expect(isTaskUnlocked(currentIndex, completedIndices)).toBe(true);

			userCode = q2.expected_query;
			userDrafts.set(q2.id, userCode);
			mockStorage.setItem(`sqlek_draft_${q2.id}`, userCode);
			queryResult = { rows: [{ id: 1, title: 'Toy Story' }], columns: ['id', 'title'] };

			completedIndices = [...completedIndices, 1];
			saveProgress('postgres', {
				completedModules: [],
				modules: {
					1: {
						questionIds: sampledQuestions.map((q) => q.id),
						completedTasks: completedIndices
					}
				}
			});

			const isPassedBeforeReset = completedIndices.includes(currentIndex);
			expect(isPassedBeforeReset).toBe(true);
			expect(completedIndices).toEqual([0, 1]);

			// 3. Click Reset Database on Task 2:
			// - Clear query input and output state
			userCode = '';
			queryResult = null;
			queryError = null;

			// - Clear draft cache for this specific task
			userDrafts.delete(q2.id);
			mockStorage.removeItem(`sqlek_draft_${q2.id}`);

			// - Invalidate progress for this specific task slot index only
			completedIndices = completedIndices.filter((idx) => idx !== currentIndex);
			unmarkTaskCompleted('postgres', 1, currentIndex);

			// Confirm Task 2's editor clears to empty
			expect(userCode).toBe('');
			expect(userDrafts.get(q2.id)).toBeUndefined();
			expect(mockStorage.getItem(`sqlek_draft_${q2.id}`)).toBeNull();

			// Confirm Task 2's query output and errors are cleared
			expect(queryResult).toBeNull();
			expect(queryError).toBeNull();

			// Confirm Task 2's status returns to uncompleted (pill 2 loses completed indicator, COMPLETED badge disappears)
			const isPassedAfterReset = completedIndices.includes(currentIndex);
			expect(isPassedAfterReset).toBe(false);

			// Confirm Task 1 still retains its completed state and draft
			expect(completedIndices.includes(0)).toBe(true);
			expect(completedIndices).toEqual([0]);
			expect(userDrafts.get(q1.id)).toBe(q1.expected_query);
			expect(mockStorage.getItem(`sqlek_draft_${q1.id}`)).toBe(q1.expected_query);

			// Confirm localStorage module progress has Task 1 completed and Task 2 unmarked
			const persisted = getProgress('postgres');
			expect(persisted.modules[1].completedTasks).toEqual([0]);

			// Confirm Task 2 remains unlocked for retry because Task 1 is completed
			expect(isTaskUnlocked(currentIndex, completedIndices)).toBe(true);
		});
	});

	describe('Database Re-seed to Pristine Seed State', () => {
		const engines: Array<'postgres' | 'mysql'> = ['postgres', 'mysql'];

		engines.forEach((dbms) => {
			it(`Engine: ${dbms} - re-seed resets mutated tables back to initial seed data`, async () => {
				const engine = createDbEngine(dbms);
				try {
					const mod1 = MODULES.find((m) => m.id === 1)!;
					const q2 = resolveQuestionForEngine(mod1.questions[1], dbms);

					// 1. Initial Seed
					await engine.init(q2.seed_sql);
					const initialRes = await engine.query('SELECT count(*) as cnt FROM movies;');
					const initialCount = Number(initialRes.rows[0].cnt ?? initialRes.rows[0].count ?? initialRes.rows[0]['COUNT(*)']);

					// 2. Mutate database table
					await engine.query("INSERT INTO movies (title, director, year, rating) VALUES ('Mutated Movie', 'Test', 2026, 9.0);");
					const mutatedRes = await engine.query('SELECT count(*) as cnt FROM movies;');
					const mutatedCount = Number(mutatedRes.rows[0].cnt ?? mutatedRes.rows[0].count ?? mutatedRes.rows[0]['COUNT(*)']);
					expect(mutatedCount).toBe(initialCount + 1);

					// 3. Re-seed database (as performed by handleResetDatabase)
					await engine.init(q2.seed_sql);

					// 4. Verify table returned to pristine initial seed state
					const cleanRes = await engine.query('SELECT count(*) as cnt FROM movies;');
					const cleanCount = Number(cleanRes.rows[0].cnt ?? cleanRes.rows[0].count ?? cleanRes.rows[0]['COUNT(*)']);
					expect(cleanCount).toBe(initialCount);

					const checkMutated = await engine.query("SELECT * FROM movies WHERE title = 'Mutated Movie';");
					expect(checkMutated.rows.length).toBe(0);
				} finally {
					await engine.destroy();
				}
			});

			it(`Engine: ${dbms} - Module 6 UNION question: re-seed resets project_a and project_b cleanly`, async () => {
				const engine = createDbEngine(dbms);
				try {
					const mod6 = MODULES.find((m) => m.id === 6)!;
					// Slot 6 (UNION question, e.g. 606)
					const unionQ = mod6.questions.find((q) => q.categorySlot === 6) || mod6.questions[5];
					const resolvedQ = resolveQuestionForEngine(unionQ, dbms);

					// 1. Initial Seed
					await engine.init(resolvedQ.seed_sql);
					const initialResA = await engine.query('SELECT count(*) as cnt FROM project_a;');
					const countA = Number(initialResA.rows[0].cnt ?? initialResA.rows[0].count ?? initialResA.rows[0]['COUNT(*)']);
					expect(countA).toBeGreaterThan(0);

					// 2. Execute UNION query
					const userUnionQuery = 'SELECT member_name FROM project_a UNION SELECT member_name FROM project_b;';
					const queryRes = await engine.query(userUnionQuery);
					expect(queryRes.rows.length).toBeGreaterThan(0);

					// 3. Mutate table
					await engine.query("INSERT INTO project_a VALUES (99, 'Zack', 'Dev', 100);");
					const mutatedResA = await engine.query('SELECT count(*) as cnt FROM project_a;');
					const mutatedCountA = Number(mutatedResA.rows[0].cnt ?? mutatedResA.rows[0].count ?? mutatedResA.rows[0]['COUNT(*)']);
					expect(mutatedCountA).toBe(countA + 1);

					// 4. Re-seed database (simulate Reset Database)
					await engine.init(resolvedQ.seed_sql);

					// 5. Verify restored to pristine state
					const cleanResA = await engine.query('SELECT count(*) as cnt FROM project_a;');
					const cleanCountA = Number(cleanResA.rows[0].cnt ?? cleanResA.rows[0].count ?? cleanResA.rows[0]['COUNT(*)']);
					expect(cleanCountA).toBe(countA);

					const checkZack = await engine.query("SELECT * FROM project_a WHERE member_name = 'Zack';");
					expect(checkZack.rows.length).toBe(0);
				} finally {
					await engine.destroy();
				}
			});
		});

		it('Reset Session wipes all draft key formats (sqlek_draft_*, draft_*, etc.) from storage', () => {
			const mockStorage: Record<string, string> = {
				'sqlek_draft_606': 'SELECT * FROM project_a;',
				'draft_606': 'SELECT * FROM project_a;',
				'draft_606_postgres': 'SELECT * FROM project_a;',
				'draft_606_mysql': 'SELECT * FROM project_a;',
				'drafts_module_6': '{"606":"code"}',
				'other_key': 'keep_me'
			};

			// Simulate Reset Session localStorage cleanup logic
			const keysToRemove: string[] = [];
			for (const k of Object.keys(mockStorage)) {
				if (k.startsWith('sqlek_draft_') || k.startsWith('draft_') || k.startsWith('drafts_module_')) {
					keysToRemove.push(k);
				}
			}
			keysToRemove.forEach((k) => delete mockStorage[k]);

			expect(mockStorage['sqlek_draft_606']).toBeUndefined();
			expect(mockStorage['draft_606']).toBeUndefined();
			expect(mockStorage['draft_606_postgres']).toBeUndefined();
			expect(mockStorage['draft_606_mysql']).toBeUndefined();
			expect(mockStorage['drafts_module_6']).toBeUndefined();
			expect(mockStorage['other_key']).toBe('keep_me');
		});
	});
});
