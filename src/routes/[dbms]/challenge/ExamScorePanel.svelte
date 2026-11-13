<script lang="ts">
	import { locale } from '$lib/data/locale';
	import type { ExamScoringResult } from '$lib/exam/scoring';

	let {
		scoreResult,
		bestScore = 0
	}: {
		scoreResult: ExamScoringResult | null;
		bestScore?: number;
	} = $props();
</script>

{#if scoreResult}
	<div class="mt-3 p-3.5 rounded-lg border font-mono text-xs space-y-3 transition-all {scoreResult.passed
		? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
		: scoreResult.finalScore > 0
			? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
			: 'bg-red-950/20 border-red-800/60 text-red-300'}">
		
		<!-- Score Header -->
		<div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b {scoreResult.passed ? 'border-emerald-850' : scoreResult.finalScore > 0 ? 'border-amber-850' : 'border-red-900/60'}">
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full {scoreResult.passed ? 'bg-emerald-400 animate-pulse' : scoreResult.finalScore > 0 ? 'bg-amber-400' : 'bg-red-400'}"></span>
				<span class="font-bold text-sm">
					{scoreResult.passed ? 'PASSED (≥ 75%)' : scoreResult.finalScore > 0 ? 'RETRY REQUIRED (< 75%)' : 'INCORRECT RESULT'}
				</span>
			</div>
			<div class="flex items-center gap-3 text-[11px]">
				<span>Score: <strong class="text-sm font-bold {scoreResult.passed ? 'text-emerald-300' : 'text-amber-300'}">{scoreResult.finalScore}%</strong></span>
				<span class="text-zinc-400">|</span>
				<span class="text-zinc-300">Best: <strong class="font-bold text-white">{bestScore}%</strong></span>
			</div>
		</div>

		<!-- Error Message if Integrity / Gate failed -->
		{#if scoreResult.error}
			<div class="p-2 rounded bg-red-950/40 border border-red-900/50 text-red-300 text-xs">
				{scoreResult.error}
			</div>
		{/if}

		<!-- Plan Breakdown -->
		{#if scoreResult.costScore !== undefined && scoreResult.planScore !== undefined}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
				<div class="p-2 rounded bg-zinc-950/60 border border-zinc-850/80">
					<div class="text-zinc-400 text-[10px] uppercase">Cost Ratio</div>
					<div class="font-bold text-white mt-0.5">{scoreResult.costScore}%</div>
				</div>
				<div class="p-2 rounded bg-zinc-950/60 border border-zinc-850/80">
					<div class="text-zinc-400 text-[10px] uppercase">Plan Efficiency</div>
					<div class="font-bold text-white mt-0.5">{scoreResult.planScore}%</div>
				</div>
				<div class="p-2 rounded bg-zinc-950/60 border border-zinc-850/80">
					<div class="text-zinc-400 text-[10px] uppercase">Target Cost</div>
					<div class="font-bold text-zinc-300 mt-0.5">{scoreResult.referenceCost ?? '—'}</div>
				</div>
				<div class="p-2 rounded bg-zinc-950/60 border border-zinc-850/80">
					<div class="text-zinc-400 text-[10px] uppercase">Query Cost</div>
					<div class="font-bold {scoreResult.studentCost && scoreResult.referenceCost && scoreResult.studentCost > scoreResult.referenceCost * 1.5 ? 'text-amber-400' : 'text-zinc-300'} mt-0.5">
						{scoreResult.studentCost ?? '—'}
					</div>
				</div>
			</div>
		{/if}

		<!-- Structural Checks Breakdown -->
		{#if scoreResult.structuralChecks && scoreResult.structuralChecks.length > 0}
			<div class="space-y-1.5 pt-1">
				<div class="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Schema & Catalog Verification:</div>
				<div class="space-y-1">
					{#each scoreResult.structuralChecks as chk}
						<div class="flex items-center justify-between p-1.5 rounded text-xs {chk.passed ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/40' : 'bg-red-950/30 text-red-300 border border-red-900/40'}">
							<div class="flex items-center gap-2 truncate">
								{#if chk.passed}
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<line x1="18" y1="6" x2="6" y2="18"/>
										<line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
								{/if}
								<span class="truncate">{chk.description?.[$locale] || chk.sql}</span>
							</div>
							<span class="text-[10px] font-mono shrink-0 ml-2 font-bold">{chk.weight} pts</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Plan Symptom Hints -->
		{#if scoreResult.symptoms && scoreResult.symptoms.length > 0}
			<div class="space-y-1.5 pt-1">
				<div class="text-[10px] uppercase tracking-wider text-amber-400/90 font-medium">Execution Plan Observations:</div>
				<ul class="space-y-1 text-[11px] text-zinc-300 list-disc list-inside">
					{#each scoreResult.symptoms as symptom}
						<li class="leading-relaxed text-amber-200/90">{symptom}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
