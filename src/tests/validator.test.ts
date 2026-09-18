import { describe, it, expect } from 'vitest';
import {
	normalizeSqlQuery,
	areQueriesEquivalent,
	areRowsEquivalent
} from '$lib/utils/validator';

describe('SQL Query Validator & Normalization', () => {
	describe('Trailing semicolons tolerance', () => {
		it('treats single trailing semicolon as equivalent to no semicolon', () => {
			const withSemicolon = 'SELECT * FROM users;';
			const withoutSemicolon = 'SELECT * FROM users';
			expect(normalizeSqlQuery(withSemicolon)).toBe(normalizeSqlQuery(withoutSemicolon));
			expect(areQueriesEquivalent(withSemicolon, withoutSemicolon)).toBe(true);
		});

		it('handles multiple trailing semicolons and trailing whitespace', () => {
			const multiple = 'SELECT * FROM users;;;   ';
			const standard = 'SELECT * FROM users';
			expect(areQueriesEquivalent(multiple, standard)).toBe(true);
		});
	});

	describe('Whitespace & newline tolerance', () => {
		it('normalizes multi-line queries with varied indentation', () => {
			const multiline = `SELECT
				id,
				name
			FROM
				users`;
			const singleLine = 'SELECT id, name FROM users';
			expect(areQueriesEquivalent(multiline, singleLine)).toBe(true);
		});

		it('collapses irregular tab and multi-space formatting', () => {
			const messy = 'SELECT   id,    name\t\tFROM   users  ';
			const clean = 'SELECT id, name FROM users';
			expect(areQueriesEquivalent(messy, clean)).toBe(true);
		});

		it('normalizes spacing around commas and parentheses', () => {
			const spaced = 'SELECT ( id , name ) FROM users WHERE id IN ( 1 , 2 , 3 )';
			const compact = 'SELECT (id, name) FROM users WHERE id IN (1, 2, 3)';
			expect(areQueriesEquivalent(spaced, compact)).toBe(true);
		});
	});

	describe('Case-insensitivity for SQL keywords and identifiers', () => {
		it('treats lowercase SQL as equivalent to uppercase SQL', () => {
			const lowercase = 'select id, name from users where status = "active"';
			const uppercase = 'SELECT ID, NAME FROM USERS WHERE STATUS = "active"';
			expect(areQueriesEquivalent(lowercase, uppercase)).toBe(true);
		});

		it('handles mixed-case keywords gracefully', () => {
			const mixed = 'SeLeCt id FrOm users WhErE id > 10 OrDeR bY id DeSc';
			const canonical = 'SELECT id FROM users WHERE id > 10 ORDER BY id DESC';
			expect(areQueriesEquivalent(mixed, canonical)).toBe(true);
		});
	});

	describe('String literal preservation', () => {
		it('preserves exact casing and whitespace inside single-quoted strings', () => {
			const q1 = "SELECT * FROM employees WHERE department = 'Engineering Department'";
			const q2 = "select * from employees where department = 'Engineering Department';";
			expect(areQueriesEquivalent(q1, q2)).toBe(true);

			const normalized = normalizeSqlQuery(q1);
			expect(normalized).toContain("'Engineering Department'");
		});

		it('does not alter commas or symbols inside string literals', () => {
			const q = "SELECT * FROM logs WHERE message = 'Error: 404, not found (retry)';";
			const normalized = normalizeSqlQuery(q);
			expect(normalized).toContain("'Error: 404, not found (retry)'");
		});

		it('distinguishes different string literal values correctly', () => {
			const q1 = "SELECT * FROM users WHERE role = 'Admin'";
			const q2 = "SELECT * FROM users WHERE role = 'User'";
			expect(areQueriesEquivalent(q1, q2)).toBe(false);
		});
	});

	describe('SQL Comments stripping', () => {
		it('removes single-line -- comments before normalization', () => {
			const withComment = `-- Fetch all active users\nSELECT * FROM users; -- end of query`;
			const clean = 'SELECT * FROM users';
			expect(areQueriesEquivalent(withComment, clean)).toBe(true);
		});

		it('removes multi-line /* ... */ comments before normalization', () => {
			const withComment = '/* Multi-line\ncomment block */ SELECT * FROM users;';
			const clean = 'SELECT * FROM users';
			expect(areQueriesEquivalent(withComment, clean)).toBe(true);
		});
	});

	describe('Row state equivalence', () => {
		it('correctly compares identical row datasets', () => {
			const rowsA = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
			const rowsB = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
			expect(areRowsEquivalent(rowsA, rowsB)).toBe(true);
		});

		it('fails when row count differs', () => {
			const rowsA = [{ id: 1, name: 'Alice' }];
			const rowsB = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
			expect(areRowsEquivalent(rowsA, rowsB)).toBe(false);
		});

		it('fails when row contents differ', () => {
			const rowsA = [{ id: 1, name: 'Alice' }];
			const rowsB = [{ id: 1, name: 'Charlie' }];
			expect(areRowsEquivalent(rowsA, rowsB)).toBe(false);
		});
	});
});
