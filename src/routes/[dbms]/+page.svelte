<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { MODULES } from '$lib/data/questions';
	import { getProgress, clearProgress, isModuleUnlocked, isExamUnlocked, isAdminMode, resolveResumePath } from '$lib/data/progress';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { locale, t } from '$lib/data/locale';

	const dbms = $derived(page.params.dbms === 'mysql' ? 'mysql' : 'postgres');
	const dbmsTitle = $derived(dbms === 'postgres' ? 'PostgreSQL' : 'MySQL');

	let completedModules = $state<number[]>([]);
	let challengePassed = $state(false);

	let isExamOpen = $derived($isAdminMode || isExamUnlocked(completedModules, $isAdminMode));

	function loadProgress() {
		const prog = getProgress(dbms);
		completedModules = prog.completedModules;
		challengePassed = prog.challenge?.passed ?? false;
	}

	function handleResetSession() {
		clearProgress(dbms);
		loadProgress();
	}

	$effect(() => {
		loadProgress();
	});
</script>

<svelte:head>
	<title>SQLek | {dbmsTitle} Modules</title>
</svelte:head>

<div class="min-h-screen bg-black text-white bg-dot-grid relative flex flex-col">
	<header class="w-full border-b border-zinc-850 bg-black/80 backdrop-blur-md sticky top-0 z-30">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
			<div class="flex items-center gap-3 sm:gap-4">
				<Logo />
				<div class="h-4 w-px bg-zinc-850"></div>
				<a
					href="/"
					class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
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
					<span>{t[$locale].switchEngine}</span>
				</a>
			</div>

			<div class="flex items-center gap-3">
				<LanguageToggle />
				<UserMenu engine={dbms} onResetSession={handleResetSession} />
			</div>
		</div>
	</header>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
		<div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
					<span>{dbms === 'postgres' ? 'PGlite WASM' : 'sql.js WASM'}</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white capitalize">
					{dbmsTitle} {t[$locale].modulesTitle}
				</h1>
			</div>

			<button
				onclick={() => {
					let resumeUrl = resolveResumePath(page.params.dbms || dbms);
					if (page.params.dbms && page.params.dbms.toLowerCase() === 'postgresql') {
						resumeUrl = resumeUrl.replace(/^\/postgres\b/, '/postgresql');
					}
					goto(resumeUrl);
				}}
				class="px-4 py-2 bg-white text-black font-semibold text-xs sm:text-sm rounded-lg hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-sm"
			>
				<span>{t[$locale].continueLearning}</span>
				<span>&rarr;</span>
			</button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each MODULES as mod}
				{@const unlocked = $isAdminMode || isModuleUnlocked(mod.id, completedModules, $isAdminMode)}
				{#if unlocked}
					<a
						href="/{dbms}/{mod.id}"
						class="group relative block p-6 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-600 rounded-xl transition-all duration-150"
					>
						<div class="flex items-start justify-between gap-3 mb-2">
							<h2 class="text-base font-semibold text-white group-hover:text-zinc-100 transition-colors">
								{mod.title[$locale]}
							</h2>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if mod.id >= 10}
									<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-medium">
										PGlite WASM
									</span>
								{/if}
								{#if completedModules.includes(mod.id)}
									<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0 font-medium inline-flex items-center gap-1">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
										<span>{t[$locale].passed}</span>
									</span>
								{/if}
							</div>
						</div>
						<p class="text-xs text-zinc-400 leading-relaxed mb-6">
							{mod.description[$locale]}
						</p>
						<div class="flex items-center justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-zinc-800">
							<span>{t[$locale].randomQuestions(new Set(mod.questions.map(q => q.categorySlot)).size)}</span>
							<span class="text-white font-medium group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1 font-mono">
								{t[$locale].start}
							</span>
						</div>
					</a>
				{:else}
					<div
						class="relative block p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-xl cursor-not-allowed select-none transition-all"
					>
						<div class="flex items-start justify-between gap-3 mb-2">
							<h2 class="text-base font-medium text-zinc-400">
								{mod.title[$locale]}
							</h2>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if mod.id >= 10}
									<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium">
										PGlite WASM
									</span>
								{/if}
								<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-500 shrink-0 font-medium">
									{t[$locale].locked}
								</span>
							</div>
						</div>
						<p class="text-xs text-zinc-500 leading-relaxed mb-6">
							{mod.description[$locale]}
						</p>
						<div class="flex items-center justify-between text-xs font-mono text-zinc-600 pt-3 border-t border-zinc-900">
							<span>{t[$locale].unlockModule(mod.id - 1)}</span>
							<span>{t[$locale].locked}</span>
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Final Challenge Banner / Card -->
		<div class="mt-8 border-t border-zinc-900 pt-8">
			<div
				class="relative rounded-xl p-6 transition-all {isExamOpen
					? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-700 shadow-lg'
					: 'bg-zinc-950/90 border border-zinc-800/80 cursor-not-allowed'}"
			>
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-3">
						<span class="text-xs font-mono px-2 py-0.5 rounded border {isExamOpen ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-zinc-800 bg-zinc-900 text-zinc-500'}">
							{t[$locale].finalBossBadge}
						</span>
						<h3 class="text-base font-semibold {isExamOpen ? 'text-white' : 'text-zinc-400'}">
							{t[$locale].challengeTitle}
						</h3>
					</div>
					<div class="flex items-center gap-2">
						{#if challengePassed}
							<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0 font-medium inline-flex items-center gap-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
								<span>{t[$locale].passed}</span>
							</span>
						{/if}
						<span class="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 {isExamOpen ? 'text-zinc-300' : 'text-zinc-500'}">
							{isExamOpen ? ($locale === 'id' ? 'TERBUKA' : 'UNLOCKED') : t[$locale].locked.toUpperCase()}
						</span>
					</div>
				</div>

				<p class="text-xs {isExamOpen ? 'text-zinc-300' : 'text-zinc-500'} mb-6 max-w-2xl leading-relaxed">
					{t[$locale].challengeDesc}
				</p>

				<div class="pt-4 border-t {isExamOpen ? 'border-zinc-800' : 'border-zinc-900'} flex items-center justify-between text-xs font-mono">
					<span class="{isExamOpen ? 'text-zinc-400' : 'text-zinc-600'}">
						{isExamOpen 
							? t[$locale].challengeTasksCount
							: t[$locale].challengeUnlockCondition}
					</span>

					{#if isExamOpen}
						<a
							href="{base}/{dbms}/challenge"
							class="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5"
						>
							{t[$locale].challengeStartBtn}
						</a>
					{:else}
						<span class="text-zinc-600 font-mono">
							{t[$locale].challengeLockedBtn}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
