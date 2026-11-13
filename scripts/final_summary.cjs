const fs = require('fs');
const c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');

for (let i = 1; i <= 10; i++) {
  const fnStart = c.indexOf(`function generateModule${i}()`);
  const nextFn = i < 10 ? c.indexOf(`function generateModule${i+1}()`) : c.indexOf(`export const MODULES:`);
  const fnCode = c.substring(fnStart, nextFn);
  const qMatches = [...fnCode.matchAll(/(?:id|["']id["'])\s*:\s*(\d+)[\s\S]*?(?:categorySlot|["']categorySlot["'])\s*:\s*(\d+)/g)];
  const validQ = qMatches.filter(m => m[0].length < 200);
  const qIds = validQ.map(m => parseInt(m[1]));
  const slots = validQ.map(m => parseInt(m[2]));
  const uniqueSlots = [...new Set(slots)].sort((a,b)=>a-b);
  console.log(`Module ${i}: ${validQ.length} questions, minId=${Math.min(...qIds)}, maxId=${Math.max(...qIds)}, slots count=${uniqueSlots.length} (${uniqueSlots.join(",")})`);
}
