<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';
	import { getQuestionPreviewData, fetchAllDynamicPreviews, type MockPreviewData } from '$lib/data/previewData';
	import { sampleDiverseQuestions } from '$lib/utils/shuffle';
	import { createDbEngine, type IDbEngine, type DbResult } from '$lib/db/engine';
	import { getProgress, saveProgress, clearProgress, isModuleUnlocked, markModuleCompleted, unmarkTaskCompleted, getNextNavigationAction, getNavigationLabel, isAdminMode } from '$lib/data/progress';
	import SqlEditor from '$lib/components/SqlEditor.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { locale, t } from '$lib/data/locale';
	import { hideSyntaxPattern } from '$lib/stores/preferences';

	const TOTAL_MODULES = MODULES.length;
	const moduleId = $derived(Number(page.params.module_id) || 1);
	const dbmsParam = $derived(page.params.dbms === 'mysql' ? 'mysql' : 'postgres');
	const dbmsLabel = $derived(dbmsParam.toUpperCase());

	let currentModule = $derived(MODULES.find((m) => m.id === moduleId) || MODULES[0]);
	let cleanTitle = $derived(
		(currentModule?.title?.[$locale] || '')
			.replace(/^(Modul|Module)\s+\d+:\s*/i, '')
	);
	let pageTitle = $derived(`Module ${moduleId}: ${cleanTitle} (${dbmsLabel}) | SQL Interactive`);

	let completedModules = $state<number[]>([]);
	let sampledQuestions = $state<Question[]>([]);
	let currentIndex = $state(0);
	let completedIndices = $state<number[]>([]);

	let rawCurrentQuestion = $derived(sampledQuestions[currentIndex] || null);
	let currentQuestion = $derived(rawCurrentQuestion ? resolveQuestionForEngine(rawCurrentQuestion, dbmsParam) : null);

	// User can view any task. Can only execute if it is unlocked (preceding tasks completed or already passed)
	let isCurrentTaskUnlocked = $derived(
		$isAdminMode || currentIndex === 0 || completedIndices.includes(currentIndex) || completedIndices.includes(currentIndex - 1)
	);

	let isPassed = $derived(completedIndices.includes(currentIndex));
	let isLastTask = $derived(sampledQuestions.length > 0 && currentIndex === sampledQuestions.length - 1);
	let isLastModule = $derived(moduleId >= TOTAL_MODULES);

	// Dynamic live preview state synchronized with WASM database
	let dynamicPreviews = $state<Record<string, MockPreviewData>>({});
	let activePreviewTable = $state<string>('');
	let previewLimit = $state<number>(10);
	let previewRequestId = 0;

	let activePreviewData = $derived.by(() => {
		if (currentQuestion?.isDdlCreate) {
			return getQuestionPreviewData(currentQuestion);
		}
		const tName = activePreviewTable || currentQuestion?.table_names?.[0];
		if (tName && dynamicPreviews[tName]) {
			return dynamicPreviews[tName];
		}
		return getQuestionPreviewData(currentQuestion, tName);
	});

	let previewRowInfo = $derived.by(() => {
		if (currentQuestion?.isDdlCreate) return '';
		if (!activePreviewData || activePreviewData.totalRowCount === undefined) return '';
		const shown = activePreviewData.rows ? activePreviewData.rows.length : 0;
		const total = activePreviewData.totalRowCount;
		return t[$locale].showingRowsInfo(shown, total);
	});

	// Persistent Database Engine instance per module session
	let dbEngine: IDbEngine | null = null;
	let activeDbms: string | null = null;

	let userCode = $state('');
	let queryResult = $state<DbResult | null>(null);
	let queryError = $state<string | null>(null);
	let isRunningQuery = $state(false);

	// In-memory cache of user input per question id
	const userDrafts = new Map<number, string>();

	// Expected query result cache by engine_questionId
	const expectedResultsCache = new Map<string, DbResult>();

	async function cleanupEngine() {
		if (dbEngine) {
			try {
				await dbEngine.destroy();
			} catch (e) {
				// Cleanup error ignored
			}
			dbEngine = null;
			activeDbms = null;
		}
	}

	async function ensureModuleEngine(seedSql: string, dbms: 'mysql' | 'postgres'): Promise<IDbEngine> {
		if (dbEngine && activeDbms === dbms) {
			await dbEngine.init(seedSql || '');
			return dbEngine;
		}
		await cleanupEngine();

		const engine = createDbEngine(dbms);
		await engine.init(seedSql || '');
		dbEngine = engine;
		activeDbms = dbms;
		return dbEngine;
	}

	async function initTaskEngineAndPreview(q: Question | null, dbms: 'mysql' | 'postgres', limit: number = previewLimit) {
		if (!q) return;
		const reqId = ++previewRequestId;
		try {
			const engine = await ensureModuleEngine(q.seed_sql || '', dbms);
			if (reqId !== previewRequestId) return;
			if (!q.isDdlCreate) {
				const previews = await fetchAllDynamicPreviews(engine, q, limit);
				if (reqId !== previewRequestId) return;
				dynamicPreviews = previews;
			} else {
				dynamicPreviews = {};
			}
		} catch (e) {
			console.error('Failed to initialize engine and preview:', e);
		}
	}

	async function togglePreviewLimit() {
		const newLimit = previewLimit === 10 ? 0 : 10;
		previewLimit = newLimit;
		if (currentQuestion) {
			await initTaskEngineAndPreview(currentQuestion, dbmsParam, newLimit);
		}
	}

	async function handleResetDatabase() {
		if (!currentQuestion) return;

		// 1. Re-seed database instance
		const seed = currentQuestion.seed_sql || '';
		await ensureModuleEngine(seed, dbmsParam);

		// 2. Clear query input and output state
		userCode = '';
		queryResult = null;
		queryError = null;

		// 3. Clear draft cache for this specific task
		if (rawCurrentQuestion) {
			userDrafts.delete(rawCurrentQuestion.id);
			if (typeof window !== 'undefined') {
				try {
					localStorage.removeItem(`sqlek_draft_${rawCurrentQuestion.id}`);
				} catch (e) {
					// Ignore storage error
				}
			}
		}

		// 4. Invalidate progress for this specific task slot index only
		completedIndices = completedIndices.filter((idx) => idx !== currentIndex);
		unmarkTaskCompleted(dbmsParam, moduleId, currentIndex);

		// 5. Refresh preview tables
		activePreviewTable = currentQuestion.table_names?.[0] || 'Schema';
		await initTaskEngineAndPreview(currentQuestion, dbmsParam, previewLimit);
	}

	// Instant 0ms synchronous task switching with background WASM preview sync
	function selectTask(idx: number) {
		if (idx < 0 || idx >= sampledQuestions.length) return;

		// Save draft of currently active question before switching
		if (rawCurrentQuestion) {
			if (userCode) {
				userDrafts.set(rawCurrentQuestion.id, userCode);
				if (typeof window !== 'undefined') {
					try {
						localStorage.setItem(`sqlek_draft_${rawCurrentQuestion.id}`, userCode);
					} catch (e) {}
				}
			} else {
				userDrafts.delete(rawCurrentQuestion.id);
				if (typeof window !== 'undefined') {
					try {
						localStorage.removeItem(`sqlek_draft_${rawCurrentQuestion.id}`);
					} catch (e) {}
				}
			}
		}

		currentIndex = idx;
		queryResult = null;
		queryError = null;

		// Strictly default to empty string unless the user has actively typed a draft
		const nextQ = sampledQuestions[idx];
		let draft = (nextQ && userDrafts.get(nextQ.id)) || '';
		if (!draft && nextQ && typeof window !== 'undefined') {
			try {
				draft = localStorage.getItem(`sqlek_draft_${nextQ.id}`) || '';
			} catch (e) {}
		}
		userCode = draft;

		const q = resolveQuestionForEngine(sampledQuestions[idx], dbmsParam);
		activePreviewTable = q.table_names?.[0] || 'Schema';
		initTaskEngineAndPreview(q, dbmsParam, previewLimit);
	}

	function goToNext() {
		if (currentIndex < sampledQuestions.length - 1) {
			selectTask(currentIndex + 1);
		}
	}

	function goToPrev() {
		if (currentIndex > 0) {
			selectTask(currentIndex - 1);
		}
	}

	function jsonEquals(a: any, b: any): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	async function getExpectedResult(q: Question, engineName: 'mysql' | 'postgres'): Promise<DbResult> {
		const key = `${engineName}_${q.id}`;
		const cached = expectedResultsCache.get(key);
		if (cached) return cached;

		const vEngine = createDbEngine(engineName);
		await vEngine.init(q.seed_sql);
		const res = await vEngine.query(q.expected_query);
		await vEngine.destroy();
		expectedResultsCache.set(key, res);
		return res;
	}

	function markCurrentTaskCompleted() {
		if (!completedIndices.includes(currentIndex)) {
			completedIndices = [...completedIndices, currentIndex];
		}

		let newCompletedModules = [...completedModules];
		if (completedIndices.length === sampledQuestions.length && !newCompletedModules.includes(moduleId)) {
			newCompletedModules.push(moduleId);
			completedModules = newCompletedModules;
		}

		const prog = getProgress(dbmsParam);
		saveProgress(dbmsParam, {
			completedModules: newCompletedModules,
			modules: {
				...prog.modules,
				[moduleId]: {
					questionIds: sampledQuestions.map((q: Question) => q.id),
					completedTasks: completedIndices
				}
			}
		});
	}

	async function getExpectedVerificationState(q: Question, engineName: 'mysql' | 'postgres'): Promise<DbResult> {
		const key = `verification_${engineName}_${q.id}`;
		const cached = expectedResultsCache.get(key);
		if (cached) return cached;

		const vEngine = createDbEngine(engineName);
		try {
			await vEngine.init(q.seed_sql || '');
			await vEngine.query(q.expected_query);
			const expectedState = await vEngine.query(q.verification_query!);
			expectedResultsCache.set(key, expectedState);
			return expectedState;
		} finally {
			await vEngine.destroy();
		}
	}

	async function handleRun() {
		if (!currentQuestion || !isCurrentTaskUnlocked || isRunningQuery) return;
		isRunningQuery = true;
		queryError = null;
		queryResult = null;

		try {
			const seed = currentQuestion.seed_sql || '';
			const engine = await ensureModuleEngine(seed, dbmsParam);
			const uRes = await engine.query(userCode);
			queryResult = uRes;

			if (currentQuestion.isDdlCreate) {
				const primaryTable = currentQuestion.table_names && currentQuestion.table_names.length > 0 ? currentQuestion.table_names[0] : 'books';

				let checkRes: DbResult;
				try {
					checkRes = await engine.query(`SELECT * FROM ${primaryTable} LIMIT 1;`);
				} catch (e: any) {
					queryError = e.message || `Table '${primaryTable}' was not created.`;
					return;
				}

				const actualCols = checkRes.columns.map((c) => c.toLowerCase());
				const expectedCols = currentQuestion.targetSchemaBlueprint
					? currentQuestion.targetSchemaBlueprint.map((c) => c.name.toLowerCase())
					: ['id', 'title', 'price'];

				const isMatch =
					expectedCols.length > 0 &&
					expectedCols.every((ec) => actualCols.includes(ec)) &&
					actualCols.length === expectedCols.length;

				if (isMatch) {
					markCurrentTaskCompleted();
				} else {
					queryError = `Table '${primaryTable}' was created, but columns do not match expected schema blueprint: [${expectedCols.join(', ')}] vs actual [${actualCols.join(', ')}].`;
				}
			} else if (currentQuestion.verification_query) {
				const actualState = await engine.query(currentQuestion.verification_query);
				if (uRes.rows.length === 0) {
					queryResult = actualState;
				}

				const expectedState = await getExpectedVerificationState(currentQuestion, dbmsParam);

				if (jsonEquals(actualState.rows, expectedState.rows)) {
					markCurrentTaskCompleted();
				} else {
					queryError = 'Hasil eksekusi query belum sesuai dengan status tabel atau data yang diharapkan.';
				}
			} else {
				const eRes = await getExpectedResult(currentQuestion, dbmsParam);

				if (jsonEquals(uRes.rows, eRes.rows)) {
					markCurrentTaskCompleted();
				}
			}
		} catch (err: any) {
			queryError = err.message || 'Error executing SQL query';
		} finally {
			isRunningQuery = false;
		}
	}

	async function handleResetSession() {
		clearProgress(dbmsParam);
		completedModules = [];
		completedIndices = [];
		if (typeof window !== 'undefined') {
			try {
				sampledQuestions.forEach((q) => {
					localStorage.removeItem(`sqlek_draft_${q.id}`);
				});
			} catch (e) {}
		}
		userDrafts.clear();
		userCode = '';
		currentIndex = 0;
		sampledQuestions = sampleDiverseQuestions(currentModule.questions);
		selectTask(0);
		await handleResetDatabase();
	}

	async function loadModuleData(modId: number, dbms: 'mysql' | 'postgres') {
		const prog = getProgress(dbms);
		completedModules = prog.completedModules;

		if (!$isAdminMode && !isModuleUnlocked(modId, completedModules, $isAdminMode)) {
			goto(`/${dbms}`);
			return;
		}

		const targetModule = MODULES.find((m) => m.id === modId) || MODULES[0];
		const modState = prog.modules[modId];
		if (modState && modState.questionIds && modState.questionIds.length > 0) {
			const loadedQuestions = modState.questionIds
				.map((id: number) => targetModule.questions.find((q: Question) => q.id === id))
				.filter((q): q is Question => q !== undefined);

			if (loadedQuestions.length === modState.questionIds.length) {
				sampledQuestions = loadedQuestions;
				completedIndices = modState.completedTasks || [];
			} else {
				sampledQuestions = sampleDiverseQuestions(targetModule.questions);
				completedIndices = [];
				saveProgress(dbms, {
					completedModules,
					modules: {
						...prog.modules,
						[modId]: {
							questionIds: sampledQuestions.map((q: Question) => q.id),
							completedTasks: []
						}
					}
				});
			}
		} else {
			sampledQuestions = sampleDiverseQuestions(targetModule.questions);
			completedIndices = [];
			saveProgress(dbms, {
				completedModules,
				modules: {
					...prog.modules,
					[modId]: {
						questionIds: sampledQuestions.map((q: Question) => q.id),
						completedTasks: []
					}
				}
			});
		}

		// Instantly select first task with 0ms delay and sync engine in background
		userDrafts.clear();
		userCode = '';
		selectTask(0);
	}

	function handleNextNavigation() {
		if (!isPassed) return;

		const action = getNextNavigationAction(currentIndex, sampledQuestions.length, moduleId, TOTAL_MODULES);
		if (action === 'next-task') {
			goToNext();
			return;
		}

		markModuleCompleted(dbmsParam, moduleId);
		if (action === 'next-module') {
			goto(`/${dbmsParam}/${moduleId + 1}`);
			return;
		}

		goto('/');
	}

	$effect(() => {
		const currModId = moduleId;
		const currDbms = dbmsParam;
		untrack(() => {
			loadModuleData(currModId, currDbms);
		});
	});

	$effect(() => {
		if (!$isAdminMode && !isModuleUnlocked(moduleId, completedModules, $isAdminMode)) {
			goto(`/${dbmsParam}`);
		}
	});

	onDestroy(() => {
		cleanupEngine();
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-black text-white flex flex-col">
	<header class="w-full bg-black border-b border-zinc-850 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30 shrink-0">
		<div class="flex items-center gap-3 sm:gap-4">
			<Logo hideTextOnMobile={true} />
			<div class="h-4 w-px bg-zinc-850 hidden sm:block"></div>
			<a
				href="/{dbmsParam}"
				class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors shrink-0"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				<span class="hidden md:inline">{t[$locale].backToModules}</span>
			</a>
			<div class="h-4 w-px bg-zinc-850 hidden md:block"></div>
			<h1 class="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2 truncate">
				<span class="truncate">{currentModule.title[$locale]}</span>
				<span class="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 uppercase shrink-0">
					{dbmsParam === 'postgres' ? 'PostgreSQL' : 'MySQL'}
				</span>
			</h1>
		</div>

		<div class="flex items-center gap-3 sm:gap-4">
			<div class="flex items-center gap-1.5 overflow-x-auto py-1">
				{#each sampledQuestions as _, idx}
					{@const isDone = completedIndices.includes(idx)}
					{@const isActive = idx === currentIndex}
					<button
						onclick={() => selectTask(idx)}
						title={`Task ${idx + 1}`}
						class="w-7 h-7 rounded-md text-xs font-mono transition-all flex items-center justify-center shrink-0 {isActive
							? 'bg-zinc-100 text-zinc-950 font-semibold ring-1 ring-white/20'
							: isDone
								? 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
								: 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'}"
					>
						{#if isDone}
							✓
						{:else}
							{idx + 1}
						{/if}
					</button>
				{/each}
			</div>

			<div class="h-4 w-px bg-zinc-850"></div>

			<div class="flex items-center gap-2 shrink-0">
				<LanguageToggle />
				<UserMenu engine={dbmsParam} onResetSession={handleResetSession} onResetDatabase={handleResetDatabase} />
			</div>
		</div>
	</header>

	{#if currentQuestion}
		<main class="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 w-full flex-1 flex flex-col">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 items-start">
				<!-- Left Column: Context, Theory & Instructions -->
				<div class="bg-zinc-950 p-5 sm:p-6 rounded-xl border border-zinc-850 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-6.5rem)] lg:sticky lg:top-20">
					<div class="space-y-6">
						<div>
							<div class="flex items-center justify-between gap-2 mb-1.5">
								<span class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
									{t[$locale].taskHeader(currentIndex + 1, sampledQuestions.length)}
								</span>
								{#if !isCurrentTaskUnlocked}
									<span class="bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded font-mono uppercase tracking-wider">
										{t[$locale].previewBadge(currentIndex)}
									</span>
								{:else if isPassed}
									<span class="bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded font-mono uppercase tracking-wider inline-flex items-center gap-1.5 font-medium">
										<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
										{t[$locale].completedBadge}
									</span>
								{/if}
							</div>
							<h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
								{currentQuestion.title[$locale]}
							</h2>
						</div>

						<!-- Top Section: Concept Explanation & Syntax Box -->
						{#if currentQuestion.conceptExplanation}
							<div class="text-zinc-300 text-sm leading-relaxed space-y-2">
								<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
									{t[$locale].lessonConcept}
								</h3>
								<div class="whitespace-pre-line text-sm text-zinc-300 leading-relaxed font-normal">
									{currentQuestion.conceptExplanation[$locale]}
								</div>
							</div>
						{/if}

						{#if !$hideSyntaxPattern && currentQuestion.syntaxPatterns && currentQuestion.syntaxPatterns.length > 0}
							<div class="space-y-2.5">
								<h4 class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
									{t[$locale].syntaxPattern}
								</h4>
								<div class="space-y-2.5">
									{#each currentQuestion.syntaxPatterns as pattern}
										<div class="bg-zinc-950 border border-zinc-850 rounded-md p-3 font-mono text-xs">
											{#if pattern.label}
												<div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900">
													<span class="text-xs text-zinc-300 font-medium font-mono">
														{pattern.label[$locale]}
													</span>
													<span class="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
														SQL
													</span>
												</div>
											{/if}
											<div class="overflow-x-auto bg-black border border-zinc-900 rounded p-2.5">
												<pre class="text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre">{pattern.code}</pre>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Middle Section: Live Preview Table of Seed Data / Target Schema Blueprint -->
						<div>
							<div class="flex items-center justify-between mb-2 flex-wrap gap-2">
								<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
									{t[$locale].initialTablePreview(activePreviewTable || currentQuestion.table_names[0] || 'Schema', previewRowInfo)}
								</h3>
								{#if !currentQuestion.isDdlCreate && activePreviewData && activePreviewData.totalRowCount !== undefined && activePreviewData.totalRowCount > 10}
									<button
										type="button"
										onclick={togglePreviewLimit}
										class="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 underline transition-colors cursor-pointer"
									>
										{previewLimit === 10 ? t[$locale].showAllRows(activePreviewData.totalRowCount) : t[$locale].showFewerRows(10)}
									</button>
								{/if}
							</div>

							{#if currentQuestion.table_names && currentQuestion.table_names.length > 1}
								<div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
									{#each currentQuestion.table_names as tName}
										<button
											type="button"
											onclick={() => activePreviewTable = tName}
											class="px-2 py-0.5 text-xs font-mono rounded border transition-colors {activePreviewTable === tName ? 'bg-zinc-800 text-zinc-100 border-zinc-700 font-medium' : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'}"
										>
											{tName}
										</button>
									{/each}
								</div>
							{/if}

							{#if currentQuestion.targetSchemaBlueprint && currentQuestion.targetSchemaBlueprint.length > 0}
								<div class="overflow-x-auto border border-zinc-850 rounded-md bg-zinc-950/40 mb-3">
									<table class="w-full text-left text-xs font-mono border-collapse">
										<thead class="bg-zinc-950/60 border-b border-zinc-850 text-zinc-400">
											<tr>
												<th class="p-2 border-r border-zinc-900 font-medium">{t[$locale].colNameHeader}</th>
												<th class="p-2 border-r border-zinc-900 font-medium">{t[$locale].colTypeHeader}</th>
												<th class="p-2 font-medium">{t[$locale].colConstraintHeader}</th>
											</tr>
										</thead>
										<tbody>
											{#each currentQuestion.targetSchemaBlueprint as col}
												<tr class="border-b last:border-b-0 border-zinc-900 hover:bg-zinc-900/30 transition-colors">
													<td class="p-2 border-r border-zinc-900 text-zinc-200 font-medium">{col.name}</td>
													<td class="p-2 border-r border-zinc-900 text-amber-400/90">{col.type}</td>
													<td class="p-2 text-zinc-400">{col.constraint || '—'}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}

							{#if currentQuestion.mockPreviewData}
								<div class="text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center gap-1.5">
									<span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
									<span>{t[$locale].sampleRecordsExpected}</span>
								</div>
							{/if}

							{#if activePreviewData && activePreviewData.rows.length > 0}
								<div class="max-h-72 overflow-auto border border-zinc-850 rounded-md bg-zinc-950/40">
									<table class="w-full text-left text-xs font-mono border-collapse">
										<thead class="sticky top-0 bg-zinc-950 border-b border-zinc-850 text-zinc-400 z-10">
											<tr>
												{#each activePreviewData.columns as col}
													<th class="p-2 border-r last:border-r-0 border-zinc-900 font-medium">{col}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each activePreviewData.rows as row}
												<tr class="border-b last:border-b-0 border-zinc-900 hover:bg-zinc-900/30 transition-colors">
													{#each activePreviewData.columns as col}
														<td class="p-2 border-r last:border-r-0 border-zinc-900 text-zinc-300">
															{row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
														</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{:else if activePreviewData && activePreviewData.columns.length > 0}
								<div class="overflow-x-auto border border-zinc-850 rounded-md bg-zinc-950/40">
									<table class="w-full text-left text-xs font-mono border-collapse">
										<thead class="bg-zinc-950/60 border-b border-zinc-850 text-zinc-400">
											<tr>
												{#each activePreviewData.columns as col}
													<th class="p-2 border-r last:border-r-0 border-zinc-900 font-medium">{col}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan={activePreviewData.columns.length} class="p-3 text-center text-zinc-500 italic">
													(0 rows)
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							{:else if !currentQuestion.isDdlCreate}
								<div class="overflow-x-auto border border-zinc-850 rounded-md bg-zinc-950/40">
									<table class="w-full text-left text-xs font-mono border-collapse">
										<thead class="bg-zinc-950/60 border-b border-zinc-850 text-zinc-400">
											<tr>
												{#each activePreviewData?.columns || [] as col}
													<th class="p-2 border-r last:border-r-0 border-zinc-900 font-medium">{col}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan={activePreviewData?.columns?.length || 1} class="p-3 text-center text-zinc-500 italic">
													(0 rows)
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							{:else}
								<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].noTableSeeded}</p>
							{/if}
						</div>

						<!-- Bottom Section: Specific Task Goal -->
						<div class="border-l-2 border-zinc-400 bg-zinc-950/80 p-3.5 border-y border-r border-zinc-850 rounded-r-md">
							<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
								{t[$locale].taskGoal}
							</h3>
							<p class="text-sm font-normal text-zinc-200 leading-relaxed">
								{currentQuestion.instructions[$locale]}
							</p>
						</div>
					</div>

					<div class="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between">
						<button
							onclick={goToPrev}
							disabled={currentIndex === 0}
							class="px-4 py-2 text-xs font-mono rounded-md border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
						>
							&larr; {t[$locale].previous}
						</button>

						<button
							onclick={handleNextNavigation}
							disabled={!isPassed}
							class="px-4 py-2 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 {isPassed
								? 'bg-white text-black hover:bg-zinc-200 shadow-sm cursor-pointer'
								: 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'}"
						>
							{getNavigationLabel(getNextNavigationAction(currentIndex, sampledQuestions.length, moduleId, TOTAL_MODULES), $locale)}
						</button>
					</div>
				</div>

				<!-- Right Column: SQL Editor & Result Table -->
				<div class="flex flex-col gap-4 flex-1">
					<div class="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-850 flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<span class="text-xs font-mono uppercase tracking-wider text-zinc-400">
								{t[$locale].sqlQuery}
							</span>
							<div class="flex items-center gap-3">
								{#if isCurrentTaskUnlocked}
									<button
										type="button"
										onclick={handleResetDatabase}
										title={t[$locale].resetDatabase}
										class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
									>
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
										</svg>
										<span class="hidden sm:inline">{t[$locale].resetDatabase}</span>
									</button>
								{/if}
								<span class="text-xs font-mono text-zinc-500">
									{#if !isCurrentTaskUnlocked}
										{t[$locale].taskLockedNotice}
									{:else}
										{t[$locale].runQueryHint}
									{/if}
								</span>
							</div>
						</div>

						<SqlEditor
							bind:value={userCode}
							dbms={dbmsParam}
							tableNames={currentQuestion.table_names}
							readOnly={!isCurrentTaskUnlocked}
							onRun={handleRun}
						/>

						<div class="flex flex-col gap-2 pt-1">
							<button
								onclick={handleRun}
								disabled={isRunningQuery || !isCurrentTaskUnlocked}
								class="rounded-md py-2.5 px-4 w-full text-center transition-all text-xs font-mono font-medium flex items-center justify-center gap-2 {!isCurrentTaskUnlocked
									? 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 cursor-not-allowed uppercase tracking-wider'
									: 'bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed'}"
							>
								{#if isRunningQuery}
									<span class="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
									<span>{t[$locale].executing}</span>
								{:else if !isCurrentTaskUnlocked}
									<span>{t[$locale].locked}</span>
								{:else}
									<span>{t[$locale].runQuery}</span>
									<span class="text-[10px] text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded font-mono">⌘↵</span>
								{/if}
							</button>

							{#if isPassed}
								<div class="flex items-center justify-center gap-2 text-xs font-mono text-zinc-200 py-1.5 px-3 rounded-md bg-zinc-900 border border-zinc-800">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
									<span>{t[$locale].correctAnswer}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Result / Output Section -->
					<div class="bg-black border border-zinc-850 rounded-xl p-4 sm:p-5 font-mono text-xs text-zinc-300 flex-1 min-h-[220px] flex flex-col">
						<div class="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2.5">
							<h3 class="text-xs font-mono uppercase tracking-wider text-zinc-400">{t[$locale].queryOutput}</h3>
							{#if queryResult && queryResult.rows}
								<span class="text-[10px] text-zinc-500 font-mono">
									{queryResult.rows.length} {queryResult.rows.length === 1 ? 'row' : 'rows'}
								</span>
							{/if}
						</div>

						{#if !isCurrentTaskUnlocked}
							<div class="flex-1 flex items-center justify-center text-center p-6">
								<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].taskLockedPreview}</p>
							</div>
						{:else if queryError}
							<div class="bg-red-950/20 border border-red-900/60 text-red-400 p-3 rounded-md font-mono text-xs overflow-auto leading-relaxed">
								{queryError}
							</div>
						{:else if queryResult}
							{#if queryResult.rows.length === 0}
								<div class="flex-1 flex items-center justify-center text-center p-6">
									<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].noRowsReturned}</p>
								</div>
							{:else}
								<div class="overflow-auto max-h-[300px] border border-zinc-850 rounded-md bg-zinc-950/50">
									<table class="w-full text-left text-xs font-mono border-collapse">
										<thead class="bg-zinc-950 border-b border-zinc-850 text-zinc-400 sticky top-0">
											<tr>
												{#each queryResult.columns as col}
													<th class="p-2 border-r last:border-r-0 border-zinc-900 font-medium">{col}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each queryResult.rows as row}
												<tr class="border-b last:border-b-0 border-zinc-900 hover:bg-zinc-900/30 transition-colors">
													{#each queryResult.columns as col}
														<td class="p-2 border-r last:border-r-0 border-zinc-900 text-zinc-200">
															{row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
														</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						{:else}
							<div class="flex-1 flex items-center justify-center text-center p-6">
								<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].runQueryPrompt}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</main>
	{/if}
</div>
