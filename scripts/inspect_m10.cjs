const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
const fnStart = c.indexOf("function generateModule10()");
const nextFn = c.indexOf("export const MODULES");
const fnCode = c.substring(fnStart, nextFn);

const re = /\{\s*id:\s*(\d+),\s*moduleId:\s*10,\s*categorySlot:\s*(\d+),[\s\S]*?title:\s*\{\s*en:\s*"([^"]+)"[\s\S]*?expected_query:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(fnCode)) !== null) {
  console.log(`Slot ${m[2]} | ID ${m[1]} | Title: ${m[3]}\n   Query: ${m[4]}`);
}
