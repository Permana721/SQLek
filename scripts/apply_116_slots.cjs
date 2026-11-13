const fs = require('fs');

const { m4Questions, m5Questions, m6Questions } = require('./generate_phase1_data.cjs');
const { m7Questions, m8Questions, m9Questions, m10Questions } = require('./generate_phase2_data.cjs');

const questionsFile = 'src/lib/data/questions.ts';
let code = fs.readFileSync(questionsFile, 'utf8');

// --- 1. SEEDS ---
const additionalSeeds = `
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

const mod8QueueSeed = \`CREATE TABLE job_queue (id INT PRIMARY KEY, task_type TEXT, payload TEXT, status TEXT);
INSERT INTO job_queue VALUES
(1, 'email_alert', '{"to":"alice@example.com"}', 'queued'),
(2, 'data_export', '{"report":"quarterly"}', 'queued'),
(3, 'image_resize', '{"file":"avatar.png"}', 'processing'),
(4, 'webhook_sync', '{"event":"user_signup"}', 'queued');\`;

const mod9ArraysSeed = \`CREATE TABLE user_accounts (id INT PRIMARY KEY, email TEXT, is_active BOOLEAN, signup_date DATE);
INSERT INTO user_accounts VALUES
(1, 'ALICE@EXAMPLE.COM', true, '2023-01-15'),
(2, 'bob.builder@acme.org', false, '2023-03-22'),
(3, 'CHARLIE@DOMAIN.NET', true, '2023-05-10'),
(4, 'diana.prince@themyscira.gov', true, '2023-07-04'),
(5, 'evan.inactive@testing.io', false, '2023-09-18');

CREATE TABLE article_tags (id INT PRIMARY KEY, title TEXT, tags TEXT[], view_count INT);
INSERT INTO article_tags VALUES
(1, 'Getting Started with Postgres', ARRAY['postgres', 'sql', 'tutorial'], 1420),
(2, 'Deep Dive into B-Tree Indexes', ARRAY['postgres', 'indexing', 'performance'], 2890),
(3, 'Modern Web Development with SvelteKit', ARRAY['frontend', 'javascript', 'svelte'], 950),
(4, 'Database Concurrency and Locks', ARRAY['postgres', 'transactions', 'locking'], 3100);\`;
`;

if (!code.includes('const mod4TemporalSeed')) {
    const marker = 'function generateModule1';
    code = code.replace(marker, additionalSeeds + '\n' + marker);
    console.log('Seeds inserted before generateModule1.');
}

// Helper to serialize objects cleanly to TypeScript literal format
function serializeQuestions(questions) {
    const jsonStr = JSON.stringify(questions, null, 8);
    const inner = jsonStr.substring(jsonStr.indexOf('[') + 1, jsonStr.lastIndexOf(']'));
    return inner
        .replace(/"seed_sql":\s*"(mod\w+)"/g, 'seed_sql: $1')
        .replace(/"seed_sql":\s*"(mod7Seed\\nCREATE MATERIALIZED VIEW[^"]+)"/g, (_m, s) => {
            return `seed_sql: mod7Seed + \`\nCREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;\``;
        })
        .trim();
}

// Helper to update categorySlot for a list of question IDs within a code slice
function updateSlots(subCode, idToSlotMap) {
    let result = subCode;
    for (const [idStr, newSlot] of Object.entries(idToSlotMap)) {
        const id = parseInt(idStr);
        // Match { ... id: 123, ... categorySlot: X, ... }
        // We find the question block starting at id: <id>
        const regexes = [
            new RegExp(`(id:\\s*${id}\\s*,[\\s\\S]*?categorySlot:\\s*)\\d+`, 'm'),
            new RegExp(`("id":\\s*${id}\\s*,[\\s\\S]*?"categorySlot":\\s*)\\d+`, 'm')
        ];
        let replaced = false;
        for (const r of regexes) {
            if (r.test(result)) {
                result = result.replace(r, `$1${newSlot}`);
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            console.warn(`WARNING: Could not update slot for ID ${id}`);
        }
    }
    return result;
}

// --- MODULE 1 ---
console.log('Refactoring Module 1...');
const m1Start = code.indexOf('function generateModule1()');
const m2Start = code.indexOf('function generateModule2()');
let m1Body = code.substring(m1Start, m2Start);

// Q119, Q139, Q159 (RENAME COLUMN) -> Slot 10
// Q110, Q120, Q130, Q140, Q150, Q160 (TRUNCATE) -> Slot 11
const m1SlotMap = {
    119: 10,
    139: 10,
    159: 10,
    110: 11,
    120: 11,
    130: 11,
    140: 11,
    150: 11,
    160: 11
};
m1Body = updateSlots(m1Body, m1SlotMap);
code = code.substring(0, m1Start) + m1Body + code.substring(m2Start);

// --- MODULE 2 ---
console.log('Refactoring Module 2 (adding Slot 9 IN questions)...');
const m2Slot9Questions = [
    {
        id: 241,
        moduleId: 2,
        categorySlot: 9,
        title: {
            en: "Discrete List Filter with IN (Var #1)",
            id: "Penyaringan Daftar Nilai dengan IN (Latihan #1)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Imagine shopping at a grocery store with a handwritten shopping list. Rather than walking through every aisle checking every shelf one-by-one, you look exclusively for items that match your list.\n\nEngine Processing Behavior: The IN operator evaluates membership against a finite set of literal values. Database engines optimize IN lists by transforming them into discrete equality checks or building an internal hash set for fast O(1) membership probing during table and index scans.\n\nBest Practices & Gotchas: Avoid extremely long IN lists with thousands of constants, as they bloat query parse trees. Ensure all elements in the list match the column's data type to maintain index lookups.",
            id: "Analogi Konseptual: Bayangkan kamu berbelanja di supermarket membawa catatan belanja. Alih-alih memeriksa setiap barang di seluruh rak satu per satu, kamu hanya mencari barang-barang yang namanya tercantum dalam daftar belanjaanmu.\n\nCara Kerja Database Engine: Operator IN mencocokkan nilai kolom dengan sekumpulan konstanta tertentu. Engine database mengoptimalkan list IN menjadi perbandingan kesetaraan jamak atau membangun struktur hash set internal untuk pencarian keanggotaan O(1) yang sangat cepat saat scan tabel maupun indeks.\n\nBest Practices & Catatan Penting: Hindari penggunaan ribuan konstanta di dalam klausa IN karena memperbesar ukuran parse tree query. Pastikan semua elemen di dalam list memiliki tipe data yang sesuai dengan kolom target agar indeks dapat digunakan optimal."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Filter with IN list",
                    id: "Penyaringan nilai dengan list IN"
                },
                code: "SELECT * FROM items WHERE category IN ('Furniture', 'Kitchen');"
            }
        ],
        instructions: {
            en: "Find all items belonging to either the Furniture or Kitchen categories.",
            id: "Temukan semua barang yang termasuk dalam kategori Furniture atau Kitchen."
        },
        seed_sql: "mod2Seed",
        expected_query: "SELECT * FROM items WHERE category IN ('Furniture', 'Kitchen');",
        starterQuery: "SELECT * FROM items;",
        table_names: ["items"]
    },
    {
        id: 242,
        moduleId: 2,
        categorySlot: 9,
        title: {
            en: "Discrete List Filter with IN (Var #2)",
            id: "Penyaringan Daftar Nilai dengan IN (Latihan #2)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: A warehouse manager filtering stock inventory records for items requiring attention, specifically those marked as out of stock or discontinued.\n\nEngine Processing Behavior: IN (val1, val2) allows the query planner to employ index multi-range scans across B-tree index leaf nodes when an index on the column exists.\n\nBest Practices & Gotchas: IN is functionally equivalent to OR (status = 'OutOfStock' OR status = 'Discontinued'), but IN is more concise, readable, and optimizer-friendly.",
            id: "Analogi Konseptual: Manajer gudang menyaring data stok barang untuk item yang memerlukan perhatian khusus, tepatnya yang berstatus habis atau dihentikan produksinya.\n\nCara Kerja Database Engine: Sintaks IN (val1, val2) memungkinkan query planner menjalankan multi-range scan pada leaf node B-tree index jika terdapat indeks pada kolom tersebut.\n\nBest Practices & Catatan Penting: Klausa IN secara logika setara dengan rangkaian OR (status = 'OutOfStock' OR status = 'Discontinued'), namun IN jauh lebih ringkas, mudah dibaca, dan lebih disukai query optimizer."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Status matching with IN",
                    id: "Pencocokan status dengan IN"
                },
                code: "SELECT * FROM items WHERE status IN ('OutOfStock', 'Discontinued');"
            }
        ],
        instructions: {
            en: "Find all items with a status of either OutOfStock or Discontinued.",
            id: "Temukan semua barang yang memiliki status OutOfStock atau Discontinued."
        },
        seed_sql: "mod2Seed",
        expected_query: "SELECT * FROM items WHERE status IN ('OutOfStock', 'Discontinued');",
        starterQuery: "SELECT * FROM items;",
        table_names: ["items"]
    },
    {
        id: 243,
        moduleId: 2,
        categorySlot: 9,
        title: {
            en: "Discrete List Filter with IN (Var #3)",
            id: "Penyaringan Daftar Nilai dengan IN (Latihan #3)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Selecting specific product categories for a targeted marketing promotion while keeping results in ordered sequence.\n\nEngine Processing Behavior: The storage engine scans items matching the IN list predicates and channels them into the sorting pipeline ordered by the primary key.\n\nBest Practices & Gotchas: Combining IN list filtering with ORDER BY ensures deterministic output ordering across database engines.",
            id: "Analogi Konseptual: Memilih kategori produk tertentu untuk promosi pemasaran bertarget sembari menjaga baris data tersusun rapi secara urut.\n\nCara Kerja Database Engine: Storage engine menyaring item yang sesuai dengan predikat list IN lalu menyalurkan baris hasil ke pipeline pengurutan berdasarkan primary key.\n\nBest Practices & Catatan Penting: Mengombinasikan filter list IN dengan ORDER BY menjamin urutan hasil query bersifat deterministik dan konsisten di setiap database engine."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Filter categories with IN and ORDER BY",
                    id: "Penyaringan kategori dengan IN dan ORDER BY"
                },
                code: "SELECT * FROM items WHERE category IN ('Electronics', 'Stationery') ORDER BY id;"
            }
        ],
        instructions: {
            en: "Find all items belonging to either the Electronics or Stationery categories, ordered by id.",
            id: "Temukan semua barang yang termasuk dalam kategori Electronics atau Stationery, urutkan berdasarkan id."
        },
        seed_sql: "mod2Seed",
        expected_query: "SELECT * FROM items WHERE category IN ('Electronics', 'Stationery') ORDER BY id;",
        starterQuery: "SELECT * FROM items;",
        table_names: ["items"]
    },
    {
        id: 244,
        moduleId: 2,
        categorySlot: 9,
        title: {
            en: "Discrete Exclusion with NOT IN (Var #4)",
            id: "Pengecualian Nilai dengan NOT IN (Latihan #4)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Filtering out unwanted categories from an inventory report, keeping only the remaining niche departments.\n\nEngine Processing Behavior: NOT IN checks that a column value does not match any element in the set. Caution: if the set contains a NULL, NOT IN evaluates to UNKNOWN for all rows.\n\nBest Practices & Gotchas: Never use NOT IN against sets containing NULL values, as three-valued logic will cause the query to return zero rows. Use NOT EXISTS or ensure non-null sets.",
            id: "Analogi Konseptual: Menyaring dan membuang kategori tertentu dari laporan inventaris, hanya menyisakan departemen pendukung lainnya.\n\nCara Kerja Database Engine: Operator NOT IN memastikan nilai kolom tidak cocok dengan satupun anggota himpunan. Perhatian: jika himpunan memuat nilai NULL, NOT IN bernilai UNKNOWN untuk seluruh baris.\n\nBest Practices & Catatan Penting: Jangan pernah menggunakan NOT IN pada himpunan yang berpotensi memuat nilai NULL karena logika ternary (three-valued logic) akan membuat query mengembalikan nol baris. Gunakan NOT EXISTS jika data memiliki nilai NULL."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Exclude categories with NOT IN",
                    id: "Mengecualikan kategori dengan NOT IN"
                },
                code: "SELECT id, name, price, category FROM items WHERE category NOT IN ('Electronics', 'Furniture') ORDER BY price ASC;"
            }
        ],
        instructions: {
            en: "Display the id, name, price, and category of items that are not in the Electronics or Furniture categories, sorted by price ascending.",
            id: "Tampilkan id, name, price, dan category dari barang yang tidak termasuk dalam kategori Electronics atau Furniture, urutkan berdasarkan harga menaik."
        },
        seed_sql: "mod2Seed",
        expected_query: "SELECT id, name, price, category FROM items WHERE category NOT IN ('Electronics', 'Furniture') ORDER BY price ASC;",
        starterQuery: "SELECT id, name, price, category FROM items;",
        table_names: ["items"]
    },
    {
        id: 245,
        moduleId: 2,
        categorySlot: 9,
        title: {
            en: "Primary Key List Filter with IN (Var #5)",
            id: "Penyaringan Daftar Primary Key dengan IN (Latihan #5)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: A cashier entering specific invoice numbers from a dispatch sheet to retrieve exact line items instantly.\n\nEngine Processing Behavior: When the IN list targets a primary key or unique indexed column, the optimizer converts the query into multiple direct index seeks (one per key in the list), achieving near-instant execution.\n\nBest Practices & Gotchas: Fetching records by a list of primary keys via IN is the standard, most performant way ORMs and data loaders hydrate batches of entities.",
            id: "Analogi Konseptual: Kasir memasukkan nomor-nomor faktur tertentu dari lembar pengiriman untuk langsung menampilkan rincian barang terkait secara instan.\n\nCara Kerja Database Engine: Ketika klausa IN menargetkan kolom primary key atau kolom berindeks unik, optimizer mengubah query menjadi serangkaian index seek langsung (satu pencarian per kunci dalam list) sehingga waktu eksekusi sangat cepat.\n\nBest Practices & Catatan Penting: Mengambil banyak data berdasarkan daftar primary key via operator IN adalah standar industri dengan performa tertinggi yang digunakan oleh ORM dan batch data loader."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Filter primary keys with IN",
                    id: "Penyaringan primary key dengan IN"
                },
                code: "SELECT * FROM items WHERE id IN (1, 4, 7, 10) ORDER BY id;"
            }
        ],
        instructions: {
            en: "Retrieve all details for items whose id is 1, 4, 7, or 10, ordered by id.",
            id: "Tampilkan seluruh detail barang yang memiliki id 1, 4, 7, atau 10, urutkan berdasarkan id."
        },
        seed_sql: "mod2Seed",
        expected_query: "SELECT * FROM items WHERE id IN (1, 4, 7, 10) ORDER BY id;",
        starterQuery: "SELECT * FROM items;",
        table_names: ["items"]
    }
];

const m2StartIdx = code.indexOf('function generateModule2()');
const m3StartIdx = code.indexOf('function generateModule3()');
let m2Body = code.substring(m2StartIdx, m3StartIdx);
if (!m2Body.includes('id: 241') && !m2Body.includes('"id": 241')) {
    const m2EndIdx = m2Body.lastIndexOf('];');
    m2Body = m2Body.substring(0, m2EndIdx).trimEnd() + ',\n' + serializeQuestions(m2Slot9Questions) + '\n    ];\n}';
    code = code.substring(0, m2StartIdx) + m2Body + '\n\n' + code.substring(m3StartIdx);
    console.log('Module 2 Slot 9 appended.');
}

// --- MODULE 4 ---
console.log('Refactoring Module 4...');
// Re-assign slots for m4Questions:
// 431, 432, 435 -> slot 4 (DATE_TRUNC)
// 433, 434, 436 -> slot 5 (INTERVAL)
// 437, 438, 439, 440, 441, 442 -> slot 8 (CAST & TRIM)
m4Questions.forEach(q => {
    if ([431, 432, 435].includes(q.id)) q.categorySlot = 4;
    else if ([433, 434, 436].includes(q.id)) q.categorySlot = 5;
    else if ([437, 438, 439, 440, 441, 442].includes(q.id)) q.categorySlot = 8;
});

const m4StartIdx = code.indexOf('function generateModule4()');
const m5StartIdx = code.indexOf('function generateModule5()');
let m4Body = code.substring(m4StartIdx, m5StartIdx);

// Existing: 404, 409, 414, 419, 424, 429 (CASE WHEN) -> slot 6
// 405, 410, 415, 420, 425, 430 (COALESCE) -> slot 7
const m4SlotMap = {
    404: 6, 409: 6, 414: 6, 419: 6, 424: 6, 429: 6,
    405: 7, 410: 7, 415: 7, 420: 7, 425: 7, 430: 7
};
m4Body = updateSlots(m4Body, m4SlotMap);

if (!m4Body.includes('id: 431') && !m4Body.includes('"id": 431')) {
    const m4EndIdx = m4Body.lastIndexOf('];');
    m4Body = m4Body.substring(0, m4EndIdx).trimEnd() + ',\n' + serializeQuestions(m4Questions) + '\n    ];\n}';
}
code = code.substring(0, m4StartIdx) + m4Body + '\n\n' + code.substring(m5StartIdx);
console.log('Module 4 refactored.');

// --- MODULE 5 ---
console.log('Refactoring Module 5...');
// Re-assign slots for m5Questions:
// 553, 555 -> slot 3 (RIGHT JOIN)
// 554, 556 -> slot 5 (CROSS JOIN)
// 557, 558 -> slot 9 (Non-Equi Join)
// 559, 560 -> slot 10 (LATERAL JOIN)
// 549 -> slot 14 (ON DELETE RESTRICT)
// 550 -> slot 15 (ON DELETE SET NULL)
// 551, 552 -> slot 17 (ON CONFLICT DO NOTHING)
m5Questions.forEach(q => {
    if ([553, 555].includes(q.id)) q.categorySlot = 3;
    else if ([554, 556].includes(q.id)) q.categorySlot = 5;
    else if ([557, 558].includes(q.id)) q.categorySlot = 9;
    else if ([559, 560].includes(q.id)) q.categorySlot = 10;
    else if (q.id === 549) q.categorySlot = 14;
    else if (q.id === 550) q.categorySlot = 15;
    else if ([551, 552].includes(q.id)) q.categorySlot = 17;
});

const m5StartNew = code.indexOf('function generateModule5()');
const m6StartNew = code.indexOf('function generateModule6()');
let m5Body = code.substring(m5StartNew, m6StartNew);

// Existing:
// FULL JOIN (503, 512, 521, 530, 539) -> slot 4
// SELF JOIN (504, 513, 522, 531, 540) -> slot 6
// ANTI JOIN (505, 514, 523, 532, 541) -> slot 7
// Aliased WHERE JOIN (506, 515, 524, 533, 542) -> slot 8
// CHECK (507, 516, 525, 534, 543) -> slot 11
// UNIQUE (508, 517, 526, 535, 544) -> slot 12
// ON DELETE CASCADE (509, 518, 527, 536, 545) -> slot 13
// ON CONFLICT DO UPDATE (546, 547, 548) -> slot 16
const m5SlotMap = {
    503: 4, 512: 4, 521: 4, 530: 4, 539: 4,
    504: 6, 513: 6, 522: 6, 531: 6, 540: 6,
    505: 7, 514: 7, 523: 7, 532: 7, 541: 7,
    506: 8, 515: 8, 524: 8, 533: 8, 542: 8,
    507: 11, 516: 11, 525: 11, 534: 11, 543: 11,
    508: 12, 517: 12, 526: 12, 535: 12, 544: 12,
    509: 13, 518: 13, 527: 13, 536: 13, 545: 13,
    546: 16, 547: 16, 548: 16
};
m5Body = updateSlots(m5Body, m5SlotMap);

if (!m5Body.includes('id: 549') && !m5Body.includes('"id": 549')) {
    const m5EndIdx = m5Body.lastIndexOf('];');
    m5Body = m5Body.substring(0, m5EndIdx).trimEnd() + ',\n' + serializeQuestions(m5Questions) + '\n    ];\n}';
}
code = code.substring(0, m5StartNew) + m5Body + '\n\n' + code.substring(m6StartNew);
console.log('Module 5 refactored.');

// --- MODULE 6 ---
console.log('Refactoring Module 6...');
// m6Questions:
// 644, 645, 646, 647 -> slot 10 (WITH RECURSIVE)
// 648, 649, 650, 651 -> slot 11 (Writable CTE)
m6Questions.forEach(q => {
    if ([644, 645, 646, 647].includes(q.id)) q.categorySlot = 10;
    else if ([648, 649, 650, 651].includes(q.id)) q.categorySlot = 11;
});

const m6StartFresh = code.indexOf('function generateModule6()');
const m7StartFresh = code.indexOf('function generateModule7()');
let m6Body = code.substring(m6StartFresh, m7StartFresh);

if (!m6Body.includes('id: 644') && !m6Body.includes('"id": 644')) {
    const m6EndIdx = m6Body.lastIndexOf('];');
    m6Body = m6Body.substring(0, m6EndIdx).trimEnd() + ',\n' + serializeQuestions(m6Questions) + '\n    ];\n}';
}
code = code.substring(0, m6StartFresh) + m6Body + '\n\n' + code.substring(m7StartFresh);
console.log('Module 6 refactored.');

// --- MODULE 7 ---
console.log('Refactoring Module 7...');
// m7Questions:
// 738 -> slot 5 (LEAD)
// 737, 740 -> slot 6 (FIRST_VALUE / LAST_VALUE)
// 739 -> slot 7 (NTILE)
// 734, 735, 736 -> slot 8 (ROWS BETWEEN)
// 741, 742, 743 -> slot 11 (CREATE / REFRESH MAT VIEW)
m7Questions.forEach(q => {
    if (q.id === 738) q.categorySlot = 5;
    else if ([737, 740].includes(q.id)) q.categorySlot = 6;
    else if (q.id === 739) q.categorySlot = 7;
    else if ([734, 735, 736].includes(q.id)) q.categorySlot = 8;
    else if ([741, 742, 743].includes(q.id)) q.categorySlot = 11;
});

const m7StartFresh2 = code.indexOf('function generateModule7()');
const m8StartFresh2 = code.indexOf('function generateModule8()');
let m7Body = code.substring(m7StartFresh2, m8StartFresh2);

// Existing:
// 705, 710, 715, 720, 725, 730 (CREATE VIEW) -> slot 10
// 731, 732, 733 (DISTINCT ON) -> slot 9
const m7SlotMap = {
    705: 10, 710: 10, 715: 10, 720: 10, 725: 10, 730: 10,
    731: 9, 732: 9, 733: 9
};
m7Body = updateSlots(m7Body, m7SlotMap);

if (!m7Body.includes('id: 734') && !m7Body.includes('"id": 734')) {
    const m7EndIdx = m7Body.lastIndexOf('];');
    m7Body = m7Body.substring(0, m7EndIdx).trimEnd() + ',\n' + serializeQuestions(m7Questions) + '\n    ];\n}';
}
code = code.substring(0, m7StartFresh2) + m7Body + '\n\n' + code.substring(m8StartFresh2);
console.log('Module 7 refactored.');

// --- MODULE 8 ---
console.log('Refactoring Module 8...');
// m8Questions:
// 825, 827 -> slot 5 (FOR UPDATE SKIP LOCKED)
// 826, 828 -> slot 6 (FOR UPDATE NOWAIT)
// 821, 823, 824 -> slot 7 (REPEATABLE READ / READ COMMITTED)
// 822 -> slot 8 (SERIALIZABLE)
m8Questions.forEach(q => {
    if ([825, 827].includes(q.id)) q.categorySlot = 5;
    else if ([826, 828].includes(q.id)) q.categorySlot = 6;
    else if ([821, 823, 824].includes(q.id)) q.categorySlot = 7;
    else if (q.id === 822) q.categorySlot = 8;
});

const m8StartFresh3 = code.indexOf('function generateModule8()');
const m9StartFresh3 = code.indexOf('function generateModule9()');
let m8Body = code.substring(m8StartFresh3, m9StartFresh3);

// Existing:
// 803, 807, 811, 815, 819 (FOR UPDATE) -> slot 4
// 804, 808, 812, 816, 820 (SAVEPOINT) -> slot 3
const m8SlotMap = {
    803: 4, 807: 4, 811: 4, 815: 4, 819: 4,
    804: 3, 808: 3, 812: 3, 816: 3, 820: 3
};
m8Body = updateSlots(m8Body, m8SlotMap);

if (!m8Body.includes('id: 821') && !m8Body.includes('"id": 821')) {
    const m8EndIdx = m8Body.lastIndexOf('];');
    m8Body = m8Body.substring(0, m8EndIdx).trimEnd() + ',\n' + serializeQuestions(m8Questions) + '\n    ];\n}';
}
code = code.substring(0, m8StartFresh3) + m8Body + '\n\n' + code.substring(m9StartFresh3);
console.log('Module 8 refactored.');

// --- MODULE 9 ---
console.log('Refactoring Module 9...');
// m9Questions:
// 943, 945 -> slot 3 (Partial index)
// 944 -> slot 4 (Expression index)
// 946, 947 -> slot 14 (Native arrays)
// 948 -> slot 15 (UUID)
m9Questions.forEach(q => {
    if ([943, 945].includes(q.id)) q.categorySlot = 3;
    else if (q.id === 944) q.categorySlot = 4;
    else if ([946, 947].includes(q.id)) q.categorySlot = 14;
    else if (q.id === 948) q.categorySlot = 15;
});

const m9StartFresh4 = code.indexOf('function generateModule9()');
const m10StartFresh4 = code.indexOf('function generateModule10()');
let m9Body = code.substring(m9StartFresh4, m10StartFresh4);

// Existing:
// 905, 910, 915, 920, 925 (Composite Index) -> slot 2
// 902, 907, 912, 917, 922 (ENUM) -> slot 5
// 904, 909, 914, 919, 924 (CREATE SCHEMA) -> slot 6
// 940 (CREATE DATABASE) -> slot 7
// 935, 936, 937, 938, 939 (Roles) -> slot 8
// 926, 927, 928 (JSONB ->>) -> slot 9
// 929, 930, 931 (JSONB ?) -> slot 10
// 932, 933, 934 (JSONB @>) -> slot 11
// 941 (FTS GIN Index, isMandatory: true) -> slot 12
// 942 (FTS Query, isMandatory: true) -> slot 13
// 903, 908, 913, 918, 923 (FTS queries) -> slot 13
const m9SlotMap = {
    905: 2, 910: 2, 915: 2, 920: 2, 925: 2,
    902: 5, 907: 5, 912: 5, 917: 5, 922: 5,
    904: 6, 909: 6, 914: 6, 919: 6, 924: 6,
    940: 7,
    935: 8, 936: 8, 937: 8, 938: 8, 939: 8,
    926: 9, 927: 9, 928: 9,
    929: 10, 930: 10, 931: 10,
    932: 11, 933: 11, 934: 11,
    941: 12,
    942: 13,
    903: 13, 908: 13, 913: 13, 918: 13, 923: 13
};
m9Body = updateSlots(m9Body, m9SlotMap);

if (!m9Body.includes('id: 943') && !m9Body.includes('"id": 943')) {
    const m9EndIdx = m9Body.lastIndexOf('];');
    m9Body = m9Body.substring(0, m9EndIdx).trimEnd() + ',\n' + serializeQuestions(m9Questions) + '\n    ];\n}';
}
code = code.substring(0, m9StartFresh4) + m9Body + '\n\n' + code.substring(m10StartFresh4);
console.log('Module 9 refactored.');

// --- MODULE 10 ---
console.log('Refactoring Module 10...');
const m10StartFresh5 = code.indexOf('function generateModule10()');
const m11StartFresh5 = code.indexOf('function generateModule11()');
let m10Body = code.substring(m10StartFresh5, m11StartFresh5);

if (!m10Body.includes('id: 1011') && !m10Body.includes('"id": 1011')) {
    const m10EndIdx = m10Body.lastIndexOf('];');
    m10Body = m10Body.substring(0, m10EndIdx).trimEnd() + ',\n' + serializeQuestions(m10Questions) + '\n    ];\n}';
}
code = code.substring(0, m10StartFresh5) + m10Body + '\n\n' + code.substring(m11StartFresh5);
console.log('Module 10 refactored.');

// Write back to questionsFile
fs.writeFileSync(questionsFile, code);
console.log('All modules updated in questions.ts successfully!');
