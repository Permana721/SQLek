const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
const fnStart7 = c.indexOf("function generateModule7()");
const nextFn7 = c.indexOf("function generateModule8()");
const fnCode7 = c.substring(fnStart7, nextFn7);

const re = /\{\s*["']?id["']?\s*:\s*(\d+)[\s\S]*?["']?categorySlot["']?\s*:\s*(\d+)[\s\S]*?["']?title["']?\s*:\s*\{\s*["']?en["']?\s*:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(fnCode7)) !== null) {
  console.log(`Slot ${m[2]} | ID ${m[1]} | Title: ${m[3]}`);
}
