const fs = require('fs');

// ===== MODULE 7 QUESTIONS =====
const m7Questions = [
  // Slot 7: Window Frame Clauses — ROWS BETWEEN
  {
    id: 734,
    moduleId: 7,
    categorySlot: 7,
    title: {
      en: "Cumulative Running Balance with Window Frame (Var #1)",
      id: "Akumulasi Saldo Berjalan dengan Window Frame (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A running total acts like a running meter in a marathon: as each runner crosses a checkpoint, the meter aggregates the total distance covered from the very beginning up to that exact participant.\n\nEngine Processing Behavior: The window framing clause bounds aggregate computation from the very first row of the partition (UNBOUNDED PRECEDING) up to the CURRENT ROW, maintaining an running accumulator in memory.\n\nBest Practices & Gotchas: Omitting the frame clause on an ORDER BY window defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which can group duplicate metric values together; ROWS BETWEEN guarantees strict row-by-row aggregation.",
      id: "Analogi Konseptual: Total akumulasi berjalan bekerja seperti odometer jarak pada maraton: saat setiap pelari melewati pos, alat ukur menjumlahkan total jarak dari garis awal hingga pelari saat ini.\n\nCara Kerja Database Engine: Klausa window framing membatasi komputasi agregasi mulai dari baris paling awal partisi (UNBOUNDED PRECEDING) hingga baris saat ini (CURRENT ROW), menyimpan akumulator di memori kerja.\n\nBest Practices & Catatan Penting: Mengabaikan klausa frame pada window ORDER BY menerapkan default RANGE yang dapat menyatukan nilai ganda; gunakan ROWS BETWEEN untuk agregasi baris per baris yang deterministik."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Running total with unbounded preceding frame",
          id: "Total berjalan dengan frame unbounded preceding"
        },
        code: "SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM accounts ORDER BY id;"
      }
    ],
    instructions: {
      en: "Calculate a cumulative running total of balance from the first row through the current row ordered by id aliased as `running_total`, displaying `id`, `owner`, `balance`, and `running_total` from `accounts`, ordered by `id`.",
      id: "Hitung total akumulasi saldo berjalan dari baris awal hingga baris saat ini diurutkan berdasarkan id beralias `running_total`, menampilkan `id`, `owner`, `balance`, dan `running_total` dari tabel `accounts`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM accounts ORDER BY id;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },
  {
    id: 735,
    moduleId: 7,
    categorySlot: 7,
    title: {
      en: "Three-Row Moving Average Calculation (Var #2)",
      id: "Perhitungan Rata-rata Bergerak Tiga Baris (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A moving average smooths short-term fluctuations by averaging a sliding viewport across recent data points, like smoothing daily stock prices over recent trading days.\n\nEngine Processing Behavior: For each row, the window engine buffers the previous 2 rows plus the current row, evaluates the average across this 3-tuple frame, and rounds the metric.\n\nBest Practices & Gotchas: Boundary rows at the start of the table evaluate smaller frames (e.g. 1 or 2 rows) without error.",
      id: "Analogi Konseptual: Rata-rata bergerak meredam fluktuasi jangka pendek dengan menghitung rata-rata jendela data terkini, seperti menghaluskan grafik harga harian saham.\n\nCara Kerja Database Engine: Untuk setiap baris, window engine menampung 2 baris sebelumnya ditambah baris saat ini, lalu menghitung rata-rata frame 3 baris tersebut dan membulatkannya.\n\nBest Practices & Catatan Penting: Baris-baris awal pada tabel secara otomatis mengevaluasi frame yang lebih kecil (1 atau 2 baris) secara anggun tanpa menghasilkan error."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Moving average over preceding rows",
          id: "Rata-rata bergerak atas baris sebelumnya"
        },
        code: "SELECT id, owner, balance, ROUND(AVG(balance) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg FROM accounts ORDER BY id;"
      }
    ],
    instructions: {
      en: "Calculate a 3-row moving average of balance covering 2 preceding rows and the current row rounded to two decimals aliased as `moving_avg`, displaying `id`, `owner`, `balance`, and `moving_avg` from `accounts`, ordered by `id`.",
      id: "Hitung rata-rata bergerak 3 baris dari saldo mencakup 2 baris sebelumnya dan baris saat ini dibulatkan ke dua desimal beralias `moving_avg`, menampilkan `id`, `owner`, `balance`, dan `moving_avg` dari tabel `accounts`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, balance, ROUND(AVG(balance) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg FROM accounts ORDER BY id;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },
  {
    id: 736,
    moduleId: 7,
    categorySlot: 7,
    title: {
      en: "Forward-Looking Window Frame Aggregation (Var #3)",
      id: "Agregasi Window Frame Menatap ke Depan (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Looking ahead to paired subsequent milestones, combining current obligations with the immediately upcoming cycle.\n\nEngine Processing Behavior: The execution engine extends the window frame ahead by 1 row (1 FOLLOWING), summing the current row and its immediate successor.\n\nBest Practices & Gotchas: Frame specifications can navigate both backward (PRECEDING) and forward (FOLLOWING) relative to the active row.",
      id: "Analogi Konseptual: Menengok ke depan pada jadwal pencapaian berikutnya, menggabungkan beban saat ini dengan siklus terdekat yang akan datang.\n\nCara Kerja Database Engine: Engine eksekusi memperluas frame jendela ke depan sebanyak 1 baris (1 FOLLOWING), menjumlahkan baris saat ini dengan baris tepat setelahnya.\n\nBest Practices & Catatan Penting: Spesifikasi frame dapat bergerak mundur (PRECEDING) maupun maju ke depan (FOLLOWING) relatif terhadap baris aktif."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Window frame with following rows",
          id: "Window frame dengan baris following"
        },
        code: "SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING) AS next_window_sum FROM accounts ORDER BY id;"
      }
    ],
    instructions: {
      en: "Sum the balance of the current row and the immediate next row aliased as `next_window_sum`, displaying `id`, `owner`, `balance`, and `next_window_sum` from `accounts`, ordered by `id`.",
      id: "Jumlahkan saldo baris saat ini dan tepat satu baris setelahnya beralias `next_window_sum`, menampilkan `id`, `owner`, `balance`, dan `next_window_sum` dari tabel `accounts`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, balance, SUM(balance) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING) AS next_window_sum FROM accounts ORDER BY id;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },

  // Slot 8: Value & Distribution Window Functions
  {
    id: 737,
    moduleId: 7,
    categorySlot: 8,
    title: {
      en: "Category Peak Earner Lookup with FIRST_VALUE (Var #1)",
      id: "Pencarian Pemilik Saldo Teratas Kategori dengan FIRST_VALUE (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Stamping the name of the gold-medal champion in each division across every contestant's scorecard for comparison.\n\nEngine Processing Behavior: Within each category partition ordered by balance descending, the engine retrieves the value of owner from the very first ranked row.\n\nBest Practices & Gotchas: FIRST_VALUE requires explicit partition ordering to determine which row is considered first.",
      id: "Analogi Konseptual: Menempelkan nama juara peraih medali emas di setiap divisi pada kartu nilai semua peserta sebagai perbandingan.\n\nCara Kerja Database Engine: Di setiap partisi kategori yang diurutkan dari saldo tertinggi, engine mengambil nilai kolom owner dari baris peringkat paling pertama.\n\nBest Practices & Catatan Penting: FIRST_VALUE memerlukan klausa pengurutan partisi yang tegas untuk menentukan baris mana yang dianggap pertama."
    },
    syntaxPatterns: [
      {
        label: {
          en: "FIRST_VALUE in partition",
          id: "FIRST_VALUE dalam partisi"
        },
        code: "SELECT id, owner, category, balance, FIRST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC) AS top_owner FROM accounts ORDER BY category, balance DESC;"
      }
    ],
    instructions: {
      en: "Identify the top account owner per category using window value functions aliased as `top_owner`, displaying `id`, `owner`, `category`, `balance`, and `top_owner` from `accounts`, ordered by `category` and `balance` descending.",
      id: "Identifikasi pemilik akun saldo tertinggi per kategori menggunakan fungsi analitik nilai beralias `top_owner`, menampilkan `id`, `owner`, `category`, `balance`, dan `top_owner` dari tabel `accounts`, diurutkan berdasarkan `category` dan `balance` menurun."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, category, balance, FIRST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC) AS top_owner FROM accounts ORDER BY category, balance DESC;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },
  {
    id: 738,
    moduleId: 7,
    categorySlot: 8,
    title: {
      en: "Next Account Balance Peeking with LEAD (Var #2)",
      id: "Mengintip Saldo Akun Berikutnya dengan LEAD (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Peeking one step forward in line to see the next customer's balance without stepping out of sequence.\n\nEngine Processing Behavior: The LEAD function fetches values from following tuples based on an offset distance without requiring self-joins.\n\nBest Practices & Gotchas: The final tuple in the ordering will return NULL for LEAD unless an explicit default fallback value is supplied.",
      id: "Analogi Konseptual: Mengintip satu langkah ke depan dalam antrean untuk melihat saldo pelanggan berikutnya tanpa merusak barisan.\n\nCara Kerja Database Engine: Fungsi LEAD mengambil nilai dari baris berikutnya berdasarkan jarak offset tanpa memerlukan operasi self-join yang membebani memori.\n\nBest Practices & Catatan Penting: Baris terakhir dalam urutan akan menghasilkan nilai NULL untuk LEAD kecuali nilai default alternatif disediakan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "LEAD value lookup",
          id: "Pencarian nilai dengan LEAD"
        },
        code: "SELECT id, owner, balance, LEAD(balance, 1) OVER (ORDER BY balance ASC) AS next_balance FROM accounts ORDER BY balance ASC;"
      }
    ],
    instructions: {
      en: "Look ahead to the next higher account balance in ascending sequence aliased as `next_balance`, displaying `id`, `owner`, `balance`, and `next_balance` from `accounts`, ordered by `balance` ascending.",
      id: "Lihat saldo akun berikutnya yang lebih tinggi dalam urutan menaik beralias `next_balance`, menampilkan `id`, `owner`, `balance`, dan `next_balance` dari tabel `accounts`, diurutkan berdasarkan `balance` menaik."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, balance, LEAD(balance, 1) OVER (ORDER BY balance ASC) AS next_balance FROM accounts ORDER BY balance ASC;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },
  {
    id: 739,
    moduleId: 7,
    categorySlot: 8,
    title: {
      en: "Wealth Quartile Distribution with NTILE (Var #3)",
      id: "Distribusi Kuartil Kekayaan dengan NTILE (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Dividing a group of test takers into four equal performance quartiles (top 25%, upper-mid, lower-mid, bottom 25%).\n\nEngine Processing Behavior: The NTILE function divides the sorted partition into N equal buckets, assigning each row an integer bucket identifier from 1 to N.\n\nBest Practices & Gotchas: If the row count is not evenly divisible by N, earlier buckets receive the extra remaining rows.",
      id: "Analogi Konseptual: Membagi kelompok peserta ujian ke dalam empat kuartil prestasi yang sama besar (25% teratas, menengah-atas, menengah-bawah, 25% terbawah).\n\nCara Kerja Database Engine: Fungsi NTILE membagi partisi yang telah terurut ke dalam N kelompok berukuran seimbang, memberikan nomor kelompok integer 1 sampai N pada tiap baris.\n\nBest Practices & Catatan Penting: Jika jumlah baris tidak habis dibagi N, kelompok-kelompok bernomor awal akan menampung sisa baris ekstra tersebut."
    },
    syntaxPatterns: [
      {
        label: {
          en: "NTILE quartile assignment",
          id: "Penetapan kuartil dengan NTILE"
        },
        code: "SELECT id, owner, balance, NTILE(4) OVER (ORDER BY balance DESC) AS quartile FROM accounts ORDER BY balance DESC, id;"
      }
    ],
    instructions: {
      en: "Divide accounts into four equal wealth quartiles based on descending balance aliased as `quartile`, displaying `id`, `owner`, `balance`, and `quartile` from `accounts`, ordered by `balance` descending and `id`.",
      id: "Bagi akun ke dalam empat kuartil kekayaan seimbang berdasarkan saldo menurun beralias `quartile`, menampilkan `id`, `owner`, `balance`, dan `quartile` dari tabel `accounts`, diurutkan berdasarkan `balance` menurun dan `id`."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, balance, NTILE(4) OVER (ORDER BY balance DESC) AS quartile FROM accounts ORDER BY balance DESC, id;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },
  {
    id: 740,
    moduleId: 7,
    categorySlot: 8,
    title: {
      en: "Category Baseline Lookup with LAST_VALUE and Explicit Frame (Var #4)",
      id: "Pencarian Saldo Terendah Kategori dengan LAST_VALUE dan Frame Eksplisit (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Looking all the way to the end of each category's roster to find the minimum entry point balance.\n\nEngine Processing Behavior: The default frame stops at CURRENT ROW, which causes LAST_VALUE to simply return the current row; extending the frame with UNBOUNDED FOLLOWING allows LAST_VALUE to inspect the true partition boundary.\n\nBest Practices & Gotchas: Always specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING when using LAST_VALUE.",
      id: "Analogi Konseptual: Melihat hingga ke ujung paling akhir daftar setiap kategori untuk mengetahui saldo awal batas terbawah.\n\nCara Kerja Database Engine: Batasan frame default berhenti pada CURRENT ROW sehingga LAST_VALUE hanya membaca baris saat ini; memperluas frame dengan UNBOUNDED FOLLOWING memungkinkan LAST_VALUE membaca baris partisi paling ujung.\n\nBest Practices & Catatan Penting: Selalu cantumkan ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ketika menggunakan LAST_VALUE."
    },
    syntaxPatterns: [
      {
        label: {
          en: "LAST_VALUE with full frame",
          id: "LAST_VALUE dengan frame penuh"
        },
        code: "SELECT id, owner, category, balance, LAST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_owner FROM accounts ORDER BY category, balance DESC;"
      }
    ],
    instructions: {
      en: "Find the lowest-balance account owner per category using value functions with full partition framing aliased as `lowest_owner`, displaying `id`, `owner`, `category`, `balance`, and `lowest_owner` from `accounts`, ordered by `category` and `balance` descending.",
      id: "Temukan pemilik akun dengan saldo terendah per kategori menggunakan fungsi nilai dengan frame partisi penuh beralias `lowest_owner`, menampilkan `id`, `owner`, `category`, `balance`, dan `lowest_owner` dari tabel `accounts`, diurutkan berdasarkan `category` dan `balance` menurun."
    },
    seed_sql: "mod7Seed",
    expected_query: "SELECT id, owner, category, balance, LAST_VALUE(owner) OVER (PARTITION BY category ORDER BY balance DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_owner FROM accounts ORDER BY category, balance DESC;",
    starterQuery: "SELECT * FROM accounts;",
    table_names: ["accounts"]
  },

  // Slot 9: Materialized Views
  {
    id: 741,
    moduleId: 7,
    categorySlot: 9,
    title: {
      en: "Creating Precomputed Aggregations with Materialized View (Var #1)",
      id: "Membuat Agregasi Terkomputasi dengan Materialized View (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Printing a physical summary report and storing it in a binder rather than recalculating millions of receipts on every customer visit.\n\nEngine Processing Behavior: A materialized view executes the defining query once and writes the resulting tuple pages permanently to disk storage, allowing subsequent queries to scan the cached snapshot at blinding speed.\n\nBest Practices & Gotchas: Materialized views do not update automatically when underlying tables change; they must be periodically refreshed.",
      id: "Analogi Konseptual: Mencetak laporan ringkasan fisik ke dalam map berkas alih-alih menghitung ulang jutaan lembar struk setiap kali ada pelanggan yang bertanya.\n\nCara Kerja Database Engine: Materialized view mengeksekusi query pendefinisi satu kali lalu menulis halaman data hasilnya secara permanen ke disk storage, sehingga pembacaan berikutnya berlangsung instan tanpa proses agregasi ulang.\n\nBest Practices & Catatan Penting: Materialized view tidak otomatis terbarui saat tabel dasar mengalami mutasi data; view ini harus disegarkan secara berkala."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Create materialized view",
          id: "Pembuatan materialized view"
        },
        code: "CREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;"
      }
    ],
    instructions: {
      en: "Create a materialized view named `premium_accounts_summary` storing `category`, `total_accounts`, and `total_balance` for accounts with balance at least 3000 grouped by `category`.",
      id: "Buat materialized view bernama `premium_accounts_summary` yang menyimpan `category`, `total_accounts`, dan `total_balance` untuk akun bersaldo minimal 3000 dikelompokkan berdasarkan `category`."
    },
    seed_sql: "mod7Seed",
    expected_query: "CREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;",
    starterQuery: "-- Create materialized view here",
    table_names: ["accounts"],
    isDdlCreate: true,
    mockPreviewData: {
      tableName: "premium_accounts_summary",
      columns: ["category", "total_accounts", "total_balance"],
      rows: [
        { category: "Premium", total_accounts: 3, total_balance: 20100 },
        { category: "Standard", total_accounts: 2, total_balance: 7300 }
      ]
    },
    engineOverrides: {
      mysql: {
        title: {
          en: "Creating Precomputed Aggregations with Standard View (Var #1)",
          id: "Membuat Agregasi Terkomputasi dengan View Standar (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Encapsulating heavy aggregation queries into reusable virtual table views in MySQL.\n\nEngine Processing Behavior: Stores the query definition in the data dictionary for transparent querying.\n\nBest Practices & Gotchas: Standard views present real-time projections of underlying tables.",
          id: "Analogi Konseptual: Membungkus query agregasi kompleks ke dalam view tabel virtual yang dapat digunakan kembali di MySQL.\n\nCara Kerja Database Engine: Menyimpan definisi query ke kamus data untuk kemudahan pemanggilan query berikutnya.\n\nBest Practices & Catatan Penting: View standar menyajikan proyeksi data terkini dari tabel dasarnya secara langsung."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL view creation",
              id: "Pembuatan view MySQL"
            },
            code: "CREATE VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;"
          }
        ],
        instructions: {
          en: "Create a view named `premium_accounts_summary` storing `category`, `total_accounts`, and `total_balance` for accounts with balance at least 3000 grouped by `category`.",
          id: "Buat view bernama `premium_accounts_summary` yang menyimpan `category`, `total_accounts`, dan `total_balance` untuk akun bersaldo minimal 3000 dikelompokkan berdasarkan `category`."
        },
        expected_query: "CREATE VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;",
        starterQuery: "-- Create view here"
      }
    }
  },
  {
    id: 742,
    moduleId: 7,
    categorySlot: 9,
    title: {
      en: "Refreshing Cached Materialized View Snapshots (Var #2)",
      id: "Menyegarkan Snapshot Cache Materialized View (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Tearing off the old monthly summary and re-running the numbers from latest base records to update the physical binder.\n\nEngine Processing Behavior: Re-executes the underlying query of the materialized view, populates a new storage page set, and swaps the pointer to the fresh dataset.\n\nBest Practices & Gotchas: Use REFRESH MATERIALIZED VIEW CONCURRENTLY in production systems to allow reads while the refresh proceeds in the background (requires a unique index).",
      id: "Analogi Konseptual: Mencetak ulang lembar ringkasan bulanan dengan menghitung data terkini dari transaksi dasar untuk memperbarui dokumen fisik.\n\nCara Kerja Database Engine: Mengeksekusi ulang query pendefinisi dari materialized view, menyusun kumpulan halaman disk baru, lalu mengalihkan pointer ke data segar tersebut.\n\nBest Practices & Catatan Penting: Gunakan opsi CONCURRENTLY pada sistem produksi agar pembacaan data tetap berjalan lancar saat proses penyegaran berlangsung di latar belakang."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Refresh materialized view",
          id: "Penyegaran materialized view"
        },
        code: "REFRESH MATERIALIZED VIEW premium_accounts_summary;"
      }
    ],
    instructions: {
      en: "Refresh the stored snapshot of the `premium_accounts_summary` materialized view.",
      id: "Segarkan snapshot data tersimpan dari materialized view `premium_accounts_summary`."
    },
    seed_sql: "mod7Seed\nCREATE MATERIALIZED VIEW premium_accounts_summary AS SELECT category, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts WHERE balance >= 3000 GROUP BY category;",
    expected_query: "REFRESH MATERIALIZED VIEW premium_accounts_summary;",
    starterQuery: "-- Refresh view here",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Querying Refreshed Summary View (Var #2)",
          id: "Membaca View Ringkasan Terkini (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Inspecting the updated data output from an analytical view in MySQL.\n\nEngine Processing Behavior: Scans and returns pre-aggregated data records.\n\nBest Practices & Gotchas: Views reflect underlying mutations dynamically.",
          id: "Analogi Konseptual: Memeriksa data hasil kalkulasi terbaru dari view analitik di MySQL.\n\nCara Kerja Database Engine: Membaca dan mengembalikan baris data yang telah diagregasikan.\n\nBest Practices & Catatan Penting: View di MySQL secara dinamis mencerminkan perubahan data pada tabel dasar."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL select from view",
              id: "Seleksi data view MySQL"
            },
            code: "SELECT category, total_accounts, total_balance FROM premium_accounts_summary ORDER BY category;"
          }
        ],
        instructions: {
          en: "Display `category`, `total_accounts`, and `total_balance` from the `premium_accounts_summary` view, ordered by `category`.",
          id: "Tampilkan `category`, `total_accounts`, dan `total_balance` dari view `premium_accounts_summary`, diurutkan berdasarkan `category`."
        },
        expected_query: "SELECT category, total_accounts, total_balance FROM premium_accounts_summary ORDER BY category;",
        starterQuery: "SELECT * FROM premium_accounts_summary;"
      }
    }
  },
  {
    id: 743,
    moduleId: 7,
    categorySlot: 9,
    title: {
      en: "Creating Materialized View for High Value Accounts (Var #3)",
      id: "Membuat Materialized View untuk Akun Bernilai Tinggi (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Creating a dedicated VIP ledger containing only top-tier clientele for ultra-fast customer service lookups.\n\nEngine Processing Behavior: Filters tuples with balance above 5000 and materializes the owner and balance columns into dedicated storage pages.\n\nBest Practices & Gotchas: Materializing heavily filtered, read-heavy subsets avoids scanning large base tables repeatedly.",
      id: "Analogi Konseptual: Membuat buku kas khusus VIP yang hanya memuat nasabah prioritas utama untuk mempercepat layanan nasabah secara instan.\n\nCara Kerja Database Engine: Menyaring baris akun bersaldo di atas 5000 dan mematerialisasikan kolom nama serta saldo ke halaman disk terpisah.\n\nBest Practices & Catatan Penting: Mematerialisasikan subset data yang sering dibaca menghemat I/O disk secara signifikan karena tidak perlu memindai tabel induk yang besar."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Create filtered materialized view",
          id: "Pembuatan materialized view dengan filter"
        },
        code: "CREATE MATERIALIZED VIEW vip_accounts AS SELECT id, owner, balance FROM accounts WHERE balance >= 5000;"
      }
    ],
    instructions: {
      en: "Create a materialized view named `vip_accounts` containing `id`, `owner`, and `balance` for all accounts with balance at least 5000.",
      id: "Buat materialized view bernama `vip_accounts` yang memuat `id`, `owner`, dan `balance` untuk seluruh akun yang memiliki saldo minimal 5000."
    },
    seed_sql: "mod7Seed",
    expected_query: "CREATE MATERIALIZED VIEW vip_accounts AS SELECT id, owner, balance FROM accounts WHERE balance >= 5000;",
    starterQuery: "-- Create VIP materialized view",
    table_names: ["accounts"],
    isDdlCreate: true,
    mockPreviewData: {
      tableName: "vip_accounts",
      columns: ["id", "owner", "balance"],
      rows: [
        { id: 1, owner: "Alice", balance: 5000 },
        { id: 4, owner: "Diana", balance: 8900 },
        { id: 7, owner: "George", balance: 6200 }
      ]
    },
    engineOverrides: {
      mysql: {
        title: {
          en: "Creating Filtered VIP View (Var #3)",
          id: "Membuat View VIP Tersaring (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Creating a reusable VIP virtual table view in MySQL.\n\nEngine Processing Behavior: Encapsulates the filter into a named view definition.\n\nBest Practices & Gotchas: Simplifies application query construction.",
          id: "Analogi Konseptual: Membuat view tabel virtual VIP yang dapat dipanggil berulang di MySQL.\n\nCara Kerja Database Engine: Membungkus filter saldo ke dalam definisi objek view.\n\nBest Practices & Catatan Penting: Memudahkan penulisan query aplikasi tanpa perlu mengulang filter yang sama."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL VIP view",
              id: "View VIP MySQL"
            },
            code: "CREATE VIEW vip_accounts AS SELECT id, owner, balance FROM accounts WHERE balance >= 5000;"
          }
        ],
        instructions: {
          en: "Create a view named `vip_accounts` containing `id`, `owner`, and `balance` for all accounts with balance at least 5000.",
          id: "Buat view bernama `vip_accounts` yang memuat `id`, `owner`, dan `balance` untuk seluruh akun yang memiliki saldo minimal 5000."
        },
        expected_query: "CREATE VIEW vip_accounts AS SELECT id, owner, balance FROM accounts WHERE balance >= 5000;",
        starterQuery: "-- Create view here"
      }
    }
  }
];

// ===== MODULE 8 QUESTIONS =====
const m8Questions = [
  // Slot 5: Transaction Isolation Levels
  {
    id: 821,
    moduleId: 8,
    categorySlot: 5,
    title: {
      en: "Setting Repeatable Read Isolation Level (Var #1)",
      id: "Mengatur Tingkat Isolasi Repeatable Read (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Locking a snapshot photograph of the ledger: regardless of how many changes other tellers make while you work, every glance at your ledger shows the exact same numbers.\n\nEngine Processing Behavior: In REPEATABLE READ, the transaction freezes its read view at the first query, guaranteeing that repeated SELECT statements within the transaction see identical data without non-repeatable reads.\n\nBest Practices & Gotchas: Write conflicts abort if concurrent transactions modify the same target rows; applications should include retry logic for serialization failures.",
      id: "Analogi Konseptual: Mengunci foto snapshot dari buku kas: sebanyak apa pun perubahan yang dilakukan kasir lain saat Anda bekerja, setiap kali Anda memeriksa buku, angkanya selalu sama persis.\n\nCara Kerja Database Engine: Pada tingkat REPEATABLE READ, transaksi membekukan read view pada query pertama, menjamin perintah SELECT berulang di dalam transaksi melihat data yang identik tanpa non-repeatable read.\n\nBest Practices & Catatan Penting: Konflik penulisan data akan menggagalkan transaksi jika ada proses lain yang mengubah baris yang sama; siapkan mekanisme retry di aplikasi."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Set Repeatable Read transaction",
          id: "Set transaksi Repeatable Read"
        },
        code: "BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT * FROM accounts WHERE id = 1; COMMIT;"
      }
    ],
    instructions: {
      en: "Execute a transaction setting isolation level to Repeatable Read, selecting the account with id 1, and committing the transaction.",
      id: "Jalankan blok transaksi yang mengatur tingkat isolasi menjadi Repeatable Read, memilih akun dengan id 1, lalu menyelesaikan transaksi."
    },
    seed_sql: "mod8Seed",
    expected_query: "BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT * FROM accounts WHERE id = 1; COMMIT;",
    starterQuery: "SELECT * FROM accounts WHERE id = 1;",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Setting Repeatable Read Isolation Level in MySQL (Var #1)",
          id: "Mengatur Tingkat Isolasi Repeatable Read di MySQL (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Ensuring consistent snapshot reads in MySQL InnoDB.\n\nEngine Processing Behavior: Sets transaction characteristics and enforces MVCC read view consistency.\n\nBest Practices & Gotchas: REPEATABLE READ is the default isolation level in MySQL InnoDB.",
          id: "Analogi Konseptual: Menjamin konsistensi pembacaan data snapshot di MySQL InnoDB.\n\nCara Kerja Database Engine: Menetapkan karakteristik transaksi dan menerapkan konsistensi read view MVCC.\n\nBest Practices & Catatan Penting: REPEATABLE READ merupakan tingkat isolasi bawaan pada engine InnoDB MySQL."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL transaction isolation set",
              id: "Penetapan isolasi transaksi MySQL"
            },
            code: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; SELECT * FROM accounts WHERE id = 1; COMMIT;"
          }
        ],
        instructions: {
          en: "Execute a transaction setting isolation level to Repeatable Read, selecting the account with id 1, and committing the transaction.",
          id: "Jalankan blok transaksi yang mengatur tingkat isolasi menjadi Repeatable Read, memilih akun dengan id 1, lalu menyelesaikan transaksi."
        },
        expected_query: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; SELECT * FROM accounts WHERE id = 1; COMMIT;",
        starterQuery: "SELECT * FROM accounts WHERE id = 1;"
      }
    }
  },
  {
    id: 822,
    moduleId: 8,
    categorySlot: 5,
    title: {
      en: "Enforcing Strict Serializable Transaction Isolation (Var #2)",
      id: "Menerapkan Isolasi Transaksi Serializable yang Ketat (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Single-file processing: transactions behave as though they occurred sequentially one after another, completely preventing phantom reads and write skews.\n\nEngine Processing Behavior: SERIALIZABLE tracks read and write dependencies (SIREAD locks in PostgreSQL) across concurrent transactions, aborting any transaction that exhibits anomalous dependency interleaving.\n\nBest Practices & Gotchas: Highest safety level at the cost of potential serialization aborts under high write contention; prepare robust application retry loops.",
      id: "Analogi Konseptual: Pemrosesan satu jalur: seluruh transaksi berperilaku seolah-olah dieksekusi berurutan satu per satu, mencegah munculnya phantom read maupun write skew secara total.\n\nCara Kerja Database Engine: SERIALIZABLE memantau dependensi baca dan tulis (SIREAD lock pada PostgreSQL) antar transaksi bersamaan, membatalkan transaksi jika terjadi anomali tumpang tindih.\n\nBest Practices & Catatan Penting: Menawarkan tingkat keamanan integritas tertinggi dengan konsekuensi potensi abort saat beban tulis tinggi; lengkapi aplikasi dengan siklus retry otomatis."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Set Serializable transaction",
          id: "Set transaksi Serializable"
        },
        code: "BEGIN; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; SELECT * FROM accounts WHERE id = 2; COMMIT;"
      }
    ],
    instructions: {
      en: "Execute a transaction configuring Serializable isolation level, reading account details for id 2, and concluding with a commit.",
      id: "Jalankan blok transaksi yang mengonfigurasi tingkat isolasi Serializable, membaca data akun untuk id 2, lalu diakhiri dengan commit."
    },
    seed_sql: "mod8Seed",
    expected_query: "BEGIN; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; SELECT * FROM accounts WHERE id = 2; COMMIT;",
    starterQuery: "SELECT * FROM accounts WHERE id = 2;",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Enforcing Serializable Isolation in MySQL (Var #2)",
          id: "Menerapkan Isolasi Serializable di MySQL (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Locking all read rows implicitly in MySQL serializable transactions.\n\nEngine Processing Behavior: Converts standard SELECT statements into shared locks automatically under serializable mode.\n\nBest Practices & Gotchas: Prevents phantoms by acquiring gap locks in InnoDB.",
          id: "Analogi Konseptual: Mengunci semua baris pembacaan secara implisit pada transaksi serializable di MySQL.\n\nCara Kerja Database Engine: Mengonversi perintah SELECT biasa menjadi shared lock secara otomatis di mode serializable.\n\nBest Practices & Catatan Penting: Mencegah terjadinya phantom read dengan menerapkan gap lock pada InnoDB."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL Serializable transaction",
              id: "Transaksi Serializable MySQL"
            },
            code: "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; BEGIN; SELECT * FROM accounts WHERE id = 2; COMMIT;"
          }
        ],
        instructions: {
          en: "Execute a transaction configuring Serializable isolation level, reading account details for id 2, and concluding with a commit.",
          id: "Jalankan blok transaksi yang mengonfigurasi tingkat isolasi Serializable, membaca data akun untuk id 2, lalu diakhiri dengan commit."
        },
        expected_query: "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; BEGIN; SELECT * FROM accounts WHERE id = 2; COMMIT;",
        starterQuery: "SELECT * FROM accounts WHERE id = 2;"
      }
    }
  },
  {
    id: 823,
    moduleId: 8,
    categorySlot: 5,
    title: {
      en: "Filtering Accounts under Read Committed Isolation (Var #3)",
      id: "Menyaring Akun di Bawah Isolasi Read Committed (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Reading the public bulletin board: each query in your transaction sees whatever was officially posted and committed up to that exact moment.\n\nEngine Processing Behavior: In READ COMMITTED, each individual statement acquires a fresh snapshot of committed database state.\n\nBest Practices & Gotchas: Default in PostgreSQL; excellent concurrency throughput with minimal serialization conflict overhead.",
      id: "Analogi Konseptual: Membaca papan pengumuman umum: setiap query di dalam transaksi Anda melihat apa pun yang telah resmi ditempel dan di-commit hingga detik tersebut.\n\nCara Kerja Database Engine: Pada tingkat READ COMMITTED, setiap pernyataan query tunggal mengambil snapshot segar dari kondisi database yang telah ter-commit.\n\nBest Practices & Catatan Penting: Merupakan tingkat isolasi default di PostgreSQL; menawarkan throughput konkurensi luar biasa dengan minim risiko konflik serialisasi."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Set Read Committed isolation",
          id: "Set isolasi Read Committed"
        },
        code: "BEGIN; SET TRANSACTION ISOLATION LEVEL READ COMMITTED; SELECT * FROM accounts WHERE category = 'Premium' ORDER BY id; COMMIT;"
      }
    ],
    instructions: {
      en: "Run a transaction configured with Read Committed isolation level, retrieving all accounts in the Premium category ordered by id, and commit.",
      id: "Jalankan transaksi dengan tingkat isolasi Read Committed, mengambil seluruh akun dalam kategori Premium diurutkan berdasarkan id, lalu lakukan commit."
    },
    seed_sql: "mod8Seed",
    expected_query: "BEGIN; SET TRANSACTION ISOLATION LEVEL READ COMMITTED; SELECT * FROM accounts WHERE category = 'Premium' ORDER BY id; COMMIT;",
    starterQuery: "SELECT * FROM accounts WHERE category = 'Premium';",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Read Committed Transaction in MySQL (Var #3)",
          id: "Transaksi Read Committed di MySQL (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Non-locking consistent reads per statement in MySQL.\n\nEngine Processing Behavior: Re-creates the read snapshot per individual statement execution.\n\nBest Practices & Gotchas: Reduces locking and deadlocks in write-heavy transactional systems.",
          id: "Analogi Konseptual: Pembacaan data konsisten tanpa penguncian per pernyataan query di MySQL.\n\nCara Kerja Database Engine: Membuat ulang snapshot pembacaan untuk setiap eksekusi pernyataan query individu.\n\nBest Practices & Catatan Penting: Mengurangi risiko kebuntuan penguncian (deadlock) pada sistem transaksi berbeban tulis tinggi."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL Read Committed",
              id: "Read Committed MySQL"
            },
            code: "SET TRANSACTION ISOLATION LEVEL READ COMMITTED; BEGIN; SELECT * FROM accounts WHERE category = 'Premium' ORDER BY id; COMMIT;"
          }
        ],
        instructions: {
          en: "Run a transaction configured with Read Committed isolation level, retrieving all accounts in the Premium category ordered by id, and commit.",
          id: "Jalankan transaksi dengan tingkat isolasi Read Committed, mengambil seluruh akun dalam kategori Premium diurutkan berdasarkan id, lalu lakukan commit."
        },
        expected_query: "SET TRANSACTION ISOLATION LEVEL READ COMMITTED; BEGIN; SELECT * FROM accounts WHERE category = 'Premium' ORDER BY id; COMMIT;",
        starterQuery: "SELECT * FROM accounts WHERE category = 'Premium';"
      }
    }
  },
  {
    id: 824,
    moduleId: 8,
    categorySlot: 5,
    title: {
      en: "High Balance Audit under Repeatable Read (Var #4)",
      id: "Audit Saldo Tinggi di Bawah Repeatable Read (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: An auditor verifying large accounts without disturbance from concurrently posting transactions.\n\nEngine Processing Behavior: Guarantees point-in-time snapshot visibility for large balance lookups.\n\nBest Practices & Gotchas: Ideal for financial balance sheet reporting runs.",
      id: "Analogi Konseptual: Auditor keuangan yang memeriksa akun-akun bersaldo besar tanpa terganggu oleh mutasi transaksi yang sedang berlangsung.\n\nCara Kerja Database Engine: Menjamin visibilitas snapshot waktu tunggal yang konsisten untuk pembacaan saldo bernilai besar.\n\nBest Practices & Catatan Penting: Sangat tepat digunakan untuk pembuatan laporan neraca keuangan berkala."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Repeatable read balance audit",
          id: "Audit saldo dengan repeatable read"
        },
        code: "BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT owner, balance FROM accounts WHERE balance >= 5000 ORDER BY id; COMMIT;"
      }
    ],
    instructions: {
      en: "Execute a transaction with Repeatable Read isolation selecting `owner` and `balance` for balances at least 5000, ordered by `id`, and commit.",
      id: "Jalankan transaksi dengan isolasi Repeatable Read yang memilih `owner` dan `balance` untuk saldo minimal 5000, diurutkan berdasarkan `id`, lalu lakukan commit."
    },
    seed_sql: "mod8Seed",
    expected_query: "BEGIN; SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; SELECT owner, balance FROM accounts WHERE balance >= 5000 ORDER BY id; COMMIT;",
    starterQuery: "SELECT owner, balance FROM accounts WHERE balance >= 5000;",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "High Balance Audit under Repeatable Read in MySQL (Var #4)",
          id: "Audit Saldo Tinggi di Bawah Repeatable Read di MySQL (Latihan #4)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Consistent balance auditing in MySQL.\n\nEngine Processing Behavior: Preserves snapshot view across projections.\n\nBest Practices & Gotchas: Standard practice for transactional report consistency.",
          id: "Analogi Konseptual: Audit saldo keuangan yang konsisten di MySQL.\n\nCara Kerja Database Engine: Mempertahankan tampilan snapshot di seluruh proyeksi data.\n\nBest Practices & Catatan Penting: Praktik standar untuk konsistensi laporan transaksional."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL balance audit transaction",
              id: "Transaksi audit saldo MySQL"
            },
            code: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; SELECT owner, balance FROM accounts WHERE balance >= 5000 ORDER BY id; COMMIT;"
          }
        ],
        instructions: {
          en: "Execute a transaction with Repeatable Read isolation selecting `owner` and `balance` for balances at least 5000, ordered by `id`, and commit.",
          id: "Jalankan transaksi dengan isolasi Repeatable Read yang memilih `owner` dan `balance` untuk saldo minimal 5000, diurutkan berdasarkan `id`, lalu lakukan commit."
        },
        expected_query: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ; BEGIN; SELECT owner, balance FROM accounts WHERE balance >= 5000 ORDER BY id; COMMIT;",
        starterQuery: "SELECT owner, balance FROM accounts WHERE balance >= 5000;"
      }
    }
  },

  // Slot 6: Queue Locking / Non-Blocking Row Locks
  {
    id: 825,
    moduleId: 8,
    categorySlot: 6,
    title: {
      en: "Worker Task Claim with SKIP LOCKED (Var #1)",
      id: "Pengambilan Tugas Pekerja dengan SKIP LOCKED (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Grabbing the next available work ticket from a dispenser: if another worker has their hand on a ticket, you glide past it instantly to take the next untaken ticket without waiting.\n\nEngine Processing Behavior: The storage engine skips any rows currently locked by concurrent transactions and locks the next matching unlocked row with exclusive row-level locking.\n\nBest Practices & Gotchas: SKIP LOCKED is the industry gold standard for high-throughput, non-blocking asynchronous queue patterns in relational databases.",
      id: "Analogi Konseptual: Mengambil nomor antrean tugas dari dispenser: jika pekerja lain sedang memegang satu tiket tugas, Anda langsung melewatinya dan mengambil tiket berikutnya tanpa perlu mengantre.\n\nCara Kerja Database Engine: Storage engine melewati baris data yang sedang dikunci oleh transaksi lain dan mengunci baris data berikutnya yang belum terkunci menggunakan exclusive row lock.\n\nBest Practices & Catatan Penting: SKIP LOCKED adalah standar industri terbaik untuk membangun antrean tugas (job queue) berkecepatan tinggi tanpa hambatan blocking."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Row lock with SKIP LOCKED",
          id: "Penguncian baris dengan SKIP LOCKED"
        },
        code: "SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;"
      }
    ],
    instructions: {
      en: "Claim the earliest queued job from `job_queue` locking it and skipping any locked rows, showing `id`, `task_type`, and `payload`.",
      id: "Ambil tugas antrean paling awal dari `job_queue` dengan menguncinya dan melewati baris yang sedang dikunci, menampilkan `id`, `task_type`, dan `payload`."
    },
    seed_sql: "mod8QueueSeed",
    expected_query: "SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;",
    starterQuery: "SELECT * FROM job_queue;",
    table_names: ["job_queue"]
  },
  {
    id: 826,
    moduleId: 8,
    categorySlot: 6,
    title: {
      en: "Failing Fast with FOR UPDATE NOWAIT (Var #2)",
      id: "Pengecekan Cepat Gagal dengan FOR UPDATE NOWAIT (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Tapping a locked meeting room door: if it is locked, you leave immediately rather than standing in the hallway waiting.\n\nEngine Processing Behavior: Attempts to acquire a row lock immediately; if the target tuple is locked by another transaction, it raises an error instantly without blocking.\n\nBest Practices & Gotchas: NOWAIT prevents connection pool exhaustion by rejecting locked requests immediately.",
      id: "Analogi Konseptual: Mengetuk pintu ruang rapat: jika terkunci dari dalam, Anda segera pergi alih-alih berdiri menunggu tanpa kepastian di lorong.\n\nCara Kerja Database Engine: Mencoba memperoleh row lock seketika; jika baris target sedang dikunci oleh transaksi lain, engine langsung memunculkan error tanpa jeda blocking.\n\nBest Practices & Catatan Penting: NOWAIT mencegah kehabisan koneksi pada connection pool dengan menolak permintaan yang sedang terkunci secara instan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Row lock with NOWAIT",
          id: "Penguncian baris dengan NOWAIT"
        },
        code: "SELECT id, task_type, payload FROM job_queue WHERE id = 1 FOR UPDATE NOWAIT;"
      }
    ],
    instructions: {
      en: "Lock job record 1 in `job_queue` immediately without waiting if blocked, displaying `id`, `task_type`, and `payload`.",
      id: "Kunci data tugas 1 pada `job_queue` seketika tanpa menunggu jika sedang terhalang, menampilkan `id`, `task_type`, dan `payload`."
    },
    seed_sql: "mod8QueueSeed",
    expected_query: "SELECT id, task_type, payload FROM job_queue WHERE id = 1 FOR UPDATE NOWAIT;",
    starterQuery: "SELECT * FROM job_queue WHERE id = 1;",
    table_names: ["job_queue"]
  },
  {
    id: 827,
    moduleId: 8,
    categorySlot: 6,
    title: {
      en: "Batch Worker Task Claim with SKIP LOCKED (Var #3)",
      id: "Pengambilan Batch Tugas Pekerja dengan SKIP LOCKED (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: A worker taking a batch of 2 tasks from a work queue while bypassing any jobs currently undergoing processing.\n\nEngine Processing Behavior: Scans for matching candidate rows, ignores tuples held under lock by other processes, and locks up to 2 unlocked records.\n\nBest Practices & Gotchas: Batch job fetching reduces transaction roundtrips in background worker daemons.",
      id: "Analogi Konseptual: Seorang pekerja mengambil sekaligus 2 tugas dari antrean kerja sambil melewati tugas apa pun yang sedang diproses oleh rekan lain.\n\nCara Kerja Database Engine: Memindai baris data yang cocok, mengabaikan baris yang sedang dikunci proses lain, lalu mengunci maksimal 2 rekaman yang belum terkunci.\n\nBest Practices & Catatan Penting: Pengambilan tugas dalam bentuk batch menghemat round-trip transaksi pada background worker daemon."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Batch claim with SKIP LOCKED",
          id: "Pengambilan batch dengan SKIP LOCKED"
        },
        code: "SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;"
      }
    ],
    instructions: {
      en: "Claim up to two queued jobs from `job_queue` locking them and skipping locked rows, ordered by `id`, showing `id`, `task_type`, and `payload`.",
      id: "Ambil hingga dua tugas antrean dari `job_queue` dengan menguncinya dan melewati baris terkunci, diurutkan berdasarkan `id`, menampilkan `id`, `task_type`, dan `payload`."
    },
    seed_sql: "mod8QueueSeed",
    expected_query: "SELECT id, task_type, payload FROM job_queue WHERE status = 'queued' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;",
    starterQuery: "SELECT * FROM job_queue;",
    table_names: ["job_queue"]
  },
  {
    id: 828,
    moduleId: 8,
    categorySlot: 6,
    title: {
      en: "Immediate Secondary Job Lock with NOWAIT (Var #4)",
      id: "Penguncian Instan Tugas Sekunder dengan NOWAIT (Latihan #4)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Verifying exclusive availability of a secondary task and failing fast if an operation is already underway.\n\nEngine Processing Behavior: Checks the lock status of row 2 and locks it exclusively, raising an error if blocked.\n\nBest Practices & Gotchas: Use NOWAIT when task operations are non-idempotent and cannot afford waiting delays.",
      id: "Analogi Konseptual: Memeriksa ketersediaan eksklusif dari suatu tugas sekunder dan langsung gagal jika ada operasi yang sedang berjalan padanya.\n\nCara Kerja Database Engine: Memeriksa status penguncian baris 2 dan menguncinya secara eksklusif, memunculkan error seketika jika terhalang.\n\nBest Practices & Catatan Penting: Gunakan NOWAIT saat operasi pekerjaan tidak boleh mengalami penundaan antrean."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Lock job with NOWAIT",
          id: "Kunci tugas dengan NOWAIT"
        },
        code: "SELECT id, task_type, payload FROM job_queue WHERE id = 2 FOR UPDATE NOWAIT;"
      }
    ],
    instructions: {
      en: "Lock job record 2 in `job_queue` immediately without waiting if blocked, displaying `id`, `task_type`, and `payload`.",
      id: "Kunci data tugas 2 pada `job_queue` seketika tanpa menunggu jika sedang terhalang, menampilkan `id`, `task_type`, dan `payload`."
    },
    seed_sql: "mod8QueueSeed",
    expected_query: "SELECT id, task_type, payload FROM job_queue WHERE id = 2 FOR UPDATE NOWAIT;",
    starterQuery: "SELECT * FROM job_queue WHERE id = 2;",
    table_names: ["job_queue"]
  }
];

// ===== MODULE 9 QUESTIONS =====
const m9Questions = [
  // Slot 13: Partial & Expression Indexes
  {
    id: 943,
    moduleId: 9,
    categorySlot: 13,
    title: {
      en: "Creating a Filtered Partial Index on Active Users (Var #1)",
      id: "Membuat Partial Index Tersaring pada Pengguna Aktif (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Building an index card catalog that only includes active gym members rather than wasting space cataloging deactivated accounts from ten years ago.\n\nEngine Processing Behavior: The database builds a B-Tree index exclusively containing index entries for rows satisfying the WHERE predicate (is_active = true), significantly reducing index storage size and write maintenance costs.\n\nBest Practices & Gotchas: Queries must include the same WHERE predicate (or a subset) for the query planner to recognize and utilize the partial index.",
      id: "Analogi Konseptual: Membuat katalog kartu anggota yang hanya memuat anggota aktif alih-alih membuang tempat mencatat ribuan akun yang sudah tidak aktif bertahun-tahun.\n\nCara Kerja Database Engine: Database membangun indeks B-Tree yang khusus menampung baris data yang memenuhi kondisi klausa WHERE (is_active = true), menghemat ukuran memori indeks dan biaya pembaruan data.\n\nBest Practices & Catatan Penting: Query pencarian harus menyertakan kondisi WHERE yang selaras agar planner dapat memanfaatkan partial index tersebut."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Create partial index with WHERE",
          id: "Pembuatan partial index dengan WHERE"
        },
        code: "CREATE INDEX idx_active_users_email ON user_accounts (email) WHERE is_active = true;"
      }
    ],
    instructions: {
      en: "Create a partial index named `idx_active_users_email` on the `email` column of `user_accounts` indexing only active records where `is_active` is true.",
      id: "Buat partial index bernama `idx_active_users_email` pada kolom `email` di tabel `user_accounts` yang hanya mengindeks baris data aktif di mana `is_active` bernilai true."
    },
    seed_sql: "mod9ArraysSeed",
    expected_query: "CREATE INDEX idx_active_users_email ON user_accounts (email) WHERE is_active = true;",
    starterQuery: "-- Create partial index here",
    table_names: ["user_accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Creating User Email Index in MySQL (Var #1)",
          id: "Membuat Indeks Email Pengguna di MySQL (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Creating a B-Tree index on email in MySQL.\n\nEngine Processing Behavior: Builds a standard secondary index on the email column.\n\nBest Practices & Gotchas: Speeds up lookup queries filtering by user email.",
          id: "Analogi Konseptual: Membangun indeks B-Tree pada kolom email di MySQL.\n\nCara Kerja Database Engine: Membangun secondary index standar pada kolom email.\n\nBest Practices & Catatan Penting: Mempercepat query pencarian yang memfilter berdasarkan email pengguna."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL email index",
              id: "Indeks email MySQL"
            },
            code: "CREATE INDEX idx_active_users_email ON user_accounts (email);"
          }
        ],
        instructions: {
          en: "Create an index named `idx_active_users_email` on the `email` column of `user_accounts`.",
          id: "Buat indeks bernama `idx_active_users_email` pada kolom `email` di tabel `user_accounts`."
        },
        expected_query: "CREATE INDEX idx_active_users_email ON user_accounts (email);",
        starterQuery: "-- Create index here"
      }
    }
  },
  {
    id: 944,
    moduleId: 9,
    categorySlot: 13,
    title: {
      en: "Creating an Expression Index for Case-Insensitive Lookups (Var #2)",
      id: "Membuat Indeks Ekspresi untuk Pencarian Case-Insensitive (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Sorting student name badges alphabetically by their lowercase letters, so looking up 'alice' or 'ALICE' goes straight to the exact filing drawer.\n\nEngine Processing Behavior: The engine computes LOWER(email) for each row and stores the computed hash in the B-Tree index pages, allowing WHERE LOWER(email) = '...' to perform lightning-fast index scans.\n\nBest Practices & Gotchas: Standard indexes on email cannot be used when the query wraps the column inside a function like LOWER(); expression indexes resolve this bottleneck.",
      id: "Analogi Konseptual: Mengurutkan tanda nama siswa berdasarkan huruf kecilnya, sehingga mencari 'alice' atau 'ALICE' langsung tertuju ke laci arsip yang tepat.\n\nCara Kerja Database Engine: Engine menghitung ekspresi LOWER(email) untuk setiap baris dan menyimpan hasil komputasi tersebut di halaman indeks B-Tree, memungkinkan index scan pada pencarian case-insensitive.\n\nBest Practices & Catatan Penting: Indeks biasa tidak dapat digunakan jika query membungkus kolom dalam fungsi seperti LOWER(); indeks ekspresi adalah solusi tepat."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Create expression functional index",
          id: "Pembuatan indeks ekspresi fungsional"
        },
        code: "CREATE INDEX idx_lower_user_email ON user_accounts (LOWER(email));"
      }
    ],
    instructions: {
      en: "Create an expression index named `idx_lower_user_email` on `user_accounts` indexing the lowercase conversion of `email`.",
      id: "Buat indeks ekspresi bernama `idx_lower_user_email` pada tabel `user_accounts` yang mengindeks hasil konversi huruf kecil dari kolom `email`."
    },
    seed_sql: "mod9ArraysSeed",
    expected_query: "CREATE INDEX idx_lower_user_email ON user_accounts (LOWER(email));",
    starterQuery: "-- Create expression index here",
    table_names: ["user_accounts"]
  },
  {
    id: 945,
    moduleId: 9,
    categorySlot: 13,
    title: {
      en: "Creating a Partial Index for High Balance Accounts (Var #3)",
      id: "Membuat Partial Index untuk Akun Bersaldo Tinggi (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Maintaining an index card catalog only for premium corporate accounts with high capital balances.\n\nEngine Processing Behavior: Only indexes rows meeting the predicate balance > 4000, reducing tree depth.\n\nBest Practices & Gotchas: Keeps index maintenance overhead low for large tables with skewed querying patterns.",
      id: "Analogi Konseptual: Menyimpan kartu arsip khusus untuk akun-akun prioritas yang memiliki saldo modal besar.\n\nCara Kerja Database Engine: Hanya mengindeks baris yang memenuhi predikat balance > 4000, meminimalkan kedalaman pohon indeks.\n\nBest Practices & Catatan Penting: Mengurangi beban pemeliharaan indeks pada tabel besar yang memiliki pola pencarian data condong ke kriteria tertentu."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Partial index on numeric threshold",
          id: "Partial index pada ambang batas numerik"
        },
        code: "CREATE INDEX idx_high_balance ON accounts (balance) WHERE balance > 4000;"
      }
    ],
    instructions: {
      en: "Create a partial index named `idx_high_balance` on the `balance` column of `accounts` for rows where `balance` is greater than 4000.",
      id: "Buat partial index bernama `idx_high_balance` pada kolom `balance` di tabel `accounts` untuk baris di mana `balance` lebih besar dari 4000."
    },
    seed_sql: "mod7Seed",
    expected_query: "CREATE INDEX idx_high_balance ON accounts (balance) WHERE balance > 4000;",
    starterQuery: "-- Create partial index here",
    table_names: ["accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Creating Balance Index in MySQL (Var #3)",
          id: "Membuat Indeks Saldo di MySQL (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Creating a balance index in MySQL.\n\nEngine Processing Behavior: Builds a B-Tree index on the balance attribute.\n\nBest Practices & Gotchas: Supports range-based queries on account balances.",
          id: "Analogi Konseptual: Membangun indeks saldo akun di MySQL.\n\nCara Kerja Database Engine: Membangun indeks B-Tree pada atribut kolom balance.\n\nBest Practices & Catatan Penting: Mendukung query pencarian berbasis rentang saldo akun."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL balance index",
              id: "Indeks saldo MySQL"
            },
            code: "CREATE INDEX idx_high_balance ON accounts (balance);"
          }
        ],
        instructions: {
          en: "Create an index named `idx_high_balance` on the `balance` column of `accounts`.",
          id: "Buat indeks bernama `idx_high_balance` pada kolom `balance` di tabel `accounts`."
        },
        expected_query: "CREATE INDEX idx_high_balance ON accounts (balance);",
        starterQuery: "-- Create index here"
      }
    }
  },

  // Slot 14: PostgreSQL Arrays & UUIDs
  {
    id: 946,
    moduleId: 9,
    categorySlot: 14,
    title: {
      en: "Querying Multi-Valued Attributes with ANY Operator (Var #1)",
      id: "Query Atribut Bernilai Ganda dengan Operator ANY (Latihan #1)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Checking if a student's enrolled sports tags include 'soccer', without creating an entirely separate junction table.\n\nEngine Processing Behavior: The ANY operator iterates across the native array elements in the column, returning true if any element matches the candidate scalar value.\n\nBest Practices & Gotchas: Native array types in PostgreSQL provide lightweight tag modeling; for massive search catalogs, combine with GIN indexes.",
      id: "Analogi Konseptual: Memeriksa apakah daftar minat kegiatan siswa memuat 'soccer', tanpa perlu membuat tabel relasi perantara terpisah.\n\nCara Kerja Database Engine: Operator ANY memeriksa setiap elemen di dalam array kolom, mengembalikan nilai true jika terdapat elemen yang cocok dengan nilai pembanding.\n\nBest Practices & Catatan Penting: Tipe data array di PostgreSQL sangat praktis untuk pemodelan tag; gabungkan dengan GIN index untuk pencarian skala besar."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Array membership check with ANY",
          id: "Pengecekan keanggotaan array dengan ANY"
        },
        code: "SELECT id, title, tags FROM article_tags WHERE 'postgres' = ANY(tags) ORDER BY id;"
      }
    ],
    instructions: {
      en: "Find all articles that include 'postgres' in their tags array, displaying `id`, `title`, and `tags` from `article_tags`, ordered by `id`.",
      id: "Temukan semua artikel yang memuat 'postgres' di dalam array tags mereka, menampilkan `id`, `title`, dan `tags` dari tabel `article_tags`, diurutkan berdasarkan `id`."
    },
    seed_sql: "mod9ArraysSeed",
    expected_query: "SELECT id, title, tags FROM article_tags WHERE 'postgres' = ANY(tags) ORDER BY id;",
    starterQuery: "SELECT * FROM article_tags;",
    table_names: ["article_tags"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Matching Tag Substrings in MySQL (Var #1)",
          id: "Pencocokan Substring Tag di MySQL (Latihan #1)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Finding tagged articles in MySQL using pattern matching on text tags.\n\nEngine Processing Behavior: Performs pattern matching on the tags string.\n\nBest Practices & Gotchas: Text pattern matching operates across tag entries.",
          id: "Analogi Konseptual: Menemukan artikel bertag di MySQL menggunakan pencocokan pola teks.\n\nCara Kerja Database Engine: Menjalankan pencocokan pola teks pada kolom tags.\n\nBest Practices & Catatan Penting: Pencocokan teks bekerja mencari kata kunci tag di kolom string."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL pattern match on tags",
              id: "Pencocokan pola tag MySQL"
            },
            code: "SELECT id, title, tags FROM article_tags WHERE tags LIKE '%postgres%' ORDER BY id;"
          }
        ],
        instructions: {
          en: "Find all articles that include 'postgres' in their tags, displaying `id`, `title`, and `tags` from `article_tags`, ordered by `id`.",
          id: "Temukan semua artikel yang memuat 'postgres' pada kolom tags, menampilkan `id`, `title`, dan `tags` dari tabel `article_tags`, diurutkan berdasarkan `id`."
        },
        expected_query: "SELECT id, title, tags FROM article_tags WHERE tags LIKE '%postgres%' ORDER BY id;",
        starterQuery: "SELECT * FROM article_tags;"
      }
    }
  },
  {
    id: 947,
    moduleId: 9,
    categorySlot: 14,
    title: {
      en: "Expanding Array Elements with UNNEST (Var #2)",
      id: "Mengekspansi Elemen Array Menjadi Baris dengan UNNEST (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Unpacking a gift box containing three books and placing each book on its own separate library shelf.\n\nEngine Processing Behavior: The UNNEST set-returning function pivots an array into individual row tuples, producing one output record per element.\n\nBest Practices & Gotchas: UNNEST allows standard relational operations (like GROUP BY, DISTINCT, and COUNT) to be performed on array elements.",
      id: "Analogi Konseptual: Membuka kotak parsel berisi tiga buku dan meletakkan masing-masing buku di rak perpustakaan terpisah.\n\nCara Kerja Database Engine: Fungsi set-returning UNNEST mengubah elemen array menjadi baris-baris data individual, menghasilkan satu rekaman per elemen.\n\nBest Practices & Catatan Penting: UNNEST memungkinkan operasi relasional standar (seperti GROUP BY, DISTINCT, dan COUNT) dijalankan pada data array."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Expand array with UNNEST",
          id: "Ekspansi array dengan UNNEST"
        },
        code: "SELECT UNNEST(tags) AS single_tag FROM article_tags WHERE id = 1;"
      }
    ],
    instructions: {
      en: "Unpack all tags from the article with id 1 into individual rows aliased as `single_tag` from `article_tags`.",
      id: "Bongkar semua tag dari artikel dengan id 1 menjadi baris-baris individual beralias `single_tag` dari tabel `article_tags`."
    },
    seed_sql: "mod9ArraysSeed",
    expected_query: "SELECT UNNEST(tags) AS single_tag FROM article_tags WHERE id = 1;",
    starterQuery: "SELECT * FROM article_tags WHERE id = 1;",
    table_names: ["article_tags"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Extracting Tag Elements in MySQL (Var #2)",
          id: "Mengekstrak Elemen Tag di MySQL (Latihan #2)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Cleaning tag delimiters in MySQL.\n\nEngine Processing Behavior: Strips bracket delimiters from text strings.\n\nBest Practices & Gotchas: Normalizes text tags for single-row display.",
          id: "Analogi Konseptual: Membersihkan pemisah tanda kurung tag di MySQL.\n\nCara Kerja Database Engine: Menghapus karakter kurung kurawal dari string teks.\n\nBest Practices & Catatan Penting: Menormalkan format teks tag untuk penampilan data."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL tag cleaning",
              id: "Pembersihan tag MySQL"
            },
            code: "SELECT TRIM(REPLACE(REPLACE(tags, '{', ''), '}', '')) AS single_tag FROM article_tags WHERE id = 1;"
          }
        ],
        instructions: {
          en: "Display cleaned tags from the article with id 1 aliased as `single_tag` from `article_tags`.",
          id: "Tampilkan tag yang telah dibersihkan dari artikel dengan id 1 beralias `single_tag` dari tabel `article_tags`."
        },
        expected_query: "SELECT TRIM(REPLACE(REPLACE(tags, '{', ''), '}', '')) AS single_tag FROM article_tags WHERE id = 1;",
        starterQuery: "SELECT * FROM article_tags WHERE id = 1;"
      }
    }
  },
  {
    id: 948,
    moduleId: 9,
    categorySlot: 14,
    title: {
      en: "Generating Universal Identifiers with gen_random_uuid (Var #3)",
      id: "Membuat Pengenal Unik Universal dengan gen_random_uuid (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Generating a cryptographic passport number that is mathematically guaranteed to be globally unique across all computers on Earth.\n\nEngine Processing Behavior: Calls the cryptographically secure pseudorandom generator to construct a 128-bit UUID (version 4).\n\nBest Practices & Gotchas: UUIDs prevent ID enumeration attacks and eliminate coordination bottlenecks in distributed multi-node clusters.",
      id: "Analogi Konseptual: Membuat nomor paspor kriptografis yang dijamin secara matematis unik di seluruh komputer di dunia tanpa risiko duplikasi.\n\nCara Kerja Database Engine: Memanggil generator pseudorandom yang aman secara kriptografi untuk menghasilkan 128-bit UUID (versi 4).\n\nBest Practices & Catatan Penting: UUID mencegah eksploitasi tebak ID (enumeration attack) dan menghilangkan kebutuhan koordinasi terpusat pada sistem terdistribusi."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Generate random UUID",
          id: "Membuat random UUID"
        },
        code: "SELECT gen_random_uuid() AS session_token;"
      }
    ],
    instructions: {
      en: "Generate a new cryptographic version-4 identifier aliased as `session_token`.",
      id: "Buat pengenal unik versi 4 kriptografis baru beralias `session_token`."
    },
    seed_sql: "mod9ArraysSeed",
    expected_query: "SELECT gen_random_uuid() AS session_token;",
    starterQuery: "-- Generate UUID",
    table_names: ["user_accounts"],
    engineOverrides: {
      mysql: {
        title: {
          en: "Generating Universal Identifiers with UUID in MySQL (Var #3)",
          id: "Membuat Pengenal Unik Universal dengan UUID di MySQL (Latihan #3)"
        },
        conceptExplanation: {
          en: "Conceptual Analogy: Generating global unique identifiers using MySQL's native UUID function.\n\nEngine Processing Behavior: Computes a 128-bit universal identifier.\n\nBest Practices & Gotchas: Generates standard format UUID strings in MySQL.",
          id: "Analogi Konseptual: Membuat pengenal unik global menggunakan fungsi bawaan UUID di MySQL.\n\nCara Kerja Database Engine: Menghasilkan 128-bit universal identifier secara instan.\n\nBest Practices & Catatan Penting: Menghasilkan string UUID standar di MySQL."
        },
        syntaxPatterns: [
          {
            label: {
              en: "MySQL UUID generation",
              id: "Pembuatan UUID MySQL"
            },
            code: "SELECT UUID() AS session_token;"
          }
        ],
        instructions: {
          en: "Generate a new cryptographic version-4 identifier aliased as `session_token`.",
          id: "Buat pengenal unik versi 4 kriptografis baru beralias `session_token`."
        },
        expected_query: "SELECT UUID() AS session_token;",
        starterQuery: "-- Generate UUID"
      }
    }
  }
];

console.log("Module 7 questions defined:", m7Questions.length);
console.log("Module 8 questions defined:", m8Questions.length);
console.log("Module 9 questions defined:", m9Questions.length);

module.exports = { m7Questions, m8Questions, m9Questions };

// ===== MODULE 10 QUESTIONS (EXPANSION: VAR #2 & VAR #3) =====
const m10Questions = [
  // Slot 1: Inspect Query Execution Plan
  {
    id: 1011,
    moduleId: 10,
    categorySlot: 1,
    title: {
      en: "Inspect Execution Plan for High Value Orders (Var #2)",
      id: "Memeriksa Rencana Eksekusi untuk Pesanan Bernilai Tinggi (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Examining the roadmap planned by a delivery driver before the truck starts driving.\n\nEngine Processing Behavior: The EXPLAIN statement details the planner's selected scan path and estimated costs without executing the query.\n\nBest Practices & Gotchas: EXPLAIN is safe to run on production databases because it does not run DML mutations or read disk pages.",
      id: "Analogi Konseptual: Memeriksa peta rute perjalanan kurir sebelum armada pengantar mulai melaju.\n\nCara Kerja Database Engine: Pernyataan EXPLAIN merinci jalur pemindaian dan estimasi biaya yang dipilih planner tanpa menjalankan query ke data riil.\n\nBest Practices & Catatan Penting: EXPLAIN aman dieksekusi di database produksi karena tidak menjalankan perubahan data maupun pembacaan halaman disk berat."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect execution plan with filter",
          id: "Pemeriksaan rencana eksekusi dengan filter"
        },
        code: "EXPLAIN SELECT * FROM orders WHERE amount > 500;"
      }
    ],
    instructions: {
      en: "Inspect the database execution plan for fetching all orders with amount greater than 500.",
      id: "Periksa rencana eksekusi database untuk mengambil seluruh pesanan dengan nilai amount lebih dari 500."
    },
    seed_sql: "mod10OrdersSeed",
    expected_query: "EXPLAIN SELECT * FROM orders WHERE amount > 500;",
    starterQuery: "SELECT * FROM orders WHERE amount > 500;",
    table_names: ["orders"]
  },
  {
    id: 1021,
    moduleId: 10,
    categorySlot: 1,
    title: {
      en: "Inspect Execution Plan for Date Range Filtering (Var #3)",
      id: "Memeriksa Rencana Eksekusi untuk Filter Rentang Tanggal (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Reviewing the blueprint of an archive search before pulling physical ledger books from storage.\n\nEngine Processing Behavior: Displays planner cost estimates and operator tree nodes for date range queries.\n\nBest Practices & Gotchas: Compare estimated startup costs against total cost to identify pipeline delays.",
      id: "Analogi Konseptual: Meninjau denah penelusuran arsip sebelum mengambil buku fisik dari gudang penyimpanan.\n\nCara Kerja Database Engine: Menampilkan estimasi biaya planner dan simpul pohon operator untuk query rentang tanggal.\n\nBest Practices & Catatan Penting: Bandingkan estimasi startup cost terhadap total cost untuk mendeteksi potensi kelambatan pipeline."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect date range plan",
          id: "Pemeriksaan rencana rentang tanggal"
        },
        code: "EXPLAIN SELECT id, customer_id, amount FROM orders WHERE order_date >= '2023-01-01';"
      }
    ],
    instructions: {
      en: "Inspect the database execution plan for fetching `id`, `customer_id`, and `amount` from `orders` with `order_date` on or after 2023-01-01.",
      id: "Periksa rencana eksekusi database untuk mengambil `id`, `customer_id`, dan `amount` dari `orders` dengan `order_date` pada atau setelah 2023-01-01."
    },
    seed_sql: "mod10OrdersSeed",
    expected_query: "EXPLAIN SELECT id, customer_id, amount FROM orders WHERE order_date >= '2023-01-01';",
    starterQuery: "SELECT id, customer_id, amount FROM orders WHERE order_date >= '2023-01-01';",
    table_names: ["orders"]
  },

  // Slot 2: Inspect Actual Rows with EXPLAIN ANALYZE
  {
    id: 1012,
    moduleId: 10,
    categorySlot: 2,
    title: {
      en: "Profile Real Execution Costs on Filtered Orders (Var #2)",
      id: "Profil Biaya Eksekusi Riil pada Pesanan Tersaring (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Driving the delivery truck along the proposed route and timing the actual trip with a stopwatch.\n\nEngine Processing Behavior: Actually executes the query, records true row counts and timing metrics per node, and outputs the comparison against planner estimates.\n\nBest Practices & Gotchas: EXPLAIN ANALYZE executes mutations; never run it blindly with DELETE or UPDATE on production data without wrapping in a rollback block.",
      id: "Analogi Konseptual: Mengemudikan kendaraan pengantar menyusuri rute rencana dan mengukur waktu tempuh sebenarnya dengan stopwatch.\n\nCara Kerja Database Engine: Benar-benar mengeksekusi query ke data riil, mencatat jumlah baris aktual dan metrik durasi per node, lalu membandingkannya dengan estimasi planner.\n\nBest Practices & Catatan Penting: EXPLAIN ANALYZE benar-benar mengeksekusi query; jangan jalankan pada perintah DELETE atau UPDATE di database produksi tanpa transaksi rollback."
    },
    syntaxPatterns: [
      {
        label: {
          en: "EXPLAIN ANALYZE with options",
          id: "EXPLAIN ANALYZE dengan opsi"
        },
        code: "EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE amount > 500;"
      }
    ],
    instructions: {
      en: "Analyze actual execution of selecting orders with amount greater than 500 using explain analyze with timing off and summary off.",
      id: "Analisis eksekusi riil pemilihan pesanan dengan amount lebih dari 500 menggunakan explain analyze dengan timing nonaktif dan summary nonaktif."
    },
    seed_sql: "mod10OrdersSeed",
    expected_query: "EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT * FROM orders WHERE amount > 500;",
    starterQuery: "SELECT * FROM orders WHERE amount > 500;",
    table_names: ["orders"]
  },
  {
    id: 1022,
    moduleId: 10,
    categorySlot: 2,
    title: {
      en: "Profile Range Query Execution with EXPLAIN ANALYZE (Var #3)",
      id: "Profil Eksekusi Query Rentang dengan EXPLAIN ANALYZE (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Verifying that an estimated crowd size matches actual ticket scans at the stadium gates.\n\nEngine Processing Behavior: Measures actual tuple outputs against the planner's cost model predictions across range scans.\n\nBest Practices & Gotchas: Discrepancies between estimated and actual row counts indicate outdated table statistics in pg_class/pg_statistic.",
      id: "Analogi Konseptual: Memverifikasi bahwa estimasi jumlah penonton stadion benar-benar cocok dengan hasil pindai tiket aktual di gerbang masuk.\n\nCara Kerja Database Engine: Mengukur output jumlah baris aktual terhadap prediksi model biaya planner pada pemindaian rentang data.\n\nBest Practices & Catatan Penting: Selisih besar antara perkiraan dan baris riil menandakan statistik tabel di katalog pg_statistic sudah usang."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Analyze range query execution",
          id: "Analisis eksekusi query rentang"
        },
        code: "EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT id, amount FROM orders WHERE amount BETWEEN 100 AND 800;"
      }
    ],
    instructions: {
      en: "Analyze the actual execution of fetching `id` and `amount` from `orders` with amount between 100 and 800 using explain analyze with timing off and summary off.",
      id: "Analisis eksekusi riil pengambilan `id` dan `amount` dari `orders` dengan amount antara 100 dan 800 menggunakan explain analyze dengan timing nonaktif dan summary nonaktif."
    },
    seed_sql: "mod10OrdersSeed",
    expected_query: "EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF) SELECT id, amount FROM orders WHERE amount BETWEEN 100 AND 800;",
    starterQuery: "SELECT id, amount FROM orders WHERE amount BETWEEN 100 AND 800;",
    table_names: ["orders"]
  },

  // Slot 3: Analyze Sorting and Aggregation Bottlenecks
  {
    id: 1013,
    moduleId: 10,
    categorySlot: 3,
    title: {
      en: "Analyze Product Frequency Aggregation Plan (Var #2)",
      id: "Analisis Rencana Agregasi Frekuensi Produk (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Sorting and counting warehouse boxes on a staging floor to spot logistical bottlenecks.\n\nEngine Processing Behavior: The planner determines whether to employ HashAggregate or Sort followed by GroupAggregate based on work_mem allocation.\n\nBest Practices & Gotchas: When work_mem is too small to fit aggregate hash tables, PostgreSQL spills sort batches to temporary disk files.",
      id: "Analogi Konseptual: Mengelompokkan dan menghitung paket barang di gudang untuk menemukan titik sumbatan logistik.\n\nCara Kerja Database Engine: Planner menentukan apakah akan menggunakan HashAggregate atau Sort diikuti GroupAggregate berdasarkan alokasi memori work_mem.\n\nBest Practices & Catatan Penting: Jika work_mem terlalu kecil untuk menampung hash table agregasi, PostgreSQL akan memindahkan data sortir ke file disk sementara."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect aggregation and sorting plan",
          id: "Pemeriksaan rencana agregasi dan sortir"
        },
        code: "EXPLAIN SELECT product_id, COUNT(*) AS item_count FROM order_items GROUP BY product_id ORDER BY item_count DESC;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for counting order items per `product_id` aliased as `item_count` from `order_items`, grouped by `product_id` and ordered by `item_count` descending.",
      id: "Periksa rencana eksekusi untuk menghitung item pesanan per `product_id` beralias `item_count` dari `order_items`, dikelompokkan berdasarkan `product_id` dan diurutkan berdasarkan `item_count` menurun."
    },
    seed_sql: "mod10OrderItemsSeed",
    expected_query: "EXPLAIN SELECT product_id, COUNT(*) AS item_count FROM order_items GROUP BY product_id ORDER BY item_count DESC;",
    starterQuery: "SELECT product_id, COUNT(*) AS item_count FROM order_items GROUP BY product_id ORDER BY item_count DESC;",
    table_names: ["order_items"]
  },
  {
    id: 1023,
    moduleId: 10,
    categorySlot: 3,
    title: {
      en: "Analyze Order Quantity Averages and Sorting (Var #3)",
      id: "Analisis Rata-rata Kuantitas Pesanan dan Pengurutan (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Ranking sales reps by their average deal size to highlight top performers.\n\nEngine Processing Behavior: Analyzes the cost of grouping tuples and applying in-memory sorting passes.\n\nBest Practices & Gotchas: Creating an index on the GROUP BY column can eliminate sort overhead entirely.",
      id: "Analogi Konseptual: Mengurutkan tim penjualan berdasarkan rata-rata nilai transaksi untuk mengidentifikasi performa tertinggi.\n\nCara Kerja Database Engine: Menganalisis estimasi biaya pengelompokan baris data dan eksekusi pengurutan di memori kerja.\n\nBest Practices & Catatan Penting: Membangun indeks pada kolom GROUP BY dapat menghilangkan kebutuhan operasi sorting secara menyeluruh."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect average grouping plan",
          id: "Pemeriksaan rencana agregasi rata-rata"
        },
        code: "EXPLAIN SELECT order_id, AVG(quantity) AS avg_qty FROM order_items GROUP BY order_id ORDER BY avg_qty DESC;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for calculating average `quantity` aliased as `avg_qty` grouped by `order_id` from `order_items`, ordered by `avg_qty` descending.",
      id: "Periksa rencana eksekusi untuk menghitung rata-rata `quantity` beralias `avg_qty` dikelompokkan berdasarkan `order_id` dari `order_items`, diurutkan berdasarkan `avg_qty` menurun."
    },
    seed_sql: "mod10OrderItemsSeed",
    expected_query: "EXPLAIN SELECT order_id, AVG(quantity) AS avg_qty FROM order_items GROUP BY order_id ORDER BY avg_qty DESC;",
    starterQuery: "SELECT order_id, AVG(quantity) AS avg_qty FROM order_items GROUP BY order_id ORDER BY avg_qty DESC;",
    table_names: ["order_items"]
  },

  // Slot 4: Index Scan vs Sequential Scan Selection
  {
    id: 1014,
    moduleId: 10,
    categorySlot: 4,
    title: {
      en: "Compound Predicate Scan Path Analysis (Var #2)",
      id: "Analisis Jalur Pemindaian Predikat Majemuk (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Choosing between searching the library card index or walking through the entire stacks when looking for a specific author in a specific genre.\n\nEngine Processing Behavior: The planner evaluates index selectivity: if a composite index matches both predicates, an Index Scan is preferred over a full table scan.\n\nBest Practices & Gotchas: If the filter matches a large fraction of the table, sequential scans are faster than jumping between scattered index and heap pages.",
      id: "Analogi Konseptual: Memilih antara melihat kartu indeks katalog atau menyusuri seluruh lorong perpustakaan saat mencari buku pengarang tertentu pada genre tertentu.\n\nCara Kerja Database Engine: Planner mengevaluasi selektivitas indeks: jika filter menyaring sebagian kecil data, Index Scan dipilih alih-alih Sequential Scan.\n\nBest Practices & Catatan Penting: Jika filter mencakup sebagian besar data tabel, Sequential Scan justru lebih cepat daripada membaca halaman heap secara acak."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect compound filter scan plan",
          id: "Pemeriksaan rencana filter majemuk"
        },
        code: "EXPLAIN SELECT * FROM events WHERE user_id = 100 AND event_type = 'login';"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving events where `user_id` is 100 and `event_type` is 'login' from `events`.",
      id: "Periksa rencana eksekusi untuk mengambil data events di mana `user_id` bernilai 100 dan `event_type` bernilai 'login' dari `events`."
    },
    seed_sql: "mod10EventsSeed",
    expected_query: "EXPLAIN SELECT * FROM events WHERE user_id = 100 AND event_type = 'login';",
    starterQuery: "SELECT * FROM events WHERE user_id = 100 AND event_type = 'login';",
    table_names: ["events"]
  },
  {
    id: 1024,
    moduleId: 10,
    categorySlot: 4,
    title: {
      en: "Selective User Event Lookup Scan Path (Var #3)",
      id: "Jalur Pemindaian Pencarian Riwayat Pengguna Selektif (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Looking up a specific user's file folder directly using their account badge number.\n\nEngine Processing Behavior: Assesses whether B-Tree index traversal on user_id minimizes random I/O reads.\n\nBest Practices & Gotchas: High selectivity favors Index Scan or Bitmap Index Scan nodes.",
      id: "Analogi Konseptual: Mengambil berkas rekam jejak pengguna tertentu langsung menggunakan nomor registrasinya.\n\nCara Kerja Database Engine: Menilai apakah penelusuran indeks B-Tree pada user_id meminimalkan pembacaan I/O acak dari disk.\n\nBest Practices & Catatan Penting: Selektivitas tinggi membuat planner memprioritaskan simpul Index Scan atau Bitmap Index Scan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect selective user lookup plan",
          id: "Pemeriksaan rencana pencarian pengguna selektif"
        },
        code: "EXPLAIN SELECT id, created_at FROM events WHERE user_id = 7;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving `id` and `created_at` from `events` for `user_id` 7.",
      id: "Periksa rencana eksekusi untuk mengambil `id` dan `created_at` dari `events` untuk `user_id` bernilai 7."
    },
    seed_sql: "mod10EventsSeed",
    expected_query: "EXPLAIN SELECT id, created_at FROM events WHERE user_id = 7;",
    starterQuery: "SELECT id, created_at FROM events WHERE user_id = 7;",
    table_names: ["events"]
  },

  // Slot 5: Join Execution Strategy Analysis
  {
    id: 1015,
    moduleId: 10,
    categorySlot: 5,
    title: {
      en: "Regional Customer Invoice Join Strategy Analysis (Var #2)",
      id: "Analisis Strategi Join Faktur Pelanggan Regional (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Matching customers in a specific city with their order invoices: the engine chooses between an in-memory hash table, nested loops, or sorted merge.\n\nEngine Processing Behavior: The planner selects Hash Join, Nested Loop, or Merge Join depending on relation sizes, available indexes, and memory limits.\n\nBest Practices & Gotchas: Nested loop joins excel when one side has very few rows and the other has an index on the join key.",
      id: "Analogi Konseptual: Mencocokkan data pelanggan di kota tertentu dengan faktur belanja mereka: engine memilih antara hash table di memori, nested loop, atau merge sort.\n\nCara Kerja Database Engine: Planner memilih simpul Hash Join, Nested Loop, atau Merge Join bergantung pada ukuran data tabel, ketersediaan indeks, dan memori kerja.\n\nBest Practices & Catatan Penting: Nested Loop Join sangat unggul jika satu sisi relasi hanya menghasilkan sedikit baris dan sisi lainnya memiliki indeks pada kolom join."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect regional join plan",
          id: "Pemeriksaan rencana join regional"
        },
        code: "EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.region = 'East';"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for joining customer and invoice records for entries in the 'East' customer `region`, displaying `name` and `total`.",
      id: "Periksa rencana eksekusi untuk menggabungkan `customers` dan `invoices` di mana `region` pelanggan bernilai 'East', menampilkan `name` dan `total`."
    },
    seed_sql: "mod10JoinSeed",
    expected_query: "EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.region = 'East';",
    starterQuery: "SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE c.region = 'East';",
    table_names: ["customers", "invoices"]
  },
  {
    id: 1025,
    moduleId: 10,
    categorySlot: 5,
    title: {
      en: "High Value Invoice Join Strategy Analysis (Var #3)",
      id: "Analisis Strategi Join Faktur Bernilai Tinggi (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Filtering luxury invoices first before pulling customer contact records from the primary filing cabinet.\n\nEngine Processing Behavior: Evaluates whether to drive the join from invoices (filtered by total) into customers using primary key index lookups.\n\nBest Practices & Gotchas: The query planner frequently flips inner and outer join roles to minimize row throughput.",
      id: "Analogi Konseptual: Menyaring faktur bernilai besar terlebih dahulu sebelum mengambil data kontak pelanggan dari laci utama.\n\nCara Kerja Database Engine: Mengevaluasi apakah memulai join dari tabel faktur (disaring berdasarkan total) menuju tabel pelanggan menggunakan indeks primary key.\n\nBest Practices & Catatan Penting: Query planner sering kali menukar peran inner dan outer relation untuk meminimalkan aliran data yang diproses."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect high-value join plan",
          id: "Pemeriksaan rencana join nilai tinggi"
        },
        code: "EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE i.total > 1000;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for joining `customers` and `invoices` filtering for invoice total greater than 1000, displaying `name` and `total`.",
      id: "Periksa rencana eksekusi untuk menghubungkan `customers` dan `invoices` dengan filter total faktur lebih dari 1000, menampilkan `name` dan `total`."
    },
    seed_sql: "mod10JoinSeed",
    expected_query: "EXPLAIN SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE i.total > 1000;",
    starterQuery: "SELECT c.name, i.total FROM customers c JOIN invoices i ON c.id = i.customer_id WHERE i.total > 1000;",
    table_names: ["customers", "invoices"]
  },

  // Slot 6: Detecting Correlated SubPlan Execution
  {
    id: 1016,
    moduleId: 10,
    categorySlot: 6,
    title: {
      en: "Detecting Correlated Max Timestamp SubPlans (Var #2)",
      id: "Mendeteksi SubPlan Timestamp Maksimum Terikat (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: An investigator walking up to a filing cabinet for each individual client to find their single most recent audit stamp.\n\nEngine Processing Behavior: A SubPlan in the explain output reveals that an inner subquery executes repeatedly once for every outer tuple, resulting in O(N*M) quadratic execution overhead.\n\nBest Practices & Gotchas: Refactor correlated SubPlans into JOINs with GROUP BY or window functions to replace repeated subplan executions with a single vectorized hash pass.",
      id: "Analogi Konseptual: Petugas pemeriksa yang bolak-balik ke lemari arsip untuk setiap klien secara terpisah guna mencari tanggal audit terakhir mereka.\n\nCara Kerja Database Engine: Simpul SubPlan pada output explain menandakan bahwa subquery internal dijalankan berulang-ulang untuk setiap baris tabel luar, menghasilkan kompleksitas kuadratik O(N*M).\n\nBest Practices & Catatan Penting: Lakukan refactor SubPlan terikat menjadi bentuk JOIN dengan GROUP BY atau window function untuk mengubah eksekusi berulang menjadi pemrosesan hash satu kali."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect correlated subplan plan",
          id: "Pemeriksaan rencana subplan terikat"
        },
        code: "EXPLAIN SELECT id, username, (SELECT MAX(created_at) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS last_audit FROM accounts;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving `id`, `username`, and the maximum `created_at` timestamp from `audit_logs` correlated to each account aliased as `last_audit` from `accounts`.",
      id: "Periksa rencana eksekusi untuk mengambil `id`, `username`, dan timestamp `created_at` maksimum dari `audit_logs` yang terikat ke setiap akun beralias `last_audit` dari `accounts`."
    },
    seed_sql: "mod10SubplanSeed",
    expected_query: "EXPLAIN SELECT id, username, (SELECT MAX(created_at) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS last_audit FROM accounts;",
    starterQuery: "SELECT id, username, (SELECT MAX(created_at) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS last_audit FROM accounts;",
    table_names: ["accounts", "audit_logs"]
  },
  {
    id: 1026,
    moduleId: 10,
    categorySlot: 6,
    title: {
      en: "Detecting Correlated Sum SubPlans (Var #3)",
      id: "Mendeteksi SubPlan Penjumlahan Terikat (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Calculating account totals by recounting individual paper receipts one customer at a time.\n\nEngine Processing Behavior: Flags SubPlan nodes where inner aggregations execute per outer tuple.\n\nBest Practices & Gotchas: Correlated scalar subqueries in SELECT clauses are a notorious database performance killer.",
      id: "Analogi Konseptual: Menghitung total saldo dengan menghitung ulang lembaran kwitansi terpisah untuk setiap nasabah satu per satu.\n\nCara Kerja Database Engine: Menandai simpul SubPlan di mana kalkulasi agregasi dijalankan terpisah untuk setiap baris tabel luar.\n\nBest Practices & Catatan Penting: Subquery skalar terikat pada klausa SELECT adalah penyebab umum penurunan performa database yang drastis."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect correlated sum subplan",
          id: "Pemeriksaan rencana subplan penjumlahan terikat"
        },
        code: "EXPLAIN SELECT id, (SELECT SUM(amount) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS total_audit FROM accounts;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving account `id` and the correlated sum of `amount` from `audit_logs` aliased as `total_audit` from `accounts`.",
      id: "Periksa rencana eksekusi untuk mengambil `id` akun dan penjumlahan `amount` terikat dari `audit_logs` beralias `total_audit` dari `accounts`."
    },
    seed_sql: "mod10SubplanSeed",
    expected_query: "EXPLAIN SELECT id, (SELECT SUM(amount) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS total_audit FROM accounts;",
    starterQuery: "SELECT id, (SELECT SUM(amount) FROM audit_logs WHERE audit_logs.account_id = accounts.id) AS total_audit FROM accounts;",
    table_names: ["accounts", "audit_logs"]
  },

  // Slot 7: Aggregation Strategy and Memory Costs
  {
    id: 1017,
    moduleId: 10,
    categorySlot: 7,
    title: {
      en: "Inspect Peak Metric Aggregation Plan (Var #2)",
      id: "Memeriksa Rencana Agregasi Nilai Sensor Puncak (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Scanning an array of thermometers and noting down only the single hottest temperature recorded by each device.\n\nEngine Processing Behavior: The planner estimates memory consumption and chooses between HashAggregate (in memory) and GroupAggregate (which requires prior sorting).\n\nBest Practices & Gotchas: HashAggregate is preferred when the number of distinct group keys easily fits inside work_mem.",
      id: "Analogi Konseptual: Mengamati deretan termometer dan mencatat nilai suhu tertinggi yang pernah terekam oleh masing-masing sensor.\n\nCara Kerja Database Engine: Planner memperkirakan kebutuhan memori dan memilih antara HashAggregate (di RAM) atau GroupAggregate (yang memerlukan pengurutan terlebih dahulu).\n\nBest Practices & Catatan Penting: HashAggregate dipilih saat jumlah grup unik muat dengan leluasa di dalam alokasi work_mem."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect peak aggregation plan",
          id: "Pemeriksaan rencana agregasi puncak"
        },
        code: "EXPLAIN SELECT sensor_id, MAX(reading_val) AS peak_reading FROM metrics GROUP BY sensor_id;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for finding the maximum `reading_val` aliased as `peak_reading` grouped by `sensor_id` from `metrics`.",
      id: "Periksa rencana eksekusi untuk mencari `reading_val` maksimum beralias `peak_reading` dikelompokkan berdasarkan `sensor_id` dari `metrics`."
    },
    seed_sql: "mod10MetricsSeed",
    expected_query: "EXPLAIN SELECT sensor_id, MAX(reading_val) AS peak_reading FROM metrics GROUP BY sensor_id;",
    starterQuery: "SELECT sensor_id, MAX(reading_val) AS peak_reading FROM metrics GROUP BY sensor_id;",
    table_names: ["metrics"]
  },
  {
    id: 1027,
    moduleId: 10,
    categorySlot: 7,
    title: {
      en: "Inspect Filtered Group Aggregation Plan (Var #3)",
      id: "Memeriksa Rencana Agregasi Grup Tersaring (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Counting sensor reports and discarding any sensor that submitted fewer than 10 total logs.\n\nEngine Processing Behavior: Evaluates aggregate costs with a post-aggregation filter condition represented by a Filter node above the Aggregate node.\n\nBest Practices & Gotchas: HAVING filters operate strictly after groups are formed; WHERE filters apply prior to grouping and are much cheaper.",
      id: "Analogi Konseptual: Menghitung laporan sensor dan menyingkirkan sensor yang hanya mengirimkan kurang dari 10 rekaman data.\n\nCara Kerja Database Engine: Mengevaluasi biaya agregasi dengan predikat pasca-agregasi yang direpresentasikan oleh simpul Filter di atas simpul Aggregate.\n\nBest Practices & Catatan Penting: Filter HAVING dieksekusi setelah kelompok terbentuk; filter WHERE bekerja sebelum pengelompokan dan jauh lebih hemat sumber daya."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect having aggregation plan",
          id: "Pemeriksaan rencana agregasi having"
        },
        code: "EXPLAIN SELECT sensor_id, COUNT(*) AS read_count FROM metrics GROUP BY sensor_id HAVING COUNT(*) > 10;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for counting readings per `sensor_id` aliased as `read_count`, filtering for sensor groups with more than 10 readings from the metrics table.",
      id: "Periksa rencana eksekusi untuk menghitung jumlah pembacaan per `sensor_id` beralias `read_count` yang memiliki total lebih dari 10 dari `metrics`."
    },
    seed_sql: "mod10MetricsSeed",
    expected_query: "EXPLAIN SELECT sensor_id, COUNT(*) AS read_count FROM metrics GROUP BY sensor_id HAVING COUNT(*) > 10;",
    starterQuery: "SELECT sensor_id, COUNT(*) AS read_count FROM metrics GROUP BY sensor_id HAVING COUNT(*) > 10;",
    table_names: ["metrics"]
  },

  // Slot 8: Ordering Elimination via Index Scans
  {
    id: 1018,
    moduleId: 10,
    categorySlot: 8,
    title: {
      en: "Inspect Reverse Index Scan Ordering Elimination (Var #2)",
      id: "Memeriksa Eliminasi Pengurutan via Pemindaian Indeks Terbalik (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Reading a physical index book from the back page forward: the pages are already in perfect order, so no extra sorting is required.\n\nEngine Processing Behavior: B-Tree indexes are bidirectional; an Index Scan Backward node satisfies ORDER BY ... DESC directly without inserting a dedicated Sort operator.\n\nBest Practices & Gotchas: Eliminating Sort nodes prevents sorting spikes in memory and delivers instant startup for LIMIT queries.",
      id: "Analogi Konseptual: Membaca buku indeks dari halaman paling belakang ke depan: datanya sudah tersusun rapi sehingga tidak perlu proses penyortiran ulang.\n\nCara Kerja Database Engine: Indeks B-Tree bersifat dua arah (bidirectional); simpul Index Scan Backward memenuhi klausa ORDER BY ... DESC secara langsung tanpa simpul Sort tambahan.\n\nBest Practices & Catatan Penting: Mengeliminasi simpul Sort mencegah lonjakan alokasi memori dan memberikan waktu respons awal instan pada query ber-LIMIT."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect backwards index ordering plan",
          id: "Pemeriksaan rencana pengurutan mundur indeks"
        },
        code: "EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at DESC LIMIT 10;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving the top 10 articles ordered by `published_at` descending, showing `id` and `published_at`.",
      id: "Periksa rencana eksekusi untuk mengambil 10 artikel teratas diurutkan berdasarkan `published_at` menurun, menampilkan `id` dan `published_at`."
    },
    seed_sql: "mod10ArticlesSeed",
    expected_query: "EXPLAIN SELECT id, published_at FROM articles ORDER BY published_at DESC LIMIT 10;",
    starterQuery: "SELECT id, published_at FROM articles ORDER BY published_at DESC LIMIT 10;",
    table_names: ["articles"]
  },
  {
    id: 1028,
    moduleId: 10,
    categorySlot: 8,
    title: {
      en: "Inspect Multi-Column Ordering Plan with Limit (Var #3)",
      id: "Memeriksa Rencana Pengurutan Multi-Kolom dengan Limit (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Grabbing the top 5 newest books from a bookstore display without cataloging the entire inventory.\n\nEngine Processing Behavior: Evaluates whether an index scan satisfies the ordering and limits row retrieval early.\n\nBest Practices & Gotchas: Pairing ORDER BY with a small LIMIT is one of the highest leverage query optimizations in SQL.",
      id: "Analogi Konseptual: Mengambil 5 buku terbaru dari rak display toko buku tanpa perlu menyortir seluruh gudang.\n\nCara Kerja Database Engine: Mengevaluasi apakah pemindaian indeks memenuhi urutan data dan memutus pembacaan baris lebih awal.\n\nBest Practices & Catatan Penting: Memadukan klausa ORDER BY dengan batas LIMIT kecil adalah salah satu teknik optimasi query paling berdampak tinggi di SQL."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect limited order plan",
          id: "Pemeriksaan rencana sortir terbatas"
        },
        code: "EXPLAIN SELECT id, published_at, title FROM articles ORDER BY published_at LIMIT 5;"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving the earliest 5 articles showing `id`, `published_at`, and `title`, ordered by `published_at`.",
      id: "Periksa rencana eksekusi untuk mengambil 5 artikel paling awal yang menampilkan `id`, `published_at`, dan `title`, diurutkan berdasarkan `published_at`."
    },
    seed_sql: "mod10ArticlesSeed",
    expected_query: "EXPLAIN SELECT id, published_at, title FROM articles ORDER BY published_at LIMIT 5;",
    starterQuery: "SELECT id, published_at, title FROM articles ORDER BY published_at LIMIT 5;",
    table_names: ["articles"]
  },

  // Slot 9: Inspect Shared Buffer Cache Activity
  {
    id: 1019,
    moduleId: 10,
    categorySlot: 9,
    title: {
      en: "Inspect Cache Hits for Mid-Table Article Lookups (Var #2)",
      id: "Memeriksa Cache Hit pada Pencarian Artikel Tengah (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Checking whether an office document is already sitting on the receptionist's desk (cache hit) or must be fetched from the basement archives (disk read).\n\nEngine Processing Behavior: The BUFFERS option reports exact counts of 8KB page blocks accessed in PostgreSQL shared_buffers cache (hit) versus physical storage reads (read).\n\nBest Practices & Gotchas: A high ratio of shared buffer reads compared to hits indicates memory pressure or lack of effective indexing.",
      id: "Analogi Konseptual: Memeriksa apakah berkas dokumen sudah ada di meja resepsionis (cache hit) atau harus diambil dari gudang arsip bawah tanah (disk read).\n\nCara Kerja Database Engine: Opsi BUFFERS melaporkan jumlah blok halaman 8KB yang dibaca langsung dari shared_buffers RAM (hit) dibandingkan pembacaan disk fisik (read).\n\nBest Practices & Catatan Penting: Rasio pembacaan disk yang tinggi dibandingkan cache hit menandakan tekanan kapasitas memori atau ketiadaan indeks yang tepat."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect buffers activity with analyze",
          id: "Pemeriksaan aktivitas buffers dengan analyze"
        },
        code: "EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 50;"
      }
    ],
    instructions: {
      en: "Inspect shared buffer cache activity for fetching the article with id 50 using explain analyze with buffers enabled, timing off, and summary off.",
      id: "Periksa aktivitas shared buffer cache untuk mengambil data artikel dengan id 50 menggunakan explain analyze dengan buffers aktif, timing nonaktif, dan summary nonaktif."
    },
    seed_sql: "mod10ArticlesSeed",
    expected_query: "EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT * FROM articles WHERE id = 50;",
    starterQuery: "SELECT * FROM articles WHERE id = 50;",
    table_names: ["articles"]
  },
  {
    id: 1029,
    moduleId: 10,
    categorySlot: 9,
    title: {
      en: "Inspect Shared Buffer Activity for Primary Key Scan (Var #3)",
      id: "Memeriksa Aktivitas Shared Buffer untuk Pemindaian Kunci Utama (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Measuring the physical effort required to locate the first entry in an indexed directory.\n\nEngine Processing Behavior: Details buffer hits for both the B-Tree root/leaf pages and the heap data page containing row tuple 1.\n\nBest Practices & Gotchas: Primary key lookups generally require only 2-3 shared buffer hits (index traversal + heap fetch).",
      id: "Analogi Konseptual: Mengukur tenaga fisik yang dibutuhkan untuk menemukan baris pertama dalam direktori buku berseri.\n\nCara Kerja Database Engine: Merinci buffer hit untuk halaman akar/daun B-Tree indeks dan halaman data heap yang memuat baris data 1.\n\nBest Practices & Catatan Penting: Pencarian via primary key umumnya hanya memerlukan 2 hingga 3 shared buffer hit (penelusuran indeks + pembacaan heap)."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Analyze primary key buffer hits",
          id: "Analisis buffer hit kunci utama"
        },
        code: "EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT id, title FROM articles WHERE id = 1;"
      }
    ],
    instructions: {
      en: "Inspect shared buffer activity for fetching `id` and `title` for article id 1 using explain analyze with buffers enabled, timing off, and summary off.",
      id: "Periksa aktivitas shared buffer untuk mengambil `id` dan `title` artikel id 1 menggunakan explain analyze dengan buffers aktif, timing nonaktif, dan summary nonaktif."
    },
    seed_sql: "mod10ArticlesSeed",
    expected_query: "EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) SELECT id, title FROM articles WHERE id = 1;",
    starterQuery: "SELECT id, title FROM articles WHERE id = 1;",
    table_names: ["articles"]
  },

  // Slot 10: Planner Row Estimates and Catalog Statistics
  {
    id: 1020,
    moduleId: 10,
    categorySlot: 10,
    title: {
      en: "Planner Row Estimates for In-Stock Inventory (Var #2)",
      id: "Estimasi Baris Planner untuk Inventaris Tersedia (Latihan #2)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: An event coordinator estimating how many seats are filled based on a recent ticket sales tally.\n\nEngine Processing Behavior: The planner consults pg_statistic (via the pg_stats view) to look up the Most Common Values (MCV) list and estimate row counts for skewed status distributions.\n\nBest Practices & Gotchas: If data distribution changes drastically after bulk data loading, execute ANALYZE to update the statistical histograms.",
      id: "Analogi Konseptual: Koordinator acara yang memperkirakan berapa banyak kursi yang terisi berdasarkan rekap penjualan tiket terkini.\n\nCara Kerja Database Engine: Planner membaca katalog statistik pg_statistic (via view pg_stats) untuk memeriksa daftar Most Common Values (MCV) dan mengestimasi jumlah baris pada data yang timpang.\n\nBest Practices & Catatan Penting: Jika distribusi data berubah drastis setelah pemuatan data massal, jalankan perintah ANALYZE untuk memperbarui histogram statistik."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect skewed row estimate plan",
          id: "Pemeriksaan rencana estimasi baris timpang"
        },
        code: "EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'in_stock';"
      }
    ],
    instructions: {
      en: "Inspect the execution plan row estimates for selecting items with status 'in_stock' from `skewed_inventory`.",
      id: "Periksa estimasi baris pada rencana eksekusi untuk memilih barang dengan status 'in_stock' dari tabel `skewed_inventory`."
    },
    seed_sql: "mod10SkewedSeed",
    expected_query: "EXPLAIN SELECT * FROM skewed_inventory WHERE status = 'in_stock';",
    starterQuery: "SELECT * FROM skewed_inventory WHERE status = 'in_stock';",
    table_names: ["skewed_inventory"]
  },
  {
    id: 1030,
    moduleId: 10,
    categorySlot: 10,
    title: {
      en: "Planner Estimates for Discontinued Item Scan (Var #3)",
      id: "Estimasi Planner untuk Pemindaian Barang Dihentikan (Latihan #3)"
    },
    conceptExplanation: {
      en: "Conceptual Analogy: Calculating how few discontinued obsolete spare parts remain in a massive modern auto parts warehouse.\n\nEngine Processing Behavior: Checks the rarity of the candidate value in catalog frequency tables to estimate row counts.\n\nBest Practices & Gotchas: Highly infrequent values often trigger Index Scans while frequent values trigger Sequential Scans.",
      id: "Analogi Konseptual: Menghitung betapa sedikitnya suku cadang usang yang masih tersisa di gudang suku cadang otomotif modern yang sangat luas.\n\nCara Kerja Database Engine: Memeriksa tingkat kelangkaan nilai pencarian di tabel frekuensi statistik katalog untuk mengestimasi jumlah baris hasil.\n\nBest Practices & Catatan Penting: Nilai data yang sangat langka memicu pemilihan Index Scan, sedangkan nilai yang sangat umum memicu Sequential Scan."
    },
    syntaxPatterns: [
      {
        label: {
          en: "Inspect rare value row estimate",
          id: "Pemeriksaan estimasi baris nilai langka"
        },
        code: "EXPLAIN SELECT id, item_name FROM skewed_inventory WHERE status = 'discontinued';"
      }
    ],
    instructions: {
      en: "Inspect the execution plan for retrieving `id` and `item_name` from `skewed_inventory` where status is 'discontinued'.",
      id: "Periksa rencana eksekusi untuk mengambil `id` dan `item_name` dari `skewed_inventory` di mana status bernilai 'discontinued'."
    },
    seed_sql: "mod10SkewedSeed",
    expected_query: "EXPLAIN SELECT id, item_name FROM skewed_inventory WHERE status = 'discontinued';",
    starterQuery: "SELECT id, item_name FROM skewed_inventory WHERE status = 'discontinued';",
    table_names: ["skewed_inventory"]
  }
];

console.log("Module 10 questions defined:", m10Questions.length);

module.exports = { m7Questions, m8Questions, m9Questions, m10Questions };
