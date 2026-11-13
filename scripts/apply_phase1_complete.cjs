const fs = require('fs');

const questionsFile = 'src/lib/data/questions.ts';
let code = fs.readFileSync(questionsFile, 'utf8');

// 1. Add seeds if not already present
const seedsToAdd = `
const mod4TemporalSeed = \`CREATE TABLE subscriptions (id INT PRIMARY KEY, user_id INT, plan_name TEXT, started_at TIMESTAMP, monthly_fee NUMERIC(6,2));
INSERT INTO subscriptions VALUES
(1, 101, 'Pro', '2024-01-15 08:30:00', 29.99),
(2, 102, 'Basic', '2024-01-28 14:10:00', 9.99),
(3, 103, 'Enterprise', '2024-02-05 10:00:00', 99.99),
(4, 104, 'Pro', '2024-02-20 16:45:00', 29.99),
(5, 105, 'Basic', '2024-03-01 11:20:00', 9.99),
(6, 106, 'Enterprise', '2024-03-15 13:00:00', 99.99);\`;

const mod4CastingSeed = \`CREATE TABLE products_pricing (id INT PRIMARY KEY, product_code TEXT, raw_price TEXT, discount_rate TEXT, notes TEXT);
INSERT INTO products_pricing VALUES
(1, '  PROD-001  ', '199.95', '0.15', '  In stock  '),
(2, '  PROD-002  ', '49.50', '0.10', '  Low inventory  '),
(3, '  PROD-003  ', '899.00', '0.20', '  Flagship item  '),
(4, '  PROD-004  ', '29.99', '0.05', '  Clearance  ');\`;

const mod5GradesSeed = mod5Seed + \`
CREATE TABLE salary_grades (id INT PRIMARY KEY, grade_level TEXT, min_salary INT, max_salary INT);
INSERT INTO salary_grades VALUES (1, 'Junior', 40000, 65000), (2, 'Mid', 65001, 85000), (3, 'Senior', 85001, 110000), (4, 'Lead', 110001, 150000);
CREATE TABLE stores (id INT PRIMARY KEY, store_name TEXT, city TEXT);
INSERT INTO stores VALUES (1, 'Downtown Flagship', 'Seattle'), (2, 'Metro Center', 'Portland'), (3, 'Airport Hub', 'San Francisco');
CREATE TABLE products (id INT PRIMARY KEY, name TEXT, price INT);
INSERT INTO products VALUES (101, 'Laptop', 1200), (102, 'Phone', 800), (103, 'Headphones', 150);\`;

const mod6HierarchySeed = \`CREATE TABLE org_hierarchy (id INT PRIMARY KEY, name TEXT, manager_id INT, role TEXT);
INSERT INTO org_hierarchy VALUES
(1, 'Sarah Chen', NULL, 'CEO'),
(2, 'Marcus Brody', 1, 'VP Engineering'),
(3, 'Elena Rostova', 1, 'VP Sales'),
(4, 'Liam Vance', 2, 'Lead Architect'),
(5, 'Aisha Patel', 2, 'Senior Engineer'),
(6, 'Kenji Sato', 3, 'Account Director');\`;

const mod6ArchiveSeed = \`CREATE TABLE active_tickets (id INT PRIMARY KEY, title TEXT, status TEXT, closed_at DATE);
CREATE TABLE ticket_archive (id INT PRIMARY KEY, title TEXT, status TEXT, closed_at DATE, archived_at DATE);
INSERT INTO active_tickets VALUES
(1, 'Database connection timeout', 'closed', '2024-02-15'),
(2, 'UI alignment glitch', 'open', NULL),
(3, 'SSL certificate renewal', 'closed', '2024-02-18'),
(4, 'Memory leak in worker', 'investigating', NULL);\`;
`;

// Insert seeds right before generateModule1
const markerSeed = 'function generateModule1';
if (!code.includes('mod4TemporalSeed')) {
    code = code.replace(markerSeed, seedsToAdd + '\n' + markerSeed);
    console.log('Seeds inserted successfully.');
}

fs.writeFileSync(questionsFile, code);
