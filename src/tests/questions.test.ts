import { describe, it, expect } from 'vitest';
import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';
import { getRandomizedExamPool, sampleDiverseQuestions } from '$lib/utils/shuffle';

describe('Curriculum & Question Bank Integrity', () => {
	const allQuestions: Question[] = MODULES.flatMap((m) => m.questions);

	describe('Curriculum Structure', () => {
		it('contains exactly 11 curriculum modules', () => {
			expect(MODULES.length).toBe(11);
			const moduleIds = MODULES.map((m) => m.id);
			expect(moduleIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
		});

		it('each module contains a valid non-empty questions pool', () => {
			for (const mod of MODULES) {
				expect(mod.questions.length).toBeGreaterThan(0);
				expect(mod.title.en).toBeTruthy();
				expect(mod.title.id).toBeTruthy();
				expect(mod.description.en).toBeTruthy();
				expect(mod.description.id).toBeTruthy();
			}
		});
	});

	describe('Schema Validation', () => {
		it('every question has a unique numeric ID', () => {
			const idSet = new Set<number>();
			for (const q of allQuestions) {
				expect(typeof q.id).toBe('number');
				expect(q.id).toBeGreaterThan(0);
				expect(idSet.has(q.id)).toBe(false);
				idSet.add(q.id);
			}
			expect(idSet.size).toBe(allQuestions.length);
		});

		it('every question defines a positive integer categorySlot', () => {
			for (const q of allQuestions) {
				expect(typeof q.categorySlot).toBe('number');
				expect(q.categorySlot).toBeGreaterThan(0);
			}
		});

		it('every question has non-empty localized instructions in EN and ID', () => {
			for (const q of allQuestions) {
				expect(q.instructions).toBeDefined();
				expect(typeof q.instructions.en).toBe('string');
				expect(q.instructions.en.trim().length).toBeGreaterThan(0);
				expect(typeof q.instructions.id).toBe('string');
				expect(q.instructions.id.trim().length).toBeGreaterThan(0);
			}
		});

		it('every question has non-empty localized concept explanations in EN and ID', () => {
			for (const q of allQuestions) {
				expect(q.conceptExplanation).toBeDefined();
				expect(typeof q.conceptExplanation.en).toBe('string');
				expect(q.conceptExplanation.en.trim().length).toBeGreaterThan(0);
				expect(typeof q.conceptExplanation.id).toBe('string');
				expect(q.conceptExplanation.id.trim().length).toBeGreaterThan(0);
			}
		});

		it('every question provides a valid expected_query and starterQuery', () => {
			for (const q of allQuestions) {
				expect(typeof q.expected_query).toBe('string');
				expect(q.expected_query.trim().length).toBeGreaterThan(0);

				expect(typeof q.starterQuery).toBe('string');
				expect(q.starterQuery.trim().length).toBeGreaterThan(0);
			}
		});

		it('every question defines a non-empty table_names array', () => {
			for (const q of allQuestions) {
				expect(Array.isArray(q.table_names)).toBe(true);
				expect(q.table_names.length).toBeGreaterThan(0);
				for (const tbl of q.table_names) {
					expect(typeof tbl).toBe('string');
					expect(tbl.trim().length).toBeGreaterThan(0);
				}
			}
		});
	});

	describe('Dialect & Engine Overrides Isolation', () => {
		it('resolveQuestionForEngine returns complete objects for postgres without undefined required fields', () => {
			for (const q of allQuestions) {
				const pgQ = resolveQuestionForEngine(q, 'postgres');
				expect(pgQ.id).toBe(q.id);
				expect(pgQ.categorySlot).toBe(q.categorySlot);
				expect(pgQ.instructions?.en).toBeTruthy();
				expect(pgQ.instructions?.id).toBeTruthy();
				expect(pgQ.conceptExplanation?.en).toBeTruthy();
				expect(pgQ.conceptExplanation?.id).toBeTruthy();
				expect(pgQ.expected_query?.trim().length).toBeGreaterThan(0);
				expect(pgQ.starterQuery?.trim().length).toBeGreaterThan(0);
				expect(pgQ.table_names?.length).toBeGreaterThan(0);
			}
		});

		it('resolveQuestionForEngine returns complete objects for mysql without undefined required fields', () => {
			for (const q of allQuestions) {
				const myQ = resolveQuestionForEngine(q, 'mysql');
				expect(myQ.id).toBe(q.id);
				expect(myQ.categorySlot).toBe(q.categorySlot);
				expect(myQ.instructions?.en).toBeTruthy();
				expect(myQ.instructions?.id).toBeTruthy();
				expect(myQ.conceptExplanation?.en).toBeTruthy();
				expect(myQ.conceptExplanation?.id).toBeTruthy();
				expect(myQ.expected_query?.trim().length).toBeGreaterThan(0);
				expect(myQ.starterQuery?.trim().length).toBeGreaterThan(0);
				expect(myQ.table_names?.length).toBeGreaterThan(0);
			}
		});

		it('MySQL resolved expected_query does not leak PostgreSQL-exclusive syntax', () => {
			const pgExclusivePatterns = [
				{ name: 'DISTINCT ON', regex: /\bDISTINCT\s+ON\b/i },
				{ name: 'JSONB type', regex: /\bJSONB\b/i },
				{ name: '->> operator', regex: /->>/ },
				{ name: 'ON CONFLICT', regex: /\bON\s+CONFLICT\b/i },
				{ name: 'FILTER (WHERE ...)', regex: /\bFILTER\s*\(\s*WHERE\b/i }
			];

			for (const q of allQuestions) {
				const myQ = resolveQuestionForEngine(q, 'mysql');
				for (const pattern of pgExclusivePatterns) {
					const hasLeak = pattern.regex.test(myQ.expected_query);
					if (hasLeak) {
						throw new Error(
							`Question ID ${myQ.id} ("${myQ.title.en}") leaks PostgreSQL syntax "${pattern.name}" into MySQL expected_query:\n${myQ.expected_query}`
						);
					}
					expect(hasLeak).toBe(false);
				}
			}
		});

		it('PostgreSQL resolved expected_query does not leak MySQL-exclusive syntax', () => {
			const myExclusivePatterns = [
				{ name: 'LAST_INSERT_ID', regex: /\bLAST_INSERT_ID\b/i },
				{ name: 'IFNULL function', regex: /\bIFNULL\s*\(/i },
				{ name: 'LOCK TABLES', regex: /\bLOCK\s+TABLES\b/i },
				{ name: 'LOCK INSTANCE', regex: /\bLOCK\s+INSTANCE\b/i },
				{ name: 'IN BOOLEAN MODE', regex: /\bIN\s+BOOLEAN\s+MODE\b/i },
				{ name: 'IN NATURAL LANGUAGE MODE', regex: /\bIN\s+NATURAL\s+LANGUAGE\s+MODE\b/i },
				{ name: 'MODIFY COLUMN ... AFTER', regex: /\bMODIFY\s+(?:COLUMN\s+)?\w+\s+[\w()]+\s+AFTER\b/i }
			];

			for (const q of allQuestions) {
				const pgQ = resolveQuestionForEngine(q, 'postgres');
				for (const pattern of myExclusivePatterns) {
					const hasLeak = pattern.regex.test(pgQ.expected_query);
					if (hasLeak) {
						throw new Error(
							`Question ID ${pgQ.id} ("${pgQ.title.en}") leaks MySQL syntax "${pattern.name}" into PostgreSQL expected_query:\n${pgQ.expected_query}`
						);
					}
					expect(hasLeak).toBe(false);
				}
			}
		});

		it('MySQL resolved Module 6 set operator questions use INNER JOIN or LEFT JOIN instead of INTERSECT/EXCEPT', () => {
			const intersectIds = [607, 615, 623, 631, 639];
			const exceptIds = [608, 616, 624, 632, 640];

			for (const id of intersectIds) {
				const q = allQuestions.find((item) => item.id === id);
				expect(q).toBeDefined();
				const myQ = resolveQuestionForEngine(q!, 'mysql');
				expect(myQ.expected_query).toMatch(/\bINNER\s+JOIN\b/i);
				expect(myQ.expected_query).not.toMatch(/\bINTERSECT\b/i);
			}

			for (const id of exceptIds) {
				const q = allQuestions.find((item) => item.id === id);
				expect(q).toBeDefined();
				const myQ = resolveQuestionForEngine(q!, 'mysql');
				expect(myQ.expected_query).toMatch(/\bLEFT\s+JOIN\b/i);
				expect(myQ.expected_query).toMatch(/\bIS\s+NULL\b/i);
				expect(myQ.expected_query).not.toMatch(/\bEXCEPT\b/i);
			}
		});

		it('MySQL resolved Module 5 slot 3 questions use CROSS JOIN instead of FULL JOIN', () => {
			const crossJoinIds = [503, 512, 521, 530, 539];
			for (const id of crossJoinIds) {
				const q = allQuestions.find((item) => item.id === id);
				expect(q).toBeDefined();
				const myQ = resolveQuestionForEngine(q!, 'mysql');
				expect(myQ.expected_query).toMatch(/\bCROSS\s+JOIN\b/i);
				expect(myQ.expected_query).not.toMatch(/\bFULL\s+(?:OUTER\s+)?JOIN\b/i);
			}
		});

		it('MySQL resolved Module 8 administration questions use correct lock commands', () => {
			const q807 = allQuestions.find((q) => q.id === 807);
			expect(q807).toBeDefined();
			const my807 = resolveQuestionForEngine(q807!, 'mysql');
			expect(my807.expected_query).toBe('LOCK TABLES accounts WRITE; UNLOCK TABLES;');

			const q811 = allQuestions.find((q) => q.id === 811);
			expect(q811).toBeDefined();
			const my811 = resolveQuestionForEngine(q811!, 'mysql');
			expect(my811.expected_query).toBe('LOCK TABLES accounts READ; UNLOCK TABLES;');

			const q815 = allQuestions.find((q) => q.id === 815);
			expect(q815).toBeDefined();
			const my815 = resolveQuestionForEngine(q815!, 'mysql');
			expect(my815.expected_query).toBe('LOCK INSTANCE FOR BACKUP; UNLOCK INSTANCE;');
		});

		it('MySQL resolved Module 9 questions implement Full-Text BOOLEAN MODE and DCL', () => {
			const q908 = allQuestions.find((q) => q.id === 908);
			expect(q908).toBeDefined();
			const my908 = resolveQuestionForEngine(q908!, 'mysql');
			expect(my908.expected_query).toMatch(/MATCH\(name, description\) AGAINST\('\+wireless -cable' IN BOOLEAN MODE\)/i);

			const q909 = allQuestions.find((q) => q.id === 909);
			expect(q909).toBeDefined();
			const my909 = resolveQuestionForEngine(q909!, 'mysql');
			expect(my909.expected_query).toMatch(/CREATE USER 'reporting_user'@'localhost'/i);
			expect(my909.expected_query).toMatch(/GRANT SELECT ON \*\.\* TO 'reporting_user'@'localhost'/i);

			const q914 = allQuestions.find((q) => q.id === 914);
			expect(q914).toBeDefined();
			const my914 = resolveQuestionForEngine(q914!, 'mysql');
			expect(my914.expected_query).toMatch(/REVOKE SELECT ON \*\.\* FROM 'reporting_user'@'localhost'/i);
		});

		it('MySQL resolved Module 1 questions implement data types, LAST_INSERT_ID, and column reordering', () => {
			const q113 = allQuestions.find((q) => q.id === 113);
			expect(q113).toBeDefined();
			const my113 = resolveQuestionForEngine(q113!, 'mysql');
			expect(my113.expected_query).toMatch(/INT UNSIGNED/i);
			expect(my113.expected_query).toMatch(/ENUM\('draft', 'published'\)/i);

			const q115 = allQuestions.find((q) => q.id === 115);
			expect(q115).toBeDefined();
			const my115 = resolveQuestionForEngine(q115!, 'mysql');
			expect(my115.expected_query).toMatch(/SELECT LAST_INSERT_ID\(\)/i);

			const q119 = allQuestions.find((q) => q.id === 119);
			expect(q119).toBeDefined();
			const my119 = resolveQuestionForEngine(q119!, 'mysql');
			expect(my119.expected_query).toMatch(/MODIFY COLUMN year INT AFTER title/i);
		});

		it('every question with an explanation includes the standard 3-tier Indonesian structure', () => {
			for (const q of allQuestions) {
				const exp = q.conceptExplanation.id;
				if (exp) {
					expect(exp).toContain('Analogi Konseptual:');
					expect(exp).toMatch(/Cara Kerja\s+[^:]+:/i);
					expect(exp).toContain('Best Practices & Catatan Penting:');
				}
				if (q.engineOverrides?.mysql?.conceptExplanation?.id) {
					const myExp = q.engineOverrides.mysql.conceptExplanation.id;
					expect(myExp).toContain('Analogi Konseptual:');
					expect(myExp).toMatch(/Cara Kerja\s+[^:]+:/i);
					expect(myExp).toContain('Best Practices & Catatan Penting:');
				}
			}
		});
	});

	describe('Mock Preview Data for DDL Questions', () => {
		it('every isDdlCreate question provides mockPreviewData with columns and rows', () => {
			const ddlQuestions = allQuestions.filter((q) => q.isDdlCreate === true);
			expect(ddlQuestions.length).toBeGreaterThan(0);

			for (const q of ddlQuestions) {
				expect(q.mockPreviewData).toBeDefined();
				expect(Array.isArray(q.mockPreviewData?.columns)).toBe(true);
				expect(q.mockPreviewData!.columns.length).toBeGreaterThan(0);
				expect(Array.isArray(q.mockPreviewData?.rows)).toBe(true);
				expect(q.mockPreviewData!.rows.length).toBeGreaterThan(0);
			}
		});
	});

	describe('Challenge Mode Randomized Exam Pool', () => {
		it('returns exactly 30 questions by default for postgres', () => {
			const pool = getRandomizedExamPool('postgres');
			expect(pool.length).toBe(30);
			const uniqueIds = new Set(pool.map((q) => q.id));
			expect(uniqueIds.size).toBe(30);
		});

		it('returns empty array for mysql (exam is postgresql only)', () => {
			const pool = getRandomizedExamPool('mysql');
			expect(pool.length).toBe(0);
		});

		it('supports custom questionCount when provided', () => {
			const pool = getRandomizedExamPool('postgres', 15);
			expect(pool.length).toBe(15);
		});

		it('resolves questions for the requested engine (applying engine overrides)', () => {
			const pool = getRandomizedExamPool('postgres', 30);
			for (const q of pool) {
				expect(q.expected_query).toBeTruthy();
				expect(q.instructions.en).toBeTruthy();
			}
		});
	});

	describe('Module 2 Slot 7 DISTINCT Integrity', () => {
		it('verifies instructions, expected_query, and syntaxPatterns consistency across variations', () => {
			const mod2 = MODULES.find((m) => m.id === 2)!;
			const slot7Questions = mod2.questions.filter((q) => q.categorySlot === 7);
			expect(slot7Questions.length).toBe(5);

			for (const q of slot7Questions) {
				if (q.instructions.en.includes('Furniture') || q.instructions.id.includes('Furniture')) {
					expect(q.expected_query).toBe(
						"SELECT DISTINCT status FROM items WHERE category = 'Furniture' ORDER BY status;"
					);
					expect(q.syntaxPatterns?.[0]?.code).toBe(
						"SELECT DISTINCT column_name FROM mytable WHERE filter_col = 'val' ORDER BY column_name;"
					);
				}
				if (q.expected_query === 'SELECT DISTINCT status FROM items ORDER BY status;') {
					expect(q.instructions.en).toBe(
						'Show each unique status, sorted alphabetically.'
					);
					expect(q.instructions.id).toBe(
						'Tampilkan setiap status unik, urut sesuai abjad.'
					);
				}
			}
		});
	});

	describe('Module 9 Mandatory FTS Task Inclusion', () => {
		const mod9 = MODULES.find((m) => m.id === 9)!;

		it('question 941 (Create FTS GIN Index) is flagged isMandatory', () => {
			const q941 = mod9.questions.find((q) => q.id === 941);
			expect(q941).toBeDefined();
			expect(q941!.isMandatory).toBe(true);
			expect(q941!.categorySlot).toBe(12);
		});

		it('question 942 (Search using FTS Index) is flagged isMandatory', () => {
			const q942 = mod9.questions.find((q) => q.id === 942);
			expect(q942).toBeDefined();
			expect(q942!.isMandatory).toBe(true);
			expect(q942!.categorySlot).toBe(13);
		});

		it('sampleDiverseQuestions always includes both mandatory FTS tasks (941 and 942)', () => {
			// Run 10 independent samples to confirm determinism of mandatory inclusion
			for (let i = 0; i < 10; i++) {
				const sampled = sampleDiverseQuestions(mod9.questions);
				const ids = sampled.map((q: Question) => q.id);
				expect(ids).toContain(941);
				expect(ids).toContain(942);
			}
		});

		it('mandatory FTS tasks appear sequentially: index creation (941) before querying (942)', () => {
			const sampled = sampleDiverseQuestions(mod9.questions);
			const idx941 = sampled.findIndex((q: Question) => q.id === 941);
			const idx942 = sampled.findIndex((q: Question) => q.id === 942);
			expect(idx941).toBeGreaterThanOrEqual(0);
			expect(idx942).toBeGreaterThanOrEqual(0);
			expect(idx941).toBeLessThan(idx942);
		});

		it('sampleDiverseQuestions for Module 9 returns at least 15 questions (13 diverse + 2 mandatory)', () => {
			const sampled = sampleDiverseQuestions(mod9.questions);
			// Non-mandatory unique slots: 1-11, 14, 15 → 13 questions; plus 2 mandatory (slots 12, 13)
			expect(sampled.length).toBeGreaterThanOrEqual(15);
		});

		it('Module 9 question 941 MySQL override creates a FULLTEXT index', () => {
			const q941 = mod9.questions.find((q) => q.id === 941)!;
			const myQ = resolveQuestionForEngine(q941, 'mysql');
			expect(myQ.expected_query).toMatch(/CREATE FULLTEXT INDEX idx_documents_body_fts ON documents\(body\)/i);
		});

		it('Module 9 question 942 MySQL override uses MATCH AGAINST BOOLEAN MODE', () => {
			const q942 = mod9.questions.find((q) => q.id === 942)!;
			const myQ = resolveQuestionForEngine(q942, 'mysql');
			expect(myQ.expected_query).toMatch(/MATCH\(body\) AGAINST\('\+performance' IN BOOLEAN MODE\)/i);
		});
	});
});

