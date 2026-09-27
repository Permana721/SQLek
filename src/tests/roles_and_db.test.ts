import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';
import { createDbEngine, type IDbEngine } from '$lib/db/engine';

function jsonEquals(a: any, b: any): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

describe('Feature 1 & Feature 2: Role, Privilege & Database Management Questions', () => {
	const mod9 = MODULES.find((m) => m.id === 9)!;
	const targetIds = [935, 936, 937, 938, 939, 940];

	it('Module 9 contains all new questions with unique IDs and proper slots', () => {
		for (const id of targetIds) {
			const q = mod9.questions.find((item) => item.id === id);
			expect(q).toBeDefined();
			expect(q?.moduleId).toBe(9);
			if (id <= 939) {
				expect(q?.categorySlot).toBe(9);
			} else {
				expect(q?.categorySlot).toBe(10);
			}
		}
	});

	describe('PostgreSQL Execution & Catalog Verification', () => {
		let engine: IDbEngine;

		beforeEach(async () => {
			engine = createDbEngine('postgres');
		});

		afterEach(async () => {
			if (engine) {
				await engine.destroy();
			}
		});

		it('935: CREATE ROLE registers rolname in pg_roles', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 935)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([{ rolname: 'eko' }]);
		});

		it('936: ALTER ROLE WITH LOGIN PASSWORD updates rolcanlogin in pg_roles', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 936)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([{ rolname: 'eko', rolcanlogin: true }]);
		});

		it('937: GRANT SELECT, INSERT ON products records grants in role_table_grants', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 937)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([
				{ grantee: 'eko', privilege_type: 'INSERT' },
				{ grantee: 'eko', privilege_type: 'SELECT' }
			]);
		});

		it('938: REVOKE INSERT ON products leaves only SELECT in role_table_grants', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 938)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([{ grantee: 'eko', privilege_type: 'SELECT' }]);
		});

		it('939: CREATE ROLE WITH LOGIN registers rolcanlogin = true', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 939)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([{ rolname: 'intern', rolcanlogin: true }]);
		});

		it('940: CREATE DATABASE registers datname in pg_database', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 940)!, 'postgres');
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res = await engine.query(q.verification_query!);
			expect(res.rows).toEqual([{ datname: 'belajar_sql' }]);
		});

		it('Auto-reset isolation: running 935 repeatedly does not fail with duplicate role error', async () => {
			const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === 935)!, 'postgres');
			// Run 1
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res1 = await engine.query(q.verification_query!);
			expect(res1.rows).toEqual([{ rolname: 'eko' }]);

			// Run 2 without recreating engine — engine.init cleans up user roles
			await engine.init(q.seed_sql);
			await engine.query(q.expected_query);
			const res2 = await engine.query(q.verification_query!);
			expect(res2.rows).toEqual([{ rolname: 'eko' }]);
		});
	});

	describe('MySQL (sql.js) Execution & Override Compatibility', () => {
		let engine: IDbEngine;

		beforeEach(async () => {
			engine = createDbEngine('mysql');
		});

		afterEach(async () => {
			if (engine) {
				await engine.destroy();
			}
		});

		it('MySQL overrides for 935-940 execute cleanly and verification passes', async () => {
			for (const id of targetIds) {
				const q = resolveQuestionForEngine(mod9.questions.find((item) => item.id === id)!, 'mysql');
				expect(q.expected_query).toBeTruthy();
				expect(q.verification_query).toBeTruthy();

				await engine.init(q.seed_sql);
				const uRes = await engine.query(q.expected_query);
				expect(uRes).toBeDefined();

				const vRes = await engine.query(q.verification_query!);
				expect(vRes.rows.length).toBeGreaterThan(0);
			}
		});
	});
});
