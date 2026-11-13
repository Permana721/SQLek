import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	extractExplainJson,
	detectExplainQuery,
	buildEnrichedPlanTree,
	executeExplainJson
} from '$lib/exam/planVisualizer';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';

describe('Interactive PostgreSQL Execution Plan Visualizer Test Suite', () => {
	describe('extractExplainJson Parser', () => {
		it('safely extracts plan from parsed JavaScript array', () => {
			const dbRes = {
				columns: ['QUERY PLAN'],
				rows: [
					{
						'QUERY PLAN': [
							{
								Plan: {
									'Node Type': 'Seq Scan',
									'Relation Name': 'orders',
									'Startup Cost': 0.0,
									'Total Cost': 25.0,
									'Plan Rows': 500
								}
							}
						]
					}
				]
			};
			const plan = extractExplainJson(dbRes);
			expect(plan).toBeDefined();
			expect(plan.Plan['Node Type']).toBe('Seq Scan');
			expect(plan.Plan['Relation Name']).toBe('orders');
		});

		it('safely extracts plan from raw JSON string literal', () => {
			const rawString = JSON.stringify([
				{
					Plan: {
						'Node Type': 'Index Scan',
						'Index Name': 'idx_orders_customer',
						'Startup Cost': 0.28,
						'Total Cost': 8.3,
						'Plan Rows': 10
					}
				}
			]);
			const dbRes = {
				columns: ['QUERY PLAN'],
				rows: [{ 'QUERY PLAN': rawString }]
			};
			const plan = extractExplainJson(dbRes);
			expect(plan).toBeDefined();
			expect(plan.Plan['Node Type']).toBe('Index Scan');
			expect(plan.Plan['Index Name']).toBe('idx_orders_customer');
		});

		it('handles case-insensitive QUERY PLAN column naming', () => {
			const dbRes = {
				columns: ['query plan'],
				rows: [
					{
						'query plan': {
							Plan: {
								'Node Type': 'Hash Join',
								'Startup Cost': 15.0,
								'Total Cost': 45.0
							}
						}
					}
				]
			};
			const plan = extractExplainJson(dbRes);
			expect(plan).toBeDefined();
			expect(plan.Plan['Node Type']).toBe('Hash Join');
		});

		it('returns null on malformed or non-plan results', () => {
			expect(extractExplainJson(null)).toBeNull();
			expect(extractExplainJson({ columns: [], rows: [] })).toBeNull();
			expect(extractExplainJson({ columns: ['id'], rows: [{ id: 1 }] })).toBeNull();
			expect(extractExplainJson({ columns: ['QUERY PLAN'], rows: [{ 'QUERY PLAN': 'Seq Scan on table' }] })).toBeNull();
		});
	});

	describe('detectExplainQuery Analyzer', () => {
		it('detects standard EXPLAIN query', () => {
			const res = detectExplainQuery('EXPLAIN SELECT * FROM orders WHERE id = 1;');
			expect(res.isExplain).toBe(true);
			expect(res.hasAnalyze).toBe(false);
			expect(res.isMutating).toBe(false);
			expect(res.innerSql).toBe('SELECT * FROM orders WHERE id = 1;');
		});

		it('detects EXPLAIN ANALYZE query', () => {
			const res = detectExplainQuery('EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders;');
			expect(res.isExplain).toBe(true);
			expect(res.hasAnalyze).toBe(true);
			expect(res.isMutating).toBe(false);
			expect(res.innerSql).toBe('SELECT * FROM orders;');
		});

		it('detects mutating queries with EXPLAIN ANALYZE', () => {
			const res = detectExplainQuery('EXPLAIN ANALYZE DELETE FROM orders WHERE status = false;');
			expect(res.isExplain).toBe(true);
			expect(res.hasAnalyze).toBe(true);
			expect(res.isMutating).toBe(true);
			expect(res.innerSql).toBe('DELETE FROM orders WHERE status = false;');
		});

		it('handles non-explain query correctly', () => {
			const res = detectExplainQuery('SELECT * FROM items;');
			expect(res.isExplain).toBe(false);
			expect(res.hasAnalyze).toBe(false);
			expect(res.isMutating).toBe(false);
			expect(res.innerSql).toBe('SELECT * FROM items;');
		});
	});

	describe('buildEnrichedPlanTree - Calculations & Diagnostics', () => {
		it('correctly calculates inclusive vs exclusive costs and percentages', () => {
			const mockRawPlan = {
				Plan: {
					'Node Type': 'Aggregate',
					'Startup Cost': 100.0,
					'Total Cost': 120.0,
					'Plan Rows': 1,
					'Plan Width': 8,
					Plans: [
						{
							'Node Type': 'Sort',
							'Startup Cost': 70.0,
							'Total Cost': 80.0,
							'Plan Rows': 100,
							'Plan Width': 8,
							Plans: [
								{
									'Node Type': 'Seq Scan',
									'Relation Name': 'items',
									'Startup Cost': 0.0,
									'Total Cost': 50.0,
									'Plan Rows': 100,
									'Plan Width': 8
								}
							]
						}
					]
				}
			};

			const summary = buildEnrichedPlanTree(mockRawPlan);
			expect(summary).toBeDefined();
			if (!summary) return;

			expect(summary.totalCost).toBe(120.0);

			// Root node (Aggregate)
			const root = summary.rootNode;
			expect(root.totalCost).toBe(120.0); // Inclusive subtree cost
			expect(root.exclusiveCost).toBe(40.0); // 120.0 - 80.0
			expect(root.costPercent).toBe(100);
			expect(root.exclusiveCostPercent).toBe(33.3);

			// Child node (Sort)
			const sortNode = root.plans[0];
			expect(sortNode.totalCost).toBe(80.0); // Inclusive subtree cost
			expect(sortNode.exclusiveCost).toBe(30.0); // 80.0 - 50.0
			expect(sortNode.costPercent).toBe(66.7);
			expect(sortNode.exclusiveCostPercent).toBe(25);

			// Leaf node (Seq Scan)
			const leafNode = sortNode.plans[0];
			expect(leafNode.totalCost).toBe(50.0);
			expect(leafNode.exclusiveCost).toBe(50.0); // No children
			expect(leafNode.costPercent).toBe(41.7);
			expect(leafNode.exclusiveCostPercent).toBe(41.7);
		});

		it('identifies health and bottleneck warnings accurately', () => {
			const mockBottleneckPlan = {
				Plan: {
					'Node Type': 'Sort',
					'Startup Cost': 200.0,
					'Total Cost': 250.0,
					'Plan Rows': 10,
					'Sort Space Type': 'Disk',
					'Sort Space Used': 2048,
					Plans: [
						{
							'Node Type': 'Seq Scan',
							'Relation Name': 'large_audit_logs',
							'Startup Cost': 0.0,
							'Total Cost': 180.0,
							'Plan Rows': 1500,
							'Actual Rows': 1500
						}
					]
				}
			};

			const summary = buildEnrichedPlanTree(mockBottleneckPlan);
			expect(summary).toBeDefined();
			if (!summary) return;

			expect(summary.warningCount).toBe(2);

			const root = summary.rootNode;
			expect(root.health).toBe('warning');
			expect(root.warnings.some((w) => w.en.includes('spilled to disk'))).toBe(true);

			const scanChild = root.plans[0];
			expect(scanChild.health).toBe('warning');
			expect(scanChild.warnings.some((w) => w.en.includes('scanned 1500 rows'))).toBe(true);
		});

		it('flags large row estimation discrepancy when actual rows diverge', () => {
			const mockDiscrepancyPlan = {
				Plan: {
					'Node Type': 'Bitmap Heap Scan',
					'Relation Name': 'orders',
					'Startup Cost': 4.0,
					'Total Cost': 30.0,
					'Plan Rows': 10,
					'Actual Rows': 600, // 60x difference!
					'Actual Total Time': 2.5
				}
			};

			const summary = buildEnrichedPlanTree(mockDiscrepancyPlan);
			expect(summary).toBeDefined();
			if (!summary) return;

			expect(summary.warningCount).toBe(1);
			expect(summary.rootNode.health).toBe('warning');
			expect(summary.rootNode.warnings[0].en).toContain('Row estimate discrepancy');
		});

		it('correctly aggregates buffer cache statistics', () => {
			const mockPlanWithBuffers = {
				Plan: {
					'Node Type': 'Index Scan',
					'Index Name': 'idx_items',
					'Startup Cost': 0.15,
					'Total Cost': 8.2,
					'Plan Rows': 5,
					'Shared Hit Blocks': 95,
					'Shared Read Blocks': 5
				}
			};

			const summary = buildEnrichedPlanTree(mockPlanWithBuffers);
			expect(summary?.bufferSummary).toBeDefined();
			expect(summary?.bufferSummary?.sharedHit).toBe(95);
			expect(summary?.bufferSummary?.sharedRead).toBe(5);
			expect(summary?.bufferSummary?.hitRatio).toBe(95);
		});
	});

	describe('PostgreSQL Integration with PGliteEngine', () => {
		let engine: IDbEngine;

		beforeEach(() => {
			engine = createDbEngine('postgres');
		});

		afterEach(async () => {
			await engine.destroy();
		});

		it('executes JSON explain query and builds full plan tree', async () => {
			await engine.init(`
				CREATE TABLE users (
					id SERIAL PRIMARY KEY,
					email VARCHAR(100) UNIQUE,
					score INT
				);
				INSERT INTO users (email, score)
				SELECT 'user_' || g || '@example.com', g * 10
				FROM generate_series(1, 100) g;
				ANALYZE users;
			`);

			const summary = await executeExplainJson(
				engine,
				'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE score > 500;'
			);

			expect(summary).toBeDefined();
			if (!summary) return;

			expect(summary.hasAnalyze).toBe(true);
			expect(summary.totalCost).toBeGreaterThan(0);
			expect(summary.rootNode.nodeType).toBeDefined();
			expect(summary.rootNode.planRows).toBeGreaterThan(0);
		});

		it('safely rolls back mutating query when executing EXPLAIN ANALYZE', async () => {
			await engine.init(`
				CREATE TABLE inventory (
					id INT PRIMARY KEY,
					item_name TEXT
				);
				INSERT INTO inventory VALUES (1, 'Widget A'), (2, 'Widget B');
			`);

			// Run mutating EXPLAIN ANALYZE DELETE query
			const summary = await executeExplainJson(
				engine,
				'EXPLAIN ANALYZE DELETE FROM inventory WHERE id = 1;'
			);

			expect(summary).toBeDefined();
			expect(summary?.hasAnalyze).toBe(true);

			// Verify the inventory table still contains Widget A (row was not permanently deleted!)
			const checkRes = await engine.query('SELECT count(*) as count FROM inventory;');
			expect(Number(checkRes.rows[0].count)).toBe(2);
		});
	});
});
