<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { MODULES } from '$lib/data/questions';
	import {
		clearProgress,
		resolveResumePath,
		isModulePassed,
		progressStore,
		getEngineResumeUrl
	} from '$lib/data/progress';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { locale, t } from '$lib/data/locale';

	let targetPgModule = $state(MODULES[0]);
	let targetMyModule = $state(MODULES[0]);
	let isPgCompleted1 = $state(false);
	let isMyCompleted1 = $state(false);
	let resumePgUrl = $state('/postgres/1?task=0');
	let resumeMyUrl = $state('/mysql/1?task=0');

	function updateEngineStates() {
		try {
			isPgCompleted1 = isModulePassed(1, 'postgres');
			isMyCompleted1 = isModulePassed(1, 'mysql');

			targetPgModule = MODULES.find((m) => !isModulePassed(m.id, 'postgres')) || MODULES[0];
			targetMyModule = MODULES.find((m) => !isModulePassed(m.id, 'mysql')) || MODULES[0];

			resumePgUrl = resolveResumePath('postgres');
			resumeMyUrl = resolveResumePath('mysql');
		} catch (e) {}
	}

	function handleSelectEngine(e: MouseEvent, engine: string) {
		e.preventDefault();
		const resumeUrl = resolveResumePath(engine);
		goto(resumeUrl);
	}

	function handleResetSession() {
		clearProgress('postgres');
		clearProgress('mysql');
		updateEngineStates();
	}

	onMount(() => {
		updateEngineStates();
	});

	$effect(() => {
		const _ = $progressStore;
		updateEngineStates();
	});
</script>

<svelte:head>
	<title>SQLek | Learn PostgreSQL & MySQL via WASM</title>
</svelte:head>

<div class="min-h-screen bg-black text-white bg-dot-grid relative flex flex-col">
	<header class="w-full border-b border-zinc-850 bg-black/80 backdrop-blur-md sticky top-0 z-30">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
			<Logo />
			<div class="flex items-center gap-3">
				<LanguageToggle />
				<UserMenu engine="postgres" onResetSession={handleResetSession} />
			</div>
		</div>
	</header>

	<main class="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 sm:py-24 max-w-4xl mx-auto w-full relative z-10">

		<h1 class="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4 max-w-2xl">
			{t[$locale].heroTitle}
		</h1>
		<p class="text-sm sm:text-base text-zinc-400 max-w-xl mb-12 leading-relaxed font-normal">
			{t[$locale].heroSubtitle}
		</p>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
			<a
				href={resumePgUrl}
				onclick={(e) => handleSelectEngine(e, 'postgres')}
				class="group relative flex flex-col text-left p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-xl transition-all duration-200 cursor-pointer"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-sm text-zinc-200 group-hover:border-zinc-700 transition-colors">
						PG
					</div>
					<span class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850">
						PGlite WASM
					</span>
				</div>
				<h2 class="text-lg font-semibold text-white mb-1.5">{t[$locale].pgTitle}</h2>
				<p class="text-xs text-zinc-400 leading-relaxed mb-6 flex-1">
					{t[$locale].pgDesc}
				</p>
				<div class="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">
					<span>{isPgCompleted1 ? t[$locale].continueModule(targetPgModule.id) : t[$locale].startModule1}</span>
					<span class="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
				</div>
			</a>

			<a
				href={resumeMyUrl}
				onclick={(e) => handleSelectEngine(e, 'mysql')}
				class="group relative flex flex-col text-left p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-xl transition-all duration-200 cursor-pointer"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-sm text-zinc-200 group-hover:border-zinc-700 transition-colors">
						MY
					</div>
					<span class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850">
						sql.js WASM
					</span>
				</div>
				<h2 class="text-lg font-semibold text-white mb-1.5">{t[$locale].myTitle}</h2>
				<p class="text-xs text-zinc-400 leading-relaxed mb-6 flex-1">
					{t[$locale].myDesc}
				</p>
				<div class="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">
					<span>{isMyCompleted1 ? t[$locale].continueModule(targetMyModule.id) : t[$locale].startModule1}</span>
					<span class="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
				</div>
			</a>
		</div>
	</main>
</div>