<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { DatabaseSchema, TableEntity, ForeignKeyRelationship } from '$lib/db/schema';
	import { locale, t } from '$lib/data/locale';

	interface Props {
		schema: DatabaseSchema;
		dbms?: 'postgres' | 'mysql';
		onRefresh?: () => void;
	}

	let { schema, dbms = 'postgres', onRefresh }: Props = $props();

	const CARD_WIDTH = 250;
	const HEADER_HEIGHT = 38;
	const ROW_HEIGHT = 28;
	const PADDING_BOTTOM = 8;

	let containerRef = $state<HTMLDivElement | null>(null);

	// Pan & Zoom state
	let pan = $state<{ x: number; y: number }>({ x: 30, y: 30 });
	let zoom = $state<number>(0.95);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0 };

	// Dragging table cards state
	let positions = $state<Record<string, { x: number; y: number }>>({});
	let draggingTable = $state<string | null>(null);
	let dragStart = { mouseX: 0, mouseY: 0, tableX: 0, tableY: 0 };

	// Hover highlighting state
	let hoveredRel = $state<ForeignKeyRelationship | null>(null);
	let hoveredCol = $state<{ table: string; column: string } | null>(null);
	let hoveredTable = $state<string | null>(null);

	// Calculate table heights
	function getTableHeight(table: TableEntity): number {
		return HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + PADDING_BOTTOM;
	}

	// Auto-layout positioning (topological / multi-column grid)
	function calculateAutoLayout(tables: TableEntity[], relationships: ForeignKeyRelationship[]) {
		if (!tables || tables.length === 0) return {};

		const newPositions: Record<string, { x: number; y: number }> = {};
		
		// Map table dependency depths
		const incomingMap: Record<string, string[]> = {};
		tables.forEach((t) => {
			incomingMap[t.name] = [];
		});
		relationships.forEach((rel) => {
			if (incomingMap[rel.sourceTable] && rel.targetTable !== rel.sourceTable) {
				incomingMap[rel.sourceTable].push(rel.targetTable);
			}
		});

		// Compute layer/depth for each table
		const depthMap: Record<string, number> = {};
		function getDepth(tableName: string, visited = new Set<string>()): number {
			if (visited.has(tableName)) return 0;
			visited.add(tableName);
			const parents = incomingMap[tableName] || [];
			if (parents.length === 0) return 0;
			let maxParentDepth = 0;
			for (const p of parents) {
				maxParentDepth = Math.max(maxParentDepth, getDepth(p, new Set(visited)) + 1);
			}
			return maxParentDepth;
		}

		tables.forEach((t) => {
			depthMap[t.name] = getDepth(t.name);
		});

		// Group by depth
		const depthColumns: Record<number, TableEntity[]> = {};
		tables.forEach((t) => {
			const d = depthMap[t.name] || 0;
			if (!depthColumns[d]) depthColumns[d] = [];
			depthColumns[d].push(t);
		});

		const columnGap = 130;
		const rowGap = 35;
		const startX = 40;
		const startY = 40;

		const sortedDepths = Object.keys(depthColumns).map(Number).sort((a, b) => a - b);
		sortedDepths.forEach((depth, colIdx) => {
			const colTables = depthColumns[depth];
			let currentY = startY;
			colTables.forEach((table) => {
				newPositions[table.name] = {
					x: startX + colIdx * (CARD_WIDTH + columnGap),
					y: currentY
				};
				currentY += getTableHeight(table) + rowGap;
			});
		});

		return newPositions;
	}

	// Synchronize positions when schema changes
	$effect(() => {
		const tables = schema?.tables || [];
		const currentKeys = Object.keys(positions);
		const newKeys = tables.map((t) => t.name);
		const needsReInit =
			newKeys.length !== currentKeys.length ||
			newKeys.some((k) => !currentKeys.includes(k));

		if (needsReInit && tables.length > 0) {
			positions = calculateAutoLayout(tables, schema?.relationships || []);
			autoCenter();
		}
	});

	function autoCenter() {
		pan = { x: 40, y: 40 };
		zoom = 0.95;
	}

	function handleAutoLayout() {
		if (!schema?.tables || schema.tables.length === 0) return;
		positions = calculateAutoLayout(schema.tables, schema.relationships || []);
		autoCenter();
	}

	// Zoom Controls
	function handleZoomIn() {
		zoom = Math.min(2.0, Number((zoom + 0.15).toFixed(2)));
	}

	function handleZoomOut() {
		zoom = Math.max(0.4, Number((zoom - 0.15).toFixed(2)));
	}

	function handleResetZoom() {
		autoCenter();
	}

	// Canvas Pan & Zoom Wheel
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (!containerRef) return;
		const rect = containerRef.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const factor = e.deltaY < 0 ? 1.08 : 0.92;
		const newZoom = Math.max(0.4, Math.min(2.0, zoom * factor));

		pan.x = mouseX - (mouseX - pan.x) * (newZoom / zoom);
		pan.y = mouseY - (mouseY - pan.y) * (newZoom / zoom);
		zoom = newZoom;
	}

	function handleCanvasMouseDown(e: MouseEvent) {
		// Only start panning if clicking on background canvas
		if ((e.target as HTMLElement).closest('.table-card')) return;
		isPanning = true;
		panStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
		window.addEventListener('mousemove', handleWindowMouseMove);
		window.addEventListener('mouseup', handleWindowMouseUp);
	}

	function handleCardMouseDown(e: MouseEvent, tableName: string) {
		e.stopPropagation();
		draggingTable = tableName;
		const currentPos = positions[tableName] || { x: 0, y: 0 };
		dragStart = {
			mouseX: e.clientX,
			mouseY: e.clientY,
			tableX: currentPos.x,
			tableY: currentPos.y
		};
		window.addEventListener('mousemove', handleWindowMouseMove);
		window.addEventListener('mouseup', handleWindowMouseUp);
	}

	function handleWindowMouseMove(e: MouseEvent) {
		if (isPanning) {
			pan.x = e.clientX - panStart.x;
			pan.y = e.clientY - panStart.y;
		} else if (draggingTable) {
			const dx = (e.clientX - dragStart.mouseX) / zoom;
			const dy = (e.clientY - dragStart.mouseY) / zoom;
			positions = {
				...positions,
				[draggingTable]: {
					x: Math.round(dragStart.tableX + dx),
					y: Math.round(dragStart.tableY + dy)
				}
			};
		}
	}

	function handleWindowMouseUp() {
		isPanning = false;
		draggingTable = null;
		window.removeEventListener('mousemove', handleWindowMouseMove);
		window.removeEventListener('mouseup', handleWindowMouseUp);
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleWindowMouseMove);
			window.removeEventListener('mouseup', handleWindowMouseUp);
		}
	});

	// Derived Connector Paths for Foreign Key Relationships
	interface RenderPath {
		rel: ForeignKeyRelationship;
		path: string;
		midX: number;
		midY: number;
		isActive: boolean;
		cardinality: string;
	}

	let connectorPaths = $derived.by<RenderPath[]>(() => {
		if (!schema || !schema.relationships || schema.relationships.length === 0) return [];
		const tableMap = new Map<string, TableEntity>();
		schema.tables.forEach((t) => tableMap.set(t.name, t));

		const paths: RenderPath[] = [];

		for (const rel of schema.relationships) {
			const srcTable = tableMap.get(rel.sourceTable);
			const tgtTable = tableMap.get(rel.targetTable);
			const srcPos = positions[rel.sourceTable];
			const tgtPos = positions[rel.targetTable];

			if (!srcTable || !tgtTable || !srcPos || !tgtPos) continue;

			const srcColIdx = srcTable.columns.findIndex((c) => c.name === rel.sourceColumn);
			const tgtColIdx = tgtTable.columns.findIndex((c) => c.name === rel.targetColumn);

			const srcY = srcPos.y + HEADER_HEIGHT + (srcColIdx >= 0 ? srcColIdx : 0) * ROW_HEIGHT + ROW_HEIGHT / 2;
			const tgtY = tgtPos.y + HEADER_HEIGHT + (tgtColIdx >= 0 ? tgtColIdx : 0) * ROW_HEIGHT + ROW_HEIGHT / 2;

			// Check cardinality: if source column is unique, it's 1:1, else N:1
			const srcCol = srcTable.columns.find((c) => c.name === rel.sourceColumn);
			const isOneToOne = srcCol ? srcCol.isUnique || srcCol.isPk : false;
			const cardinality = isOneToOne ? '1 : 1' : 'N : 1';

			// Check if this relationship is actively highlighted
			const isHoveredLine =
				hoveredRel === rel ||
				(hoveredRel?.sourceTable === rel.sourceTable &&
					hoveredRel?.sourceColumn === rel.sourceColumn &&
					hoveredRel?.targetTable === rel.targetTable &&
					hoveredRel?.targetColumn === rel.targetColumn);

			const isHoveredThroughCol =
				hoveredCol &&
				((hoveredCol.table === rel.sourceTable && hoveredCol.column === rel.sourceColumn) ||
					(hoveredCol.table === rel.targetTable && hoveredCol.column === rel.targetColumn));

			const isHoveredThroughTable =
				hoveredTable && (hoveredTable === rel.sourceTable || hoveredTable === rel.targetTable);

			const isActive = Boolean(isHoveredLine || isHoveredThroughCol || isHoveredThroughTable);

			let path = '';
			let midX = 0;
			let midY = 0;

			// Self-referencing foreign key (e.g. employees.manager_id -> employees.id)
			if (rel.sourceTable === rel.targetTable) {
				const x1 = srcPos.x + CARD_WIDTH;
				const y1 = srcY;
				const x2 = srcPos.x + CARD_WIDTH;
				const y2 = tgtY;
				const loopWidth = 45;
				path = `M ${x1} ${y1} C ${x1 + loopWidth} ${y1 - 15}, ${x2 + loopWidth} ${y2 + 15}, ${x2} ${y2}`;
				midX = x1 + loopWidth;
				midY = (y1 + y2) / 2;
			} else {
				// Standard relationship between two tables
				const srcIsLeft = srcPos.x + CARD_WIDTH < tgtPos.x;
				const tgtIsLeft = tgtPos.x + CARD_WIDTH < srcPos.x;

				let x1 = 0;
				let x2 = 0;

				if (srcIsLeft) {
					// Source is to the left of Target: line goes from right of Source to left of Target
					x1 = srcPos.x + CARD_WIDTH;
					x2 = tgtPos.x;
					const dx = Math.max(35, Math.abs(x2 - x1) * 0.45);
					path = `M ${x1} ${srcY} C ${x1 + dx} ${srcY}, ${x2 - dx} ${tgtY}, ${x2} ${tgtY}`;
					midX = (x1 + x2) / 2;
					midY = (srcY + tgtY) / 2;
				} else if (tgtIsLeft) {
					// Target is to the left of Source: line goes from left of Source to right of Target
					x1 = srcPos.x;
					x2 = tgtPos.x + CARD_WIDTH;
					const dx = Math.max(35, Math.abs(x1 - x2) * 0.45);
					path = `M ${x1} ${srcY} C ${x1 - dx} ${srcY}, ${x2 + dx} ${tgtY}, ${x2} ${tgtY}`;
					midX = (x1 + x2) / 2;
					midY = (srcY + tgtY) / 2;
				} else {
					// Overlapping or vertically aligned: route around the right side
					x1 = srcPos.x + CARD_WIDTH;
					x2 = tgtPos.x + CARD_WIDTH;
					const curveX = Math.max(x1, x2) + 50;
					path = `M ${x1} ${srcY} C ${curveX} ${srcY}, ${curveX} ${tgtY}, ${x2} ${tgtY}`;
					midX = curveX;
					midY = (srcY + tgtY) / 2;
				}
			}

			paths.push({
				rel,
				path,
				midX,
				midY,
				isActive,
				cardinality
			});
		}

		return paths;
	});
</script>

<div class="relative w-full h-[480px] bg-zinc-950/90 border border-zinc-850 rounded-lg overflow-hidden select-none flex flex-col font-sans">
	<!-- Top Bar / Control Toolbar -->
	<div class="z-20 flex items-center justify-between px-3 py-2 bg-zinc-950/95 border-b border-zinc-850 text-xs font-mono">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1.5 text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
					<line x1="3" y1="9" x2="21" y2="9"/>
					<line x1="9" y1="21" x2="9" y2="9"/>
				</svg>
				{t[$locale].schemaMap}
			</span>
			<span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
				{schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'} • {schema.relationships.length} {schema.relationships.length === 1 ? 'relation' : 'relations'}
			</span>
		</div>

		<!-- Toolbar Buttons -->
		<div class="flex items-center gap-1.5">
			<button
				type="button"
				onclick={handleAutoLayout}
				title={t[$locale].autoLayout}
				class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded transition-colors text-[11px] flex items-center gap-1"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
					<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
					<line x1="12" y1="22.08" x2="12" y2="12"/>
				</svg>
				<span>{t[$locale].autoLayout}</span>
			</button>

			<div class="h-3.5 w-px bg-zinc-800 mx-0.5"></div>

			<button
				type="button"
				onclick={handleZoomOut}
				title={t[$locale].zoomOut}
				class="w-6 h-6 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded transition-colors"
			>
				-
			</button>

			<span class="text-[11px] font-mono text-zinc-400 px-1 min-w-[36px] text-center">
				{Math.round(zoom * 100)}%
			</span>

			<button
				type="button"
				onclick={handleZoomIn}
				title={t[$locale].zoomIn}
				class="w-6 h-6 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded transition-colors"
			>
				+
			</button>

			<button
				type="button"
				onclick={handleResetZoom}
				title={t[$locale].resetView}
				class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded transition-colors text-[11px]"
			>
				{t[$locale].resetView}
			</button>
		</div>
	</div>

	<!-- Main Canvas Viewport (Pannable & Zoomable) -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={containerRef}
		onwheel={handleWheel}
		onmousedown={handleCanvasMouseDown}
		class="relative flex-1 w-full h-full overflow-hidden {isPanning ? 'cursor-grabbing' : 'cursor-grab'}"
		style="background-color: #09090b;"
	>
		<!-- Subtle Grid Dot Pattern -->
		<svg class="absolute inset-0 w-full h-full pointer-events-none opacity-40">
			<defs>
				<pattern id="er-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="translate({pan.x % 24}, {pan.y % 24})">
					<circle cx="2" cy="2" r="1" fill="#3f3f46" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#er-grid-dots)" />
		</svg>

		{#if schema.tables.length === 0}
			<!-- Empty State -->
			<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
				<div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
						<line x1="4" y1="10" x2="20" y2="10"/>
						<line x1="10" y1="4" x2="10" y2="20"/>
					</svg>
				</div>
				<h4 class="text-sm font-semibold text-zinc-300 font-mono mb-1">{t[$locale].noTablesTitle}</h4>
				<p class="text-xs text-zinc-500 max-w-sm leading-relaxed font-sans">{t[$locale].noTablesDesc}</p>
			</div>
		{:else}
			<!-- Transformed Diagram Space -->
			<div
				class="absolute inset-0 origin-top-left"
				style="transform: translate({pan.x}px, {pan.y}px) scale({zoom});"
			>
				<!-- SVG Connectors Layer -->
				<svg class="absolute inset-0 overflow-visible w-full h-full pointer-events-none">
					<defs>
						<!-- Active Glow Filter -->
						<filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
							<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#22d3ee" flood-opacity="0.8" />
						</filter>
						<!-- Standard Arrow Marker -->
						<marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
							<path d="M 0 1 L 9 5 L 0 9 z" fill="#71717a" />
						</marker>
						<!-- Active Arrow Marker -->
						<marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
							<path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
						</marker>
					</defs>

					<!-- Relationship Bezier Connectors -->
					{#each connectorPaths as cp}
						<!-- Invisible wider hover stroke for easy clicking/hovering -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<path
							d={cp.path}
							fill="none"
							stroke="transparent"
							stroke-width="16"
							class="cursor-pointer pointer-events-stroke"
							onmouseenter={() => hoveredRel = cp.rel}
							onmouseleave={() => hoveredRel = null}
						/>

						<!-- Visible Connector Stroke -->
						<path
							d={cp.path}
							fill="none"
							stroke={cp.isActive ? '#22d3ee' : '#52525b'}
							stroke-width={cp.isActive ? '2.5' : '1.5'}
							stroke-dasharray={cp.isActive ? undefined : undefined}
							marker-end={cp.isActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
							filter={cp.isActive ? 'url(#glow-cyan)' : undefined}
							class="transition-colors pointer-events-none"
						/>

						<!-- Active Floating Relationship Badge -->
						{#if cp.isActive}
							<g transform="translate({cp.midX}, {cp.midY - 12})" class="pointer-events-none">
								<rect
									x="-65"
									y="-12"
									width="130"
									height="22"
									rx="4"
									fill="#09090b"
									stroke="#22d3ee"
									stroke-width="1"
								/>
								<text
									x="0"
									y="3"
									fill="#67e8f9"
									font-size="10"
									font-family="monospace"
									font-weight="bold"
									text-anchor="middle"
								>
									{cp.cardinality} • {cp.rel.onDelete || 'CASCADE'}
								</text>
							</g>
						{/if}
					{/each}
				</svg>

				<!-- Draggable HTML Table Cards -->
				{#each schema.tables as table (table.name)}
					{@const pos = positions[table.name] || { x: 40, y: 40 }}
					{@const isHovered =
						hoveredTable === table.name ||
						hoveredRel?.sourceTable === table.name ||
						hoveredRel?.targetTable === table.name ||
						hoveredCol?.table === table.name}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="table-card absolute rounded-lg border shadow-2xl transition-shadow bg-zinc-900/95 backdrop-blur font-mono text-xs select-none {isHovered
							? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-950/40 z-10'
							: 'border-zinc-800 hover:border-zinc-700 z-0'}"
						style="left: {pos.x}px; top: {pos.y}px; width: {CARD_WIDTH}px;"
						onmouseenter={() => hoveredTable = table.name}
						onmouseleave={() => hoveredTable = null}
					>
						<!-- Card Header (Draggable Handle) -->
						<div
							onmousedown={(e) => handleCardMouseDown(e, table.name)}
							class="px-3 py-2 bg-zinc-950/90 rounded-t-lg border-b border-zinc-800 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-zinc-900/80 transition-colors"
						>
							<div class="flex items-center gap-1.5 min-w-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
									<line x1="3" y1="9" x2="21" y2="9"/>
									<line x1="9" y1="21" x2="9" y2="9"/>
								</svg>
								<span class="font-bold text-zinc-100 truncate text-[12px]">{table.name}</span>
							</div>
							<span class="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
								{table.columns.length}
							</span>
						</div>

						<!-- Column List -->
						<div class="py-1">
							{#each table.columns as col}
								{@const isColHovered =
									(hoveredCol?.table === table.name && hoveredCol?.column === col.name) ||
									(hoveredRel?.sourceTable === table.name && hoveredRel?.sourceColumn === col.name) ||
									(hoveredRel?.targetTable === table.name && hoveredRel?.targetColumn === col.name)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									onmouseenter={() => hoveredCol = { table: table.name, column: col.name }}
									onmouseleave={() => hoveredCol = null}
									class="px-3 py-1 flex items-center justify-between transition-colors {isColHovered
										? 'bg-cyan-950/50 text-cyan-200'
										: 'hover:bg-zinc-850/50 text-zinc-300'}"
									style="height: {ROW_HEIGHT}px;"
								>
									<!-- Left: Badges + Column Name -->
									<div class="flex items-center gap-1.5 min-w-0 truncate">
										{#if col.isPk}
											<span
												title={t[$locale].legendPk}
												class="px-1 py-0.2 rounded text-[9px] font-bold tracking-tight bg-amber-950/90 text-amber-300 border border-amber-600/60 shrink-0"
											>
												PK
											</span>
										{/if}
										{#if col.isFk}
											<span
												title={t[$locale].legendFk}
												class="px-1 py-0.2 rounded text-[9px] font-bold tracking-tight bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shrink-0"
											>
												FK
											</span>
										{/if}
										{#if col.isUnique && !col.isPk}
											<span
												title={t[$locale].legendUq}
												class="px-1 py-0.2 rounded text-[9px] font-bold tracking-tight bg-purple-950/90 text-purple-300 border border-purple-500/60 shrink-0"
											>
												UQ
											</span>
										{/if}
										<span class="truncate text-[11px] {col.isPk ? 'font-semibold text-zinc-100' : ''}">
											{col.name}
										</span>
									</div>

									<!-- Right: Data Type -->
									<span class="text-[10px] text-amber-400/80 shrink-0 font-mono pl-2">
										{col.type}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Bottom Legend & Interaction Hint -->
	<div class="z-20 px-3 py-1.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400">
		<div class="flex items-center gap-3">
			<span class="flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
				<span>{t[$locale].legendPk}</span>
			</span>
			<span class="flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
				<span>{t[$locale].legendFk}</span>
			</span>
			<span class="flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
				<span>{t[$locale].legendUq}</span>
			</span>
		</div>
		<span class="text-zinc-500 hidden sm:inline">
			{t[$locale].dragHint}
		</span>
	</div>
</div>
