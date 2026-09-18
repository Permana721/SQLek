export function normalizeSqlQuery(sql: string): string {
	if (!sql) return '';

	const withoutComments = sql
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/--.*$/gm, '');

	const literals: string[] = [];
	const placeholderText = withoutComments.replace(/'([^']|'')*'/g, (m) => {
		const idx = literals.length;
		literals.push(m);
		return `__STR_LITERAL_${idx}__`;
	});

	let normalized = placeholderText
		.trim()
		.replace(/;+\s*$/, '')
		.toUpperCase()
		.replace(/\s+/g, ' ')
		.replace(/\s*,\s*/g, ', ')
		.replace(/\s*\(\s*/g, '(')
		.replace(/\s*\)\s*/g, ')')
		.replace(/\(\s+/g, '(')
		.replace(/\s+\)/g, ')')
		.trim();

	for (let i = 0; i < literals.length; i++) {
		normalized = normalized.replace(`__STR_LITERAL_${i}__`, literals[i]);
	}

	return normalized;
}

export function areQueriesEquivalent(queryA: string, queryB: string): boolean {
	return normalizeSqlQuery(queryA) === normalizeSqlQuery(queryB);
}

export function areRowsEquivalent(actualRows: any[], expectedRows: any[]): boolean {
	if (!Array.isArray(actualRows) || !Array.isArray(expectedRows)) return false;
	if (actualRows.length !== expectedRows.length) return false;
	return JSON.stringify(actualRows) === JSON.stringify(expectedRows);
}
