const fs = require('fs');
const { m7Questions, m8Questions, m9Questions, m10Questions } = require('./generate_phase2_data.cjs');

const questionsFile = 'src/lib/data/questions.ts';
let code = fs.readFileSync(questionsFile, 'utf8');

function serializeQuestions(questions) {
  const jsonStr = JSON.stringify(questions, null, 4);
  const inner = jsonStr.substring(jsonStr.indexOf('[') + 1, jsonStr.lastIndexOf(']'));
  const replaced = inner
    .replace(/"seed_sql":\s*"(mod\w+)"/g, 'seed_sql: $1')
    .replace(/"seed_sql":\s*"(mod7Seed\\nCREATE MATERIALIZED VIEW[^"]+)"/g, (_m, s) => {
      const clean = s.replace(/\\n/g, '\n').replace(/"/g, "'");
      return `seed_sql: mod7Seed + \`\nCREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;\``;
    });
  return replaced.trim();
}

// 1. Inject Module 7
const fn7Start = code.indexOf('function generateModule7()');
const fn8Start = code.indexOf('function generateModule8()');
const m7Body = code.substring(fn7Start, fn8Start);
const m7EndIdx = m7Body.lastIndexOf('];');

if (m7EndIdx > 0 && !code.includes('id: 734') && !code.includes('"id": 734')) {
  const newM7Body = m7Body.substring(0, m7EndIdx).trimEnd() + ',\n' + serializeQuestions(m7Questions) + '\n    ];\n}';
  code = code.substring(0, fn7Start) + newM7Body + '\n\n' + code.substring(fn8Start);
  console.log('Injected Module 7 questions successfully.');
}

// 2. Inject Module 8
const fn8StartNew = code.indexOf('function generateModule8()');
const fn9StartNew = code.indexOf('function generateModule9()');
const m8Body = code.substring(fn8StartNew, fn9StartNew);
const m8EndIdx = m8Body.lastIndexOf('];');

if (m8EndIdx > 0 && !code.includes('id: 821') && !code.includes('"id": 821')) {
  const newM8Body = m8Body.substring(0, m8EndIdx).trimEnd() + ',\n' + serializeQuestions(m8Questions) + '\n    ];\n}';
  code = code.substring(0, fn8StartNew) + newM8Body + '\n\n' + code.substring(fn9StartNew);
  console.log('Injected Module 8 questions successfully.');
}

// 3. Inject Module 9
const fn9StartFinal = code.indexOf('function generateModule9()');
const fn10StartFinal = code.indexOf('function generateModule10()');
const m9Body = code.substring(fn9StartFinal, fn10StartFinal);
const m9EndIdx = m9Body.lastIndexOf('];');

if (m9EndIdx > 0 && !code.includes('id: 943') && !code.includes('"id": 943')) {
  const newM9Body = m9Body.substring(0, m9EndIdx).trimEnd() + ',\n' + serializeQuestions(m9Questions) + '\n    ];\n}';
  code = code.substring(0, fn9StartFinal) + newM9Body + '\n\n' + code.substring(fn10StartFinal);
  console.log('Injected Module 9 questions successfully.');
}

// 4. Inject Module 10
const fn10Start = code.indexOf('function generateModule10()');
const modArrayStart = code.indexOf('export const MODULES: Module[] = [');
const m10Body = code.substring(fn10Start, modArrayStart);
const m10EndIdx = m10Body.lastIndexOf('];');

if (m10EndIdx > 0 && !code.includes('id: 1011') && !code.includes('"id": 1011')) {
  const newM10Body = m10Body.substring(0, m10EndIdx).trimEnd() + ',\n' + serializeQuestions(m10Questions) + '\n    ];\n}';
  code = code.substring(0, fn10Start) + newM10Body + '\n\n' + code.substring(modArrayStart);
  console.log('Injected Module 10 questions successfully.');
}

// 5. Update descriptions in MODULES
code = code.replace(
  `            en: "Master window ranking functions, partition framing, DISTINCT ON deduplication, LAG/LEAD offsets, and RETURNING clauses.",\n            id: "Kuasai fungsi ranking window, partisi agregasi, deduplikasi analitik DISTINCT ON, fungsi offset LAG/LEAD, dan mutasi RETURNING."`,
  `            en: "Master window ranking functions, partition framing (ROWS BETWEEN), DISTINCT ON deduplication, LAG/LEAD offsets, NTILE, and Materialized Views.",\n            id: "Kuasai fungsi ranking window, partisi agregasi (ROWS BETWEEN), deduplikasi analitik DISTINCT ON, fungsi offset LAG/LEAD, NTILE, serta Materialized View."`
);

code = code.replace(
  `            en: "Master ACID principles, transaction isolation, COMMIT, ROLLBACK, pessimistic row locking (FOR UPDATE), and SAVEPOINTs.",\n            id: "Pahami prinsip ACID, kontrol transaksi dengan COMMIT dan ROLLBACK, pessimistic row locking via SELECT FOR UPDATE, serta SAVEPOINT."`,
  `            en: "Master ACID principles, transaction isolation levels (REPEATABLE READ/SERIALIZABLE), COMMIT, ROLLBACK, queue locking (SKIP LOCKED/NOWAIT), and SAVEPOINTs.",\n            id: "Pahami prinsip ACID, tingkat isolasi transaksi (REPEATABLE READ/SERIALIZABLE), kontrol COMMIT/ROLLBACK, penguncian antrean (SKIP LOCKED/NOWAIT), serta SAVEPOINT."`
);

code = code.replace(
  `            en: "Optimize execution with B-Tree/GIN indexes, Full-Text Search, JSONB, schemas, roles, privileges, and database creation.",\n            id: "Optimalkan query dengan index B-Tree/GIN, Full-Text Search, JSONB, skema, role, hak akses, dan pembuatan database."`,
  `            en: "Optimize execution with B-Tree/GIN, partial and expression indexes, Full-Text Search, JSONB, native arrays, UUIDs, roles, and privileges.",\n            id: "Optimalkan query dengan indeks B-Tree/GIN, partial dan ekspresi index, Full-Text Search, JSONB, array PostgreSQL, UUID, role, dan hak akses."`
);

code = code.replace(
  `            en: "Analyze and optimize execution plans using EXPLAIN, EXPLAIN ANALYZE, cost metrics, index effectiveness, join strategies, and buffer usage.",\n            id: "Analisis dan optimalkan rencana eksekusi menggunakan EXPLAIN, EXPLAIN ANALYZE, metrik biaya, efektivitas indeks, strategi join, serta penggunaan buffer."`,
  `            en: "Analyze execution plans using EXPLAIN and EXPLAIN ANALYZE across 30 diverse query profiling scenarios covering costs, scans, joins, subplans, and buffer cache.",\n            id: "Analisis rencana eksekusi menggunakan EXPLAIN dan EXPLAIN ANALYZE pada 30 variasi skenario profil query mencakup estimasi biaya, scan, join, subplan, dan buffer cache."`
);

fs.writeFileSync(questionsFile, code);
console.log('Applied Phase 2 to questions.ts successfully.');
