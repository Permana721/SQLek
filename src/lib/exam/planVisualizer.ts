import type { IDbEngine, DbResult } from '$lib/db/engine';

export interface EnrichedPlanNode {
	id: string;
	nodeType: string;
	relationName?: string;
	alias?: string;
	indexName?: string;
	startupCost: number;
	totalCost: number;
	exclusiveCost: number;
	planRows: number;
	planWidth: number;

	// Runtime metrics (EXPLAIN ANALYZE)
	actualStartupTime?: number;
	actualTotalTime?: number;
	exclusiveTime?: number;
	actualRows?: number;
	actualLoops?: number;

	// Predicates & conditions
	filter?: string;
	rowsRemovedByFilter?: number;
	indexCond?: string;
	hashCond?: string;
	mergeCond?: string;
	recheckCond?: string;
	sortKey?: string[];
	sortMethod?: string;
	sortSpaceUsed?: number;
	sortSpaceType?: string;

	// Buffer blocks
	sharedHitBlocks?: number;
	sharedReadBlocks?: number;
	sharedDirtiedBlocks?: number;
	sharedWrittenBlocks?: number;

	// Subplan / CTE info
	subplanName?: string;
	parentRelationship?: string;

	// Relative cost & time percentages
	costPercent: number;
	exclusiveCostPercent: number;
	timePercent?: number;
	exclusiveTimePercent?: number;

	// Diagnostic health & bottleneck detection
	health: 'good' | 'moderate' | 'warning';
	warnings: { en: string; id: string }[];

	plans: EnrichedPlanNode[];
	raw: any;
}

export interface PlanExecutionSummary {
	planningTime?: number;
	executionTime?: number;
	totalCost: number;
	rootNode: EnrichedPlanNode;
	warningCount: number;
	hasAnalyze: boolean;
	bufferSummary?: {
		sharedHit: number;
		sharedRead: number;
		hitRatio: number;
	};
}

/**
 * Safely extracts the PostgreSQL JSON plan whether PGlite returns it
 * as a parsed JS array, parsed JS object, or raw JSON string literal.
 */
export function extractExplainJson(dbRes: DbResult | null | undefined): any {
	if (!dbRes || !dbRes.rows || dbRes.rows.length === 0) return null;

	const firstRow = dbRes.rows[0];
	if (!firstRow) return null;

	// Look for QUERY PLAN column (case-insensitive)
	const planKey = Object.keys(firstRow).find((k) => k.toUpperCase() === 'QUERY PLAN') || Object.keys(firstRow)[0];
	let val = firstRow[planKey];

	// If it's a raw JSON string literal, parse it
	if (typeof val === 'string') {
		const trimmed = val.trim();
		if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
			try {
				val = JSON.parse(trimmed);
			} catch {
				return null;
			}
		} else {
			return null;
		}
	}

	// If it's an array of plans (PostgreSQL FORMAT JSON standard: [ { Plan: { ... }, Planning Time: ... } ])
	if (Array.isArray(val) && val.length > 0) {
		return val[0];
	}

	if (val && typeof val === 'object') {
		return val;
	}

	return null;
}

/**
 * Detects whether a SQL query is an EXPLAIN query and checks for ANALYZE or data mutations.
 */
export function detectExplainQuery(sql: string): {
	isExplain: boolean;
	hasAnalyze: boolean;
	isMutating: boolean;
	innerSql: string;
} {
	const cleaned = sql.replace(/^(\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/))+/g, '').trim();
	const isExplain = /^\s*EXPLAIN\b/i.test(cleaned);

	if (!isExplain) {
		const isMutating = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(cleaned);
		return { isExplain: false, hasAnalyze: false, isMutating, innerSql: cleaned };
	}

	const hasAnalyze = /^\s*EXPLAIN\s*(\([^)]*\bANALYZE\b[^)]*\)|\bANALYZE\b)/i.test(cleaned);

	// Strip the outer EXPLAIN and its options to extract the inner query
	const innerSql = cleaned
		.replace(/^\s*EXPLAIN\s*(\([^)]+\)|\bANALYZE\b|\bVERBOSE\b|\bBUFFERS\b|\bCOSTS\b|\bTIMING\b|\bSUMMARY\b|\bFORMAT\s+\w+\b)*/i, '')
		.trim();

	const isMutating = /^\s*(INSERT|UPDATE|DELETE)\b/i.test(innerSql);

	return {
		isExplain: true,
		hasAnalyze,
		isMutating,
		innerSql
	};
}

let nodeIdCounter = 0;

function evaluateNodeHealth(
	rawNode: any,
	totalCost: number,
	exclusiveCost: number,
	planRows: number,
	actualRows?: number,
	sortSpaceType?: string,
	rowsRemovedByFilter?: number
): { health: 'good' | 'moderate' | 'warning'; warnings: { en: string; id: string }[] } {
	const nodeType = (rawNode?.['Node Type'] || '').toLowerCase();
	const relationName = rawNode?.['Relation Name'] || '';
	const warnings: { en: string; id: string }[] = [];

	// 1. Check for Large Sequential Scans without an index
	if (nodeType === 'seq scan') {
		const rows = actualRows !== undefined ? actualRows : planRows;
		if (rows > 100) {
			warnings.push({
				en: `Sequential scan on "${relationName}" scanned ${rows} rows. Consider creating an index on the filtered column.`,
				id: `Sequential scan pada "${relationName}" membaca ${rows} baris. Pertimbangkan membuat indeks pada kolom filter.`
			});
		}
	}

	// 2. Check for Sort Spilling to Disk
	if (sortSpaceType && sortSpaceType.toLowerCase() === 'disk') {
		warnings.push({
			en: `Sort operation spilled to disk (${rawNode?.['Sort Space Used'] || 0} kB). work_mem was exceeded.`,
			id: `Operasi sort meluap ke disk (${rawNode?.['Sort Space Used'] || 0} kB). work_mem terlampaui.`
		});
	}

	// 3. Check for Correlated SubPlan loops
	const parentRel = (rawNode?.['Parent Relationship'] || '').toLowerCase();
	const subplanName = (rawNode?.['Subplan Name'] || '').toLowerCase();
	if (parentRel === 'subplan' || subplanName.startsWith('subplan')) {
		warnings.push({
			en: `Correlated SubPlan executed for each outer row. Consider rewriting using JOIN or CTE.`,
			id: `SubPlan berkorelasi dieksekusi berulang untuk setiap baris luar. Pertimbangkan menulis ulang dengan JOIN atau CTE.`
		});
	}

	// 4. Check for Planner Row Estimation Mismatch (outdated statistics)
	if (actualRows !== undefined && planRows > 0 && actualRows > 0) {
		const ratio = actualRows > planRows ? actualRows / planRows : planRows / actualRows;
		if (ratio > 5 && Math.abs(actualRows - planRows) > 50) {
			warnings.push({
				en: `Row estimate discrepancy: planner estimated ${planRows} rows but actually processed ${actualRows} rows (${ratio.toFixed(1)}x difference). Table statistics may be stale.`,
				id: `Ketidaksesuaian estimasi baris: planner memperkirakan ${planRows} baris tetapi kenyataannya memproses ${actualRows} baris (selisih ${ratio.toFixed(1)}x). Statistik tabel mungkin usang.`
			});
		}
	}

	// 5. Check for heavy row discard in filter
	if (rowsRemovedByFilter !== undefined && rowsRemovedByFilter > 100) {
		const scanned = (actualRows || 0) + rowsRemovedByFilter;
		if (scanned > 0 && rowsRemovedByFilter / scanned > 0.75) {
			warnings.push({
				en: `Filter discarded ${rowsRemovedByFilter} rows (${Math.round((rowsRemovedByFilter / scanned) * 100)}% of scanned rows). An index could prevent reading these pages.`,
				id: `Filter membuang ${rowsRemovedByFilter} baris (${Math.round((rowsRemovedByFilter / scanned) * 100)}% dari total baris terbaca). Indeks dapat menghindari pembacaan baris ini.`
			});
		}
	}

	// 6. Inefficient Nested Loop with inner Seq Scan
	if (nodeType === 'nested loop') {
		const plans = Array.isArray(rawNode?.Plans) ? rawNode.Plans : [];
		const inner = plans.find((p: any) => (p?.['Parent Relationship'] || '').toLowerCase() === 'inner') || plans[1];
		if (inner && (inner?.['Node Type'] || '').toLowerCase() === 'seq scan' && (inner?.['Plan Rows'] || 0) > 30) {
			warnings.push({
				en: `Nested Loop with sequential scan on inner table. This can result in O(N*M) catastrophic performance.`,
				id: `Nested Loop dengan sequential scan pada tabel dalam. Ini dapat menyebabkan penurunan performa kuadratik O(N*M).`
			});
		}
	}

	// Determine overall health tier
	if (warnings.length > 0) {
		return { health: 'warning', warnings };
	}

	const goodTypes = [
		'index scan',
		'index only scan',
		'bitmap index scan',
		'values scan',
		'result',
		'memoize'
	];

	if (goodTypes.includes(nodeType)) {
		return { health: 'good', warnings: [] };
	}

	return { health: 'moderate', warnings: [] };
}

function parseAndEnrichNode(
	rawNode: any,
	rootTotalCost: number,
	rootExecutionTime?: number
): EnrichedPlanNode {
	const id = `plan-node-${++nodeIdCounter}`;
	const nodeType = rawNode?.['Node Type'] || 'Unknown';
	const relationName = rawNode?.['Relation Name'];
	const alias = rawNode?.['Alias'];
	const indexName = rawNode?.['Index Name'];

	const startupCost = Number(rawNode?.['Startup Cost']) || 0;
	const totalCost = Number(rawNode?.['Total Cost']) || 0;
	const planRows = Number(rawNode?.['Plan Rows']) || 0;
	const planWidth = Number(rawNode?.['Plan Width']) || 0;

	// Runtime stats (when ANALYZE was executed)
	const actualStartupTime = rawNode?.['Actual Startup Time'] !== undefined ? Number(rawNode['Actual Startup Time']) : undefined;
	const actualTotalTime = rawNode?.['Actual Total Time'] !== undefined ? Number(rawNode['Actual Total Time']) : undefined;
	const actualRows = rawNode?.['Actual Rows'] !== undefined ? Number(rawNode['Actual Rows']) : undefined;
	const actualLoops = rawNode?.['Actual Loops'] !== undefined ? Number(rawNode['Actual Loops']) : undefined;

	// Conditions
	const filter = rawNode?.['Filter'];
	const rowsRemovedByFilter = rawNode?.['Rows Removed by Filter'] !== undefined ? Number(rawNode['Rows Removed by Filter']) : undefined;
	const indexCond = rawNode?.['Index Cond'];
	const hashCond = rawNode?.['Hash Cond'];
	const mergeCond = rawNode?.['Merge Cond'];
	const recheckCond = rawNode?.['Recheck Cond'];
	const sortKey = Array.isArray(rawNode?.['Sort Key']) ? rawNode['Sort Key'] : undefined;
	const sortMethod = rawNode?.['Sort Method'];
	const sortSpaceUsed = rawNode?.['Sort Space Used'] !== undefined ? Number(rawNode['Sort Space Used']) : undefined;
	const sortSpaceType = rawNode?.['Sort Space Type'];

	// Buffer block counts
	const sharedHitBlocks = rawNode?.['Shared Hit Blocks'] !== undefined ? Number(rawNode['Shared Hit Blocks']) : undefined;
	const sharedReadBlocks = rawNode?.['Shared Read Blocks'] !== undefined ? Number(rawNode['Shared Read Blocks']) : undefined;
	const sharedDirtiedBlocks = rawNode?.['Shared Dirtied Blocks'] !== undefined ? Number(rawNode['Shared Dirtied Blocks']) : undefined;
	const sharedWrittenBlocks = rawNode?.['Shared Written Blocks'] !== undefined ? Number(rawNode['Shared Written Blocks']) : undefined;

	const subplanName = rawNode?.['Subplan Name'];
	const parentRelationship = rawNode?.['Parent Relationship'];

	// Recursively parse child plans
	const childrenRaw = Array.isArray(rawNode?.Plans) ? rawNode.Plans : [];
	const plans: EnrichedPlanNode[] = childrenRaw.map((child: any) =>
		parseAndEnrichNode(child, rootTotalCost, rootExecutionTime)
	);

	// Calculate exclusive cost: node's totalCost minus sum of children's totalCosts
	const childCostsSum = plans.reduce((acc, p) => acc + p.totalCost, 0);
	const exclusiveCost = Math.max(0, Number((totalCost - childCostsSum).toFixed(2)));

	// Calculate exclusive time: node's actualTotalTime minus sum of children's actualTotalTimes
	let exclusiveTime: number | undefined = undefined;
	if (actualTotalTime !== undefined) {
		const childTimesSum = plans.reduce((acc, p) => acc + (p.actualTotalTime || 0), 0);
		exclusiveTime = Math.max(0, Number((actualTotalTime - childTimesSum).toFixed(3)));
	}

	// Cost percentages (inclusive vs exclusive)
	const safeRootCost = Math.max(0.01, rootTotalCost);
	const costPercent = Math.min(100, Math.max(0, Number(((totalCost / safeRootCost) * 100).toFixed(1))));
	const exclusiveCostPercent = Math.min(100, Math.max(0, Number(((exclusiveCost / safeRootCost) * 100).toFixed(1))));

	// Time percentages (inclusive vs exclusive)
	let timePercent: number | undefined = undefined;
	let exclusiveTimePercent: number | undefined = undefined;
	if (actualTotalTime !== undefined && rootExecutionTime && rootExecutionTime > 0) {
		timePercent = Math.min(100, Math.max(0, Number(((actualTotalTime / rootExecutionTime) * 100).toFixed(1))));
		if (exclusiveTime !== undefined) {
			exclusiveTimePercent = Math.min(100, Math.max(0, Number(((exclusiveTime / rootExecutionTime) * 100).toFixed(1))));
		}
	}

	// Health and bottlenecks evaluation
	const { health, warnings } = evaluateNodeHealth(
		rawNode,
		totalCost,
		exclusiveCost,
		planRows,
		actualRows,
		sortSpaceType,
		rowsRemovedByFilter
	);

	return {
		id,
		nodeType,
		relationName,
		alias,
		indexName,
		startupCost,
		totalCost,
		exclusiveCost,
		planRows,
		planWidth,
		actualStartupTime,
		actualTotalTime,
		exclusiveTime,
		actualRows,
		actualLoops,
		filter,
		rowsRemovedByFilter,
		indexCond,
		hashCond,
		mergeCond,
		recheckCond,
		sortKey,
		sortMethod,
		sortSpaceUsed,
		sortSpaceType,
		sharedHitBlocks,
		sharedReadBlocks,
		sharedDirtiedBlocks,
		sharedWrittenBlocks,
		subplanName,
		parentRelationship,
		costPercent,
		exclusiveCostPercent,
		timePercent,
		exclusiveTimePercent,
		health,
		warnings,
		plans,
		raw: rawNode
	};
}

function countTotalWarnings(node: EnrichedPlanNode): number {
	let count = node.warnings.length;
	for (const child of node.plans) {
		count += countTotalWarnings(child);
	}
	return count;
}

function aggregateBuffers(node: EnrichedPlanNode, acc = { sharedHit: 0, sharedRead: 0 }): { sharedHit: number; sharedRead: number } {
	if (node.sharedHitBlocks) acc.sharedHit += node.sharedHitBlocks;
	if (node.sharedReadBlocks) acc.sharedRead += node.sharedReadBlocks;
	for (const child of node.plans) {
		aggregateBuffers(child, acc);
	}
	return acc;
}

/**
 * Builds an enriched execution plan summary from a raw PostgreSQL JSON plan.
 */
export function buildEnrichedPlanTree(rawExplainResult: any): PlanExecutionSummary | null {
	if (!rawExplainResult) return null;

	const rawPlan = rawExplainResult.Plan || rawExplainResult;
	if (!rawPlan || !rawPlan['Node Type']) return null;

	const rootTotalCost = Number(rawPlan['Total Cost']) || 0;
	const executionTime = rawExplainResult['Execution Time'] !== undefined ? Number(rawExplainResult['Execution Time']) : undefined;
	const planningTime = rawExplainResult['Planning Time'] !== undefined ? Number(rawExplainResult['Planning Time']) : undefined;
	const hasAnalyze = rawPlan['Actual Total Time'] !== undefined || executionTime !== undefined;

	nodeIdCounter = 0;
	const rootNode = parseAndEnrichNode(rawPlan, rootTotalCost, executionTime);
	const warningCount = countTotalWarnings(rootNode);

	const bufferTotals = aggregateBuffers(rootNode);
	let bufferSummary: PlanExecutionSummary['bufferSummary'] = undefined;
	if (bufferTotals.sharedHit > 0 || bufferTotals.sharedRead > 0) {
		const totalBlocks = bufferTotals.sharedHit + bufferTotals.sharedRead;
		const hitRatio = totalBlocks > 0 ? Number(((bufferTotals.sharedHit / totalBlocks) * 100).toFixed(1)) : 100;
		bufferSummary = {
			sharedHit: bufferTotals.sharedHit,
			sharedRead: bufferTotals.sharedRead,
			hitRatio
		};
	}

	return {
		planningTime,
		executionTime,
		totalCost: rootTotalCost,
		rootNode,
		warningCount,
		hasAnalyze,
		bufferSummary
	};
}

/**
 * Executes a PostgreSQL JSON explain query safely with transaction rollback
 * for mutating queries to prevent side effects on sample data.
 */
export async function executeExplainJson(
	engine: IDbEngine,
	userSql: string
): Promise<PlanExecutionSummary | null> {
	const { isExplain, hasAnalyze, isMutating, innerSql } = detectExplainQuery(userSql);

	const targetSql = isExplain ? innerSql : userSql.trim();
	if (!targetSql) return null;

	const explainCommand = hasAnalyze
		? `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${targetSql};`
		: `EXPLAIN (FORMAT JSON) ${targetSql};`;

	let rawResult: DbResult | null = null;

	try {
		if (hasAnalyze && isMutating) {
			// Wrap mutating EXPLAIN ANALYZE in a safe transaction rollback
			await engine.query('BEGIN;');
			try {
				rawResult = await engine.query(explainCommand);
			} finally {
				await engine.query('ROLLBACK;');
			}
		} else {
			rawResult = await engine.query(explainCommand);
		}

		const parsedJson = extractExplainJson(rawResult);
		if (!parsedJson) return null;

		return buildEnrichedPlanTree(parsedJson);
	} catch (err) {
		console.warn('Failed to extract JSON plan via EXPLAIN:', err);
		return null;
	}
}
