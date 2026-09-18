<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { clearProgress } from '$lib/data/progress';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { locale, t } from '$lib/data/locale';

	let lastPgModule = $state(1);
	let lastMyModule = $state(1);

	function checkSavedModules() {
		try {
			const savedPg = localStorage.getItem('sql_active_module_postgres');
			const savedMy = localStorage.getItem('sql_active_module_mysql');
			lastPgModule = savedPg ? Math.max(1, Number(savedPg)) : 1;
			lastMyModule = savedMy ? Math.max(1, Number(savedMy)) : 1;
		} catch (e) {}
	}

	function handleResetSession() {
		clearProgress('postgres');
		clearProgress('mysql');
		checkSavedModules();
	}

	onMount(() => {
		checkSavedModules();
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
				href="/postgres/{lastPgModule}"
				class="group relative flex flex-col text-left p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-xl transition-all duration-200"
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
					<span>{lastPgModule > 1 ? t[$locale].continueModule(lastPgModule) : t[$locale].startModule1}</span>
					<span class="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
				</div>
			</a>

			<a
				href="/mysql/{lastMyModule}"
				class="group relative flex flex-col text-left p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-xl transition-all duration-200"
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
					<span>{lastMyModule > 1 ? t[$locale].continueModule(lastMyModule) : t[$locale].startModule1}</span>
					<span class="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
				</div>
			</a>
		</div>
	</main>
</div>