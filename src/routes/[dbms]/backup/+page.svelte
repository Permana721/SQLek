<script lang="ts">
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { createDbEngine, type IDbEngine, type DbResult } from '$lib/db/engine';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { locale, t } from '$lib/data/locale';

	const dbms = $derived(page.params.dbms === 'mysql' ? 'mysql' : 'postgres');
	const dbmsTitle = $derived(dbms === 'postgres' ? 'PostgreSQL' : 'MySQL');

	let engineInstance: IDbEngine | null = null;
	let isInitializing = $state(true);
	let isExporting = $state(false);
	let isRestoring = $state(false);
	let selectedFile = $state<File | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let feedback = $state<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

	let inspectionTables = $state<{ name: string; count: number }[]>([]);
	let inspectionSql = $state('SELECT * FROM products LIMIT 5;');
	let inspectionResult = $state<DbResult | null>(null);
	let inspectionError = $state<string | null>(null);

	async function initEngine() {
		isInitializing = true;
		if (engineInstance) {
			await engineInstance.destroy();
		}
		engineInstance = createDbEngine(dbms);
		await engineInstance.init(`
			CREATE TABLE IF NOT EXISTS products (
				id SERIAL PRIMARY KEY,
				name VARCHAR(100),
				category VARCHAR(50),
				price NUMERIC(10, 2)
			);
			INSERT INTO products (name, category, price) VALUES
				('Mechanical Keyboard', 'Electronics', 150),
				('Ergonomic Mouse', 'Electronics', 80),
				('Standing Desk', 'Furniture', 600)
			ON CONFLICT DO NOTHING;
		`);
		isInitializing = false;
		await refreshInspection();
	}

	async function refreshInspection() {
		if (!engineInstance) return;
		try {
			if (dbms === 'postgres') {
				const tablesRes = await engineInstance.query(`
					SELECT table_name 
					FROM information_schema.tables 
					WHERE table_schema = 'public' 
					ORDER BY table_name;
				`);
				const items: { name: string; count: number }[] = [];
				for (const r of tablesRes.rows) {
					try {
						const cRes = await engineInstance.query(`SELECT COUNT(*) AS c FROM "${r.table_name}";`);
						items.push({ name: r.table_name, count: Number(cRes.rows[0]?.c || 0) });
					} catch {
						items.push({ name: r.table_name, count: 0 });
					}
				}
				inspectionTables = items;
			}
		} catch (e: any) {
			console.error('Inspection error:', e);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
			feedback = null;
		}
	}

	async function handleExport() {
		if (!engineInstance || !engineInstance.dumpDataDir) {
			feedback = { type: 'error', text: t[$locale].backupOnlyPostgresNotice };
			return;
		}

		isExporting = true;
		feedback = null;
		try {
			const dump = await engineInstance.dumpDataDir('none');
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `sqlek-backup-${timestamp}.tar`;

			const url = URL.createObjectURL(dump);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			feedback = { type: 'success', text: t[$locale].exportSuccess };
		} catch (err: any) {
			feedback = { type: 'error', text: err?.message || 'Export failed.' };
		} finally {
			isExporting = false;
		}
	}

	async function handleRestore() {
		if (!selectedFile || !engineInstance || !engineInstance.loadDataDir) return;

		isRestoring = true;
		feedback = null;
		try {
			await engineInstance.loadDataDir(selectedFile);
			feedback = { type: 'success', text: t[$locale].restoreSuccess };
			selectedFile = null;
			if (fileInputRef) fileInputRef.value = '';
			await refreshInspection();
		} catch (err: any) {
			feedback = { type: 'error', text: t[$locale].restoreError };
		} finally {
			isRestoring = false;
		}
	}

	async function handleRunInspection() {
		if (!engineInstance) return;
		inspectionError = null;
		inspectionResult = null;
		try {
			inspectionResult = await engineInstance.query(inspectionSql);
		} catch (err: any) {
			inspectionError = err?.message || 'Query execution error.';
		}
	}

	$effect(() => {
		initEngine();
	});

	onDestroy(() => {
		if (engineInstance) {
			engineInstance.destroy();
		}
	});
</script>

<svelte:head>
	<title>SQLek | {t[$locale].backupRestoreTitle} ({dbmsTitle})</title>
</svelte:head>

<div class="min-h-screen bg-black text-white bg-dot-grid relative flex flex-col">
	<header class="w-full border-b border-zinc-850 bg-black/80 backdrop-blur-md sticky top-0 z-30">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
			<div class="flex items-center gap-3 sm:gap-4">
				<Logo />
				<div class="h-4 w-px bg-zinc-850"></div>
				<a
					href="/{dbms}"
					class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					<span>{t[$locale].backToModules}</span>
				</a>
			</div>

			<div class="flex items-center gap-2">
				<LanguageToggle />
				<UserMenu engine={dbms} />
			</div>
		</div>
	</header>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
		<div class="mb-8">
			<div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
				<span>{dbmsTitle} PGlite WASM &bull; pg_dump / psql</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white capitalize">
				{t[$locale].backupRestoreTitle}
			</h1>
			<p class="text-sm text-zinc-400 font-mono mt-1">
				{t[$locale].backupRestoreSubtitle}
			</p>
		</div>

		<!-- Concept Comparison Card -->
		<div class="p-5 rounded-xl bg-zinc-950 border border-zinc-800 mb-8 space-y-3">
			<h2 class="text-sm font-semibold text-zinc-200">
				CLI vs Browser WASM Architecture
			</h2>
			<p class="text-xs text-zinc-400 leading-relaxed">
				{t[$locale].backupRestoreDesc}
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
				<div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
					<div class="text-emerald-400 font-semibold flex items-center gap-1.5">
						<span>Standard CLI (pg_dump)</span>
					</div>
					<code class="text-zinc-300 block text-[11px] bg-black/60 p-2 rounded">
						$ pg_dump -U postgres dbname &gt; backup.tar
					</code>
					<p class="text-[11px] text-zinc-500 pt-1">
						Extracts catalog definitions & table data across OS process boundaries.
					</p>
				</div>

				<div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
					<div class="text-sky-400 font-semibold flex items-center gap-1.5">
						<span>Browser WASM (PGlite dumpDataDir)</span>
					</div>
					<code class="text-zinc-300 block text-[11px] bg-black/60 p-2 rounded">
						await db.dumpDataDir('none') // returns .tar
					</code>
					<p class="text-[11px] text-zinc-500 pt-1">
						Directly bundles the browser virtual file system into a portable archive.
					</p>
				</div>
			</div>
		</div>

		{#if dbms !== 'postgres'}
			<div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-8 flex items-start gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
				<span>{t[$locale].backupOnlyPostgresNotice}</span>
			</div>
		{/if}

		{#if feedback}
			<div
				class="p-4 rounded-xl text-xs mb-8 flex items-center gap-2 {feedback.type === 'success'
					? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
					: 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}"
			>
				<span>{feedback.text}</span>
			</div>
		{/if}

		<!-- Action Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			<!-- Export Card -->
			<div class="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-4">
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-zinc-100 font-semibold text-base">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						<span>{t[$locale].exportCardTitle}</span>
					</div>
					<p class="text-xs text-zinc-400 leading-relaxed">
						{t[$locale].exportCardDesc}
					</p>
				</div>

				<button
					type="button"
					onclick={handleExport}
					disabled={isExporting || isRestoring || dbms !== 'postgres' || isInitializing}
					class="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
				>
					{#if isExporting}
						<span>{t[$locale].exporting}</span>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						<span>{t[$locale].exportDatabaseBtn}</span>
					{/if}
				</button>
			</div>

			<!-- Restore Card -->
			<div class="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-4">
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-zinc-100 font-semibold text-base">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<span>{t[$locale].restoreCardTitle}</span>
					</div>
					<p class="text-xs text-zinc-400 leading-relaxed">
						{t[$locale].restoreCardDesc}
					</p>
				</div>

				<div class="space-y-3">
					<input
						type="file"
						accept=".tar,.tar.gz,application/x-tar"
						bind:this={fileInputRef}
						onchange={handleFileSelect}
						disabled={isRestoring || isExporting || dbms !== 'postgres' || isInitializing}
						class="block w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-700 file:text-xs file:font-mono file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed"
					/>

					<button
						type="button"
						onclick={handleRestore}
						disabled={!selectedFile || isRestoring || isExporting || dbms !== 'postgres' || isInitializing}
						class="w-full px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
					>
						{#if isRestoring}
							<span>{t[$locale].restoring}</span>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<span>{t[$locale].restoreDatabaseBtn}</span>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Table Catalog & Live Query Playground -->
		<div class="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-semibold text-zinc-200">
					Current Database Tables & Row Counts
				</h3>
				<button
					type="button"
					onclick={refreshInspection}
					class="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
				>
					Refresh Catalog &circlearrowright;
				</button>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
				{#each inspectionTables as tbl}
					<div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs flex justify-between items-center">
						<span class="text-zinc-300 font-semibold">{tbl.name}</span>
						<span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px]">{tbl.count} rows</span>
					</div>
				{/each}
			</div>

			<div class="pt-3 border-t border-zinc-850 space-y-2">
				<label for="inspection-sql" class="text-xs font-mono text-zinc-400 block">Query Database</label>
				<div class="flex gap-2">
					<input
						id="inspection-sql"
						type="text"
						bind:value={inspectionSql}
						class="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-zinc-700"
					/>
					<button
						type="button"
						onclick={handleRunInspection}
						class="px-4 py-2 bg-white text-black font-semibold text-xs font-mono rounded-lg hover:bg-zinc-200 transition-colors"
					>
						Execute
					</button>
				</div>

				{#if inspectionError}
					<div class="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
						{inspectionError}
					</div>
				{/if}

				{#if inspectionResult && inspectionResult.rows.length > 0}
					<div class="overflow-x-auto max-h-48 border border-zinc-800 rounded-lg">
						<table class="w-full text-left text-xs font-mono border-collapse">
							<thead class="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
								<tr>
									{#each inspectionResult.columns as c}
										<th class="p-2 border-r last:border-r-0 border-zinc-800">{c}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each inspectionResult.rows as r}
									<tr class="border-b last:border-b-0 border-zinc-900">
										{#each inspectionResult.columns as c}
											<td class="p-2 border-r last:border-r-0 border-zinc-800 text-zinc-300">
												{r[c] !== null && r[c] !== undefined ? String(r[c]) : 'NULL'}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>
