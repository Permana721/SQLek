<script lang="ts">
	import { base } from '$app/paths';
	import { isAdminMode, toggleAdminMode } from '$lib/data/progress';

	let {
		hideTextOnMobile = false
	}: {
		hideTextOnMobile?: boolean;
	} = $props();

	let clickCount = 0;
	let clickTimer: ReturnType<typeof setTimeout> | null = null;
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	function handleLogoClick(e: MouseEvent) {
		clickCount += 1;

		if (clickTimer) clearTimeout(clickTimer);

		clickTimer = setTimeout(() => {
			clickCount = 0;
		}, 1500); // Reset count if user stops clicking for 1.5s

		if (clickCount >= 5) {
			clickCount = 0;
			if (clickTimer) clearTimeout(clickTimer);

			const enabled = toggleAdminMode();
			toastMessage = enabled
				? 'Admin Mode: All modules and tasks unlocked!'
				: 'Admin Mode: Reset to standard progression.';
			showToast = true;

			if (toastTimer) clearTimeout(toastTimer);
			toastTimer = setTimeout(() => {
				showToast = false;
			}, 3000);
		}
	}
</script>

<!-- Logo link with click counter -->
<button
	type="button"
	onclick={handleLogoClick}
	class="inline-flex items-center gap-2 cursor-pointer focus:outline-none select-none bg-transparent border-none p-0 group"
	aria-label="SQLek Logo"
>
	<img src="{base}/sql.png" alt="SQLek Logo" class="h-6 w-auto object-contain" />
	<span
		class="font-mono font-bold text-sm text-zinc-100 tracking-tight group-hover:text-white transition-colors {hideTextOnMobile
			? 'hidden sm:inline'
			: ''}"
	>
		SQLek
	</span>
	{#if $isAdminMode}
		<span
			class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
		>
			ADMIN
		</span>
	{/if}
</button>

{#if showToast}
	<div
		class="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 transition-opacity duration-300"
		role="status"
	>
		<span>{toastMessage}</span>
	</div>
{/if}
