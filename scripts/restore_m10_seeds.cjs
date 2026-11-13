const fs = require('fs');
const orig = fs.readFileSync('/tmp/recovered_questions.ts', 'utf8');
let current = fs.readFileSync('src/lib/data/questions.ts', 'utf8');

const fn9Start = orig.indexOf('function generateModule9()');
const fn10Start = orig.indexOf('function generateModule10()');
const end9 = orig.lastIndexOf('];\n}', fn10Start);
const m10Seeds = orig.substring(end9 + 4, fn10Start);

if (!current.includes('const mod10OrdersSeed')) {
  current = current.replace('function generateModule10()', m10Seeds + '\nfunction generateModule10()');
  fs.writeFileSync('src/lib/data/questions.ts', current);
  console.log('Restored Module 10 seeds successfully!');
} else {
  console.log('Already has mod10OrdersSeed');
}
