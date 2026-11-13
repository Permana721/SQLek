const fs = require('fs');

const curriculumFile = 'CURRICULUM.md';
let doc = fs.readFileSync(curriculumFile, 'utf8');

// 1. Update Section 2 Matrix
const oldMatrix = `The SQLek curriculum comprises **10 core learning modules** plus **1 final capstone exam**:
- **Curriculum Pool**: 362 unique task variations across 10 modules.
- **Exam Bank**: 98 high-difficulty capstone assessment tasks.
- **Total Task Pool**: 460 unique database problems.

| Module # | Module Title | Session Tasks | Pool Size | Focus Area | Engine Availability |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **DDL & Basic DML** | 10 | 60 | Schema creation, primary keys, evolution, modifications, deletions | PostgreSQL & MySQL |
| **02** | **WHERE Filter Deep-Dive** | 8 | 40 | Conditional predicates, ranges, pattern matching, NULL logic, pagination | PostgreSQL & MySQL |
| **03** | **Aggregations & Grouping** | 8 | 36 | Aggregate functions, multi-column grouping, \`HAVING\`, filtered aggregation | PostgreSQL & MySQL |
| **04** | **Functions & Control Flow** | 5 | 30 | String/date arithmetic, conditional branching (\`CASE\`, \`IF\`), \`COALESCE\` | PostgreSQL & MySQL |
| **05** | **Relations & Integrity Constraints** | 10 | 48 | Relational joins, self-joins, domain checks, cascades, atomic UPSERTs | PostgreSQL & MySQL |
| **06** | **Subqueries & Set Operators** | 9 | 43 | Scalar/correlated subqueries, CTEs (\`WITH\`), \`UNION\`, \`INTERSECT\`, \`EXCEPT\` | PostgreSQL & MySQL |
| **07** | **Window Functions & Advanced Querying** | 6 | 33 | Over-partitions, rankings, offsets (\`LAG\`), \`DISTINCT ON\`, views, mutations | PostgreSQL & MySQL |
| **08** | **Transactions, Concurrency & Locking** | 4 | 20 | ACID guarantees, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`, row locking (\`FOR UPDATE\`) | PostgreSQL & MySQL |
| **09** | **Indexing, Full-Text Search & Administration** | 12 | 42 | B-Tree/GIN indexes, Full-Text Search, JSON/JSONB, RBAC, Schemas | PostgreSQL & MySQL |
| **10** | **EXPLAIN ANALYZE & Query Performance** | 10 | 10 | Cost metrics, Seq Scan vs Index Scan, join algorithms, buffer caches | PostgreSQL (PGlite) |
| **Final**| **Comprehensive Random Exam (Final Boss)** | 30 | 98 | End-to-end randomized exam with execution-plan cost scoring & structural validation | PostgreSQL (PGlite) |`;

const newMatrix = `The SQLek curriculum comprises **10 core learning modules** plus **1 final capstone exam**:
- **Curriculum Pool**: 435 unique task variations across 10 modules.
- **Exam Bank**: 98 high-difficulty capstone assessment tasks.
- **Total Task Pool**: 533 unique database problems.

| Module # | Module Title | Session Tasks | Pool Size | Focus Area | Engine Availability |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **01** | **DDL & Basic DML** | 10 | 60 | Schema creation, primary keys, evolution, modifications, deletions | PostgreSQL & MySQL |
| **02** | **WHERE Filter Deep-Dive** | 8 | 40 | Conditional predicates, ranges, pattern matching, NULL logic, pagination | PostgreSQL & MySQL |
| **03** | **Aggregations & Grouping** | 8 | 36 | Aggregate functions, multi-column grouping, \`HAVING\`, filtered aggregation | PostgreSQL & MySQL |
| **04** | **Functions & Control Flow** | 7 | 42 | String/math functions, \`CASE\`, \`COALESCE\`, date truncation (\`DATE_TRUNC\`), \`INTERVAL\`, explicit type casting | PostgreSQL & MySQL |
| **05** | **Relations & Integrity Constraints** | 12 | 57 | Joins, self-joins, \`RIGHT JOIN\`, \`CROSS JOIN\`, \`LATERAL\`, non-equi joins, \`ON DELETE RESTRICT/SET NULL\`, \`DO NOTHING\` | PostgreSQL & MySQL |
| **06** | **Subqueries & Set Operators** | 11 | 51 | Subqueries, \`UNION\`/\`INTERSECT\`/\`EXCEPT\`, CTEs, recursive CTEs (\`WITH RECURSIVE\`), writable data-modifying CTEs | PostgreSQL & MySQL |
| **07** | **Window Functions & Advanced Querying** | 9 | 43 | Rankings, \`PARTITION BY\`, offsets (\`LAG\`/\`LEAD\`), window frames (\`ROWS BETWEEN\`), value functions (\`NTILE\`), Materialized Views | PostgreSQL & MySQL |
| **08** | **Transactions, Concurrency & Locking** | 6 | 28 | ACID, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\`, row locks (\`FOR UPDATE\`), isolation levels (\`REPEATABLE READ\`/\`SERIALIZABLE\`), \`SKIP LOCKED\`/\`NOWAIT\` | PostgreSQL & MySQL |
| **09** | **Indexing, Full-Text Search & Administration** | 14 | 48 | B-Tree/GIN, partial/expression indexes, FTS, JSONB, native arrays (\`TEXT[]\`), \`UNNEST\`, \`gen_random_uuid()\`, RBAC | PostgreSQL & MySQL |
| **10** | **EXPLAIN ANALYZE & Query Performance** | 10 | 30 | Execution plans, \`EXPLAIN (ANALYZE, BUFFERS)\`, cost metrics, scans, join algorithms, subplans, catalog stats (3 variations/slot) | PostgreSQL (PGlite) |
| **Final**| **Comprehensive Random Exam (Final Boss)** | 30 | 98 | End-to-end randomized exam with execution-plan cost scoring & structural validation | PostgreSQL (PGlite) |`;

doc = doc.replace(oldMatrix, newMatrix);

// 2. Update Module 4 in Section 3
const oldMod4 = `### Module 4: Functions & Control Flow

- **Module ID**: \`4\`
- **Title (EN)**: \`Module 4: Functions & Control Flow\`
- **Title (ID)**: \`Modul 4: Fungsi & Logika Kondisional\`
- **Description (EN)**: Transform data with string, math, date functions, CASE WHEN, and COALESCE.
- **Description (ID)**: Manipulasi data menggunakan fungsi teks, matematika, tanggal, serta ekspresi CASE WHEN dan COALESCE.
- **Session Configuration**:
  - **Tasks per Session**: 5 tasks (Category Slots 1–5)
  - **Total Task Pool Size**: 30 variations (6 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Functions & Expressions**: \`UPPER()\`, \`LOWER()\`, \`LENGTH()\`, \`ROUND()\`, \`EXTRACT(YEAR FROM ...)\`, \`EXTRACT(MONTH FROM ...)\`, \`CASE WHEN ... THEN ... ELSE ... END\`, \`COALESCE()\`.
- **Mathematical Operators**: Integer division, arithmetic expressions, NULL coalescing.

#### Category Slots & Technical Syllabus
1. **Slot 1 — String Casing & Normalization**:
   - *Concepts*: Standardizing text casing using \`UPPER\` and \`LOWER\`.
   - *Syntax Pattern*: \`SELECT UPPER(first_name), UPPER(last_name) FROM customers;\`
2. **Slot 2 — Mathematical Scoring & Arithmetic Projections**:
   - *Concepts*: Arithmetic computations, scaling integers, and rounding metrics.
   - *Syntax Pattern*: \`SELECT first_name, score, ROUND(score * 1.1) AS boosted_score FROM customers;\`
3. **Slot 3 — Temporal Extraction (\`EXTRACT\`)**:
   - *Concepts*: Isolating year, month, or day components from calendar dates.
   - *Syntax Pattern*: \`SELECT first_name, EXTRACT(YEAR FROM join_date) AS join_year FROM customers;\`
4. **Slot 4 — Conditional Branching (\`CASE WHEN\`)**:
   - *Concepts*: Evaluating multi-branch logical criteria to categorize tuples dynamically.
   - *Syntax Pattern*: \`SELECT first_name, score, CASE WHEN score >= 80 THEN 'High' ELSE 'Low' END AS score_tier FROM customers;\`
5. **Slot 5 — Fallback Value Substitution (\`COALESCE\`)**:
   - *Concepts*: Replacing NULL entries with deterministic fallback defaults.
   - *Syntax Pattern*: \`SELECT first_name, COALESCE(discount_code, 'NONE') AS promo FROM customers;\``;

const newMod4 = `### Module 4: Functions & Control Flow

- **Module ID**: \`4\`
- **Title (EN)**: \`Module 4: Functions & Control Flow\`
- **Title (ID)**: \`Modul 4: Fungsi & Logika Kondisional\`
- **Description (EN)**: Transform data with string, math, date functions, CASE WHEN, COALESCE, date truncation, intervals, and type casting.
- **Description (ID)**: Manipulasi data menggunakan fungsi teks, matematika, tanggal, ekspresi CASE WHEN, COALESCE, pemotongan tanggal, interval waktu, dan casting tipe data.
- **Session Configuration**:
  - **Tasks per Session**: 7 tasks (Category Slots 1–7)
  - **Total Task Pool Size**: 42 variations (Slots 1–7: 6 variations each)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Scalar & Conditional Functions**: \`UPPER()\`, \`LOWER()\`, \`LENGTH()\`, \`ROUND()\`, \`EXTRACT(YEAR/MONTH FROM ...)\`, \`CASE WHEN ... THEN ... ELSE ... END\`, \`COALESCE()\`.
- **Temporal Truncation & Interval Arithmetic**: \`DATE_TRUNC('month'/'day'/'hour', timestamp)\`, timestamp \`+ INTERVAL '...' \`, timestamp \`- INTERVAL '...' \`.
- **Type Casting & String Manipulation**: \`CAST(col AS NUMERIC(10,2))\`, \`col::NUMERIC(10,2)\`, \`CAST(col AS INT)\`, \`TRIM()\`, \`CONCAT()\`, string concatenation (\`||\`), \`SUBSTRING(col, start, len)\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — String Casing & Normalization**:
   - *Concepts*: Standardizing text casing using \`UPPER\` and \`LOWER\`.
   - *Syntax Pattern*: \`SELECT UPPER(first_name), UPPER(last_name) FROM customers;\`
2. **Slot 2 — Mathematical Scoring & Arithmetic Projections**:
   - *Concepts*: Arithmetic computations, scaling integers, and rounding metrics.
   - *Syntax Pattern*: \`SELECT first_name, score, ROUND(score * 1.1) AS boosted_score FROM customers;\`
3. **Slot 3 — Temporal Extraction (\`EXTRACT\`)**:
   - *Concepts*: Isolating year, month, or day components from calendar dates.
   - *Syntax Pattern*: \`SELECT first_name, EXTRACT(YEAR FROM join_date) AS join_year FROM customers;\`
4. **Slot 4 — Conditional Branching (\`CASE WHEN\`)**:
   - *Concepts*: Evaluating multi-branch logical criteria to categorize tuples dynamically.
   - *Syntax Pattern*: \`SELECT first_name, score, CASE WHEN score >= 80 THEN 'High' ELSE 'Low' END AS score_tier FROM customers;\`
5. **Slot 5 — Fallback Value Substitution (\`COALESCE\`)**:
   - *Concepts*: Replacing NULL entries with deterministic fallback defaults.
   - *Syntax Pattern*: \`SELECT first_name, COALESCE(discount_code, 'NONE') AS promo FROM customers;\`
6. **Slot 6 — Temporal Truncation & Interval Arithmetic (\`DATE_TRUNC\` & \`INTERVAL\`)**:
   - *Concepts*: Snapping timestamp granularities to calendar boundaries (month, day, hour) for unified aggregation and evaluating rolling time windows using interval arithmetic.
   - *Syntax Patterns*:
     - \`SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;\`
     - \`SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at;\`
     - \`SELECT id, user_id, plan_name, started_at + INTERVAL '1 month' AS renewal_date FROM subscriptions ORDER BY id;\`
7. **Slot 7 — Explicit Type Casting & String Manipulation (\`CAST\`, \`::\`, \`TRIM\`, \`SUBSTRING\`)**:
   - *Concepts*: Explicit numeric casting (\`CAST(... AS NUMERIC(10,2))\`, \`col::NUMERIC\`), stripping boundary whitespace padding (\`TRIM\`), substring offsets (\`SUBSTRING\`), and multi-attribute string concatenation (\`CONCAT\`, \`||\`).
   - *Syntax Patterns*:
     - \`SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;\`
     - \`SELECT id, CONCAT(TRIM(product_code), ' - ', TRIM(notes)) AS product_label FROM products_pricing ORDER BY id;\`
     - \`SELECT id, TRIM(product_code) AS code, (raw_price::NUMERIC(10,2) * (1 - discount_rate::NUMERIC(10,2)))::NUMERIC(10,2) AS discounted_price FROM products_pricing ORDER BY id;\`
     - \`SELECT id, TRIM(product_code) AS code, CAST(SUBSTRING(TRIM(product_code), 6, 3) AS INT) AS numeric_id FROM products_pricing ORDER BY id;\``;

doc = doc.replace(oldMod4, newMod4);

// 3. Update Module 5 in Section 3
const oldMod5 = `### Module 5: Relations & Integrity Constraints

- **Module ID**: \`5\`
- **Title (EN)**: \`Module 5: Relations & Integrity Constraints\`
- **Title (ID)**: \`Modul 5: Relasi Tabel & Integrity Constraints\`
- **Description (EN)**: Connect data using joins, self-joins, CHECK constraints, UNIQUE rules, cascading foreign keys, and atomic UPSERT handling.
- **Description (ID)**: Hubungkan tabel via joins, self-join, batasan CHECK, UNIQUE, cascading foreign key, serta penanganan konflik atomik UPSERT.
- **Session Configuration**:
  - **Tasks per Session**: 10 tasks (Category Slots 1–10)
  - **Total Task Pool Size**: 48 variations (Slots 1–9: 5 variations each; Slot 10: 3 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Join Mechanisms**: \`INNER JOIN\`, \`LEFT JOIN\`, \`FULL JOIN\` (\`FULL OUTER JOIN\`), \`CROSS JOIN\`, \`ON\`, self-joins with table aliasing.
- **Constraints & Integrity**: \`CHECK (expr)\`, \`UNIQUE\`, \`FOREIGN KEY ... REFERENCES ... ON DELETE CASCADE\`.
- **Atomic UPSERT**: \`INSERT ... ON CONFLICT (col) DO UPDATE SET ...\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Relational INNER JOIN**:
   - *Concepts*: Connecting parent-child relations where join conditions evaluate to TRUE.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.department_id = d.id;\`
2. **Slot 2 — Asymmetric Preservation with LEFT JOIN**:
   - *Concepts*: Preserving all left-side tuples regardless of whether matching right-side tuples exist.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id;\`
3. **Slot 3 — Full Outer Joins (\`FULL JOIN\`)**:
   - *Concepts*: Retaining unmatched tuples from both participating relations.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e FULL JOIN departments d ON e.department_id = d.id;\`
4. **Slot 4 — Anti-Join Data Discovery**:
   - *Concepts*: Finding orphan tuples using outer joins combined with \`WHERE right_col IS NULL\`.
   - *Syntax Pattern*: \`SELECT e.name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE d.id IS NULL;\`
5. **Slot 5 — Multi-Table Relational Chaining**:
   - *Concepts*: Joining across three or more entities to traverse multi-tier relational graphs.
   - *Syntax Pattern*: \`SELECT c.user_id, p.name, c.quantity FROM cart c JOIN products p ON c.product_id = p.id JOIN users u ON c.user_id = u.id;\`
6. **Slot 6 — Hierarchical Self-Joins**:
   - *Concepts*: Pairing a relation against itself using aliasing to evaluate manager-employee hierarchies.
   - *Syntax Pattern*: \`SELECT e.name AS emp, m.name AS mgr FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;\`
7. **Slot 7 — Domain Integrity via CHECK Constraints**:
   - *Concepts*: Enforcing row-level data validation rules at the storage engine boundary.
   - *Syntax Pattern*: \`CREATE TABLE vouchers (id INT PRIMARY KEY, code TEXT NOT NULL, discount INT CHECK (discount > 0 AND discount <= 50));\`
8. **Slot 8 — Uniqueness Guarantees via UNIQUE Constraints**:
   - *Concepts*: Enforcing unique attribute values backed by underlying unique B-Tree indexes.
   - *Syntax Pattern*: \`CREATE TABLE badges (id INT PRIMARY KEY, badge_number TEXT UNIQUE, tier TEXT);\`
9. **Slot 9 — Cascading Referential Integrity (\`ON DELETE CASCADE\`)**:
   - *Concepts*: Establishing automated relational purges when parent tuples are deleted.
   - *Syntax Pattern*: \`CREATE TABLE project_tasks (id INT PRIMARY KEY, department_id INT, task_name TEXT NOT NULL, FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE);\`
10. **Slot 10 — Atomic Concurrency UPSERT (\`ON CONFLICT DO UPDATE\`)**:
    - *Concepts*: Guaranteeing idempotent insertions or cumulative updates under concurrent writes.
    - *Syntax Pattern*:
      \`\`\`sql
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (1, 101, 2)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;
      \`\`\``;

const newMod5 = `### Module 5: Relations & Integrity Constraints

- **Module ID**: \`5\`
- **Title (EN)**: \`Module 5: Relations & Integrity Constraints\`
- **Title (ID)**: \`Modul 5: Relasi Tabel & Integrity Constraints\`
- **Description (EN)**: Connect data using joins, self-joins, CHECK constraints, UNIQUE rules, cascading/restrict foreign keys, atomic UPSERT, and LATERAL subqueries.
- **Description (ID)**: Hubungkan tabel via joins, self-join, batasan CHECK, UNIQUE, foreign key referensial, penanganan konflik atomik UPSERT, serta subquery LATERAL.
- **Session Configuration**:
  - **Tasks per Session**: 12 tasks (Category Slots 1–12)
  - **Total Task Pool Size**: 57 variations (Slots 1–8: 5 variations each; Slot 9: 7 variations; Slot 10: 5 variations; Slot 11: 4 variations; Slot 12: 4 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Join Mechanisms**: \`INNER JOIN\`, \`LEFT JOIN\`, \`RIGHT JOIN\`, \`FULL JOIN\`, \`CROSS JOIN\`, non-equi joins (\`BETWEEN\`, \`>=\`), \`LEFT JOIN LATERAL\`, \`CROSS JOIN LATERAL\`.
- **Integrity Constraints**: \`CHECK (expr)\`, \`UNIQUE\`, \`FOREIGN KEY ... REFERENCES ... ON DELETE CASCADE\`, \`ON DELETE RESTRICT\`, \`ON DELETE SET NULL\`.
- **Atomic UPSERT**: \`ON CONFLICT (...) DO UPDATE\`, \`ON CONFLICT (...) DO NOTHING\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Relational INNER JOIN**:
   - *Concepts*: Connecting parent-child relations where join conditions evaluate to TRUE.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e INNER JOIN departments d ON e.department_id = d.id;\`
2. **Slot 2 — Asymmetric Preservation with LEFT JOIN**:
   - *Concepts*: Preserving all left-side tuples regardless of whether matching right-side tuples exist.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id;\`
3. **Slot 3 — Full Outer Joins (\`FULL JOIN\`)**:
   - *Concepts*: Retaining unmatched tuples from both participating relations.
   - *Syntax Pattern*: \`SELECT e.name, d.dept_name FROM employees e FULL JOIN departments d ON e.department_id = d.id;\`
4. **Slot 4 — Anti-Join Data Discovery**:
   - *Concepts*: Finding orphan tuples using outer joins combined with \`WHERE right_col IS NULL\`.
   - *Syntax Pattern*: \`SELECT e.name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE d.id IS NULL;\`
5. **Slot 5 — Multi-Table Relational Chaining**:
   - *Concepts*: Joining across three or more entities to traverse multi-tier relational graphs.
   - *Syntax Pattern*: \`SELECT c.user_id, p.name, c.quantity FROM cart c JOIN products p ON c.product_id = p.id JOIN users u ON c.user_id = u.id;\`
6. **Slot 6 — Hierarchical Self-Joins**:
   - *Concepts*: Pairing a relation against itself using aliasing to evaluate manager-employee hierarchies.
   - *Syntax Pattern*: \`SELECT e.name AS emp, m.name AS mgr FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;\`
7. **Slot 7 — Domain Integrity via CHECK Constraints**:
   - *Concepts*: Enforcing row-level data validation rules at the storage engine boundary.
   - *Syntax Pattern*: \`CREATE TABLE vouchers (id INT PRIMARY KEY, code TEXT NOT NULL, discount INT CHECK (discount > 0 AND discount <= 50));\`
8. **Slot 8 — Uniqueness Guarantees via UNIQUE Constraints**:
   - *Concepts*: Enforcing unique attribute values backed by underlying unique B-Tree indexes.
   - *Syntax Pattern*: \`CREATE TABLE badges (id INT PRIMARY KEY, badge_number TEXT UNIQUE, tier TEXT);\`
9. **Slot 9 — Referential Integrity Actions (\`CASCADE\`, \`RESTRICT\`, \`SET NULL\`)**:
   - *Concepts*: Enforcing relational integrity behavior on parent deletion across cascading deletion, deletion restriction, and nullification.
   - *Syntax Patterns*:
     - \`CREATE TABLE project_tasks (id INT PRIMARY KEY, department_id INT, task_name TEXT NOT NULL, FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE);\`
     - \`CREATE TABLE department_heads (id INT PRIMARY KEY, name TEXT, department_id INT REFERENCES departments(id) ON DELETE RESTRICT);\`
     - \`CREATE TABLE employee_profiles (id INT PRIMARY KEY, employee_id INT REFERENCES employees(id) ON DELETE SET NULL, bio TEXT);\`
10. **Slot 10 — Atomic Concurrency UPSERT (\`DO UPDATE\` & \`DO NOTHING\`)**:
    - *Concepts*: Guaranteeing idempotent insertions, cumulative counter increments, or silent conflict bypasses under concurrent writes.
    - *Syntax Patterns*:
      - \`INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 101, 2) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity;\`
      - \`INSERT INTO cart VALUES (1, 101, 5) ON CONFLICT (user_id, product_id) DO NOTHING;\`
11. **Slot 11 — \`RIGHT JOIN\` & \`CROSS JOIN\` Multi-Table Combinations**:
    - *Concepts*: Preserving all right-hand relation tuples (\`RIGHT JOIN\`), detecting unreferenced entities via right anti-joins, and generating Cartesian product grids (\`CROSS JOIN\`).
    - *Syntax Patterns*:
      - \`SELECT d.dept_name, e.name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id ORDER BY d.dept_name, e.name;\`
      - \`SELECT s.store_name, p.name AS product_name FROM stores s CROSS JOIN products p ORDER BY s.store_name, product_name;\`
      - \`SELECT d.dept_name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id WHERE e.id IS NULL ORDER BY d.dept_name;\`
12. **Slot 12 — Correlated \`LATERAL\` Joins & Non-Equi Joins**:
    - *Concepts*: Matching records against numerical ranges and brackets (\`BETWEEN\`, \`>=\`), comparing disparities via non-equi self-joins, and iterating with \`LEFT JOIN LATERAL\` / \`CROSS JOIN LATERAL\` to solve top-N per category problems.
    - *Syntax Patterns*:
      - \`SELECT e.name, e.salary, g.grade_level FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary ORDER BY e.salary DESC;\`
      - \`SELECT d.dept_name, sub.name, sub.salary FROM departments d LEFT JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary DESC LIMIT 1) sub ON true ORDER BY d.dept_name;\``;

doc = doc.replace(oldMod5, newMod5);

// 4. Update Module 6 in Section 3
const oldMod6 = `### Module 6: Subqueries & Set Operators

- **Module ID**: \`6\`
- **Title (EN)**: \`Module 6: Subqueries & Set Operators\`
- **Title (ID)**: \`Modul 6: Subquery & Operator Set\`
- **Description (EN)**: Write nested queries, scalar/correlated subqueries, Common Table Expressions (CTEs), UNION, INTERSECT, and EXCEPT.
- **Description (ID)**: Kuasai subquery skalar dan berkorelasi, Common Table Expressions (CTE WITH), serta operator himpunan UNION, INTERSECT, dan EXCEPT.
- **Session Configuration**:
  - **Tasks per Session**: 9 tasks (Category Slots 1–9)
  - **Total Task Pool Size**: 43 variations (Slots 1–8: 5 variations each; Slot 9: 3 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Subquery Paradigms**: Scalar subqueries in \`SELECT\`, \`IN (...)\`, \`NOT IN (...)\`, \`FROM\` derived subqueries, correlated \`EXISTS (...)\`, \`NOT EXISTS (...)\`.
- **Set Operations**: \`UNION ALL\`, \`UNION\` (distinct), \`INTERSECT\`, \`EXCEPT\`.
- **Modular Pipelines**: Common Table Expressions (\`WITH cte_name AS (...)\`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — Scalar Subqueries**:
   - *Concepts*: Projecting single-value computed metrics into outer query results.
   - *Syntax Pattern*: \`SELECT member_name, score, (SELECT AVG(score) FROM project_a) AS avg_score FROM project_a;\`
2. **Slot 2 — Subquery Filtering with IN**:
   - *Concepts*: Filtering outer tuples against dynamically generated value lists.
   - *Syntax Pattern*: \`SELECT member_name, role FROM project_a WHERE role IN (SELECT DISTINCT role FROM project_b);\`
3. **Slot 3 — Derived Tables in FROM**:
   - *Concepts*: Treating the result of a subquery as a transient table in the \`FROM\` clause.
   - *Syntax Pattern*: \`SELECT sub.role, AVG(sub.score) AS avg_score FROM (SELECT * FROM project_a WHERE score > 50) sub GROUP BY sub.role;\`
4. **Slot 4 — Correlated Subqueries with EXISTS**:
   - *Concepts*: Evaluating outer tuple existence against correlated inner queries.
   - *Syntax Pattern*: \`SELECT a.member_name FROM project_a a WHERE EXISTS (SELECT 1 FROM project_b b WHERE b.member_name = a.member_name);\`
5. **Slot 5 — Preserving Duplicates with UNION ALL**:
   - *Concepts*: Combining row streams without incurring deduplication sort passes.
   - *Syntax Pattern*: \`SELECT member_name, role FROM project_a UNION ALL SELECT member_name, role FROM project_b;\`
6. **Slot 6 — Set Deduplication with UNION**:
   - *Concepts*: Merging row streams with distinct set deduplication.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a UNION SELECT member_name FROM project_b;\`
7. **Slot 7 — Set Intersection with INTERSECT**:
   - *Concepts*: Extracting tuples common to both participating queries.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a INTERSECT SELECT member_name FROM project_b;\`
8. **Slot 8 — Set Difference with EXCEPT**:
   - *Concepts*: Subtracting tuples of the right query from the left query.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a EXCEPT SELECT member_name FROM project_b;\`
9. **Slot 9 — Common Table Expressions (CTE \`WITH\`)**:
   - *Concepts*: Refactoring nested subqueries into readable top-down linear pipelines.
   - *Syntax Pattern*: \`WITH HighScorers AS (SELECT * FROM project_a WHERE score > 80) SELECT member_name, score FROM HighScorers;\``;

const newMod6 = `### Module 6: Subqueries & Set Operators

- **Module ID**: \`6\`
- **Title (EN)**: \`Module 6: Subqueries & Set Operators\`
- **Title (ID)**: \`Modul 6: Subquery & Operator Set\`
- **Description (EN)**: Write nested queries, scalar/correlated subqueries, set operators (UNION/INTERSECT/EXCEPT), recursive CTE hierarchies, and writable CTEs.
- **Description (ID)**: Susun query bersarang, subquery skalar/terikat, operator himpunan (UNION/INTERSECT/EXCEPT), CTE rekursif, serta CTE pemodifikasi data.
- **Session Configuration**:
  - **Tasks per Session**: 11 tasks (Category Slots 1–11)
  - **Total Task Pool Size**: 51 variations (Slots 1–8: 5 variations each; Slot 9: 3 variations; Slot 10: 4 variations; Slot 11: 4 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Subquery Paradigms**: Scalar subqueries in \`SELECT\`, \`IN (...)\`, \`FROM\` derived subqueries, correlated \`EXISTS (...)\`, \`NOT EXISTS (...)\`.
- **Set Operations**: \`UNION ALL\`, \`UNION\`, \`INTERSECT\`, \`EXCEPT\`.
- **Modular & Recursive Pipelines**: \`WITH\` Common Table Expressions, \`WITH RECURSIVE\` hierarchy traversal, data-modifying writable CTEs (\`DELETE ... RETURNING\`, \`UPDATE ... RETURNING\`, \`INSERT ... RETURNING\`).

#### Category Slots & Technical Syllabus
1. **Slot 1 — Scalar Subqueries**:
   - *Concepts*: Projecting single-value computed metrics into outer query results.
   - *Syntax Pattern*: \`SELECT member_name, score, (SELECT AVG(score) FROM project_a) AS avg_score FROM project_a;\`
2. **Slot 2 — Subquery Filtering with IN**:
   - *Concepts*: Filtering outer tuples against dynamically generated value lists.
   - *Syntax Pattern*: \`SELECT member_name, role FROM project_a WHERE role IN (SELECT DISTINCT role FROM project_b);\`
3. **Slot 3 — Derived Tables in FROM**:
   - *Concepts*: Treating the result of a subquery as a transient table in the \`FROM\` clause.
   - *Syntax Pattern*: \`SELECT sub.role, AVG(sub.score) AS avg_score FROM (SELECT * FROM project_a WHERE score > 50) sub GROUP BY sub.role;\`
4. **Slot 4 — Correlated Subqueries with EXISTS**:
   - *Concepts*: Evaluating outer tuple existence against correlated inner queries.
   - *Syntax Pattern*: \`SELECT a.member_name FROM project_a a WHERE EXISTS (SELECT 1 FROM project_b b WHERE b.member_name = a.member_name);\`
5. **Slot 5 — Preserving Duplicates with UNION ALL**:
   - *Concepts*: Combining row streams without incurring deduplication sort passes.
   - *Syntax Pattern*: \`SELECT member_name, role FROM project_a UNION ALL SELECT member_name, role FROM project_b;\`
6. **Slot 6 — Set Deduplication with UNION**:
   - *Concepts*: Merging row streams with distinct set deduplication.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a UNION SELECT member_name FROM project_b;\`
7. **Slot 7 — Set Intersection with INTERSECT**:
   - *Concepts*: Extracting tuples common to both participating queries.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a INTERSECT SELECT member_name FROM project_b;\`
8. **Slot 8 — Set Difference with EXCEPT**:
   - *Concepts*: Subtracting tuples of the right query from the left query.
   - *Syntax Pattern*: \`SELECT member_name FROM project_a EXCEPT SELECT member_name FROM project_b;\`
9. **Slot 9 — Common Table Expressions (CTE \`WITH\`)**:
   - *Concepts*: Refactoring nested subqueries into readable top-down linear pipelines.
   - *Syntax Pattern*: \`WITH HighScorers AS (SELECT * FROM project_a WHERE score > 80) SELECT member_name, score FROM HighScorers;\`
10. **Slot 10 — Recursive Hierarchy Traversal (\`WITH RECURSIVE\`)**:
    - *Concepts*: Exploring multi-level trees and graphs (organizational charts, breadcrumb paths, sequence generation, and subtree discovery) using anchor and recursive terms.
    - *Syntax Patterns*:
      - \`WITH RECURSIVE org_tree AS (SELECT id, name, manager_id, role, 1 AS depth FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, o.role, p.depth + 1 FROM org_hierarchy o INNER JOIN org_tree p ON o.manager_id = p.id) SELECT name, role, depth FROM org_tree ORDER BY depth, name;\`
      - \`WITH RECURSIVE number_seq AS (SELECT 1 AS val UNION ALL SELECT val + 1 FROM number_seq WHERE val < 5) SELECT val FROM number_seq ORDER BY val;\`
11. **Slot 11 — Data-Modifying Writable CTEs (\`RETURNING\` Pipelines)**:
    - *Concepts*: Moving, archiving, and logging data atomically using \`DELETE\`, \`UPDATE\`, or \`INSERT ... RETURNING\` inside a \`WITH\` block without race conditions.
    - *Syntax Patterns*:
      - \`WITH moved AS (DELETE FROM active_tickets WHERE status = 'closed' RETURNING id, title, status, closed_at) SELECT id, title, status, closed_at FROM moved ORDER BY id;\`
      - \`WITH updated_tickets AS (UPDATE active_tickets SET status = 'resolved' WHERE status = 'investigating' RETURNING id, title, status) SELECT id, title, status FROM updated_tickets ORDER BY id;\``;

doc = doc.replace(oldMod6, newMod6);

// 5. Update Module 7 in Section 3
const oldMod7 = `### Module 7: Window Functions & Advanced Querying

- **Module ID**: \`7\`
- **Title (EN)**: \`Module 7: Window Functions & Advanced Querying\`
- **Title (ID)**: \`Modul 7: Window Function & Query Lanjutan\`
- **Description (EN)**: Master window ranking functions, partition framing, DISTINCT ON deduplication, LAG/LEAD offsets, and RETURNING clauses.
- **Description (ID)**: Kuasai fungsi ranking window, partisi agregasi, deduplikasi analitik DISTINCT ON, fungsi offset LAG/LEAD, dan mutasi RETURNING.
- **Session Configuration**:
  - **Tasks per Session**: 6 tasks (Category Slots 1–6)
  - **Total Task Pool Size**: 33 variations (Slots 1–5: 6 variations each; Slot 6: 3 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Window Functions**: \`ROW_NUMBER() OVER (...)\`, \`RANK()\`, \`DENSE_RANK()\`, \`AVG(...) OVER (PARTITION BY ...)\`, \`LAG(col, offset) OVER (ORDER BY ...)\`, \`LEAD()\`.
- **Advanced PostgreSQL Clauses**: \`DISTINCT ON (col)\`, \`DELETE ... RETURNING\`, \`CREATE VIEW\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Sequential Row Ranking (\`ROW_NUMBER\`)**:
   - *Concepts*: Generating continuous sequence integers ordered by metrics across window frames.
   - *Syntax Pattern*: \`SELECT owner, balance, ROW_NUMBER() OVER (ORDER BY balance DESC) AS pos FROM accounts;\`
2. **Slot 2 — Partitioned Aggregate Frames (\`PARTITION BY\`)**:
   - *Concepts*: Calculating subgroup averages and totals alongside individual row details without collapsing tuples.
   - *Syntax Pattern*: \`SELECT owner, category, balance, AVG(balance) OVER (PARTITION BY category) AS cat_avg FROM accounts;\`
3. **Slot 3 — Analytical Relative Offsets (\`LAG\`)**:
   - *Concepts*: Accessing data from previous tuples in the window without performing self-joins.
   - *Syntax Pattern*: \`SELECT owner, balance, LAG(balance, 1) OVER (ORDER BY balance ASC) AS prev_bal FROM accounts;\`
4. **Slot 4 — DML Mutation Pipelines (\`RETURNING\`)**:
   - *Concepts*: Returning modified or deleted tuples directly in the query result pipeline.
   - *Syntax Pattern*: \`DELETE FROM accounts WHERE balance < 1000 RETURNING owner, balance;\`
5. **Slot 5 — Stored Query Projections (\`CREATE VIEW\`)**:
   - *Concepts*: Encapsulating complex projections into queryable virtual views.
   - *Syntax Pattern*: \`CREATE VIEW high_balances AS SELECT owner, balance FROM accounts WHERE balance > 3000;\`
6. **Slot 6 — Positional Deduplication (\`DISTINCT ON\`)**:
   - *Concepts*: PostgreSQL proprietary deduplication selecting the top-ranked tuple per group based on explicit ordering.
   - *Syntax Pattern*:
     \`\`\`sql
     SELECT DISTINCT ON (customer_id) customer_id, order_date, amount
     FROM orders
     ORDER BY customer_id, order_date DESC;
     \`\`\``;

const newMod7 = `### Module 7: Window Functions & Advanced Querying

- **Module ID**: \`7\`
- **Title (EN)**: \`Module 7: Window Functions & Advanced Querying\`
- **Title (ID)**: \`Modul 7: Window Function & Query Lanjutan\`
- **Description (EN)**: Master window ranking functions, partition framing (ROWS BETWEEN), DISTINCT ON deduplication, LAG/LEAD offsets, NTILE, and Materialized Views.
- **Description (ID)**: Kuasai fungsi ranking window, partisi agregasi (ROWS BETWEEN), deduplikasi DISTINCT ON, fungsi offset LAG/LEAD, NTILE, serta Materialized View.
- **Session Configuration**:
  - **Tasks per Session**: 9 tasks (Category Slots 1–9)
  - **Total Task Pool Size**: 43 variations (Slots 1–5: 6 variations each; Slot 6: 3 variations; Slot 7: 3 variations; Slot 8: 4 variations; Slot 9: 3 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Window Functions**: \`ROW_NUMBER()\`, \`RANK()\`, \`DENSE_RANK()\`, \`PARTITION BY\`, \`LAG()\`, \`LEAD()\`, \`FIRST_VALUE()\`, \`LAST_VALUE()\`, \`NTILE(4)\`.
- **Framing & Aggregations**: \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`, \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\`, \`ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING\`.
- **Advanced PostgreSQL Clauses & Views**: \`DISTINCT ON (col)\`, \`DELETE ... RETURNING\`, \`CREATE VIEW\`, \`CREATE MATERIALIZED VIEW\`, \`REFRESH MATERIALIZED VIEW\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Sequential Row Ranking (\`ROW_NUMBER\`)**:
   - *Concepts*: Generating continuous sequence integers ordered by metrics across window frames.
   - *Syntax Pattern*: \`SELECT owner, balance, ROW_NUMBER() OVER (ORDER BY balance DESC) AS pos FROM accounts;\`
2. **Slot 2 — Partitioned Aggregate Frames (\`PARTITION BY\`)**:
   - *Concepts*: Calculating subgroup averages and totals alongside individual row details without collapsing tuples.
   - *Syntax Pattern*: \`SELECT owner, category, balance, AVG(balance) OVER (PARTITION BY category) AS cat_avg FROM accounts;\`
3. **Slot 3 — Analytical Relative Offsets (\`LAG\`)**:
   - *Concepts*: Accessing data from previous tuples in the window without performing self-joins.
   - *Syntax Pattern*: \`SELECT owner, balance, LAG(balance, 1) OVER (ORDER BY balance ASC) AS prev_bal FROM accounts;\`
4. **Slot 4 — DML Mutation Pipelines (\`RETURNING\`)**:
   - *Concepts*: Returning modified or deleted tuples directly in the query result pipeline.
   - *Syntax Pattern*: \`DELETE FROM accounts WHERE balance < 1000 RETURNING owner, balance;\`
5. **Slot 5 — Stored Query Projections (\`CREATE VIEW\`)**:
   - *Concepts*: Encapsulating complex projections into queryable virtual views.
   - *Syntax Pattern*: \`CREATE VIEW high_balances AS SELECT owner, balance FROM accounts WHERE balance > 3000;\`
6. **Slot 6 — Positional Deduplication (\`DISTINCT ON\`)**:
   - *Concepts*: PostgreSQL proprietary deduplication selecting the top-ranked tuple per group based on explicit ordering.
   - *Syntax Pattern*: \`SELECT DISTINCT ON (customer_id) customer_id, order_date, amount FROM orders ORDER BY customer_id, order_date DESC;\`
7. **Slot 7 — Window Frame Clauses (\`ROWS BETWEEN\`)**:
   - *Concepts*: Calculating strict row-level running totals, moving averages over sliding preceding rows, and forward-looking window spans.
   - *Syntax Patterns*:
     - \`SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM accounts ORDER BY id;\`
     - \`SELECT id, owner, balance, ROUND(AVG(balance) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg FROM accounts ORDER BY id;\`
8. **Slot 8 — Value & Distribution Window Functions (\`FIRST_VALUE\`, \`LAST_VALUE\`, \`LEAD\`, \`NTILE\`)**:
   - *Concepts*: Identifying division leaders (\`FIRST_VALUE\`), partition baselines with unbounded framing (\`LAST_VALUE\`), forward offset peeking (\`LEAD\`), and quartile distribution classification (\`NTILE(4)\`).
   - *Syntax Patterns*:
     - \`SELECT id, owner, category, balance, FIRST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC) AS top_owner FROM accounts ORDER BY category, balance DESC;\`
     - \`SELECT id, owner, balance, NTILE(4) OVER (ORDER BY balance DESC) AS quartile FROM accounts ORDER BY balance DESC, id;\`
9. **Slot 9 — Materialized Views (\`CREATE\` & \`REFRESH MATERIALIZED VIEW\`)**:
   - *Concepts*: Precomputing and persisting heavy analytical aggregations to physical storage pages for instantaneous retrieval, and refreshing cached snapshots.
   - *Syntax Patterns*:
     - \`CREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;\`
     - \`REFRESH MATERIALIZED VIEW premium_accounts_summary;\``;

doc = doc.replace(oldMod7, newMod7);

// 6. Update Module 8 in Section 3
const oldMod8 = `### Module 8: Transactions, Concurrency & Locking

- **Module ID**: \`8\`
- **Title (EN)**: \`Module 8: Transactions, Concurrency & Locking\`
- **Title (ID)**: \`Modul 8: Transaksi, Konkurensi & Locking\`
- **Description (EN)**: Master ACID principles, transaction isolation, COMMIT, ROLLBACK, pessimistic row locking (FOR UPDATE), and SAVEPOINTs.
- **Description (ID)**: Pahami prinsip ACID, kontrol transaksi dengan COMMIT dan ROLLBACK, pessimistic row locking via SELECT FOR UPDATE, serta SAVEPOINT.
- **Session Configuration**:
  - **Tasks per Session**: 4 tasks (Category Slots 1–4)
  - **Total Task Pool Size**: 20 variations (5 variations per slot)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Transaction Demarcation**: \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\`.
- **Sub-Transaction Checkpoints**: \`SAVEPOINT sp_name\`, \`ROLLBACK TO sp_name\`.
- **Concurrency & Pessimistic Locking**: \`SELECT ... FOR UPDATE\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Atomic Transaction Commit**:
   - *Concepts*: Bundling multiple mutations into an all-or-nothing unit of work.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 500 WHERE id = 1; UPDATE accounts SET balance = balance + 500 WHERE id = 2; COMMIT;\`
2. **Slot 2 — Transaction Abort & Rollback**:
   - *Concepts*: Discarding uncommitted mutations to preserve state upon business rule failure.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 1000 WHERE id = 1; ROLLBACK;\`
3. **Slot 3 — Pessimistic Row Locking (\`FOR UPDATE\`)**:
   - *Concepts*: Acquiring exclusive row-level locks to prevent lost-update concurrency races.
   - *Syntax Pattern*: \`BEGIN; SELECT * FROM accounts WHERE id = 1 FOR UPDATE; UPDATE accounts SET balance = balance + 100 WHERE id = 1; COMMIT;\`
4. **Slot 4 — Granular Error Recovery with SAVEPOINT**:
   - *Concepts*: Defining rollback boundaries within an active transaction block.
   - *Syntax Pattern*:
     \`\`\`sql
     BEGIN;
     UPDATE accounts SET balance = balance - 100 WHERE id = 1;
     SAVEPOINT my_savepoint;
     -- faulty operation rolled back
     ROLLBACK TO my_savepoint;
     COMMIT;
     \`\`\``;

const newMod8 = `### Module 8: Transactions, Concurrency & Locking

- **Module ID**: \`8\`
- **Title (EN)**: \`Module 8: Transactions, Concurrency & Locking\`
- **Title (ID)**: \`Modul 8: Transaksi, Konkurensi & Locking\`
- **Description (EN)**: Master ACID principles, transaction isolation levels (REPEATABLE READ/SERIALIZABLE), COMMIT, ROLLBACK, queue locking (SKIP LOCKED/NOWAIT), and SAVEPOINTs.
- **Description (ID)**: Pahami prinsip ACID, tingkat isolasi transaksi (REPEATABLE READ/SERIALIZABLE), kontrol COMMIT/ROLLBACK, penguncian antrean (SKIP LOCKED/NOWAIT), serta SAVEPOINT.
- **Session Configuration**:
  - **Tasks per Session**: 6 tasks (Category Slots 1–6)
  - **Total Task Pool Size**: 28 variations (Slots 1–4: 5 variations each; Slot 5: 4 variations; Slot 6: 4 variations)
  - **Mandatory Tasks**: 0

#### Key SQL Concepts, Clauses, & Keywords
- **Transaction Demarcation**: \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\`.
- **Sub-Transaction Checkpoints**: \`SAVEPOINT sp_name\`, \`ROLLBACK TO sp_name\`.
- **Transaction Isolation Levels**: \`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ\`, \`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE\`, \`SET TRANSACTION ISOLATION LEVEL READ COMMITTED\`.
- **Concurrency & Queue Locking**: \`SELECT ... FOR UPDATE\`, \`FOR UPDATE SKIP LOCKED\`, \`FOR UPDATE NOWAIT\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — Atomic Transaction Commit**:
   - *Concepts*: Bundling multiple mutations into an all-or-nothing unit of work.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 500 WHERE id = 1; UPDATE accounts SET balance = balance + 500 WHERE id = 2; COMMIT;\`
2. **Slot 2 — Transaction Abort & Rollback**:
   - *Concepts*: Discarding uncommitted mutations to preserve state upon business rule failure.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 1000 WHERE id = 1; ROLLBACK;\`
3. **Slot 3 — Pessimistic Row Locking (\`FOR UPDATE\`)**:
   - *Concepts*: Acquiring exclusive row-level locks to prevent lost-update concurrency races.
   - *Syntax Pattern*: \`BEGIN; SELECT * FROM accounts WHERE id = 1 FOR UPDATE; UPDATE accounts SET balance = balance + 100 WHERE id = 1; COMMIT;\`
4. **Slot 4 — Granular Error Recovery with SAVEPOINT**:
   - *Concepts*: Defining rollback boundaries within an active transaction block.
   - *Syntax Pattern*: \`BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; SAVEPOINT my_savepoint; ROLLBACK TO my_savepoint; COMMIT;\`
5. **Slot 5 — Transaction Isolation Levels (\`REPEATABLE READ\` & \`SERIALIZABLE\`)**:
   - *Concepts*: Setting snapshot isolation levels to eliminate non-repeatable reads (\`REPEATABLE READ\`) and enforcing strict sequential transaction scheduling without phantom reads or write skews (\`SERIALIZABLE\`).
   - *Syntax Patterns*:
     - \`BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT * FROM accounts WHERE id = 1; COMMIT;\`
     - \`BEGIN; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; SELECT * FROM accounts WHERE id = 2; COMMIT;\`
6. **Slot 6 — Non-Blocking Queue Locking (\`SKIP LOCKED\` & \`NOWAIT\`)**:
   - *Concepts*: Implementing ultra-high-throughput concurrent worker queues where workers bypass locked rows without blocking (\`SKIP LOCKED\`) or fail fast on lock contention (\`NOWAIT\`).
   - *Syntax Patterns*:
     - \`SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;\`
     - \`SELECT id, task_type, payload FROM job_queue WHERE id = 1 FOR UPDATE NOWAIT;\``;

doc = doc.replace(oldMod8, newMod8);

// 7. Update Module 9 in Section 3
const oldMod9 = `### Module 9: Indexing, Full-Text Search & Administration

- **Module ID**: \`9\`
- **Title (EN)**: \`Module 9: Indexing, Full-Text Search & Administration\`
- **Title (ID)**: \`Modul 9: Indexing, Full-Text Search & Administrasi\`
- **Description (EN)**: Optimize execution with B-Tree/GIN indexes, Full-Text Search, JSONB, schemas, roles, privileges, and database creation.
- **Description (ID)**: Optimalkan query dengan index B-Tree/GIN, Full-Text Search, JSONB, skema, role, hak akses, dan pembuatan database.
- **Session Configuration**:
  - **Tasks per Session**: 12 tasks (Category Slots 1–12)
  - **Total Task Pool Size**: 42 variations (Slots 1–5: 5 variations each; Slots 6–8: 3 variations each; Slot 9: 5 variations; Slots 10–12: 1 variation each)
  - **Mandatory Tasks**: 2 tasks (Slot 11: Create FTS Index; Slot 12: Query FTS Index)

#### Key SQL Concepts, Clauses, & Keywords
- **Index Management**: \`CREATE INDEX\`, B-Tree indexes, composite multi-column indexes, \`USING GIN\`.
- **Full-Text Search Engine**: \`to_tsvector('english', col)\`, \`to_tsquery('english', 'term')\`, full-text match operator (\`@@\`).
- **Semi-Structured JSONB**: \`JSONB\` type, arrow text extraction (\`->>\`), key existence (\`?\`), document containment (\`@>\`).
- **Data Definition & Administration**: \`CREATE TYPE ... AS ENUM\`, \`CREATE SCHEMA\`, \`CREATE DATABASE\`.
- **Role-Based Access Control (RBAC)**: \`CREATE ROLE\`, \`ALTER ROLE ... WITH LOGIN PASSWORD\`, \`GRANT\`, \`REVOKE\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — B-Tree Index Creation**:
   - *Concepts*: Accelerating range scans and equality filters via balanced trees.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_price ON products (price);\`
2. **Slot 2 — User-Defined ENUM Types**:
   - *Concepts*: Restricting column domains to strict custom enumerated labels.
   - *Syntax Pattern*: \`CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'pending');\`
3. **Slot 3 — Basic Full-Text Search Querying**:
   - *Concepts*: Lexeme-based natural language searching using \`to_tsvector\` and \`to_tsquery\`.
   - *Syntax Pattern*: \`SELECT * FROM products WHERE to_tsvector('english', description) @@ to_tsquery('english', 'wireless');\`
4. **Slot 4 — Schema Namespace Isolation**:
   - *Concepts*: Organizing database objects into multi-tenant logical namespaces.
   - *Syntax Pattern*: \`CREATE SCHEMA app_schema;\`
5. **Slot 5 — Composite Multi-Column Indexes**:
   - *Concepts*: Optimizing multi-attribute predicates honoring the leftmost prefix rule.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_cat_price ON products (category, price);\`
6. **Slot 6 — JSONB Text Extraction (\`->>\`)**:
   - *Concepts*: Extracting JSON object values as native SQL text.
   - *Syntax Pattern*: \`SELECT name, metadata->>'brand' AS brand FROM products;\`
7. **Slot 7 — JSONB Key Existence Operator (\`?\`)**:
   - *Concepts*: Filtering tuples containing specified top-level JSON keys.
   - *Syntax Pattern*: \`SELECT name FROM products WHERE metadata ? 'warranty';\`
8. **Slot 8 — JSONB Document Containment (\`@>\`)**:
   - *Concepts*: Testing whether a JSONB document includes a target key-value subset.
   - *Syntax Pattern*: \`SELECT name FROM products WHERE metadata @> '{"brand": "Acme"}';\`
9. **Slot 9 — Role-Based Access Control & Privileges**:
   - *Concepts*: Provisioning database roles and granting/revoking table permissions.
   - *Syntax Patterns*:
     - \`CREATE ROLE reporting_user;\`
     - \`GRANT SELECT ON products TO reporting_user;\`
     - \`REVOKE INSERT ON products FROM reporting_user;\`
10. **Slot 10 — Physical Database Creation**:
    - *Concepts*: Provisioning independent database catalogs.
    - *Syntax Pattern*: \`CREATE DATABASE analytics_db;\`
11. **Slot 11 — Mandatory FTS Index Construction (GIN)**:
    - *Concepts*: Accelerating full-text document searches with inverted GIN indexes.
    - *Syntax Pattern*: \`CREATE INDEX idx_documents_body_fts ON documents USING GIN(to_tsvector('english', body));\`
12. **Slot 12 — Mandatory Full-Text Search Execution**:
    - *Concepts*: Executing indexed full-text search queries using GIN-accelerated vectors.
    - *Syntax Pattern*: \`SELECT id, title FROM documents WHERE to_tsvector('english', body) @@ to_tsquery('english', 'indexing & performance');\``;

const newMod9 = `### Module 9: Indexing, Full-Text Search & Administration

- **Module ID**: \`9\`
- **Title (EN)**: \`Module 9: Indexing, Full-Text Search & Administration\`
- **Title (ID)**: \`Modul 9: Indexing, Full-Text Search & Administrasi\`
- **Description (EN)**: Optimize execution with B-Tree/GIN, partial and expression indexes, Full-Text Search, JSONB, native arrays, UUIDs, roles, and privileges.
- **Description (ID)**: Optimalkan query dengan indeks B-Tree/GIN, partial dan ekspresi index, Full-Text Search, JSONB, array PostgreSQL, UUID, role, dan hak akses.
- **Session Configuration**:
  - **Tasks per Session**: 14 tasks (Category Slots 1–14)
  - **Total Task Pool Size**: 48 variations (Slots 1–5: 5 variations each; Slots 6–8: 3 variations each; Slot 9: 5 variations; Slots 10–12: 1 variation each; Slot 13: 3 variations; Slot 14: 3 variations)
  - **Mandatory Tasks**: 2 tasks (Slot 11: Create FTS Index; Slot 12: Query FTS Index)

#### Key SQL Concepts, Clauses, & Keywords
- **Index Management**: \`CREATE INDEX\`, B-Tree, composite multi-column, partial indexes (\`WHERE predicate\`), expression functional indexes (\`ON (LOWER(col))\`), inverted GIN (\`USING GIN\`).
- **PostgreSQL Data Types**: \`TEXT[]\`, \`INT[]\`, array membership (\`ANY(col)\`), \`UNNEST(col)\`, \`ARRAY_AGG()\`, \`gen_random_uuid()\`.
- **Full-Text Search Engine**: \`to_tsvector('english', col)\`, \`to_tsquery('english', 'term')\`, match operator (\`@@\`).
- **Semi-Structured JSONB**: \`JSONB\` type, arrow text extraction (\`->>\`), key existence (\`?\`), document containment (\`@>\`).
- **Administration & RBAC**: \`CREATE TYPE ... AS ENUM\`, \`CREATE SCHEMA\`, \`CREATE DATABASE\`, \`CREATE ROLE\`, \`ALTER ROLE\`, \`GRANT\`, \`REVOKE\`.

#### Category Slots & Technical Syllabus
1. **Slot 1 — B-Tree Index Creation**:
   - *Concepts*: Accelerating range scans and equality filters via balanced trees.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_price ON products (price);\`
2. **Slot 2 — User-Defined ENUM Types**:
   - *Concepts*: Restricting column domains to strict custom enumerated labels.
   - *Syntax Pattern*: \`CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'pending');\`
3. **Slot 3 — Basic Full-Text Search Querying**:
   - *Concepts*: Lexeme-based natural language searching using \`to_tsvector\` and \`to_tsquery\`.
   - *Syntax Pattern*: \`SELECT * FROM products WHERE to_tsvector('english', description) @@ to_tsquery('english', 'wireless');\`
4. **Slot 4 — Schema Namespace Isolation**:
   - *Concepts*: Organizing database objects into multi-tenant logical namespaces.
   - *Syntax Pattern*: \`CREATE SCHEMA app_schema;\`
5. **Slot 5 — Composite Multi-Column Indexes**:
   - *Concepts*: Optimizing multi-attribute predicates honoring the leftmost prefix rule.
   - *Syntax Pattern*: \`CREATE INDEX idx_products_cat_price ON products (category, price);\`
6. **Slot 6 — JSONB Text Extraction (\`->>\`)**:
   - *Concepts*: Extracting JSON object values as native SQL text.
   - *Syntax Pattern*: \`SELECT name, metadata->>'brand' AS brand FROM products;\`
7. **Slot 7 — JSONB Key Existence Operator (\`?\`)**:
   - *Concepts*: Filtering tuples containing specified top-level JSON keys.
   - *Syntax Pattern*: \`SELECT name FROM products WHERE metadata ? 'warranty';\`
8. **Slot 8 — JSONB Document Containment (\`@>\`)**:
   - *Concepts*: Testing whether a JSONB document includes a target key-value subset.
   - *Syntax Pattern*: \`SELECT name FROM products WHERE metadata @> '{"brand": "Acme"}';\`
9. **Slot 9 — Role-Based Access Control & Privileges**:
   - *Concepts*: Provisioning database roles and granting/revoking table permissions.
   - *Syntax Patterns*:
     - \`CREATE ROLE reporting_user;\`
     - \`GRANT SELECT ON products TO reporting_user;\`
     - \`REVOKE INSERT ON products FROM reporting_user;\`
10. **Slot 10 — Physical Database Creation**:
    - *Concepts*: Provisioning independent database catalogs.
    - *Syntax Pattern*: \`CREATE DATABASE analytics_db;\`
11. **Slot 11 — Mandatory FTS Index Construction (GIN)**:
    - *Concepts*: Accelerating full-text document searches with inverted GIN indexes.
    - *Syntax Pattern*: \`CREATE INDEX idx_documents_body_fts ON documents USING GIN(to_tsvector('english', body));\`
12. **Slot 12 — Mandatory Full-Text Search Execution**:
    - *Concepts*: Executing indexed full-text search queries using GIN-accelerated vectors.
    - *Syntax Pattern*: \`SELECT id, title FROM documents WHERE to_tsvector('english', body) @@ to_tsquery('english', 'indexing & performance');\`
13. **Slot 13 — Partial & Expression Indexes**:
    - *Concepts*: Creating conditional indexes covering targeted subsets to minimize index bloat, and functional indexes on expressions to enable index scans on transformed columns.
    - *Syntax Patterns*:
      - \`CREATE INDEX idx_active_users_email ON user_accounts (email) WHERE is_active = true;\`
      - \`CREATE INDEX idx_lower_user_email ON user_accounts (LOWER(email));\`
      - \`CREATE INDEX idx_high_balance ON accounts (balance) WHERE balance > 4000;\`
14. **Slot 14 — PostgreSQL Native Arrays & UUIDs**:
    - *Concepts*: Managing multi-valued attributes in native array columns (\`TEXT[]\`), checking array membership (\`ANY(col)\`), expanding arrays into relational tuples (\`UNNEST\`), and generating cryptographic identifiers (\`gen_random_uuid()\`).
    - *Syntax Patterns*:
      - \`SELECT id, title, tags FROM article_tags WHERE 'postgres' = ANY(tags) ORDER BY id;\`
      - \`SELECT UNNEST(tags) AS single_tag FROM article_tags WHERE id = 1;\`
      - \`SELECT gen_random_uuid() AS session_token;\``;

doc = doc.replace(oldMod9, newMod9);

// 8. Update Module 10 in Section 3
const oldMod10 = `### Module 10: EXPLAIN ANALYZE & Query Performance

- **Module ID**: \`10\`
- **Title (EN)**: \`Module 10: EXPLAIN ANALYZE & Query Performance\`
- **Title (ID)**: \`Modul 10: EXPLAIN ANALYZE & Kinerja Query\`
- **Description (EN)**: Analyze and optimize execution plans using EXPLAIN, EXPLAIN ANALYZE, cost metrics, index effectiveness, join strategies, and buffer usage.
- **Description (ID)**: Analisis dan optimalkan rencana eksekusi menggunakan EXPLAIN, EXPLAIN ANALYZE, metrik biaya, efektivitas indeks, strategi join, serta penggunaan buffer.
- **Session Configuration**:
  - **Tasks per Session**: 10 tasks (Category Slots 1–10)
  - **Total Task Pool Size**: 10 variations (1 variation per slot)
  - **Mandatory Tasks**: 0
  - **Engine Availability**: Exclusive to PostgreSQL (PGlite)

#### Key SQL Concepts, Clauses, & Keywords
- **Plan Inspection Modes**: \`EXPLAIN\`, \`EXPLAIN (ANALYZE)\`, \`EXPLAIN (ANALYZE, BUFFERS)\`, \`TIMING OFF\`, \`SUMMARY OFF\`.
- **Plan Operators & Tree Nodes**: \`Seq Scan\`, \`Index Scan\`, \`Index Only Scan\`, \`Bitmap Index Scan\`, \`Bitmap Heap Scan\`, \`Hash Join\`, \`Nested Loop\`, \`HashAggregate\`, \`GroupAggregate\`, \`Sort\`, \`SubPlan\`.
- **Cost Metrics & Catalog Statistics**: Startup cost (\`cost=X..Y\`), total cost, estimated rows vs. actual rows, \`shared hit/read\` buffer pages, \`pg_statistic\` Most Common Values (MCV).

#### Category Slots & Technical Syllabus
1. **Slot 1 — Inspect Query Execution Plan (\`EXPLAIN\`)**:
   - *Concepts*: Inspecting the planner's selected plan tree, cost model, and estimated rows without executing the statement.
   - *Syntax Pattern*: \`EXPLAIN SELECT * FROM orders WHERE customer_id = 5;\`
2. **Slot 2 — Profiling Actual Costs with EXPLAIN ANALYZE**:
   - *Concepts*: Measuring actual execution duration, actual rows, and iteration counts against estimated values.
   - *Syntax Pattern*: \`EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE customer_id = 5;\`
3. **Slot 3 — Sorting & Aggregation Bottlenecks**:
   - *Concepts*: Detecting memory spills and sort operators triggered by \`GROUP BY\` and \`ORDER BY\`.
   - *Syntax Pattern*: \`EXPLAIN SELECT order_id, SUM(quantity * unit_price) FROM order_items GROUP BY order_id ORDER BY order_id;\`
4. **Slot 4 — Index Scan vs. Sequential Scan Selection**:
   - *Concepts*: Evaluating planner selectivity thresholds that govern index scan vs. sequential table scan choices.
   - *Syntax Pattern*: \`EXPLAIN SELECT * FROM events WHERE user_id = 42;\`
5. **Slot 5 — Join Strategy Analysis (Hash Join vs. Nested Loop)**:
   - *Concepts*: Comparing join algorithms and observing planner selection based on relation sizes and available indexes.
   - *Syntax Pattern*: \`EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.id = 10;\`
6. **Slot 6 — Detecting Correlated SubPlans**:
   - *Concepts*: Spotting quadratic \`SubPlan\` execution bottlenecks resulting from unoptimized correlated scalar subqueries.
   - *Syntax Pattern*: \`EXPLAIN SELECT id, (SELECT COUNT(*) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS log_count FROM accounts;\`
7. **Slot 7 — Aggregation Strategy & Memory Costs (HashAggregate)**:
   - *Concepts*: Evaluating memory footprints and operator choices between in-memory \`HashAggregate\` and \`GroupAggregate\`.
   - *Syntax Pattern*: \`EXPLAIN SELECT sensor_id, AVG(reading_val) FROM metrics GROUP BY sensor_id;\`
8. **Slot 8 — Ordering Elimination via Index Scans**:
   - *Concepts*: Leveraging pre-sorted B-Tree index ordering to satisfy \`ORDER BY ... LIMIT\` without dedicated sort nodes.
   - *Syntax Pattern*: \`EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at LIMIT 20;\`
9. **Slot 9 — Shared Buffer Cache Activity (\`BUFFERS\`)**:
   - *Concepts*: Measuring disk I/O impact by tracking shared buffer cache hits vs. physical page reads.
   - *Syntax Pattern*: \`EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 100;\`
10. **Slot 10 — Planner Row Estimates & Catalog Statistics**:
    - *Concepts*: Observing how catalog statistics and histogram distributions inform planner row estimations on skewed data.
    - *Syntax Pattern*: \`EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'backordered';\``;

const newMod10 = `### Module 10: EXPLAIN ANALYZE & Query Performance

- **Module ID**: \`10\`
- **Title (EN)**: \`Module 10: EXPLAIN ANALYZE & Query Performance\`
- **Title (ID)**: \`Modul 10: EXPLAIN ANALYZE & Kinerja Query\`
- **Description (EN)**: Analyze execution plans using EXPLAIN and EXPLAIN ANALYZE across 30 diverse query profiling scenarios covering costs, scans, joins, subplans, and buffer cache.
- **Description (ID)**: Analisis rencana eksekusi menggunakan EXPLAIN dan EXPLAIN ANALYZE pada 30 variasi skenario profil query mencakup estimasi biaya, scan, join, subplan, dan buffer cache.
- **Session Configuration**:
  - **Tasks per Session**: 10 tasks (Category Slots 1–10)
  - **Total Task Pool Size**: 30 variations (3 distinct variations per slot across all 10 slots)
  - **Mandatory Tasks**: 0
  - **Engine Availability**: Exclusive to PostgreSQL (PGlite)

#### Key SQL Concepts, Clauses, & Keywords
- **Plan Inspection Modes**: \`EXPLAIN\`, \`EXPLAIN (ANALYZE)\`, \`EXPLAIN (ANALYZE, BUFFERS)\`, \`TIMING OFF\`, \`SUMMARY OFF\`.
- **Plan Operators & Tree Nodes**: \`Seq Scan\`, \`Index Scan\`, \`Index Only Scan\`, \`Bitmap Index Scan\`, \`Bitmap Heap Scan\`, \`Hash Join\`, \`Nested Loop\`, \`HashAggregate\`, \`GroupAggregate\`, \`Sort\`, \`SubPlan\`.
- **Cost Metrics & Catalog Statistics**: Startup cost (\`cost=X..Y\`), total cost, estimated rows vs. actual rows, \`shared hit/read\` buffer pages, \`pg_statistic\` Most Common Values (MCV).

#### Category Slots & Technical Syllabus (Expanded 30-Task Pool)
1. **Slot 1 — Inspect Query Execution Plan (\`EXPLAIN\`)**:
   - *Concepts*: Inspecting the planner's selected plan tree, cost model, and estimated rows without executing the statement.
   - *Variations*:
     - **Var #1 (Q1001)**: Customer order lookup — \`EXPLAIN SELECT * FROM orders WHERE customer_id = 5;\`
     - **Var #2 (Q1011)**: High-value orders threshold — \`EXPLAIN SELECT * FROM orders WHERE amount > 500;\`
     - **Var #3 (Q1021)**: Date range order scan — \`EXPLAIN SELECT id, customer_id, amount FROM orders WHERE order_date >= '2023-01-01';\`
2. **Slot 2 — Profiling Actual Costs with EXPLAIN ANALYZE**:
   - *Concepts*: Measuring actual execution duration, actual rows, and iteration counts against estimated values.
   - *Variations*:
     - **Var #1 (Q1002)**: Customer order real execution profile — \`EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE customer_id = 5;\`
     - **Var #2 (Q1012)**: Filtered high-value order profiling — \`EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE amount > 500;\`
     - **Var #3 (Q1022)**: Range query execution profiling — \`EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT id, amount FROM orders WHERE amount BETWEEN 100 AND 800;\`
3. **Slot 3 — Sorting & Aggregation Bottlenecks**:
   - *Concepts*: Detecting memory spills and sort operators triggered by \`GROUP BY\` and \`ORDER BY\`.
   - *Variations*:
     - **Var #1 (Q1003)**: Order revenue sum & order sort — \`EXPLAIN SELECT order_id, SUM(quantity * unit_price) FROM order_items GROUP BY order_id ORDER BY order_id;\`
     - **Var #2 (Q1013)**: Product frequency counting & descending sort — \`EXPLAIN SELECT product_id, COUNT(*) AS item_count FROM order_items GROUP BY product_id ORDER BY item_count DESC;\`
     - **Var #3 (Q1023)**: Average item quantity grouping & sort — \`EXPLAIN SELECT order_id, AVG(quantity) AS avg_qty FROM order_items GROUP BY order_id ORDER BY avg_qty DESC;\`
4. **Slot 4 — Index Scan vs. Sequential Scan Selection**:
   - *Concepts*: Evaluating planner selectivity thresholds that govern index scan vs. sequential table scan choices.
   - *Variations*:
     - **Var #1 (Q1004)**: Single user event lookup — \`EXPLAIN SELECT * FROM events WHERE user_id = 42;\`
     - **Var #2 (Q1014)**: User login event composite scan — \`EXPLAIN SELECT * FROM events WHERE user_id = 100 AND event_type = 'login';\`
     - **Var #3 (Q1024)**: Selective user event timestamp extraction — \`EXPLAIN SELECT id, created_at FROM events WHERE user_id = 7;\`
5. **Slot 5 — Join Strategy Analysis (Hash Join vs. Nested Loop)**:
   - *Concepts*: Comparing join algorithms and observing planner selection based on relation sizes and available indexes.
   - *Variations*:
     - **Var #1 (Q1005)**: Direct customer invoice join by ID — \`EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.id = 10;\`
     - **Var #2 (Q1015)**: Regional customer invoice join — \`EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.region = 'East';\`
     - **Var #3 (Q1025)**: High-value invoice join scan path — \`EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE i.total > 1000;\`
6. **Slot 6 — Detecting Correlated SubPlans**:
   - *Concepts*: Spotting quadratic \`SubPlan\` execution bottlenecks resulting from unoptimized correlated scalar subqueries.
   - *Variations*:
     - **Var #1 (Q1006)**: Correlated account audit log counter — \`EXPLAIN SELECT id, (SELECT COUNT(*) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS log_count FROM accounts;\`
     - **Var #2 (Q1016)**: Correlated maximum timestamp lookup — \`EXPLAIN SELECT id, username, (SELECT MAX(created_at) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS last_audit FROM accounts;\`
     - **Var #3 (Q1026)**: Correlated amount summation SubPlan — \`EXPLAIN SELECT id, (SELECT SUM(amount) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS total_audit FROM accounts;\`
7. **Slot 7 — Aggregation Strategy & Memory Costs (HashAggregate)**:
   - *Concepts*: Evaluating memory footprints and operator choices between in-memory \`HashAggregate\` and \`GroupAggregate\`.
   - *Variations*:
     - **Var #1 (Q1007)**: Sensor average reading aggregation — \`EXPLAIN SELECT sensor_id, AVG(reading_val) FROM metrics GROUP BY sensor_id;\`
     - **Var #2 (Q1017)**: Sensor peak reading maximum aggregation — \`EXPLAIN SELECT sensor_id, MAX(reading_val) AS peak_reading FROM metrics GROUP BY sensor_id;\`
     - **Var #3 (Q1027)**: Filtered group aggregation with HAVING threshold — \`EXPLAIN SELECT sensor_id, COUNT(*) AS read_count FROM metrics GROUP BY sensor_id HAVING COUNT(*) > 10;\`
8. **Slot 8 — Ordering Elimination via Index Scans**:
   - *Concepts*: Leveraging pre-sorted B-Tree index ordering to satisfy \`ORDER BY ... LIMIT\` without dedicated sort nodes.
   - *Variations*:
     - **Var #1 (Q1008)**: Ascending publication order with limit — \`EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at LIMIT 20;\`
     - **Var #2 (Q1018)**: Reverse index scan on descending order — \`EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at DESC LIMIT 10;\`
     - **Var #3 (Q1028)**: Multi-column projection with index order limit — \`EXPLAIN SELECT id, published_at, title FROM articles ORDER BY published_at LIMIT 5;\`
9. **Slot 9 — Shared Buffer Cache Activity (\`BUFFERS\`)**:
   - *Concepts*: Measuring disk I/O impact by tracking shared buffer cache hits vs. physical page reads.
   - *Variations*:
     - **Var #1 (Q1009)**: Buffer activity for single article fetch — \`EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 100;\`
     - **Var #2 (Q1019)**: Buffer activity for mid-table article lookup — \`EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 50;\`
     - **Var #3 (Q1029)**: Buffer hit inspection on primary key row 1 — \`EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT id, title FROM articles WHERE id = 1;\`
10. **Slot 10 — Planner Row Estimates & Catalog Statistics**:
    - *Concepts*: Observing how catalog statistics and histogram distributions inform planner row estimations on skewed data.
    - *Variations*:
     - **Var #1 (Q1010)**: Skewed backordered inventory item estimate — \`EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'backordered';\`
     - **Var #2 (Q1020)**: Skewed in-stock common item estimate — \`EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'in_stock';\`
     - **Var #3 (Q1030)**: Discontinued rare inventory row estimate — \`EXPLAIN SELECT id, item_name FROM skewed_inventory WHERE status = 'discontinued';\``;

doc = doc.replace(oldMod10, newMod10);

// 9. Update Section 6 Summary Statistics
const oldSummary = `## 6. Summary Statistics

- **Total Curriculum Modules**: 10 Modules (9 dual-engine, 1 PostgreSQL-exclusive)
- **Total Learning Category Slots**: 84 Slots across curriculum
- **Total Task Pool Size**: 362 Practice Tasks + 98 Exam Tasks = **460 Total Tasks**
- **Average Variations per Slot**: ~4.3 variations per category slot
- **Assessment Engine**: 30-task randomized capstone with execution-plan cost scoring & AST inspection`;

const newSummary = `## 6. Summary Statistics

- **Total Curriculum Modules**: 10 Modules (9 dual-engine, 1 PostgreSQL-exclusive)
- **Total Learning Category Slots**: 102 Slots across curriculum
- **Total Task Pool Size**: 435 Practice Tasks + 98 Exam Tasks = **533 Total Tasks**
- **Average Variations per Slot**: ~4.3 variations per category slot
- **Assessment Engine**: 30-task randomized capstone with execution-plan cost scoring & AST inspection`;

doc = doc.replace(oldSummary, newSummary);

fs.writeFileSync(curriculumFile, doc);
console.log('CURRICULUM.md successfully updated!');
