const fs = require('fs');

const m4Questions = [
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
              en: "MySQL monthly date format grouping",
              id: "Pengelompokan tanggal bulanan MySQL"
            },
            code: "SELECT DATE_FORMAT(started_at, '%Y-%m-01 00:00:00') AS month_start, SUM(monthly_fee) AS total_fee FROM subscriptions GROUP BY month_start ORDER BY month_start;"
          }
        ],
        instructions: {
          en: "Calculate the total monthly fee grouped by the month start date of `started_at` aliased as `month_start` formatted to the first day of the month from `subscriptions`, ordered chronologically.",
          id: "Hitung total biaya bulanan yang dikelompokkan berdasarkan tanggal awal bulan dari `started_at` dengan format hari pertama setiap bulan beralias `month_start` dari tabel `subscriptions`, diurutkan secara kronologis."
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
      en: "Daily Subscription Signup Counter (Var #2)",
      id: "Penghitung Pendaftaran Langganan Harian (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Truncating to days strips away time-of-day fluctuations, creating a daily calendar bucket for counting daily user actions.\n\nEngine Processing Behavior: The planner zeroes the hours, minutes, and seconds from the timestamp, enabling straightforward bucket aggregation.\n\nBest Practices & Gotchas: Ensure timezones are normalized before truncating to days to prevent unexpected calendar shifts.",
      id: "Analogi Konseptual: Pemotongan ke level hari membuang informasi jam dan menit, menghasilkan wadah tanggal harian untuk menghitung aktivitas pengguna setiap hari.\n\nCara Kerja Database Engine: Planner mengatur komponen jam, menit, dan detik menjadi nol pada setiap timestamp, memungkinkan agregasi hitungan per hari secara langsung.\n\nBest Practices & Catatan Penting: Pastikan timezone telah diselaraskan sebelum pemotongan tanggal untuk menghindari pergeseran hari yang tidak diinginkan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Date truncation to day",
          id: "Pemotongan tanggal ke awal hari"
        },
        code: "SELECT DATE_TRUNC('day', started_at) AS day_bucket, COUNT(*) AS new_subs FROM subscriptions GROUP BY DATE_TRUNC('day', started_at) ORDER BY day_bucket;"
      }
    ],
    instructions: {
      en: "Count new subscriptions grouped by the day start date of `started_at` aliased as `day_bucket` and `new_subs` from `subscriptions`, ordered chronologically.",
      id: "Hitung langganan baru yang dikelompokkan berdasarkan tanggal awal hari dari `started_at` beralias `day_bucket` dan total beralias `new_subs` dari tabel `subscriptions`, diurutkan secara kronologis."
    },
    seed_sql: "mod4TemporalSeed",
    expected_query: "SELECT DATE_TRUNC('day', started_at) AS day_bucket, COUNT(*) AS new_subs FROM subscriptions GROUP BY DATE_TRUNC('day', started_at) ORDER BY day_bucket;",
    starterQuery: "SELECT * FROM subscriptions;",
    table_names: ["subscriptions"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Daily Subscription Signup Counter with DATE_FORMAT (Var #2)",
          id: "Penghitung Pendaftaran Langganan Harian dengan DATE_FORMAT (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Formatting timestamps to daily midnight boundaries consolidates all intra-day events into a single daily bucket.\n\nEngine Processing Behavior: Converts the timestamp to a year-month-day string at midnight and aggregates the resulting rows.\n\nBest Practices & Gotchas: Using string representations of dates can hinder index utilization if used in search filters.",
          id: "Analogi Konseptual: Memformat timestamp ke batas tengah malam harian menggabungkan seluruh aktivitas dalam satu hari ke dalam satu wadah harian.\n\nCara Kerja Database Engine: Mengonversi timestamp ke string tahun-bulan-tanggal jam 00:00:00 dan mengelompokkan baris berdasarkan nilai tersebut.\n\nBest Practices & Catatan Penting: Representasi string dari tanggal dapat menghambat pemanfaatan indeks jika digunakan pada filter pencarian."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL daily date format grouping",
              id: "Pengelompokan tanggal harian MySQL"
            },
            code: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d 00:00:00') AS day_bucket, COUNT(*) AS new_subs FROM subscriptions GROUP BY day_bucket ORDER BY day_bucket;"
          }
        ],
        instructions: {
          en: "Count new subscriptions grouped by the day start date of `started_at` formatted to midnight aliased as `day_bucket` and `new_subs` from `subscriptions`, ordered chronologically.",
          id: "Hitung langganan baru yang dikelompokkan berdasarkan tanggal awal hari dari `started_at` dengan format jam 00:00:00 beralias `day_bucket` dan total beralias `new_subs` dari tabel `subscriptions`, diurutkan secara kronologis."
        },
        expected_query: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d 00:00:00') AS day_bucket, COUNT(*) AS new_subs FROM subscriptions GROUP BY day_bucket ORDER BY day_bucket;",
        starterQuery: "SELECT * FROM subscriptions;"
      }
    }
  },
  {
    id: 433,
    moduleId: 4,
    categorySlot: 6,
    title: {
      en: "Filtering Recent Subscriptions with Interval Arithmetic (Var #3)",
      id: "Filter Langganan Terbaru dengan Aritmatika Interval (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Interval arithmetic acts like subtracting a tape measure of time from a reference point to define an active rolling time window.\n\nEngine Processing Behavior: The engine calculates the cutoff timestamp once and scans rows comparing native timestamp values efficiently.\n\nBest Practices & Gotchas: Keeping the column on one side of the comparison operator preserves index usability on that column.",
      id: "Analogi Konseptual: Aritmatika interval bekerja seperti mengurangi pita pengukur waktu dari titik acuan untuk mendefinisikan jendela waktu berjalan yang aktif.\n\nCara Kerja Database Engine: Engine menghitung batas waktu pemotongan satu kali dan membandingkan nilai timestamp secara efisien tanpa komputasi berulang.\n\nBest Practices & Catatan Penting: Pertahankan kolom target di satu sisi operator perbandingan agar index scan tetap dapat dimanfaatkan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Timestamp interval subtraction",
          id: "Pengurangan interval pada timestamp"
        },
        code: "SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at;"
      }
    ],
    instructions: {
      en: "Find all `subscriptions` starting on or after thirty days prior to March 1, 2024, displaying `id`, `user_id`, `plan_name`, and `started_at`, ordered by `started_at`.",
      id: "Cari semua data `subscriptions` yang dimulai pada atau setelah tiga puluh hari sebelum 1 Maret 2024, menampilkan kolom `id`, `user_id`, `plan_name`, dan `started_at`, diurutkan berdasarkan `started_at`."
    },
    seed_sql: "mod4TemporalSeed",
    expected_query: "SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= '2024-03-01'::timestamp - INTERVAL '30 days' ORDER BY started_at;",
    starterQuery: "SELECT * FROM subscriptions;",
    table_names: ["subscriptions"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Filtering Recent Subscriptions with DATE_SUB (Var #3)",
          id: "Filter Langganan Terbaru dengan DATE_SUB (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Subtracting interval days from a fixed date sets a dynamic boundary for filtering chronological records.\n\nEngine Processing Behavior: The date subtraction function computes the threshold at plan time and filters matching rows.\n\nBest Practices & Gotchas: Avoid wrapping the filtered column inside functions so range scans remain possible.",
          id: "Analogi Konseptual: Mengurangi interval hari dari tanggal referensi menetapkan batas waktu dinamis untuk menyaring catatan waktu.\n\nCara Kerja Database Engine: Fungsi pengurangan tanggal menghitung ambang batas pada tahap perencanaan dan memfilter baris yang memenuhi syarat.\n\nBest Practices & Catatan Penting: Hindari membungkus kolom yang difilter di dalam fungsi agar range scan tetap dapat berjalan optimal."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL date subtraction filter",
              id: "Filter pengurangan tanggal MySQL"
            },
            code: "SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= DATE_SUB('2024-03-01 00:00:00', INTERVAL 30 DAY) ORDER BY started_at;"
          }
        ],
        instructions: {
          en: "Find all `subscriptions` starting on or after thirty days prior to March 1, 2024, displaying `id`, `user_id`, `plan_name`, and `started_at`, ordered by `started_at`.",
          id: "Cari semua data `subscriptions` yang dimulai pada atau setelah tiga puluh hari sebelum 1 Maret 2024, menampilkan kolom `id`, `user_id`, `plan_name`, dan `started_at`, diurutkan berdasarkan `started_at`."
        },
        expected_query: "SELECT id, user_id, plan_name, started_at FROM subscriptions WHERE started_at >= DATE_SUB('2024-03-01 00:00:00', INTERVAL 30 DAY) ORDER BY started_at;",
        starterQuery: "SELECT * FROM subscriptions;"
      }
    }
  },
  {
    id: 434,
    moduleId: 4,
    categorySlot: 6,
    title: {
      en: "Projecting Monthly Renewal Dates with Interval Addition (Var #4)",
      id: "Memproyeksikan Tanggal Perpanjangan Bulanan dengan Penjumlahan Interval (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Adding an interval to a start date projects forward to scheduled milestones, such as finding subscription renewal dates.\n\nEngine Processing Behavior: The engine executes calendar arithmetic on each row, taking month day boundaries and leap years into account.\n\nBest Practices & Gotchas: Adding calendar months adjusts to month-end limits automatically (such as Jan 31 + 1 month resolving to Feb 28/29).",
      id: "Analogi Konseptual: Menambahkan interval ke tanggal mulai memproyeksikan jadwal berikutnya ke masa depan, seperti menentukan tanggal perpanjangan langganan.\n\nCara Kerja Database Engine: Engine menjalankan aritmatika kalender pada setiap baris, memperhitungkan batasan jumlah hari tiap bulan dan tahun kabisat.\n\nBest Practices & Catatan Penting: Penambahan bulan kalender secara otomatis menyesuaikan batas akhir bulan (seperti 31 Januari + 1 bulan menjadi 28/29 Februari)."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Timestamp interval addition",
          id: "Penambahan interval pada timestamp"
        },
        code: "SELECT id, user_id, plan_name, started_at + INTERVAL '1 month' AS renewal_date FROM subscriptions ORDER BY id;"
      }
    ],
    instructions: {
      en: "Project the renewal date exactly one month after `started_at` aliased as `renewal_date`, displaying `id`, `user_id`, `plan_name`, and `renewal_date` from `subscriptions`, ordered by `id`.",
      id: "Proyeksikan tanggal perpanjangan tepat satu bulan setelah `started_at` beralias `renewal_date`, menampilkan kolom `id`, `user_id`, `plan_name`, dan `renewal_date` dari tabel `subscriptions`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4TemporalSeed",
    expected_query: "SELECT id, user_id, plan_name, started_at + INTERVAL '1 month' AS renewal_date FROM subscriptions ORDER BY id;",
    starterQuery: "SELECT * FROM subscriptions;",
    table_names: ["subscriptions"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Projecting Monthly Renewal Dates with DATE_ADD (Var #4)",
          id: "Memproyeksikan Tanggal Perpanjangan Bulanan dengan DATE_ADD (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Calculating upcoming billing dates by pushing the signup timestamp forward by one calendar month.\n\nEngine Processing Behavior: The temporal addition function adds the interval unit to the timestamp and produces a new date string.\n\nBest Practices & Gotchas: Always store dates in standard format before performing date addition operations.",
          id: "Analogi Konseptual: Menghitung tanggal tagihan berikutnya dengan memajukan waktu pendaftaran sebesar satu bulan kalender.\n\nCara Kerja Database Engine: Fungsi penambahan temporal menambahkan unit interval ke timestamp dan menghasilkan string tanggal baru.\n\nBest Practices & Catatan Penting: Selalu simpan tanggal dalam format standar sebelum melakukan operasi penambahan tanggal."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL date addition projection",
              id: "Proyeksi penambahan tanggal MySQL"
            },
            code: "SELECT id, user_id, plan_name, DATE_ADD(started_at, INTERVAL 1 MONTH) AS renewal_date FROM subscriptions ORDER BY id;"
          }
        ],
        instructions: {
          en: "Project the renewal date exactly one month after `started_at` aliased as `renewal_date`, displaying `id`, `user_id`, `plan_name`, and `renewal_date` from `subscriptions`, ordered by `id`.",
          id: "Proyeksikan tanggal perpanjangan tepat satu bulan setelah `started_at` beralias `renewal_date`, menampilkan kolom `id`, `user_id`, `plan_name`, dan `renewal_date` dari tabel `subscriptions`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, user_id, plan_name, DATE_ADD(started_at, INTERVAL 1 MONTH) AS renewal_date FROM subscriptions ORDER BY id;",
        starterQuery: "SELECT * FROM subscriptions;"
      }
    }
  },
  {
    id: 435,
    moduleId: 4,
    categorySlot: 6,
    title: {
      en: "Hourly Traffic Granularity Truncation (Var #5)",
      id: "Pemotongan Granularitas Lalu Lintas Per Jam (Latihan #5)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Snapping exact transaction times to the top of the hour to spot peak traffic periods across the day.\n\nEngine Processing Behavior: The date truncation function strips minutes and seconds while keeping the calendar hour intact for grouping.\n\nBest Practices & Gotchas: Hourly grouping works best when timestamps are recorded in coordinated universal time.",
      id: "Analogi Konseptual: Menyelaraskan waktu transaksi ke awal setiap jam untuk menemukan periode puncak lalu lintas sepanjang hari.\n\nCara Kerja Database Engine: Fungsi pemotongan tanggal menghapus menit dan detik namun mempertahankan jam kalender untuk pengelompokan baris data.\n\nBest Practices & Catatan Penting: Pengelompokan per jam bekerja optimal saat timestamp dicatat dalam zona waktu terkoordinasi (UTC)."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Date truncation to hour",
          id: "Pemotongan tanggal ke awal jam"
        },
        code: "SELECT DATE_TRUNC('hour', started_at) AS hour_window, COUNT(*) AS sub_count FROM subscriptions GROUP BY DATE_TRUNC('hour', started_at) ORDER BY hour_window;"
      }
    ],
    instructions: {
      en: "Count subscriptions grouped by the start of each hour of `started_at` aliased as `hour_window` and `sub_count` from `subscriptions`, ordered chronologically.",
      id: "Hitung langganan yang dikelompokkan berdasarkan awal setiap jam dari `started_at` beralias `hour_window` dan total beralias `sub_count` dari tabel `subscriptions`, diurutkan secara kronologis."
    },
    seed_sql: "mod4TemporalSeed",
    expected_query: "SELECT DATE_TRUNC('hour', started_at) AS hour_window, COUNT(*) AS sub_count FROM subscriptions GROUP BY DATE_TRUNC('hour', started_at) ORDER BY hour_window;",
    starterQuery: "SELECT * FROM subscriptions;",
    table_names: ["subscriptions"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Hourly Traffic Granularity with DATE_FORMAT (Var #5)",
          id: "Granularitas Lalu Lintas Per Jam dengan DATE_FORMAT (Latihan #5)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Aligning timestamps to hour intervals to evaluate hourly system activity.\n\nEngine Processing Behavior: The formatting function converts timestamps to minute zero strings and aggregates matching rows.\n\nBest Practices & Gotchas: Hourly buckets provide fine-grained visibility into system load and operational throughput.",
          id: "Analogi Konseptual: Menyelaraskan timestamp ke interval jam untuk mengevaluasi aktivitas sistem setiap jam.\n\nCara Kerja Database Engine: Fungsi format mengonversi timestamp ke string dengan menit nol dan mengagregasi baris yang cocok.\n\nBest Practices & Catatan Penting: Wadah per jam memberikan visibilitas mendalam terhadap beban sistem dan throughput operasional."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL hourly format grouping",
              id: "Pengelompokan format per jam MySQL"
            },
            code: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d %H:00:00') AS hour_window, COUNT(*) AS sub_count FROM subscriptions GROUP BY hour_window ORDER BY hour_window;"
          }
        ],
        instructions: {
          en: "Count subscriptions grouped by the start of each hour of `started_at` formatted to the hour aliased as `hour_window` and `sub_count` from `subscriptions`, ordered chronologically.",
          id: "Hitung langganan yang dikelompokkan berdasarkan awal setiap jam dari `started_at` beralias `hour_window` dan total beralias `sub_count` dari tabel `subscriptions`, diurutkan secara kronologis."
        },
        expected_query: "SELECT DATE_FORMAT(started_at, '%Y-%m-%d %H:00:00') AS hour_window, COUNT(*) AS sub_count FROM subscriptions GROUP BY hour_window ORDER BY hour_window;",
        starterQuery: "SELECT * FROM subscriptions;"
      }
    }
  },
  {
    id: 436,
    moduleId: 4,
    categorySlot: 6,
    title: {
      en: "Free Trial Expiration Window with 14-Day Interval (Var #6)",
      id: "Jendela Berakhirnya Uji Coba Gratis dengan Interval 14 Hari (Latihan #6)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Fast-forwarding a subscription calendar by a two-week trial window to determine when billing should commence.\n\nEngine Processing Behavior: The interval addition produces an exact timestamp exactly 14 calendar days after signup.\n\nBest Practices & Gotchas: Use interval arithmetic rather than integer second arithmetic to respect daylight saving time adjustments.",
      id: "Analogi Konseptual: Memajukan kalender langganan sebesar masa percobaan dua minggu untuk menentukan kapan penagihan pertama harus dimulai.\n\nCara Kerja Database Engine: Penambahan interval menghasilkan timestamp yang tepat 14 hari kalender setelah waktu pendaftaran.\n\nBest Practices & Catatan Penting: Gunakan aritmatika interval alih-alih konversi detik manual agar penyesuaian waktu kalender tetap akurat."
    },
    syntaxPatterns: [
      {
        label: {
          en: "14-day interval projection",
          id: "Proyeksi interval 14 hari"
        },
        code: "SELECT id, plan_name, started_at, started_at + INTERVAL '14 days' AS trial_end FROM subscriptions ORDER BY id;"
      }
    ],
    instructions: {
      en: "Calculate the trial end timestamp exactly 14 days after `started_at` aliased as `trial_end`, displaying `id`, `plan_name`, `started_at`, and `trial_end` from `subscriptions`, ordered by `id`.",
      id: "Hitung batas waktu akhir uji coba tepat 14 hari setelah `started_at` beralias `trial_end`, menampilkan kolom `id`, `plan_name`, `started_at`, dan `trial_end` dari tabel `subscriptions`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4TemporalSeed",
    expected_query: "SELECT id, plan_name, started_at, started_at + INTERVAL '14 days' AS trial_end FROM subscriptions ORDER BY id;",
    starterQuery: "SELECT * FROM subscriptions;",
    table_names: ["subscriptions"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Free Trial Expiration Window with DATE_ADD (Var #6)",
          id: "Jendela Berakhirnya Uji Coba Gratis dengan DATE_ADD (Latihan #6)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Pushing the signup timestamp forward by 14 days to compute free trial cutoff dates.\n\nEngine Processing Behavior: Computes the 14-day forward date for each subscription record.\n\nBest Practices & Gotchas: Date intervals preserve calendar day boundaries cleanly.",
          id: "Analogi Konseptual: Memajukan timestamp pendaftaran sebesar 14 hari untuk menghitung batas waktu berakhirnya uji coba gratis.\n\nCara Kerja Database Engine: Menghitung tanggal 14 hari ke depan untuk setiap baris data langganan.\n\nBest Practices & Catatan Penting: Interval tanggal menjaga konsistensi batas hari kalender secara rapi."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL 14-day date addition",
              id: "Penambahan tanggal 14 hari MySQL"
            },
            code: "SELECT id, plan_name, started_at, DATE_ADD(started_at, INTERVAL 14 DAY) AS trial_end FROM subscriptions ORDER BY id;"
          }
        ],
        instructions: {
          en: "Calculate the trial end timestamp exactly 14 days after `started_at` aliased as `trial_end`, displaying `id`, `plan_name`, `started_at`, and `trial_end` from `subscriptions`, ordered by `id`.",
          id: "Hitung batas waktu akhir uji coba tepat 14 hari setelah `started_at` beralias `trial_end`, menampilkan kolom `id`, `plan_name`, `started_at`, dan `trial_end` dari tabel `subscriptions`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, plan_name, started_at, DATE_ADD(started_at, INTERVAL 14 DAY) AS trial_end FROM subscriptions ORDER BY id;",
        starterQuery: "SELECT * FROM subscriptions;"
      }
    }
  },

  // Slot 7: Type Casting & String Manipulation
  {
    id: 437,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Numeric Casting and Whitespace Trimming (Var #1)",
      id: "Casting Numerik dan Pembersihan Spasi dengan TRIM (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Trimming peels away unwanted whitespace like peeling fruit, while casting converts raw textual numbers into precise mathematical currency values.\n\nEngine Processing Behavior: The string trimming scalar function discards surrounding space bytes, and the casting operator transforms text characters into exact numeric binary representations.\n\nBest Practices & Gotchas: Always cast textual financial fields to fixed-precision numerics before performing monetary arithmetic to prevent floating-point inaccuracies.",
      id: "Analogi Konseptual: Fungsi TRIM mengupas spasi liar di awal dan akhir teks seperti mengupas kulit buah, sedangkan casting mengubah teks angka mentah menjadi tipe data numerik presisi tinggi.\n\nCara Kerja Database Engine: Fungsi scalar TRIM membuang byte spasi di sekeliling teks, lalu operator casting memetakan string karakter ke format representasi biner numerik yang tepat.\n\nBest Practices & Catatan Penting: Selalu konversikan data finansial berbentuk teks ke tipe numeric dengan presisi tetap sebelum melakukan perhitungan aritmatika uang."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Numeric casting with TRIM",
          id: "Casting numerik dengan fungsi TRIM"
        },
        code: "SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Trim whitespace from `product_code` aliased as `clean_code` and cast `raw_price` to a numeric with two decimal places aliased as `price`, displaying `id`, `clean_code`, and `price` from `products_pricing`, ordered by `id`.",
      id: "Bersihkan spasi dari `product_code` beralias `clean_code` dan lakukan casting `raw_price` ke tipe numeric dengan dua desimal beralias `price`, menampilkan `id`, `clean_code`, dan `price` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS NUMERIC(10,2)) AS price FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Decimal Casting and Whitespace Trimming (Var #1)",
          id: "Casting Desimal dan Pembersihan Spasi dengan TRIM (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Stripping whitespace padding and casting text numbers into exact decimal currency amounts.\n\nEngine Processing Behavior: Trims space bytes from the string and parses the textual digits into a fixed-point decimal structure.\n\nBest Practices & Gotchas: Use DECIMAL rather than FLOAT for prices to avoid rounding discrepancies.",
          id: "Analogi Konseptual: Menghapus spasi berlebih dan mengonversi teks angka menjadi nilai desimal mata uang yang presisi.\n\nCara Kerja Database Engine: Memotong byte spasi dari string dan mem-parsing karakter angka ke struktur data desimal fixed-point.\n\nBest Practices & Catatan Penting: Gunakan tipe data DECIMAL alih-alih FLOAT untuk nilai harga guna mencegah ketidakakuratan pembulatan."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL decimal casting with TRIM",
              id: "Casting desimal MySQL dengan fungsi TRIM"
            },
            code: "SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS DECIMAL(10,2)) AS price FROM products_pricing ORDER BY id;"
          }
        ],
        instructions: {
          en: "Trim whitespace from `product_code` aliased as `clean_code` and cast `raw_price` to a decimal with two decimal places aliased as `price`, displaying `id`, `clean_code`, and `price` from `products_pricing`, ordered by `id`.",
          id: "Bersihkan spasi dari `product_code` beralias `clean_code` dan lakukan casting `raw_price` ke tipe desimal dengan dua digit desimal beralias `price`, menampilkan `id`, `clean_code`, dan `price` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, TRIM(product_code) AS clean_code, CAST(raw_price AS DECIMAL(10,2)) AS price FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;"
      }
    }
  },
  {
    id: 438,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Building Compound Labels with CONCAT and TRIM (Var #2)",
      id: "Membangun Label Majemuk dengan CONCAT dan TRIM (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Combining cleaned product codes and descriptive notes creates readable product badges for store displays.\n\nEngine Processing Behavior: Evaluates inner TRIM functions to strip padding, then allocates a unified string buffer concatenating all argument strings in sequence.\n\nBest Practices & Gotchas: The CONCAT function converts null values to empty strings gracefully, unlike raw concatenation in some database engines.",
      id: "Analogi Konseptual: Menggabungkan kode produk yang telah dibersihkan dengan catatan deskriptif menghasilkan label produk yang informatif untuk katalog toko.\n\nCara Kerja Database Engine: Mengevaluasi fungsi TRIM internal untuk membersihkan spasi, lalu mengalokasikan buffer memori string untuk menyatukan seluruh argumen teks secara berurutan.\n\nBest Practices & Catatan Penting: Fungsi CONCAT secara aman menangani nilai null sebagai string kosong tanpa membatalkan seluruh hasil penggabungan teks."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Concatenating trimmed fields",
          id: "Penggabungan kolom yang dibersihkan"
        },
        code: "SELECT id, CONCAT(TRIM(product_code), ' - ', TRIM(notes)) AS product_label FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Build a single label combining trimmed `product_code`, a hyphen with spaces, and trimmed `notes` aliased as `product_label`, displaying `id` and `product_label` from `products_pricing`, ordered by `id`.",
      id: "Bangun satu label yang menggabungkan `product_code` tanpa spasi, tanda strip dengan spasi, dan `notes` tanpa spasi beralias `product_label`, menampilkan `id` dan `product_label` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, CONCAT(TRIM(product_code), ' - ', TRIM(notes)) AS product_label FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"]
  },
  {
    id: 439,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Extracting Category Code Prefixes with SUBSTRING (Var #3)",
      id: "Mengekstrak Awalan Kode Kategori dengan SUBSTRING (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Extracting the first few characters of a structured identifier is like reading the state code on a vehicle license plate.\n\nEngine Processing Behavior: The substring function offsets into the trimmed character sequence and copies the requested length of characters.\n\nBest Practices & Gotchas: SQL string indexing begins at index 1 rather than 0; always trim preceding whitespace first so offsets align accurately.",
      id: "Analogi Konseptual: Mengambil beberapa karakter awal dari kode terstruktur seperti membaca kode wilayah pada plat nomor kendaraan.\n\nCara Kerja Database Engine: Fungsi substring melompat ke offset karakter yang diminta pada string yang telah dibersihkan dan menyalin karakter sebanyak panjang yang ditentukan.\n\nBest Practices & Catatan Penting: Indeks string dalam SQL dimulai dari angka 1 bukan 0; bersihkan spasi di awal terlebih dahulu agar posisi karakter selalu konsisten."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Substring prefix extraction",
          id: "Ekstraksi prefiks dengan substring"
        },
        code: "SELECT id, TRIM(product_code) AS code, SUBSTRING(TRIM(product_code), 1, 4) AS category_prefix FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Display `id`, trimmed `product_code` aliased as `code`, and the first four characters of trimmed `product_code` aliased as `category_prefix` from `products_pricing`, ordered by `id`.",
      id: "Tampilkan `id`, `product_code` yang telah dibersihkan beralias `code`, serta empat karakter pertama dari `product_code` yang telah dibersihkan beralias `category_prefix` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, TRIM(product_code) AS code, SUBSTRING(TRIM(product_code), 1, 4) AS category_prefix FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"]
  },
  {
    id: 440,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Discounted Price Calculation with Explicit Casting (Var #4)",
      id: "Perhitungan Harga Diskon dengan Explicit Casting (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Converting text numbers into exact financial figures before multiplying ensures customer discounts calculate down to the exact cent.\n\nEngine Processing Behavior: Converts text columns to fixed numeric types and computes mathematical discount expressions within the projection stage.\n\nBest Practices & Gotchas: Arithmetic between text and numeric without explicit casting can trigger silent conversion failures or unpredictable precision losses.",
      id: "Analogi Konseptual: Mengubah teks angka menjadi angka moneter presisi sebelum perkalian memastikan nilai potongan harga dihitung akurat hingga digit sen.\n\nCara Kerja Database Engine: Mengonversi kolom teks ke tipe numerik berpresisi tetap lalu mengeksekusi perhitungan matematika potongan harga pada tahap proyeksi data.\n\nBest Practices & Catatan Penting: Operasi aritmatika antara teks dan angka tanpa casting eksplisit berisiko memicu kegagalan konversi atau hilangnya presisi desimal."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Discount arithmetic with numeric casting",
          id: "Aritmatika diskon dengan casting numerik"
        },
        code: "SELECT id, TRIM(product_code) AS code, (raw_price::NUMERIC(10,2) * (1 - discount_rate::NUMERIC(10,2)))::NUMERIC(10,2) AS discounted_price FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Compute the final price by multiplying `raw_price` by one minus `discount_rate` with numeric precision aliased as `discounted_price`, showing `id`, trimmed `product_code` aliased as `code`, and `discounted_price` from `products_pricing`, ordered by `id`.",
      id: "Hitung harga akhir dengan mengalikan `raw_price` terhadap satu dikurangi `discount_rate` dengan presisi numerik dua desimal beralias `discounted_price`, menampilkan `id`, `product_code` tanpa spasi beralias `code`, dan `discounted_price` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, TRIM(product_code) AS code, (raw_price::NUMERIC(10,2) * (1 - discount_rate::NUMERIC(10,2)))::NUMERIC(10,2) AS discounted_price FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Discounted Price Calculation with DECIMAL Casting (Var #4)",
          id: "Perhitungan Harga Diskon dengan Casting DECIMAL (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Casting raw price text to decimal numbers before calculating percentage markdowns prevents floating-point inaccuracies.\n\nEngine Processing Behavior: Casts both operands to decimal structures and performs fixed-point arithmetic.\n\nBest Practices & Gotchas: Always specify decimal precision and scale for currency values.",
          id: "Analogi Konseptual: Melakukan casting teks harga mentah ke angka desimal sebelum menghitung diskon mencegah kesalahan pembulatan angka pecahan.\n\nCara Kerja Database Engine: Mengonversi kedua operand ke struktur desimal dan menjalankan operasi aritmatika fixed-point.\n\nBest Practices & Catatan Penting: Selalu tetapkan presisi dan skala desimal secara spesifik untuk kolom bernilai mata uang."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL decimal discount calculation",
              id: "Perhitungan diskon desimal MySQL"
            },
            code: "SELECT id, TRIM(product_code) AS code, CAST(CAST(raw_price AS DECIMAL(10,2)) * (1 - CAST(discount_rate AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS discounted_price FROM products_pricing ORDER BY id;"
          }
        ],
        instructions: {
          en: "Compute the final price by multiplying `raw_price` by one minus `discount_rate` with decimal precision aliased as `discounted_price`, showing `id`, trimmed `product_code` aliased as `code`, and `discounted_price` from `products_pricing`, ordered by `id`.",
          id: "Hitung harga akhir dengan mengalikan `raw_price` terhadap satu dikurangi `discount_rate` dengan presisi desimal dua angka di belakang koma beralias `discounted_price`, menampilkan `id`, `product_code` tanpa spasi beralias `code`, dan `discounted_price` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, TRIM(product_code) AS code, CAST(CAST(raw_price AS DECIMAL(10,2)) * (1 - CAST(discount_rate AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS discounted_price FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;"
      }
    }
  },
  {
    id: 441,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Formatting Titles with String Functions and Concatenation (Var #5)",
      id: "Format Judul dengan Fungsi Huruf Besar-Kecil dan Penggabungan (Latihan #5)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Standardizing product codes in uppercase and notes in lowercase creates consistent presentation formatting for catalog indexing.\n\nEngine Processing Behavior: Normalizes case per character byte before piping results into the string concatenation operator.\n\nBest Practices & Gotchas: String concatenation operators vary across SQL dialects; pipe operators are standard in PostgreSQL while MySQL prefers the CONCAT function.",
      id: "Analogi Konseptual: Menyeragamkan kode produk ke huruf besar dan deskripsi catatan ke huruf kecil menghasilkan tampilan katalog yang rapi dan konsisten.\n\nCara Kerja Database Engine: Menormalkan format besar-kecil tiap karakter sebelum mengalirkannya ke operator penggabungan teks.\n\nBest Practices & Catatan Penting: Operator penggabungan teks berbeda antar database; PostgreSQL mendukung operator pipa sedangkan MySQL umumnya mengandalkan fungsi CONCAT."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Case conversion and pipe concatenation",
          id: "Konversi huruf dan penggabungan dengan pipa"
        },
        code: "SELECT id, UPPER(TRIM(product_code)) || ': ' || LOWER(TRIM(notes)) AS display_title FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Create a display title combining uppercase trimmed `product_code`, a colon with space, and lowercase trimmed `notes` aliased as `display_title`, showing `id` and `display_title` from `products_pricing`, ordered by `id`.",
      id: "Buat judul tampilan yang menggabungkan `product_code` huruf besar tanpa spasi, tanda titik dua dengan spasi, dan `notes` huruf kecil tanpa spasi beralias `display_title`, menampilkan `id` dan `display_title` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, UPPER(TRIM(product_code)) || ': ' || LOWER(TRIM(notes)) AS display_title FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Formatting Titles with CONCAT and Case Functions (Var #5)",
          id: "Format Judul dengan CONCAT dan Fungsi Huruf (Latihan #5)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Joining capitalized codes and lowercase notes into a standard catalog label using CONCAT.\n\nEngine Processing Behavior: Converts case transforms in memory and passes outputs to CONCAT.\n\nBest Practices & Gotchas: The CONCAT function handles multi-part string joins cleanly in MySQL.",
          id: "Analogi Konseptual: Menyatukan kode produk berhuruf besar dan catatan berhuruf kecil menjadi label standar menggunakan fungsi CONCAT.\n\nCara Kerja Database Engine: Menjalankan transformasi huruf di memori lalu meneruskan hasilnya ke fungsi CONCAT.\n\nBest Practices & Catatan Penting: Fungsi CONCAT menangani penggabungan string multi-bagian secara aman di MySQL."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL CONCAT with case transforms",
              id: "CONCAT MySQL dengan transformasi huruf"
            },
            code: "SELECT id, CONCAT(UPPER(TRIM(product_code)), ': ', LOWER(TRIM(notes))) AS display_title FROM products_pricing ORDER BY id;"
          }
        ],
        instructions: {
          en: "Create a display title combining uppercase trimmed `product_code`, a colon with space, and lowercase trimmed `notes` aliased as `display_title`, showing `id` and `display_title` from `products_pricing`, ordered by `id`.",
          id: "Buat judul tampilan yang menggabungkan `product_code` huruf besar tanpa spasi, tanda titik dua dengan spasi, dan `notes` huruf kecil tanpa spasi beralias `display_title`, menampilkan `id` dan `display_title` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, CONCAT(UPPER(TRIM(product_code)), ': ', LOWER(TRIM(notes))) AS display_title FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;"
      }
    }
  },
  {
    id: 442,
    moduleId: 4,
    categorySlot: 7,
    title: {
      en: "Parsing Substring Digits to Integer (Var #6)",
      id: "Parsing Digit Substring ke Tipe Integer (Latihan #6)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Extracting the numeric sequence from a serial code and converting it into a true integer for mathematical sorting and calculations.\n\nEngine Processing Behavior: Slices the substring starting at index 6 for 3 characters, then casts the resulting text digits into integer numerical form.\n\nBest Practices & Gotchas: Verify that the substring range contains strictly numeric characters prior to casting to integer to prevent parsing errors.",
      id: "Analogi Konseptual: Mengambil nomor urut dari kode serial dan mengubahnya menjadi bilangan bulat integer untuk pengurutan numerik dan komputasi.\n\nCara Kerja Database Engine: Memotong substring mulai karakter ke-6 sebanyak 3 karakter, lalu melakukan casting string angka tersebut ke tipe integer bilangan bulat.\n\nBest Practices & Catatan Penting: Pastikan rentang karakter substring hanya memuat digit angka sebelum melakukan casting ke integer untuk menghindari parsing error."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Substring casting to integer",
          id: "Casting substring ke tipe integer"
        },
        code: "SELECT id, TRIM(product_code) AS code, CAST(SUBSTRING(TRIM(product_code), 6, 3) AS INT) AS numeric_id FROM products_pricing ORDER BY id;"
      }
    ],
    instructions: {
      en: "Extract three characters starting from the sixth position of trimmed `product_code` and cast them to an integer aliased as `numeric_id`, displaying `id`, trimmed `product_code` aliased as `code`, and `numeric_id` from `products_pricing`, ordered by `id`.",
      id: "Ekstrak tiga karakter mulai dari posisi ke-6 dari `product_code` yang dibersihkan lalu lakukan casting ke tipe integer beralias `numeric_id`, menampilkan `id`, `product_code` tanpa spasi beralias `code`, dan `numeric_id` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod4CastingSeed",
    expected_query: "SELECT id, TRIM(product_code) AS code, CAST(SUBSTRING(TRIM(product_code), 6, 3) AS INT) AS numeric_id FROM products_pricing ORDER BY id;",
    starterQuery: "SELECT * FROM products_pricing;",
    table_names: ["products_pricing"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Parsing Substring Digits to SIGNED Integer (Var #6)",
          id: "Parsing Digit Substring ke SIGNED Integer (Latihan #6)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Isolating numeric digits within an alphanumeric product tag and casting them into a signed integer.\n\nEngine Processing Behavior: Extracts substring bytes and parses them into a signed 64-bit numerical integer.\n\nBest Practices & Gotchas: MySQL uses SIGNED or UNSIGNED as the target type name in CAST expressions for integers.",
          id: "Analogi Konseptual: Mengisolasi digit angka dari label kode alfanumerik dan mengonversinya menjadi bilangan bulat bertanda (signed integer).\n\nCara Kerja Database Engine: Mengambil potongan teks karakter dan mengonversinya ke format numerik bilangan bulat SIGNED.\n\nBest Practices & Catatan Penting: MySQL menggunakan nama tipe SIGNED atau UNSIGNED pada klausa CAST untuk bilangan bulat."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL substring cast to SIGNED",
              id: "Casting substring ke SIGNED di MySQL"
            },
            code: "SELECT id, TRIM(product_code) AS code, CAST(SUBSTRING(TRIM(product_code), 6, 3) AS SIGNED) AS numeric_id FROM products_pricing ORDER BY id;"
          }
        ],
        instructions: {
          en: "Extract three characters starting from the sixth position of trimmed `product_code` and cast them to a signed integer aliased as `numeric_id`, displaying `id`, trimmed `product_code` aliased as `code`, and `numeric_id` from `products_pricing`, ordered by `id`.",
          id: "Ekstrak tiga karakter mulai dari posisi ke-6 dari `product_code` yang dibersihkan lalu lakukan casting ke integer bertanda beralias `numeric_id`, menampilkan `id`, `product_code` tanpa spasi beralias `code`, dan `numeric_id` dari tabel `products_pricing`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, TRIM(product_code) AS code, CAST(SUBSTRING(TRIM(product_code), 6, 3) AS SIGNED) AS numeric_id FROM products_pricing ORDER BY id;",
        starterQuery: "SELECT * FROM products_pricing;"
      }
    }
  }
];

console.log("Module 4 questions defined:", m4Questions.length);

const m5Questions = [
  // Expand Slot 9: ON DELETE RESTRICT & ON DELETE SET NULL
  {
    id: 549,
    moduleId: 5,
    categorySlot: 9,
    title: {
      en: "Referential Integrity with ON DELETE RESTRICT (Var #6)",
      id: "Integritas Referensial dengan ON DELETE RESTRICT (Latihan #6)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: RESTRICT acts like a physical safety padlock: the database outright forbids deleting a parent department if there are dependent head records relying upon it.\n\nEngine Processing Behavior: When a DELETE statement targets a referenced parent row, the storage engine checks foreign key indexes for referencing child tuples. If any exist, the delete operation is immediately aborted with a foreign key violation error.\n\nBest Practices & Gotchas: RESTRICT is the safest default for essential financial and organizational hierarchies where accidental data purges must be strictly blocked.",
      id: "Analogi Konseptual: RESTRICT bekerja seperti gembok pengaman: database menolak keras penghapusan suatu departemen induk jika masih ada data kepala divisi yang bergantung padanya.\n\nCara Kerja Database Engine: Saat perintah DELETE menyasar baris induk, storage engine memeriksa relasi foreign key pada data anak. Jika ditemukan baris anak yang mereferensikannya, operasi DELETE langsung digagalkan dengan error pelanggaran foreign key.\n\nBest Practices & Catatan Penting: RESTRICT adalah opsi paling aman untuk data penting seperti transaksi finansial atau struktur organisasi demi mencegah terhapusnya data penting secara tidak sengaja."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Foreign key with ON DELETE RESTRICT",
          id: "Foreign key dengan ON DELETE RESTRICT"
        },
        code: "CREATE TABLE department_heads (id INT PRIMARY KEY, name TEXT, department_id INT REFERENCES departments(id) ON DELETE RESTRICT);"
      }
    ],
    instructions: {
      en: "Create a `department_heads` table with `id`, `name`, and `department_id`, referencing `departments` so deleting a department is prevented when dependent head records exist.",
      id: "Buat tabel `department_heads` dengan kolom `id`, `name`, dan `department_id`, mereferensikan `departments` sehingga penghapusan departemen dicegah jika masih terdapat data kepala departemen terkait."
    },
    seed_sql: "mod5Seed",
    expected_query: "CREATE TABLE department_heads (id INT PRIMARY KEY, name TEXT, department_id INT REFERENCES departments(id) ON DELETE RESTRICT);",
    starterQuery: "-- Write CREATE TABLE here",
    table_names: ["department_heads"],
    isDdlCreate: true,
    mockPreviewData: {
      tableName: "department_heads",
      columns: ["id", "name", "department_id"],
      rows: [
        { id: 1, name: "Alice Smith", department_id: 1 },
        { id: 2, name: "Bob Jones", department_id: 2 }
      ]
    }
  },
  {
    id: 550,
    moduleId: 5,
    categorySlot: 9,
    title: {
      en: "Referential Integrity with ON DELETE SET NULL (Var #7)",
      id: "Integritas Referensial dengan ON DELETE SET NULL (Latihan #7)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: SET NULL unlinks child records gracefully: when an employee record is removed, any linked profile simply has its employee reference cleared without deleting the profile itself.\n\nEngine Processing Behavior: Upon deletion of a parent row, the database engine updates all matching child foreign key columns to NULL within the same atomic transaction.\n\nBest Practices & Gotchas: The foreign key column in the child table must allow NULL values (no NOT NULL constraint) for SET NULL to succeed.",
      id: "Analogi Konseptual: SET NULL melepaskan kaitan data anak secara halus: ketika seorang karyawan dihapus, profil terkait tetap ada namun kolom referensi karyawannya diubah menjadi kosong (NULL).\n\nCara Kerja Database Engine: Saat baris di tabel induk dihapus, database engine secara otomatis memperbarui kolom foreign key pada tabel anak menjadi NULL dalam satu transaksi atomik yang sama.\n\nBest Practices & Catatan Penting: Kolom foreign key pada tabel anak harus mengizinkan nilai NULL (tidak boleh NOT NULL) agar aksi SET NULL dapat berjalan tanpa error."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Foreign key with ON DELETE SET NULL",
          id: "Foreign key dengan ON DELETE SET NULL"
        },
        code: "CREATE TABLE employee_profiles (id INT PRIMARY KEY, employee_id INT REFERENCES employees(id) ON DELETE SET NULL, bio TEXT);"
      }
    ],
    instructions: {
      en: "Create an `employee_profiles` table with `id`, `employee_id`, and `bio`, referencing `employees` so deleting an employee clears the reference to null without deleting the profile.",
      id: "Buat tabel `employee_profiles` dengan kolom `id`, `employee_id`, dan `bio`, mereferensikan `employees` sehingga menghapus karyawan akan mengosongkan referensi menjadi null tanpa menghapus profilnya."
    },
    seed_sql: "mod5Seed",
    expected_query: "CREATE TABLE employee_profiles (id INT PRIMARY KEY, employee_id INT REFERENCES employees(id) ON DELETE SET NULL, bio TEXT);",
    starterQuery: "-- Write CREATE TABLE here",
    table_names: ["employee_profiles"],
    isDdlCreate: true,
    mockPreviewData: {
      tableName: "employee_profiles",
      columns: ["id", "employee_id", "bio"],
      rows: [
        { id: 1, employee_id: 1, bio: "Senior database architect" },
        { id: 2, employee_id: 2, bio: "Full-stack developer" }
      ]
    }
  },

  // Expand Slot 10: ON CONFLICT DO NOTHING
  {
    id: 551,
    moduleId: 5,
    categorySlot: 10,
    title: {
      en: "Idempotent Cart Insertion with ON CONFLICT DO NOTHING (Var #4)",
      id: "Penyisipan Data Idempoten dengan ON CONFLICT DO NOTHING (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: DO NOTHING acts as a silent bypass: if an item is already present in a shopping cart, the duplicate entry is ignored without crashing the application.\n\nEngine Processing Behavior: When a primary key conflict is encountered, the storage engine suppresses the uniqueness error and skips row insertion.\n\nBest Practices & Gotchas: DO NOTHING is ideal for batch ingestion pipelines where duplicate events can safely be skipped without side effects.",
      id: "Analogi Konseptual: DO NOTHING bertindak sebagai bypass senyap: jika suatu produk sudah ada di keranjang, percobaan input duplikat diabaikan tanpa membuat aplikasi error.\n\nCara Kerja Database Engine: Ketika terjadi konflik primary key, engine membungkam error duplikasi dan melewati baris tersebut tanpa melakukan perubahan data.\n\nBest Practices & Catatan Penting: DO NOTHING sangat tepat untuk antrean data atau sinkronisasi batch di mana data yang sudah ada cukup diabaikan secara aman."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Upsert ignoring conflict",
          id: "Upsert dengan mengabaikan konflik"
        },
        code: "INSERT INTO cart VALUES (1, 101, 5) ON CONFLICT (user_id, product_id) DO NOTHING;"
      }
    ],
    instructions: {
      en: "Add a record to `cart` with `user_id` 1, `product_id` 101, and `quantity` 5, silently ignoring the operation if a key conflict on `(user_id, product_id)` occurs.",
      id: "Tambahkan data ke tabel `cart` dengan `user_id` 1, `product_id` 101, dan `quantity` 5, abaikan operasi secara senyap jika terjadi konflik kunci pada `(user_id, product_id)`."
    },
    seed_sql: "mod5Seed",
    expected_query: "INSERT INTO cart VALUES (1, 101, 5) ON CONFLICT (user_id, product_id) DO NOTHING;",
    starterQuery: "INSERT INTO cart VALUES (1, 101, 5);",
    table_names: ["cart"],
    verification_query: "SELECT user_id, product_id, quantity FROM cart WHERE user_id = 1 AND product_id = 101;",
    engineOverrides: {
      mysql: {
        title: {
          en: "Idempotent Cart Insertion with INSERT IGNORE (Var #4)",
          id: "Penyisipan Data Idempoten dengan INSERT IGNORE (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Bypassing duplicate primary key insertions silently in MySQL.\n\nEngine Processing Behavior: Suppresses unique key violations and leaves existing rows intact.\n\nBest Practices & Gotchas: Ensure the primary key columns match the intended uniqueness boundary.",
          id: "Analogi Konseptual: Mengabaikan penyisipan data duplikat secara senyap pada MySQL.\n\nCara Kerja Database Engine: Membungkam pesan error pelanggaran unique key dan mempertahankan baris data yang sudah ada.\n\nBest Practices & Catatan Penting: Pastikan kolom primary key telah sesuai dengan batasan keunikan data yang diinginkan."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL INSERT IGNORE",
              id: "INSERT IGNORE pada MySQL"
            },
            code: "INSERT IGNORE INTO cart VALUES (1, 101, 5);"
          }
        ],
        instructions: {
          en: "Add a record to `cart` with `user_id` 1, `product_id` 101, and `quantity` 5, silently ignoring the operation if a duplicate key conflict occurs.",
          id: "Tambahkan data ke tabel `cart` dengan `user_id` 1, `product_id` 101, dan `quantity` 5, abaikan operasi secara senyap jika terjadi konflik data duplikat."
        },
        expected_query: "INSERT IGNORE INTO cart VALUES (1, 101, 5);",
        starterQuery: "INSERT INTO cart VALUES (1, 101, 5);"
      }
    }
  },
  {
    id: 552,
    moduleId: 5,
    categorySlot: 10,
    title: {
      en: "Idempotent Secondary Cart Item Insertion (Var #5)",
      id: "Penyisipan Idempoten Item Keranjang Sekunder (Latihan #5)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Adding an item to user 2's cart while ensuring repeated clicks on the checkout button do not cause duplicate insertion errors.\n\nEngine Processing Behavior: The storage engine verifies the primary index; if a matching tuple exists, write execution exits without error.\n\nBest Practices & Gotchas: Use DO NOTHING when user interfaces lack frontend debouncing to maintain safe idempotent writes.",
      id: "Analogi Konseptual: Menambahkan barang ke keranjang belanja user 2 dengan memastikan klik berulang pada antarmuka tidak menimbulkan pesan error duplikasi.\n\nCara Kerja Database Engine: Storage engine memverifikasi indeks primary key; jika data yang cocok sudah ditemukan, penulisan selesai tanpa memunculkan error.\n\nBest Practices & Catatan Penting: Terapkan DO NOTHING untuk menjaga keamanan idempoten saat sistem menerima permintaan ganda dari antarmuka pengguna."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Idempotent insert with DO NOTHING",
          id: "Insert idempoten dengan DO NOTHING"
        },
        code: "INSERT INTO cart VALUES (2, 102, 4) ON CONFLICT (user_id, product_id) DO NOTHING;"
      }
    ],
    instructions: {
      en: "Add a record to `cart` with `user_id` 2, `product_id` 102, and `quantity` 4, ignoring the insertion if a conflict on `(user_id, product_id)` occurs.",
      id: "Tambahkan data ke tabel `cart` dengan `user_id` 2, `product_id` 102, dan `quantity` 4, abaikan penambahan jika terjadi konflik pada `(user_id, product_id)`."
    },
    seed_sql: "mod5Seed",
    expected_query: "INSERT INTO cart VALUES (2, 102, 4) ON CONFLICT (user_id, product_id) DO NOTHING;",
    starterQuery: "INSERT INTO cart VALUES (2, 102, 4);",
    table_names: ["cart"],
    verification_query: "SELECT user_id, product_id, quantity FROM cart WHERE user_id = 2 AND product_id = 102;",
    engineOverrides: {
      mysql: {
        title: {
          en: "Idempotent Secondary Item Insertion with INSERT IGNORE (Var #5)",
          id: "Penyisipan Idempoten Item Sekunder dengan INSERT IGNORE (Latihan #5)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Safe idempotent cart insertion in MySQL.\n\nEngine Processing Behavior: Ignores duplicate key constraint violations and retains existing records.\n\nBest Practices & Gotchas: INSERT IGNORE skips constraint errors without aborting transactions.",
          id: "Analogi Konseptual: Penyisipan keranjang belanja yang aman dan idempoten di MySQL.\n\nCara Kerja Database Engine: Mengabaikan pelanggaran batasan duplicate key dan mempertahankan data yang sudah ada.\n\nBest Practices & Catatan Penting: Perintah INSERT IGNORE melewati error duplikasi tanpa membatalkan transaksi."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL INSERT IGNORE item",
              id: "INSERT IGNORE item MySQL"
            },
            code: "INSERT IGNORE INTO cart VALUES (2, 102, 4);"
          }
        ],
        instructions: {
          en: "Add a record to `cart` with `user_id` 2, `product_id` 102, and `quantity` 4, ignoring the insertion if a duplicate key conflict occurs.",
          id: "Tambahkan data ke tabel `cart` dengan `user_id` 2, `product_id` 102, dan `quantity` 4, abaikan penambahan jika terjadi konflik data duplikat."
        },
        expected_query: "INSERT IGNORE INTO cart VALUES (2, 102, 4);",
        starterQuery: "INSERT INTO cart VALUES (2, 102, 4);"
      }
    }
  },

  // Slot 11: RIGHT JOIN & CROSS JOIN
  {
    id: 553,
    moduleId: 5,
    categorySlot: 11,
    title: {
      en: "Preserving All Departments with RIGHT JOIN (Var #1)",
      id: "Mempertahankan Semua Departemen dengan RIGHT JOIN (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A RIGHT JOIN ensures every entity on the right-hand side (all departments) remains in the final roster, filling in nulls for departments without any assigned employees.\n\nEngine Processing Behavior: The planner scans the right table as the outer driving relation and looks up matches in the left relation, producing null-padded tuples whenever matches are absent.\n\nBest Practices & Gotchas: While RIGHT JOIN is functionally equivalent to reversing the tables in a LEFT JOIN, explicit RIGHT JOIN is valuable when following natural pipeline ordering.",
      id: "Analogi Konseptual: RIGHT JOIN memastikan setiap entitas di sisi kanan (semua departemen) tetap ada di hasil akhir, mengisi nilai null untuk departemen yang belum memiliki karyawan.\n\nCara Kerja Database Engine: Planner memindai tabel kanan sebagai relasi utama dan mencari kecocokan pada tabel kiri, menghasilkan baris bertanda null ketika data pasangan tidak ditemukan.\n\nBest Practices & Catatan Penting: Meskipun secara fungsional setara dengan menukar posisi tabel pada LEFT JOIN, RIGHT JOIN berguna untuk mempertahankan alur baca query yang intuitif."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Right outer join",
          id: "Right outer join antar tabel"
        },
        code: "SELECT d.dept_name, e.name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id ORDER BY d.dept_name, e.name;"
      }
    ],
    instructions: {
      en: "Join `employees` and `departments` preserving all departments, showing `dept_name` from `departments` and employee `name`, ordered by `dept_name` and `name`.",
      id: "Hubungkan tabel `employees` dan `departments` dengan mempertahankan semua departemen, menampilkan `dept_name` dari `departments` dan `name` karyawan, diurutkan berdasarkan `dept_name` dan `name`."
    },
    seed_sql: "mod5Seed",
    expected_query: "SELECT d.dept_name, e.name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id ORDER BY d.dept_name, e.name;",
    starterQuery: "SELECT * FROM departments;",
    table_names: ["departments", "employees"]
  },
  {
    id: 554,
    moduleId: 5,
    categorySlot: 11,
    title: {
      en: "Generating Store-Product Inventory Matrices with CROSS JOIN (Var #2)",
      id: "Membuat Matriks Inventaris Toko dan Produk dengan CROSS JOIN (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A CROSS JOIN produces a Cartesian product matching every store with every product, like printing a complete checklist of inventory shelves across all branch locations.\n\nEngine Processing Behavior: The query engine iterates over each row of the first relation and pairs it with every single row of the second relation, producing N times M total output tuples.\n\nBest Practices & Gotchas: Always ensure both participating tables are reasonably sized before running a CROSS JOIN to prevent combinatorial memory explosion.",
      id: "Analogi Konseptual: CROSS JOIN menghasilkan produk Cartesian yang memasangkan setiap toko dengan setiap produk, seperti mencetak daftar periksa rak inventaris lengkap di seluruh cabang.\n\nCara Kerja Database Engine: Query engine mengulang setiap baris pada tabel pertama dan memasangkannya dengan setiap baris di tabel kedua, menghasilkan total baris sebanyak perkalian N dikali M.\n\nBest Practices & Catatan Penting: Pastikan kedua tabel berukuran wajar sebelum mengeksekusi CROSS JOIN untuk mencegah lonjakan konsumsi memori akibat perkalian data."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Cartesian product with CROSS JOIN",
          id: "Produk Cartesian dengan CROSS JOIN"
        },
        code: "SELECT s.store_name, p.name AS product_name FROM stores s CROSS JOIN products p ORDER BY s.store_name, product_name;"
      }
    ],
    instructions: {
      en: "Generate all combinations of `stores` and `products`, displaying `store_name` from `stores` and product `name` aliased as `product_name`, ordered by `store_name` and `product_name`.",
      id: "Hasilkan semua kombinasi antara `stores` dan `products`, menampilkan `store_name` dari `stores` dan `name` produk beralias `product_name`, diurutkan berdasarkan `store_name` dan `product_name`."
    },
    seed_sql: "mod5GradesSeed",
    expected_query: "SELECT s.store_name, p.name AS product_name FROM stores s CROSS JOIN products p ORDER BY s.store_name, product_name;",
    starterQuery: "SELECT * FROM stores;",
    table_names: ["stores", "products"]
  },
  {
    id: 555,
    moduleId: 5,
    categorySlot: 11,
    title: {
      en: "Finding Empty Departments with RIGHT JOIN Anti-Join (Var #3)",
      id: "Menemukan Departemen Tanpa Anggota dengan RIGHT JOIN Anti-Join (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Preserving all departments and filtering for missing employee links highlights departments that currently have zero assigned personnel.\n\nEngine Processing Behavior: Performs a right outer join and filters the resulting stream where the left side's primary key is NULL.\n\nBest Practices & Gotchas: Anti-joins via outer joins with IS NULL filters are highly optimized by database query planners.",
      id: "Analogi Konseptual: Mempertahankan seluruh departemen lalu menyaring baris yang tidak memiliki karyawan untuk menemukan divisi yang belum terisi staf.\n\nCara Kerja Database Engine: Menjalankan right outer join lalu memfilter baris hasil di mana kolom primary key tabel kiri bernilai NULL.\n\nBest Practices & Catatan Penting: Pola anti-join menggunakan outer join dan filter IS NULL dioptimasi secara efisien oleh query planner database."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Right anti-join",
          id: "Right anti-join untuk menemukan data kosong"
        },
        code: "SELECT d.dept_name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id WHERE e.id IS NULL ORDER BY d.dept_name;"
      }
    ],
    instructions: {
      en: "Find all departments that currently have no assigned employees by joining `employees` and `departments`, displaying `dept_name` from `departments`, ordered by `dept_name`.",
      id: "Temukan semua departemen yang saat ini belum memiliki karyawan dengan menghubungkan `employees` dan `departments`, menampilkan `dept_name` dari `departments`, diurutkan berdasarkan `dept_name`."
    },
    seed_sql: "mod5Seed",
    expected_query: "SELECT d.dept_name FROM employees e RIGHT JOIN departments d ON e.department_id = d.id WHERE e.id IS NULL ORDER BY d.dept_name;",
    starterQuery: "SELECT * FROM departments;",
    table_names: ["departments", "employees"]
  },
  {
    id: 556,
    moduleId: 5,
    categorySlot: 11,
    title: {
      en: "Department and Store Branch Combination Grid (Var #4)",
      id: "Matriks Kombinasi Departemen dan Cabang Toko (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Pairing each business department with every retail branch helps plan organizational staffing coverage across regions.\n\nEngine Processing Behavior: Produces a full Cartesian product across both relations without requiring matching key attributes.\n\nBest Practices & Gotchas: CROSS JOIN is the intentional SQL equivalent of omitting join predicates; use it deliberately for grid generation.",
      id: "Analogi Konseptual: Memasangkan setiap departemen dengan setiap cabang toko membantu perencanaan alokasi staf organisasi di berbagai wilayah.\n\nCara Kerja Database Engine: Menghasilkan produk Cartesian penuh dari kedua relasi tanpa memerlukan kolom kunci pencocokan.\n\nBest Practices & Catatan Penting: CROSS JOIN adalah bentuk eksplisit dan terencana untuk perkalian himpunan baris; gunakan untuk membuat matriks data."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Cartesian product of departments and stores",
          id: "Produk Cartesian departemen dan toko"
        },
        code: "SELECT d.dept_name, s.store_name FROM departments d CROSS JOIN stores s ORDER BY d.dept_name, s.store_name;"
      }
    ],
    instructions: {
      en: "Combine every department with every store, displaying `dept_name` from `departments` and `store_name` from `stores`, ordered by `dept_name` and `store_name`.",
      id: "Gabungkan setiap departemen dengan setiap toko cabang, menampilkan `dept_name` dari `departments` dan `store_name` dari `stores`, diurutkan berdasarkan `dept_name` dan `store_name`."
    },
    seed_sql: "mod5GradesSeed",
    expected_query: "SELECT d.dept_name, s.store_name FROM departments d CROSS JOIN stores s ORDER BY d.dept_name, s.store_name;",
    starterQuery: "SELECT * FROM departments;",
    table_names: ["departments", "stores"]
  },

  // Slot 12: LATERAL Join & Non-Equi Joins
  {
    id: 557,
    moduleId: 5,
    categorySlot: 12,
    title: {
      en: "Classifying Compensation with Non-Equi Range Join (Var #1)",
      id: "Klasifikasi Kompensasi dengan Non-Equi Range Join (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A non-equi join matches records within numerical brackets, like assigning a student a letter grade based on score ranges rather than exact IDs.\n\nEngine Processing Behavior: The planner evaluates inequality conditions (such as BETWEEN or >= and <=) across relations, associating each employee row with the appropriate grade bracket.\n\nBest Practices & Gotchas: Ensure range brackets do not overlap to prevent unexpected duplicate output rows for a single employee.",
      id: "Analogi Konseptual: Non-equi join mencocokkan data berdasarkan rentang angka, seperti memberikan nilai huruf berdasarkan rentang nilai ujian alih-alih angka identitas persis.\n\nCara Kerja Database Engine: Planner mengevaluasi kondisi pertidaksamaan (seperti BETWEEN atau >= dan <=) antar relasi, memetakan setiap karyawan ke batas gaji yang sesuai.\n\nBest Practices & Catatan Penting: Pastikan rentang batas nilai tidak saling tumpang tindih agar satu baris data tidak terduplikasi secara tidak disengaja."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Non-equi range join with BETWEEN",
          id: "Non-equi join dengan rentang BETWEEN"
        },
        code: "SELECT e.name, e.salary, g.grade_level FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary ORDER BY e.salary DESC;"
      }
    ],
    instructions: {
      en: "Match each employee with their salary grade bracket, displaying employee `name`, `salary`, and `grade_level` from `employees` and `salary_grades`, ordered by `salary` descending.",
      id: "Cocokkan setiap karyawan dengan tingkat golongan gajinya, menampilkan `name` karyawan, `salary`, dan `grade_level` dari tabel `employees` dan `salary_grades`, diurutkan berdasarkan `salary` secara menurun."
    },
    seed_sql: "mod5GradesSeed",
    expected_query: "SELECT e.name, e.salary, g.grade_level FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary ORDER BY e.salary DESC;",
    starterQuery: "SELECT * FROM employees;",
    table_names: ["employees", "salary_grades"]
  },
  {
    id: 558,
    moduleId: 5,
    categorySlot: 12,
    title: {
      en: "Compensation Disparity Self-Join with Inequality Predicates (Var #2)",
      id: "Self-Join Kesenjangan Kompensasi dengan Predikat Pertidaksamaan (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Comparing pairs of colleagues where one earns substantially more than another to analyze internal compensation gaps.\n\nEngine Processing Behavior: Joins the employees relation against itself comparing salary values using inequality expressions.\n\nBest Practices & Gotchas: Always alias both instances of the table distinctively when performing self-joins.",
      id: "Analogi Konseptual: Membandingkan pasangan rekan kerja di mana salah satunya berpenghasilan jauh lebih tinggi untuk menganalisis kesenjangan kompensasi internal.\n\nCara Kerja Database Engine: Menghubungkan tabel karyawan terhadap dirinya sendiri menggunakan perbandingan pertidaksamaan pada kolom gaji.\n\nBest Practices & Catatan Penting: Selalu berikan alias yang jelas dan berbeda untuk kedua instansi tabel saat menjalankan self-join."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Non-equi self-join disparity check",
          id: "Pengecekan kesenjangan dengan non-equi self-join"
        },
        code: "SELECT e1.name AS high_earner, e1.salary AS high_salary, e2.name AS low_earner, e2.salary AS low_salary FROM employees e1 JOIN employees e2 ON e1.salary >= e2.salary + 25000 ORDER BY e1.salary DESC, e2.salary;"
      }
    ],
    instructions: {
      en: "Find pairs of employees where the first earns at least 25000 more than the second, displaying `high_earner`, `high_salary`, `low_earner`, and `low_salary`, ordered by `high_salary` descending and `low_salary` ascending.",
      id: "Temukan pasangan karyawan di mana karyawan pertama berpenghasilan setidaknya 25000 lebih besar dari karyawan kedua, menampilkan `high_earner`, `high_salary`, `low_earner`, dan `low_salary`, diurutkan berdasarkan `high_salary` menurun dan `low_salary` menaik."
    },
    seed_sql: "mod5Seed",
    expected_query: "SELECT e1.name AS high_earner, e1.salary AS high_salary, e2.name AS low_earner, e2.salary AS low_salary FROM employees e1 JOIN employees e2 ON e1.salary >= e2.salary + 25000 ORDER BY e1.salary DESC, e2.salary;",
    starterQuery: "SELECT * FROM employees;",
    table_names: ["employees"]
  },
  {
    id: 559,
    moduleId: 5,
    categorySlot: 12,
    title: {
      en: "Top Earner per Department with LEFT JOIN LATERAL (Var #3)",
      id: "Karyawan Gaji Tertinggi Tiap Departemen dengan LEFT JOIN LATERAL (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A LATERAL join acts like a for-each loop in SQL, allowing the subquery to reference attributes of the outer table to retrieve the single top earner for each department.\n\nEngine Processing Behavior: For each department tuple, the query engine re-evaluates the inner subquery ordered by salary descending with limit 1, returning matching top rows even for empty departments.\n\nBest Practices & Gotchas: LATERAL joins solve the classic top-N per category problem cleanly without convoluted window partition slicing.",
      id: "Analogi Konseptual: LATERAL join bekerja seperti perulangan for-each di SQL, memungkinkan subquery membaca kolom dari tabel luar untuk mengambil satu karyawan berpenghasilan tertinggi di setiap departemen.\n\nCara Kerja Database Engine: Untuk setiap baris departemen, engine mengevaluasi subquery internal yang diurutkan berdasarkan gaji tertinggi dengan limit 1, tetap menampilkan departemen yang kosong berkat left join.\n\nBest Practices & Catatan Penting: LATERAL join menyelesaikan permasalahan klasik pengambilan top-N per kategori secara elegan tanpa partisi rumit."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Correlated lateral subquery join",
          id: "Join subquery lateral terikat"
        },
        code: "SELECT d.dept_name, sub.name, sub.salary FROM departments d LEFT JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary DESC LIMIT 1) sub ON true ORDER BY d.dept_name;"
      }
    ],
    instructions: {
      en: "Find the highest-earning employee in each department using a correlated subquery join, displaying `dept_name` from `departments`, employee `name`, and `salary`, ordered by `dept_name`.",
      id: "Temukan karyawan dengan gaji tertinggi di setiap departemen menggunakan correlated subquery join, menampilkan `dept_name` dari `departments`, `name` karyawan, dan `salary`, diurutkan berdasarkan `dept_name`."
    },
    seed_sql: "mod5Seed",
    expected_query: "SELECT d.dept_name, sub.name, sub.salary FROM departments d LEFT JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary DESC LIMIT 1) sub ON true ORDER BY d.dept_name;",
    starterQuery: "SELECT * FROM departments;",
    table_names: ["departments", "employees"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Top Earner per Department with Correlated Subquery Join (Var #3)",
          id: "Karyawan Gaji Tertinggi Tiap Departemen dengan Correlated Subquery Join (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Finding the top earner in each department by matching each department with its maximum salary record.\n\nEngine Processing Behavior: Matches departments with employee rows whose salary equals the maximum salary computed for that department.\n\nBest Practices & Gotchas: Correlated subquery joins provide universal database compatibility across SQL engines.",
          id: "Analogi Konseptual: Menemukan karyawan berpenghasilan tertinggi di setiap departemen dengan mencocokkan departemen ke baris gaji maksimumnya.\n\nCara Kerja Database Engine: Menghubungkan departemen dengan baris karyawan yang gajinya bernilai sama dengan gaji maksimum departemen tersebut.\n\nBest Practices & Catatan Penting: Correlated subquery join memberikan kompatibilitas tinggi lintas berbagai database engine."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL correlated max salary join",
              id: "Join gaji maksimum terikat MySQL"
            },
            code: "SELECT d.dept_name, e.name, e.salary FROM departments d LEFT JOIN employees e ON e.department_id = d.id AND e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = d.id) ORDER BY d.dept_name;"
          }
        ],
        instructions: {
          en: "Find the highest-earning employee in each department using a correlated subquery join, displaying `dept_name` from `departments`, employee `name`, and `salary`, ordered by `dept_name`.",
          id: "Temukan karyawan dengan gaji tertinggi di setiap departemen menggunakan correlated subquery join, menampilkan `dept_name` dari `departments`, `name` karyawan, dan `salary`, diurutkan berdasarkan `dept_name`."
        },
        expected_query: "SELECT d.dept_name, e.name, e.salary FROM departments d LEFT JOIN employees e ON e.department_id = d.id AND e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = d.id) ORDER BY d.dept_name;",
        starterQuery: "SELECT * FROM departments;"
      }
    }
  },
  {
    id: 560,
    moduleId: 5,
    categorySlot: 12,
    title: {
      en: "Lowest Earner per Department with CROSS JOIN LATERAL (Var #4)",
      id: "Karyawan Gaji Terendah Tiap Departemen dengan CROSS JOIN LATERAL (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Iterating over active departments to discover the baseline compensation earner in each department.\n\nEngine Processing Behavior: Evaluates the inner subquery for each outer department record, filtering out departments with zero employees.\n\nBest Practices & Gotchas: CROSS JOIN LATERAL excludes outer rows that return an empty set from the subquery, functioning as an inner lateral join.",
      id: "Analogi Konseptual: Menelusuri departemen aktif untuk mengetahui batas kompensasi dasar terendah di masing-masing divisi.\n\nCara Kerja Database Engine: Mengevaluasi subquery internal untuk setiap baris departemen, mengeliminasi departemen yang belum memiliki staf.\n\nBest Practices & Catatan Penting: CROSS JOIN LATERAL secara otomatis mengabaikan baris tabel luar jika subquery menghasilkan himpunan kosong."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Cross join lateral subquery",
          id: "Cross join lateral subquery"
        },
        code: "SELECT d.dept_name, sub.name, sub.salary FROM departments d CROSS JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary ASC LIMIT 1) sub ORDER BY d.dept_name;"
      }
    ],
    instructions: {
      en: "Find the lowest-earning employee in each active department using a lateral join, displaying `dept_name` from `departments`, employee `name`, and `salary`, ordered by `dept_name`.",
      id: "Temukan karyawan dengan gaji terendah di setiap departemen aktif menggunakan lateral join, menampilkan `dept_name` dari `departments`, `name` karyawan, dan `salary`, diurutkan berdasarkan `dept_name`."
    },
    seed_sql: "mod5Seed",
    expected_query: "SELECT d.dept_name, sub.name, sub.salary FROM departments d CROSS JOIN LATERAL (SELECT name, salary FROM employees WHERE department_id = d.id ORDER BY salary ASC LIMIT 1) sub ORDER BY d.dept_name;",
    starterQuery: "SELECT * FROM departments;",
    table_names: ["departments", "employees"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Lowest Earner per Department with Correlated Min Salary Join (Var #4)",
          id: "Karyawan Gaji Terendah Tiap Departemen dengan Join Gaji Minimum (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Finding the baseline earner per department using an inner join on minimum salary.\n\nEngine Processing Behavior: Matches departments to employees holding the minimum salary in that department.\n\nBest Practices & Gotchas: Inner joins exclude empty departments automatically.",
          id: "Analogi Konseptual: Menemukan karyawan berpenghasilan terendah per departemen menggunakan inner join pada nilai gaji minimum.\n\nCara Kerja Database Engine: Mencocokkan departemen dengan karyawan yang memiliki gaji bernilai minimum pada departemen tersebut.\n\nBest Practices & Catatan Penting: Inner join secara otomatis mengeliminasi departemen yang tidak memiliki karyawan."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL min salary correlated join",
              id: "Join gaji minimum MySQL"
            },
            code: "SELECT d.dept_name, e.name, e.salary FROM departments d INNER JOIN employees e ON e.department_id = d.id AND e.salary = (SELECT MIN(e2.salary) FROM employees e2 WHERE e2.department_id = d.id) ORDER BY d.dept_name;"
          }
        ],
        instructions: {
          en: "Find the lowest-earning employee in each active department using a correlated subquery join, displaying `dept_name` from `departments`, employee `name`, and `salary`, ordered by `dept_name`.",
          id: "Temukan karyawan dengan gaji terendah di setiap departemen aktif menggunakan correlated subquery join, menampilkan `dept_name` dari `departments`, `name` karyawan, dan `salary`, diurutkan berdasarkan `dept_name`."
        },
        expected_query: "SELECT d.dept_name, e.name, e.salary FROM departments d INNER JOIN employees e ON e.department_id = d.id AND e.salary = (SELECT MIN(e2.salary) FROM employees e2 WHERE e2.department_id = d.id) ORDER BY d.dept_name;",
        starterQuery: "SELECT * FROM departments;"
      }
    }
  }
];

console.log("Module 5 questions defined:", m5Questions.length);

const m6Questions = [
  // Slot 10: Recursive CTE — WITH RECURSIVE
  {
    id: 644,
    moduleId: 6,
    categorySlot: 10,
    title: {
      en: "Organizational Hierarchy Depth Traversal with Recursive CTE (Var #1)",
      id: "Penelusuran Kedalaman Struktur Organisasi dengan CTE Rekursif (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A recursive CTE explores a family or corporate tree level by level, starting at the root CEO and systematically expanding down through managers and direct reports.\n\nEngine Processing Behavior: The anchor query executes first to locate root rows (manager_id IS NULL) and seeds an internal working table. The recursive term joins the working table with the base relation, repeatedly accumulating direct reports while incrementing depth until no further child rows exist.\n\nBest Practices & Gotchas: Always ensure the recursive term includes a termination condition or references an acyclic graph to prevent infinite loops.",
      id: "Analogi Konseptual: CTE rekursif menelusuri bagan pohon keluarga atau struktur perusahaan lapis demi lapis, dimulai dari pimpinan puncak (CEO) lalu turun ke manajer dan staf di bawahnya.\n\nCara Kerja Database Engine: Anchor query dieksekusi terlebih dahulu untuk mengambil baris akar (manager_id IS NULL) dan mengisinya ke working table internal. Bagian rekursif lalu menghubungkan working table dengan tabel relasi secara berulang sambil menambah angka kedalaman (depth) hingga seluruh bawahan selesai diproses.\n\nBest Practices & Catatan Penting: Selalu pastikan bagian query rekursif memiliki kondisi penghenti atau bekerja pada struktur data tanpa siklus untuk mencegah perulangan tak terhingga (infinite loop)."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Recursive hierarchy traversal",
          id: "Penelusuran hierarki rekursif"
        },
        code: "WITH RECURSIVE org_tree AS (SELECT id, name, manager_id, role, 1 AS depth FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, o.role, p.depth + 1 FROM org_hierarchy o INNER JOIN org_tree p ON o.manager_id = p.id) SELECT name, role, depth FROM org_tree ORDER BY depth, name;"
      }
    ],
    instructions: {
      en: "Traverse the hierarchy starting from the top-level leader with no manager, computing the hierarchy level aliased as `depth` starting at 1, showing `name`, `role`, and `depth` from `org_hierarchy`, ordered by `depth` and `name`.",
      id: "Telusuri hierarki struktur mulai dari pimpinan tingkat atas yang tidak memiliki manajer, hitung tingkat kedalaman beralias `depth` dimulai dari 1, menampilkan `name`, `role`, dan `depth` dari tabel `org_hierarchy`, diurutkan berdasarkan `depth` dan `name`."
    },
    seed_sql: "mod6HierarchySeed",
    expected_query: "WITH RECURSIVE org_tree AS (SELECT id, name, manager_id, role, 1 AS depth FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, o.role, p.depth + 1 FROM org_hierarchy o INNER JOIN org_tree p ON o.manager_id = p.id) SELECT name, role, depth FROM org_tree ORDER BY depth, name;",
    starterQuery: "SELECT * FROM org_hierarchy;",
    table_names: ["org_hierarchy"]
  },
  {
    id: 645,
    moduleId: 6,
    categorySlot: 10,
    title: {
      en: "Generating Hierarchical Breadcrumb Paths (Var #2)",
      id: "Membuat Jalur Navigasi Breadcrumb Hierarkis (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Constructing breadcrumb navigation trails (such as CEO -> VP -> Engineer) that illustrate the full chain of command for every employee.\n\nEngine Processing Behavior: The anchor query seeds each root name as the initial path string. On each recursive iteration, child names are appended to the accumulated parent path with an arrow separator.\n\nBest Practices & Gotchas: Explicitly cast the initial path column to TEXT or VARCHAR with sufficient length in the anchor query so that subsequent concatenated iterations do not truncate.",
      id: "Analogi Konseptual: Membangun jejak navigasi hierarkis (seperti CEO -> VP -> Engineer) yang memperlihatkan garis komando lengkap bagi setiap karyawan.\n\nCara Kerja Database Engine: Anchor query menetapkan nama pimpinan akar sebagai string jalur awal. Pada setiap iterasi rekursif, nama bawahan digabungkan ke jalur induk menggunakan pemisah tanda panah.\n\nBest Practices & Catatan Penting: Lakukan casting eksplisit pada kolom jalur awal di anchor query ke tipe teks dengan kapasitas cukup agar penggabungan string tidak terpotong di iterasi lanjutan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Recursive breadcrumb path concatenation",
          id: "Penggabungan jalur breadcrumb rekursif"
        },
        code: "WITH RECURSIVE org_path AS (SELECT id, name, manager_id, CAST(name AS TEXT) AS path FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, CAST(p.path || ' -> ' || o.name AS TEXT) FROM org_hierarchy o INNER JOIN org_path p ON o.manager_id = p.id) SELECT name, path FROM org_path ORDER BY name;"
      }
    ],
    instructions: {
      en: "Build full organizational management paths starting from top leadership using arrows with spaces between names aliased as `path`, displaying employee `name` and `path` from `org_hierarchy`, ordered by `name`.",
      id: "Bangun jalur manajemen lengkap mulai dari pimpinan puncak menggunakan tanda panah dengan spasi antar nama beralias `path`, menampilkan `name` dan `path` dari tabel `org_hierarchy`, diurutkan berdasarkan `name`."
    },
    seed_sql: "mod6HierarchySeed",
    expected_query: "WITH RECURSIVE org_path AS (SELECT id, name, manager_id, CAST(name AS TEXT) AS path FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, CAST(p.path || ' -> ' || o.name AS TEXT) FROM org_hierarchy o INNER JOIN org_path p ON o.manager_id = p.id) SELECT name, path FROM org_path ORDER BY name;",
    starterQuery: "SELECT * FROM org_hierarchy;",
    table_names: ["org_hierarchy"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Generating Hierarchical Breadcrumb Paths with CONCAT (Var #2)",
          id: "Membuat Jalur Navigasi Breadcrumb Hierarkis dengan CONCAT (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Assembling management reporting chains into breadcrumb paths in MySQL.\n\nEngine Processing Behavior: Uses CONCAT within the recursive member to append subordinate names to the management chain.\n\nBest Practices & Gotchas: Cast the anchor path column to CHAR(255) to guarantee sufficient string allocation.",
          id: "Analogi Konseptual: Menyusun garis koordinasi manajerial menjadi jalur breadcrumb di MySQL.\n\nCara Kerja Database Engine: Menggunakan fungsi CONCAT pada query rekursif untuk menyambung nama bawahan ke jalur induk.\n\nBest Practices & Catatan Penting: Lakukan casting kolom awal ke CHAR(255) untuk memastikan ruang alokasi teks mencukupi."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL recursive path with CONCAT",
              id: "Jalur rekursif MySQL dengan CONCAT"
            },
            code: "WITH RECURSIVE org_path AS (SELECT id, name, manager_id, CAST(name AS CHAR(255)) AS path FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, CONCAT(p.path, ' -> ', o.name) FROM org_hierarchy o INNER JOIN org_path p ON o.manager_id = p.id) SELECT name, path FROM org_path ORDER BY name;"
          }
        ],
        instructions: {
          en: "Build full organizational management paths starting from top leadership using arrows with spaces between names aliased as `path`, displaying employee `name` and `path` from `org_hierarchy`, ordered by `name`.",
          id: "Bangun jalur manajemen lengkap mulai dari pimpinan puncak menggunakan tanda panah dengan spasi antar nama beralias `path`, menampilkan `name` dan `path` dari tabel `org_hierarchy`, diurutkan berdasarkan `name`."
        },
        expected_query: "WITH RECURSIVE org_path AS (SELECT id, name, manager_id, CAST(name AS CHAR(255)) AS path FROM org_hierarchy WHERE manager_id IS NULL UNION ALL SELECT o.id, o.name, o.manager_id, CONCAT(p.path, ' -> ', o.name) FROM org_hierarchy o INNER JOIN org_path p ON o.manager_id = p.id) SELECT name, path FROM org_path ORDER BY name;",
        starterQuery: "SELECT * FROM org_hierarchy;"
      }
    }
  },
  {
    id: 646,
    moduleId: 6,
    categorySlot: 10,
    title: {
      en: "Generating Sequential Numbers with Recursive Series (Var #3)",
      id: "Membuat Deret Angka Berurutan dengan Seri Rekursif (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A counter spinning upwards one tick at a time until reaching a target ceiling, synthesizing a calendar or sequence table out of thin air.\n\nEngine Processing Behavior: The anchor sets the initial value 1, and each recursive cycle increments the value until the terminating WHERE filter halts recursion.\n\nBest Practices & Gotchas: Always include a strict termination predicate (e.g. val < target) to avoid unbounded recursion exceptions.",
      id: "Analogi Konseptual: Penghitung angka yang terus berputar naik satu demi satu hingga mencapai batas tertentu, menciptakan deret data sintetis langsung di memori query.\n\nCara Kerja Database Engine: Anchor menetapkan nilai awal 1, lalu setiap iterasi rekursif menambahkan 1 ke nilai sebelumnya hingga kondisi filter WHERE menghentikan proses.\n\nBest Practices & Catatan Penting: Selalu sertakan predikat penghenti yang tegas (misalnya val < batas) untuk mencegah terjadinya error akibat perulangan tanpa batas."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Recursive sequence generator",
          id: "Generator deret angka rekursif"
        },
        code: "WITH RECURSIVE number_seq AS (SELECT 1 AS val UNION ALL SELECT val + 1 FROM number_seq WHERE val < 5) SELECT val FROM number_seq ORDER BY val;"
      }
    ],
    instructions: {
      en: "Generate an ordered series of integer numbers from 1 to 5 inclusive aliased as `val`, ordered by `val`.",
      id: "Buat deret bilangan bulat berurutan dari 1 sampai 5 inklusif beralias `val`, diurutkan berdasarkan `val`."
    },
    seed_sql: "mod6HierarchySeed",
    expected_query: "WITH RECURSIVE number_seq AS (SELECT 1 AS val UNION ALL SELECT val + 1 FROM number_seq WHERE val < 5) SELECT val FROM number_seq ORDER BY val;",
    starterQuery: "-- Generate sequence from 1 to 5",
    table_names: ["org_hierarchy"]
  },
  {
    id: 647,
    moduleId: 6,
    categorySlot: 10,
    title: {
      en: "Subtree Discovery for Engineering Department (Var #4)",
      id: "Penelusuran Sub-Pohon Tim Engineering (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Isolating a specific corporate branch by setting the anchor to a departmental lead and finding all personnel nested within their division.\n\nEngine Processing Behavior: The anchor query selects only 'Marcus Brody', and the recursive step retrieves all direct and indirect reports who roll up under him.\n\nBest Practices & Gotchas: Anchoring to specific sub-roots provides fast subtree extraction without scanning the entire organizational tree.",
      id: "Analogi Konseptual: Mengisolasi satu cabang divisi perusahaan dengan menetapkan kepala divisi sebagai titik awal untuk menemukan seluruh anggota di bawah kepemimpinannya.\n\nCara Kerja Database Engine: Anchor query hanya memilih baris 'Marcus Brody', lalu langkah rekursif secara otomatis mengambil seluruh bawahan langsung maupun tidak langsung.\n\nBest Practices & Catatan Penting: Menetapkan titik awal pada simpul sub-pohon tertentu mempercepat penelusuran data tanpa perlu memproses seluruh entitas organisasi."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Subtree recursive discovery",
          id: "Penelusuran sub-pohon rekursif"
        },
        code: "WITH RECURSIVE engineering_team AS (SELECT id, name, manager_id, role FROM org_hierarchy WHERE name = 'Marcus Brody' UNION ALL SELECT o.id, o.name, o.manager_id, o.role FROM org_hierarchy o INNER JOIN engineering_team e ON o.manager_id = e.id) SELECT name, role FROM engineering_team ORDER BY name;"
      }
    ],
    instructions: {
      en: "Find Marcus Brody and all team members reporting directly or indirectly under him, displaying `name` and `role` from `org_hierarchy`, ordered by `name`.",
      id: "Temukan Marcus Brody beserta seluruh anggota tim yang melapor secara langsung maupun tidak langsung di bawahnya, menampilkan `name` dan `role` dari tabel `org_hierarchy`, diurutkan berdasarkan `name`."
    },
    seed_sql: "mod6HierarchySeed",
    expected_query: "WITH RECURSIVE engineering_team AS (SELECT id, name, manager_id, role FROM org_hierarchy WHERE name = 'Marcus Brody' UNION ALL SELECT o.id, o.name, o.manager_id, o.role FROM org_hierarchy o INNER JOIN engineering_team e ON o.manager_id = e.id) SELECT name, role FROM engineering_team ORDER BY name;",
    starterQuery: "SELECT * FROM org_hierarchy;",
    table_names: ["org_hierarchy"]
  },

  // Slot 11: Data-Modifying Writable CTE
  {
    id: 648,
    moduleId: 6,
    categorySlot: 11,
    title: {
      en: "Archiving Closed Tickets with Data-Modifying CTE (Var #1)",
      id: "Mengarsipkan Tiket Selesai dengan CTE Pemodifikasi Data (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Moving physical files out of an active drawer and directly onto an archive clipboard in one seamless physical motion.\n\nEngine Processing Behavior: The CTE deletes closed ticket tuples from active_tickets, captures the deleted rows via RETURNING, and pipes them immediately to the outer SELECT.\n\nBest Practices & Gotchas: Data-modifying CTEs execute in a single atomic snapshot, preventing concurrency race conditions between read and delete operations.",
      id: "Analogi Konseptual: Memindahkan berkas dokumen dari laci aktif langsung ke papan arsip dalam satu gerakan tangan yang menyatu dan aman.\n\nCara Kerja Database Engine: Bagian CTE menghapus baris tiket selesai dari tabel active_tickets, menangkap baris yang terhapus menggunakan klausa RETURNING, dan langsung meneruskannya ke SELECT luar.\n\nBest Practices & Catatan Penting: CTE pemodifikasi data dieksekusi dalam satu snapshot transaksi atomik, mencegah terjadinya perebutan data (race condition) antar proses bersamaan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Delete returning in CTE",
          id: "Penghapusan dengan returning di dalam CTE"
        },
        code: "WITH moved AS (DELETE FROM active_tickets WHERE status = 'closed' RETURNING id, title, status, closed_at) SELECT id, title, status, closed_at FROM moved ORDER BY id;"
      }
    ],
    instructions: {
      en: "Purge all closed tickets from `active_tickets`, outputting the deleted tickets with `id`, `title`, `status`, and `closed_at`, ordered by `id`.",
      id: "Hapus semua tiket dengan status closed dari `active_tickets`, dan tampilkan data tiket yang dihapus dengan kolom `id`, `title`, `status`, dan `closed_at`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod6ArchiveSeed",
    expected_query: "WITH moved AS (DELETE FROM active_tickets WHERE status = 'closed' RETURNING id, title, status, closed_at) SELECT id, title, status, closed_at FROM moved ORDER BY id;",
    starterQuery: "SELECT * FROM active_tickets;",
    table_names: ["active_tickets"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Archiving Closed Tickets with Staged Result (Var #1)",
          id: "Mengarsipkan Tiket Selesai dengan Tabel Sementara (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Capturing records in a staging area before purging them from active storage in MySQL.\n\nEngine Processing Behavior: Stages closed records, executes the purge, and returns the staged output.\n\nBest Practices & Gotchas: Multi-step archival scripts maintain auditability in engines lacking writable CTEs.",
          id: "Analogi Konseptual: Menangkap data ke area penampungan sementara sebelum menghapusnya dari tabel operasional di MySQL.\n\nCara Kerja Database Engine: Menampung data tiket yang selesai, mengeksekusi penghapusan, lalu menampilkan data yang ditampung.\n\nBest Practices & Catatan Penting: Skrip arsip multi-langkah menjaga auditabilitas pada database engine yang belum mendukung writable CTE."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL staged archival query",
              id: "Query pengarsipan bertahap MySQL"
            },
            code: "CREATE TEMPORARY TABLE moved AS SELECT id, title, status, closed_at FROM active_tickets WHERE status = 'closed'; DELETE FROM active_tickets WHERE status = 'closed'; SELECT * FROM moved ORDER BY id;"
          }
        ],
        instructions: {
          en: "Purge all closed tickets from `active_tickets`, outputting the deleted tickets with `id`, `title`, `status`, and `closed_at`, ordered by `id`.",
          id: "Hapus semua tiket dengan status closed dari `active_tickets`, dan tampilkan data tiket yang dihapus dengan kolom `id`, `title`, `status`, dan `closed_at`, diurutkan berdasarkan `id`."
        },
        expected_query: "CREATE TEMPORARY TABLE moved AS SELECT id, title, status, closed_at FROM active_tickets WHERE status = 'closed'; DELETE FROM active_tickets WHERE status = 'closed'; SELECT * FROM moved ORDER BY id;",
        starterQuery: "SELECT * FROM active_tickets;"
      }
    }
  },
  {
    id: 649,
    moduleId: 6,
    categorySlot: 11,
    title: {
      en: "Atomic Status Transition with UPDATE RETURNING in CTE (Var #2)",
      id: "Peralihan Status Atomik dengan UPDATE RETURNING di CTE (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Upgrading the status of active work orders and simultaneously stamping an audit log of exactly what was modified.\n\nEngine Processing Behavior: Updates matching tuples in the primary relation and immediately passes the modified values out to the surrounding query.\n\nBest Practices & Gotchas: RETURNING inside a CTE eliminates the need for separate pre-fetch or post-fetch SELECT statements.",
      id: "Analogi Konseptual: Memperbarui status tiket investigasi menjadi terselesaikan sekaligus mencetak bukti data yang telah diubah secara instan.\n\nCara Kerja Database Engine: Memperbarui baris data yang cocok di tabel utama dan langsung mengalirkan data baru tersebut ke query luar.\n\nBest Practices & Catatan Penting: Klausa RETURNING di dalam CTE meniadakan kebutuhan query SELECT terpisah sebelum dan sesudah perubahan data."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Update returning in CTE",
          id: "Pembaruan data dengan returning di dalam CTE"
        },
        code: "WITH updated_tickets AS (UPDATE active_tickets SET status = 'resolved' WHERE status = 'investigating' RETURNING id, title, status) SELECT id, title, status FROM updated_tickets ORDER BY id;"
      }
    ],
    instructions: {
      en: "Update investigating tickets in `active_tickets` to have status 'resolved', displaying the modified tickets with `id`, `title`, and `status`, ordered by `id`.",
      id: "Perbarui tiket dengan status investigating pada `active_tickets` menjadi 'resolved', dan tampilkan data tiket yang diperbarui dengan `id`, `title`, dan `status`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod6ArchiveSeed",
    expected_query: "WITH updated_tickets AS (UPDATE active_tickets SET status = 'resolved' WHERE status = 'investigating' RETURNING id, title, status) SELECT id, title, status FROM updated_tickets ORDER BY id;",
    starterQuery: "SELECT * FROM active_tickets;",
    table_names: ["active_tickets"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Atomic Status Transition with Staged Update (Var #2)",
          id: "Peralihan Status Atomik dengan Pembaruan Bertahap (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Capturing transitioned records during an update operation in MySQL.\n\nEngine Processing Behavior: Stages the target rows with their new status and executes the update in place.\n\nBest Practices & Gotchas: Ensures deterministic result reporting across database engines.",
          id: "Analogi Konseptual: Menangkap baris data yang mengalami peralihan status selama operasi pembaruan di MySQL.\n\nCara Kerja Database Engine: Menampung baris sasaran dengan status baru lalu memperbarui tabel operasional secara langsung.\n\nBest Practices & Catatan Penting: Menjamin konsistensi hasil pembaruan antar berbagai database engine."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL staged update query",
              id: "Query pembaruan bertahap MySQL"
            },
            code: "CREATE TEMPORARY TABLE updated_tickets AS SELECT id, title, 'resolved' AS status FROM active_tickets WHERE status = 'investigating'; UPDATE active_tickets SET status = 'resolved' WHERE status = 'investigating'; SELECT id, title, status FROM updated_tickets ORDER BY id;"
          }
        ],
        instructions: {
          en: "Update investigating tickets in `active_tickets` to have status 'resolved', displaying the modified tickets with `id`, `title`, and `status`, ordered by `id`.",
          id: "Perbarui tiket dengan status investigating pada `active_tickets` menjadi 'resolved', dan tampilkan data tiket yang diperbarui dengan `id`, `title`, dan `status`, diurutkan berdasarkan `id`."
        },
        expected_query: "CREATE TEMPORARY TABLE updated_tickets AS SELECT id, title, 'resolved' AS status FROM active_tickets WHERE status = 'investigating'; UPDATE active_tickets SET status = 'resolved' WHERE status = 'investigating'; SELECT id, title, status FROM updated_tickets ORDER BY id;",
        starterQuery: "SELECT * FROM active_tickets;"
      }
    }
  },
  {
    id: 650,
    moduleId: 6,
    categorySlot: 11,
    title: {
      en: "Purge Counting via Writable CTE Aggregation (Var #3)",
      id: "Penghitungan Pembersihan Data via Agregasi Writable CTE (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Emptying out expired paperwork and having the paper shredder report the total tally of shredded documents in real time.\n\nEngine Processing Behavior: Purges matching rows and feeds the returned IDs directly into an aggregate COUNT function without an intermediate table.\n\nBest Practices & Gotchas: Using COUNT on RETURNING columns provides exact deletion counts without relying on driver-specific affected-row counts.",
      id: "Analogi Konseptual: Mengosongkan berkas usang dan meminta mesin penghancur kertas melaporkan total lembar yang dihancurkan secara langsung.\n\nCara Kerja Database Engine: Menghapus baris yang cocok dan mengalirkan ID hasil penghapusan langsung ke fungsi agregasi COUNT tanpa tabel perantara.\n\nBest Practices & Catatan Penting: Menjalankan COUNT pada kolom RETURNING memberikan jumlah data terhapus secara akurat tanpa bergantung pada metadata driver."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Count of deleted rows via CTE",
          id: "Menghitung baris terhapus via CTE"
        },
        code: "WITH deleted_tickets AS (DELETE FROM active_tickets WHERE closed_at < '2024-02-16' RETURNING id) SELECT COUNT(*) AS purged_count FROM deleted_tickets;"
      }
    ],
    instructions: {
      en: "Delete tickets closed prior to February 16, 2024 from `active_tickets` and display the count of deleted records aliased as `purged_count`.",
      id: "Hapus tiket yang diselesaikan sebelum 16 Februari 2024 dari `active_tickets` dan tampilkan total baris yang terhapus dengan alias `purged_count`."
    },
    seed_sql: "mod6ArchiveSeed",
    expected_query: "WITH deleted_tickets AS (DELETE FROM active_tickets WHERE closed_at < '2024-02-16' RETURNING id) SELECT COUNT(*) AS purged_count FROM deleted_tickets;",
    starterQuery: "SELECT * FROM active_tickets;",
    table_names: ["active_tickets"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Purge Counting with Staged Aggregation (Var #3)",
          id: "Penghitungan Pembersihan dengan Agregasi Bertahap (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Staging records to count the exact number of purged entities in MySQL.\n\nEngine Processing Behavior: Stages IDs of targeted rows, deletes from the main table, and aggregates the count.\n\nBest Practices & Gotchas: Staged counts confirm deletion totals before changes commit.",
          id: "Analogi Konseptual: Menampung data untuk menghitung jumlah entitas yang dibersihkan di MySQL.\n\nCara Kerja Database Engine: Menampung ID baris yang disasar, menghapusnya dari tabel utama, lalu mengagregasi totalnya.\n\nBest Practices & Catatan Penting: Penghitungan bertahap memastikan akurasi data terhapus sebelum transaksi diselesaikan."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL staged count of deleted rows",
              id: "Penghitungan baris terhapus bertahap MySQL"
            },
            code: "CREATE TEMPORARY TABLE deleted_tickets AS SELECT id FROM active_tickets WHERE closed_at < '2024-02-16'; DELETE FROM active_tickets WHERE closed_at < '2024-02-16'; SELECT COUNT(*) AS purged_count FROM deleted_tickets;"
          }
        ],
        instructions: {
          en: "Delete tickets closed prior to February 16, 2024 from `active_tickets` and display the count of deleted records aliased as `purged_count`.",
          id: "Hapus tiket yang diselesaikan sebelum 16 Februari 2024 dari `active_tickets` dan tampilkan total baris yang terhapus dengan alias `purged_count`."
        },
        expected_query: "CREATE TEMPORARY TABLE deleted_tickets AS SELECT id FROM active_tickets WHERE closed_at < '2024-02-16'; DELETE FROM active_tickets WHERE closed_at < '2024-02-16'; SELECT COUNT(*) AS purged_count FROM deleted_tickets;",
        starterQuery: "SELECT * FROM active_tickets;"
      }
    }
  },
  {
    id: 651,
    moduleId: 6,
    categorySlot: 11,
    title: {
      en: "Atomic Record Insertion and Confirmation via CTE (Var #4)",
      id: "Penyisipan dan Konfirmasi Rekaman Atomik via CTE (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Adding a new ticket to an active ticket dispatch system and instantly returning a ticket receipt to the requesting user.\n\nEngine Processing Behavior: Inserts the new tuple into the target table, captures the newly generated row values, and projects them through the outer query.\n\nBest Practices & Gotchas: Combines insertion and data retrieval into a single database roundtrip.",
      id: "Analogi Konseptual: Mendaftarkan tiket baru ke sistem penanganan tiket dan langsung mengembalikan struk bukti tiket ke pengguna pemohon.\n\nCara Kerja Database Engine: Menyisipkan baris baru ke tabel sasaran, menangkap nilai data baru tersebut, lalu memproyeksikannya keluar melalui query utama.\n\nBest Practices & Catatan Penting: Menggabungkan operasi penambahan data dan pembacaan kembali dalam satu round-trip database."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Insert returning via CTE",
          id: "Penyisipan data dengan returning via CTE"
        },
        code: "WITH new_ticket AS (INSERT INTO active_tickets VALUES (5, 'API rate limiter bug', 'open', NULL) RETURNING id, title, status) SELECT id, title, status FROM new_ticket;"
      }
    ],
    instructions: {
      en: "Insert a new ticket with `id` 5, title 'API rate limiter bug', status 'open', and null `closed_at` into `active_tickets`, outputting the inserted `id`, `title`, and `status`.",
      id: "Sisipkan tiket baru dengan `id` 5, judul 'API rate limiter bug', status 'open', dan `closed_at` bernilai null ke dalam `active_tickets`, lalu tampilkan kolom `id`, `title`, dan `status` dari data tersebut."
    },
    seed_sql: "mod6ArchiveSeed",
    expected_query: "WITH new_ticket AS (INSERT INTO active_tickets VALUES (5, 'API rate limiter bug', 'open', NULL) RETURNING id, title, status) SELECT id, title, status FROM new_ticket;",
    starterQuery: "SELECT * FROM active_tickets;",
    table_names: ["active_tickets"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Record Insertion and Confirmation (Var #4)",
          id: "Penyisipan dan Konfirmasi Rekaman (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Inserting a ticket and retrieving the confirmation record in MySQL.\n\nEngine Processing Behavior: Executes insertion followed by an immediate lookup of the inserted record.\n\nBest Practices & Gotchas: Ensures the newly inserted record matches expectations.",
          id: "Analogi Konseptual: Menyisipkan tiket dan mengambil rekaman konfirmasi di MySQL.\n\nCara Kerja Database Engine: Mengeksekusi penambahan data diikuti pembacaan data yang baru saja disisipkan.\n\nBest Practices & Catatan Penting: Memastikan data yang baru ditambahkan sesuai dengan ekspektasi sistem."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL insertion and select lookup",
              id: "Penyisipan dan seleksi rekaman MySQL"
            },
            code: "INSERT INTO active_tickets VALUES (5, 'API rate limiter bug', 'open', NULL); SELECT id, title, status FROM active_tickets WHERE id = 5;"
          }
        ],
        instructions: {
          en: "Insert a new ticket with `id` 5, title 'API rate limiter bug', status 'open', and null `closed_at` into `active_tickets`, outputting the inserted `id`, `title`, and `status`.",
          id: "Sisipkan tiket baru dengan `id` 5, judul 'API rate limiter bug', status 'open', dan `closed_at` bernilai null ke dalam `active_tickets`, lalu tampilkan kolom `id`, `title`, dan `status` dari data tersebut."
        },
        expected_query: "INSERT INTO active_tickets VALUES (5, 'API rate limiter bug', 'open', NULL); SELECT id, title, status FROM active_tickets WHERE id = 5;",
        starterQuery: "SELECT * FROM active_tickets;"
      }
    }
  }
];

console.log("Module 6 questions defined:", m6Questions.length);

module.exports = { m4Questions, m5Questions, m6Questions };
