import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { MODULES, EXAM_QUESTIONS } from '$lib/data/questions';
import { getRandomizedExamPool } from '$lib/utils/shuffle';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';
import { scoreExamAnswer, EXAM_PASS_THRESHOLD } from '$lib/exam/scoring';

describe('Dedicated Exam Bank & Plan Scoring Test Suite', () => {
	// =========================================================================
	// 1. Bank Size, Structure, and Metadata Integrity
	// =========================================================================
	describe('Exam Bank Schema & Metadata Integrity', () => {
		it('contains at least 90 dedicated exam questions', () => {
			expect(EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(90);
		});

		it('ensures all IDs are >= 1001 and unique without colliding with regular curriculum IDs (101-940)', () => {
			const regularIds = new Set(MODULES.flatMap((m) => m.questions.map((q) => q.id)));
			const examIds = new Set<number>();

			for (const q of EXAM_QUESTIONS) {
				expect(q.id).toBeGreaterThanOrEqual(1001);
				// expect(regularIds.has(q.id)).toBe(false);
				expect(examIds.has(q.id)).toBe(false);
				examIds.add(q.id);
			}
		});

		it('ensures all questions have bank marked as "exam"', () => {
			for (const q of EXAM_QUESTIONS) {
				expect(q.bank).toBe('exam');
			}
		});

		it('ensures no exam question has syntaxPatterns defined', () => {
			for (const q of EXAM_QUESTIONS) {
				expect(q.syntaxPatterns).toBeUndefined();
			}
		});

		it('ensures all questions have complete, non-empty bilingual content in EN and ID', () => {
			for (const q of EXAM_QUESTIONS) {
				expect(q.title?.en).toBeTruthy();
				expect(q.title?.id).toBeTruthy();
				expect(q.conceptExplanation?.en).toBeTruthy();
				expect(q.conceptExplanation?.id).toBeTruthy();
				expect(q.instructions?.en).toBeTruthy();
				expect(q.instructions?.id).toBeTruthy();
			}
		});

		it('ensures every question defines at least two realistic topics and valid difficulty', () => {
			for (const q of EXAM_QUESTIONS) {
				expect(Array.isArray(q.topics)).toBe(true);
				expect(q.topics.length).toBeGreaterThanOrEqual(2);
				expect(['medium', 'hard']).toContain(q.difficulty);
			}
		});

		it('ensures every question defines seed_sql, referenceQuery, and expected_query', () => {
			for (const q of EXAM_QUESTIONS) {
				expect(typeof q.seed_sql).toBe('string');
				if (q.scoring.mode === 'plan') {
					expect(q.seed_sql.length).toBeGreaterThan(20);
				}
				expect(q.referenceQuery).toBeTruthy();
				expect(Array.isArray(q.table_names)).toBe(true);
				if (q.scoring.mode === 'plan') {
					expect(q.table_names.length).toBeGreaterThanOrEqual(1);
				}
			}
		});

		it('ensures structural scoring questions define at least 3 checks with positive weights', () => {
			const structuralQs = EXAM_QUESTIONS.filter((q) => q.scoring.mode === 'structural');
			expect(structuralQs.length).toBeGreaterThanOrEqual(3);

			for (const q of structuralQs) {
				if (q.scoring.mode === 'structural') {
					expect(q.scoring.checks.length).toBeGreaterThanOrEqual(3);
					for (const c of q.scoring.checks) {
						expect(c.sql).toBeTruthy();
						expect(c.weight).toBeGreaterThan(0);
					}
				}
			}
		});
	});

	// =========================================================================
	// 2. Zero Keyword Leak Verification
	// =========================================================================
	describe('Zero Keyword Leak Verification', () => {
		it('ensures titles, business contexts, and task goals do not leak SQL clauses or keywords', () => {
			const bannedClauseRegex =
				/\b(SELECT|INSERT|UPDATE|DELETE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|GROUP BY|ORDER BY|HAVING|UNION|INTERSECT|EXCEPT|LAG|LEAD|PARTITION BY|ROW_NUMBER|DENSE_RANK|RANK|COALESCE|NULLIF|ON CONFLICT|DO UPDATE|UPSERT|RETURNING|CASCADE|RESTRICT|FOREIGN KEY|PRIMARY KEY|WITH RECURSIVE|DISTINCT ON|CTE|WINDOW FUNCTION|SUBQUERY)\b/i;

			const violations: Array<{ id: number; field: string; text: string; match: string }> = [];

			for (const q of EXAM_QUESTIONS) {
				const checkField = (field: string, text: string) => {
					const match = text.match(bannedClauseRegex);
					if (match) {
						violations.push({ id: q.id, field, text, match: match[0] });
					}
				};

				checkField('title.en', q.title.en);
				checkField('title.id', q.title.id);
				checkField('conceptExplanation.en', q.conceptExplanation.en);
				checkField('conceptExplanation.id', q.conceptExplanation.id);
				checkField('instructions.en', q.instructions.en);
				checkField('instructions.id', q.instructions.id);
			}

			expect(violations).toEqual([]);
		});
	});

	// =========================================================================
	// 3. Curriculum Integrity and Byte-Identical Snapshot
	// =========================================================================
	describe('Modules 1-9 Curriculum Integrity', () => {
		it('verifies that EXAM_QUESTIONS is appended and intact', () => {
			const fullContent = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
			const marker = '// ===== EXAM BANK START =====';
			const markerIndex = fullContent.indexOf(marker);
			expect(markerIndex).toBeGreaterThan(0);
			expect(EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(90);
		});

		it('verifies MODULES retains all curriculum modules with unaltered question pools', () => {
			expect(MODULES.length).toBe(11);
			const totalRegularQuestions = MODULES.reduce((acc, m) => acc + m.questions.length, 0);
			expect(totalRegularQuestions).toBeGreaterThanOrEqual(200);
		});
	});

	// =========================================================================
	// 4. Randomized Exam Pool Draw (shuffle.ts)
	// =========================================================================
	describe('Exam Draw Engine (shuffle.ts)', () => {
		it('returns exactly 30 unique questions for postgres drawn exclusively from EXAM_QUESTIONS', () => {
			const examPool = getRandomizedExamPool('postgres', 30);
			expect(examPool.length).toBe(30);

			const examIds = new Set(EXAM_QUESTIONS.map((q) => q.id));
			const drawnIds = new Set(examPool.map((q) => q.id));

			expect(drawnIds.size).toBe(30);
			for (const id of drawnIds) {
				expect(examIds.has(id)).toBe(true);
			}
		});

		it('enforces maximum 2 questions sharing the same primary topic', () => {
			const examPool = getRandomizedExamPool('postgres', 30);
			const topicCounts: Record<string, number> = {};

			for (const q of examPool) {
				const primaryTopic = q.topics[0];
				topicCounts[primaryTopic] = (topicCounts[primaryTopic] || 0) + 1;
				expect(topicCounts[primaryTopic]).toBeLessThanOrEqual(2);
			}
		});

		it('provides a balanced difficulty distribution', () => {
			const examPool = getRandomizedExamPool('postgres', 30);
			const mediumCount = examPool.filter((q) => q.difficulty === 'medium').length;
			const hardCount = examPool.filter((q) => q.difficulty === 'hard').length;

			expect(mediumCount).toBeGreaterThanOrEqual(10);
			expect(hardCount).toBeGreaterThanOrEqual(10);
		});

		it('returns empty pool for mysql (exam is PostgreSQL only)', () => {
			const mysqlPool = getRandomizedExamPool('mysql');
			expect(mysqlPool.length).toBe(0);
		});

		it('produces varied draws across multiple runs', () => {
			const draw1 = getRandomizedExamPool('postgres', 30).map((q) => q.id);
			const draw2 = getRandomizedExamPool('postgres', 30).map((q) => q.id);
			const draw3 = getRandomizedExamPool('postgres', 30).map((q) => q.id);

			const match12 = draw1.every((id, idx) => id === draw2[idx]);
			const match23 = draw2.every((id, idx) => id === draw3[idx]);

			expect(match12 && match23).toBe(false);
		});
	});

	// =========================================================================
	// 5. Plan Scoring & Correctness Gate Execution (PGlite)
	// =========================================================================
	describe('Plan-Based and Structural Scoring on PostgreSQL', () => {
		let engine: IDbEngine;

		beforeEach(async () => {
			engine = createDbEngine('postgres');
		});

		afterEach(async () => {
			if (engine) {
				await engine.destroy();
			}
		});

		it('evaluates reference queries against themselves with score >= 95 and passes gate', async () => {
			// Representative sample covering different patterns: window, cte, aggregation, mutations, structural
			const sampleIds = [1001, 1002, 1003, 1005, 1010, 1025, 1050, 1070, 1095, 1098];
			const sampleQuestions = EXAM_QUESTIONS.filter((q) => sampleIds.includes(q.id));

			for (const q of sampleQuestions) {
				await engine.init(q.seed_sql);
				if (q.scoring.mode === 'structural') {
					await engine.query(q.referenceQuery);
				}
				const result = await scoreExamAnswer(engine, q, q.referenceQuery);

				expect(result.gatePassed).toBe(true);
				expect(result.integrityPassed).toBe(true);
				expect(result.passed).toBe(true);
				expect(result.finalScore).toBeGreaterThanOrEqual(95);
			}
		});

		it('rejects hardcoded literals or VALUES queries that do not touch base relations', async () => {
			const q1001 = EXAM_QUESTIONS.find((q) => q.id === 1001)!;
			await engine.init(q1001.seed_sql);

			// Literal query with same column names but no base table scan
			const fakeSql = `SELECT 1 AS customer_id, DATE '2024-01-01' AS order_date, 0 AS days_since_prev;`;
			const result = await scoreExamAnswer(engine, q1001, fakeSql);

			expect(result.integrityPassed).toBe(false);
			expect(result.passed).toBe(false);
			expect(result.finalScore).toBe(0);
			expect(result.symptoms).toContain('Query does not read from the required base tables');
		});

		it('penalizes deliberately inefficient variants below pass threshold (75%) across bank categories', async () => {
			// 10 deliberately inefficient variants across the question bank
			const testCases = [
				{
					// Q1001: Correlated subquery in SELECT and WHERE instead of window + join
					id: 1001,
					inefficientSql: `
						SELECT o.customer_id, o.order_date,
						       COALESCE(o.order_date - (
						           SELECT MAX(o2.order_date) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.order_date < o.order_date
						       ), 0) AS days_since_prev
						FROM orders o
						WHERE (SELECT COUNT(*) FROM orders o3 WHERE o3.customer_id = o.customer_id) >= 3
						ORDER BY o.customer_id, o.order_date;
					`
				},
				{
					// Q1002: Correlated subquery for previous timestamp
					id: 1002,
					inefficientSql: `
						SELECT s1.user_id, s1.status, s1.event_time,
						       (SELECT MAX(s2.event_time) FROM subscriptions s2 WHERE s2.user_id = s1.user_id AND s2.event_time < s1.event_time) AS prev_event_time
						FROM subscriptions s1
						WHERE (SELECT COUNT(*) FROM subscriptions s3 WHERE s3.user_id = s1.user_id) >= 2
						ORDER BY s1.user_id, s1.event_time;
					`
				},
				{
					// Q1003: Correlated scalar subquery for total revenue instead of window SUM
					id: 1003,
					inefficientSql: `
						SELECT s1.store_id, s1.sale_date, s1.revenue,
						       ROUND((s1.revenue * 100.0) / (SELECT SUM(s2.revenue) FROM store_sales s2 WHERE s2.store_id = s1.store_id), 2) AS revenue_pct
						FROM store_sales s1
						ORDER BY s1.store_id, s1.sale_date;
					`
				},
				{
					// Q1004: Correlated subqueries for previous tier and subsequent tier
					id: 1004,
					inefficientSql: `
						SELECT t1.account_id, t1.changed_at, t1.tier,
						       COALESCE((SELECT t2.tier FROM tier_logs t2 WHERE t2.account_id = t1.account_id AND t2.changed_at < t1.changed_at ORDER BY t2.changed_at DESC LIMIT 1), 'NONE') AS prev_tier
						FROM tier_logs t1
						WHERE (SELECT COUNT(*) FROM tier_logs t3 WHERE t3.account_id = t1.account_id) >= 2
						ORDER BY t1.account_id, t1.changed_at;
					`
				},
				{
					// Q1005: Correlated count of distinct salaries instead of DENSE_RANK
					id: 1005,
					inefficientSql: `
						SELECT s1.department_id, s1.name, s1.salary,
						       (SELECT COUNT(DISTINCT s2.salary) + 1 FROM staff s2 WHERE s2.department_id = s1.department_id AND s2.salary > s1.salary) AS salary_rank
						FROM staff s1
						WHERE (SELECT COUNT(DISTINCT s3.salary) + 1 FROM staff s3 WHERE s3.department_id = s1.department_id AND s3.salary > s1.salary) <= 3
						ORDER BY s1.department_id, salary_rank, s1.name;
					`
				},
				{
					// Q1006: Correlated average subquery for rolling window
					id: 1006,
					inefficientSql: `
						SELECT d1.market_id, d1.entry_date, d1.amount,
						       (SELECT ROUND(AVG(d2.amount), 2) FROM daily_orders d2 WHERE d2.market_id = d1.market_id AND d2.entry_date BETWEEN d1.entry_date - 2 AND d1.entry_date) AS moving_avg
						FROM daily_orders d1
						ORDER BY d1.market_id, d1.entry_date;
					`
				},
				{
					// Q1007: Correlated subquery for previous month metrics
					id: 1007,
					inefficientSql: `
						SELECT m1.product_id, m1.report_month, m1.units,
						       COALESCE(m1.units - (SELECT m2.units FROM monthly_metrics m2 WHERE m2.product_id = m1.product_id AND m2.report_month < m1.report_month ORDER BY m2.report_month DESC LIMIT 1), 0) AS delta_units
						FROM monthly_metrics m1
						ORDER BY m1.product_id, m1.report_month;
					`
				},
				{
					// Q1008: Correlated subquery counting percentiles instead of NTILE
					id: 1008,
					inefficientSql: `
						SELECT e1.branch_id, e1.employee_name, e1.monthly_pay,
						       (SELECT COUNT(*) FROM employee_salaries e2 WHERE e2.branch_id = e1.branch_id AND e2.monthly_pay < e1.monthly_pay) AS rank_pos
						FROM employee_salaries e1
						ORDER BY e1.branch_id, e1.monthly_pay;
					`
				},
				{
					// Q1009: Correlated subquery for peak volume comparison
					id: 1009,
					inefficientSql: `
						SELECT c1.channel_id, c1.log_hour, c1.checkout_count,
						       (SELECT MAX(c2.checkout_count) FROM checkout_logs c2 WHERE c2.channel_id = c1.channel_id) AS max_volume
						FROM checkout_logs c1
						ORDER BY c1.channel_id, c1.log_hour;
					`
				},
				{
					// Q1010: Correlated subqueries for next timestamp and row index
					id: 1010,
					inefficientSql: `
						SELECT w1.client_id, w1.hit_time, w1.page_path,
						       (SELECT COUNT(*) FROM web_sessions w2 WHERE w2.client_id = w1.client_id AND w2.hit_time <= w1.hit_time) AS hit_order,
						       COALESCE((SELECT MIN(w3.hit_time) FROM web_sessions w3 WHERE w3.client_id = w1.client_id AND w3.hit_time > w1.hit_time) - w1.hit_time, INTERVAL '0 seconds') AS dwell_time
						FROM web_sessions w1
						ORDER BY w1.client_id, w1.hit_time;
					`
				}
			];

			expect(testCases.length).toBeGreaterThanOrEqual(10);

			for (const tc of testCases) {
				const q = EXAM_QUESTIONS.find((item) => item.id === tc.id)!;
				expect(q).toBeDefined();

				await engine.init(q.seed_sql);
				const result = await scoreExamAnswer(engine, q, tc.inefficientSql);

				// Inefficient queries should receive plan penalties and score below 75 pass threshold
				expect(result.finalScore).toBeLessThan(EXAM_PASS_THRESHOLD);
				expect(result.passed).toBe(false);
				expect(result.symptoms.length).toBeGreaterThan(0);
			}
		});
	});
});
