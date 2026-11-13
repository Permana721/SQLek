const fs = require('fs');
const { m4Questions, m5Questions, m6Questions } = require('./generate_phase1_data.cjs');

const questionsFile = 'src/lib/data/questions.ts';
let code = fs.readFileSync(questionsFile, 'utf8');

function serializeQuestions(questions) {
  const jsonStr = JSON.stringify(questions, null, 4);
  // Remove outer [ and ]
  const inner = jsonStr.substring(jsonStr.indexOf('[') + 1, jsonStr.lastIndexOf(']'));
  // Replace "seed_sql": "modXSeed" with seed_sql: modXSeed
  const replaced = inner.replace(/"seed_sql":\s*"(mod\w+)"/g, 'seed_sql: $1');
  return replaced.trim();
}

// 1. Inject Module 4
const fn4Start = code.indexOf('function generateModule4()');
const fn5Start = code.indexOf('function generateModule5()');
const m4Body = code.substring(fn4Start, fn5Start);
const m4EndIdx = m4Body.lastIndexOf('];');

if (m4EndIdx > 0 && !code.includes('id: 431') && !code.includes('"id": 431')) {
  const newM4Body = m4Body.substring(0, m4EndIdx).trimEnd() + ',\n' + serializeQuestions(m4Questions) + '\n    ];\n}';
  code = code.substring(0, fn4Start) + newM4Body + '\n\n' + code.substring(fn5Start);
  console.log('Injected Module 4 questions successfully.');
} else {
  console.log('Module 4 already updated or end index not found.');
}

// 2. Inject Module 5
const fn5StartNew = code.indexOf('function generateModule5()');
const fn6StartNew = code.indexOf('function generateModule6()');
const m5Body = code.substring(fn5StartNew, fn6StartNew);
const m5EndIdx = m5Body.lastIndexOf('];');

if (m5EndIdx > 0 && !code.includes('id: 549') && !code.includes('"id": 549')) {
  const newM5Body = m5Body.substring(0, m5EndIdx).trimEnd() + ',\n' + serializeQuestions(m5Questions) + '\n    ];\n}';
  code = code.substring(0, fn5StartNew) + newM5Body + '\n\n' + code.substring(fn6StartNew);
  console.log('Injected Module 5 questions successfully.');
} else {
  console.log('Module 5 already updated or end index not found.');
}

// 3. Inject Module 6
const fn6StartFinal = code.indexOf('function generateModule6()');
const fn7StartFinal = code.indexOf('function generateModule7()');
const m6Body = code.substring(fn6StartFinal, fn7StartFinal);
const m6EndIdx = m6Body.lastIndexOf('];');

if (m6EndIdx > 0 && !code.includes('id: 644') && !code.includes('"id": 644')) {
  const newM6Body = m6Body.substring(0, m6EndIdx).trimEnd() + ',\n' + serializeQuestions(m6Questions) + '\n    ];\n}';
  code = code.substring(0, fn6StartFinal) + newM6Body + '\n\n' + code.substring(fn7StartFinal);
  console.log('Injected Module 6 questions successfully.');
} else {
  console.log('Module 6 already updated or end index not found.');
}

fs.writeFileSync(questionsFile, code);
console.log('questions.ts updated with Phase 1!');
