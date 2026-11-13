# SQLek: Comprehensive Curriculum & Learning Materials

> **Interactive Client-Side SQL Mastery Platform**  
> *Engines Supported: PostgreSQL (via PGlite WASM) & MySQL (via sql.js WASM)*  
> *Repository: SQLek*

---

## 1. Project Overview & Architectural Foundation

**SQLek** is a modern, high-performance, browser-native SQL learning and assessment platform. Designed for hands-on pedagogical progression, SQLek enables developers, database administrators, and data analysts to practice and master SQL directly in the browser—with zero external server dependencies, instant execution feedback, and persistent local state.

### 1.1 Dual Database Execution Models

The application runs a dual-engine architecture powered by WebAssembly (WASM):

1. **PostgreSQL Track (`PGlite WASM`)**:
   - **Underlying Engine**: Powered by `@electric-sql/pglite` (a lightweight, in-browser WebAssembly build of real PostgreSQL).
   - **Capabilities**: Full relational capabilities including native `GENERATED ALWAYS AS IDENTITY`, domain `CHECK` constraints, foreign keys with cascading actions (`ON DELETE CASCADE`), transactional savepoints, ANSI set operations (`INTERSECT`, `EXCEPT`), window ranking and offset frames, `DISTINCT ON` expressions, native `JSONB` with binary containment (`@>`, `?`, `->>`), GIN indexes, Full-Text Search (`to_tsvector`, `to_tsquery`, `@@`), dynamic `EXPLAIN` and `EXPLAIN (ANALYZE, BUFFERS)` execution plan trees, and PostgreSQL Role-Based Access Control (`CREATE ROLE`, `GRANT`, `REVOKE`).
   - **Isolation**: Each module session and task reset triggers an isolated transactional reset, dropping user namespaces and roles while recreating the `public` schema.

2. **MySQL Track (`sql.js WASM + Translation Layer`)**:
   - **Underlying Engine**: Powered by `sql.js` (SQLite WASM) augmented by an intelligent SQL preprocessing and emulation engine (`preprocessSqlForSqlJs` in `src/lib/db/engine.ts`).
   - **Dialect Adaptation**: Automatically adapts and executes MySQL syntax patterns, including:
     - `AUTO_INCREMENT PRIMARY KEY` column definitions.
     - MySQL data types such as `UNSIGNED` numeric types and `ENUM(...)`.
     - MySQL string and aggregation functions: `GROUP_CONCAT(... SEPARATOR ...)`, `IF(...)`, `IFNULL(...)`, and `LAST_INSERT_ID()`.
     - MySQL JSON functions: custom shims for `JSON_CONTAINS(...)`, `JSON_CONTAINS_PATH(...)`, `JSON_EXTRACT(...)`, and `JSON_UNQUOTE(...)`.
     - MySQL UPSERT syntax: `INSERT ... ON DUPLICATE KEY UPDATE` rewritten to conflict clauses.
     - MySQL Full-Text Search: regex-based translation for `MATCH(...) AGAINST(... IN BOOLEAN MODE)` with `+` inclusion, `-` exclusion, and natural language tokens.
     - Multi-statement transactions with `START TRANSACTION; ... COMMIT;`.

### 1.2 Pedagogical Design & Session Mechanics

- **Task Variation & Category Slots**: Every module defines a fixed number of **Category Slots** (session length). Each slot is backed by a diverse pool of interchangeable task variations.
- **Diverse Sampling Algorithm**: When a learner enters a module, the platform applies `sampleDiverseQuestions()` (Fisher-Yates slot-based sampling) to pick exactly one task variation per slot, followed by any mandatory tasks. This guarantees comprehensive pedagogical coverage without redundant repetitions.
- **Dynamic Schema Inspection**: Live tables are rendered dynamically from the active WASM database instance, showing column types, constraints, and live row previews.
- **Bilingual Localization**: All module descriptions, task briefs, technical concept guides, and syntax patterns are fully localized in **English (`en`)** and **Bahasa Indonesia (`id`)**.

---

## 2. Curriculum Architecture Matrix

The SQLek curriculum comprises **11 core learning modules** plus **1 final capstone exam**:
- **Curriculum Pool**: 467 unique task variations across 11 modules.
- **Exam Bank**: 98 high-difficulty capstone assessment tasks.
- **Total Task Pool**: 565 unique database problems across the entire platform.
- **Guaranteed Concept Coverage**: 116 dedicated category slots across Modules 1–11 ensure every single distinct SQL clause, constraint, and technique appears in every module session.

| Module # | Module Title | Session Tasks | Pool Size | Focus Area | Engine Availability |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **DDL & Basic DML** | 11 | 60 | Schema creation, primary keys, evolution (DROP & RENAME), modifications, deletions, truncation | PostgreSQL & MySQL |
| **02** | **WHERE Filter Deep-Dive** | 9 | 45 | Conditional predicates, ranges, pattern matching, discrete `IN` lists, NULL logic, deduplication, pagination | PostgreSQL & MySQL |
| **03** | **Aggregations & Grouping** | 8 | 36 | Aggregate functions, multi-column grouping, `HAVING`, `FILTER (WHERE ...)`, `STRING_AGG` | PostgreSQL & MySQL |
| **04** | **Functions & Control Flow** | 8 | 42 | String/math functions, `EXTRACT`, `DATE_TRUNC`, `INTERVAL`, `CASE WHEN`, `COALESCE`, explicit casting & `TRIM` | PostgreSQL & MySQL |
| **05** | **Relations & Integrity Constraints** | 17 | 60 | Joins (INNER, LEFT, RIGHT, FULL, CROSS, SELF, ANTI), non-equi, `LATERAL`, CHECK, UNIQUE, CASCADE, RESTRICT, SET NULL, UPSERT (DO UPDATE / DO NOTHING) | PostgreSQL & MySQL |
| **06** | **Subqueries & Set Operators** | 11 | 51 | Subqueries (scalar, IN, FROM, EXISTS), `UNION ALL`, `UNION`, `INTERSECT`, `EXCEPT`, CTEs, `WITH RECURSIVE`, writable CTEs | PostgreSQL & MySQL |
| **07** | **Window Functions & Advanced Querying** | 11 | 43 | `ROW_NUMBER`, `PARTITION BY`, `LAG`, `DELETE ... RETURNING`, `LEAD`, `FIRST_VALUE`/`LAST_VALUE`, `NTILE`, `ROWS BETWEEN`, `DISTINCT ON`, VIEWs, Materialized Views | PostgreSQL & MySQL |
| **08** | **Transactions, Concurrency & Locking** | 8 | 28 | ACID, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `FOR UPDATE`, `FOR UPDATE SKIP LOCKED`, `FOR UPDATE NOWAIT`, isolation levels (`REPEATABLE READ` / `SERIALIZABLE`) | PostgreSQL & MySQL |
| **09** | **Indexing, Full-Text Search & Administration** | 15 | 48 | B-Tree, composite, partial, expression, ENUM, SCHEMA, DATABASE, RBAC, JSONB (`->>`, `?`, `@>`), FTS GIN index & query (mandatory), arrays (`TEXT[]`, `UNNEST`), UUID | PostgreSQL & MySQL |
| **10** | **EXPLAIN ANALYZE & Query Performance** | 10 | 30 | Execution plans, `EXPLAIN (ANALYZE, BUFFERS)`, cost metrics, scans, join algorithms, subplans, catalog stats (3 variations/slot) | PostgreSQL (PGlite) |
| **11** | **PL/pgSQL, Automation & Schema Normalization** | 8 | 24 | User-defined scalar/table functions, stored procedures, BEFORE/AFTER triggers, audit logging, progressive 1NF-to-3NF normalization (3 variations/slot) | PostgreSQL (PGlite) |
| **Final**| **Comprehensive Random Exam (Final Boss)** | 30 | 98 | End-to-end randomized exam with execution-plan cost scoring & structural validation | PostgreSQL (PGlite) |

---

## 3. PostgreSQL Learning Modules

Below is the exhaustive, slot-by-slot breakdown for the PostgreSQL curriculum track.

```
PostgreSQL Curriculum Flow:
[Mod 1: DDL & DML] ──> [Mod 2: Filtering] ──> [Mod 3: Aggregations] ──> [Mod 4: Functions]
       │
       ▼
[Mod 5: Relations] ──> [Mod 6: Subqueries] ──> [Mod 7: Window Funcs] ──> [Mod 8: Transactions]
       │
       ▼
[Mod 9: Indexing & Admin] ──> [Mod 10: EXPLAIN ANALYZE] ──> [Final Boss: Comprehensive Exam]
```

---

### Module 1: DDL & Basic DML

- **Module ID**: `1`
- **Title (EN)**: `Module 1: DDL & Basic DML`
- **Title (ID)**: `Modul 1: DDL & DML Dasar`
- **Description (EN)**: Master table creation, schema modifications, updates, deletions, and column selection.
- **Description (ID)**: Kuasai pembuatan tabel, modifikasi skema, pembaruan dan penghapusan data, serta seleksi kolom.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 60 variations (Slots 1–8, 11: 6 variations each; Slots 9–10: 3 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: `SELECT`, `FROM`, `CREATE TABLE`, `ALTER TABLE`, `ADD COLUMN`, `DROP COLUMN`, `RENAME COLUMN`, `INSERT INTO`, `VALUES`, `UPDATE`, `SET`, `WHERE`, `DELETE`, `TRUNCATE TABLE`.
- **PostgreSQL Data Types & Features**: `INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`, `SERIAL PRIMARY KEY`, `TEXT`, `VARCHAR`, `DEFAULT`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Full Table Selection**:
   - *Concepts*: Table scans, projecting all attributes using wildcard `SELECT *`.
   - *Syntax Pattern*: `SELECT * FROM mytable;`
2. **Slot 2 — Explicit Column Projection**:
   - *Concepts*: Column projection list, reducing bandwidth and memory consumption.
   - *Syntax Pattern*: `SELECT column1, column2 FROM mytable;`
3. **Slot 3 — Table Definition with Identity**:
   - *Concepts*: Defining relational entities, modern SQL-standard identity specifications vs legacy serial columns.
   - *Syntax Pattern*: `CREATE TABLE mytable (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, column1 TEXT NOT NULL, column2 INT DEFAULT 0);`
4. **Slot 4 — Schema Alteration (Add Column)**:
   - *Concepts*: Metadata alteration, appending nullable or defaulted attributes without table recreation.
   - *Syntax Pattern*: `ALTER TABLE mytable ADD COLUMN new_column_name data_type;`
5. **Slot 5 — Explicit Record Insertion**:
   - *Concepts*: Tuple insertion with explicit column mapping.
   - *Syntax Pattern*: `INSERT INTO mytable (column1, column2, column3) VALUES (val1, val2, val3);`
6. **Slot 6 — Targeted Mutation (UPDATE with Literal)**:
   - *Concepts*: Row-level state mutation setting explicit literal values restricted by primary key/unique identifier predicates.
   - *Syntax Pattern*: `UPDATE mytable SET rating = 9.2 WHERE id = 11;`
7. **Slot 7 — Computed Arithmetic UPDATE**:
   - *Concepts*: In-place expression computation referencing current row values (`SET col = col + delta`).
   - *Syntax Pattern*: `UPDATE mytable SET rating = rating + 0.5 WHERE year >= 2010;`
8. **Slot 8 — Targeted Row Deletion**:
   - *Concepts*: Deleting specific subsets of tuples matching relational expressions.
   - *Syntax Pattern*: `DELETE FROM mytable WHERE year < 2000;`
9. **Slot 9 — Schema Evolution: Column Removal (`DROP COLUMN`)**:
   - *Concepts*: Dropping unused or obsolete columns from live relations via instant metadata modification.
   - *Syntax Pattern*: `ALTER TABLE movies DROP COLUMN rating;`
10. **Slot 10 — Schema Evolution: Column Renaming (`RENAME COLUMN`)**:
    - *Concepts*: Renaming existing column identifiers in system catalog metadata without table rebuilds.
    - *Syntax Pattern*: `ALTER TABLE movies RENAME COLUMN director TO filmmaker;`
11. **Slot 11 — High-Speed Table Truncation (`TRUNCATE TABLE`)**:
    - *Concepts*: Rapid zero-logging storage reclamation bypassing row-by-row deletion triggers in O(1) time.
    - *Syntax Pattern*: `TRUNCATE TABLE mytable;`

---

### Module 2: WHERE Filter Deep-Dive

- **Module ID**: `2`
- **Title (EN)**: `Module 2: WHERE Filter Deep-Dive`
- **Title (ID)**: `Modul 2: Eksplorasi Filter WHERE`
- **Description (EN)**: Master row filtering with logical operators, pattern matching, ranges, NULL logic, deduplication, and pagination.
- **Description (ID)**: Kuasai filtering row data dengan operator logika, pattern matching, rentang nilai, penanganan NULL, deduplikasi DISTINCT, dan paginasi.
- **Session Configuration**:
  - **Tasks per Session**: 9 tasks (Category Slots 1–9)
  - **Total Task Pool Size**: 45 variations (5 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: `WHERE`, `AND`, `OR`, `NOT`, `BETWEEN ... AND ...`, `LIKE`, `IN`, `NOT IN`, `IS NULL`, `IS NOT NULL`, `ORDER BY`, `ASC`, `DESC`, `DISTINCT`, `LIMIT`, `OFFSET`.
- **Relational Concepts**: Three-Valued Logic (`TRUE`, `FALSE`, `UNKNOWN`), wildcards (`%`, `_`), deterministic result sorting, offset pagination, discrete set membership.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Numeric Comparison Filters**:
   - *Concepts*: Strict relational inequalities (`>`, `<`, `>=`, `<=`, `<>`).
   - *Syntax Pattern*: `SELECT * FROM items WHERE price > 100;`
2. **Slot 2 — Inclusive Range Filtering (`BETWEEN`)**:
   - *Concepts*: Closed-interval range checks for continuous variables.
   - *Syntax Pattern*: `SELECT * FROM items WHERE price BETWEEN 50 AND 300;`
3. **Slot 3 — Wildcard Pattern Matching (`LIKE`)**:
   - *Concepts*: Substring matching with prefix/suffix anchors.
   - *Syntax Pattern*: `SELECT * FROM items WHERE name LIKE 'Desk%';`
4. **Slot 4 — Compound Predicate Logic (`AND` / `OR`)**:
   - *Concepts*: Boolean algebraic conditions combining disparate entity attributes.
   - *Syntax Pattern*: `SELECT * FROM items WHERE category = 'Electronics' AND price < 100;`
5. **Slot 5 — Exact Value & Status Filtering**:
   - *Concepts*: Equality checks against enumerated states or boundary thresholds (`stock = 0`).
   - *Syntax Pattern*: `SELECT * FROM items WHERE stock = 0;`
6. **Slot 6 — Ordering & Sorting Projections**:
   - *Concepts*: Positional and ascending/descending sorting pipelines.
   - *Syntax Pattern*: `SELECT * FROM items ORDER BY price DESC;`
7. **Slot 7 — Result Set Deduplication (`DISTINCT`)**:
   - *Concepts*: Eliminating duplicate projected tuples across single or multi-attribute lists.
   - *Syntax Pattern*: `SELECT DISTINCT category FROM items;`
8. **Slot 8 — Deterministic Pagination (`LIMIT` & `OFFSET`)**:
   - *Concepts*: Cursor/offset slicing for chunked data retrieval.
   - *Syntax Pattern*: `SELECT * FROM items ORDER BY id ASC LIMIT 5 OFFSET 5;`
9. **Slot 9 — Discrete Set Membership Filtering (`IN` / `NOT IN`)**:
   - *Concepts*: Checking inclusion or exclusion against finite discrete lists of constants, multi-range B-tree index seeks, and null-safety implications.
   - *Syntax Patterns*:
     - `SELECT * FROM items WHERE category IN ('Furniture', 'Kitchen');`
     - `SELECT id, name, price, category FROM items WHERE category NOT IN ('Electronics', 'Furniture') ORDER BY price ASC;`

---

### Module 3: Aggregations & Grouping

- **Module ID**: `3`
- **Title (EN)**: `Module 3: Aggregations & Grouping`
- **Title (ID)**: `Modul 3: Agregasi & Grouping`
- **Description (EN)**: Summarize metrics using COUNT, SUM, AVG, GROUP BY, HAVING, FILTER (WHERE ...), and string aggregation.
- **Description (ID)**: Rangkum metrik data menggunakan COUNT, SUM, AVG, GROUP BY, HAVING, klausa FILTER (WHERE ...), serta agregasi teks STRING_AGG.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 36 variations (Slots 1–6: 5 variations each; Slots 7–8: 3 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Clauses & Keywords**: `COUNT(*)`, `COUNT(col)`, `SUM()`, `AVG()`, `MIN()`, `MAX()`, `GROUP BY`, `HAVING`, `FILTER (WHERE ...)`, `STRING_AGG()`, `ORDER BY`.
- **Advanced Grouping**: PostgreSQL-specific conditional aggregation, string concatenations within grouped buckets.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Global Dataset Aggregations**:
   - *Concepts*: Calculating total records, sums, and averages across an entire relation without partitioning.
   - *Syntax Pattern*: `SELECT COUNT(*), SUM(amount), AVG(amount) FROM sales;`
2. **Slot 2 — Single-Column Group Aggregations**:
   - *Concepts*: Bucketing rows by a single dimensional attribute.
   - *Syntax Pattern*: `SELECT category, SUM(amount) FROM sales GROUP BY category;`
3. **Slot 3 — Multi-Dimensional Grouping**:
   - *Concepts*: Hierarchical grouping across compound keys (`region, category`).
   - *Syntax Pattern*: `SELECT region, category, SUM(amount) FROM sales GROUP BY region, category;`
4. **Slot 4 — Pre-Aggregation Row Filtering (`WHERE` + `GROUP BY`)**:
   - *Concepts*: Discarding non-qualifying tuples prior to hash/stream aggregation.
   - *Syntax Pattern*: `SELECT region, SUM(amount) FROM sales WHERE amount > 500 GROUP BY region;`
5. **Slot 5 — Post-Aggregation Filtering (`HAVING`)**:
   - *Concepts*: Filtering grouped partitions based on calculated aggregate metrics.
   - *Syntax Pattern*: `SELECT category, SUM(amount) FROM sales GROUP BY category HAVING SUM(amount) > 3000;`
6. **Slot 6 — Sorted Analytical Aggregation**:
   - *Concepts*: Ordering computed aggregate outputs for top-N ranking.
   - *Syntax Pattern*: `SELECT seller, SUM(amount) AS total FROM sales GROUP BY seller ORDER BY total DESC;`
7. **Slot 7 — Filtered Aggregate Expressions (`FILTER`)**:
   - *Concepts*: PostgreSQL standard conditional aggregate execution (`COUNT(*) FILTER (WHERE ...)`).
   - *Syntax Pattern*: `SELECT category, COUNT(*) AS total_items, COUNT(*) FILTER (WHERE price > 500) AS premium_items FROM items GROUP BY category;`
8. **Slot 8 — Deterministic String Aggregation (`STRING_AGG`)**:
   - *Concepts*: Concatenating string values into delimited lists ordered within each aggregate bucket.
   - *Syntax Pattern*: `SELECT department_id, STRING_AGG(name, ', ' ORDER BY name) AS employee_names FROM employees GROUP BY department_id;`

---

### Module 4: Functions & Control Flow

- **Module ID**: `4`
- **Title (EN)**: `Module 4: Functions & Control Flow`
- **Title (ID)**: `Modul 4: Fungsi & Logika Kondisional`
- **Description (EN)**: Transform data with string, math, date functions, CASE WHEN, and COALESCE.
- **Description (ID)**: Manipulasi data menggunakan fungsi teks, matematika, tanggal, serta ekspresi CASE WHEN dan COALESCE.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 42 variations (Slots 1–3, 6–8: 6 variations each; Slots 4–5: 3 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Functions & Expressions**: `UPPER()`, `LOWER()`, `LENGTH()`, `ROUND()`, `EXTRACT(YEAR FROM ...)`, `EXTRACT(MONTH FROM ...)`, `DATE_TRUNC()`, `INTERVAL`, `CASE WHEN ... THEN ... ELSE ... END`, `COALESCE()`, `CAST(... AS ...)`, `TRIM()`.
- **Mathematical & Conversion Operators**: Integer division, arithmetic expressions, NULL coalescing, numeric decimal casting (`NUMERIC(10,2)` / `DECIMAL(10,2)`), temporal interval arithmetic (`+ INTERVAL '1 month'`, `- INTERVAL '30 days'`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — String Casing & Normalization**:
   - *Concepts*: Standardizing text casing using `UPPER` and `LOWER`.
   - *Syntax Pattern*: `SELECT UPPER(first_name), UPPER(last_name) FROM customers;`
2. **Slot 2 — Mathematical Scoring & Arithmetic Projections**:
   - *Concepts*: Applying scalar arithmetic, integer division, and rounding to projected attributes.
   - *Syntax Pattern*: `SELECT first_name, score / 10 AS score_tier FROM customers;`
3. **Slot 3 — Temporal Extraction (`EXTRACT`)**:
   - *Concepts*: Isolating date parts (year, month, day) from temporal timestamps and date fields.
   - *Syntax Pattern*: `SELECT first_name, EXTRACT(YEAR FROM join_date) AS join_year FROM customers;`
4. **Slot 4 — Temporal Calendar Truncation (`DATE_TRUNC`)**:
   - *Concepts*: Rounding timestamps to the beginning of temporal granularities (month, day, hour) for time-series aggregation.
   - *Syntax Pattern*: `SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;`
5. **Slot 5 — Temporal Interval Arithmetic (`INTERVAL`)**:
   - *Concepts*: Dynamic calendar math adding or subtracting discrete intervals (`+ INTERVAL '1 month'`, `- INTERVAL '30 days'`).
   - *Syntax Pattern*: `SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at;`
6. **Slot 6 — Conditional Branching (`CASE WHEN`)**:
   - *Concepts*: Multi-branch relational logic mapping values to categorized tiers.
   - *Syntax Pattern*: `SELECT first_name, score, CASE WHEN score >= 80 THEN 'VIP' ELSE 'Regular' END AS tier FROM customers;`
7. **Slot 7 — NULL Fallback Handling (`COALESCE`)**:
   - *Concepts*: Short-circuit evaluation returning the first non-null argument.
   - *Syntax Pattern*: `SELECT first_name, COALESCE(discount_code, 'NONE') AS promo FROM customers;`
8. **Slot 8 — Explicit Type Casting & String Sanitization (`CAST` & `TRIM`)**:
   - *Concepts*: Explicit data type conversion between incompatible string/numeric domains via SQL-standard `CAST(... AS NUMERIC)` or PostgreSQL shorthand `::`, paired with string trimming to sanitize whitespace.
   - *Syntax Pattern*: `SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;`

---

### Module 5: Relations & Integrity Constraints

- **Module ID**: `5`
- **Title (EN)**: `Module 5: Relations & Integrity Constraints`
- **Title (ID)**: `Modul 5: Relasi Tabel & Integrity Constraints`
- **Description (EN)**: Connect data using joins, self-joins, CHECK constraints, UNIQUE rules, cascading foreign keys, and atomic UPSERT handling.
- **Description (ID)**: Hubungkan tabel via joins, self-join, batasan CHECK, UNIQUE, cascading foreign key, serta penanganan konflik atomik UPSERT.
- **Session Configuration**:
  - **Tasks per Session**: 17 tasks (Category Slots 1–17)
  - **Total Task Pool Size**: 60 variations (Slots 1–2, 4, 6–8, 11–13: 5 vars each; Slots 3, 5, 9, 10, 17: 2 vars each; Slot 16: 3 vars; Slots 14–15: 1 var each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Join Mechanisms**: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`, `CROSS JOIN`, `SELF JOIN`, Anti-Join (`LEFT JOIN ... WHERE right.id IS NULL`), Aliased WHERE Join, Non-Equi Join (`BETWEEN`, `>=`), `LATERAL` subquery evaluation.
- **Constraints & Integrity**: `CHECK (expr)`, `UNIQUE`, `FOREIGN KEY ... REFERENCES ... ON DELETE CASCADE`, `ON DELETE RESTRICT`, `ON DELETE SET NULL`.
- **Atomic Concurrency Handling**: `INSERT INTO ... ON CONFLICT (...) DO UPDATE SET ...` using `EXCLUDED`, and idempotent inserts via `ON CONFLICT (...) DO NOTHING`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Equi-Joins (`INNER JOIN`)**:
   - *Concepts*: Strict relational intersection matching foreign keys to primary keys.
   - *Syntax Pattern*: `SELECT employees.name, departments.dept_name FROM employees JOIN departments ON employees.department_id = departments.id;`
2. **Slot 2 — Outer Inclusion (`LEFT JOIN`)**:
   - *Concepts*: Preserving all left tuples while filling unreferenced right attributes with NULLs.
   - *Syntax Pattern*: `SELECT employees.name, departments.dept_name FROM employees LEFT JOIN departments ON employees.department_id = departments.id;`
3. **Slot 3 — Right Outer Inclusion (`RIGHT JOIN`)**:
   - *Concepts*: Preserving all right relation tuples, ensuring parent reference tables without active children are displayed.
   - *Syntax Pattern*: `SELECT d.dept_name, e.name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id ORDER BY d.dept_name, e.name;`
4. **Slot 4 — Complete Relational Mesh (`FULL JOIN`)**:
   - *Concepts*: Bi-directional preservation of tuples from both participating relations.
   - *Syntax Pattern*: `SELECT employees.name, departments.dept_name FROM employees FULL JOIN departments ON employees.department_id = departments.id;`
5. **Slot 5 — Cartesian Grid Product (`CROSS JOIN`)**:
   - *Concepts*: Unconstrained Cartesian matrix product across entities (e.g. stores x products inventory grid).
   - *Syntax Pattern*: `SELECT s.store_name, p.name AS product_name FROM stores s CROSS JOIN products p ORDER BY s.store_name, product_name;`
6. **Slot 6 — Self-Referential Joins (`SELF JOIN`)**:
   - *Concepts*: Table aliasing to model hierarchical relationships within the same relation (e.g., employee to manager).
   - *Syntax Pattern*: `SELECT emp.name AS employee, mgr.name AS manager FROM employees emp JOIN employees mgr ON emp.manager_id = mgr.id;`
7. **Slot 7 — Anti-Joins (Finding Missing Relations)**:
   - *Concepts*: Identifying orphaned or unlinked records using `LEFT JOIN` combined with `WHERE right.id IS NULL`.
   - *Syntax Pattern*: `SELECT employees.name FROM employees LEFT JOIN departments ON employees.department_id = departments.id WHERE departments.id IS NULL;`
8. **Slot 8 — Filtered & Aliased Multi-Table Joins**:
   - *Concepts*: Combining table aliases with conditional WHERE clauses across joined entities.
   - *Syntax Pattern*: `SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.salary > 70000;`
9. **Slot 9 — Non-Equi Joins (`BETWEEN` & Inequalities)**:
   - *Concepts*: Joining tables on continuous ranges or inequality thresholds rather than equality.
   - *Syntax Pattern*: `SELECT e.name, e.salary, g.grade_level FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary ORDER BY e.salary DESC;`
10. **Slot 10 — Lateral Correlated Evaluation (`LATERAL JOIN`)**:
    - *Concepts*: Correlated subquery evaluation inside the `FROM` clause referencing columns from preceding tables per row (e.g. top-1 earner per department).
    - *Syntax Pattern*: `SELECT d.dept_name, sub.name, sub.salary FROM departments d LEFT JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary DESC LIMIT 1) sub ON true ORDER BY d.dept_name;`
11. **Slot 11 — Domain Validation (`CHECK` Constraints)**:
    - *Concepts*: Enforcing row-level invariants and positive bounds at the storage level.
    - *Syntax Pattern*: `CREATE TABLE products (id INT PRIMARY KEY, name TEXT NOT NULL, price INT CHECK (price > 0));`
12. **Slot 12 — Candidate Key Enforcement (`UNIQUE`)**:
    - *Concepts*: Preventing duplicate business keys (e.g., emails) across tables.
    - *Syntax Pattern*: `CREATE TABLE users (id INT PRIMARY KEY, email TEXT UNIQUE, username TEXT NOT NULL);`
13. **Slot 13 — Referential Cascading (`ON DELETE CASCADE`)**:
    - *Concepts*: Automatically deleting child rows when a referenced parent row is deleted.
    - *Syntax Pattern*: `CREATE TABLE project_tasks (id INT PRIMARY KEY, department_id INT REFERENCES departments(id) ON DELETE CASCADE, task_name TEXT NOT NULL);`
14. **Slot 14 — Strict Referential Rejection (`ON DELETE RESTRICT`)**:
    - *Concepts*: Rejecting deletions of parent records that still have dependent child references.
    - *Syntax Pattern*: `CREATE TABLE department_heads (id INT PRIMARY KEY, name TEXT, department_id INT REFERENCES departments(id) ON DELETE RESTRICT);`
15. **Slot 15 — Referential Nullification (`ON DELETE SET NULL`)**:
    - *Concepts*: Setting child foreign key references to NULL upon parent deletion while preserving dependent records.
    - *Syntax Pattern*: `CREATE TABLE employee_profiles (id INT PRIMARY KEY, employee_id INT REFERENCES employees(id) ON DELETE SET NULL, bio TEXT);`
16. **Slot 16 — Atomic Upsert Mutation (`ON CONFLICT DO UPDATE`)**:
    - *Concepts*: Atomic handling of primary/unique key violations using `DO UPDATE SET` and `EXCLUDED`.
    - *Syntax Pattern*: `INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 1) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;`
17. **Slot 17 — Idempotent Insertion (`ON CONFLICT DO NOTHING`)**:
    - *Concepts*: Silently skipping insertion without aborting transactions when duplicate keys exist.
    - *Syntax Pattern*: `INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 2) ON CONFLICT (user_id, product_id) DO NOTHING;`

### Module 6: Subqueries & Set Operators

- **Module ID**: `6`
- **Title (EN)**: `Module 6: Subqueries & Set Operators`
- **Title (ID)**: `Modul 6: Subquery & Operator Set`
- **Description (EN)**: Write nested queries, scalar/correlated subqueries, Common Table Expressions (CTEs), UNION, INTERSECT, and EXCEPT.
- **Description (ID)**: Kuasai subquery skalar dan berkorelasi, Common Table Expressions (CTE WITH), serta operator himpunan UNION, INTERSECT, dan EXCEPT.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 51 variations (Slots 1–8: 5 variations each; Slot 9: 3 variations; Slots 10–11: 4 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Subquery Structures**: Scalar subqueries, multi-row subqueries (`IN`, `NOT IN`), derived tables in `FROM`, correlated subqueries with `EXISTS` and `NOT EXISTS`.
- **Set Operators**: `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`.
- **Common Table Expressions (CTE)**: `WITH cte_name AS (...) SELECT ...`.
- **Recursive & Modifying CTEs**: `WITH RECURSIVE org_tree AS (... UNION ALL ...)`, anchor query, recursive member, termination condition, hierarchical tree traversal, and data-modifying CTEs (`WITH ... AS (DELETE ... RETURNING ...)`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — Scalar Comparison Subqueries**:
   - *Concepts*: Comparing individual column values against dynamically calculated scalar results (e.g., `score > (SELECT AVG(score)...)`).
   - *Syntax Pattern*: `SELECT member_name, score FROM project_a WHERE score > (SELECT AVG(score) FROM project_a);`
2. **Slot 2 — Set Membership Subqueries (`IN`)**:
   - *Concepts*: Filtering records matching a dynamic list produced by an inner query.
   - *Syntax Pattern*: `SELECT member_name FROM project_a WHERE member_name IN (SELECT member_name FROM project_b);`
3. **Slot 3 — Derived Tables (Inline Subqueries in `FROM`)**:
   - *Concepts*: Materializing intermediate query results with required aliases for higher-order aggregation.
   - *Syntax Pattern*: `SELECT sub.role, AVG(sub.score) AS avg_score FROM (SELECT * FROM project_a WHERE score >= 80) AS sub GROUP BY sub.role;`
4. **Slot 4 — Correlated Subqueries (`EXISTS`)**:
   - *Concepts*: Row-by-row existence verification referencing attributes from the outer query block.
   - *Syntax Pattern*: `SELECT a.member_name FROM project_a a WHERE EXISTS (SELECT 1 FROM project_b b WHERE b.member_name = a.member_name);`
5. **Slot 5 — Set Concatenation (`UNION ALL`)**:
   - *Concepts*: Combining homogeneous result sets while preserving duplicates without sorting overhead.
   - *Syntax Pattern*: `SELECT member_name FROM project_a UNION ALL SELECT member_name FROM project_b;`
6. **Slot 6 — Deduplicated Set Union (`UNION`)**:
   - *Concepts*: Mathematical union eliminating identical tuples across two distinct relations.
   - *Syntax Pattern*: `SELECT member_name FROM project_a UNION SELECT member_name FROM project_b ORDER BY member_name;`
7. **Slot 7 — Set Intersection (`INTERSECT`)**:
   - *Concepts*: Deriving the exact overlap of records existing in both input sets.
   - *Syntax Pattern*: `SELECT member_name FROM project_a INTERSECT SELECT member_name FROM project_b ORDER BY member_name;`
8. **Slot 8 — Set Difference (`EXCEPT`)**:
   - *Concepts*: Subtracting records present in the second set from the first set.
   - *Syntax Pattern*: `SELECT member_name FROM project_a EXCEPT SELECT member_name FROM project_b ORDER BY member_name;`
9. **Slot 9 — Common Table Expressions (`WITH` CTE)**:
   - *Concepts*: Structuring complex subquery logic into readable, reusable, named declarative blocks.
   - *Syntax Pattern*:
     ```sql
     WITH HighSalaryEmployees AS (
         SELECT department_id, name, salary
         FROM employees
         WHERE salary > 70000
     )
     SELECT department_id, COUNT(*) AS high_earner_count, MAX(salary) AS max_salary
     FROM HighSalaryEmployees
     GROUP BY department_id;
     ```
10. **Slot 10 — Hierarchical Recursion with Recursive CTEs (`WITH RECURSIVE`)**:
    - *Concepts*: Solving graph traversal, bill-of-materials, and organizational hierarchies using anchor members and recursive terms joined with `UNION ALL`.
    - *Syntax Pattern*:
      ```sql
      WITH RECURSIVE org_tree AS (
          SELECT id, name, manager_id, role, 1 AS depth
          FROM org_hierarchy
          WHERE manager_id IS NULL
          UNION ALL
          SELECT o.id, o.name, o.manager_id, o.role, p.depth + 1
          FROM org_hierarchy o
          INNER JOIN org_tree p ON o.manager_id = p.id
      )
      SELECT name, role, depth FROM org_tree ORDER BY depth, name;
      ```
11. **Slot 11 — Data-Modifying Common Table Expressions (Writable CTEs)**:
    - *Concepts*: Performing atomic multi-operation pipelines where DML statements (`DELETE ... RETURNING`) feed directly into downstream `SELECT` queries within a single roundtrip.
    - *Syntax Pattern*:
      ```sql
      WITH moved AS (
          DELETE FROM active_tickets
          WHERE status = 'closed'
          RETURNING id, title, status, closed_at
      )
      SELECT id, title, status, closed_at FROM moved ORDER BY id;
      ```

---

### Module 7: Window Functions & Advanced Querying

- **Module ID**: `7`
- **Title (EN)**: `Module 7: Window Functions & Advanced Querying`
- **Title (ID)**: `Modul 7: Window Function & Query Lanjutan`
- **Description (EN)**: Master window ranking functions, partition framing, DISTINCT ON deduplication, LAG/LEAD offsets, and RETURNING clauses.
- **Description (ID)**: Kuasai fungsi ranking window, partisi agregasi, deduplikasi analitik DISTINCT ON, fungsi offset LAG/LEAD, dan mutasi RETURNING.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 43 variations (Slots 1–4, 10: 6 vars each; Slots 8, 9, 11: 3 vars each; Slot 6: 2 vars; Slots 5, 7: 1 var each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Window Functions**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `OVER (PARTITION BY ... ORDER BY ...)`, `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`, `NTILE()`, `ROWS BETWEEN ... AND ...`.
- **Advanced Querying & Views**: `DISTINCT ON (...)`, `DELETE ... RETURNING`, `CREATE VIEW`, `CREATE MATERIALIZED VIEW`, `REFRESH MATERIALIZED VIEW`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Positional Window Ranking (`ROW_NUMBER`)**:
   - *Concepts*: Sequential ordinal numbering of rows within partitions or overall datasets.
   - *Syntax Pattern*: `SELECT owner, balance, ROW_NUMBER() OVER (ORDER BY balance DESC) AS pos FROM accounts;`
2. **Slot 2 — Partitioned Aggregate Projections (`PARTITION BY`)**:
   - *Concepts*: Computing partition-level summary metrics alongside granular individual row details.
   - *Syntax Pattern*: `SELECT owner, category, balance, AVG(balance) OVER (PARTITION BY category) AS cat_avg FROM accounts;`
3. **Slot 3 — Historical Value Offsets (`LAG`)**:
   - *Concepts*: Peeking backward at preceding rows within the window partition to calculate step differences.
   - *Syntax Pattern*: `SELECT owner, balance, LAG(balance, 1) OVER (ORDER BY balance ASC) AS prev_bal FROM accounts;`
4. **Slot 4 — DML Mutation Returning (`RETURNING`)**:
   - *Concepts*: Capturing deleted, updated, or inserted tuple states directly from DML mutations without additional queries.
   - *Syntax Pattern*: `DELETE FROM accounts WHERE balance < 1000 RETURNING owner, balance;`
5. **Slot 5 — Forward Value Offsets (`LEAD`)**:
   - *Concepts*: Peeking forward at upcoming records within ordered window partitions.
   - *Syntax Pattern*: `SELECT id, owner, balance, LEAD(balance, 1) OVER (ORDER BY balance ASC) AS next_balance FROM accounts ORDER BY balance ASC;`
6. **Slot 6 — Partition Extremes (`FIRST_VALUE` & `LAST_VALUE`)**:
   - *Concepts*: Fetching extreme boundary values within partition frames across sorted records.
   - *Syntax Patterns*:
     - `SELECT id, owner, category, balance, FIRST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC) AS top_owner FROM accounts ORDER BY category, balance DESC;`
     - `SELECT id, owner, category, balance, LAST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_owner FROM accounts ORDER BY category, balance DESC;`
7. **Slot 7 — Equal-Width Bucketing (`NTILE`)**:
   - *Concepts*: Dividing ordered datasets into specified numbers of ranked quartiles, percentiles, or buckets.
   - *Syntax Pattern*: `SELECT id, owner, balance, NTILE(4) OVER (ORDER BY balance DESC) AS quartile FROM accounts ORDER BY balance DESC, id;`
8. **Slot 8 — Explicit Window Frames (`ROWS BETWEEN`)**:
   - *Concepts*: Fine-grained sliding window frames computing cumulative running totals and moving averages.
   - *Syntax Pattern*: `SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM accounts ORDER BY id;`
9. **Slot 9 — Deduplicated Tops (`DISTINCT ON`)**:
   - *Concepts*: PostgreSQL-exclusive analytical deduplication retaining the first row per group based on explicit ordering.
   - *Syntax Pattern*: `SELECT DISTINCT ON (customer_id) customer_id, order_date, amount FROM orders ORDER BY customer_id, order_date DESC;`
10. **Slot 10 — Reusable View Definitions (`CREATE VIEW`)**:
    - *Concepts*: Virtual tables encapsulating complex analytical queries without physical storage replication.
    - *Syntax Pattern*: `CREATE VIEW high_balances AS SELECT owner, balance FROM accounts WHERE balance > 3000;`
11. **Slot 11 — Cached Snapshots (`CREATE` & `REFRESH MATERIALIZED VIEW`)**:
    - *Concepts*: Persisting precomputed analytical query result sets to disk for instant high-speed lookups, with scheduled refresh capabilities.
    - *Syntax Patterns*:
      - `CREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;`
      - `REFRESH MATERIALIZED VIEW premium_accounts_summary;`

### Module 8: Transactions, Concurrency & Locking

- **Module ID**: `8`
- **Title (EN)**: `Module 8: Transactions, Concurrency & Locking`
- **Title (ID)**: `Modul 8: Transaksi, Konkurensi & Locking`
- **Description (EN)**: Master ACID principles, transaction isolation, COMMIT, ROLLBACK, pessimistic row locking (FOR UPDATE), and SAVEPOINTs.
- **Description (ID)**: Pahami prinsip ACID, kontrol transaksi dengan COMMIT dan ROLLBACK, pessimistic row locking via SELECT FOR UPDATE, serta SAVEPOINT.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 28 variations (Slots 1–4: 5 vars each; Slot 7: 3 vars; Slots 5–6: 2 vars each; Slot 8: 1 var)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **ACID & Boundary Control**: `BEGIN`, `START TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`.
- **Locking & Concurrency**: `SELECT ... FOR UPDATE`, `FOR UPDATE SKIP LOCKED`, `FOR UPDATE NOWAIT`.
- **Isolation Levels**: `SET TRANSACTION ISOLATION LEVEL READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Atomic Transaction Confirmation (`COMMIT`)**:
   - *Concepts*: Persisting multi-statement data mutations atomically to durable storage.
   - *Syntax Pattern*: `BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT;`
2. **Slot 2 — Transaction Fault Rollback (`ROLLBACK`)**:
   - *Concepts*: Aborting mutated states and reverting all uncommitted database operations to the pristine pre-transaction state.
   - *Syntax Pattern*: `BEGIN; UPDATE accounts SET balance = balance - 500 WHERE id = 1; ROLLBACK;`
3. **Slot 3 — Fine-Grained Recovery Checkpoints (`SAVEPOINT`)**:
   - *Concepts*: Defining intermediate recovery milestones allowing partial rollbacks without aborting the parent transaction.
   - *Syntax Pattern*: `BEGIN; UPDATE accounts SET balance = balance + 100 WHERE id = 1; SAVEPOINT sp1; UPDATE accounts SET balance = balance - 9999 WHERE id = 2; ROLLBACK TO SAVEPOINT sp1; COMMIT;`
4. **Slot 4 — Pessimistic Row Locking (`FOR UPDATE`)**:
   - *Concepts*: Acquiring exclusive row-level read-for-write locks to prevent concurrent race conditions during check-then-act operations.
   - *Syntax Pattern*: `SELECT * FROM accounts WHERE id = 1 FOR UPDATE;`
5. **Slot 5 — Non-Blocking Queue Polling (`FOR UPDATE SKIP LOCKED`)**:
   - *Concepts*: Implementing high-concurrency background job workers that bypass already-locked rows without blocking or stalling worker threads.
   - *Syntax Pattern*: `SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;`
6. **Slot 6 — Fail-Fast Concurrency Control (`FOR UPDATE NOWAIT`)**:
   - *Concepts*: Failing immediately with an error if target rows are held by concurrent transactions rather than waiting for lock releases.
   - *Syntax Pattern*: `SELECT id, task_type, payload FROM job_queue WHERE id = 1 FOR UPDATE NOWAIT;`
7. **Slot 7 — Snapshot Consistency (`REPEATABLE READ` / `READ COMMITTED`)**:
   - *Concepts*: Configuring transaction isolation to prevent non-repeatable reads and guarantee frozen transaction start snapshots.
   - *Syntax Pattern*: `BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT * FROM accounts WHERE id = 1; COMMIT;`
8. **Slot 8 — Strict Serializable Isolation (`SERIALIZABLE`)**:
   - *Concepts*: Highest ANSI isolation level using Serializable Snapshot Isolation (SSI) to eliminate phantom reads and serialization anomalies.
   - *Syntax Pattern*: `BEGIN; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; SELECT * FROM accounts WHERE id = 2; COMMIT;`

### Module 9: Indexing, Full-Text Search & Administration

- **Module ID**: `9`
- **Title (EN)**: `Module 9: Indexing, Full-Text Search & Administration`
- **Title (ID)**: `Modul 9: Indexing, Full-Text Search & Administrasi`
- **Description (EN)**: Optimize execution with B-Tree/GIN indexes, Full-Text Search, JSONB, schemas, roles, privileges, and database creation.
- **Description (ID)**: Optimalkan query dengan index B-Tree/GIN, Full-Text Search, JSONB, skema, role, hak akses, dan pembuatan database.
- **Session Configuration**:
  - **Tasks per Session**: 15 tasks (Category Slots 1–15)
  - **Total Task Pool Size**: 48 variations (Slots 1, 2, 5, 6, 8: 5 vars each; Slot 13: 6 vars; Slots 9–11: 3 vars each; Slots 3, 14: 2 vars each; Slots 4, 7, 12, 15: 1 var each)
  - **Mandatory Tasks**: 2 tasks (Slot 12: Question 941; Slot 13: Question 942)

#### Key SQL Concepts, Clauses, & Keywords
- **Indexing Engines**: `CREATE INDEX`, B-Tree index, Composite index, Partial index (`WHERE condition`), Expression index (`LOWER(col)`), `USING GIN`.
- **Data Types & Extensions**: `CREATE TYPE ... AS ENUM`, `JSONB` operators (`->>`, `?`, `@>`), Native Arrays (`TEXT[]`, `ANY()`, `UNNEST()`), `gen_random_uuid()`.
- **Administration & Security**: `CREATE SCHEMA`, `CREATE DATABASE`, `CREATE ROLE`, `ALTER ROLE WITH LOGIN PASSWORD`, `GRANT`, `REVOKE`.
- **Full-Text Search Engine**: `to_tsvector('english', col)`, `to_tsquery('english', term)`, `@@` match operator.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Single-Column B-Tree Indexing**:
   - *Concepts*: Eliminating full table scans on high-cardinality equality and range predicates.
   - *Syntax Pattern*: `CREATE INDEX idx_products_price ON products(price);`
2. **Slot 2 — Composite Multi-Column Indexing**:
   - *Concepts*: Leftmost-prefix indexing optimizing compound WHERE and ORDER BY pipelines.
   - *Syntax Pattern*: `CREATE INDEX idx_products_cat_price ON products(category, price);`
3. **Slot 3 — Filtered Partial Indexing (`WHERE`)**:
   - *Concepts*: Creating compact, space-efficient indexes covering only rows satisfying specific predicates (e.g. active users, unpaid invoices).
   - *Syntax Pattern*: `CREATE INDEX idx_active_users_email ON user_accounts (email) WHERE is_active = true;`
4. **Slot 4 — Computed Expression Indexing (`LOWER`)**:
   - *Concepts*: Indexing deterministic function evaluations on column values to accelerate case-insensitive queries without forcing full table scans.
   - *Syntax Pattern*: `CREATE INDEX idx_lower_user_email ON user_accounts (LOWER(email));`
5. **Slot 5 — User-Defined Enumerated Types (`ENUM`)**:
   - *Concepts*: Enforcing strict domain state vocabularies via catalog-level enum types.
   - *Syntax Pattern*: `CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed');`
6. **Slot 6 — Schema Namespace Isolation (`CREATE SCHEMA`)**:
   - *Concepts*: Logical partitioning of tables, views, and routines across isolated tenant/feature namespaces.
   - *Syntax Pattern*: `CREATE SCHEMA sales;`
7. **Slot 7 — Database Catalog Creation (`CREATE DATABASE`)**:
   - *Concepts*: Instantiating distinct physical database catalogs for multi-application tenancy.
   - *Syntax Pattern*: `CREATE DATABASE belajar_sql;`
8. **Slot 8 — Role-Based Access Control (`ROLE`, `GRANT`, `REVOKE`)**:
   - *Concepts*: Principle of least privilege, defining database roles and granting/revoking table-level DML privileges.
   - *Syntax Patterns*:
     - `CREATE ROLE reporting_user WITH LOGIN PASSWORD 'SecretPass123!';`
     - `GRANT SELECT, INSERT ON products TO reporting_user;`
     - `REVOKE INSERT ON products FROM reporting_user;`
9. **Slot 9 — JSONB Scalar Field Extraction (`->>`)**:
   - *Concepts*: Extracting JSON object values as clean text values for projection and filtering.
   - *Syntax Pattern*: `SELECT id, name, metadata->>'brand' AS brand FROM products ORDER BY id;`
10. **Slot 10 — JSONB Key Existence Checking (`?`)**:
    - *Concepts*: Testing for the presence of specific top-level JSON keys inside document payloads.
    - *Syntax Pattern*: `SELECT id, name FROM products WHERE metadata ? 'warranty' ORDER BY id;`
11. **Slot 11 — JSONB Document Containment (`@>`)**:
    - *Concepts*: Probing structured JSON sub-document matches using indexable binary containment.
    - *Syntax Pattern*: `SELECT id, name FROM products WHERE metadata @> '{"in_stock": true}' ORDER BY id;`
12. **Slot 12 — Inverted Lexeme GIN Indexing (Mandatory Task: Q941)**:
    - *Concepts*: Constructing Generalized Inverted Indexes (GIN) over normalized linguistic lexemes for instant keyword lookup.
    - *Syntax Pattern*: `CREATE INDEX idx_documents_body_fts ON documents USING GIN(to_tsvector('english', body));`
13. **Slot 13 — Full-Text Document Retrieval (Mandatory Task: Q942)**:
    - *Concepts*: Tokenizing queries and matching inverted lexeme vectors using the `@@` operator.
    - *Syntax Pattern*: `SELECT id, title, body FROM documents WHERE to_tsvector('english', body) @@ to_tsquery('english', 'performance') ORDER BY id;`
14. **Slot 14 — Native Multi-Valued Arrays (`TEXT[]`, `ANY`, `UNNEST`)**:
    - *Concepts*: Storing array attributes, querying membership with `= ANY(array)`, and expanding array elements into rows via `UNNEST`.
    - *Syntax Patterns*:
      - `SELECT id, title, tags FROM article_tags WHERE 'postgres' = ANY(tags) ORDER BY id;`
      - `SELECT UNNEST(tags) AS single_tag FROM article_tags WHERE id = 1;`
15. **Slot 15 — Cryptographic UUID Generation (`gen_random_uuid`)**:
    - *Concepts*: Generating globally unique, collision-resistant version 4 UUIDs for secure distributed entity identifiers.
    - *Syntax Pattern*: `SELECT gen_random_uuid() AS session_token;`

### Module 10: EXPLAIN ANALYZE & Query Performance

- **Module ID**: `10`
- **Title (EN)**: `Module 10: EXPLAIN ANALYZE & Query Performance`
- **Title (ID)**: `Modul 10: EXPLAIN ANALYZE & Kinerja Query`
- **Description (EN)**: Analyze execution plans using EXPLAIN and EXPLAIN ANALYZE across 30 diverse query profiling scenarios covering costs, scans, joins, subplans, and buffer cache.
- **Description (ID)**: Analisis rencana eksekusi menggunakan EXPLAIN dan EXPLAIN ANALYZE pada 30 variasi skenario profil query mencakup estimasi biaya, scan, join, subplan, dan buffer cache.
- **Session Configuration**:
  - **Tasks per Session**: 10 tasks (Category Slots 1–10)
  - **Total Task Pool Size**: 30 variations (3 variations per slot)
  - **Mandatory Tasks**: 0
  - **Engine Availability**: Exclusively on **PostgreSQL (PGlite WASM)**.

#### Key SQL Concepts, Clauses, & Keywords
- **Planner Commands**: `EXPLAIN`, `EXPLAIN (ANALYZE)`, `EXPLAIN (BUFFERS)`, `EXPLAIN (TIMING OFF, SUMMARY OFF)`.
- **Plan Node Types Analyzed**: `Seq Scan`, `Index Scan`, `Index Only Scan`, `Bitmap Heap Scan`, `Bitmap Index Scan`, `Hash Join`, `Merge Join`, `Nested Loop`, `Aggregate`, `HashAggregate`, `GroupAggregate`, `Sort`, `SubPlan`.
- **Cost Metrics**: `Startup Cost`, `Total Cost`, `Plan Rows`, `Plan Width`, `Shared Hit Blocks`, `Shared Read Blocks`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Inspect Query Execution Plan**:
   - *Concepts*: Inspecting estimated startup and total cost units generated by the cost-based optimizer (orders customer lookup, high-value orders, and date ranges).
   - *Syntax Pattern*: `EXPLAIN SELECT * FROM orders WHERE customer_id = 5;`
2. **Slot 2 — Real Row Execution with EXPLAIN ANALYZE**:
   - *Concepts*: Executing queries in a controlled sandbox to compare estimated vs actual row counts.
   - *Syntax Pattern*: `EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE customer_id = 5;`
3. **Slot 3 — Sorting & Aggregation Bottlenecks**:
   - *Concepts*: Identifying in-memory vs disk sorts, cost escalations, and sort keys in large aggregations.
   - *Syntax Pattern*: `EXPLAIN SELECT order_id, SUM(quantity * unit_price) FROM order_items GROUP BY order_id ORDER BY order_id;`
4. **Slot 4 — Sequential Scan vs Index Scan Selection**:
   - *Concepts*: Observing how the planner automatically switches from sequential table scans to B-Tree index scans based on selectivity.
   - *Syntax Pattern*: `EXPLAIN SELECT * FROM events WHERE user_id = 42;`
5. **Slot 5 — Join Strategy Analysis**:
   - *Concepts*: Analyzing the planner's selection between `Hash Join`, `Merge Join`, and `Nested Loop`.
   - *Syntax Pattern*: `EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.id = 10;`
6. **Slot 6 — Detecting Correlated SubPlan Penalties**:
   - *Concepts*: Diagnosing $O(N \times M)$ query degradation caused by subqueries executed repeatedly per outer row.
   - *Syntax Pattern*: `EXPLAIN SELECT id, (SELECT COUNT(*) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS log_count FROM accounts;`
7. **Slot 7 — Aggregation Strategy & Memory Costs**:
   - *Concepts*: Evaluating `HashAggregate` (fast hash table grouping) vs `GroupAggregate` (presorted stream grouping).
   - *Syntax Pattern*: `EXPLAIN SELECT sensor_id, AVG(reading_val) FROM metrics GROUP BY sensor_id;`
8. **Slot 8 — Ordering Elimination via Index Ordering**:
   - *Concepts*: Leveraging pre-sorted index order to satisfy `ORDER BY ... LIMIT N` without executing a separate Sort node.
   - *Syntax Pattern*: `EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at LIMIT 20;`
9. **Slot 9 — Buffer Cache Hit/Miss Inspection**:
   - *Concepts*: Tracking shared memory buffer interactions (`shared hit`, `shared read`) using `EXPLAIN (BUFFERS)`.
   - *Syntax Pattern*: `EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 100;`
10. **Slot 10 — Planner Statistics & Skewed Distributions**:
    - *Concepts*: Assessing how catalog statistics (`pg_statistic`, `ANALYZE`) affect row estimates on skewed data distributions.
    - *Syntax Pattern*: `EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'backordered';`

---

### Module 11: PL/pgSQL, Automation & Schema Normalization

- **Module ID**: `11`
- **Title (EN)**: `Module 11: PL/pgSQL, Automation & Schema Normalization`
- **Title (ID)**: `Modul 11: PL/pgSQL, Otomasi & Normalisasi Skema`
- **Description (EN)**: Master PL/pgSQL functions, table-returning queries, stored procedures, BEFORE/AFTER triggers, audit logging, and progressive 1NF-to-3NF schema normalization.
- **Description (ID)**: Kuasai fungsi PL/pgSQL, fungsi tabel, stored procedure, trigger BEFORE/AFTER, audit logging, serta normalisasi skema 1NF hingga 3NF.
- **Session Configuration**:
  - **Tasks per Session**: 8 tasks (Category Slots 1–8)
  - **Total Task Pool Size**: 24 variations (3 variations per slot)
  - **Mandatory Tasks**: 0
  - **Engine Availability**: Exclusively on **PostgreSQL (PGlite WASM)**.

#### Key SQL Concepts, Clauses, & Keywords
- **Procedural Language & Functions**: `CREATE OR REPLACE FUNCTION ... RETURNS ... LANGUAGE plpgsql AS $ BEGIN ... RETURN ... END; $`, `LANGUAGE sql`, `RETURNS TABLE(...)`, `RETURN QUERY SELECT ...`.
- **Stored Procedures & Execution**: `CREATE OR REPLACE PROCEDURE ... LANGUAGE plpgsql AS $ BEGIN ... END; $`, `CALL procedure_name(...)`.
- **Triggers & Mutation Lifecycle**: `CREATE TRIGGER ... BEFORE INSERT OR UPDATE ON ... FOR EACH ROW EXECUTE FUNCTION ...`, `CREATE TRIGGER ... AFTER UPDATE OR DELETE ON ...`, `RETURNS TRIGGER`, `NEW`, `OLD`, `TG_OP`, `RAISE EXCEPTION`.
- **Audit Logging & Automation**: Change data capture, mutation auditing into immutable history tables (`audit_logs`), auto-timestamping (`NEW.updated_at = NOW()`), string normalization.
- **Schema Normalization (1NF to 3NF)**:
  - **1NF to 2NF**: Identifying composite candidate keys, eliminating partial functional dependencies, and extracting normalized entity tables via `INSERT INTO ... SELECT DISTINCT`.
  - **2NF to 3NF**: Eliminating transitive functional dependencies ($X \to Y \to Z$), isolating lookup attributes into dedicated reference tables, and establishing relational foreign keys.
  - **End-to-End Migration**: Structured multi-step schema refactoring, record deduplication, foreign key linkage via `UPDATE ... FROM`, and normalized join verification queries.

#### Category Slots & Technical Syllabus
1. **Slot 1 — User-Defined Scalar Functions (`CREATE FUNCTION ... RETURNS`)**:
   - *Concepts*: Encapsulating reusable business computations and scalar math/string formatting using `LANGUAGE plpgsql` and `LANGUAGE sql`.
   - *Variations*:
     - **Var #1 (Q1101)**: Tax calculation function (`calculate_tax(p_amount, p_rate)`) with decimal precision rounding.
     - **Var #2 (Q1102)**: Invoice discount tier evaluation function (`calculate_discount(p_subtotal)`).
     - **Var #3 (Q1103)**: Formal name formatting function (`format_full_name(p_first, p_last, p_title)`).
2. **Slot 2 — Table-Returning Functions (`RETURNS TABLE` / `RETURN QUERY`)**:
   - *Concepts*: Building parameterized reusable queries streaming multi-row result sets using `RETURNS TABLE` and `RETURN QUERY SELECT`.
   - *Variations*:
     - **Var #1 (Q1104)**: Filtered customer order history table function (`get_customer_orders(p_cust_id, p_min_amount)`).
     - **Var #2 (Q1105)**: Active member subscriptions filter by tier (`get_subscribers_by_tier(p_tier)`).
     - **Var #3 (Q1106)**: Category catalog item lookup with price ceiling (`get_products_by_category(p_cat, p_max_price)`).
3. **Slot 3 — Stored Procedures & Atomic Mutations (`CREATE PROCEDURE` & `CALL`)**:
   - *Concepts*: Implementing procedural routines for multi-step transactional data mutations without return values, invoked directly via `CALL`.
   - *Variations*:
     - **Var #1 (Q1107)**: Atomic bank account balance transfer procedure (`transfer_funds(p_sender, p_receiver, p_amount)`).
     - **Var #2 (Q1108)**: Order processing fulfillment status updater (`process_order_fulfillment(p_order_id, p_staff_name)`).
     - **Var #3 (Q1109)**: Inventory adjustment procedure with safe bounds checking (`adjust_inventory_stock(p_item_id, p_delta)`).
4. **Slot 4 — BEFORE Triggers for Data Validation & Auto-Timestamps (`RETURNS TRIGGER`)**:
   - *Concepts*: Creating `BEFORE INSERT OR UPDATE` trigger functions to enforce domain integrity, sanitize input data (`LOWER(TRIM(NEW.email))`), validate values with `RAISE EXCEPTION`, or maintain automatic `updated_at` timestamps.
   - *Variations*:
     - **Var #1 (Q1110)**: Email sanitization & auto-timestamp before trigger on user profiles (`trg_sanitize_user_profile`).
     - **Var #2 (Q1111)**: Salary floor baseline constraint trigger with `RAISE EXCEPTION` on staff contracts (`trg_enforce_salary_floor`).
     - **Var #3 (Q1112)**: Discount rate ceiling validation trigger on e-commerce coupons (`trg_validate_coupon_discount`).
5. **Slot 5 — AFTER Triggers for Audit Logging (`OLD` vs `NEW`)**:
   - *Concepts*: Capturing post-mutation row state transitions (`TG_OP`, `OLD`, `NEW`) in `AFTER UPDATE` or `AFTER DELETE` triggers to maintain immutable audit trails.
   - *Variations*:
     - **Var #1 (Q1113)**: Order status change audit logger capturing old vs new status in `order_audit_logs`.
     - **Var #2 (Q1114)**: Employee compensation change history tracking old vs new salary in `salary_audit_history`.
     - **Var #3 (Q1115)**: Inventory stock level change logger tracking quantity shifts in `stock_change_logs`.
6. **Slot 6 — Schema Refactoring: 1NF to 2NF (Eliminating Partial Dependencies)**:
   - *Concepts*: Given a denormalized table with composite keys exhibiting partial dependencies (non-key attributes dependent on only a subset of candidate keys), decomposing the entity into a normalized 2NF table using `INSERT INTO ... SELECT DISTINCT`.
   - *Variations*:
     - **Var #1 (Q1116)**: Extracting product catalog (`products_2nf`) from composite order item records (`order_items_denorm`).
     - **Var #2 (Q1117)**: Extracting course directory (`courses_2nf`) from student enrollment records (`student_course_enrollments`).
     - **Var #3 (Q1118)**: Extracting warehouse locations (`warehouses_2nf`) from flat warehouse inventory (`warehouse_inventory_flat`).
7. **Slot 7 — Schema Refactoring: 2NF to 3NF (Eliminating Transitive Dependencies)**:
   - *Concepts*: Removing transitive functional dependencies ($X \to Y \to Z$ where non-key attributes determine other non-key attributes) by extracting lookup entities into dedicated 3NF reference tables.
   - *Variations*:
     - **Var #1 (Q1119)**: Extracting department details (`departments_3nf`) out of employee records (`employee_records`).
     - **Var #2 (Q1120)**: Extracting postal code regions and tax rates (`postal_regions_3nf`) out of store locations (`store_locations`).
     - **Var #3 (Q1121)**: Extracting subscription plan tiers (`subscription_plans_3nf`) out of customer accounts (`account_subscriptions`).
8. **Slot 8 — End-to-End Normalization Migration & Verification**:
   - *Concepts*: Multi-step relational normalization migrations: defining parent entity and junction/child tables, populating distinct master records, linking foreign key dependencies, and querying the refactored schema via joins.
   - *Variations*:
     - **Var #1 (Q1122)**: Medical consultation denormalization split into `patients_normalized`, `clinics_normalized`, and joined reporting.
     - **Var #2 (Q1123)**: Hotel booking flat log split into `hotel_guests_clean`, `hotel_rooms_clean`, and verified reservation queries.
     - **Var #3 (Q1124)**: Vendor invoice batch split into `vendors_clean`, `items_catalog_clean`, and consolidated cost analysis.

---

## 4. MySQL Learning Modules

The MySQL curriculum track provides developers with a full, authentic MySQL syntax experience powered by `sql.js WASM` and custom SQL transpilation shims.

### 4.1 Key Architectural Differences from PostgreSQL

| Feature / Concept | PostgreSQL Implementation | MySQL Implementation (`engineOverrides.mysql`) |
| :--- | :--- | :--- |
| **Primary Keys** | `INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY` or `SERIAL` | `INT AUTO_INCREMENT PRIMARY KEY` |
| **String Types** | Unbounded `TEXT` standard | `VARCHAR(255)` with length limits |
| **Enumerations** | Catalog-level `CREATE TYPE ... AS ENUM` | Inline column definition: `ENUM('val1', 'val2')` |
| **Filtered Aggregations**| `COUNT(*) FILTER (WHERE condition)` | `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` |
| **String Aggregation** | `STRING_AGG(name, ', ' ORDER BY name)` | `GROUP_CONCAT(name ORDER BY name SEPARATOR ', ')` |
| **Control Flow** | Standard `CASE WHEN ... END`, `COALESCE(...)` | `IF(cond, true_val, false_val)` and `IFNULL(val, default)` |
| **Date Truncation** | `DATE_TRUNC('month', ts)` | `DATE_FORMAT(ts, '%Y-%m-01 00:00:00')` |
| **UPSERT Conflicts** | `INSERT ... ON CONFLICT (k) DO UPDATE / DO NOTHING` | `INSERT ... ON DUPLICATE KEY UPDATE` / `INSERT IGNORE` |
| **Set Difference** | Native `EXCEPT` operator | Emulated via `LEFT JOIN ... WHERE right.id IS NULL` |
| **Set Intersection** | Native `INTERSECT` operator | Emulated via `INNER JOIN` |
| **Lateral Subqueries**| `LEFT JOIN LATERAL (...) sub ON true` | Emulated via correlated subquery in `SELECT` or `JOIN` |
| **Recursive Queries** | Standard `WITH RECURSIVE` | Standard `WITH RECURSIVE` (MySQL 8.0+) |
| **Data-Modifying CTE**| `WITH ... AS (DELETE ... RETURNING ...)` | Emulated via temporary table staging (`CREATE TEMPORARY TABLE`) |
| **Deduplicated Tops** | Native `DISTINCT ON (group_col) ... ORDER BY ...` | Emulated using CTE + `ROW_NUMBER() OVER (...) WHERE rn = 1` |
| **Materialized Views**| Native `CREATE MATERIALIZED VIEW` | Emulated via standard virtual view (`CREATE VIEW`) |
| **Transactions** | `BEGIN; ... COMMIT;` | `START TRANSACTION; ... COMMIT;` |
| **Pessimistic Locks** | `SELECT ... FOR UPDATE` | `SELECT ... FOR UPDATE` / `LOCK TABLES` |
| **JSON Extraction** | Binary operators: `metadata->>'brand'` | Functions: `JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.brand'))` |
| **JSON Containment** | Binary containment: `metadata @> '{"key": "val"}'` | `JSON_CONTAINS(metadata, '"val"', '$.key')` |
| **JSON Key Existence** | `metadata ? 'key'` | `JSON_CONTAINS_PATH(metadata, 'one', '$.key')` |
| **Partial Indexes** | `CREATE INDEX ... WHERE cond` | Emulated via standard column index (unconditional) |
| **Array Attributes** | Native `TEXT[]` and `'val' = ANY(tags)` | Emulated via delimited text matching with `LIKE '%val%'` |
| **User Administration** | `CREATE ROLE name; GRANT SELECT ON tbl TO name;` | `CREATE USER 'user'@'host' IDENTIFIED BY 'pass'; GRANT SELECT ON *.* TO 'user'@'host';` |
| **Full-Text Search** | Lexeme vectors: `to_tsvector() @@ to_tsquery()` | Natural & Boolean match: `MATCH(col) AGAINST('+term' IN BOOLEAN MODE)` |
| **Query Performance** | `EXPLAIN (ANALYZE, BUFFERS)` in Module 10 | Module 10 is designed for PostgreSQL execution trees |

---

### 4.2 Module-by-Module Breakdown for MySQL

#### Module 1: DDL & Basic DML (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 60 | **Overrides**: 3 slots (Slots 3, 5, 10)
- **MySQL Dialect Specifics**:
  - Slot 3 utilizes `id INT AUTO_INCREMENT PRIMARY KEY` and explicit `VARCHAR(255)` types.
  - Slot 5 incorporates MySQL insertion patterns and `SELECT LAST_INSERT_ID()`.
  - Slot 10 demonstrates MySQL column reordering via `ALTER TABLE movies MODIFY COLUMN year INT AFTER title;`.

#### Module 2: WHERE Filter Deep-Dive (MySQL Track)
- **Session Tasks**: 9 | **Pool Size**: 45 | **Overrides**: 0 (Full ANSI SQL parity)
- **MySQL Dialect Specifics**:
  - Full standard SQL parity across all filtering logic (`WHERE`, `BETWEEN`, `LIKE`, `IN`, `NOT IN`, `ORDER BY`, `DISTINCT`, `LIMIT`, `OFFSET`).

#### Module 3: Aggregations & Grouping (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 36 | **Overrides**: 2 slots (Slots 7 & 8)
- **MySQL Dialect Specifics**:
  - Slot 7 replaces PostgreSQL `FILTER (WHERE ...)` with MySQL conditional aggregation:
    ```sql
    SELECT category,
           COUNT(*) AS total_items,
           SUM(CASE WHEN price > 500 THEN 1 ELSE 0 END) AS premium_items
    FROM items
    GROUP BY category;
    ```
  - Slot 8 replaces `STRING_AGG` with `GROUP_CONCAT`:
    ```sql
    SELECT department_id,
           GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS employee_names
    FROM employees
    GROUP BY department_id;
    ```

#### Module 4: Functions & Control Flow (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 42 | **Overrides**: 4 slots (Slots 4, 6, 7, 8)
- **MySQL Dialect Specifics**:
  - Slot 4 utilizes date formatting for monthly/daily truncation:
    ```sql
    SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start,
           SUM(monthly_fee) AS total_fee
    FROM subscriptions
    GROUP BY month_start
    ORDER BY month_start;
    ```
  - Slot 6 features MySQL's native `IF()` function: `SELECT first_name, score, IF(score >= 80, 'VIP', 'Regular') AS tier FROM customers;`
  - Slot 7 leverages `IFNULL()`: `SELECT first_name, IFNULL(discount_code, 'NONE') AS promo FROM customers;`
  - Slot 8 uses MySQL explicit casting syntax `CAST(raw_price AS DECIMAL(10,2))` and `TRIM()`.

#### Module 5: Relations & Integrity Constraints (MySQL Track)
- **Session Tasks**: 17 | **Pool Size**: 60 | **Overrides**: 5 slots (Slots 4, 10, 12, 16, 17)
- **MySQL Dialect Specifics**:
  - Slot 4 emulates full outer joins using ANSI cross joins and unions where engine constraints apply.
  - Slot 10 emulates PostgreSQL `LATERAL` joins via correlated subquery joins:
    ```sql
    SELECT d.dept_name, e.name, e.salary
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id
      AND e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = d.id)
    ORDER BY d.dept_name;
    ```
  - Slot 12 enforces `VARCHAR(255)` constraints on `UNIQUE` keys.
  - Slot 16 replaces PostgreSQL `ON CONFLICT DO UPDATE` with MySQL `ON DUPLICATE KEY UPDATE`:
    ```sql
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (1, 101, 1)
    ON DUPLICATE KEY UPDATE quantity = cart.quantity + VALUES(quantity);
    ```
  - Slot 17 uses MySQL `INSERT IGNORE` for idempotent cart insertion.

#### Module 6: Subqueries & Set Operators (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 51 | **Overrides**: 4 slots (Slots 7, 8, 10, 11)
- **MySQL Dialect Specifics**:
  - Slot 7 emulates `INTERSECT` using `INNER JOIN`:
    ```sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    INNER JOIN project_b b ON a.member_name = b.member_name
    ORDER BY a.member_name;
    ```
  - Slot 8 emulates `EXCEPT` using an anti-join:
    ```sql
    SELECT DISTINCT a.member_name
    FROM project_a a
    LEFT JOIN project_b b ON a.member_name = b.member_name
    WHERE b.member_name IS NULL
    ORDER BY a.member_name;
    ```
  - Slot 9 fully supports MySQL 8.0+ Common Table Expressions (`WITH` CTE).
  - Slot 10 supports recursive CTEs (`WITH RECURSIVE`), adapting path concatenation via `CONCAT(p.path, ' -> ', o.name)`.
  - Slot 11 emulates writable data-modifying CTEs via temporary table staging:
    ```sql
    CREATE TEMPORARY TABLE moved AS
    SELECT id, title, status, closed_at FROM active_tickets WHERE status = 'closed';
    DELETE FROM active_tickets WHERE status = 'closed';
    SELECT * FROM moved ORDER BY id;
    ```

#### Module 7: Window Functions & Advanced Querying (MySQL Track)
- **Session Tasks**: 11 | **Pool Size**: 43 | **Overrides**: 2 slots (Slots 9 & 11)
- **MySQL Dialect Specifics**:
  - Full support for window functions: `ROW_NUMBER()`, `RANK()`, `AVG() OVER (PARTITION BY ...)`, `LAG()`, `LEAD()`, and `ROWS BETWEEN`.
  - Slot 9 emulates PostgreSQL's `DISTINCT ON` via window ranking CTE:
    ```sql
    WITH ranked_orders AS (
        SELECT customer_id, order_date, amount,
               ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
        FROM orders
    )
    SELECT customer_id, order_date, amount
    FROM ranked_orders
    WHERE rn = 1;
    ```
  - Slot 11 emulates materialized view storage using standard virtual views (`CREATE VIEW premium_accounts_summary AS ...`).

#### Module 8: Transactions, Concurrency & Locking (MySQL Track)
- **Session Tasks**: 8 | **Pool Size**: 28 | **Overrides**: 5 slots (Slots 1, 2, 4, 7, 8)
- **MySQL Dialect Specifics**:
  - Transactions begin explicitly using `START TRANSACTION;` instead of `BEGIN;`.
  - Full execution of `COMMIT;`, `ROLLBACK;`, and `SAVEPOINT`.
  - Concurrency locking with `SELECT ... FOR UPDATE` and explicit table locks (`LOCK TABLES accounts WRITE; UNLOCK TABLES;`).
  - Slot 5 fully executes non-blocking queue polling via `SELECT ... FOR UPDATE SKIP LOCKED`.
  - Slot 7 configures transaction isolation: `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; ... COMMIT;`.

#### Module 9: Indexing, Full-Text Search & Administration (MySQL Track)
- **Session Tasks**: 15 | **Pool Size**: 48 | **Overrides**: 12 slots (Slots 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15)
- **MySQL Dialect Specifics**:
  - Slot 2: Inline column `ENUM('pending', 'shipped', 'delivered')`.
  - Slot 3: MySQL natural language text search:
    ```sql
    SELECT id, name FROM products
    WHERE MATCH(name, description) AGAINST('wireless' IN NATURAL LANGUAGE MODE)
    ORDER BY id;
    ```
  - Slot 4: `CREATE DATABASE sales;` (in MySQL, databases serve as catalog namespaces).
  - Slots 6–8: Comprehensive MySQL JSON operators:
    - Path extraction: `JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.brand'))`
    - Key existence: `JSON_CONTAINS_PATH(metadata, 'one', '$.color')`
    - Containment: `JSON_CONTAINS(metadata, 'true', '$.in_stock')`
  - Slot 9: MySQL User & Privilege Management:
    ```sql
    CREATE USER 'reporting_user'@'localhost' IDENTIFIED BY 'SecretPass123!';
    GRANT SELECT ON *.* TO 'reporting_user'@'localhost';
    ```
  - Slot 10: `CREATE DATABASE belajar_sql;`.
  - Slots 11 & 12 (Mandatory Tasks):
    - Full-text index creation: `CREATE FULLTEXT INDEX idx_documents_body_fts ON documents(body);`
    - Boolean mode search: `SELECT id, title, body FROM documents WHERE MATCH(body) AGAINST('+performance' IN BOOLEAN MODE) ORDER BY id;`
  - Slot 13: Emulates partial indexing using a standard column index `CREATE INDEX idx_active_users_email ON user_accounts (email);`.
  - Slot 14: Emulates array membership using delimited text wildcard pattern matching (`WHERE tags LIKE '%postgres%'`).

#### Module 10: EXPLAIN ANALYZE & Query Performance (PostgreSQL Exclusive)
- **Session Tasks**: 10 | **Pool Size**: 30 | **Availability**: PostgreSQL only (`PGlite WASM`)
- **Dialect & Architectural Rationale**: Module 10 profiles detailed PostgreSQL cost-based optimizer execution plan trees, buffer cache metrics (`shared hit`/`shared read`), and optimizer scan/join node types (`Seq Scan`, `Bitmap Heap Scan`, `Hash Join`, `Merge Join`) that are specific to the PostgreSQL execution engine.

#### Module 11: PL/pgSQL, Automation & Schema Normalization (PostgreSQL Exclusive)
- **Session Tasks**: 8 | **Pool Size**: 24 | **Availability**: PostgreSQL only (`PGlite WASM`)
- **Dialect & Architectural Rationale**: Module 11 teaches native procedural database routines (`LANGUAGE plpgsql`), `RETURNS TRIGGER` lifecycle handlers, row-level context records (`NEW`, `OLD`, `TG_OP`), and `CREATE PROCEDURE ... CALL`. These procedural execution mechanisms and transaction triggers are native to PostgreSQL's engine architecture and are not supported by the in-browser `sql.js` engine. Progressive 1NF-to-3NF schema normalization migrations utilize PostgreSQL's rich relational constraint guarantees and identity sequences.

---

## 5. Final Assessment: Comprehensive Random Exam (Final Boss)

The **Final Boss Challenge** (`/postgres/challenge`) represents the capstone evaluation of SQLek. It is an end-to-end practical examination that benchmarks a learner's database mastery across all curriculum domains.

```
Comprehensive Challenge Workflow:
┌─────────────────────────┐
│ Unlock Condition:       │
│ Complete Modules 1 – 9  │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 2-Pass Balanced Shuffle │
│ 30 Tasks Sampled        │
│ (~50% Hard / ~50% Med)  │
└────────────┬────────────┘
             ▼
┌────────────────────────────────────────────────────────┐
│ Dual-Engine Evaluation System                          │
│                                                        │
│  ┌─────────────────────────┐ ┌──────────────────────┐  │
│  │ Execution Plan Mode     │ │ Structural Mode      │  │
│  │ (78 Tasks in Bank)      │ │ (20 Tasks in Bank)   │  │
│  │ • Output Gate Check     │ │ • DDL / Schema State │  │
│  │ • Relation Integrity    │ │ • Role / Privileges  │  │
│  │ • Plan Cost Ratio       │ │ • Catalog Assertions │  │
│  │ • Anti-Pattern Penalties│ │                      │  │
│  └─────────────────────────┘ └──────────────────────┘  │
└────────────────────────────┬───────────────────────────┘
                             ▼
              Pass Threshold: ≥ 75 pts per task
```

### 5.1 Unlock Mechanics & Session Assembly
- **Prerequisite**: Complete Modules 1 through 9 (or activate Developer/Admin Override).
- **Target Engine**: **PostgreSQL (PGlite WASM)**. (If accessed on MySQL, learners are notified and redirected to PostgreSQL to support plan cost analysis).
- **Session Length**: **30 tasks** sampled per exam attempt.
- **Total Exam Bank**: **98 questions**:
  - **Medium Difficulty**: 49 questions (50%)
  - **Hard Difficulty**: 49 questions (50%)
  - **Easy Difficulty**: 0 questions (The Final Boss is strictly intermediate to advanced).
- **Sampling Logic (`getRandomizedExamPool`)**:
  - Two-pass Fisher-Yates shuffle algorithm.
  - Guarantees topic diversity with a maximum of **2 questions per primary topic**.
  - Maintains a balanced difficulty distribution (targeting 15 hard and 15 medium problems).

### 5.2 Dual Scoring Architecture

Every exam task is evaluated under one of two scoring modes defined in `src/lib/exam/scoring.ts`:

#### Mode 1: Execution Plan & Efficiency Scoring (`mode: 'plan'` — 78 Tasks in Bank)
Designed for query tasks (`SELECT`, `WITH`, data mutations), this mode evaluates not only correctness, but also algorithmic query performance and planner cost.

1. **Gate Check (Output Correctness)**:
   - Compares the learner's result set (rows and columns) against the gold standard reference query.
   - If outputs do not match or a runtime error occurs, the task immediately fails with a score of `0`.
2. **Integrity Check (Base Relation Verification)**:
   - Uses `EXPLAIN` to extract the plan tree of both the learner's query and the reference query.
   - Ensures that the learner actually accessed the required underlying physical tables, preventing trivial hardcoded constants or bypassing business logic.
3. **Plan Cost Efficiency Score (`costScore`)**:
   - Compares total planner cost:
     $$\text{Cost Score} = \min\left(1.0, \frac{\text{Reference Total Cost}}{\text{Learner Total Cost}}\right) \times 100$$
4. **Anti-Pattern Structural Penalties**:
   The engine scans the learner's execution plan tree (`ParsedPlanNode`) for database performance anti-patterns and deducts points accordingly:
   - **Sequential Scan on Large Table** (rows > 500 when reference uses index): **`-20` points**
   - **Correlated SubPlan Execution**: **`-25` points**
   - **Redundant Extra Table Scans**: **`-15` points**
   - **Superfluous In-Memory Sort Nodes**: **`-10` points**
   - **Inefficient Nested Loop Join**: **`-15` points**
   - **Repeated CTE Materializations**: **`-10` points**
5. **Passing Threshold**: A final score of **$\ge 75$ points** (`EXAM_PASS_THRESHOLD`) is required to pass each task.

#### Mode 2: Structural Catalog Validation (`mode: 'structural'` — 20 Tasks in Bank)
Designed for tasks involving DDL, administrative security, view materialization, and schema integrity where queries produce no output rows.

- Executes a series of weighted SQL assertion checks against PostgreSQL system catalogs (`pg_class`, `pg_index`, `pg_roles`, `pg_constraint`, `information_schema`):
  - Checking constraint existence and exact validation expressions.
  - Verifying composite foreign keys and `ON DELETE CASCADE` / `ON DELETE SET NULL` rules.
  - Validating user privileges and role memberships in `pg_roles`.
  - Inspecting schema ownership and column privacy views.
- **Passing Threshold**: A cumulative weighted score of **$\ge 75\%$** across all structural checks.

### 5.3 Exam Topic Coverage Matrix

The 98 assessment tasks in the exam bank encompass **128 fine-grained topic tags**, including:

- **Complex Analytics & Windowing**: `window-lag`, `window-ranking`, `window-row-number`, `window-moving-avg`, `partition-order`, `frame-specification`, `cumulative-total`, `sessionization`, `growth-calculation`.
- **Advanced Joining & Set Theory**: `multi-table-join`, `three-table-join`, `multi-column-join`, `self-join`, `outer-join`, `relational-join`, `intersect`, `subquery-not-in`, `subquery-exists`, `correlated-subquery`.
- **Relational Integrity & Schema Design**: `ddl`, `composite-unique`, `composite-foreign-key`, `check-constraints`, `identity-column`, `restrict-rule`, `cascade-delete`, `set-null-delete`, `date-validation`, `numeric-check`.
- **Database Security & RBAC**: `roles`, `privileges`, `grants`, `revoke`, `table-privileges`, `column-privileges`, `role-inheritance`, `rbac`, `least-privilege`, `security-hardening`, `data-masking`.
- **Unstructured Data & Search**: `jsonb-extraction`, `jsonb-containment`, `jsonb-nested-path`, `full-text-search`, `tsvector`, `views`, `materialized-view`.
- **Transactions & Mutations**: `transaction`, `multi-statement`, `atomic-mutation`, `upsert`, `on-conflict`, `delete`, `update`, `insert-select`.

---

## 6. Summary Statistics

```
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
```

> [!NOTE]
> **116 Dedicated Category Slots**: The curriculum has been refactored to a strict 1-to-1 concept distribution across **116 dedicated category slots**, guaranteeing that 100% of distinct SQL clauses, operations, and constraints appear in every single module session. The active codebase contains **467 curriculum task variations** across Modules 1–11 plus **98 capstone exam tasks**, yielding **565 total database problems**. All 11 modules are available on PostgreSQL (`PGlite WASM`), with Modules 1–9 fully executable on MySQL (`sql.js WASM` + translation layer with 413 active task variations).

- **Languages Supported**: Dual bilingual localization (English `en` & Indonesian `id`).
- **Engines**: 100% in-browser WebAssembly (PostgreSQL via PGlite, MySQL via sql.js).
- **Zero Server Setup**: All databases, query validation pipelines, execution plan analyzers, and state persistence run locally in the learner's browser.
