<script lang="ts">
	import { locale, t } from '$lib/data/locale';
	import type { IDbEngine } from '$lib/db/engine';

	let {
		isOpen = false,
		engine = 'postgres',
		activeEngine = null,
		onClose = () => {},
		onRestored = () => {}
	}: {
		isOpen?: boolean;
		engine?: 'postgres' | 'mysql';
		activeEngine?: IDbEngine | null;
		onClose?: () => void;
		onRestored?: (engine: IDbEngine) => void | Promise<void>;
	} = $props();

	let isExporting = $state(false);
	let isRestoring = $state(false);
	let selectedFile = $state<File | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let feedbackMessage = $state<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
			feedbackMessage = null;
		}
	}

	async function handleExport() {
		if (!activeEngine || !activeEngine.dumpDataDir) {
			feedbackMessage = { type: 'error', text: t[$locale].backupOnlyPostgresNotice };
			return;
		}

		isExporting = true;
		feedbackMessage = null;
		try {
			const dump = await activeEngine.dumpDataDir('none');
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

			feedbackMessage = { type: 'success', text: t[$locale].exportSuccess };
		} catch (err: any) {
			console.error('Export failed:', err);
			feedbackMessage = { type: 'error', text: err?.message || 'Export failed.' };
		} finally {
			isExporting = false;
		}
	}

	async function handleRestore() {
		if (!selectedFile) return;
		if (!activeEngine || !activeEngine.loadDataDir) {
			feedbackMessage = { type: 'error', text: t[$locale].backupOnlyPostgresNotice };
			return;
		}

		isRestoring = true;
		feedbackMessage = null;
		try {
			await activeEngine.loadDataDir(selectedFile);
			await onRestored?.(activeEngine);
			feedbackMessage = { type: 'success', text: t[$locale].restoreSuccess };
			selectedFile = null;
			if (fileInputRef) {
				fileInputRef.value = '';
			}
		} catch (err: any) {
			console.error('Restore failed:', err);
			feedbackMessage = { type: 'error', text: t[$locale].restoreError };
		} finally {
			isRestoring = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="backup-restore-modal-title"
	>
		<div class="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
					<div>
						<h2 id="backup-restore-modal-title" class="text-base font-semibold text-zinc-100 flex items-center gap-2">
							{t[$locale].backupRestoreTitle}
							<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
								pg_dump / psql
							</span>
						</h2>
						<p class="text-xs text-zinc-400 font-mono">
							{t[$locale].backupRestoreSubtitle}
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={onClose}
					aria-label={t[$locale].closeBtn}
					class="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Body -->
			<div class="p-6 space-y-5 overflow-y-auto">
				<!-- Context explanation banner -->
				<div class="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
					<p>{t[$locale].backupRestoreDesc}</p>
					<div class="mt-2.5 p-2 rounded bg-black/60 font-mono text-[11px] text-zinc-400 space-y-1">
						<div class="flex items-center gap-2">
							<span class="text-emerald-400 font-semibold shrink-0">pg_dump:</span>
							<code class="text-zinc-200">pg_dump -U postgres dbname &gt; sqlek-backup.tar</code>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sky-400 font-semibold shrink-0">psql:</span>
							<code class="text-zinc-200">psql -U postgres -d dbname &lt; sqlek-backup.tar</code>
						</div>
					</div>
				</div>

				{#if engine !== 'postgres'}
					<div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
							<line x1="12" y1="9" x2="12" y2="13" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
						<span>{t[$locale].backupOnlyPostgresNotice}</span>
					</div>
				{/if}

				{#if feedbackMessage}
					<div
						class="p-3 rounded-lg text-xs flex items-center gap-2 {feedbackMessage.type === 'success'
							? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
							: 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}"
					>
						{#if feedbackMessage.type === 'success'}
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
						{/if}
						<span>{feedbackMessage.text}</span>
					</div>
				{/if}

				<!-- Actions Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Export Card -->
					<div class="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
						<div>
							<div class="flex items-center gap-2 text-zinc-200 text-sm font-semibold">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								<span>{t[$locale].exportCardTitle}</span>
							</div>
							<p class="text-xs text-zinc-400 mt-1.5 leading-relaxed">
								{t[$locale].exportCardDesc}
							</p>
						</div>

						<button
							type="button"
							onclick={handleExport}
							disabled={isExporting || isRestoring || engine !== 'postgres'}
							class="w-full px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
						>
							{#if isExporting}
								<svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>{t[$locale].exporting}</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								<span>{t[$locale].exportDatabaseBtn}</span>
							{/if}
						</button>
					</div>

					<!-- Restore Card -->
					<div class="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
						<div>
							<div class="flex items-center gap-2 text-zinc-200 text-sm font-semibold">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" y1="3" x2="12" y2="15" />
								</svg>
								<span>{t[$locale].restoreCardTitle}</span>
							</div>
							<p class="text-xs text-zinc-400 mt-1.5 leading-relaxed">
								{t[$locale].restoreCardDesc}
							</p>
						</div>

						<div class="space-y-2">
							<input
								type="file"
								accept=".tar,.tar.gz,application/x-tar"
								bind:this={fileInputRef}
								onchange={handleFileSelect}
								disabled={isRestoring || isExporting || engine !== 'postgres'}
								class="block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border file:border-zinc-700 file:text-[11px] file:font-mono file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed"
							/>

							<button
								type="button"
								onclick={handleRestore}
								disabled={!selectedFile || isRestoring || isExporting || engine !== 'postgres'}
								class="w-full px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
							>
								{#if isRestoring}
									<svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>{t[$locale].restoring}</span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
			</div>

			<!-- Footer -->
			<div class="px-6 py-3.5 border-t border-zinc-800 flex justify-end bg-zinc-900/30">
				<button
					type="button"
					onclick={onClose}
					class="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
				>
					{t[$locale].closeBtn}
				</button>
			</div>
		</div>
	</div>
{/if}
