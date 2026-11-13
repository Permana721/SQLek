const fs = require('fs');
const content = fs.readFileSync('src/lib/data/questions.ts', 'utf8');

// We can extract each question by searching for "moduleId": 5 or moduleId: 5
const re = /(?:id|["']id["'])\s*:\s*(\d+)[\s\S]*?(?:moduleId|["']moduleId["'])\s*:\s*(\d+)[\s\S]*?(?:categorySlot|["']categorySlot["'])\s*:\s*(\d+)/g;

const questions = [];
let m;
while ((m = re.exec(content)) !== null) {
  const [full, id, mod, slot] = m;
  if (full.length < 300) { // avoid spanning across questions
    questions.push({ id: parseInt(id), mod: parseInt(mod), slot: parseInt(slot) });
  }
}

console.log("Total matched questions:", questions.length);
for (let i = 1; i <= 10; i++) {
  const modQ = questions.filter(q => q.mod === i);
  const slots = [...new Set(modQ.map(q => q.slot))].sort((a,b)=>a-b);
  console.log(`Module ${i}: ${modQ.length} questions, IDs ${Math.min(...modQ.map(q=>q.id))}..${Math.max(...modQ.map(q=>q.id))}, slots: ${slots.join(',')}`);
}
