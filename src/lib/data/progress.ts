import { writable } from 'svelte/store';

export interface ModuleProgress {
	questionIds: number[];
	completedTasks: number[];
}

export interface ChallengeProgress {
	questionIds: number[];
	completedTasks: number[];
	passed: boolean;
}

export interface LearningProgress {
	completedModules: number[];
	modules: Record<number, ModuleProgress>;
	challenge?: ChallengeProgress;
}

export function getAdminMode(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return localStorage.getItem('sqlek_admin_mode') === 'true';
	} catch {
		return false;
	}
}

export const isAdminMode = writable<boolean>(getAdminMode());

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (event) => {
		if (event.key === 'sqlek_admin_mode') {
			isAdminMode.set(event.newValue === 'true');
		}
	});
}

export function setAdminMode(value: boolean): boolean {
	if (typeof window === 'undefined') return false;
	try {
		localStorage.setItem('sqlek_admin_mode', String(value));
		if (value) {
			const completedModules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			localStorage.setItem('sqlek_completed_modules_postgres', JSON.stringify(completedModules));
			localStorage.setItem('sqlek_completed_modules_mysql', JSON.stringify(completedModules));
		} else {
			localStorage.removeItem('sqlek_completed_modules_postgres');
			localStorage.removeItem('sqlek_completed_modules_mysql');
		}
		isAdminMode.set(value);
	} catch (e) {
		console.error('Failed to update admin mode in localStorage', e);
	}
	return value;
}

export function toggleAdminMode(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const current = localStorage.getItem('sqlek_admin_mode') === 'true';
		const next = !current;
		localStorage.setItem('sqlek_admin_mode', String(next));

		if (next) {
			// Automatically set progress for all modules (1 to 9) to completed
			const completedModules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			localStorage.setItem('sqlek_completed_modules_postgres', JSON.stringify(completedModules));
			localStorage.setItem('sqlek_completed_modules_mysql', JSON.stringify(completedModules));
		} else {
			localStorage.removeItem('sqlek_completed_modules_postgres');
			localStorage.removeItem('sqlek_completed_modules_mysql');
		}
		isAdminMode.set(next);
		return next;
	} catch (e) {
		console.error('Failed to toggle admin mode in localStorage', e);
		return false;
	}
}

export function getProgress(dbms: string): LearningProgress {
	if (typeof window === 'undefined') {
		return { completedModules: [], modules: {} };
	}
	try {
		const raw = localStorage.getItem(`sql_learning_progress_${dbms}`);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
				modules: parsed.modules && typeof parsed.modules === 'object' ? parsed.modules : {},
				challenge: parsed.challenge && typeof parsed.challenge === 'object' ? parsed.challenge : undefined
			};
		}
	} catch (e) {
		console.error('Failed to load progress from localStorage', e);
	}
	return { completedModules: [], modules: {} };
}

export function saveProgress(dbms: string, progress: LearningProgress): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(`sql_learning_progress_${dbms}`, JSON.stringify(progress));
	} catch (e) {
		console.error('Failed to save progress to localStorage', e);
	}
}

export function clearProgress(dbms: string): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(`sql_learning_progress_${dbms}`);
		localStorage.removeItem(`sql_active_module_${dbms}`);
		localStorage.removeItem(`sql_active_task_${dbms}`);
		localStorage.removeItem(`sql_challenge_session_${dbms}`);
	} catch (e) {
		console.error('Failed to clear progress from localStorage', e);
	}
}

export function isModuleUnlocked(
	moduleId: number,
	completedModules: number[],
	adminOverride?: boolean
): boolean {
	if (adminOverride !== undefined ? adminOverride : getAdminMode()) return true;
	if (moduleId === 1) return true;
	return completedModules.includes(moduleId - 1);
}

export function isExamUnlocked(
	completedModules: number[],
	adminOverride?: boolean
): boolean {
	if (adminOverride !== undefined ? adminOverride : getAdminMode()) return true;
	const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	return required.every((id) => completedModules.includes(id));
}

export function isTaskUnlocked(
	taskIndex: number,
	completedTasks: number[],
	adminOverride?: boolean
): boolean {
	if (adminOverride !== undefined ? adminOverride : getAdminMode()) return true;
	if (taskIndex === 0) return true;
	for (let i = 0; i < taskIndex; i++) {
		if (!completedTasks.includes(i)) return false;
	}
	return true;
}

export function markModuleCompleted(dbms: string, moduleId: number): void {
	const prog = getProgress(dbms);
	if (!prog.completedModules.includes(moduleId)) {
		saveProgress(dbms, {
			...prog,
			completedModules: [...prog.completedModules, moduleId]
		});
	}
}

export function getChallengeProgress(dbms: string): ChallengeProgress | null {
	const prog = getProgress(dbms);
	return prog.challenge || null;
}

export function saveChallengeProgress(dbms: string, challenge: ChallengeProgress): void {
	const prog = getProgress(dbms);
	saveProgress(dbms, {
		...prog,
		challenge
	});
}

export type NavigationAction = 'next-task' | 'next-module' | 'back-to-menu';

export function getNextNavigationAction(
	currentIndex: number,
	totalTasks: number,
	moduleId: number,
	totalModules: number = 9
): NavigationAction {
	const isLastTask = totalTasks > 0 && currentIndex === totalTasks - 1;
	const isLastModule = moduleId >= totalModules;

	if (!isLastTask) {
		return 'next-task';
	}
	if (!isLastModule) {
		return 'next-module';
	}
	return 'back-to-menu';
}

export function getNavigationLabel(
	action: NavigationAction,
	locale: 'en' | 'id' = 'en'
): string {
	const labels = {
		en: {
			'next-task': 'Next Task →',
			'next-module': 'Next Module →',
			'back-to-menu': 'Back to Menu'
		},
		id: {
			'next-task': 'Soal Selanjutnya →',
			'next-module': 'Modul Selanjutnya →',
			'back-to-menu': 'Kembali ke Menu'
		}
	};
	return labels[locale][action];
}

