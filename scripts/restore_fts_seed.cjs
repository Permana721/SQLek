const fs = require('fs');
let c = fs.readFileSync('src/lib/data/questions.ts', 'utf8');

const ftsSeeds = `const mod9FtsSeed = \`CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL
);
INSERT INTO documents (title, body) VALUES
(1, 'Database Indexing Guide', 'Learn how B-tree and GIN indexes optimize query performance.'),
(2, 'PostgreSQL Internals', 'Understanding storage engines, buffer cache, and query execution plans.'),
(3, 'Web Development Basics', 'Building responsive layouts with CSS grid and flexbox.');\`;
const mod9FtsQuerySeed = mod9FtsSeed + \`
CREATE INDEX idx_documents_body_fts ON documents USING GIN(to_tsvector('english', body));\`;
const mod9FtsMysqlQuerySeed = mod9FtsSeed + \`
CREATE FULLTEXT INDEX idx_documents_body_fts ON documents(body);\`;

`;

if (!c.includes('const mod9FtsSeed')) {
  c = c.replace('function generateModule9()', ftsSeeds + 'function generateModule9()');
  fs.writeFileSync('src/lib/data/questions.ts', c);
  console.log('Restored mod9FtsSeed before generateModule9');
} else {
  console.log('Already has mod9FtsSeed');
}
