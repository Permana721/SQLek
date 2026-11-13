import { writable } from 'svelte/store';
import { MODULES } from '$lib/data/questions';

export interface LastActiveState {
	moduleId: string; // e.g., 'module-2'
	taskIndex: number; // 0-based index or taskId
	engine: string;   // 'postgresql' | 'mysql'
}

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

export interface ProgressStoreState {
	postgres: LearningProgress;
	mysql: LearningProgress;
}

const internalProgressStore = writable<ProgressStoreState>({
	postgres: getProgress('postgres'),
	mysql: getProgress('mysql')
});

function refreshProgressStore() {
	internalProgressStore.set({
		postgres: getProgress('postgres'),
		mysql: getProgress('mysql')
	});
}

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (event) => {
		if (event.key?.startsWith('sql_') || event.key?.startsWith('sqlek_')) {
			refreshProgressStore();
		}
	});
}

export function saveProgress(dbms: string, progress: LearningProgress): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(`sql_learning_progress_${dbms}`, JSON.stringify(progress));
		refreshProgressStore();
	} catch (e) {
		console.error('Failed to save progress to localStorage', e);
	}
}

export function normalizeEngine(engine: string): 'postgres' | 'mysql' {
	return engine && engine.toLowerCase() === 'mysql' ? 'mysql' : 'postgres';
}

export const lastActiveStore = writable<Record<string, LastActiveState | null>>({});

export function getLastActiveState(engine: string): LastActiveState | null {
	if (typeof window === 'undefined') return null;
	const dbms = normalizeEngine(engine);
	try {
		const raw =
			localStorage.getItem(`sqlek_last_active_${engine}`) ||
			localStorage.getItem(`sqlek_last_active_${dbms}`) ||
			localStorage.getItem(`sql_last_active_${engine}`) ||
			localStorage.getItem(`sql_last_active_${dbms}`);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object') {
				return {
					moduleId: String(parsed.moduleId),
					taskIndex: Number(parsed.taskIndex) || 0,
					engine: parsed.engine || engine
				};
			}
		}
		const legacyMod = localStorage.getItem(`sql_active_module_${dbms}`);
		const legacyTask = localStorage.getItem(`sql_active_task_${dbms}`);
		if (legacyMod !== null) {
			return {
				moduleId: legacyMod,
				taskIndex: legacyTask !== null ? Number(legacyTask) : 0,
				engine: dbms
			};
		}
	} catch (e) {
		console.error('Failed to get last active state from localStorage', e);
	}
	return null;
}

export function saveLastActiveState(state: LastActiveState): void {
	if (typeof window === 'undefined') return;
	const dbms = normalizeEngine(state.engine);
	try {
		const serialized = JSON.stringify(state);
		localStorage.setItem(`sqlek_last_active_${dbms}`, serialized);
		localStorage.setItem(`sql_last_active_${dbms}`, serialized);
		if (state.engine === 'postgresql' || dbms === 'postgres') {
			localStorage.setItem('sqlek_last_active_postgresql', serialized);
			localStorage.setItem('sql_last_active_postgresql', serialized);
		}
		const modNum = String(state.moduleId).replace(/^module-?/i, '');
		localStorage.setItem(`sql_active_module_${dbms}`, modNum);
		localStorage.setItem(`sql_active_task_${dbms}`, String(state.taskIndex));

		lastActiveStore.update((curr) => ({
			...curr,
			[dbms]: state,
			[state.engine]: state
		}));
	} catch (e) {
		console.error('Failed to save last active state to localStorage', e);
	}
}

export const setLastActiveState = saveLastActiveState;

export function clearLastActiveState(engine: string): void {
	if (typeof window === 'undefined') return;
	const dbms = normalizeEngine(engine);
	try {
		localStorage.removeItem(`sqlek_last_active_${engine}`);
		localStorage.removeItem(`sqlek_last_active_${dbms}`);
		localStorage.removeItem(`sql_last_active_${engine}`);
		localStorage.removeItem(`sql_last_active_${dbms}`);
		localStorage.removeItem(`sql_active_module_${dbms}`);
		localStorage.removeItem(`sql_active_task_${dbms}`);
		if (dbms === 'postgres') {
			localStorage.removeItem('sqlek_last_active_postgresql');
			localStorage.removeItem('sql_last_active_postgresql');
		}
		lastActiveStore.update((curr) => {
			const next = { ...curr };
			delete next[dbms];
			delete next[engine];
			return next;
		});
	} catch (e) {
		console.error('Failed to clear last active state from localStorage', e);
	}
}

export function clearProgress(dbms: string): void {
	if (typeof window === 'undefined') return;
	try {
		const normalized = normalizeEngine(dbms);
		localStorage.removeItem(`sql_learning_progress_${normalized}`);
		localStorage.removeItem(`sql_learning_progress_${dbms}`);
		localStorage.removeItem(`sql_active_module_${normalized}`);
		localStorage.removeItem(`sql_active_module_${dbms}`);
		localStorage.removeItem(`sql_active_task_${normalized}`);
		localStorage.removeItem(`sql_active_task_${dbms}`);
		localStorage.removeItem(`sql_challenge_session_${normalized}`);
		localStorage.removeItem(`sql_challenge_session_${dbms}`);
		clearLastActiveState(dbms);
		refreshProgressStore();
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

export function isModulePassed(moduleId: number, engine: string): boolean {
	const dbms = normalizeEngine(engine);
	const prog = getProgress(dbms);
	if (prog.completedModules.includes(moduleId)) return true;
	const mod = MODULES.find((m) => m.id === moduleId);
	if (!mod) return false;
	const modState = prog.modules[moduleId];
	if (!modState) return false;
	const totalTasks =
		modState.questionIds?.length ||
		new Set(mod.questions.map((q) => q.categorySlot)).size ||
		15;
	return (
		totalTasks > 0 &&
		Array.from({ length: totalTasks }, (_, i) => i).every((idx) =>
			modState.completedTasks?.includes(idx)
		)
	);
}

export function getEngineResumeUrl(engine: string): string {
	const dbms = normalizeEngine(engine);
	const targetModule = MODULES.find((m) => !isModulePassed(m.id, dbms)) || MODULES[0];
	return `/${engine}/${targetModule.id}`;
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

export function unmarkTaskCompleted(
	dbms: string,
	moduleId: number,
	taskIndexOrId: number
): void {
	const prog = getProgress(dbms);
	const mod = prog.modules[moduleId];
	if (!mod) return;

	let targetIndex = taskIndexOrId;
	if (mod.questionIds && mod.questionIds.includes(taskIndexOrId)) {
		const qIdx = mod.questionIds.indexOf(taskIndexOrId);
		if (qIdx !== -1 && (!mod.completedTasks?.includes(taskIndexOrId) || taskIndexOrId >= mod.questionIds.length)) {
			targetIndex = qIdx;
		}
	}

	const updatedCompleted = (mod.completedTasks || []).filter((idx) => idx !== targetIndex);
	saveProgress(dbms, {
		...prog,
		modules: {
			...prog.modules,
			[moduleId]: {
				...mod,
				completedTasks: updatedCompleted
			}
		}
	});
}

export function unmarkChallengeTaskCompleted(
	dbms: string,
	taskIndexOrId: number
): void {
	const prog = getProgress(dbms);
	if (!prog.challenge) return;

	let targetIndex = taskIndexOrId;
	if (prog.challenge.questionIds && prog.challenge.questionIds.includes(taskIndexOrId)) {
		const qIdx = prog.challenge.questionIds.indexOf(taskIndexOrId);
		if (qIdx !== -1 && (!prog.challenge.completedTasks?.includes(taskIndexOrId) || taskIndexOrId >= prog.challenge.questionIds.length)) {
			targetIndex = qIdx;
		}
	}

	const updatedCompleted = (prog.challenge.completedTasks || []).filter((idx) => idx !== targetIndex);
	const isAllPassed = prog.challenge.questionIds ? updatedCompleted.length === prog.challenge.questionIds.length : false;

	saveProgress(dbms, {
		...prog,
		challenge: {
			...prog.challenge,
			completedTasks: updatedCompleted,
			passed: isAllPassed
		}
	});
}

export const progressStore = {
	subscribe: internalProgressStore.subscribe,
	refresh: refreshProgressStore,
	getProgress,
	saveProgress: (dbms: string, progress: LearningProgress) => {
		saveProgress(dbms, progress);
		refreshProgressStore();
	},
	clearProgress: (dbms: string) => {
		clearProgress(dbms);
		refreshProgressStore();
	},
	markModuleCompleted: (dbms: string, moduleId: number) => {
		markModuleCompleted(dbms, moduleId);
		refreshProgressStore();
	},
	unmarkTaskCompleted: (dbms: string, moduleId: number, taskIndexOrId: number) => {
		unmarkTaskCompleted(dbms, moduleId, taskIndexOrId);
		refreshProgressStore();
	},
	getChallengeProgress,
	saveChallengeProgress: (dbms: string, challenge: ChallengeProgress) => {
		saveChallengeProgress(dbms, challenge);
		refreshProgressStore();
	},
	unmarkChallengeTaskCompleted: (dbms: string, taskIndexOrId: number) => {
		unmarkChallengeTaskCompleted(dbms, taskIndexOrId);
		refreshProgressStore();
	},
	getLastActiveState,
	saveLastActiveState,
	setLastActiveState,
	clearLastActiveState,
	resolveResumePath,
	isModulePassed,
	getEngineResumeUrl
};

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

export function resolveResumePath(engine: string): string {
	const dbms = normalizeEngine(engine);
	const prog = getProgress(dbms);

	// Scenario 3 (All Completed): Check if all curriculum modules are completed
	const totalModulesCount = MODULES.length; // 9
	const allCompleted = MODULES.every((mod) => isModulePassed(mod.id, dbms));

	if (allCompleted) {
		return `/${dbms}`;
	}

	// Scenario 1 (Saved Active Task):
	// Must ensure the saved module is NOT already passed!
	const saved = getLastActiveState(engine);
	if (saved && saved.moduleId !== undefined && saved.taskIndex !== undefined) {
		const modNum = Number(String(saved.moduleId).replace(/^module-?/i, ''));
		if (
			!isNaN(modNum) &&
			modNum >= 1 &&
			modNum <= totalModulesCount &&
			saved.taskIndex >= 0 &&
			!isModulePassed(modNum, dbms)
		) {
			return `/${dbms}/${saved.moduleId}?task=${saved.taskIndex}`;
		}
	}

	// Scenario 2 (Find First Incomplete Task):
	for (const mod of MODULES) {
		if (isModulePassed(mod.id, dbms)) {
			continue;
		}

		const modState = prog.modules[mod.id];
		const totalTasks =
			modState?.questionIds?.length ||
			new Set(mod.questions.map((q) => q.categorySlot)).size ||
			15;
		const completedTasks = modState?.completedTasks || [];

		for (let taskIdx = 0; taskIdx < totalTasks; taskIdx++) {
			if (!completedTasks.includes(taskIdx)) {
				return `/${dbms}/${mod.id}?task=${taskIdx}`;
			}
		}
	}

	// Scenario 3 (Brand New User / Fallback):
	return `/${dbms}/1?task=0`;
}


