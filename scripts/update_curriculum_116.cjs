const fs = require('fs');

const file = 'CURRICULUM.md';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Section 2 intro and Matrix
const oldSection2Intro = `The SQLek curriculum comprises **11 core learning modules** plus **1 final capstone exam**:
- **Curriculum Pool**: 462 unique task variations across 11 modules (459 in 57-task Module 5 calibration).
- **Exam Bank**: 98 high-difficulty capstone assessment tasks.
- **Total Task Pool**: 560 unique database problems (557 in 57-task Module 5 calibration).`;

const newSection2Intro = `The SQLek curriculum comprises **11 core learning modules** plus **1 final capstone exam**:
- **Curriculum Pool**: 467 unique task variations across 11 modules.
- **Exam Bank**: 98 high-difficulty capstone assessment tasks.
- **Total Task Pool**: 565 unique database problems across the entire platform.
- **Guaranteed Concept Coverage**: 116 dedicated category slots across Modules 1–11 ensure every single distinct SQL clause, constraint, and technique appears in every module session.`;

content = content.replace(oldSection2Intro, newSection2Intro);

// Update Section 2 table
const oldTable = `| Module # | Module Title | Session Tasks | Pool Size | Focus Area | Engine Availability |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **DDL & Basic DML** | 10 | 60 | Schema creation, primary keys, evolution, modifications, deletions | PostgreSQL & MySQL |
| **02** | **WHERE Filter Deep-Dive** | 8 | 40 | Conditional predicates, ranges, pattern matching, NULL logic, pagination | PostgreSQL & MySQL |
| **03** | **Aggregations & Grouping** | 8 | 36 | Aggregate functions, multi-column grouping, \`HAVING\`, filtered aggregation | PostgreSQL & MySQL |
| **04** | **Functions & Control Flow** | 7 | 42 | String/math functions, \`CASE\`, \`COALESCE\`, date truncation (\`DATE_TRUNC\`), \`INTERVAL\`, explicit type casting | PostgreSQL & MySQL |
| **05** | **Relations & Integrity Constraints** | 12 | 60 | Joins, self-joins, \`RIGHT JOIN\`, \`CROSS JOIN\`, \`LATERAL\`, non-equi joins, \`ON DELETE RESTRICT/SET NULL\`, \`DO NOTHING\` | PostgreSQL & MySQL |
| **06** | **Subqueries & Set Operators** | 11 | 51 | Subqueries, \`UNION\`/\`INTERSECT\`/\`EXCEPT\`, CTEs, recursive CTEs (\`WITH RECURSIVE\`), writable data-modifying CTEs | PostgreSQL & MySQL |
| **07** | **Window Functions & Advanced Querying** | 9 | 43 | Rankings, \`PARTITION BY\`, offsets (\`LAG\`/\`LEAD\`), window frames (\`ROWS BETWEEN\`), value functions (\`NTILE\`), Materialized Views | PostgreSQL & MySQL |
| **08** | **Transactions, Concurrency & Locking** | 6 | 28 | ACID, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`, row locks (\`FOR UPDATE\`), isolation levels (\`REPEATABLE READ\`/\`SERIALIZABLE\`), \`SKIP LOCKED\`/\`NOWAIT\` | PostgreSQL & MySQL |
| **09** | **Indexing, Full-Text Search & Administration** | 14 | 48 | B-Tree/GIN, partial/expression indexes, FTS, JSONB, native arrays (\`TEXT[]\`), \`UNNEST\`, \`gen_random_uuid()\`, RBAC | PostgreSQL & MySQL |
| **10** | **EXPLAIN ANALYZE & Query Performance** | 10 | 30 | Execution plans, \`EXPLAIN (ANALYZE, BUFFERS)\`, cost metrics, scans, join algorithms, subplans, catalog stats (3 variations/slot) | PostgreSQL (PGlite) |
| **11** | **PL/pgSQL, Automation & Schema Normalization** | 8 | 24 | User-defined scalar/table functions, stored procedures, BEFORE/AFTER triggers, audit logging, progressive 1NF-to-3NF normalization (3 variations/slot) | PostgreSQL (PGlite) |
| **Final**| **Comprehensive Random Exam (Final Boss)** | 30 | 98 | End-to-end randomized exam with execution-plan cost scoring & structural validation | PostgreSQL (PGlite) |`;

const newTable = `| Module # | Module Title | Session Tasks | Pool Size | Focus Area | Engine Availability |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **DDL & Basic DML** | 11 | 60 | Schema creation, primary keys, evolution (DROP & RENAME), modifications, deletions, truncation | PostgreSQL & MySQL |
| **02** | **WHERE Filter Deep-Dive** | 9 | 45 | Conditional predicates, ranges, pattern matching, discrete \`IN\` lists, NULL logic, deduplication, pagination | PostgreSQL & MySQL |
| **03** | **Aggregations & Grouping** | 8 | 36 | Aggregate functions, multi-column grouping, \`HAVING\`, \`FILTER (WHERE ...)\`, \`STRING_AGG\` | PostgreSQL & MySQL |
| **04** | **Functions & Control Flow** | 8 | 42 | String/math functions, \`EXTRACT\`, \`DATE_TRUNC\`, \`INTERVAL\`, \`CASE WHEN\`, \`COALESCE\`, explicit casting & \`TRIM\` | PostgreSQL & MySQL |
| **05** | **Relations & Integrity Constraints** | 17 | 60 | Joins (INNER, LEFT, RIGHT, FULL, CROSS, SELF, ANTI), non-equi, \`LATERAL\`, CHECK, UNIQUE, CASCADE, RESTRICT, SET NULL, UPSERT (DO UPDATE / DO NOTHING) | PostgreSQL & MySQL |
| **06** | **Subqueries & Set Operators** | 11 | 51 | Subqueries (scalar, IN, FROM, EXISTS), \`UNION ALL\`, \`UNION\`, \`INTERSECT\`, \`EXCEPT\`, CTEs, \`WITH RECURSIVE\`, writable CTEs | PostgreSQL & MySQL |
| **07** | **Window Functions & Advanced Querying** | 11 | 43 | \`ROW_NUMBER\`, \`PARTITION BY\`, \`LAG\`, \`DELETE ... RETURNING\`, \`LEAD\`, \`FIRST_VALUE\`/\`LAST_VALUE\`, \`NTILE\`, \`ROWS BETWEEN\`, \`DISTINCT ON\`, VIEWs, Materialized Views | PostgreSQL & MySQL |
| **08** | **Transactions, Concurrency & Locking** | 8 | 28 | ACID, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`, \`FOR UPDATE\`, \`FOR UPDATE SKIP LOCKED\`, \`FOR UPDATE NOWAIT\`, isolation levels (\`REPEATABLE READ\` / \`SERIALIZABLE\`) | PostgreSQL & MySQL |
| **09** | **Indexing, Full-Text Search & Administration** | 15 | 48 | B-Tree, composite, partial, expression, ENUM, SCHEMA, DATABASE, RBAC, JSONB (\`->>\`, \`?\`, \`@>\`), FTS GIN index & query (mandatory), arrays (\`TEXT[]\`, \`UNNEST\`), UUID | PostgreSQL & MySQL |
| **10** | **EXPLAIN ANALYZE & Query Performance** | 10 | 30 | Execution plans, \`EXPLAIN (ANALYZE, BUFFERS)\`, cost metrics, scans, join algorithms, subplans, catalog stats (3 variations/slot) | PostgreSQL (PGlite) |
| **11** | **PL/pgSQL, Automation & Schema Normalization** | 8 | 24 | User-defined scalar/table functions, stored procedures, BEFORE/AFTER triggers, audit logging, progressive 1NF-to-3NF normalization (3 variations/slot) | PostgreSQL (PGlite) |
| **Final**| **Comprehensive Random Exam (Final Boss)** | 30 | 98 | End-to-end randomized exam with execution-plan cost scoring & structural validation | PostgreSQL (PGlite) |`;

content = content.replace(oldTable, newTable);

// 2. Module 1 breakdown
const oldMod1 = `### Module 1: DDL & Basic DML

- **Module ID**: \`1\`
- **Title (EN)**: \`Module 1: DDL & Basic DML\`
- **Title (ID)**: \`Modul 1: DDL & DML Dasar\`
- **Description (EN)**: Master table creation, schema modifications, updates, deletions, and column selection.
- **Description (ID)**: Kuasai pembuatan tabel, modifikasi skema, pembaruan dan penghapusan data, serta seleksi kolom.
- **Session Configuration**:
  - **Tasks per Session**: 10 tasks (Category Slots 1–10)
  - **Total Task Pool Size**: 60 variations (6 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: \`SELECT\`, \`FROM\`, \`CREATE TABLE\`, \`ALTER TABLE\`, \`ADD COLUMN\`, \`DROP COLUMN\`, \`INSERT INTO\`, \`VALUES\`, \`UPDATE\`, \`SET\`, \`WHERE\`, \`DELETE\`, \`TRUNCATE TABLE\`.
- **PostgreSQL Data Types & Features**: \`INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY\`, \`SERIAL PRIMARY KEY\`, \`TEXT\`, \`VARCHAR\`, \`DEFAULT\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Full Table Selection**:
   - *Concepts*: Table scans, projecting all attributes using wildcard \`SELECT *\`.
   - *Syntax Pattern*: \`SELECT * FROM mytable;\`
2. **Slot 2 — Explicit Column Projection**:
   - *Concepts*: Column projection list, reducing bandwidth and memory consumption.
   - *Syntax Pattern*: \`SELECT column1, column2 FROM mytable;\`
3. **Slot 3 — Table Definition with Identity**:
   - *Concepts*: Defining relational entities, modern SQL-standard identity specifications vs legacy serial columns.
   - *Syntax Pattern*: \`CREATE TABLE mytable (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, column1 TEXT NOT NULL, column2 INT DEFAULT 0);\`
4. **Slot 4 — Schema Alteration (Add Column)**:
   - *Concepts*: Metadata alteration, appending nullable or defaulted attributes without table recreation.
   - *Syntax Pattern*: \`ALTER TABLE mytable ADD COLUMN new_column_name data_type;\`
5. **Slot 5 — Explicit Record Insertion**:
   - *Concepts*: Tuple insertion with explicit column mapping.
   - *Syntax Pattern*: \`INSERT INTO mytable (column1, column2, column3) VALUES (val1, val2, val3);\`
6. **Slot 6 — Targeted Mutation (UPDATE with Predicate)**:
   - *Concepts*: Row-level state mutation restricted by primary key/unique identifier predicates.
   - *Syntax Pattern*: \`UPDATE mytable SET rating = 9.2 WHERE id = 11;\`
7. **Slot 7 — Computed Arithmetic UPDATE**:
   - *Concepts*: In-place expression computation referencing current row values (\`SET col = col + delta\`).
   - *Syntax Pattern*: \`UPDATE mytable SET rating = rating + 0.5 WHERE year >= 2010;\`
8. **Slot 8 — Targeted Row Deletion**:
   - *Concepts*: Deleting specific subsets of tuples matching relational expressions.
   - *Syntax Pattern*: \`DELETE FROM mytable WHERE year < 2000;\`
9. **Slot 9 — Schema Evolution (Column Removal)**:
   - *Concepts*: Dropping unused or obsolete columns from live relations.
   - *Syntax Pattern*: \`ALTER TABLE movies DROP COLUMN rating;\`
10. **Slot 10 — High-Speed Table Truncation**:
    - *Concepts*: Rapid zero-logging storage reclamation bypassing row-by-row deletion triggers.
    - *Syntax Pattern*: \`TRUNCATE TABLE mytable;\``;

const newMod1 = `### Module 1: DDL & Basic DML

- **Module ID**: \`1\`
- **Title (EN)**: \`Module 1: DDL & Basic DML\`
- **Title (ID)**: \`Modul 1: DDL & DML Dasar\`
- **Description (EN)**: Master table creation, schema modifications, updates, deletions, and column selection.
- **Description (ID)**: Kuasai pembuatan tabel, modifikasi skema, pembaruan dan penghapusan data, serta seleksi kolom.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 60 variations (Slots 1–8, 11: 6 variations each; Slots 9–10: 3 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: \`SELECT\`, \`FROM\`, \`CREATE TABLE\`, \`ALTER TABLE\`, \`ADD COLUMN\`, \`DROP COLUMN\`, \`RENAME COLUMN\`, \`INSERT INTO\`, \`VALUES\`, \`UPDATE\`, \`SET\`, \`WHERE\`, \`DELETE\`, \`TRUNCATE TABLE\`.
- **PostgreSQL Data Types & Features**: \`INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY\`, \`SERIAL PRIMARY KEY\`, \`TEXT\`, \`VARCHAR\`, \`DEFAULT\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Full Table Selection**:
   - *Concepts*: Table scans, projecting all attributes using wildcard \`SELECT *\`.
   - *Syntax Pattern*: \`SELECT * FROM mytable;\`
2. **Slot 2 — Explicit Column Projection**:
   - *Concepts*: Column projection list, reducing bandwidth and memory consumption.
   - *Syntax Pattern*: \`SELECT column1, column2 FROM mytable;\`
3. **Slot 3 — Table Definition with Identity**:
   - *Concepts*: Defining relational entities, modern SQL-standard identity specifications vs legacy serial columns.
   - *Syntax Pattern*: \`CREATE TABLE mytable (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, column1 TEXT NOT NULL, column2 INT DEFAULT 0);\`
4. **Slot 4 — Schema Alteration (Add Column)**:
   - *Concepts*: Metadata alteration, appending nullable or defaulted attributes without table recreation.
   - *Syntax Pattern*: \`ALTER TABLE mytable ADD COLUMN new_column_name data_type;\`
5. **Slot 5 — Explicit Record Insertion**:
   - *Concepts*: Tuple insertion with explicit column mapping.
   - *Syntax Pattern*: \`INSERT INTO mytable (column1, column2, column3) VALUES (val1, val2, val3);\`
6. **Slot 6 — Targeted Mutation (UPDATE with Literal)**:
   - *Concepts*: Row-level state mutation setting explicit literal values restricted by primary key/unique identifier predicates.
   - *Syntax Pattern*: \`UPDATE mytable SET rating = 9.2 WHERE id = 11;\`
7. **Slot 7 — Computed Arithmetic UPDATE**:
   - *Concepts*: In-place expression computation referencing current row values (\`SET col = col + delta\`).
   - *Syntax Pattern*: \`UPDATE mytable SET rating = rating + 0.5 WHERE year >= 2010;\`
8. **Slot 8 — Targeted Row Deletion**:
   - *Concepts*: Deleting specific subsets of tuples matching relational expressions.
   - *Syntax Pattern*: \`DELETE FROM mytable WHERE year < 2000;\`
9. **Slot 9 — Schema Evolution: Column Removal (\`DROP COLUMN\`)**:
   - *Concepts*: Dropping unused or obsolete columns from live relations via instant metadata modification.
   - *Syntax Pattern*: \`ALTER TABLE movies DROP COLUMN rating;\`
10. **Slot 10 — Schema Evolution: Column Renaming (\`RENAME COLUMN\`)**:
    - *Concepts*: Renaming existing column identifiers in system catalog metadata without table rebuilds.
    - *Syntax Pattern*: \`ALTER TABLE movies RENAME COLUMN director TO filmmaker;\`
11. **Slot 11 — High-Speed Table Truncation (\`TRUNCATE TABLE\`)**:
    - *Concepts*: Rapid zero-logging storage reclamation bypassing row-by-row deletion triggers in O(1) time.
    - *Syntax Pattern*: \`TRUNCATE TABLE mytable;\``;

content = content.replace(oldMod1, newMod1);

// 3. Module 2 breakdown
const oldMod2 = `### Module 2: WHERE Filter Deep-Dive

- **Module ID**: \`2\`
- **Title (EN)**: \`Module 2: WHERE Filter Deep-Dive\`
- **Title (ID)**: \`Modul 2: Eksplorasi Filter WHERE\`
- **Description (EN)**: Master row filtering with logical operators, pattern matching, ranges, NULL logic, deduplication, and pagination.
- **Description (ID)**: Kuasai filtering row data dengan operator logika, pattern matching, rentang nilai, penanganan NULL, deduplikasi DISTINCT, dan paginasi.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 40 variations (5 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: \`WHERE\`, \`AND\`, \`OR\`, \`NOT\`, \`BETWEEN ... AND ...\`, \`LIKE\`, \`IN\`, \`IS NULL\`, \`IS NOT NULL\`, \`ORDER BY\`, \`ASC\`, \`DESC\`, \`DISTINCT\`, \`LIMIT\`, \`OFFSET\`.
- **Relational Concepts**: Three-Valued Logic (\`TRUE\`, \`FALSE\`, \`UNKNOWN\`), wildcards (\`%\`, \`_\`), deterministic result sorting, offset pagination.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Numeric Comparison Filters**:
   - *Concepts*: Strict relational inequalities (\`>\`, \`<\`, \`>=\`, \`<=\`, \`<>\`).
   - *Syntax Pattern*: \`SELECT * FROM items WHERE price > 100;\`
2. **Slot 2 — Inclusive Range Filtering (\`BETWEEN\`)**:
   - *Concepts*: Closed-interval range checks for continuous variables.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE price BETWEEN 50 AND 300;\`
3. **Slot 3 — Wildcard Pattern Matching (\`LIKE\`)**:
   - *Concepts*: Substring matching with prefix/suffix anchors.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE name LIKE 'Desk%';\`
4. **Slot 4 — Compound Predicate Logic (\`AND\` / \`OR\`)**:
   - *Concepts*: Boolean algebraic conditions combining disparate entity attributes.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE category = 'Electronics' AND price < 100;\`
5. **Slot 5 — Exact Value & Status Filtering**:
   - *Concepts*: Equality checks against enumerated states or boundary thresholds (\`stock = 0\`).
   - *Syntax Pattern*: \`SELECT * FROM items WHERE stock = 0;\`
6. **Slot 6 — Ordering & Sorting Projections**:
   - *Concepts*: Positional and ascending/descending sorting pipelines.
   - *Syntax Pattern*: \`SELECT * FROM items ORDER BY price DESC;\`
7. **Slot 7 — Result Set Deduplication (\`DISTINCT\`)**:
   - *Concepts*: Eliminating duplicate projected tuples across single or multi-attribute lists.
   - *Syntax Pattern*: \`SELECT DISTINCT category FROM items;\`
8. **Slot 8 — Deterministic Pagination (\`LIMIT\` & \`OFFSET\`)**:
   - *Concepts*: Cursor/offset slicing for chunked data retrieval.
   - *Syntax Pattern*: \`SELECT * FROM items ORDER BY id ASC LIMIT 5 OFFSET 5;\``;

const newMod2 = `### Module 2: WHERE Filter Deep-Dive

- **Module ID**: \`2\`
- **Title (EN)**: \`Module 2: WHERE Filter Deep-Dive\`
- **Title (ID)**: \`Modul 2: Eksplorasi Filter WHERE\`
- **Description (EN)**: Master row filtering with logical operators, pattern matching, ranges, NULL logic, deduplication, and pagination.
- **Description (ID)**: Kuasai filtering row data dengan operator logika, pattern matching, rentang nilai, penanganan NULL, deduplikasi DISTINCT, dan paginasi.
- **Session Configuration**:
  - **Tasks per Session**: 9 tasks (Category Slots 1–9)
  - **Total Task Pool Size**: 45 variations (5 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: \`WHERE\`, \`AND\`, \`OR\`, \`NOT\`, \`BETWEEN ... AND ...\`, \`LIKE\`, \`IN\`, \`NOT IN\`, \`IS NULL\`, \`IS NOT NULL\`, \`ORDER BY\`, \`ASC\`, \`DESC\`, \`DISTINCT\`, \`LIMIT\`, \`OFFSET\`.
- **Relational Concepts**: Three-Valued Logic (\`TRUE\`, \`FALSE\`, \`UNKNOWN\`), wildcards (\`%\`, \`_\`), deterministic result sorting, offset pagination, discrete set membership.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Numeric Comparison Filters**:
   - *Concepts*: Strict relational inequalities (\`>\`, \`<\`, \`>=\`, \`<=\`, \`<>\`).
   - *Syntax Pattern*: \`SELECT * FROM items WHERE price > 100;\`
2. **Slot 2 — Inclusive Range Filtering (\`BETWEEN\`)**:
   - *Concepts*: Closed-interval range checks for continuous variables.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE price BETWEEN 50 AND 300;\`
3. **Slot 3 — Wildcard Pattern Matching (\`LIKE\`)**:
   - *Concepts*: Substring matching with prefix/suffix anchors.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE name LIKE 'Desk%';\`
4. **Slot 4 — Compound Predicate Logic (\`AND\` / \`OR\`)**:
   - *Concepts*: Boolean algebraic conditions combining disparate entity attributes.
   - *Syntax Pattern*: \`SELECT * FROM items WHERE category = 'Electronics' AND price < 100;\`
5. **Slot 5 — Exact Value & Status Filtering**:
   - *Concepts*: Equality checks against enumerated states or boundary thresholds (\`stock = 0\`).
   - *Syntax Pattern*: \`SELECT * FROM items WHERE stock = 0;\`
6. **Slot 6 — Ordering & Sorting Projections**:
   - *Concepts*: Positional and ascending/descending sorting pipelines.
   - *Syntax Pattern*: \`SELECT * FROM items ORDER BY price DESC;\`
7. **Slot 7 — Result Set Deduplication (\`DISTINCT\`)**:
   - *Concepts*: Eliminating duplicate projected tuples across single or multi-attribute lists.
   - *Syntax Pattern*: \`SELECT DISTINCT category FROM items;\`
8. **Slot 8 — Deterministic Pagination (\`LIMIT\` & \`OFFSET\`)**:
   - *Concepts*: Cursor/offset slicing for chunked data retrieval.
   - *Syntax Pattern*: \`SELECT * FROM items ORDER BY id ASC LIMIT 5 OFFSET 5;\`
9. **Slot 9 — Discrete Set Membership Filtering (\`IN\` / \`NOT IN\`)**:
   - *Concepts*: Checking inclusion or exclusion against finite discrete lists of constants, multi-range B-tree index seeks, and null-safety implications.
   - *Syntax Patterns*:
     - \`SELECT * FROM items WHERE category IN ('Furniture', 'Kitchen');\`
     - \`SELECT id, name, price, category FROM items WHERE category NOT IN ('Electronics', 'Furniture') ORDER BY price ASC;\``;

content = content.replace(oldMod2, newMod2);

// 4. Module 4 breakdown
const oldMod4 = `### Module 4: Functions & Control Flow

- **Module ID**: \`4\`
- **Title (EN)**: \`Module 4: Functions & Control Flow\`
- **Title (ID)**: \`Modul 4: Fungsi & Logika Kondisional\`
- **Description (EN)**: Transform data with string, math, date functions, CASE WHEN, and COALESCE.
- **Description (ID)**: Manipulasi data menggunakan fungsi teks, matematika, tanggal, serta ekspresi CASE WHEN dan COALESCE.
- **Session Configuration**:
  - **Tasks per Session**: 7 tasks (Category Slots 1–7)
  - **Total Task Pool Size**: 42 variations (6 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Functions & Expressions**: \`UPPER()\`, \`LOWER()\`, \`LENGTH()\`, \`ROUND()\`, \`EXTRACT(YEAR FROM ...)\`, \`EXTRACT(MONTH FROM ...)\`, \`DATE_TRUNC()\`, \`INTERVAL\`, \`CASE WHEN ... THEN ... ELSE ... END\`, \`COALESCE()\`, \`CAST(... AS ...)\`, \`TRIM()\`.
- **Mathematical & Conversion Operators**: Integer division, arithmetic expressions, NULL coalescing, numeric decimal casting (\`NUMERIC(10,2)\` / \`DECIMAL(10,2)\`), temporal interval arithmetic (\`+ INTERVAL '1 month'\`, \`- INTERVAL '30 days'\`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — String Casing & Normalization**:
   - *Concepts*: Standardizing text casing using \`UPPER\` and \`LOWER\`.
   - *Syntax Pattern*: \`SELECT UPPER(first_name), UPPER(last_name) FROM customers;\`
2. **Slot 2 — Mathematical Scoring & Arithmetic Projections**:
   - *Concepts*: Applying scalar arithmetic, integer division, and rounding to projected attributes.
   - *Syntax Pattern*: \`SELECT first_name, score / 10 AS score_tier FROM customers;\`
3. **Slot 3 — Temporal Extraction (\`EXTRACT\`)**:
   - *Concepts*: Isolating date parts (year, month, day) from temporal timestamps and date fields.
   - *Syntax Pattern*: \`SELECT first_name, EXTRACT(YEAR FROM join_date) AS join_year FROM customers;\`
4. **Slot 4 — Conditional Branching (\`CASE WHEN\`)**:
   - *Concepts*: Multi-branch relational logic mapping values to categorized tiers.
   - *Syntax Pattern*: \`SELECT first_name, score, CASE WHEN score >= 80 THEN 'VIP' ELSE 'Regular' END AS tier FROM customers;\`
5. **Slot 5 — NULL Fallback Handling (\`COALESCE\`)**:
   - *Concepts*: Short-circuit evaluation returning the first non-null argument.
   - *Syntax Pattern*: \`SELECT first_name, COALESCE(discount_code, 'NONE') AS promo FROM customers;\`
6. **Slot 6 — Temporal Truncation & Interval Arithmetic (\`DATE_TRUNC\` & \`INTERVAL\`)**:
   - *Concepts*: Grouping temporal events by calendar periods (month, day, hour) via \`DATE_TRUNC\`, and performing date/timestamp arithmetic with \`INTERVAL\` additions and subtractions.
   - *Syntax Patterns*:
     - \`SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;\`
     - \`SELECT user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at DESC;\`
7. **Slot 7 — Explicit Type Casting & String Sanitization (\`CAST\` & \`TRIM\`)**:
   - *Concepts*: Explicit data type conversion between incompatible string/numeric domains via SQL-standard \`CAST(... AS NUMERIC)\` or PostgreSQL shorthand \`::\`, paired with string trimming to sanitize whitespace.
   - *Syntax Pattern*: \`SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;\``;

const newMod4 = `### Module 4: Functions & Control Flow

- **Module ID**: \`4\`
- **Title (EN)**: \`Module 4: Functions & Control Flow\`
- **Title (ID)**: \`Modul 4: Fungsi & Logika Kondisional\`
- **Description (EN)**: Transform data with string, math, date functions, CASE WHEN, and COALESCE.
- **Description (ID)**: Manipulasi data menggunakan fungsi teks, matematika, tanggal, serta ekspresi CASE WHEN dan COALESCE.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 42 variations (Slots 1–3, 6–8: 6 variations each; Slots 4–5: 3 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Functions & Expressions**: \`UPPER()\`, \`LOWER()\`, \`LENGTH()\`, \`ROUND()\`, \`EXTRACT(YEAR FROM ...)\`, \`EXTRACT(MONTH FROM ...)\`, \`DATE_TRUNC()\`, \`INTERVAL\`, \`CASE WHEN ... THEN ... ELSE ... END\`, \`COALESCE()\`, \`CAST(... AS ...)\`, \`TRIM()\`.
- **Mathematical & Conversion Operators**: Integer division, arithmetic expressions, NULL coalescing, numeric decimal casting (\`NUMERIC(10,2)\` / \`DECIMAL(10,2)\`), temporal interval arithmetic (\`+ INTERVAL '1 month'\`, \`- INTERVAL '30 days'\`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — String Casing & Normalization**:
   - *Concepts*: Standardizing text casing using \`UPPER\` and \`LOWER\`.
   - *Syntax Pattern*: \`SELECT UPPER(first_name), UPPER(last_name) FROM customers;\`
2. **Slot 2 — Mathematical Scoring & Arithmetic Projections**:
   - *Concepts*: Applying scalar arithmetic, integer division, and rounding to projected attributes.
   - *Syntax Pattern*: \`SELECT first_name, score / 10 AS score_tier FROM customers;\`
3. **Slot 3 — Temporal Extraction (\`EXTRACT\`)**:
   - *Concepts*: Isolating date parts (year, month, day) from temporal timestamps and date fields.
   - *Syntax Pattern*: \`SELECT first_name, EXTRACT(YEAR FROM join_date) AS join_year FROM customers;\`
4. **Slot 4 — Temporal Calendar Truncation (\`DATE_TRUNC\`)**:
   - *Concepts*: Rounding timestamps to the beginning of temporal granularities (month, day, hour) for time-series aggregation.
   - *Syntax Pattern*: \`SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;\`
5. **Slot 5 — Temporal Interval Arithmetic (\`INTERVAL\`)**:
   - *Concepts*: Dynamic calendar math adding or subtracting discrete intervals (\`+ INTERVAL '1 month'\`, \`- INTERVAL '30 days'\`).
   - *Syntax Pattern*: \`SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at;\`
6. **Slot 6 — Conditional Branching (\`CASE WHEN\`)**:
   - *Concepts*: Multi-branch relational logic mapping values to categorized tiers.
   - *Syntax Pattern*: \`SELECT first_name, score, CASE WHEN score >= 80 THEN 'VIP' ELSE 'Regular' END AS tier FROM customers;\`
7. **Slot 7 — NULL Fallback Handling (\`COALESCE\`)**:
   - *Concepts*: Short-circuit evaluation returning the first non-null argument.
   - *Syntax Pattern*: \`SELECT first_name, COALESCE(discount_code, 'NONE') AS promo FROM customers;\`
8. **Slot 8 — Explicit Type Casting & String Sanitization (\`CAST\` & \`TRIM\`)**:
   - *Concepts*: Explicit data type conversion between incompatible string/numeric domains via SQL-standard \`CAST(... AS NUMERIC)\` or PostgreSQL shorthand \`::\`, paired with string trimming to sanitize whitespace.
   - *Syntax Pattern*: \`SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;\``;

content = content.replace(oldMod4, newMod4);

// 5. Module 5 breakdown
const oldMod5Start = `### Module 5: Relations & Integrity Constraints`;
const oldMod6Start = `### Module 6: Subqueries & Set Operators`;
const mod5Idx = content.indexOf(oldMod5Start);
const mod6Idx = content.indexOf(oldMod6Start);

const newMod5 = `### Module 5: Relations & Integrity Constraints

- **Module ID**: \`5\`
- **Title (EN)**: \`Module 5: Relations & Integrity Constraints\`
- **Title (ID)**: \`Modul 5: Relasi Tabel & Integrity Constraints\`
- **Description (EN)**: Connect data using joins, self-joins, CHECK constraints, UNIQUE rules, cascading foreign keys, and atomic UPSERT handling.
- **Description (ID)**: Hubungkan tabel via joins, self-join, batasan CHECK, UNIQUE, cascading foreign key, serta penanganan konflik atomik UPSERT.
- **Session Configuration**:
  - **Tasks per Session**: 17 tasks (Category Slots 1–17)
  - **Total Task Pool Size**: 60 variations (Slots 1–2, 4, 6–8, 11–13: 5 vars each; Slots 3, 5, 9, 10, 17: 2 vars each; Slot 16: 3 vars; Slots 14–15: 1 var each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Join Mechanisms**: \`INNER JOIN\`, \`LEFT JOIN\`, \`RIGHT JOIN\`, \`FULL JOIN\`, \`CROSS JOIN\`, \`SELF JOIN\`, Anti-Join (\`LEFT JOIN ... WHERE right.id IS NULL\`), Aliased WHERE Join, Non-Equi Join (\`BETWEEN\`, \`>=\`), \`LATERAL\` subquery evaluation.
- **Constraints & Integrity**: \`CHECK (expr)\`, \`UNIQUE\`, \`FOREIGN KEY ... REFERENCES ... ON DELETE CASCADE\`, \`ON DELETE RESTRICT\`, \`ON DELETE SET NULL\`.
- **Atomic Concurrency Handling**: \`INSERT INTO ... ON CONFLICT (...) DO UPDATE SET ...\` using \`EXCLUDED\`, and idempotent inserts via \`ON CONFLICT (...) DO NOTHING\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Equi-Joins (\`INNER JOIN\`)**:
   - *Concepts*: Strict relational intersection matching foreign keys to primary keys.
   - *Syntax Pattern*: \`SELECT employees.name, departments.dept_name FROM employees JOIN departments ON employees.department_id = departments.id;\`
2. **Slot 2 — Outer Inclusion (\`LEFT JOIN\`)**:
   - *Concepts*: Preserving all left tuples while filling unreferenced right attributes with NULLs.
   - *Syntax Pattern*: \`SELECT employees.name, departments.dept_name FROM employees LEFT JOIN departments ON employees.department_id = departments.id;\`
3. **Slot 3 — Right Outer Inclusion (\`RIGHT JOIN\`)**:
   - *Concepts*: Preserving all right relation tuples, ensuring parent reference tables without active children are displayed.
   - *Syntax Pattern*: \`SELECT d.dept_name, e.name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id ORDER BY d.dept_name, e.name;\`
4. **Slot 4 — Complete Relational Mesh (\`FULL JOIN\`)**:
   - *Concepts*: Bi-directional preservation of tuples from both participating relations.
   - *Syntax Pattern*: \`SELECT employees.name, departments.dept_name FROM employees FULL JOIN departments ON employees.department_id = departments.id;\`
5. **Slot 5 — Cartesian Grid Product (\`CROSS JOIN\`)**:
   - *Concepts*: Unconstrained Cartesian matrix product across entities (e.g. stores x products inventory grid).
   - *Syntax Pattern*: \`SELECT s.store_name, p.name AS product_name FROM stores s CROSS JOIN products p ORDER BY s.store_name, product_name;\`
6. **Slot 6 — Self-Referential Joins (\`SELF JOIN\`)**:
   - *Concepts*: Table aliasing to model hierarchical relationships within the same relation (e.g., employee to manager).
   - *Syntax Pattern*: \`SELECT emp.name AS employee, mgr.name AS manager FROM employees emp JOIN employees mgr ON emp.manager_id = mgr.id;\`
7. **Slot 7 — Anti-Joins (Finding Missing Relations)**:
   - *Concepts*: Identifying orphaned or unlinked records using \`LEFT JOIN\` combined with \`WHERE right.id IS NULL\`.
   - *Syntax Pattern*: \`SELECT employees.name FROM employees LEFT JOIN departments ON employees.department_id = departments.id WHERE departments.id IS NULL;\`
8. **Slot 8 — Filtered & Aliased Multi-Table Joins**:
   - *Concepts*: Combining table aliases with conditional WHERE clauses across joined entities.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.salary > 70000;\`
9. **Slot 9 — Non-Equi Joins (\`BETWEEN\` & Inequalities)**:
   - *Concepts*: Joining tables on continuous ranges or inequality thresholds rather than equality.
   - *Syntax Pattern*: \`SELECT e.name, e.salary, g.grade_level FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary ORDER BY e.salary DESC;\`
10. **Slot 10 — Lateral Correlated Evaluation (\`LATERAL JOIN\`)**:
    - *Concepts*: Correlated subquery evaluation inside the \`FROM\` clause referencing columns from preceding tables per row (e.g. top-1 earner per department).
    - *Syntax Pattern*: \`SELECT d.dept_name, sub.name, sub.salary FROM departments d LEFT JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary DESC LIMIT 1) sub ON true ORDER BY d.dept_name;\`
11. **Slot 11 — Domain Validation (\`CHECK\` Constraints)**:
    - *Concepts*: Enforcing row-level invariants and positive bounds at the storage level.
    - *Syntax Pattern*: \`CREATE TABLE products (id INT PRIMARY KEY, name TEXT NOT NULL, price INT CHECK (price > 0));\`
12. **Slot 12 — Candidate Key Enforcement (\`UNIQUE\`)**:
    - *Concepts*: Preventing duplicate business keys (e.g., emails) across tables.
    - *Syntax Pattern*: \`CREATE TABLE users (id INT PRIMARY KEY, email TEXT UNIQUE, username TEXT NOT NULL);\`
13. **Slot 13 — Referential Cascading (\`ON DELETE CASCADE\`)**:
    - *Concepts*: Automatically deleting child rows when a referenced parent row is deleted.
    - *Syntax Pattern*: \`CREATE TABLE project_tasks (id INT PRIMARY KEY, department_id INT REFERENCES departments(id) ON DELETE CASCADE, task_name TEXT NOT NULL);\`
14. **Slot 14 — Strict Referential Rejection (\`ON DELETE RESTRICT\`)**:
    - *Concepts*: Rejecting deletions of parent records that still have dependent child references.
    - *Syntax Pattern*: \`CREATE TABLE department_heads (id INT PRIMARY KEY, name TEXT, department_id INT REFERENCES departments(id) ON DELETE RESTRICT);\`
15. **Slot 15 — Referential Nullification (\`ON DELETE SET NULL\`)**:
    - *Concepts*: Setting child foreign key references to NULL upon parent deletion while preserving dependent records.
    - *Syntax Pattern*: \`CREATE TABLE employee_profiles (id INT PRIMARY KEY, employee_id INT REFERENCES employees(id) ON DELETE SET NULL, bio TEXT);\`
16. **Slot 16 — Atomic Upsert Mutation (\`ON CONFLICT DO UPDATE\`)**:
    - *Concepts*: Atomic handling of primary/unique key violations using \`DO UPDATE SET\` and \`EXCLUDED\`.
    - *Syntax Pattern*: \`INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 1) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;\`
17. **Slot 17 — Idempotent Insertion (\`ON CONFLICT DO NOTHING\`)**:
    - *Concepts*: Silently skipping insertion without aborting transactions when duplicate keys exist.
    - *Syntax Pattern*: \`INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 2) ON CONFLICT (user_id, product_id) DO NOTHING;\`

`;

content = content.substring(0, mod5Idx) + newMod5 + content.substring(mod6Idx);

// 6. Module 7 breakdown
const oldMod7Start = `### Module 7: Window Functions & Advanced Querying`;
const oldMod8Start = `### Module 8: Transactions, Concurrency & Locking`;
const mod7Idx = content.indexOf(oldMod7Start);
const mod8Idx = content.indexOf(oldMod8Start);

const newMod7 = `### Module 7: Window Functions & Advanced Querying

- **Module ID**: \`7\`
- **Title (EN)**: \`Module 7: Window Functions & Advanced Querying\`
- **Title (ID)**: \`Modul 7: Window Function & Query Lanjutan\`
- **Description (EN)**: Master window ranking functions, partition framing, DISTINCT ON deduplication, LAG/LEAD offsets, and RETURNING clauses.
- **Description (ID)**: Kuasai fungsi ranking window, partisi agregasi, deduplikasi analitik DISTINCT ON, fungsi offset LAG/LEAD, dan mutasi RETURNING.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 43 variations (Slots 1–4, 10: 6 vars each; Slots 8, 9, 11: 3 vars each; Slot 6: 2 vars; Slots 5, 7: 1 var each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Window Functions**: \`ROW_NUMBER()\`, \`RANK()\`, \`DENSE_RANK()\`, \`OVER (PARTITION BY ... ORDER BY ...)\`, \`LAG()\`, \`LEAD()\`, \`FIRST_VALUE()\`, \`LAST_VALUE()\`, \`NTILE()\`, \`ROWS BETWEEN ... AND ...\`.
- **Advanced Querying & Views**: \`DISTINCT ON (...)\`, \`DELETE ... RETURNING\`, \`CREATE VIEW\`, \`CREATE MATERIALIZED VIEW\`, \`REFRESH MATERIALIZED VIEW\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Positional Window Ranking (\`ROW_NUMBER\`)**:
   - *Concepts*: Sequential ordinal numbering of rows within partitions or overall datasets.
   - *Syntax Pattern*: \`SELECT owner, balance, ROW_NUMBER() OVER (ORDER BY balance DESC) AS pos FROM accounts;\`
2. **Slot 2 — Partitioned Aggregate Projections (\`PARTITION BY\`)**:
   - *Concepts*: Computing partition-level summary metrics alongside granular individual row details.
   - *Syntax Pattern*: \`SELECT owner, category, balance, AVG(balance) OVER (PARTITION BY category) AS cat_avg FROM accounts;\`
3. **Slot 3 — Historical Value Offsets (\`LAG\`)**:
   - *Concepts*: Peeking backward at preceding rows within the window partition to calculate step differences.
   - *Syntax Pattern*: \`SELECT owner, balance, LAG(balance, 1) OVER (ORDER BY balance ASC) AS prev_bal FROM accounts;\`
4. **Slot 4 — DML Mutation Returning (\`RETURNING\`)**:
   - *Concepts*: Capturing deleted, updated, or inserted tuple states directly from DML mutations without additional queries.
   - *Syntax Pattern*: \`DELETE FROM accounts WHERE balance < 1000 RETURNING owner, balance;\`
5. **Slot 5 — Forward Value Offsets (\`LEAD\`)**:
   - *Concepts*: Peeking forward at upcoming records within ordered window partitions.
   - *Syntax Pattern*: \`SELECT id, owner, balance, LEAD(balance, 1) OVER (ORDER BY balance ASC) AS next_balance FROM accounts ORDER BY balance ASC;\`
6. **Slot 6 — Partition Extremes (\`FIRST_VALUE\` & \`LAST_VALUE\`)**:
   - *Concepts*: Fetching extreme boundary values within partition frames across sorted records.
   - *Syntax Patterns*:
     - \`SELECT id, owner, category, balance, FIRST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC) AS top_owner FROM accounts ORDER BY category, balance DESC;\`
     - \`SELECT id, owner, category, balance, LAST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_owner FROM accounts ORDER BY category, balance DESC;\`
7. **Slot 7 — Equal-Width Bucketing (\`NTILE\`)**:
   - *Concepts*: Dividing ordered datasets into specified numbers of ranked quartiles, percentiles, or buckets.
   - *Syntax Pattern*: \`SELECT id, owner, balance, NTILE(4) OVER (ORDER BY balance DESC) AS quartile FROM accounts ORDER BY balance DESC, id;\`
8. **Slot 8 — Explicit Window Frames (\`ROWS BETWEEN\`)**:
   - *Concepts*: Fine-grained sliding window frames computing cumulative running totals and moving averages.
   - *Syntax Pattern*: \`SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM accounts ORDER BY id;\`
9. **Slot 9 — Deduplicated Tops (\`DISTINCT ON\`)**:
   - *Concepts*: PostgreSQL-exclusive analytical deduplication retaining the first row per group based on explicit ordering.
   - *Syntax Pattern*: \`SELECT DISTINCT ON (customer_id) customer_id, order_date, amount FROM orders ORDER BY customer_id, order_date DESC;\`
10. **Slot 10 — Reusable View Definitions (\`CREATE VIEW\`)**:
    - *Concepts*: Virtual tables encapsulating complex analytical queries without physical storage replication.
    - *Syntax Pattern*: \`CREATE VIEW high_balances AS SELECT owner, balance FROM accounts WHERE balance > 3000;\`
11. **Slot 11 — Cached Snapshots (\`CREATE\` & \`REFRESH MATERIALIZED VIEW\`)**:
    - *Concepts*: Persisting precomputed analytical query result sets to disk for instant high-speed lookups, with scheduled refresh capabilities.
    - *Syntax Patterns*:
      - \`CREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;\`
      - \`REFRESH MATERIALIZED VIEW premium_accounts_summary;\`

`;

content = content.substring(0, mod7Idx) + newMod7 + content.substring(mod8Idx);

// 7. Module 8 breakdown
const oldMod8StartMatch = `### Module 8: Transactions, Concurrency & Locking`;
const oldMod9StartMatch = `### Module 9: Indexing, Full-Text Search & Administration`;
const mod8IdxFresh = content.indexOf(oldMod8StartMatch);
const mod9IdxFresh = content.indexOf(oldMod9StartMatch);

const newMod8 = `### Module 8: Transactions, Concurrency & Locking

- **Module ID**: \`8\`
- **Title (EN)**: \`Module 8: Transactions, Concurrency & Locking\`
- **Title (ID)**: \`Modul 8: Transaksi, Konkurensi & Locking\`
- **Description (EN)**: Master ACID principles, transaction isolation, COMMIT, ROLLBACK, pessimistic row locking (FOR UPDATE), and SAVEPOINTs.
- **Description (ID)**: Pahami prinsip ACID, kontrol transaksi dengan COMMIT dan ROLLBACK, pessimistic row locking via SELECT FOR UPDATE, serta SAVEPOINT.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 28 variations (Slots 1–4: 5 vars each; Slot 7: 3 vars; Slots 5–6: 2 vars each; Slot 8: 1 var)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **ACID & Boundary Control**: \`BEGIN\`, \`START TRANSACTION\`, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`, \`ROLLBACK TO SAVEPOINT\`.
- **Locking & Concurrency**: \`SELECT ... FOR UPDATE\`, \`FOR UPDATE SKIP LOCKED\`, \`FOR UPDATE NOWAIT\`.
- **Isolation Levels**: \`SET TRANSACTION ISOLATION LEVEL READ COMMITTED\`, \`REPEATABLE READ\`, \`SERIALIZABLE\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Atomic Transaction Confirmation (\`COMMIT\`)**:
   - *Concepts*: Persisting multi-statement data mutations atomically to durable storage.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT;\`
2. **Slot 2 — Transaction Fault Rollback (\`ROLLBACK\`)**:
   - *Concepts*: Aborting mutated states and reverting all uncommitted database operations to the pristine pre-transaction state.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 500 WHERE id = 1; ROLLBACK;\`
3. **Slot 3 — Fine-Grained Recovery Checkpoints (\`SAVEPOINT\`)**:
   - *Concepts*: Defining intermediate recovery milestones allowing partial rollbacks without aborting the parent transaction.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance + 100 WHERE id = 1; SAVEPOINT sp1; UPDATE accounts SET balance = balance - 9999 WHERE id = 2; ROLLBACK TO SAVEPOINT sp1; COMMIT;\`
4. **Slot 4 — Pessimistic Row Locking (\`FOR UPDATE\`)**:
   - *Concepts*: Acquiring exclusive row-level read-for-write locks to prevent concurrent race conditions during check-then-act operations.
   - *Syntax Pattern*: \`SELECT * FROM accounts WHERE id = 1 FOR UPDATE;\`
5. **Slot 5 — Non-Blocking Queue Polling (\`FOR UPDATE SKIP LOCKED\`)**:
   - *Concepts*: Implementing high-concurrency background job workers that bypass already-locked rows without blocking or stalling worker threads.
   - *Syntax Pattern*: \`SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;\`
6. **Slot 6 — Fail-Fast Concurrency Control (\`FOR UPDATE NOWAIT\`)**:
   - *Concepts*: Failing immediately with an error if target rows are held by concurrent transactions rather than waiting for lock releases.
   - *Syntax Pattern*: \`SELECT id, task_type, payload FROM job_queue WHERE id = 1 FOR UPDATE NOWAIT;\`
7. **Slot 7 — Snapshot Consistency (\`REPEATABLE READ\` / \`READ COMMITTED\`)**:
   - *Concepts*: Configuring transaction isolation to prevent non-repeatable reads and guarantee frozen transaction start snapshots.
   - *Syntax Pattern*: \`BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT * FROM accounts WHERE id = 1; COMMIT;\`
8. **Slot 8 — Strict Serializable Isolation (\`SERIALIZABLE\`)**:
   - *Concepts*: Highest ANSI isolation level using Serializable Snapshot Isolation (SSI) to eliminate phantom reads and serialization anomalies.
   - *Syntax Pattern*: \`BEGIN; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; SELECT * FROM accounts WHERE id = 2; COMMIT;\`

`;

content = content.substring(0, mod8IdxFresh) + newMod8 + content.substring(mod9IdxFresh);

// 8. Module 9 breakdown
const oldMod9StartFresh = `### Module 9: Indexing, Full-Text Search & Administration`;
const oldMod10StartFresh = `### Module 10: EXPLAIN ANALYZE & Query Performance`;
const mod9IdxNew = content.indexOf(oldMod9StartFresh);
const mod10IdxNew = content.indexOf(oldMod10StartFresh);

const newMod9 = `### Module 9: Indexing, Full-Text Search & Administration

- **Module ID**: \`9\`
- **Title (EN)**: \`Module 9: Indexing, Full-Text Search & Administration\`
- **Title (ID)**: \`Modul 9: Indexing, Full-Text Search & Administrasi\`
- **Description (EN)**: Optimize execution with B-Tree/GIN indexes, Full-Text Search, JSONB, schemas, roles, privileges, and database creation.
- **Description (ID)**: Optimalkan query dengan index B-Tree/GIN, Full-Text Search, JSONB, skema, role, hak akses, dan pembuatan database.
- **Session Configuration**:
  - **Tasks per Session**: 15 tasks (Category Slots 1–15)
  - **Total Task Pool Size**: 48 variations (Slots 1, 2, 5, 6, 8: 5 vars each; Slot 13: 6 vars; Slots 9–11: 3 vars each; Slots 3, 14: 2 vars each; Slots 4, 7, 12, 15: 1 var each)
  - **Mandatory Tasks**: 2 tasks (Slot 12: Question 941; Slot 13: Question 942)

#### Key SQL Concepts, Clauses, & Keywords
- **Indexing Engines**: \`CREATE INDEX\`, B-Tree index, Composite index, Partial index (\`WHERE condition\`), Expression index (\`LOWER(col)\`), \`USING GIN\`.
- **Data Types & Extensions**: \`CREATE TYPE ... AS ENUM\`, \`JSONB\` operators (\`->>\`, \`?\`, \`@>\`), Native Arrays (\`TEXT[]\`, \`ANY()\`, \`UNNEST()\`), \`gen_random_uuid()\`.
- **Administration & Security**: \`CREATE SCHEMA\`, \`CREATE DATABASE\`, \`CREATE ROLE\`, \`ALTER ROLE WITH LOGIN PASSWORD\`, \`GRANT\`, \`REVOKE\`.
- **Full-Text Search Engine**: \`to_tsvector('english', col)\`, \`to_tsquery('english', term)\`, \`@@\` match operator.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Single-Column B-Tree Indexing**:
   - *Concepts*: Eliminating full table scans on high-cardinality equality and range predicates.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_price ON products(price);\`
2. **Slot 2 — Composite Multi-Column Indexing**:
   - *Concepts*: Leftmost-prefix indexing optimizing compound WHERE and ORDER BY pipelines.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_cat_price ON products(category, price);\`
3. **Slot 3 — Filtered Partial Indexing (\`WHERE\`)**:
   - *Concepts*: Creating compact, space-efficient indexes covering only rows satisfying specific predicates (e.g. active users, unpaid invoices).
   - *Syntax Pattern*: \`CREATE INDEX idx_active_users_email ON user_accounts (email) WHERE is_active = true;\`
4. **Slot 4 — Computed Expression Indexing (\`LOWER\`)**:
   - *Concepts*: Indexing deterministic function evaluations on column values to accelerate case-insensitive queries without forcing full table scans.
   - *Syntax Pattern*: \`CREATE INDEX idx_lower_user_email ON user_accounts (LOWER(email));\`
5. **Slot 5 — User-Defined Enumerated Types (\`ENUM\`)**:
   - *Concepts*: Enforcing strict domain state vocabularies via catalog-level enum types.
   - *Syntax Pattern*: \`CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed');\`
6. **Slot 6 — Schema Namespace Isolation (\`CREATE SCHEMA\`)**:
   - *Concepts*: Logical partitioning of tables, views, and routines across isolated tenant/feature namespaces.
   - *Syntax Pattern*: \`CREATE SCHEMA sales;\`
7. **Slot 7 — Database Catalog Creation (\`CREATE DATABASE\`)**:
   - *Concepts*: Instantiating distinct physical database catalogs for multi-application tenancy.
   - *Syntax Pattern*: \`CREATE DATABASE belajar_sql;\`
8. **Slot 8 — Role-Based Access Control (\`ROLE\`, \`GRANT\`, \`REVOKE\`)**:
   - *Concepts*: Principle of least privilege, defining database roles and granting/revoking table-level DML privileges.
   - *Syntax Patterns*:
     - \`CREATE ROLE reporting_user WITH LOGIN PASSWORD 'SecretPass123!';\`
     - \`GRANT SELECT, INSERT ON products TO reporting_user;\`
     - \`REVOKE INSERT ON products FROM reporting_user;\`
9. **Slot 9 — JSONB Scalar Field Extraction (\`->>\`)**:
   - *Concepts*: Extracting JSON object values as clean text values for projection and filtering.
   - *Syntax Pattern*: \`SELECT id, name, metadata->>'brand' AS brand FROM products ORDER BY id;\`
10. **Slot 10 — JSONB Key Existence Checking (\`?\`)**:
    - *Concepts*: Testing for the presence of specific top-level JSON keys inside document payloads.
    - *Syntax Pattern*: \`SELECT id, name FROM products WHERE metadata ? 'warranty' ORDER BY id;\`
11. **Slot 11 — JSONB Document Containment (\`@>\`)**:
    - *Concepts*: Probing structured JSON sub-document matches using indexable binary containment.
    - *Syntax Pattern*: \`SELECT id, name FROM products WHERE metadata @> '{\"in_stock\": true}' ORDER BY id;\`
12. **Slot 12 — Inverted Lexeme GIN Indexing (Mandatory Task: Q941)**:
    - *Concepts*: Constructing Generalized Inverted Indexes (GIN) over normalized linguistic lexemes for instant keyword lookup.
    - *Syntax Pattern*: \`CREATE INDEX idx_documents_body_fts ON documents USING GIN(to_tsvector('english', body));\`
13. **Slot 13 — Full-Text Document Retrieval (Mandatory Task: Q942)**:
    - *Concepts*: Tokenizing queries and matching inverted lexeme vectors using the \`@@\` operator.
    - *Syntax Pattern*: \`SELECT id, title, body FROM documents WHERE to_tsvector('english', body) @@ to_tsquery('english', 'performance') ORDER BY id;\`
14. **Slot 14 — Native Multi-Valued Arrays (\`TEXT[]\`, \`ANY\`, \`UNNEST\`)**:
    - *Concepts*: Storing array attributes, querying membership with \`= ANY(array)\`, and expanding array elements into rows via \`UNNEST\`.
    - *Syntax Patterns*:
      - \`SELECT id, title, tags FROM article_tags WHERE 'postgres' = ANY(tags) ORDER BY id;\`
      - \`SELECT UNNEST(tags) AS single_tag FROM article_tags WHERE id = 1;\`
15. **Slot 15 — Cryptographic UUID Generation (\`gen_random_uuid\`)**:
    - *Concepts*: Generating globally unique, collision-resistant version 4 UUIDs for secure distributed entity identifiers.
    - *Syntax Pattern*: \`SELECT gen_random_uuid() AS session_token;\`

`;

content = content.substring(0, mod9IdxNew) + newMod9 + content.substring(mod10IdxNew);

// 9. Update Section 4: Module-by-Module Breakdown for MySQL
const oldSection4M1to9 = `#### Module 1: DDL & Basic DML (MySQL Track)
- **Session Tasks**: 10 | **Pool Size**: 60 | **Overrides**: 3 slots (Slots 3, 5, 9)
- **MySQL Dialect Specifics**:
  - Slot 3 utilizes \`id INT AUTO_INCREMENT PRIMARY KEY\` and explicit \`VARCHAR(255)\` types.
  - Slot 5 incorporates MySQL insertion patterns and \`SELECT LAST_INSERT_ID()\`.
  - Slot 9 demonstrates MySQL column reordering via \`ALTER TABLE movies MODIFY COLUMN year INT AFTER title;\`.

#### Module 2: WHERE Filter Deep-Dive (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 40 | **Overrides**: 0 (Full ANSI SQL parity)
- **MySQL Dialect Specifics**:
  - Full standard SQL parity across all filtering logic (\`WHERE\`, \`BETWEEN\`, \`LIKE\`, \`IN\`, \`ORDER BY\`, \`DISTINCT\`, \`LIMIT\`, \`OFFSET\`).

#### Module 3: Aggregations & Grouping (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 36 | **Overrides**: 2 slots (Slots 7 & 8)
- **MySQL Dialect Specifics**:
  - Slot 7 replaces PostgreSQL \`FILTER (WHERE ...)\` with MySQL conditional aggregation:
    \`\`\`sql
    SELECT category,
           COUNT(*) AS total_items,
           SUM(CASE WHEN price > 500 THEN 1 ELSE 0 END) AS premium_items
    FROM items
    GROUP BY category;
    \`\`\`
  - Slot 8 replaces \`STRING_AGG\` with \`GROUP_CONCAT\`:
    \`\`\`sql
    SELECT department_id,
           GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS employee_names
    FROM employees
    GROUP BY department_id;
    \`\`\`

#### Module 4: Functions & Control Flow (MySQL Track)
- **Session Tasks**: 7 | **Pool Size**: 42 | **Overrides**: 4 slots (Slots 4, 5, 6, 7)
- **MySQL Dialect Specifics**:
  - Slot 4 features MySQL's native \`IF()\` function: \`SELECT first_name, score, IF(score >= 80, 'VIP', 'Regular') AS tier FROM customers;\`
  - Slot 5 leverages \`IFNULL()\`: \`SELECT first_name, IFNULL(discount_code, 'NONE') AS promo FROM customers;\`
  - Slot 6 utilizes date formatting for monthly/daily truncation:
    \`\`\`sql
    SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start,
           SUM(monthly_fee) AS total_fee
    FROM subscriptions
    GROUP BY month_start
    ORDER BY month_start;
    \`\`\`
  - Slot 7 uses MySQL explicit casting syntax \`CAST(raw_price AS DECIMAL(10,2))\` and \`TRIM()\`.

#### Module 5: Relations & Integrity Constraints (MySQL Track)
- **Session Tasks**: 12 | **Pool Size**: 60 | **Overrides**: 4 slots (Slots 3, 8, 10, 12)
- **MySQL Dialect Specifics**:
  - Slot 3 emulates full outer joins using ANSI cross joins and unions where engine constraints apply.
  - Slot 8 enforces \`VARCHAR(255)\` constraints on \`UNIQUE\` keys.
  - Slot 10 replaces PostgreSQL \`ON CONFLICT\` with standard MySQL \`ON DUPLICATE KEY UPDATE\` and \`INSERT IGNORE\`:
    \`\`\`sql
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (1, 101, 1)
    ON DUPLICATE KEY UPDATE quantity = cart.quantity + VALUES(quantity);
    \`\`\`
  - Slot 12 emulates PostgreSQL \`LATERAL\` joins via correlated subquery joins:
    \`\`\`sql
    SELECT d.dept_name, e.name, e.salary
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id
      AND e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = d.id)
    ORDER BY d.dept_name;
    \`\`\`

#### Module 6: Subqueries & Set Operators (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 51 | **Overrides**: 4 slots (Slots 7, 8, 10, 11)
- **MySQL Dialect Specifics**:
  - Slot 7 emulates \`INTERSECT\` using \`INNER JOIN\`:
    \`\`\`sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    INNER JOIN project_b b ON a.member_name = b.member_name
    ORDER BY a.member_name;
    \`\`\`
  - Slot 8 emulates \`EXCEPT\` using an anti-join:
    \`\`\`sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    LEFT JOIN project_b b ON a.member_name = b.member_name
    WHERE b.member_name IS NULL
    ORDER BY a.member_name;
    \`\`\`
  - Slot 9 fully supports MySQL 8.0+ Common Table Expressions (\`WITH\` CTE).
  - Slot 10 supports recursive CTEs (\`WITH RECURSIVE\`), adapting path concatenation via \`CONCAT(p.path, ' -> ', o.name)\`.
  - Slot 11 emulates writable data-modifying CTEs via temporary table staging:
    \`\`\`sql
    CREATE TEMPORARY TABLE moved AS
    SELECT id, title, status, closed_at FROM active_tickets WHERE status = 'closed';
    DELETE FROM active_tickets WHERE status = 'closed';
    SELECT * FROM moved ORDER BY id;
    \`\`\`

#### Module 7: Window Functions & Advanced Querying (MySQL Track)
- **Session Tasks**: 9 | **Pool Size**: 43 | **Overrides**: 2 slots (Slots 6 & 9)
- **MySQL Dialect Specifics**:
  - Full support for window functions: \`ROW_NUMBER()\`, \`RANK()\`, \`AVG() OVER (PARTITION BY ...)\`, \`LAG()\`, and \`ROWS BETWEEN\`.
  - Slot 6 emulates PostgreSQL's \`DISTINCT ON\` via window ranking CTE:
    \`\`\`sql
    WITH ranked_orders AS (
        SELECT customer_id, order_date, amount,
               ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
        FROM orders
    )
    SELECT customer_id, order_date, amount
    FROM ranked_orders
    WHERE rn = 1;
    \`\`\`
  - Slot 9 emulates materialized view storage using standard virtual views (\`CREATE VIEW premium_accounts_summary AS ...\`).

#### Module 8: Transactions, Concurrency & Locking (MySQL Track)
- **Session Tasks**: 6 | **Pool Size**: 28 | **Overrides**: 5 slots (Slots 1, 2, 3, 4, 5)
- **MySQL Dialect Specifics**:
  - Transactions begin explicitly using \`START TRANSACTION;\` instead of \`BEGIN;\`.
  - Full execution of \`COMMIT;\`, \`ROLLBACK;\`, and \`SAVEPOINT\`.
  - Concurrency locking with \`SELECT ... FOR UPDATE\` and explicit table locks (\`LOCK TABLES accounts WRITE; UNLOCK TABLES;\`).
  - Slot 5 configures transaction isolation: \`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; ... COMMIT;\`.
  - Slot 6 fully executes high-concurrency non-blocking queue polling via \`SELECT ... FOR UPDATE SKIP LOCKED\`.

#### Module 9: Indexing, Full-Text Search & Administration (MySQL Track)
- **Session Tasks**: 14 | **Pool Size**: 48 | **Overrides**: 12 slots (Slots 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14)`;

const newSection4M1to9 = `#### Module 1: DDL & Basic DML (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 60 | **Overrides**: 3 slots (Slots 3, 5, 10)
- **MySQL Dialect Specifics**:
  - Slot 3 utilizes \`id INT AUTO_INCREMENT PRIMARY KEY\` and explicit \`VARCHAR(255)\` types.
  - Slot 5 incorporates MySQL insertion patterns and \`SELECT LAST_INSERT_ID()\`.
  - Slot 10 demonstrates MySQL column reordering via \`ALTER TABLE movies MODIFY COLUMN year INT AFTER title;\`.

#### Module 2: WHERE Filter Deep-Dive (MySQL Track)
- **Session Tasks**: 9 | **Pool Size**: 45 | **Overrides**: 0 (Full ANSI SQL parity)
- **MySQL Dialect Specifics**:
  - Full standard SQL parity across all filtering logic (\`WHERE\`, \`BETWEEN\`, \`LIKE\`, \`IN\`, \`NOT IN\`, \`ORDER BY\`, \`DISTINCT\`, \`LIMIT\`, \`OFFSET\`).

#### Module 3: Aggregations & Grouping (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 36 | **Overrides**: 2 slots (Slots 7 & 8)
- **MySQL Dialect Specifics**:
  - Slot 7 replaces PostgreSQL \`FILTER (WHERE ...)\` with MySQL conditional aggregation:
    \`\`\`sql
    SELECT category,
           COUNT(*) AS total_items,
           SUM(CASE WHEN price > 500 THEN 1 ELSE 0 END) AS premium_items
    FROM items
    GROUP BY category;
    \`\`\`
  - Slot 8 replaces \`STRING_AGG\` with \`GROUP_CONCAT\`:
    \`\`\`sql
    SELECT department_id,
           GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS employee_names
    FROM employees
    GROUP BY department_id;
    \`\`\`

#### Module 4: Functions & Control Flow (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 42 | **Overrides**: 4 slots (Slots 4, 6, 7, 8)
- **MySQL Dialect Specifics**:
  - Slot 4 utilizes date formatting for monthly/daily truncation:
    \`\`\`sql
    SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start,
           SUM(monthly_fee) AS total_fee
    FROM subscriptions
    GROUP BY month_start
    ORDER BY month_start;
    \`\`\`
  - Slot 6 features MySQL's native \`IF()\` function: \`SELECT first_name, score, IF(score >= 80, 'VIP', 'Regular') AS tier FROM customers;\`
  - Slot 7 leverages \`IFNULL()\`: \`SELECT first_name, IFNULL(discount_code, 'NONE') AS promo FROM customers;\`
  - Slot 8 uses MySQL explicit casting syntax \`CAST(raw_price AS DECIMAL(10,2))\` and \`TRIM()\`.

#### Module 5: Relations & Integrity Constraints (MySQL Track)
- **Session Tasks**: 17 | **Pool Size**: 60 | **Overrides**: 5 slots (Slots 4, 10, 12, 16, 17)
- **MySQL Dialect Specifics**:
  - Slot 4 emulates full outer joins using ANSI cross joins and unions where engine constraints apply.
  - Slot 10 emulates PostgreSQL \`LATERAL\` joins via correlated subquery joins:
    \`\`\`sql
    SELECT d.dept_name, e.name, e.salary
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id
      AND e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = d.id)
    ORDER BY d.dept_name;
    \`\`\`
  - Slot 12 enforces \`VARCHAR(255)\` constraints on \`UNIQUE\` keys.
  - Slot 16 replaces PostgreSQL \`ON CONFLICT DO UPDATE\` with MySQL \`ON DUPLICATE KEY UPDATE\`:
    \`\`\`sql
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (1, 101, 1)
    ON DUPLICATE KEY UPDATE quantity = cart.quantity + VALUES(quantity);
    \`\`\`
  - Slot 17 uses MySQL \`INSERT IGNORE\` for idempotent cart insertion.

#### Module 6: Subqueries & Set Operators (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 51 | **Overrides**: 4 slots (Slots 7, 8, 10, 11)
- **MySQL Dialect Specifics**:
  - Slot 7 emulates \`INTERSECT\` using \`INNER JOIN\`:
    \`\`\`sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    INNER JOIN project_b b ON a.member_name = b.member_name
    ORDER BY a.member_name;
    \`\`\`
  - Slot 8 emulates \`EXCEPT\` using an anti-join:
    \`\`\`sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    LEFT JOIN project_b b ON a.member_name = b.member_name
    WHERE b.member_name IS NULL
    ORDER BY a.member_name;
    \`\`\`
  - Slot 9 fully supports MySQL 8.0+ Common Table Expressions (\`WITH\` CTE).
  - Slot 10 supports recursive CTEs (\`WITH RECURSIVE\`), adapting path concatenation via \`CONCAT(p.path, ' -> ', o.name)\`.
  - Slot 11 emulates writable data-modifying CTEs via temporary table staging:
    \`\`\`sql
    CREATE TEMPORARY TABLE moved AS
    SELECT id, title, status, closed_at FROM active_tickets WHERE status = 'closed';
    DELETE FROM active_tickets WHERE status = 'closed';
    SELECT * FROM moved ORDER BY id;
    \`\`\`

#### Module 7: Window Functions & Advanced Querying (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 43 | **Overrides**: 2 slots (Slots 9 & 11)
- **MySQL Dialect Specifics**:
  - Full support for window functions: \`ROW_NUMBER()\`, \`RANK()\`, \`AVG() OVER (PARTITION BY ...)\`, \`LAG()\`, \`LEAD()\`, and \`ROWS BETWEEN\`.
  - Slot 9 emulates PostgreSQL's \`DISTINCT ON\` via window ranking CTE:
    \`\`\`sql
    WITH ranked_orders AS (
        SELECT customer_id, order_date, amount,
               ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
        FROM orders
    )
    SELECT customer_id, order_date, amount
    FROM ranked_orders
    WHERE rn = 1;
    \`\`\`
  - Slot 11 emulates materialized view storage using standard virtual views (\`CREATE VIEW premium_accounts_summary AS ...\`).

#### Module 8: Transactions, Concurrency & Locking (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 28 | **Overrides**: 5 slots (Slots 1, 2, 4, 7, 8)
- **MySQL Dialect Specifics**:
  - Transactions begin explicitly using \`START TRANSACTION;\` instead of \`BEGIN;\`.
  - Full execution of \`COMMIT;\`, \`ROLLBACK;\`, and \`SAVEPOINT\`.
  - Concurrency locking with \`SELECT ... FOR UPDATE\` and explicit table locks (\`LOCK TABLES accounts WRITE; UNLOCK TABLES;\`).
  - Slot 5 fully executes non-blocking queue polling via \`SELECT ... FOR UPDATE SKIP LOCKED\`.
  - Slot 7 configures transaction isolation: \`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; ... COMMIT;\`.

#### Module 9: Indexing, Full-Text Search & Administration (MySQL Track)
- **Session Tasks**: 15 | **Pool Size**: 48 | **Overrides**: 12 slots (Slots 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15)`;

content = content.replace(oldSection4M1to9, newSection4M1to9);

// 10. Update Section 6: Summary Statistics
const oldSection6 = `## 6. Summary Statistics

\`\`\`
SQLek Total Content Distribution:
┌───────────────────────────────────────────────┐
│ Total Tasks: 560                              │
│ ├─ Curriculum Modules (1–11): 462 Tasks       │
│ │  ├─ PostgreSQL: 462 Active Tasks            │
│ │  └─ MySQL: 408 Active Tasks (Mod 1–9)       │
│ └─ Final Boss Exam Bank: 98 Capstone Tasks    │
│    ├─ Medium Difficulty: 49 Tasks             │
│    └─ Hard Difficulty: 49 Tasks               │
└───────────────────────────────────────────────┘
\`\`\`

> [!NOTE]
> **Task Pool Synchronization**: The active codebase contains **462 curriculum task variations** across Modules 1–11 (including 60 variations in Module 5 across 12 category slots and 24 variations in Module 11 across 8 category slots) plus **98 capstone exam tasks**, yielding **560 total database problems** (or 557 tasks when calibrated to the 57-variation baseline for Module 5). All 11 modules are available on PostgreSQL (\`PGlite WASM\`), with Modules 1–9 fully executable on MySQL (\`sql.js WASM\` + translation layer with 408 active task variations).`;

const newSection6 = `## 6. Summary Statistics

\`\`\`
SQLek Total Content Distribution:
┌───────────────────────────────────────────────┐
│ Total Tasks: 565                              │
│ ├─ Curriculum Modules (1–11): 467 Tasks       │
│ │  ├─ PostgreSQL: 467 Active Tasks            │
│ │  └─ MySQL: 413 Active Tasks (Mod 1–9)       │
│ └─ Final Boss Exam Bank: 98 Capstone Tasks    │
│    ├─ Medium Difficulty: 49 Tasks             │
│    └─ Hard Difficulty: 49 Tasks               │
└───────────────────────────────────────────────┘
\`\`\`

> [!NOTE]
> **116 Dedicated Category Slots**: The curriculum has been refactored to a strict 1-to-1 concept distribution across **116 dedicated category slots**, guaranteeing that 100% of distinct SQL clauses, operations, and constraints appear in every single module session. The active codebase contains **467 curriculum task variations** across Modules 1–11 plus **98 capstone exam tasks**, yielding **565 total database problems**. All 11 modules are available on PostgreSQL (\`PGlite WASM\`), with Modules 1–9 fully executable on MySQL (\`sql.js WASM\` + translation layer with 413 active task variations).`;

content = content.replace(oldSection6, newSection6);

fs.writeFileSync(file, content);
console.log('CURRICULUM.md updated successfully!');
