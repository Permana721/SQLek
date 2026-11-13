const { PGlite } = require('@electric-sql/pglite');
const initSqlJs = require('sql.js');

async function testEngines() {
  const pg = new PGlite();
  const SQL = await initSqlJs();
  const sqlite = new SQL.Database();
  console.log("Both engines instantiated successfully!");
}

testEngines().catch(console.error);
