const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
const fnStart6 = c.indexOf("function generateModule6()");
const nextFn6 = c.indexOf("function generateModule7()");
const fnCode6 = c.substring(fnStart6, nextFn6);

const re = /\{\s*["']?id["']?\s*:\s*(\d+)[\s\S]*?["']?categorySlot["']?\s*:\s*(\d+)[\s\S]*?["']?title["']?\s*:\s*\{\s*["']?en["']?\s*:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(fnCode6)) !== null) {
  console.log(`Slot ${m[2]} | ID ${m[1]} | Title: ${m[3]}`);
}
