<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, t } from '$lib/data/locale';

	let {
		engine = 'postgres',
		onResetSession = () => {},
		onResetDatabase
	}: {
		engine?: 'postgres' | 'mysql';
		onResetSession?: () => void;
		onResetDatabase?: () => void;
	} = $props();

	let isOpen = $state(false);
	let menuRef: HTMLDivElement | null = null;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function handleReset() {
		isOpen = false;
		onResetSession();
	}

	function handleResetDb() {
		isOpen = false;
		onResetDatabase?.();
	}

	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (isOpen && menuRef && !menuRef.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		window.addEventListener('click', handleClickOutside);
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative inline-block text-left" bind:this={menuRef}>
	<button
		type="button"
		onclick={toggleMenu}
		aria-haspopup="true"
		aria-expanded={isOpen}
		aria-label="User Profile and Settings"
		class="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center focus:outline-none transition-colors"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-3.5 h-3.5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-60 origin-top-right rounded-lg bg-zinc-950 border border-zinc-850 shadow-2xl p-1 z-50 focus:outline-none"
			role="menu"
		>
			<div class="px-3 py-2 border-b border-zinc-850">
				<p class="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">{t[$locale].sessionInfo}</p>
				<p class="text-xs font-medium text-zinc-200 capitalize mt-0.5 font-mono">
					{t[$locale].engine}: PostgreSQL (PGlite)
				</p>
			</div>

			<div class="p-1">
				{#if onResetDatabase}
					<button
						type="button"
						onclick={handleResetDb}
						class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono rounded-md text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors text-left"
						role="menuitem"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-3.5 h-3.5 shrink-0 text-amber-400"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span>{t[$locale].resetDatabase}</span>
					</button>
				{/if}

				<button
					type="button"
					onclick={handleReset}
					class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors text-left"
					role="menuitem"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-3.5 h-3.5 shrink-0 text-red-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
					</svg>
					<span>{t[$locale].resetSession}</span>
				</button>
			</div>
		</div>
	{/if}
</div>
