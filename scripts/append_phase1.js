const fs = require('fs');

const mod4TemporalSeed = `CREATE TABLE subscriptions (id INT PRIMARY KEY, user_id INT, plan_name TEXT, started_at TIMESTAMP, monthly_fee NUMERIC(10,2));
INSERT INTO subscriptions VALUES
(1, 101, 'Pro', '2024-01-15 08:30:00', 29.99),
(2, 102, 'Basic', '2024-01-28 14:10:00', 9.99),
(3, 103, 'Enterprise', '2024-02-05 10:00:00', 99.99),
(4, 104, 'Pro', '2024-02-20 16:45:00', 29.99),
(5, 105, 'Basic', '2024-03-01 11:20:00', 9.99),
(6, 106, 'Enterprise', '2024-03-15 13:00:00', 99.99);`;

const mod4CastingSeed = `CREATE TABLE products_pricing (id INT PRIMARY KEY, product_code TEXT, raw_price TEXT, discount_rate TEXT, notes TEXT);
INSERT INTO products_pricing VALUES
(1, '  PROD-001  ', '199.95', '0.15', '  In stock  '),
(2, '  PROD-002  ', '49.50', '0.10', '  Low inventory  '),
(3, '  PROD-003  ', '899.00', '0.20', '  Flagship item  '),
(4, '  PROD-004  ', '29.99', '0.05', '  Clearance  ');`;

// MODULE 4 NEW QUESTIONS (Slots 6 & 7)
const m4NewQuestions = [
    // Slot 6: Date Truncation & Intervals
    {
        id: 431,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Monthly Revenue Aggregation with Date Truncation (Var #1)",
            id: "Agregasi Pendapatan Bulanan dengan Pemotongan Tanggal (Latihan #1)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Think of date truncation as snapping timestamps to a calendar grid (such as the first second of each month or week), grouping disparate dates into unified time buckets.\n\nEngine Processing Behavior: The date truncation scalar function clears lower-order date components, allowing the query engine to group temporal data efficiently in standard aggregation passes without string formatting overhead.\n\nBest Practices & Gotchas: Truncating indexed timestamp columns directly in WHERE filters causes sequential table scans; prefer explicit interval ranges over truncating the column.",
            id: "Analogi Konseptual: Bayangkan pemotongan tanggal seperti menyelaraskan jam dan menit ke batas awal kalender (misalnya detik pertama setiap bulan atau minggu), sehingga data transaksi yang tersebar dapat dikelompokkan ke dalam wadah waktu yang seragam.\n\nCara Kerja Database Engine: Fungsi pemotongan tanggal mereset komponen waktu tingkat rendah ke nilai awal secara matematis, memungkinkan engine melakukan grouping data temporal secara efisien di pipeline agregasi tanpa konversi teks.\n\nBest Practices & Catatan Penting: Hindari memotong kolom timestamp berindeks di dalam filter pencarian karena dapat memicu sequential scan; gunakan perbandingan rentang tanggal langsung untuk mempertahankan efektivitas indeks."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Date truncation to month",
                    id: "Pemotongan tanggal ke awal bulan"
                },
                code: "SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;"
            }
        ],
        instructions: {
            en: "Calculate the total monthly fee grouped by the month start date of `started_at` aliased as `month_start` from `subscriptions`, ordered chronologically.",
            id: "Hitung total biaya bulanan yang dikelompokkan berdasarkan tanggal awal bulan dari `started_at` dengan alias `month_start` dari tabel `subscriptions`, diurutkan secara kronologis."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT DATE_TRUNC('month', started_at) AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY DATE_TRUNC('month', started_at) ORDER BY month_start;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Monthly Revenue Aggregation with DATE_FORMAT (Var #1)",
                    id: "Agregasi Pendapatan Bulanan dengan DATE_FORMAT (Latihan #1)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Formatting dates to month boundaries creates uniform buckets for grouping chronological metrics.\n\nEngine Processing Behavior: The engine formats the date string to month precision and hashes the formatted values for group aggregation.\n\nBest Practices & Gotchas: Format strings evaluate per row; ensure date columns contain valid temporal strings.",
                    id: "Analogi Konseptual: Pemformatan tanggal ke batas awal bulan menciptakan wadah waktu yang seragam untuk mengelompokkan data metrik kronologis.\n\nCara Kerja Database Engine: Database engine memformat string tanggal hingga presisi bulan dan melakukan hash pada nilai tersebut untuk agregasi kelompok data.\n\nBest Practices & Catatan Penting: Format tanggal dievaluasi per baris; pastikan kolom tanggal memiliki format yang valid."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL date formatting to month bucket",
                            id: "Pemformatan tanggal bulan pada MySQL"
                        },
                        code: "SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY month_start ORDER BY month_start;"
                    }
                ],
                instructions: {
                    en: "Calculate the total monthly fee grouped by the month start date of `started_at` aliased as `month_start` from `subscriptions`, ordered chronologically.",
                    id: "Hitung total biaya bulanan yang dikelompokkan berdasarkan tanggal awal bulan dari `started_at` dengan alias `month_start` dari tabel `subscriptions`, diurutkan secara kronologis."
                },
                expected_query: "SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY month_start ORDER BY month_start;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },
    {
        id: 432,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Daily Signup Count with Date Truncation (Var #2)",
            id: "Hitung Pendaftaran Harian dengan Pemotongan Tanggal (Latihan #2)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Truncating timestamps to day boundaries removes the noise of hours and minutes to reveal daily adoption rhythms.\n\nEngine Processing Behavior: The date truncation operation zeroes hours, minutes, and seconds, grouping all events occurring on the same calendar day together.\n\nBest Practices & Gotchas: Be mindful of timezone shifts when truncating UTC timestamps to local calendar days.",
            id: "Analogi Konseptual: Memotong timestamp ke batas hari menghilangkan komponen jam dan menit sehingga memperlihatkan volume pendaftaran harian yang bersih.\n\nCara Kerja Database Engine: Operasi pemotongan tanggal mereset nilai jam, menit, dan detik menjadi nol, sehingga semua transaksi pada hari kalender yang sama dikelompokkan bersama.\n\nBest Practices & Catatan Penting: Perhatikan perbedaan zona waktu saat memotong timestamp UTC menjadi tanggal kalender lokal."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Date truncation to day",
                    id: "Pemotongan tanggal ke awal hari"
                },
                code: "SELECT DATE_TRUNC('day', started_at) AS signup_day, COUNT(*) AS signup_count FROM subscriptions GROUP BY DATE_TRUNC('day', started_at) ORDER BY signup_day;"
            }
        ],
        instructions: {
            en: "Calculate the count of signups aliased as `signup_count` grouped by each day start of `started_at` aliased as `signup_day` from `subscriptions`, ordered chronologically.",
            id: "Hitung jumlah pendaftaran dengan alias `signup_count` yang dikelompokkan berdasarkan awal hari dari `started_at` dengan alias `signup_day` dari tabel `subscriptions`, diurutkan secara kronologis."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT DATE_TRUNC('day', started_at) AS signup_day, COUNT(*) AS signup_count FROM subscriptions GROUP BY DATE_TRUNC('day', started_at) ORDER BY signup_day;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Daily Signup Count with DATE_FORMAT (Var #2)",
                    id: "Hitung Pendaftaran Harian dengan DATE_FORMAT (Latihan #2)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Formatting dates to day level creates clean daily buckets for tallying signups.\n\nEngine Processing Behavior: The engine formats the timestamp down to day precision, grouping matching calendar dates.\n\nBest Practices & Gotchas: Format strings evaluate per row; ensure date columns contain valid temporal strings.",
                    id: "Analogi Konseptual: Memformat tanggal hingga presisi hari menghasilkan kelompok harian yang rapi untuk menghitung pendaftaran.\n\nCara Kerja Database Engine: Database engine memformat timestamp hingga presisi hari, mengelompokkan baris dengan tanggal yang sama.\n\nBest Practices & Catatan Penting: Format tanggal dievaluasi per baris; pastikan kolom tanggal memiliki format yang valid."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL date formatting to day bucket",
                            id: "Pemformatan tanggal hari pada MySQL"
                        },
                        code: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d 00:00:00') AS signup_day, COUNT(*) AS signup_count FROM subscriptions GROUP BY signup_day ORDER BY signup_day;"
                    }
                ],
                instructions: {
                    en: "Calculate the count of signups aliased as `signup_count` grouped by each day start of `started_at` aliased as `signup_day` from `subscriptions`, ordered chronologically.",
                    id: "Hitung jumlah pendaftaran dengan alias `signup_count` yang dikelompokkan berdasarkan awal hari dari `started_at` dengan alias `signup_day` dari tabel `subscriptions`, diurutkan secara kronologis."
                },
                expected_query: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d 00:00:00') AS signup_day, COUNT(*) AS signup_count FROM subscriptions GROUP BY signup_day ORDER BY signup_day;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },
    {
        id: 433,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Relative Temporal Filtering with Intervals (Var #3)",
            id: "Filtering Temporal Relatif dengan Interval Waktu (Latihan #3)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Interval arithmetic lets you express dynamic time windows such as 'within the past 30 days' without hardcoding fixed calendar dates.\n\nEngine Processing Behavior: The query planner computes the boundary timestamp once during optimization and evaluates indexed comparisons against row values.\n\nBest Practices & Gotchas: Intervals preserve calendar semantics across varying month lengths and leap years.",
            id: "Analogi Konseptual: Aritmetika interval memungkinkan penentuan jendela waktu dinamis seperti '30 hari terakhir' tanpa perlu menuliskan tanggal kalender statis.\n\nCara Kerja Database Engine: Query planner menghitung batas waktu satu kali saat optimasi query dan mengevaluasi perbandingan terhadap setiap nilai baris data.\n\nBest Practices & Catatan Penting: Tipe data interval mempertahankan semantik kalender dengan tepat di berbagai panjang bulan dan tahun kabisat."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Interval arithmetic in WHERE filter",
                    id: "Aritmetika interval dalam filter WHERE"
                },
                code: "SELECT user_id, plan_name, started_at FROM subscriptions WHERE started_at >= TIMESTAMP '2024-03-01 00:00:00' - INTERVAL '30 days' ORDER BY started_at;"
            }
        ],
        instructions: {
            en: "Display `user_id`, `plan_name`, and `started_at` from `subscriptions` for all subscriptions started within 30 days prior to March 1, 2024, ordered chronologically.",
            id: "Tampilkan `user_id`, `plan_name`, dan `started_at` dari `subscriptions` untuk semua langganan yang dimulai dalam kurun waktu 30 hari sebelum 1 Maret 2024, diurutkan secara kronologis."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT user_id, plan_name, started_at FROM subscriptions WHERE started_at >= TIMESTAMP '2024-03-01 00:00:00' - INTERVAL '30 days' ORDER BY started_at;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Relative Temporal Filtering with DATE_SUB (Var #3)",
                    id: "Filtering Temporal Relatif dengan DATE_SUB (Latihan #3)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Subtracting time intervals in MySQL establishes dynamic rolling cutoff boundaries.\n\nEngine Processing Behavior: The engine subtracts the specified interval quantity from the anchor date and filters rows matching the predicate.\n\nBest Practices & Gotchas: Ensure the anchor timestamp is formatted as ISO standard text.",
                    id: "Analogi Konseptual: Pengurangan interval waktu di MySQL menetapkan batas tanggal dinamis untuk filter query.\n\nCara Kerja Database Engine: Database engine mengurangkan interval waktu dari tanggal acuan dan menyaring baris yang memenuhi predikat.\n\nBest Practices & Catatan Penting: Pastikan tanggal acuan ditulis dalam format teks standar ISO."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL DATE_SUB interval filter",
                            id: "Filter interval DATE_SUB pada MySQL"
                        },
                        code: "SELECT user_id, plan_name, started_at FROM subscriptions WHERE started_at >= DATE_SUB('2024-03-01 00:00:00', INTERVAL 30 DAY) ORDER BY started_at;"
                    }
                ],
                instructions: {
                    en: "Display `user_id`, `plan_name`, and `started_at` from `subscriptions` for all subscriptions started within 30 days prior to March 1, 2024, ordered chronologically.",
                    id: "Tampilkan `user_id`, `plan_name`, dan `started_at` dari `subscriptions` untuk semua langganan yang dimulai dalam kurun waktu 30 hari sebelum 1 Maret 2024, diurutkan secara kronologis."
                },
                expected_query: "SELECT user_id, plan_name, started_at FROM subscriptions WHERE started_at >= DATE_SUB('2024-03-01 00:00:00', INTERVAL 30 DAY) ORDER BY started_at;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },
    {
        id: 434,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Next Billing Date Projection with Date Addition (Var #4)",
            id: "Proyeksi Tanggal Tagihan Berikutnya dengan Penjumlahan Waktu (Latihan #4)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Adding time intervals to an existing timestamp projects future schedule occurrences such as subscription renewals or invoice deadlines.\n\nEngine Processing Behavior: The engine adds the interval offset to each row's timestamp field during the projection phase.\n\nBest Practices & Gotchas: Adding calendar months automatically handles end-of-month day adjustments (e.g., January 31 plus 1 month rolls to February 28 or 29).",
            id: "Analogi Konseptual: Menambahkan interval waktu ke timestamp memproyeksikan jadwal masa depan seperti perpanjangan langganan atau jatuh tempo tagihan.\n\nCara Kerja Database Engine: Database engine menambahkan offset interval ke nilai timestamp setiap baris selama tahap proyeksi data.\n\nBest Practices & Catatan Penting: Penambahan bulan kalender secara otomatis menyesuaikan batas akhir bulan yang berbeda (misalnya 31 Januari ditambah 1 bulan disesuaikan ke 28 atau 29 Februari)."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Date addition with interval",
                    id: "Penjumlahan tanggal dengan interval"
                },
                code: "SELECT user_id, started_at, started_at + INTERVAL '1 month' AS next_billing FROM subscriptions ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display `user_id`, `started_at`, and the projected next billing date one month after `started_at` aliased as `next_billing` from `subscriptions`, ordered by `id`.",
            id: "Tampilkan `user_id`, `started_at`, dan proyeksi tanggal tagihan berikutnya satu bulan setelah `started_at` dengan alias `next_billing` dari `subscriptions`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT user_id, started_at, started_at + INTERVAL '1 month' AS next_billing FROM subscriptions ORDER BY id;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Next Billing Date Projection with DATE_ADD (Var #4)",
                    id: "Proyeksi Tanggal Tagihan Berikutnya dengan DATE_ADD (Latihan #4)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: DATE_ADD projects future recurrence dates by advancing timestamps by explicit calendar units.\n\nEngine Processing Behavior: The engine evaluates DATE_ADD per projected row, advancing the date component by the designated unit.\n\nBest Practices & Gotchas: Specify explicit date units such as MONTH or DAY.",
                    id: "Analogi Konseptual: Fungsi DATE_ADD memproyeksikan tanggal masa depan dengan memajukan nilai waktu sesuai satuan kalender yang ditentukan.\n\nCara Kerja Database Engine: Database engine mengevaluasi fungsi DATE_ADD untuk setiap baris, memajukan nilai tanggal sesuai unit yang ditentukan.\n\nBest Practices & Catatan Penting: Tentukan satuan waktu secara eksplisit seperti MONTH atau DAY."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL DATE_ADD function",
                            id: "Fungsi DATE_ADD pada MySQL"
                        },
                        code: "SELECT user_id, started_at, DATE_ADD(started_at, INTERVAL 1 MONTH) AS next_billing FROM subscriptions ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Display `user_id`, `started_at`, and the projected next billing date one month after `started_at` aliased as `next_billing` from `subscriptions`, ordered by `id`.",
                    id: "Tampilkan `user_id`, `started_at`, dan proyeksi tanggal tagihan berikutnya satu bulan setelah `started_at` dengan alias `next_billing` dari `subscriptions`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT user_id, started_at, DATE_ADD(started_at, INTERVAL 1 MONTH) AS next_billing FROM subscriptions ORDER BY id;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },
    {
        id: 435,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Hour-Level Activity Truncation (Var #5)",
            id: "Pemotongan Aktivitas ke Tingkat Jam (Latihan #5)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Snapping timestamps to the hour creates consistent time slots for traffic and activity analysis.\n\nEngine Processing Behavior: The date truncation scalar function zeroes minutes and seconds, aggregating events into hourly blocks.\n\nBest Practices & Gotchas: Truncating to the hour is standard practice for telemetry and server load metrics aggregation.",
            id: "Analogi Konseptual: Menyelaraskan waktu ke batas jam menciptakan slot waktu seragam untuk analisis beban dan aktivitas sistem.\n\nCara Kerja Database Engine: Fungsi pemotongan tanggal mereset menit dan detik menjadi nol, mengelompokkan data ke dalam blok per jam.\n\nBest Practices & Catatan Penting: Pemotongan ke level jam merupakan standar industri untuk analisis telemetri dan metrik server."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Date truncation to hour",
                    id: "Pemotongan tanggal ke jam"
                },
                code: "SELECT DATE_TRUNC('hour', started_at) AS activity_hour, COUNT(*) AS session_count FROM subscriptions GROUP BY DATE_TRUNC('hour', started_at) ORDER BY activity_hour;"
            }
        ],
        instructions: {
            en: "Calculate the count of sessions aliased as `session_count` grouped by each hour start of `started_at` aliased as `activity_hour` from `subscriptions`, ordered chronologically.",
            id: "Hitung jumlah sesi dengan alias `session_count` yang dikelompokkan berdasarkan awal jam dari `started_at` dengan alias `activity_hour` dari tabel `subscriptions`, diurutkan secara kronologis."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT DATE_TRUNC('hour', started_at) AS activity_hour, COUNT(*) AS session_count FROM subscriptions GROUP BY DATE_TRUNC('hour', started_at) ORDER BY activity_hour;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Hour-Level Activity Truncation with DATE_FORMAT (Var #5)",
                    id: "Pemotongan Aktivitas ke Tingkat Jam dengan DATE_FORMAT (Latihan #5)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Formatting timestamps to the hour creates uniform hourly time slots.\n\nEngine Processing Behavior: The engine formats the date string to hour precision and aggregates records sharing the same hour.\n\nBest Practices & Gotchas: Format strings evaluate per row; ensure date columns contain valid temporal strings.",
                    id: "Analogi Konseptual: Memformat timestamp ke tingkat jam menciptakan slot waktu per jam yang seragam.\n\nCara Kerja Database Engine: Database engine memformat waktu hingga presisi jam dan mengelompokkan baris pada jam yang sama.\n\nBest Practices & Catatan Penting: Format tanggal dievaluasi per baris; pastikan kolom tanggal memiliki format yang valid."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL date formatting to hour bucket",
                            id: "Pemformatan tanggal jam pada MySQL"
                        },
                        code: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d %H:00:00') AS activity_hour, COUNT(*) AS session_count FROM subscriptions GROUP BY activity_hour ORDER BY activity_hour;"
                    }
                ],
                instructions: {
                    en: "Calculate the count of sessions aliased as `session_count` grouped by each hour start of `started_at` aliased as `activity_hour` from `subscriptions`, ordered chronologically.",
                    id: "Hitung jumlah sesi dengan alias `session_count` yang dikelompokkan berdasarkan awal jam dari `started_at` dengan alias `activity_hour` dari tabel `subscriptions`, diurutkan secara kronologis."
                },
                expected_query: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d %H:00:00') AS activity_hour, COUNT(*) AS session_count FROM subscriptions GROUP BY activity_hour ORDER BY activity_hour;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },
    {
        id: 436,
        moduleId: 4,
        categorySlot: 6,
        title: {
            en: "Trial Expiration Calculation with Day Intervals (Var #6)",
            id: "Kalkulasi Masa Berakhir Uji Coba dengan Interval Hari (Latihan #6)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Adding day intervals calculates fixed trial windows (e.g. 14-day trials) relative to each user's signup moment.\n\nEngine Processing Behavior: The engine advances each timestamp by the exact day offset requested during scalar projection.\n\nBest Practices & Gotchas: Combining intervals with timezone-aware timestamps guarantees accurate deadline calculation across regions.",
            id: "Analogi Konseptual: Menambahkan interval hari menghitung masa uji coba gratis (misalnya uji coba 14 hari) relatif terhadap waktu pendaftaran setiap pengguna.\n\nCara Kerja Database Engine: Database engine memajukan timestamp sebesar offset hari yang ditentukan selama tahap proyeksi skalar.\n\nBest Practices & Catatan Penting: Menggabungkan interval dengan timestamp memastikan perhitungan batas waktu yang akurat di berbagai zona waktu."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Date addition for trial end",
                    id: "Penjumlahan tanggal untuk akhir masa uji coba"
                },
                code: "SELECT user_id, plan_name, started_at + INTERVAL '14 days' AS trial_end FROM subscriptions ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display `user_id`, `plan_name`, and the trial expiration date 14 days after `started_at` aliased as `trial_end` from `subscriptions`, ordered by `id`.",
            id: "Tampilkan `user_id`, `plan_name`, dan tanggal berakhir masa uji coba 14 hari setelah `started_at` dengan alias `trial_end` dari `subscriptions`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4TemporalSeed",
        expected_query: "SELECT user_id, plan_name, started_at + INTERVAL '14 days' AS trial_end FROM subscriptions ORDER BY id;",
        starterQuery: "SELECT * FROM subscriptions;",
        table_names: ["subscriptions"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Trial Expiration Calculation with DATE_ADD (Var #6)",
                    id: "Kalkulasi Masa Berakhir Uji Coba dengan DATE_ADD (Latihan #6)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: DATE_ADD with DAY units projects fixed-duration trial windows.\n\nEngine Processing Behavior: The engine computes the trial end timestamp by adding the designated days to the start timestamp.\n\nBest Practices & Gotchas: Explicitly specify DAY as the interval unit.",
                    id: "Analogi Konseptual: Fungsi DATE_ADD dengan unit DAY memproyeksikan batas akhir periode uji coba.\n\nCara Kerja Database Engine: Database engine menghitung batas waktu uji coba dengan menambahkan hari yang ditentukan ke tanggal mulai.\n\nBest Practices & Catatan Penting: Tentukan DAY secara eksplisit sebagai unit interval."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL DATE_ADD trial end calculation",
                            id: "Kalkulasi akhir uji coba DATE_ADD pada MySQL"
                        },
                        code: "SELECT user_id, plan_name, DATE_ADD(started_at, INTERVAL 14 DAY) AS trial_end FROM subscriptions ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Display `user_id`, `plan_name`, and the trial expiration date 14 days after `started_at` aliased as `trial_end` from `subscriptions`, ordered by `id`.",
                    id: "Tampilkan `user_id`, `plan_name`, dan tanggal berakhir masa uji coba 14 hari setelah `started_at` dengan alias `trial_end` dari `subscriptions`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT user_id, plan_name, DATE_ADD(started_at, INTERVAL 14 DAY) AS trial_end FROM subscriptions ORDER BY id;",
                starterQuery: "SELECT * FROM subscriptions;"
            }
        }
    },

    // Slot 7: Explicit Type Casting & String Manipulation
    {
        id: 437,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "Explicit Numeric Type Casting (Var #1)",
            id: "Konversi Tipe Data Numerik Eksplisit (Latihan #1)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Type casting converts data stored in one representation (such as text received from an API) into a native numeric format ready for arithmetic calculation.\n\nEngine Processing Behavior: The SQL parser converts string byte sequences into structured numeric binary representation, verifying digit formatting.\n\nBest Practices & Gotchas: Avoid casting non-numeric strings directly; unvalidated text causes runtime conversion exceptions.",
            id: "Analogi Konseptual: Type casting mengubah data yang tersimpan dalam format teks (misalnya data masukan dari API) menjadi format numerik asli yang siap untuk kalkulasi matematis.\n\nCara Kerja Database Engine: SQL parser mengonversi urutan karakter string menjadi representasi biner angka terstruktur dan memverifikasi format angka.\n\nBest Practices & Catatan Penting: Hindari melakukan casting pada string yang mungkin berisi karakter non-angka karena dapat memicu exception konversi saat query dijalankan."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Explicit numeric casting",
                    id: "Casting numerik eksplisit"
                },
                code: "SELECT product_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display `product_code` and `raw_price` converted to numeric format aliased as `price` from `products_pricing`, ordered by `id`.",
            id: "Tampilkan `product_code` dan `raw_price` yang dikonversi ke format numerik dengan alias `price` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT product_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Explicit Numeric Casting with DECIMAL (Var #1)",
                    id: "Casting Numerik Eksplisit dengan DECIMAL (Latihan #1)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Casting text to DECIMAL converts string prices into precise fixed-point numbers.\n\nEngine Processing Behavior: The MySQL engine parses the text and constructs fixed-point decimal values.\n\nBest Practices & Gotchas: Specify explicit precision and scale in DECIMAL casting.",
                    id: "Analogi Konseptual: Mengubah teks menjadi tipe DECIMAL mengonversi harga string menjadi angka fixed-point yang presisi.\n\nCara Kerja Database Engine: Database engine MySQL membaca teks dan membentuk nilai desimal fixed-point berpresisi tinggi.\n\nBest Practices & Catatan Penting: Tentukan presisi dan skala secara eksplisit saat melakukan casting ke DECIMAL."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL CAST to DECIMAL",
                            id: "Casting ke DECIMAL pada MySQL"
                        },
                        code: "SELECT product_code, CAST(raw_price AS DECIMAL(10,2)) AS price FROM products_pricing ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Display `product_code` and `raw_price` converted to numeric format aliased as `price` from `products_pricing`, ordered by `id`.",
                    id: "Tampilkan `product_code` dan `raw_price` yang dikonversi ke format numerik dengan alias `price` dari `products_pricing`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT product_code, CAST(raw_price AS DECIMAL(10,2)) AS price FROM products_pricing ORDER BY id;",
                starterQuery: "SELECT * FROM products_pricing;"
            }
        }
    },
    {
        id: 438,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "String Whitespace Trimming (Var #2)",
            id: "Pembersihan Spasi String dengan TRIM (Latihan #2)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Trimming text removes superfluous leading and trailing whitespace introduced during data entry, ensuring clean data hygiene.\n\nEngine Processing Behavior: The string scalar evaluation function strips leading and trailing space characters before streaming the string to the result pipeline.\n\nBest Practices & Gotchas: TRIM operates on outer edges; use REPLACE to eliminate internal whitespace.",
            id: "Analogi Konseptual: Pembersihan teks dengan TRIM menghapus spasi berlebih di awal dan akhir string akibat kesalahan input data, menjaga higienitas data sistem.\n\nCara Kerja Database Engine: Fungsi skalar string membaca urutan karakter dan memangkas karakter spasi di awal dan akhir sebelum meneruskan hasilnya ke pipeline output.\n\nBest Practices & Catatan Penting: Fungsi TRIM hanya membersihkan bagian ujung terluar string; gunakan REPLACE jika ingin menghilangkan spasi di bagian tengah teks."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "String trimming function",
                    id: "Fungsi pembersih spasi TRIM"
                },
                code: "SELECT TRIM(product_code) AS clean_code, TRIM(notes) AS clean_notes FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display `product_code` with whitespace removed aliased as `clean_code` and `notes` with whitespace removed aliased as `clean_notes` from `products_pricing`, ordered by `id`.",
            id: "Tampilkan `product_code` tanpa spasi berlebih dengan alias `clean_code` dan `notes` tanpa spasi berlebih dengan alias `clean_notes` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT TRIM(product_code) AS clean_code, TRIM(notes) AS clean_notes FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"]
    },
    {
        id: 439,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "String Concatenation with Separator (Var #3)",
            id: "Penggabungan String dengan Separator (Latihan #3)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Concatenation joins separate text attributes into a unified descriptive label for display in user interfaces.\n\nEngine Processing Behavior: The concatenation function combines input strings in left-to-right order, allocating memory buffers for the combined string.\n\nBest Practices & Gotchas: Standard SQL concatenation with NULL produces NULL unless CONCAT or COALESCE is used.",
            id: "Analogi Konseptual: Penggabungan string menyatukan atribut teks yang terpisah menjadi satu label deskriptif yang rapi untuk ditampilkan pada antarmuka pengguna.\n\nCara Kerja Database Engine: Fungsi penggabungan string menyatukan string masukan secara berurutan dan mengalokasikan buffer memori untuk string hasil gabungan.\n\nBest Practices & Catatan Penting: Operator penggabungan standar akan menghasilkan nilai NULL jika salah satu komponen bernilai NULL; gunakan fungsi CONCAT untuk penanganan otomatis nilai NULL."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "String concatenation",
                    id: "Penggabungan string dengan CONCAT"
                },
                code: "SELECT CONCAT(TRIM(product_code), ' - ', TRIM(notes)) AS display_label FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display a combined label joining the trimmed `product_code`, a hyphen separator, and trimmed `notes` aliased as `display_label` from `products_pricing`, ordered by `id`.",
            id: "Tampilkan label gabungan dari `product_code` yang dibersihkan, pemisah tanda strip, dan `notes` yang dibersihkan dengan alias `display_label` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT CONCAT(TRIM(product_code), ' - ', TRIM(notes)) AS display_label FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"]
    },
    {
        id: 440,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "Fixed-Length Substring Extraction (Var #4)",
            id: "Ekstraksi Substring Berdasarkan Posisi Karakter (Latihan #4)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Substring extraction slices structured codes (such as product categories or country codes) out of composite identifiers.\n\nEngine Processing Behavior: The engine copies a fixed character slice starting from an explicit 1-based index.\n\nBest Practices & Gotchas: SQL string indexing is 1-based, unlike most programming languages which are 0-based.",
            id: "Analogi Konseptual: Ekstraksi substring memotong bagian tertentu dari kode terstruktur (seperti kode produk atau prefiks wilayah) dari sebuah string pengenal.\n\nCara Kerja Database Engine: Database engine menyalin potongan karakter dari posisi indeks berbasis 1 sesuai panjang karakter yang diminta.\n\nBest Practices & Catatan Penting: Indeks string pada SQL selalu dimulai dari angka 1 (1-based), berbeda dengan bahasa pemrograman yang umumnya dimulai dari 0."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Substring extraction",
                    id: "Ekstraksi substring teks"
                },
                code: "SELECT SUBSTRING(TRIM(product_code) FROM 1 FOR 4) AS prefix FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display the first 4 characters of the trimmed `product_code` aliased as `prefix` from `products_pricing`, ordered by `id`.",
            id: "Tampilkan 4 karakter pertama dari `product_code` yang telah dibersihkan spasi tepinya dengan alias `prefix` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT SUBSTRING(TRIM(product_code) FROM 1 FOR 4) AS prefix FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Fixed-Length Substring Extraction with Comma Syntax (Var #4)",
                    id: "Ekstraksi Substring dengan Format Posisi Koma (Latihan #4)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Substring extraction in MySQL slices prefixes from text using start and length offsets.\n\nEngine Processing Behavior: The engine evaluates SUBSTRING(text, start, length) on each projected row.\n\nBest Practices & Gotchas: SQL indices are 1-based.",
                    id: "Analogi Konseptual: Ekstraksi substring pada MySQL memotong awalan teks menggunakan posisi awal dan panjang karakter.\n\nCara Kerja Database Engine: Database engine mengevaluasi fungsi SUBSTRING(teks, posisi_awal, panjang) pada setiap baris proyeksi data.\n\nBest Practices & Catatan Penting: Indeks teks pada SQL berbasis 1."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL SUBSTRING syntax",
                            id: "Sintaks SUBSTRING pada MySQL"
                        },
                        code: "SELECT SUBSTRING(TRIM(product_code), 1, 4) AS prefix FROM products_pricing ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Display the first 4 characters of the trimmed `product_code` aliased as `prefix` from `products_pricing`, ordered by `id`.",
                    id: "Tampilkan 4 karakter pertama dari `product_code` yang telah dibersihkan spasi tepinya dengan alias `prefix` dari `products_pricing`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT SUBSTRING(TRIM(product_code), 1, 4) AS prefix FROM products_pricing ORDER BY id;",
                starterQuery: "SELECT * FROM products_pricing;"
            }
        }
    },
    {
        id: 441,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "Discounted Calculation with Numeric Casting (Var #5)",
            id: "Kalkulasi Diskon dengan Casting Numerik (Latihan #5)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Casting text inputs to numerics allows dynamic percentage discount equations to compute without string concatenation errors.\n\nEngine Processing Behavior: Both operands are parsed into binary decimal representations and processed in the arithmetic arithmetic unit.\n\nBest Practices & Gotchas: Use parentheses around arithmetic terms to ensure unambiguous operator precedence.",
            id: "Analogi Konseptual: Mengubah teks harga dan diskon ke bentuk angka memungkinkan perhitungan potongan harga berjalan tanpa error tipe data.\n\nCara Kerja Database Engine: Kedua operand dikonversi menjadi representasi biner desimal dan dihitung pada unit aritmetika database.\n\nBest Practices & Catatan Penting: Gunakan tanda kurung pada operasi matematika untuk memastikan urutan evaluasi operator berjalan sesuai rencana."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Calculated numeric expression with casting",
                    id: "Kalkulasi ekspresi numerik dengan casting"
                },
                code: "SELECT TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) * (1 - CAST(discount_rate AS NUMERIC(10,2))) AS discounted_price FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Display the trimmed `product_code` aliased as `clean_code` and the final price after subtracting the discount rate aliased as `discounted_price` from `products_pricing`, ordered by `id`.",
            id: "Tampilkan `product_code` yang dibersihkan dengan alias `clean_code` dan harga akhir setelah dipotong diskon dengan alias `discounted_price` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) * (1 - CAST(discount_rate AS NUMERIC(10,2))) AS discounted_price FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Discounted Calculation with DECIMAL Casting (Var #5)",
                    id: "Kalkulasi Diskon dengan Casting DECIMAL (Latihan #5)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Casting to DECIMAL ensures exact mathematical precision in financial discounting calculations.\n\nEngine Processing Behavior: The MySQL engine computes the discounted formula using fixed-point arithmetic.\n\nBest Practices & Gotchas: Use fixed-point types for currency calculations rather than floating point.",
                    id: "Analogi Konseptual: Casting ke tipe DECIMAL memastikan presisi kalkulasi diskon finansial tetap akurat.\n\nCara Kerja Database Engine: Database engine MySQL menghitung formula diskon menggunakan aritmetika fixed-point.\n\nBest Practices & Catatan Penting: Gunakan tipe fixed-point untuk nilai mata uang guna menghindari pembulatan float yang tidak presisi."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL DECIMAL arithmetic",
                            id: "Aritmetika DECIMAL pada MySQL"
                        },
                        code: "SELECT TRIM(product_code) AS clean_code, CAST(raw_price AS DECIMAL(10,2)) * (1 - CAST(discount_rate AS DECIMAL(10,2))) AS discounted_price FROM products_pricing ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Display the trimmed `product_code` aliased as `clean_code` and the final price after subtracting the discount rate aliased as `discounted_price` from `products_pricing`, ordered by `id`.",
                    id: "Tampilkan `product_code` yang dibersihkan dengan alias `clean_code` dan harga akhir setelah dipotong diskon dengan alias `discounted_price` dari `products_pricing`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT TRIM(product_code) AS clean_code, CAST(raw_price AS DECIMAL(10,2)) * (1 - CAST(discount_rate AS DECIMAL(10,2))) AS discounted_price FROM products_pricing ORDER BY id;",
                starterQuery: "SELECT * FROM products_pricing;"
            }
        }
    },
    {
        id: 442,
        moduleId: 4,
        categorySlot: 7,
        title: {
            en: "Numeric Identifier Extraction with Compound Functions (Var #6)",
            id: "Ekstraksi Pengenal Numerik dengan Fungsi Majemuk (Latihan #6)"
        },
        conceptExplanation: {
            en: "Conceptual Analogy: Chaining string trimming, substring slicing, and integer casting extracts pure numerical sequences from formatted code strings (such as converting 'PROD-001' into the integer 1).\n\nEngine Processing Behavior: The expression evaluates from the inside out: whitespace is stripped, digits are sliced, and the final text token is parsed as a binary integer.\n\nBest Practices & Gotchas: Verify that the sliced substring strictly contains numeric digits before executing an integer cast.",
            id: "Analogi Konseptual: Menggabungkan fungsi pembersihan spasi, pemotongan substring, dan casting integer mengekstrak angka murni dari string kode berformat (misalnya mengubah 'PROD-001' menjadi integer 1).\n\nCara Kerja Database Engine: Ekspresi dievaluasi dari bagian terdalam: spasi dibersihkan, karakter angka dipotong, lalu token teks dikonversi menjadi representasi integer biner.\n\nBest Practices & Catatan Penting: Pastikan potongan substring murni berisi digit angka sebelum menjalankan fungsi casting integer."
        },
        syntaxPatterns: [
            {
                label: {
                    en: "Compound substring and integer casting",
                    id: "Fungsi gabungan substring dan casting integer"
                },
                code: "SELECT CAST(SUBSTRING(TRIM(product_code) FROM 6 FOR 3) AS INT) AS code_number FROM products_pricing ORDER BY id;"
            }
        ],
        instructions: {
            en: "Extract the 3 numeric digits starting at character 6 from the trimmed `product_code` converted to integer format aliased as `code_number` from `products_pricing`, ordered by `id`.",
            id: "Ekstrak 3 digit angka mulai dari karakter ke-6 dari `product_code` yang telah dibersihkan lalu ubah ke format integer dengan alias `code_number` dari `products_pricing`, diurutkan berdasarkan `id`."
        },
        seed_sql: "mod4CastingSeed",
        expected_query: "SELECT CAST(SUBSTRING(TRIM(product_code) FROM 6 FOR 3) AS INT) AS code_number FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;",
        table_names: ["products_pricing"],
        engineOverrides: {
            mysql: {
                title: {
                    en: "Numeric Identifier Extraction with SIGNED Casting (Var #6)",
                    id: "Ekstraksi Pengenal Numerik dengan Casting SIGNED (Latihan #6)"
                },
                conceptExplanation: {
                    en: "Conceptual Analogy: Chaining string functions and casting to SIGNED extracts numerical identifiers in MySQL.\n\nEngine Processing Behavior: The engine slices digits using SUBSTRING and converts the text into a SIGNED integer value.\n\nBest Practices & Gotchas: MySQL uses SIGNED or UNSIGNED for integer casting.",
                    id: "Analogi Konseptual: Menggabungkan fungsi string dan casting ke tipe SIGNED mengekstrak pengenal numerik pada MySQL.\n\nCara Kerja Database Engine: Database engine memotong angka menggunakan fungsi SUBSTRING lalu mengonversi teks menjadi integer bertipe SIGNED.\n\nBest Practices & Catatan Penting: MySQL menggunakan kata kunci SIGNED atau UNSIGNED untuk casting ke tipe integer."
                },
                syntaxPatterns: [
                    {
                        label: {
                            en: "MySQL SIGNED integer casting",
                            id: "Casting integer SIGNED pada MySQL"
                        },
                        code: "SELECT CAST(SUBSTRING(TRIM(product_code), 6, 3) AS SIGNED) AS code_number FROM products_pricing ORDER BY id;"
                    }
                ],
                instructions: {
                    en: "Extract the 3 numeric digits starting at character 6 from the trimmed `product_code` converted to integer format aliased as `code_number` from `products_pricing`, ordered by `id`.",
                    id: "Ekstrak 3 digit angka mulai dari karakter ke-6 dari `product_code` yang telah dibersihkan lalu ubah ke format integer dengan alias `code_number` dari `products_pricing`, diurutkan berdasarkan `id`."
                },
                expected_query: "SELECT CAST(SUBSTRING(TRIM(product_code), 6, 3) AS SIGNED) AS code_number FROM products_pricing ORDER BY id;",
                starterQuery: "SELECT * FROM products_pricing;"
            }
        }
    }
];

console.log('Module 4 new questions count:', m4NewQuestions.length);
