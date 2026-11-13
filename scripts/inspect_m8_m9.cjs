const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');

function checkMod(modNum, nextModNum) {
  const fnStart = c.indexOf(`function generateModule${modNum}()`);
  const nextFn = c.indexOf(nextModNum === 10 ? `function generateModule10()` : `export const MODULES`);
  const fnCode = c.substring(fnStart, nextFn);

  const re = /\{\s*["']?id["']?\s*:\s*(\d+)[\s\S]*?["']?categorySlot["']?\s*:\s*(\d+)[\s\S]*?["']?title["']?\s*:\s*\{\s*["']?en["']?\s*:\s*"([^"]+)"/g;
  let m;
  console.log(`=== Module ${modNum} ===`);
  while ((m = re.exec(fnCode)) !== null) {
    console.log(`Slot ${m[2]} | ID ${m[1]} | Title: ${m[3]}`);
  }
}
checkMod(8, 9);
checkMod(9, 10);
