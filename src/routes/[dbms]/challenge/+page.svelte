<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { EXAM_QUESTIONS, resolveQuestionForEngine, type ExamQuestion } from '$lib/data/questions';
	import { getQuestionPreviewData, fetchAllDynamicPreviews, type MockPreviewData } from '$lib/data/previewData';
	import { getRandomizedExamPool } from '$lib/utils/shuffle';
	import { createDbEngine, type IDbEngine, type DbResult } from '$lib/db/engine';
	import { getProgress, isExamUnlocked, saveChallengeProgress, isAdminMode } from '$lib/data/progress';
	import { scoreExamAnswer, EXAM_PASS_THRESHOLD, type ExamScoringResult } from '$lib/exam/scoring';
	import SqlEditor from '$lib/components/SqlEditor.svelte';
	import ExamUserMenu from './ExamUserMenu.svelte';
	import ExamScorePanel from './ExamScorePanel.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ErDiagram from '$lib/components/ErDiagram.svelte';
	import ExplainPlanVisualizer from '$lib/components/ExplainPlanVisualizer.svelte';
	import { introspectDatabase, type DatabaseSchema } from '$lib/db/introspect';
	import {
		executeExplainJson,
		extractExplainJson,
		buildEnrichedPlanTree,
		detectExplainQuery,
		type PlanExecutionSummary
	} from '$lib/exam/planVisualizer';
	import { locale, t } from '$lib/data/locale';

	const dbmsParam = $derived(page.params.dbms === 'mysql' ? 'mysql' : 'postgres');
	const isPostgres = $derived(dbmsParam === 'postgres');
	const dbmsLabel = $derived(dbmsParam.toUpperCase());

	let sampledQuestions = $state<ExamQuestion[]>([]);
	let currentIndex = $state(0);
	let completedIndices = $state<number[]>([]);
	let challengePassed = $state(false);

	// Per-task score state
	interface TaskScoreData {
		latest: number;
		best: number;
		passed: boolean;
		scoreResult?: ExamScoringResult;
	}
	let examScores = $state<Record<number, TaskScoreData>>({});
	let currentScoreResult = $state<ExamScoringResult | null>(null);

	let rawCurrentQuestion = $derived(sampledQuestions[currentIndex] || null);
	let currentQuestion = $derived(rawCurrentQuestion ? resolveQuestionForEngine(rawCurrentQuestion, 'postgres') as ExamQuestion : null);

	let isCurrentTaskUnlocked = $derived(
		$isAdminMode || currentIndex === 0 || completedIndices.includes(currentIndex) || completedIndices.includes(currentIndex - 1)
	);

	let isPassed = $derived(
		completedIndices.includes(currentIndex) || (examScores[currentIndex]?.best ?? 0) >= EXAM_PASS_THRESHOLD
	);
	let isLastTask = $derived(sampledQuestions.length > 0 && currentIndex === sampledQuestions.length - 1);
	let isAllCompleted = $derived(sampledQuestions.length > 0 && completedIndices.length === sampledQuestions.length);

	let averageScore = $derived.by(() => {
		if (sampledQuestions.length === 0) return 0;
		let total = 0;
		for (let i = 0; i < sampledQuestions.length; i++) {
			total += examScores[i]?.best || (completedIndices.includes(i) ? EXAM_PASS_THRESHOLD : 0);
		}
		return Math.round(total / sampledQuestions.length);
	});

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

	// Visual ER Diagram & Schema Inspector State
	let activeInspectorTab = $state<'data' | 'er'>('data');
	let databaseSchema = $state<DatabaseSchema>({ tables: [], relationships: [] });

	// Interactive Query Execution Plan Visualizer State
	let activePlanViewMode = $state<'visual' | 'raw'>('visual');
	let executionPlanSummary = $state<PlanExecutionSummary | null>(null);

	async function updateDiagramSchema(engine: IDbEngine | null) {
		if (!engine) {
			databaseSchema = { tables: [], relationships: [] };
			return;
		}
		try {
			databaseSchema = await introspectDatabase(engine, 'postgres');
		} catch (e) {
			console.warn('Failed to introspect schema for ER diagram:', e);
		}
	}

	let dbEngine = $state<IDbEngine | null>(null);
	let activeDbms: string | null = null;

	let editorRef = $state<any>(null);
	let userCode = $state('');
	let queryResult = $state<DbResult | null>(null);
	let queryError = $state<string | null>(null);
	let isRunningQuery = $state(false);

	// In-memory cache of user input per question id
	const userDrafts = new Map<number, string>();
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

	async function ensureChallengeEngine(seedSql: string, dbms: 'mysql' | 'postgres'): Promise<IDbEngine> {
		if (dbEngine && activeDbms === dbms) {
			try {
				await dbEngine.init(seedSql || '');
				return dbEngine;
			} catch (err) {
				console.warn('Re-init of existing challenge engine failed, recreating engine:', err);
				await cleanupEngine();
			}
		}
		await cleanupEngine();
		const engine = createDbEngine(dbms);
		await engine.init(seedSql || '');
		dbEngine = engine;
		activeDbms = dbms;
		return dbEngine;
	}

	async function initChallengeEngineAndPreview(q: ExamQuestion | null, dbms: 'mysql' | 'postgres', limit: number = previewLimit) {
		if (!q || dbms !== 'postgres') return;
		const reqId = ++previewRequestId;
		try {
			const engine = await ensureChallengeEngine(q.seed_sql || '', 'postgres');
			if (reqId !== previewRequestId) return;
			if (!q.isDdlCreate) {
				const previews = await fetchAllDynamicPreviews(engine, q, limit);
				if (reqId !== previewRequestId) return;
				dynamicPreviews = previews;
			} else {
				dynamicPreviews = {};
			}
			await updateDiagramSchema(engine);
		} catch (e) {
			console.error('Failed to initialize challenge engine and preview:', e);
		}
	}

	async function togglePreviewLimit() {
		const newLimit = previewLimit === 10 ? 0 : 10;
		previewLimit = newLimit;
		if (currentQuestion) {
			await initChallengeEngineAndPreview(currentQuestion, 'postgres', newLimit);
		}
	}

	async function handleResetDatabase() {
		if (!currentQuestion) return;

		// 1. Clear SQL Editor State immediately
		userCode = '';
		if (editorRef) {
			try {
				editorRef.clear();
			} catch (e) {}
		}

		// 2. Clear query input and output state
		queryResult = null;
		queryError = null;
		executionPlanSummary = null;
		currentScoreResult = null;
		isRunningQuery = false;

		// 3. Clear draft cache for this specific task
		if (rawCurrentQuestion) {
			userDrafts.delete(rawCurrentQuestion.id);
			if (typeof window !== 'undefined') {
				try {
					localStorage.removeItem(`sqlek_draft_${rawCurrentQuestion.id}`);
					localStorage.removeItem(`draft_${rawCurrentQuestion.id}`);
					localStorage.removeItem(`draft_${rawCurrentQuestion.id}_postgres`);
				} catch (e) {
					// Ignore storage error
				}
			}
		}

		// NOTE: "Reset Database" resets the data but MUST NOT erase passed state or score!

		// 4. Invalidate dynamic table preview immediately
		dynamicPreviews = {};
		activePreviewTable = currentQuestion.table_names?.[0] || 'Schema';

		// 5. Reload Database Engine & Table Previews
		try {
			await initChallengeEngineAndPreview(currentQuestion, 'postgres', previewLimit);
		} catch (err) {
			console.error('Failed to reload challenge database and previews on reset:', err);
		}
	}

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
		executionPlanSummary = null;
		currentScoreResult = examScores[idx]?.scoreResult || null;

		const nextQ = sampledQuestions[idx];
		let draft = (nextQ && userDrafts.get(nextQ.id)) || '';
		if (!draft && nextQ && typeof window !== 'undefined') {
			try {
				draft = localStorage.getItem(`sqlek_draft_${nextQ.id}`) || '';
			} catch (e) {}
		}
		userCode = draft;

		const q = resolveQuestionForEngine(sampledQuestions[idx], 'postgres') as ExamQuestion;
		activePreviewTable = q.table_names?.[0] || 'Schema';
		initChallengeEngineAndPreview(q, 'postgres', previewLimit);
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

	async function getExpectedResult(q: ExamQuestion): Promise<DbResult> {
		const key = `postgres_${q.id}`;
		const cached = expectedResultsCache.get(key);
		if (cached) return cached;

		const vEngine = createDbEngine('postgres');
		await vEngine.init(q.seed_sql);
		const res = await vEngine.query(q.referenceQuery || q.expected_query);
		await vEngine.destroy();
		expectedResultsCache.set(key, res);
		return res;
	}

	async function getExpectedVerificationState(q: ExamQuestion): Promise<DbResult> {
		const key = `verification_postgres_${q.id}`;
		const cached = expectedResultsCache.get(key);
		if (cached) return cached;

		const vEngine = createDbEngine('postgres');
		try {
			await vEngine.init(q.seed_sql || '');
			await vEngine.query(q.referenceQuery || q.expected_query);
			const expectedState = await vEngine.query(q.verification_query!);
			expectedResultsCache.set(key, expectedState);
			return expectedState;
		} finally {
			await vEngine.destroy();
		}
	}

	function markCurrentTaskCompleted() {
		if (!completedIndices.includes(currentIndex)) {
			completedIndices = [...completedIndices, currentIndex];
		}

		const isDone = completedIndices.length === sampledQuestions.length;
		if (isDone) {
			challengePassed = true;
		}

		saveChallengeProgress('postgres', {
			questionIds: sampledQuestions.map((q) => q.id),
			completedTasks: completedIndices,
			passed: isDone || challengePassed
		});
	}

	async function handleRun() {
		if (!currentQuestion || !isCurrentTaskUnlocked || isRunningQuery || !isPostgres) return;
		isRunningQuery = true;
		queryError = null;
		queryResult = null;
		executionPlanSummary = null;
		currentScoreResult = null;

		try {
			const engine = await ensureChallengeEngine(currentQuestion.seed_sql || '', 'postgres');
			const uRes = await engine.query(userCode);
			queryResult = uRes;
			await updateDiagramSchema(engine);

			// Extract execution plan if EXPLAIN is used or requested
			const isExplain =
				detectExplainQuery(userCode).isExplain ||
				uRes.columns.some((c) => c.toUpperCase() === 'QUERY PLAN');
			if (isExplain) {
				const directJson = extractExplainJson(uRes);
				if (directJson) {
					executionPlanSummary = buildEnrichedPlanTree(directJson);
					activePlanViewMode = 'visual';
				} else {
					try {
						const plan = await executeExplainJson(engine, userCode);
						if (plan) {
							executionPlanSummary = plan;
							activePlanViewMode = 'visual';
						}
					} catch {}
				}
			}

			// Step A: Correctness Gate
			let gatePassed = false;

			if (currentQuestion.scoring?.mode === 'structural') {
				// Pure DDL / constraints / privileges: structural evaluation scores checks
				gatePassed = true;
			} else if (currentQuestion.isDdlCreate) {
				const primaryTable = currentQuestion.table_names && currentQuestion.table_names.length > 0 ? currentQuestion.table_names[0] : 'books';
				let checkRes: DbResult;
				try {
					checkRes = await engine.query(`SELECT * FROM ${primaryTable} LIMIT 1;`);
				} catch (e: any) {
					queryError = e.message || `Table '${primaryTable}' was not created.`;
					currentScoreResult = {
						passed: false,
						finalScore: 0,
						gatePassed: false,
						integrityPassed: false,
						symptoms: [],
						error: queryError || undefined
					};
					return;
				}

				const actualCols = checkRes.columns.map((c) => c.toLowerCase());
				const expectedCols = currentQuestion.targetSchemaBlueprint
					? currentQuestion.targetSchemaBlueprint.map((c) => c.name.toLowerCase())
					: [];

				const isMatch =
					expectedCols.length > 0 &&
					expectedCols.every((ec) => actualCols.includes(ec)) &&
					actualCols.length === expectedCols.length;

				if (isMatch) {
					gatePassed = true;
				} else {
					queryError = `Table '${primaryTable}' was created, but columns do not match expected schema blueprint: [${expectedCols.join(', ')}] vs actual [${actualCols.join(', ')}].`;
				}
			} else if (currentQuestion.verification_query) {
				const actualState = await engine.query(currentQuestion.verification_query);
				if (uRes.rows.length === 0) {
					queryResult = actualState;
				}

				const expectedState = await getExpectedVerificationState(currentQuestion);

				if (jsonEquals(actualState.rows, expectedState.rows)) {
					gatePassed = true;
				} else {
					queryError = 'Mutation state does not match expected result table state.';
				}
			} else {
				const expectedRes = await getExpectedResult(currentQuestion);
				if (jsonEquals(uRes.rows, expectedRes.rows)) {
					gatePassed = true;
				} else {
					queryError = 'Output does not match expected result. Please review your query filters and projections.';
				}
			}

			if (!gatePassed) {
				currentScoreResult = {
					passed: false,
					finalScore: 0,
					gatePassed: false,
					integrityPassed: false,
					symptoms: [],
					error: queryError || 'Incorrect result.'
				};
				return;
			}

			// Steps B & C: Integrity & Efficiency Scoring on a clean seeded database
			const explainEngine = await ensureChallengeEngine(currentQuestion.seed_sql || '', 'postgres');
			const scoreRes = await scoreExamAnswer(explainEngine, currentQuestion, userCode);
			currentScoreResult = scoreRes;

			const prevBest = examScores[currentIndex]?.best || 0;
			const newBest = Math.max(prevBest, scoreRes.finalScore);
			const taskPassed = newBest >= EXAM_PASS_THRESHOLD;

			examScores[currentIndex] = {
				latest: scoreRes.finalScore,
				best: newBest,
				passed: taskPassed,
				scoreResult: scoreRes
			};

			if (typeof window !== 'undefined') {
				try {
					localStorage.setItem('sqlek_exam_scores_postgres', JSON.stringify(examScores));
				} catch {}
			}

			if (taskPassed) {
				markCurrentTaskCompleted();
			}
		} catch (err: any) {
			queryError = err.message || 'Error executing SQL query';
			currentScoreResult = {
				passed: false,
				finalScore: 0,
				gatePassed: false,
				integrityPassed: false,
				symptoms: [],
				error: queryError || undefined
			};
		} finally {
			isRunningQuery = false;
		}
	}

	function handleResetChallenge() {
		// 1. Clear SQL Editor State
		userCode = '';
		if (editorRef) {
			try {
				editorRef.clear();
			} catch (e) {}
		}

		// 2. Clear query input and output state
		queryResult = null;
		queryError = null;
		executionPlanSummary = null;
		currentScoreResult = null;
		isRunningQuery = false;

		const pool = getRandomizedExamPool('postgres', 30);
		sampledQuestions = pool;
		completedIndices = [];
		challengePassed = false;
		examScores = {};

		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('sqlek_exam_scores_postgres');
				pool.forEach((q) => {
					localStorage.removeItem(`sqlek_draft_${q.id}`);
					localStorage.removeItem(`draft_${q.id}`);
					localStorage.removeItem(`draft_${q.id}_postgres`);
				});
				const keysToRemove: string[] = [];
				for (let i = 0; i < localStorage.length; i++) {
					const k = localStorage.key(i);
					if (k && (k.startsWith('sqlek_draft_') || k.startsWith('draft_'))) {
						keysToRemove.push(k);
					}
				}
				keysToRemove.forEach((k) => localStorage.removeItem(k));
			} catch (e) {}
		}
		userDrafts.clear();
		saveChallengeProgress('postgres', {
			questionIds: pool.map((q) => q.id),
			completedTasks: [],
			passed: false
		});
		dynamicPreviews = {};
		currentIndex = 0;
		selectTask(0);
		handleResetDatabase();
	}

	function loadChallengeData() {
		userDrafts.clear();
		userCode = '';

		// Restore saved task scores from localStorage
		if (typeof window !== 'undefined') {
			try {
				const savedScores = localStorage.getItem('sqlek_exam_scores_postgres');
				if (savedScores) {
					examScores = JSON.parse(savedScores);
				}
			} catch (e) {
				examScores = {};
			}
		}

		const prog = getProgress('postgres');
		if (!$isAdminMode && !isExamUnlocked(prog.completedModules, $isAdminMode)) {
			goto(`${base}/postgres`);
			return;
		}

		const chal = prog.challenge;
		if (chal && chal.questionIds && chal.questionIds.length === 30) {
			const allMap = new Map<number, ExamQuestion>();
			for (const q of EXAM_QUESTIONS) {
				allMap.set(q.id, q);
			}
			const loaded = chal.questionIds
				.map((id) => allMap.get(id))
				.filter((q): q is ExamQuestion => q !== undefined);

			if (loaded.length === 30) {
				sampledQuestions = loaded;
				completedIndices = chal.completedTasks || [];
				challengePassed = chal.passed || false;
				selectTask(0);
				const firstQ = resolveQuestionForEngine(loaded[0], 'postgres') as ExamQuestion;
				ensureChallengeEngine(firstQ?.seed_sql || '', 'postgres').catch((e) => {
					console.error('Failed to initialize challenge engine in background:', e);
				});
				return;
			}
		}

		const pool = getRandomizedExamPool('postgres', 30);
		sampledQuestions = pool;
		completedIndices = [];
		challengePassed = false;
		saveChallengeProgress('postgres', {
			questionIds: pool.map((q) => q.id),
			completedTasks: [],
			passed: false
		});
		selectTask(0);
	}

	function handleNextNavigation() {
		if (!isPassed) return;

		if (!isLastTask) {
			goToNext();
			return;
		}

		markCurrentTaskCompleted();
		goto(`${base}/postgres`);
	}

	$effect(() => {
		untrack(() => {
			if (dbmsParam === 'postgres') {
				loadChallengeData();
			}
		});
	});

	$effect(() => {
		const prog = getProgress(dbmsParam);
		if (!$isAdminMode && !isExamUnlocked(prog.completedModules, $isAdminMode)) {
			goto(`${base}/${dbmsParam}`);
		}
	});

	onDestroy(() => {
		cleanupEngine();
	});
</script>

<svelte:head>
	<title>Final Boss Challenge ({dbmsLabel}) | SQLek</title>
</svelte:head>

{#if !isPostgres}
	<!-- PostgreSQL Only Notification Screen for MySQL -->
	<div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-mono">
		<div class="max-w-md p-6 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-2xl">
			<div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
				</svg>
			</div>
			<h2 class="text-lg font-bold text-white tracking-tight">PostgreSQL Only</h2>
			<p class="text-xs text-zinc-400 leading-relaxed">
				The Final Boss Challenge and its execution-plan efficiency scoring engine are exclusively built for PostgreSQL (PGlite).
			</p>
			<div class="pt-3 flex flex-col gap-2.5">
				<a
					href="{base}/postgres/challenge"
					class="px-4 py-2.5 bg-white text-black font-semibold rounded text-xs hover:bg-zinc-200 transition-colors"
				>
					Switch to PostgreSQL Challenge &rarr;
				</a>
				<a
					href="{base}/mysql"
					class="px-4 py-2 border border-zinc-800 text-zinc-400 rounded text-xs hover:text-white transition-colors"
				>
					Back to MySQL Modules
				</a>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-black text-white flex flex-col">
		<header class="w-full bg-black border-b border-zinc-850 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30 shrink-0">
			<div class="flex items-center gap-3 sm:gap-4">
				<Logo hideTextOnMobile={true} />
				<div class="h-4 w-px bg-zinc-850 hidden sm:block"></div>
				<a
					href="{base}/postgres"
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
					<span class="px-2 py-0.5 rounded text-[11px] font-mono font-medium border border-amber-500/30 bg-amber-500/10 text-amber-300 shrink-0">
						{t[$locale].finalBossBadge}
					</span>
					<span class="truncate hidden sm:inline">{t[$locale].challengeTitle}</span>
					<span class="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 uppercase shrink-0">
						PGlite WASM
					</span>
				</h1>
			</div>

			<div class="flex items-center gap-3 sm:gap-4">
				<!-- Scrollable 30 Task Pills -->
				<div class="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[160px] sm:max-w-[320px] md:max-w-[460px] lg:max-w-[580px] xl:max-w-[700px]">
					{#each sampledQuestions as _, idx}
						{@const isDone = completedIndices.includes(idx)}
						{@const isActive = idx === currentIndex}
						{@const bestScore = examScores[idx]?.best || (isDone ? 100 : 0)}
						<button
							onclick={() => selectTask(idx)}
							title={`Task ${idx + 1}${bestScore > 0 ? ` (Best: ${bestScore}%)` : ''}`}
							class="w-7 h-7 rounded-md text-xs font-mono transition-all flex items-center justify-center shrink-0 {isActive
								? 'bg-zinc-100 text-zinc-950 font-semibold ring-1 ring-white/20'
								: isDone
									? 'bg-zinc-900 border border-emerald-700/60 text-emerald-300 hover:text-white'
									: 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'}"
						>
							{#if isDone}
								<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							{:else}
								{idx + 1}
							{/if}
						</button>
					{/each}
				</div>

				<div class="h-4 w-px bg-zinc-850"></div>

				<div class="flex items-center gap-2 shrink-0">
					<LanguageToggle />
					<ExamUserMenu engine="postgres" onResetSession={handleResetChallenge} onResetDatabase={handleResetDatabase} />
				</div>
			</div>
		</header>

		<!-- All-Tasks Completed Congratulatory Banner -->
		{#if isAllCompleted}
			<div class="w-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border-b border-amber-500/30 px-4 py-3">
				<div class="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
					<div class="flex items-center gap-2.5 text-zinc-200">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
							<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
							<path d="M4 22h16"/>
							<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
							<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
							<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
						</svg>
						<div>
							<span class="font-semibold text-white">{t[$locale].challengeCongratulations}</span>
							<p class="text-[11px] text-zinc-400">
								Exam Passed! Average Score: <strong class="text-emerald-300 font-bold">{averageScore}%</strong>
							</p>
						</div>
					</div>
					<a
						href="{base}/postgres"
						class="px-4 py-1.5 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors shrink-0"
					>
						{t[$locale].finishExamNav} &rarr;
					</a>
				</div>
			</div>
		{/if}

		{#if currentQuestion}
			<main class="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 w-full flex-1 flex flex-col">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 items-start">
					<!-- Left Column: Context, Scenario & Goal -->
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
										<span class="bg-zinc-900/90 border border-emerald-700/60 text-emerald-300 text-xs px-2.5 py-1 rounded font-mono uppercase tracking-wider inline-flex items-center gap-1.5 font-medium">
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
											{t[$locale].completedBadge} ({examScores[currentIndex]?.best ?? 100}%)
										</span>
									{/if}
								</div>
								<h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
									{currentQuestion.title[$locale]}
								</h2>
							</div>

							<!-- Business Scenario (Concept Explanation with No Syntax Leak) -->
							{#if currentQuestion.conceptExplanation}
								<div class="text-zinc-300 text-sm leading-relaxed space-y-2">
									<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
											<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
										</svg>
										<span>{$locale === 'id' ? 'Konteks Masalah Industri' : 'Business Scenario'}</span>
									</h3>
									<div class="whitespace-pre-line text-sm text-zinc-300 leading-relaxed font-normal">
										{currentQuestion.conceptExplanation[$locale]}
									</div>
								</div>
							{/if}

							<!-- Middle Section: Live Table Preview / Schema Blueprint & Visual ER Diagram -->
							<div>
								<!-- View Mode Toggle Tabs -->
								<div class="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-850 flex-wrap gap-2">
									<div class="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-md border border-zinc-850">
										<button
											type="button"
											onclick={() => activeInspectorTab = 'data'}
											class="px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5 {activeInspectorTab === 'data' ? 'bg-zinc-850 text-zinc-100 font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
												<line x1="3" y1="9" x2="21" y2="9"/>
												<line x1="9" y1="21" x2="9" y2="9"/>
											</svg>
											<span>{t[$locale].tableViewTab}</span>
										</button>
										<button
											type="button"
											onclick={() => activeInspectorTab = 'er'}
											class="px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5 {activeInspectorTab === 'er' ? 'bg-zinc-850 text-zinc-100 font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<circle cx="18" cy="5" r="3"/>
												<circle cx="6" cy="12" r="3"/>
												<circle cx="18" cy="19" r="3"/>
												<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
												<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
											</svg>
											<span>{t[$locale].erDiagramTab}</span>
										</button>
									</div>

									{#if activeInspectorTab === 'data' && !currentQuestion.isDdlCreate && activePreviewData && activePreviewData.totalRowCount !== undefined && activePreviewData.totalRowCount > 10}
										<button
											type="button"
											onclick={togglePreviewLimit}
											class="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 underline transition-colors cursor-pointer"
										>
											{previewLimit === 10 ? t[$locale].showAllRows(activePreviewData.totalRowCount) : t[$locale].showFewerRows(10)}
										</button>
									{/if}
								</div>

								{#if activeInspectorTab === 'er'}
									<ErDiagram schema={databaseSchema} dbms="postgres" onRefresh={() => updateDiagramSchema(dbEngine)} />
								{:else}
									<div class="flex items-center justify-between mb-2 flex-wrap gap-2">
										<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
											{t[$locale].initialTablePreview(activePreviewTable || currentQuestion.table_names[0] || 'Schema', previewRowInfo)}
										</h3>
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

									{#if activePreviewData && activePreviewData.rows.length > 0}
										<div class="max-h-64 overflow-auto border border-zinc-850 rounded-md bg-zinc-950/40">
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
										<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].noTableSeeded}</p>
									{/if}
								{/if}
							</div>

							<!-- Task Goal Box -->
							<div class="border-l-2 border-amber-400 bg-zinc-950/80 p-3.5 border-y border-r border-zinc-850 rounded-r-md">
								<h3 class="text-xs font-mono font-medium uppercase tracking-wider text-amber-300 mb-1">
									{t[$locale].taskGoal}
								</h3>
								<p class="text-sm font-normal text-zinc-200 leading-relaxed">
									{currentQuestion.instructions[$locale]}
								</p>
							</div>
						</div>

						<!-- Bottom Task Pagination Action Buttons -->
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
								title={!isPassed ? 'Score 75% or higher to unlock the next task' : ''}
								class="px-4 py-2 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 {isPassed
									? 'bg-white text-black hover:bg-zinc-200 shadow-sm cursor-pointer'
									: 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'}"
							>
								{#if !isLastTask}
									{t[$locale].nextTaskNav}
								{:else}
									{t[$locale].finishExamNav} &rarr;
								{/if}
							</button>
						</div>
					</div>

					<!-- Right Column: SQL Editor, Score Panel & Query Output -->
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
											<span>{t[$locale].resetDatabase}</span>
										</button>
									{/if}
								</div>
							</div>

							<SqlEditor
								bind:this={editorRef}
								bind:value={userCode}
								dbms="postgres"
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
										<span>Analyzing & Evaluating...</span>
									{:else if !isCurrentTaskUnlocked}
										<span>{t[$locale].locked}</span>
									{:else}
										<span>Run & Evaluate Plan</span>
										<span class="text-[10px] text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded font-mono">⌘↵</span>
									{/if}
								</button>
							</div>

							<!-- Exam Score Panel -->
							<ExamScorePanel
								scoreResult={currentScoreResult}
								bestScore={examScores[currentIndex]?.best || (isPassed ? 100 : 0)}
							/>
						</div>

						<!-- Result / Output Section -->
						<div class="bg-black border border-zinc-850 rounded-xl p-4 sm:p-5 font-mono text-xs text-zinc-300 flex-1 min-h-[220px] flex flex-col">
							<div class="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2.5 flex-wrap gap-2">
								<div class="flex items-center gap-2">
									<h3 class="text-xs font-mono uppercase tracking-wider text-zinc-400">{t[$locale].queryOutput}</h3>
									{#if executionPlanSummary}
										<div class="flex items-center gap-0.5 bg-zinc-950 p-0.5 rounded border border-zinc-800">
											<button
												type="button"
												onclick={() => activePlanViewMode = 'visual'}
												class="px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1.5 {activePlanViewMode === 'visual' ? 'bg-zinc-800 text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'}"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<rect x="3" y="3" width="7" height="7" rx="1"/>
													<rect x="14" y="3" width="7" height="7" rx="1"/>
													<rect x="14" y="14" width="7" height="7" rx="1"/>
													<path d="M10 6.5h4M6.5 10v7h7.5"/>
												</svg>
												<span>{t[$locale].visualPlanTab}</span>
											</button>
											<button
												type="button"
												onclick={() => activePlanViewMode = 'raw'}
												class="px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1.5 {activePlanViewMode === 'raw' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'}"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
												</svg>
												<span>{t[$locale].rawOutputTab}</span>
											</button>
										</div>
									{/if}
								</div>
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
								{#if executionPlanSummary && activePlanViewMode === 'visual'}
									<div class="flex-1 min-h-[380px] flex flex-col">
										<ExplainPlanVisualizer planSummary={executionPlanSummary} />
									</div>
								{:else if queryResult.rows.length === 0}
									<div class="flex-1 flex items-center justify-center text-center p-6">
										<p class="text-xs font-mono text-zinc-500 italic">{t[$locale].noRowsReturned}</p>
									</div>
								{:else}
									<div class="overflow-auto max-h-[260px] border border-zinc-850 rounded-md bg-zinc-950/50">
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
{/if}
