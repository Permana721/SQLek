<script lang="ts">
	import { locale, type Locale } from '$lib/data/locale';

	function setLang(lang: Locale) {
		locale.setLocale(lang);
	}
</script>

<div class="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-mono">
	<button
		type="button"
		onclick={() => setLang('en')}
		class="px-2 py-0.5 rounded transition-colors {$locale === 'en' ? 'bg-zinc-800 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'}"
		aria-label="Switch language to English"
	>
		EN
	</button>
	<button
		type="button"
		onclick={() => setLang('id')}
		class="px-2 py-0.5 rounded transition-colors {$locale === 'id' ? 'bg-zinc-800 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'}"
		aria-label="Ganti bahasa ke Bahasa Indonesia"
	>
		ID
	</button>
</div>
