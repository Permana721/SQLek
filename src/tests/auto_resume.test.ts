import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	getLastActiveState,
	saveLastActiveState,
	setLastActiveState,
	clearLastActiveState,
	clearProgress,
	saveProgress,
	getProgress,
	resolveResumePath,
	markModuleCompleted,
	isModulePassed,
	getEngineResumeUrl,
	progressStore,
	type LastActiveState
} from '$lib/data/progress';
import { get } from 'svelte/store';
import { t } from '$lib/data/locale';
import { MODULES } from '$lib/data/questions';

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

describe('Feature: Auto-Resume to Last In-Progress Task Upon Entering Selected Engine', () => {
	let originalWindow: any;
	let originalLocalStorage: any;
	let mockStorage: MockStorage;

	beforeEach(() => {
		mockStorage = new MockStorage();
		originalWindow = (globalThis as any).window;
		originalLocalStorage = (globalThis as any).localStorage;
		(globalThis as any).window = globalThis;
		(globalThis as any).localStorage = mockStorage;
	});

	afterEach(() => {
		(globalThis as any).window = originalWindow;
		(globalThis as any).localStorage = originalLocalStorage;
	});

	describe('A. Track Last Visited Task & Module (LastActiveState)', () => {
		it('stores and retrieves last visited task position for postgres and postgresql', () => {
			const state: LastActiveState = {
				moduleId: 'module-2',
				taskIndex: 1,
				engine: 'postgresql'
			};

			saveLastActiveState(state);

			const retrievedFromPostgresql = getLastActiveState('postgresql');
			expect(retrievedFromPostgresql).not.toBeNull();
			expect(retrievedFromPostgresql?.moduleId).toBe('module-2');
			expect(retrievedFromPostgresql?.taskIndex).toBe(1);

			const retrievedFromPostgres = getLastActiveState('postgres');
			expect(retrievedFromPostgres).not.toBeNull();
			expect(retrievedFromPostgres?.moduleId).toBe('module-2');
			expect(retrievedFromPostgres?.taskIndex).toBe(1);
		});

		it('stores and retrieves last visited task position for mysql', () => {
			const state: LastActiveState = {
				moduleId: 'module-3',
				taskIndex: 4,
				engine: 'mysql'
			};

			setLastActiveState(state);

			const retrieved = getLastActiveState('mysql');
			expect(retrieved).not.toBeNull();
			expect(retrieved?.moduleId).toBe('module-3');
			expect(retrieved?.taskIndex).toBe(4);
			expect(retrieved?.engine).toBe('mysql');
		});

		it('setLastActiveState updates legacy storage keys for backward compatibility', () => {
			setLastActiveState({
				moduleId: '2',
				taskIndex: 3,
				engine: 'postgres'
			});

			expect(mockStorage.getItem('sql_active_module_postgres')).toBe('2');
			expect(mockStorage.getItem('sql_active_task_postgres')).toBe('3');
		});

		it('clearProgress clears all LastActiveState records along with general progress', () => {
			saveLastActiveState({
				moduleId: 'module-4',
				taskIndex: 2,
				engine: 'postgres'
			});
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {}
			});

			expect(getLastActiveState('postgres')).not.toBeNull();

			clearProgress('postgres');

			expect(getLastActiveState('postgres')).toBeNull();
			expect(getLastActiveState('postgresql')).toBeNull();
			expect(getProgress('postgres').completedModules).toEqual([]);
		});
	});

	describe('B. Smart Resume Resolver Logic (resolveResumePath)', () => {
		describe('Scenario 1: Saved Active Task', () => {
			it('returns direct path to saved task when LastActiveState is present (postgresql)', () => {
				saveLastActiveState({
					moduleId: 'module-2',
					taskIndex: 1,
					engine: 'postgresql'
				});

				const resumePath = resolveResumePath('postgresql');
				expect(resumePath).toBe('/postgres/module-2?task=1');
			});

			it('returns direct path to saved task when LastActiveState is present (postgres)', () => {
				saveLastActiveState({
					moduleId: '2',
					taskIndex: 3,
					engine: 'postgres'
				});

				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres/2?task=3');
			});

			it('returns direct path to saved task for mysql', () => {
				saveLastActiveState({
					moduleId: 'module-5',
					taskIndex: 0,
					engine: 'mysql'
				});

				const resumePath = resolveResumePath('mysql');
				expect(resumePath).toBe('/mysql/module-5?task=0');
			});
		});

		describe('Scenario 2: Find First Incomplete Task (No LastActiveState)', () => {
			it('routes to Module 1 Task 0 when user has empty modules progress', () => {
				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres/1?task=0');
			});

			it('scans from Module 1 onwards and routes to first incomplete task within Module 1', () => {
				saveProgress('postgres', {
					completedModules: [],
					modules: {
						1: {
							questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
							completedTasks: [0, 1] // Tasks 0 and 1 completed
						}
					}
				});

				const resumePath = resolveResumePath('postgres');
				// Task index 2 is the first incomplete task in Module 1
				expect(resumePath).toBe('/postgres/1?task=2');
			});

			it('skips completed Module 1 and routes to first incomplete task in Module 2', () => {
				saveProgress('postgres', {
					completedModules: [1],
					modules: {
						1: {
							questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
							completedTasks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
						},
						2: {
							questionIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
							completedTasks: [0] // Task 0 completed, Task 1 incomplete
						}
					}
				});

				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres/2?task=1');
			});

			it('routes to Module 2 Task 0 when Module 1 is finished and Module 2 not yet started', () => {
				saveProgress('postgres', {
					completedModules: [1],
					modules: {}
				});

				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres/2?task=0');
			});

			it('routes to Module 4 Task 2 when modules 1, 2, 3 are completed and Module 4 tasks 0, 1 completed', () => {
				saveProgress('mysql', {
					completedModules: [1, 2, 3],
					modules: {
						4: {
							questionIds: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
							completedTasks: [0, 1]
						}
					}
				});

				const resumePath = resolveResumePath('mysql');
				expect(resumePath).toBe('/mysql/4?task=2');
			});
		});

		describe('Scenario 3: All Completed or Brand New User', () => {
			it('routes brand new user with 0 progress cleanly to Module 1 Task 1', () => {
				clearProgress('postgres');
				expect(resolveResumePath('postgres')).toBe('/postgres/1?task=0');
				expect(resolveResumePath('postgresql')).toBe('/postgres/1?task=0');
			});

			it('routes brand new user for mysql to Module 1 Task 1', () => {
				clearProgress('mysql');
				expect(resolveResumePath('mysql')).toBe('/mysql/1?task=0');
			});

			it('lands on the Module Overview dashboard (/[dbms]) when all curriculum modules are completed', () => {
				saveProgress('postgres', {
					completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
					modules: {}
				});

				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres');
			});

			it('lands on /mysql Module Overview when all modules are completed in mysql', () => {
				saveProgress('mysql', {
					completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
					modules: {}
				});

				const resumePath = resolveResumePath('mysql');
				expect(resumePath).toBe('/mysql');
			});

			it('prioritizes Module Overview dashboard over stale LastActiveState when all modules are completed', () => {
				saveLastActiveState({
					moduleId: 'module-2',
					taskIndex: 1,
					engine: 'postgres'
				});
				saveProgress('postgres', {
					completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
					modules: {}
				});

				const resumePath = resolveResumePath('postgres');
				expect(resumePath).toBe('/postgres');
			});
		});
	});

	describe('C. Verification Checklist Workflows', () => {
		it('Fresh State: cleanly opens Module 1 Task 1 with no prior progress', () => {
			mockStorage.clear();
			expect(resolveResumePath('postgres')).toBe('/postgres/1?task=0');
			expect(resolveResumePath('postgresql')).toBe('/postgres/1?task=0');
		});

		it('Progress Progression: Completing Module 1, navigating to Module 2 Task 2, and re-selecting PostgreSQL immediately opens Module 2 Task 2', () => {
			// 1. Complete Module 1 Tasks 1 through 10
			saveProgress('postgres', {
				completedModules: [1],
				modules: {
					1: {
						questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
						completedTasks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
					}
				}
			});

			// 2. Navigate to Module 2 Task 2 (taskIndex: 1)
			saveLastActiveState({
				moduleId: '2',
				taskIndex: 1,
				engine: 'postgres'
			});

			// 3. Return to home screen and re-select PostgreSQL
			const resumePath = resolveResumePath('postgresql');
			expect(resumePath).toBe('/postgres/2?task=1');
		});

		it('Module Switching: Scanning module with completed tasks opens at the first uncompleted task', () => {
			// Earlier tasks of Module 3 (indices 0, 1) were finished, task 2 is incomplete
			saveProgress('postgres', {
				completedModules: [1, 2],
				modules: {
					3: {
						questionIds: [31, 32, 33, 34, 35],
						completedTasks: [0, 1]
					}
				}
			});

			// No active state recorded for Module 3 yet
			const resumePath = resolveResumePath('postgres');
			// Verifies it points to Module 3 Task 2 (0-indexed)
			expect(resumePath).toBe('/postgres/3?task=2');
		});

		it('Bugfix: Stale LastActiveState pointing to PASSED Module 1 does not hijack routing to Module 4', () => {
			// Modules 1, 2, and 3 are marked as PASSED
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {}
			});

			// User had old or accidental state pointing to Module 1 Task 0
			saveLastActiveState({
				moduleId: 'module-1',
				taskIndex: 0,
				engine: 'postgres'
			});

			// Stale Module 1 state must be skipped because Module 1 is PASSED.
			// Resolves to Module 4 Task 0
			const resumePath = resolveResumePath('postgres');
			expect(resumePath).toBe('/postgres/4?task=0');
		});

		it('Bugfix: Resumes at active in-progress task in Module 4 when LastActiveState is for Module 4', () => {
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {}
			});

			saveLastActiveState({
				moduleId: 'module-4',
				taskIndex: 3,
				engine: 'postgres'
			});

			const resumePath = resolveResumePath('postgres');
			expect(resumePath).toBe('/postgres/module-4?task=3');
		});

		it('Bugfix: Resumes at first uncompleted task in Module 4 when partially solved without saved LastActiveState', () => {
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {
					4: {
						questionIds: [401, 402, 403, 404, 405],
						completedTasks: [0, 1] // Tasks 0 and 1 completed
					}
				}
			});

			const resumePath = resolveResumePath('postgres');
			expect(resumePath).toBe('/postgres/4?task=2');
		});
	});

	describe('D. Module Completion Helpers & Card Routing', () => {
		it('isModulePassed returns true if completedModules includes moduleId or all tasks are done', () => {
			saveProgress('postgres', {
				completedModules: [1, 2],
				modules: {
					3: {
						questionIds: [1, 2],
						completedTasks: [0, 1]
					}
				}
			});

			expect(isModulePassed(1, 'postgres')).toBe(true);
			expect(isModulePassed(2, 'postgres')).toBe(true);
			expect(isModulePassed(3, 'postgres')).toBe(true);
			expect(isModulePassed(4, 'postgres')).toBe(false);
		});

		it('getEngineResumeUrl returns first uncompleted module URL', () => {
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {}
			});

			expect(getEngineResumeUrl('postgres')).toBe('/postgres/4');
			expect(getEngineResumeUrl('postgresql')).toBe('/postgresql/4');
			expect(getEngineResumeUrl('mysql')).toBe('/mysql/1');
		});

		it('progressStore is reactive and supports get(progressStore) and subscription', () => {
			saveProgress('postgres', {
				completedModules: [1, 2, 3],
				modules: {}
			});

			const storeValue = get(progressStore);
			expect(storeValue.postgres.completedModules).toEqual([1, 2, 3]);

			let observed: any = null;
			const unsubscribe = progressStore.subscribe((val) => {
				observed = val;
			});
			expect(observed?.postgres.completedModules).toEqual([1, 2, 3]);
			unsubscribe();
		});

		it('locale strings display "Continue from Module 4" and "Lanjut dari Modul 4"', () => {
			expect(t.en.continueModule(4)).toBe('Continue from Module 4');
			expect(t.id.continueModule(4)).toBe('Lanjut dari Modul 4');
		});
	});
});
