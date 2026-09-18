import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	isModuleUnlocked,
	isExamUnlocked,
	isTaskUnlocked,
	getNextNavigationAction,
	getNavigationLabel
} from '$lib/data/progress';

describe('Progression & Module Gating', () => {
	describe('Sequential Module Unlocks (isModuleUnlocked)', () => {
		it('Module 1 is unlocked by default regardless of completed modules', () => {
			expect(isModuleUnlocked(1, [])).toBe(true);
			expect(isModuleUnlocked(1, [2, 3])).toBe(true);
		});

		it('Module 2 is locked by default and strictly requires Module 1 completed', () => {
			expect(isModuleUnlocked(2, [])).toBe(false);
			expect(isModuleUnlocked(2, [3, 4])).toBe(false);
			expect(isModuleUnlocked(2, [1])).toBe(true);
			expect(isModuleUnlocked(2, [1, 3])).toBe(true);
		});

		it('Intermediate modules (3 through 8) require the immediately preceding module', () => {
			for (let modId = 3; modId <= 8; modId++) {
				const withoutPreceding = Array.from({ length: modId - 2 }, (_, i) => i + 1);
				expect(isModuleUnlocked(modId, withoutPreceding)).toBe(false);

				const withPreceding = Array.from({ length: modId - 1 }, (_, i) => i + 1);
				expect(isModuleUnlocked(modId, withPreceding)).toBe(true);
			}
		});

		it('Module 9 is locked unless Module 8 is completed', () => {
			expect(isModuleUnlocked(9, [])).toBe(false);
			expect(isModuleUnlocked(9, [1, 2, 3, 4, 5, 6, 7])).toBe(false);
			expect(isModuleUnlocked(9, [1, 2, 3, 4, 5, 6, 7, 8])).toBe(true);
		});
	});

	describe('Final Challenge Unlock Gating (isExamUnlocked)', () => {
		it('strictly returns false when no modules are completed', () => {
			expect(isExamUnlocked([])).toBe(false);
		});

		it('strictly returns false when only modules 1 through 8 are completed', () => {
			expect(isExamUnlocked([1, 2, 3, 4, 5, 6, 7, 8])).toBe(false);
		});

		it('fails when any single required module from 1 to 9 is missing', () => {
			const allNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (const missingId of allNine) {
				const subset = allNine.filter((id) => id !== missingId);
				expect(isExamUnlocked(subset)).toBe(false);
			}
		});

		it('unlocks successfully when all modules 1 through 9 are completed', () => {
			expect(isExamUnlocked([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(true);
		});

		it('is order-independent when evaluating completed module IDs', () => {
			expect(isExamUnlocked([9, 8, 7, 6, 5, 4, 3, 2, 1])).toBe(true);
			expect(isExamUnlocked([5, 2, 9, 1, 7, 3, 8, 4, 6])).toBe(true);
		});
	});

	describe('Task Progression Gating (isTaskUnlocked)', () => {
		it('Task 0 (the first task) is always unlocked', () => {
			expect(isTaskUnlocked(0, [])).toBe(true);
		});

		it('Task 1 requires Task 0 to be completed', () => {
			expect(isTaskUnlocked(1, [])).toBe(false);
			expect(isTaskUnlocked(1, [0])).toBe(true);
		});

		it('Task 4 requires all preceding tasks (0, 1, 2, 3) to be completed', () => {
			expect(isTaskUnlocked(4, [0, 1, 2])).toBe(false);
			expect(isTaskUnlocked(4, [0, 1, 3])).toBe(false);
			expect(isTaskUnlocked(4, [0, 1, 2, 3])).toBe(true);
		});
	});

	describe('Task Navigation Button Transitions', () => {
		const totalTasks = 5;
		const totalModules = 9;

		it('determines "next-task" for any intermediate task across any module', () => {
			for (let modId = 1; modId <= 9; modId++) {
				for (let taskIdx = 0; taskIdx < totalTasks - 1; taskIdx++) {
					const action = getNextNavigationAction(taskIdx, totalTasks, modId, totalModules);
					expect(action).toBe('next-task');
					expect(getNavigationLabel(action, 'en')).toBe('Next Task →');
					expect(getNavigationLabel(action, 'id')).toBe('Soal Selanjutnya →');
				}
			}
		});

		it('determines "next-module" for the final task of Modules 1 through 8', () => {
			const finalTaskIdx = totalTasks - 1;
			for (let modId = 1; modId <= 8; modId++) {
				const action = getNextNavigationAction(finalTaskIdx, totalTasks, modId, totalModules);
				expect(action).toBe('next-module');
				expect(getNavigationLabel(action, 'en')).toBe('Next Module →');
				expect(getNavigationLabel(action, 'id')).toBe('Modul Selanjutnya →');
			}
		});

		it('determines "back-to-menu" for the final task of Module 9', () => {
			const finalTaskIdx = totalTasks - 1;
			const modId = 9;
			const action = getNextNavigationAction(finalTaskIdx, totalTasks, modId, totalModules);
			expect(action).toBe('back-to-menu');
			expect(getNavigationLabel(action, 'en')).toBe('Back to Menu');
			expect(getNavigationLabel(action, 'id')).toBe('Kembali ke Menu');
		});
	});

	describe('Secret Admin / Dev Mode Easter Egg', () => {
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

		let originalWindow: any;
		let originalLocalStorage: any;
		let mockStorage: MockStorage;

		beforeEach(async () => {
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

		it('toggleAdminMode toggles from off to on and sets completion storage keys', async () => {
			const { toggleAdminMode, getAdminMode, isAdminMode } = await import('$lib/data/progress');

			expect(getAdminMode()).toBe(false);

			const enabled = toggleAdminMode();
			expect(enabled).toBe(true);
			expect(getAdminMode()).toBe(true);
			expect(mockStorage.getItem('sqlek_admin_mode')).toBe('true');
			expect(JSON.parse(mockStorage.getItem('sqlek_completed_modules_postgres')!)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
			expect(JSON.parse(mockStorage.getItem('sqlek_completed_modules_mysql')!)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

			let storeValue = false;
			const unsubscribe = isAdminMode.subscribe((v) => (storeValue = v));
			expect(storeValue).toBe(true);
			unsubscribe();
		});

		it('unlocks all modules (1 to 9) when admin mode is active', async () => {
			const { toggleAdminMode, isModuleUnlocked } = await import('$lib/data/progress');
			toggleAdminMode(); // enable

			for (let modId = 1; modId <= 9; modId++) {
				expect(isModuleUnlocked(modId, [])).toBe(true);
			}
		});

		it('unlocks Final Boss challenge when admin mode is active', async () => {
			const { toggleAdminMode, isExamUnlocked } = await import('$lib/data/progress');
			toggleAdminMode(); // enable

			expect(isExamUnlocked([])).toBe(true);
		});

		it('unlocks all tasks when admin mode is active', async () => {
			const { toggleAdminMode, isTaskUnlocked } = await import('$lib/data/progress');
			toggleAdminMode(); // enable

			for (let taskIdx = 0; taskIdx < 10; taskIdx++) {
				expect(isTaskUnlocked(taskIdx, [])).toBe(true);
			}
		});

		it('re-locks progression when admin mode is toggled back off', async () => {
			const { toggleAdminMode, isModuleUnlocked, isExamUnlocked, isTaskUnlocked, getAdminMode } = await import('$lib/data/progress');
			toggleAdminMode(); // enable
			expect(getAdminMode()).toBe(true);

			const disabled = toggleAdminMode(); // disable
			expect(disabled).toBe(false);
			expect(getAdminMode()).toBe(false);
			expect(mockStorage.getItem('sqlek_admin_mode')).toBe('false');
			expect(mockStorage.getItem('sqlek_completed_modules_postgres')).toBeNull();
			expect(mockStorage.getItem('sqlek_completed_modules_mysql')).toBeNull();

			// Standard progression is restored
			expect(isModuleUnlocked(1, [])).toBe(true);
			expect(isModuleUnlocked(2, [])).toBe(false);
			expect(isModuleUnlocked(3, [1])).toBe(false);
			expect(isExamUnlocked([])).toBe(false);
			expect(isTaskUnlocked(1, [])).toBe(false);
		});

		it('allows explicit override parameter in progression check functions', async () => {
			const { isModuleUnlocked, isExamUnlocked, isTaskUnlocked } = await import('$lib/data/progress');

			expect(isModuleUnlocked(5, [], true)).toBe(true);
			expect(isModuleUnlocked(5, [], false)).toBe(false);

			expect(isExamUnlocked([], true)).toBe(true);
			expect(isExamUnlocked([], false)).toBe(false);

			expect(isTaskUnlocked(4, [], true)).toBe(true);
			expect(isTaskUnlocked(4, [], false)).toBe(false);
		});
	});
});
