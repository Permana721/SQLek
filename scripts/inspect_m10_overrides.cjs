const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
const fnStart = c.indexOf("function generateModule10()");
const nextFn = c.indexOf("export const MODULES");
const fnCode = c.substring(fnStart, nextFn);

const re = /id:\s*(\d+)[\s\S]*?engineOverrides:\s*\{\s*mysql:\s*\{[\s\S]*?expected_query:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(fnCode)) !== null) {
  console.log(`ID ${m[1]} | MySQL query: ${m[2]}`);
}
