const { m7Questions, m8Questions, m9Questions, m10Questions } = require('./generate_phase2_data.cjs');
const allNew = [...m7Questions, ...m8Questions, ...m9Questions, ...m10Questions];

console.log("Total Phase 2 questions:", allNew.length);

// 1. Check unique IDs
const ids = new Set();
for (const q of allNew) {
  if (ids.has(q.id)) {
    throw new Error(`Duplicate ID: ${q.id}`);
  }
  ids.add(q.id);
}
console.log("All Phase 2 IDs are unique!");

// 2. Check Indonesian 3-tier structure
for (const q of allNew) {
  const checkExp = (exp, label) => {
    if (!exp) throw new Error(`${label} missing id explanation`);
    if (!exp.includes('Analogi Konseptual:')) throw new Error(`${label} missing Analogi Konseptual:`);
    if (!/Cara Kerja\s+[^:]+:/i.test(exp)) throw new Error(`${label} missing Cara Kerja ...:`);
    if (!exp.includes('Best Practices & Catatan Penting:')) throw new Error(`${label} missing Best Practices & Catatan Penting:`);
  };
  checkExp(q.conceptExplanation.id, `Q${q.id} base`);
  if (q.engineOverrides?.mysql?.conceptExplanation?.id) {
    checkExp(q.engineOverrides.mysql.conceptExplanation.id, `Q${q.id} mysql override`);
  }
}
console.log("All Indonesian 3-tier structures valid!");

// 3. Check English 3-tier structure
for (const q of allNew) {
  const checkExp = (exp, label) => {
    if (!exp) throw new Error(`${label} missing en explanation`);
    if (!exp.includes('Conceptual Analogy:')) throw new Error(`${label} missing Conceptual Analogy:`);
    if (!exp.includes('Engine Processing Behavior:')) throw new Error(`${label} missing Engine Processing Behavior:`);
    if (!exp.includes('Best Practices & Gotchas:')) throw new Error(`${label} missing Best Practices & Gotchas:`);
  };
  checkExp(q.conceptExplanation.en, `Q${q.id} base`);
  if (q.engineOverrides?.mysql?.conceptExplanation?.en) {
    checkExp(q.engineOverrides.mysql.conceptExplanation.en, `Q${q.id} mysql override`);
  }
}
console.log("All English 3-tier structures valid!");

// 4. Check zero keyword leaks in instructions
const leakedPatterns = [
  /\busing\s+(?:clause|statement|operator)\s+[`'"]?[A-Z_\s();*]+[`'"]?/i,
  /menggunakan\s+(?:perintah\s+|klausa\s+|operator\s+|sintaks\s+)[`'"]?[A-Z_\s();*]+[`'"]?/i,
  /`\s*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|LOCK|UNLOCK)\b[^`]*`/i,
  /`\s*(?:WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|UNION|INTERSECT|EXCEPT|ON CONFLICT|ON DUPLICATE KEY)\b[^`]*`/i,
  /`\s*[a-zA-Z0-9_]+\s*(?:=|<|>|<=|>=|!=|<>|\+|-|\*|\/)\s*[^`]+`/i,
  /->>|@>|JSON_CONTAINS|JSON_EXTRACT|JSON_CONTAINS_PATH/i
];

const statementStarters = [
  /\bSELECT\s+[a-zA-Z0-9_*`]/,
  /\bINSERT\s+INTO\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bUPDATE\s+[a-zA-Z0-9_`]+\s+SET\b/i,
  /\bCREATE\s+(?:TABLE|DATABASE|SCHEMA|ROLE|USER|VIEW|INDEX)\b/i,
  /\bDROP\s+(?:TABLE|DATABASE|SCHEMA|ROLE|USER|VIEW|INDEX)\b/i,
  /\bALTER\s+(?:TABLE|ROLE|USER)\b/i,
  /\bTRUNCATE\s+(?:TABLE\b)?/i,
  /\bGRANT\s+(?:SELECT|INSERT|UPDATE|DELETE|ALL)\b/i,
  /\bREVOKE\s+(?:SELECT|INSERT|UPDATE|DELETE|ALL)\b/i
];

for (const q of allNew) {
  const texts = [
    { text: q.instructions.en, label: `Q${q.id} EN base` },
    { text: q.instructions.id, label: `Q${q.id} ID base` }
  ];
  if (q.engineOverrides?.mysql?.instructions) {
    if (q.engineOverrides.mysql.instructions.en) texts.push({ text: q.engineOverrides.mysql.instructions.en, label: `Q${q.id} EN mysql` });
    if (q.engineOverrides.mysql.instructions.id) texts.push({ text: q.engineOverrides.mysql.instructions.id, label: `Q${q.id} ID mysql` });
  }

  for (const { text, label } of texts) {
    if (text.includes(';')) throw new Error(`${label} contains semicolon: ${text}`);
    for (const p of leakedPatterns) {
      if (p.test(text)) throw new Error(`${label} violates leak pattern ${p}: ${text}`);
    }
    for (const p of statementStarters) {
      if (p.test(text)) throw new Error(`${label} violates statement starter pattern ${p}: ${text}`);
    }
  }
}
console.log("All Phase 2 instructions pass Zero Keyword Leaks Audit!");

// 5. Check Dialect Leaks
const pgExclusivePatterns = [
  { name: 'DISTINCT ON', regex: /\bDISTINCT\s+ON\b/i },
  { name: 'JSONB type', regex: /\bJSONB\b/i },
  { name: '->> operator', regex: /->>/ },
  { name: 'ON CONFLICT', regex: /\bON\s+CONFLICT\b/i },
  { name: 'FILTER (WHERE ...)', regex: /\bFILTER\s*\(\s*WHERE\b/i }
];

const myExclusivePatterns = [
  { name: 'LAST_INSERT_ID', regex: /\bLAST_INSERT_ID\b/i },
  { name: 'IFNULL function', regex: /\bIFNULL\s*\(/i },
  { name: 'LOCK TABLES', regex: /\bLOCK\s+TABLES\b/i },
  { name: 'LOCK INSTANCE', regex: /\bLOCK\s+INSTANCE\b/i },
  { name: 'IN BOOLEAN MODE', regex: /\bIN\s+BOOLEAN\s+MODE\b/i },
  { name: 'IN NATURAL LANGUAGE MODE', regex: /\bIN\s+NATURAL\s+LANGUAGE\s+MODE\b/i },
  { name: 'MODIFY COLUMN ... AFTER', regex: /\bMODIFY\s+(?:COLUMN\s+)?\w+\s+[\w()]+\s+AFTER\b/i }
];

for (const q of allNew) {
  const pgQ = q.expected_query;
  const myQ = q.engineOverrides?.mysql?.expected_query || q.expected_query;

  for (const p of myExclusivePatterns) {
    if (p.regex.test(pgQ)) throw new Error(`Q${q.id} Postgres query leaks MySQL pattern ${p.name}`);
  }
  for (const p of pgExclusivePatterns) {
    if (p.regex.test(myQ)) throw new Error(`Q${q.id} MySQL query leaks Postgres pattern ${p.name}`);
  }
}
console.log("All Phase 2 queries pass Dialect Isolation Audit!");
