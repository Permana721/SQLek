const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');
const fnStart5 = c.indexOf("function generateModule5()");
const nextFn5 = c.indexOf("function generateModule6()");
const fnCode5 = c.substring(fnStart5, nextFn5);

const re = /\{\s*["']?id["']?\s*:\s*(\d+)[\s\S]*?["']?categorySlot["']?\s*:\s*(\d+)[\s\S]*?["']?title["']?\s*:\s*\{\s*["']?en["']?\s*:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(fnCode5)) !== null) {
  if (parseInt(m[2]) >= 8) {
    console.log(`Slot ${m[2]} | ID ${m[1]} | Title: ${m[3]}`);
  }
}
