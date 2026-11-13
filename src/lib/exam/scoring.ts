import type { IDbEngine, DbResult } from '$lib/db/engine';
import type { ExamQuestion, StructuralCheck, LocalizedString } from '$lib/data/types';

export const EXAM_PASS_THRESHOLD = 75;

export interface PlanPenaltiesConfig {
	seqScanOnLargeTable: number;
	correlatedSubPlan: number;
	extraTableScans: number;
	extraSortNodes: number;
	inefficientNestedLoop: number;
	repeatedCteMaterialization: number;
	largeTableThresholdRows: number;
}

export const DEFAULT_PLAN_PENALTIES: PlanPenaltiesConfig = {
	seqScanOnLargeTable: 20,
	correlatedSubPlan: 25,
	extraTableScans: 15,
	extraSortNodes: 10,
	inefficientNestedLoop: 15,
	repeatedCteMaterialization: 10,
	largeTableThresholdRows: 500
};

export interface PlanPenaltyItem {
	reason: string;
	penalty: number;
	symptom: string;
}

export interface StructuralCheckResult {
	sql: string;
	weight: number;
	passed: boolean;
	description?: LocalizedString;
}

export interface ExamScoringResult {
	passed: boolean;
	finalScore: number;
	gatePassed: boolean;
	integrityPassed: boolean;
	costScore?: number;
	planScore?: number;
	referenceCost?: number;
	studentCost?: number;
	symptoms: string[];
	penalties?: PlanPenaltyItem[];
	structuralChecks?: StructuralCheckResult[];
	error?: string;
}

export function splitSqlStatements(sql: string): string[] {
	const statements: string[] = [];
	let current = '';
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let inDollarQuote: string | null = null;
	let inLineComment = false;
	let inBlockComment = false;

	for (let i = 0; i < sql.length; i++) {
		const char = sql[i];
		const nextChar = i + 1 < sql.length ? sql[i + 1] : '';

		if (inLineComment) {
			if (char === '\n') {
				inLineComment = false;
			}
			current += char;
			continue;
		}

		if (inBlockComment) {
			if (char === '*' && nextChar === '/') {
				inBlockComment = false;
				current += '*/';
				i++;
				continue;
			}
			current += char;
			continue;
		}

		if (char === '-' && nextChar === '-' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
			inLineComment = true;
			current += '--';
			i++;
			continue;
		}

		if (char === '/' && nextChar === '*' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
			inBlockComment = true;
			current += '/*';
			i++;
			continue;
		}

		if (char === "'" && !inDoubleQuote && !inDollarQuote) {
			inSingleQuote = !inSingleQuote;
			current += char;
			continue;
		}

		if (char === '"' && !inSingleQuote && !inDollarQuote) {
			inDoubleQuote = !inDoubleQuote;
			current += char;
			continue;
		}

		if (char === '$' && !inSingleQuote && !inDoubleQuote) {
			if (inDollarQuote) {
				const tagEnd = sql.slice(i, i + inDollarQuote.length);
				if (tagEnd === inDollarQuote) {
					inDollarQuote = null;
					current += tagEnd;
					i += tagEnd.length - 1;
					continue;
				}
			} else {
				const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
				if (match) {
					inDollarQuote = match[1];
					current += inDollarQuote;
					i += inDollarQuote.length - 1;
					continue;
				}
			}
		}

		if (char === ';' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
			const trimmed = current.trim();
			if (trimmed.length > 0) {
				statements.push(trimmed);
			}
			current = '';
			continue;
		}

		current += char;
	}

	const remaining = current.trim();
	if (remaining.length > 0) {
		statements.push(remaining);
	}

	return statements;
}

export function isExplainableStatement(stmt: string): boolean {
	const clean = stmt.replace(/^(\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/))+/g, '').trim();
	return /^(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(clean);
}

export function jsonEquals(a: any, b: any): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export interface ParsedPlanNode {
	nodeType: string;
	relationName?: string;
	alias?: string;
	startupCost: number;
	totalCost: number;
	planRows: number;
	planWidth: number;
	subplanName?: string;
	parentRelationship?: string;
	filter?: string;
	plans: ParsedPlanNode[];
	raw: any;
}

export function parsePlanTree(rawNode: any): ParsedPlanNode {
	const plans: ParsedPlanNode[] = [];
	if (Array.isArray(rawNode?.Plans)) {
		for (const p of rawNode.Plans) {
			plans.push(parsePlanTree(p));
		}
	}

	return {
		nodeType: rawNode?.['Node Type'] || '',
		relationName: rawNode?.['Relation Name'] ? String(rawNode['Relation Name']).toLowerCase() : undefined,
		alias: rawNode?.['Alias'],
		startupCost: Number(rawNode?.['Startup Cost']) || 0,
		totalCost: Number(rawNode?.['Total Cost']) || 0,
		planRows: Number(rawNode?.['Plan Rows']) || 0,
		planWidth: Number(rawNode?.['Plan Width']) || 0,
		subplanName: rawNode?.['Subplan Name'],
		parentRelationship: rawNode?.['Parent Relationship'],
		filter: rawNode?.['Filter'],
		plans,
		raw: rawNode
	};
}

export function extractPlanFromExplainResult(dbRes: DbResult): ParsedPlanNode | null {
	if (!dbRes || !dbRes.rows || dbRes.rows.length === 0) return null;
	const firstRow = dbRes.rows[0];
	const key = Object.keys(firstRow)[0];
	let planData = firstRow[key];

	if (typeof planData === 'string') {
		try {
			planData = JSON.parse(planData);
		} catch {
			return null;
		}
	}

	if (Array.isArray(planData) && planData.length > 0) {
		const top = planData[0];
		if (top && top.Plan) {
			return parsePlanTree(top.Plan);
		}
	}

	if (planData && typeof planData === 'object' && planData.Plan) {
		return parsePlanTree(planData.Plan);
	}

	return null;
}

export function collectBaseRelations(node: ParsedPlanNode, relations = new Set<string>()): Set<string> {
	if (node.relationName) {
		relations.add(node.relationName.toLowerCase());
	}
	for (const child of node.plans) {
		collectBaseRelations(child, relations);
	}
	return relations;
}

export function countScansPerTable(node: ParsedPlanNode, scanMap: Record<string, number> = {}): Record<string, number> {
	const scanTypes = ['seq scan', 'index scan', 'index only scan', 'bitmap heap scan'];
	const typeLower = node.nodeType.toLowerCase();

	if (node.relationName && scanTypes.includes(typeLower)) {
		const rel = node.relationName.toLowerCase();
		scanMap[rel] = (scanMap[rel] || 0) + 1;
	}

	for (const child of node.plans) {
		countScansPerTable(child, scanMap);
	}

	return scanMap;
}

export function countSortNodes(node: ParsedPlanNode): number {
	let count = 0;
	const typeLower = node.nodeType.toLowerCase();
	if (typeLower === 'sort' || typeLower === 'incremental sort') {
		count++;
	}
	for (const child of node.plans) {
		count += countSortNodes(child);
	}
	return count;
}

export function countCorrelatedSubplans(node: ParsedPlanNode): number {
	let count = 0;
	if (
		node.parentRelationship?.toLowerCase() === 'subplan' ||
		(node.subplanName && node.subplanName.toLowerCase().startsWith('subplan'))
	) {
		count++;
	}
	for (const child of node.plans) {
		count += countCorrelatedSubplans(child);
	}
	return count;
}

export function countCteScans(node: ParsedPlanNode): number {
	let count = 0;
	if (node.nodeType.toLowerCase() === 'cte scan') {
		count++;
	}
	for (const child of node.plans) {
		count += countCteScans(child);
	}
	return count;
}

export function findSeqScansOnLargeTables(
	node: ParsedPlanNode,
	refPlan: ParsedPlanNode | null,
	threshold: number
): { table: string; rows: number }[] {
	const results: { table: string; rows: number }[] = [];

	const refHasSeqScanOnTable = (table: string): boolean => {
		if (!refPlan) return false;
		let found = false;
		const check = (n: ParsedPlanNode) => {
			if (n.nodeType.toLowerCase() === 'seq scan' && n.relationName?.toLowerCase() === table.toLowerCase()) {
				found = true;
			}
			for (const c of n.plans) check(c);
		};
		check(refPlan);
		return found;
	};

	const walk = (n: ParsedPlanNode) => {
		if (n.nodeType.toLowerCase() === 'seq scan' && n.relationName) {
			const rel = n.relationName.toLowerCase();
			if (n.planRows > threshold && !refHasSeqScanOnTable(rel)) {
				results.push({ table: rel, rows: n.planRows });
			}
		}
		for (const c of n.plans) walk(c);
	};

	walk(node);
	return results;
}

export function countInefficientNestedLoops(node: ParsedPlanNode, refPlan: ParsedPlanNode | null): number {
	let count = 0;

	const walk = (n: ParsedPlanNode) => {
		if (n.nodeType.toLowerCase() === 'nested loop') {
			const innerChild = n.plans.find((p) => p.parentRelationship?.toLowerCase() === 'inner') || n.plans[1];
			if (innerChild && innerChild.nodeType.toLowerCase() === 'seq scan' && innerChild.planRows > 50) {
				count++;
			}
		}
		for (const c of n.plans) walk(c);
	};

	walk(node);
	return count;
}

export async function explainQueryStatements(
	engine: IDbEngine,
	sql: string
): Promise<{ plans: ParsedPlanNode[]; totalCost: number; rawResults: DbResult[] }> {
	const stmts = splitSqlStatements(sql);
	const explainable = stmts.filter(isExplainableStatement);

	const plans: ParsedPlanNode[] = [];
	const rawResults: DbResult[] = [];
	let totalCost = 0;

	for (const stmt of explainable) {
		const res = await engine.query(`EXPLAIN (FORMAT JSON) ${stmt};`);
		rawResults.push(res);
		const parsed = extractPlanFromExplainResult(res);
		if (parsed) {
			plans.push(parsed);
			totalCost += parsed.totalCost;
		}
	}

	return { plans, totalCost, rawResults };
}

export async function scoreExamAnswer(
	engine: IDbEngine,
	question: ExamQuestion,
	studentSql: string,
	penaltiesConfig: PlanPenaltiesConfig = DEFAULT_PLAN_PENALTIES
): Promise<ExamScoringResult> {
	// Mode 1: Structural scoring for DDL / privileges / catalog checks
	if (question.scoring.mode === 'structural') {
		const checks = question.scoring.checks;
		const checkResults: StructuralCheckResult[] = [];
		let earnedWeight = 0;
		let totalWeight = 0;

		for (const check of checks) {
			totalWeight += check.weight;
			try {
				const res = await engine.query(check.sql);
				const firstRow = res.rows[0];
				let passed = false;
				if (firstRow) {
					const firstVal = firstRow[Object.keys(firstRow)[0]];
					if (typeof firstVal === 'boolean') {
						passed = firstVal === true;
					} else if (typeof firstVal === 'number') {
						passed = firstVal > 0;
					} else if (typeof firstVal === 'string') {
						passed = firstVal.toLowerCase() === 'true' || firstVal.toLowerCase() === 't' || Number(firstVal) > 0;
					} else if (firstVal !== null && firstVal !== undefined) {
						passed = true;
					}
				}
				if (passed) {
					earnedWeight += check.weight;
				}
				checkResults.push({
					sql: check.sql,
					weight: check.weight,
					passed,
					description: check.description
				});
			} catch {
				checkResults.push({
					sql: check.sql,
					weight: check.weight,
					passed: false,
					description: check.description
				});
			}
		}

		const finalScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
		const passed = finalScore >= EXAM_PASS_THRESHOLD;

		const symptoms: string[] = [];
		for (const cr of checkResults) {
			if (!cr.passed) {
				symptoms.push(`Catalog check did not satisfy expected state: ${cr.sql}`);
			}
		}

		return {
			passed,
			finalScore,
			gatePassed: finalScore > 0,
			integrityPassed: true,
			structuralChecks: checkResults,
			symptoms
		};
	}

	// Mode 2: Plan-based scoring
	// Step B: Integrity check
	// Explain student query and reference query
	let studentExplain;
	let refExplain;

	try {
		await engine.query('SET enable_seqscan = on;');
	} catch {
		// Ignore if setting fails
	}

	try {
		studentExplain = await explainQueryStatements(engine, studentSql);
	} catch (err: any) {
		return {
			passed: false,
			finalScore: 0,
			gatePassed: true,
			integrityPassed: false,
			symptoms: ['Failed to analyze execution plan'],
			error: err.message || 'Error generating execution plan'
		};
	}

	try {
		refExplain = await explainQueryStatements(engine, question.referenceQuery);
	} catch (err: any) {
		return {
			passed: false,
			finalScore: 0,
			gatePassed: true,
			integrityPassed: false,
			symptoms: ['Failed to analyze reference query plan'],
			error: err.message || 'Error generating reference plan'
		};
	}

	const studentRelations = new Set<string>();
	for (const p of studentExplain.plans) {
		collectBaseRelations(p, studentRelations);
	}

	const refRelations = new Set<string>();
	for (const p of refExplain.plans) {
		collectBaseRelations(p, refRelations);
	}

	// Integrity check: query must touch the base relations the reference touches
	if (refRelations.size > 0) {
		let missingRelation = false;
		for (const rel of refRelations) {
			if (!studentRelations.has(rel)) {
				missingRelation = true;
				break;
			}
		}
		if (missingRelation || studentRelations.size === 0) {
			return {
				passed: false,
				finalScore: 0,
				gatePassed: true,
				integrityPassed: false,
				referenceCost: refExplain.totalCost,
				studentCost: studentExplain.totalCost,
				symptoms: ['Query does not read from the required base tables'],
				error: 'Query does not read from the required tables'
			};
		}
	}

	// Step C: Efficiency Score (0-100)
	const refCost = Math.max(refExplain.totalCost, 0.01);
	const studCost = Math.max(studentExplain.totalCost, 0.01);

	let costRatio = refCost / studCost;
	if (costRatio > 1) costRatio = 1;
	if (costRatio < 0) costRatio = 0;
	const costScore = costRatio * 100;

	// Plan penalties
	const penalties: PlanPenaltyItem[] = [];
	const symptoms: string[] = [];

	// Combine plans into single tree or inspect statement-by-statement
	const topStudentPlan = studentExplain.plans[0];
	const topRefPlan = refExplain.plans[0];

	if (topStudentPlan) {
		// 1. Unnecessary Seq Scan on large table
		const largeSeqScans = findSeqScansOnLargeTables(
			topStudentPlan,
			topRefPlan,
			penaltiesConfig.largeTableThresholdRows
		);
		for (const item of largeSeqScans) {
			const penalty = penaltiesConfig.seqScanOnLargeTable;
			const symptom = `Sequential scan performed on table "${item.table}"`;
			penalties.push({
				reason: `Unnecessary sequential scan on table "${item.table}"`,
				penalty,
				symptom
			});
			symptoms.push(symptom);
		}

		// 2. Correlated SubPlan
		const studSubplans = studentExplain.plans.reduce((acc, p) => acc + countCorrelatedSubplans(p), 0);
		const refSubplans = refExplain.plans.reduce((acc, p) => acc + countCorrelatedSubplans(p), 0);
		if (studSubplans > refSubplans) {
			const diff = studSubplans - refSubplans;
			const penalty = diff * penaltiesConfig.correlatedSubPlan;
			const symptom = `Correlated subplan evaluated per row (${studSubplans} occurrence(s))`;
			penalties.push({
				reason: 'Correlated subplan re-executed per row',
				penalty,
				symptom
			});
			symptoms.push(symptom);
		}

		// 3. Extra Table Scans
		const studScans: Record<string, number> = {};
		for (const p of studentExplain.plans) countScansPerTable(p, studScans);
		const refScans: Record<string, number> = {};
		for (const p of refExplain.plans) countScansPerTable(p, refScans);

		for (const [table, sCount] of Object.entries(studScans)) {
			const rCount = refScans[table] || 0;
			if (sCount > rCount) {
				const extra = sCount - rCount;
				const penalty = extra * penaltiesConfig.extraTableScans;
				const symptom = `Table "${table}" is scanned ${sCount} times (reference scans it ${rCount} time(s))`;
				penalties.push({
					reason: `Extra scan on table "${table}"`,
					penalty,
					symptom
				});
				symptoms.push(symptom);
			}
		}

		// 4. Extra Sort nodes
		const studSorts = studentExplain.plans.reduce((acc, p) => acc + countSortNodes(p), 0);
		const refSorts = refExplain.plans.reduce((acc, p) => acc + countSortNodes(p), 0);
		if (studSorts > refSorts) {
			const extra = studSorts - refSorts;
			const penalty = extra * penaltiesConfig.extraSortNodes;
			const symptom = `Sort operation performed ${studSorts} time(s) (reference requires ${refSorts})`;
			penalties.push({
				reason: 'Extra sort nodes beyond reference',
				penalty,
				symptom
			});
			symptoms.push(symptom);
		}

		// 5. Inefficient Nested Loop
		const inefficientLoops = countInefficientNestedLoops(topStudentPlan, topRefPlan);
		if (inefficientLoops > 0) {
			const penalty = inefficientLoops * penaltiesConfig.inefficientNestedLoop;
			const symptom = 'Nested loop join with sequential scan on inner side';
			penalties.push({
				reason: 'Inefficient nested loop join',
				penalty,
				symptom
			});
			symptoms.push(symptom);
		}

		// 6. Repeated CTE materialization/scans
		const studCtes = studentExplain.plans.reduce((acc, p) => acc + countCteScans(p), 0);
		const refCtes = refExplain.plans.reduce((acc, p) => acc + countCteScans(p), 0);
		if (studCtes > refCtes) {
			const diff = studCtes - refCtes;
			const penalty = diff * penaltiesConfig.repeatedCteMaterialization;
			const symptom = `Repeated scan on materialized result (${studCtes} scan(s))`;
			penalties.push({
				reason: 'Repeated CTE scan or materialization',
				penalty,
				symptom
			});
			symptoms.push(symptom);
		}
	}

	const totalPenalty = penalties.reduce((acc, p) => acc + p.penalty, 0);
	const planScore = Math.max(0, 100 - totalPenalty);
	const finalScore = Math.round(0.5 * costScore + 0.5 * planScore);
	const passed = finalScore >= EXAM_PASS_THRESHOLD;

	return {
		passed,
		finalScore,
		gatePassed: true,
		integrityPassed: true,
		costScore: Math.round(costScore),
		planScore,
		referenceCost: Math.round(refCost * 100) / 100,
		studentCost: Math.round(studCost * 100) / 100,
		symptoms,
		penalties
	};
}
