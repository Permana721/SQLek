<script lang="ts">
	import type { PlanExecutionSummary, EnrichedPlanNode } from '$lib/exam/planVisualizer';
	import { locale, t } from '$lib/data/locale';

	interface Props {
		planSummary: PlanExecutionSummary;
	}

	let { planSummary }: Props = $props();

	let selectedNode = $state<EnrichedPlanNode | null>(null);
	let collapsedNodeIds = $state<Set<string>>(new Set());

	// Default to root node selected
	$effect(() => {
		if (planSummary?.rootNode && !selectedNode) {
			selectedNode = planSummary.rootNode;
		}
	});

	function toggleCollapse(nodeId: string, e: MouseEvent) {
		e.stopPropagation();
		const next = new Set(collapsedNodeIds);
		if (next.has(nodeId)) {
			next.delete(nodeId);
		} else {
			next.add(nodeId);
		}
		collapsedNodeIds = next;
	}

	function handleExpandAll() {
		collapsedNodeIds = new Set();
	}

	function handleCollapseAll() {
		const allIds = new Set<string>();
		function collect(n: EnrichedPlanNode) {
			if (n.plans.length > 0) {
				allIds.add(n.id);
				n.plans.forEach(collect);
			}
		}
		if (planSummary?.rootNode) {
			collect(planSummary.rootNode);
		}
		collapsedNodeIds = allIds;
	}

	function selectNode(node: EnrichedPlanNode) {
		selectedNode = node;
	}
</script>

{#snippet renderNodeIcon(nodeType: string, customClass: string = 'w-4 h-4')}
	{@const lower = nodeType.toLowerCase()}
	{#if lower.includes('index')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
		</svg>
	{:else if lower.includes('seq scan')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
		</svg>
	{:else if lower.includes('join')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/>
		</svg>
	{:else if lower.includes('sort')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
		</svg>
	{:else if lower.includes('aggregate')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M4 4h16l-8 8 8 8H4"/>
		</svg>
	{:else if lower.includes('cte') || lower.includes('subplan')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
		</svg>
	{:else if lower.includes('scan')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
		</svg>
	{:else if lower.includes('limit')}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" class="{customClass} text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
		</svg>
	{/if}
{/snippet}

<div class="flex flex-col h-full bg-zinc-950 text-zinc-300 font-sans border border-zinc-850 rounded-lg overflow-hidden select-none">
	<!-- Top Summary Banner -->
	<div class="px-3.5 py-2.5 bg-zinc-900/80 border-b border-zinc-850 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
		<div class="flex items-center gap-3 flex-wrap">
			<span class="inline-flex items-center gap-1.5 text-zinc-100 font-bold uppercase tracking-wider text-[11px]">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="7" height="7" rx="1"/>
					<rect x="14" y="3" width="7" height="7" rx="1"/>
					<rect x="14" y="14" width="7" height="7" rx="1"/>
					<path d="M10 6.5h4M6.5 10v7h7.5"/>
				</svg>
				{t[$locale].executionPlan}
			</span>

			<div class="flex items-center gap-2 text-[11px]">
				<span class="text-zinc-500">|</span>
				<span>Total Cost: <strong class="text-amber-400">{planSummary.totalCost.toFixed(2)}</strong></span>

				{#if planSummary.executionTime !== undefined}
					<span class="text-zinc-500">|</span>
					<span>Exec: <strong class="text-emerald-400">{planSummary.executionTime.toFixed(3)} ms</strong></span>
				{/if}

				{#if planSummary.planningTime !== undefined}
					<span class="text-zinc-500">|</span>
					<span>Plan: <strong class="text-zinc-300">{planSummary.planningTime.toFixed(3)} ms</strong></span>
				{/if}

				{#if planSummary.bufferSummary}
					<span class="text-zinc-500">|</span>
					<span>Cache Hit: <strong class="{planSummary.bufferSummary.hitRatio >= 90 ? 'text-emerald-400' : 'text-amber-400'}">{planSummary.bufferSummary.hitRatio}%</strong></span>
				{/if}
			</div>
		</div>

		<!-- Warning badge & Tree Controls -->
		<div class="flex items-center gap-2">
			{#if planSummary.warningCount > 0}
				<span class="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
					<span>{planSummary.warningCount} {planSummary.warningCount === 1 ? 'Bottleneck' : 'Bottlenecks'}</span>
				</span>
			{:else}
				<span class="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-medium flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
					<span>Optimal Tree</span>
				</span>
			{/if}

			<button
				type="button"
				onclick={handleExpandAll}
				class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-colors"
			>
				{t[$locale].expandAll}
			</button>
			<button
				type="button"
				onclick={handleCollapseAll}
				class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-colors"
			>
				{t[$locale].collapseAll}
			</button>
		</div>
	</div>

	<!-- Main Body: Split Tree Visualizer & Node Inspector Drawer -->
	<div class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
		<!-- Left: Interactive Hierarchical Plan Tree -->
		<div class="flex-1 overflow-auto p-3.5 space-y-1 bg-black/60 font-mono text-xs border-b lg:border-b-0 lg:border-r border-zinc-850">
			{#snippet renderTreeNode(node: EnrichedPlanNode, depth: number)}
				{@const isCollapsed = collapsedNodeIds.has(node.id)}
				{@const isSelected = selectedNode?.id === node.id}
				{@const hasChildren = node.plans && node.plans.length > 0}

				<div class="relative flex flex-col select-none" style="margin-left: {depth * 18}px;">
					<!-- Node Card -->
					<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
					<div
						role="button"
						tabindex="0"
						onclick={() => selectNode(node)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(node); } }}
						class="flex items-center justify-between gap-2 p-2 rounded-md border transition-all cursor-pointer my-0.5 {isSelected
							? 'bg-zinc-900 border-cyan-400 ring-1 ring-cyan-500/40 shadow-lg'
							: node.health === 'warning'
								? 'bg-red-950/15 border-red-900/50 hover:bg-red-950/25'
								: node.health === 'good'
									? 'bg-zinc-950 border-emerald-900/40 hover:bg-zinc-900/50'
									: 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/40'}"
					>
						<!-- Left Side: Expand button + Icon + Operation Title -->
						<div class="flex items-center gap-2 min-w-0">
							{#if hasChildren}
								<button
									type="button"
									onclick={(e) => toggleCollapse(node.id, e)}
									class="w-4 h-4 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold shrink-0"
								>
									{isCollapsed ? '+' : '−'}
								</button>
							{:else}
								<span class="w-4 h-4 shrink-0"></span>
							{/if}

							<span class="shrink-0" title={node.nodeType}>{@render renderNodeIcon(node.nodeType, 'w-4 h-4')}</span>

							<div class="flex items-center gap-1.5 min-w-0 truncate">
								<span class="font-bold text-[12px] {node.health === 'warning' ? 'text-red-300' : node.health === 'good' ? 'text-emerald-300' : 'text-zinc-100'}">
									{node.nodeType}
								</span>

								{#if node.relationName}
									<span class="text-zinc-400 text-[11px] truncate">
										on <strong class="text-zinc-200">{node.relationName}</strong>
									</span>
								{/if}

								{#if node.indexName}
									<span class="text-cyan-400/80 text-[10px] truncate">
										[{node.indexName}]
									</span>
								{/if}
							</div>
						</div>

						<!-- Right Side: Metrics & Visual Cost / Time Bar -->
						<div class="flex items-center gap-2 shrink-0">
							<!-- Warning Chip -->
							{#if node.warnings.length > 0}
								<span class="px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 text-[9px] font-bold flex items-center gap-1">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
										<line x1="12" y1="9" x2="12" y2="13" />
										<line x1="12" y1="17" x2="12.01" y2="17" />
									</svg>
									<span>{node.warnings.length}</span>
								</span>
							{/if}

							<!-- Cost & Time Progress Indicator -->
							<div class="flex flex-col items-end gap-0.5 min-w-[90px]">
								<div class="flex items-center gap-1 text-[10px]">
									<span class="text-zinc-500">cost</span>
									<span class="text-amber-400 font-bold">{node.totalCost.toFixed(1)}</span>
									<span class="text-[9px] text-zinc-400">({node.costPercent}%)</span>
								</div>

								<!-- Multi-tier Visual Bar: Subtree Cost (background) + Node Self Cost (foreground) -->
								<div
									class="w-20 h-1.5 rounded-full bg-zinc-850 overflow-hidden relative"
									title={`${t[$locale].inclusiveCost}: ${node.costPercent}% • ${t[$locale].exclusiveCost}: ${node.exclusiveCostPercent}%`}
								>
									<!-- Inclusive Subtree Bar -->
									<div
										class="absolute top-0 left-0 h-full bg-amber-500/40 rounded-full"
										style="width: {node.costPercent}%;"
									></div>
									<!-- Exclusive Node Self Bar -->
									<div
										class="absolute top-0 left-0 h-full bg-amber-400 rounded-full"
										style="width: {node.exclusiveCostPercent}%;"
									></div>
								</div>

								{#if node.actualTotalTime !== undefined}
									<div class="flex items-center gap-1 text-[9px] text-emerald-400/90">
										<span>{node.actualTotalTime.toFixed(2)} ms</span>
										{#if node.timePercent !== undefined}
											<span class="text-zinc-500">({node.timePercent}%)</span>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Rows badge -->
							<div class="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
								{node.actualRows !== undefined ? `${node.actualRows} act` : `${node.planRows} est`}
							</div>
						</div>
					</div>

					<!-- Child Nodes (if expanded) -->
					{#if !isCollapsed && hasChildren}
						<div class="border-l border-zinc-850/80 ml-2">
							{#each node.plans as child (child.id)}
								{@render renderTreeNode(child, depth + 1)}
							{/each}
						</div>
					{/if}
				</div>
			{/snippet}

			{#if planSummary.rootNode}
				{@render renderTreeNode(planSummary.rootNode, 0)}
			{/if}
		</div>

		<!-- Right: Node Inspector Drawer / Detail Panel -->
		<div class="w-full lg:w-[340px] bg-zinc-950 p-4 overflow-y-auto font-mono text-xs border-t lg:border-t-0 flex flex-col space-y-4">
			{#if selectedNode}
				<!-- Node Inspector Header -->
				<div class="pb-3 border-b border-zinc-850">
					<div class="flex items-center justify-between mb-1">
						<span class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-sans">
							{t[$locale].nodeInspector}
						</span>
						<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {selectedNode.health === 'warning'
							? 'bg-red-950/80 text-red-300 border border-red-800'
							: selectedNode.health === 'good'
								? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
								: 'bg-amber-950/80 text-amber-300 border border-amber-800'}">
							{selectedNode.health}
						</span>
					</div>

					<h4 class="text-sm font-bold text-white flex items-center gap-1.5">
						{@render renderNodeIcon(selectedNode.nodeType, 'w-4 h-4')}
						<span>{selectedNode.nodeType}</span>
					</h4>

					{#if selectedNode.relationName}
						<div class="text-xs text-zinc-400 mt-1">
							Relation: <strong class="text-zinc-200">{selectedNode.relationName}</strong>
							{#if selectedNode.alias && selectedNode.alias !== selectedNode.relationName}
								<span class="text-zinc-500"> (as {selectedNode.alias})</span>
							{/if}
						</div>
					{/if}

					{#if selectedNode.indexName}
						<div class="text-xs text-cyan-400 mt-0.5">
							Index: <strong>{selectedNode.indexName}</strong>
						</div>
					{/if}
				</div>

				<!-- Diagnostic Observations & Bottlenecks -->
				{#if selectedNode.warnings.length > 0}
					<div class="p-2.5 rounded-md bg-red-950/40 border border-red-900 text-red-300 space-y-1.5">
						<div class="text-[10px] uppercase tracking-wider font-bold text-red-400 flex items-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
								<line x1="12" y1="9" x2="12" y2="13" />
								<line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
							<span>{t[$locale].bottlenecks}</span>
						</div>
						<ul class="space-y-1 text-[11px] list-disc list-inside">
							{#each selectedNode.warnings as warn}
								<li class="leading-relaxed">{warn[$locale] || warn.en}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Planner Cost Breakdown -->
				<div class="space-y-2">
					<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center justify-between">
						<span>Planner Cost</span>
						<span class="text-zinc-600 font-normal">relative to root</span>
					</div>

					<div class="grid grid-cols-2 gap-2 text-[11px]">
						<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
							<div class="text-[10px] text-zinc-400">{t[$locale].inclusiveCost}</div>
							<div class="font-bold text-white text-xs mt-0.5">{selectedNode.totalCost.toFixed(2)}</div>
							<div class="text-[10px] text-amber-400 mt-0.5">{selectedNode.costPercent}% of query</div>
						</div>

						<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
							<div class="text-[10px] text-zinc-400">{t[$locale].exclusiveCost}</div>
							<div class="font-bold text-white text-xs mt-0.5">{selectedNode.exclusiveCost.toFixed(2)}</div>
							<div class="text-[10px] text-amber-300 mt-0.5">{selectedNode.exclusiveCostPercent}% self</div>
						</div>
					</div>

					<div class="text-[10px] text-zinc-500 flex justify-between px-1">
						<span>Startup Cost: {selectedNode.startupCost.toFixed(2)}</span>
						<span>Width: {selectedNode.planWidth} bytes</span>
					</div>
				</div>

				<!-- Execution Timing Breakdown (EXPLAIN ANALYZE) -->
				{#if selectedNode.actualTotalTime !== undefined}
					<div class="space-y-2">
						<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Execution Timing</div>

						<div class="grid grid-cols-2 gap-2 text-[11px]">
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
								<div class="text-[10px] text-zinc-400">{t[$locale].inclusiveTime}</div>
								<div class="font-bold text-emerald-400 text-xs mt-0.5">{selectedNode.actualTotalTime.toFixed(3)} ms</div>
								{#if selectedNode.timePercent !== undefined}
									<div class="text-[10px] text-zinc-400 mt-0.5">{selectedNode.timePercent}% of query</div>
								{/if}
							</div>

							<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
								<div class="text-[10px] text-zinc-400">{t[$locale].exclusiveTime}</div>
								<div class="font-bold text-emerald-300 text-xs mt-0.5">{selectedNode.exclusiveTime?.toFixed(3) ?? '—'} ms</div>
								{#if selectedNode.exclusiveTimePercent !== undefined}
									<div class="text-[10px] text-zinc-400 mt-0.5">{selectedNode.exclusiveTimePercent}% self</div>
								{/if}
							</div>
						</div>

						<div class="text-[10px] text-zinc-500 flex justify-between px-1">
							<span>Startup: {selectedNode.actualStartupTime?.toFixed(3) ?? '—'} ms</span>
							<span>{t[$locale].actualLoopsLabel}: {selectedNode.actualLoops ?? 1}</span>
						</div>
					</div>
				{/if}

				<!-- Row Processing & Discrepancies -->
				<div class="space-y-1.5">
					<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Row Processing</div>

					<div class="grid grid-cols-2 gap-2 text-[11px]">
						<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
							<div class="text-[10px] text-zinc-400">{t[$locale].planEstimatedRows}</div>
							<div class="font-bold text-zinc-200 mt-0.5">{selectedNode.planRows}</div>
						</div>

						<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
							<div class="text-[10px] text-zinc-400">{t[$locale].actualRowsLabel}</div>
							<div class="font-bold {selectedNode.actualRows !== undefined && Math.abs(selectedNode.actualRows - selectedNode.planRows) > 50 ? 'text-amber-400' : 'text-zinc-200'} mt-0.5">
								{selectedNode.actualRows !== undefined ? selectedNode.actualRows : '—'}
							</div>
						</div>
					</div>

					{#if selectedNode.rowsRemovedByFilter !== undefined && selectedNode.rowsRemovedByFilter > 0}
						<div class="p-1.5 rounded bg-zinc-900 border border-zinc-850 text-[10px] text-amber-300/90 flex justify-between">
							<span>Rows Discarded by Filter:</span>
							<strong>{selectedNode.rowsRemovedByFilter}</strong>
						</div>
					{/if}
				</div>

				<!-- Buffer Cache Statistics -->
				{#if selectedNode.sharedHitBlocks !== undefined || selectedNode.sharedReadBlocks !== undefined}
					<div class="space-y-1.5">
						<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{t[$locale].sharedBuffers}</div>

						<div class="grid grid-cols-2 gap-2 text-[11px]">
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
								<div class="text-[10px] text-emerald-400">Cache Hits</div>
								<div class="font-bold text-white mt-0.5">{selectedNode.sharedHitBlocks ?? 0} blocks</div>
							</div>

							<div class="p-2 rounded bg-zinc-900 border border-zinc-850">
								<div class="text-[10px] text-amber-400">Disk Reads</div>
								<div class="font-bold text-white mt-0.5">{selectedNode.sharedReadBlocks ?? 0} blocks</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Conditions & Predicates -->
				{#if selectedNode.filter || selectedNode.indexCond || selectedNode.hashCond || selectedNode.mergeCond || selectedNode.recheckCond || selectedNode.sortKey}
					<div class="space-y-2 pt-1 border-t border-zinc-850">
						<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Predicates & Keys</div>

						{#if selectedNode.filter}
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850 space-y-0.5">
								<div class="text-[9px] text-zinc-500 uppercase">{t[$locale].filterCondition}</div>
								<div class="text-zinc-200 text-xs break-all font-mono">{selectedNode.filter}</div>
							</div>
						{/if}

						{#if selectedNode.indexCond}
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850 space-y-0.5">
								<div class="text-[9px] text-cyan-400 uppercase">{t[$locale].indexCondition}</div>
								<div class="text-cyan-200 text-xs break-all font-mono">{selectedNode.indexCond}</div>
							</div>
						{/if}

						{#if selectedNode.hashCond}
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850 space-y-0.5">
								<div class="text-[9px] text-purple-400 uppercase">{t[$locale].hashCondition}</div>
								<div class="text-purple-200 text-xs break-all font-mono">{selectedNode.hashCond}</div>
							</div>
						{/if}

						{#if selectedNode.sortKey}
							<div class="p-2 rounded bg-zinc-900 border border-zinc-850 space-y-0.5">
								<div class="text-[9px] text-amber-400 uppercase">{t[$locale].sortDetails}</div>
								<div class="text-zinc-200 text-xs font-mono">{selectedNode.sortKey.join(', ')}</div>
								{#if selectedNode.sortMethod}
									<div class="text-[10px] text-zinc-400 mt-1">
										Method: {selectedNode.sortMethod} ({selectedNode.sortSpaceType || 'Memory'}: {selectedNode.sortSpaceUsed || 0} kB)
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-500 text-xs">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-2 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<p>{t[$locale].selectNodeHint}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Bottom Legend Bar -->
	<div class="px-3.5 py-1.5 bg-zinc-900 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400 flex-wrap gap-2">
		<div class="flex items-center gap-3">
			<span class="flex items-center gap-1">
				<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
				<span>Index Access (Efficient)</span>
			</span>
			<span class="flex items-center gap-1">
				<span class="w-2 h-2 rounded-full bg-amber-400"></span>
				<span>Join / Sort / Agg</span>
			</span>
			<span class="flex items-center gap-1">
				<span class="w-2 h-2 rounded-full bg-red-400"></span>
				<span>Bottleneck Warning</span>
			</span>
		</div>

		<span class="text-zinc-500 hidden sm:inline" title={t[$locale].costTooltip}>
			Bar width = Subtree Cost % • Inner bar = Node Self Cost %
		</span>
	</div>
</div>
