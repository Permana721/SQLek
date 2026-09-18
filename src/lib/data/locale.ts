import { writable } from 'svelte/store';

export type Locale = 'en' | 'id';

function createLocaleStore() {
	let initialLocale: Locale = 'en';
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('sql_app_locale');
		if (saved === 'en' || saved === 'id') {
			initialLocale = saved;
		}
	}

	const { subscribe, set } = writable<Locale>(initialLocale);

	return {
		subscribe,
		setLocale: (lang: Locale) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('sql_app_locale', lang);
			}
			set(lang);
		},
		toggleLocale: () => {
			let next: Locale = 'en';
			if (typeof window !== 'undefined') {
				const current = localStorage.getItem('sql_app_locale') as Locale;
				next = current === 'id' ? 'en' : 'id';
				localStorage.setItem('sql_app_locale', next);
			}
			set(next);
		}
	};
}

export const locale = createLocaleStore();

export const t = {
	en: {
		switchEngine: "Switch Engine",
		backToModules: "Back to Modules",
		modulesTitle: "Learning Modules",
		passed: "Passed",
		locked: "Locked",
		randomQuestions: (n: number) => `${n} tasks per session (pool of 30)`,
		start: "Start →",
		unlockModule: (n: number) => `Complete Module ${n} to unlock`,
		lessonConcept: "Lesson & Concept",
		syntaxPattern: "SYNTAX PATTERN",
		taskInstructions: "Task Instructions",
		taskGoal: "Task Goal",
		targetSchema: "Target Tables Schema & Sample",
		sqlQuery: "SQL Query",
		runQuery: "Run Query",
		executing: "Executing...",
		correctAnswer: "Correct Answer!",
		queryOutput: "Query Output",
		previousTask: "← Previous Task",
		nextTask: "Next Task →",
		previous: "Previous",
		nextTaskBtn: "Next Task",
		nextTaskNav: "Next Task →",
		nextModuleNav: "Next Module →",
		backToMenuNav: "Back to Menu",
		resetTask: "Reset Task",
		congratulations: "🎉 Module Completed! Excellent Work!",
		moduleCompleteMsg: (n: number) => `You have solved all ${n} tasks in this module.`,
		nextModuleBtn: "Next Module →",
		taskHeader: (curr: number, total: number) => `Task ${curr} of ${total}`,
		previewBadge: (n: number) => `Preview Only (Complete Task ${n} to Unlock Execution)`,
		completedBadge: "Completed",
		initialTablePreview: (name: string) => `Initial Table Preview (${name})`,
		targetSchemaBlueprint: "Target Schema Blueprint",
		sampleRecordsExpected: "Sample records expected in the schema:",
		ddlTableNotCreatedMsg: "This table does not exist yet. Run your DDL query to create it.",
		colNameHeader: "Column",
		colTypeHeader: "Type",
		colConstraintHeader: "Constraints",
		loadingPreview: "Loading table preview...",
		noTableSeeded: "No existing table pre-seeded for this DDL task.",
		taskLockedNotice: "Task locked — complete previous task to run queries",
		taskLockedPreview: "This task is preview-only. Complete previous tasks to execute queries.",
		runQueryHint: "Press Ctrl+Enter / Cmd+Enter to run",
		noRowsReturned: "Query executed successfully. 0 rows returned.",
		runQueryPrompt: "Run a query to see the results here.",
		// Landing page
		heroTitle: "Interactive SQL Learning",
		heroSubtitle: "Practice SQL directly in your browser with WebAssembly execution. No accounts, no external database connection, instant and secure.",
		pgTitle: "PostgreSQL",
		pgDesc: "Supports DDL, DML, Relations, Subqueries, to Window Functions via PGlite.",
		myTitle: "MySQL / SQLite",
		myDesc: "Fast and compatible query execution using sql.js WASM engine.",
		continueModule: (n: number) => `Continue to Module ${n}`,
		startModule1: "Start from Module 1",
		sessionInfo: "Session Info",
		resetSession: "Reset Session",
		resetDatabase: "Reset Database",
		engine: "Engine",
		// Challenge Mode
		finalBossBadge: "FINAL BOSS",
		challengeTitle: "Comprehensive Random Exam",
		challengeDesc: "Test your end-to-end database mastery. Questions from all modules (DDL, WHERE, Aggregations, Relations, Subqueries, Window Functions, Transactions, through Indexing) are completely randomized with dynamic contexts.",
		challengeTasksCount: "20 Randomized Tasks per Session",
		challengeUnlockCondition: "Complete Modules 1–9 to unlock",
		challengeStartBtn: "Start Exam →",
		challengeLockedBtn: "Locked",
		challengeHeaderTitle: "Comprehensive Challenge / All Modules Random Practice",
		challengeCompletedBadge: "Exam Passed",
		finishExamNav: "Finish Exam & Back to Menu",
		challengeCongratulations: "🏆 Comprehensive Challenge Completed! Incredible Mastery!",
		challengeCompleteMsg: "You have conquered all 20 randomized challenge tasks across all curriculum modules!",
		challengeRedirectToast: "Complete Modules 1 through 9 to unlock the Comprehensive Challenge."
	},
	id: {
		switchEngine: "Ganti Engine",
		backToModules: "Kembali ke Modul",
		modulesTitle: "Modul Pembelajaran",
		passed: "Selesai",
		locked: "Terkunci",
		randomQuestions: (n: number) => `${n} soal per sesi (pool 30 soal)`,
		start: "Mulai →",
		unlockModule: (n: number) => `Selesaikan Modul ${n} untuk membuka`,
		lessonConcept: "Konsep & Teori",
		syntaxPattern: "Syntax Pattern",
		taskInstructions: "Instruksi Tugas",
		taskGoal: "Target Tugas",
		targetSchema: "Skema & Sampel Tabel Target",
		sqlQuery: "SQL Query",
		runQuery: "Jalankan Query",
		executing: "Menjalankan Query...",
		correctAnswer: "Jawaban Benar!",
		queryOutput: "Output Query",
		previousTask: "← Soal Sebelumnya",
		nextTask: "Soal Selanjutnya →",
		previous: "Sebelumnya",
		nextTaskBtn: "Soal Selanjutnya",
		nextTaskNav: "Soal Selanjutnya →",
		nextModuleNav: "Modul Selanjutnya →",
		backToMenuNav: "Kembali ke Menu",
		resetTask: "Reset Soal",
		congratulations: "🎉 Modul Selesai! Kerja Bagus!",
		moduleCompleteMsg: (n: number) => `Kamu telah menyelesaikan seluruh ${n} soal di modul ini.`,
		nextModuleBtn: "Modul Selanjutnya →",
		taskHeader: (curr: number, total: number) => `Soal ${curr} dari ${total}`,
		previewBadge: (n: number) => `Preview (Selesaikan Soal ${n} untuk Membuka Eksekusi)`,
		completedBadge: "Selesai",
		initialTablePreview: (name: string) => `Preview Tabel (${name})`,
		targetSchemaBlueprint: "Struktur Skema Target",
		sampleRecordsExpected: "Contoh data yang diharapkan pada skema ini:",
		ddlTableNotCreatedMsg: "Tabel ini belum ada di database. Jalankan query DDL untuk membuatnya.",
		colNameHeader: "Kolom",
		colTypeHeader: "Tipe Data",
		colConstraintHeader: "Constraint",
		loadingPreview: "Memuat preview tabel...",
		noTableSeeded: "Tidak ada tabel awal untuk soal DDL ini.",
		taskLockedNotice: "Soal terkunci — selesaikan soal sebelumnya untuk menjalankan query",
		taskLockedPreview: "Soal ini hanya preview. Selesaikan soal sebelumnya untuk menjalankan query.",
		runQueryHint: "Tekan Ctrl+Enter / Cmd+Enter untuk menjalankan query",
		noRowsReturned: "Query berhasil dijalankan. 0 row dikembalikan.",
		runQueryPrompt: "Jalankan query untuk melihat output di sini.",
		// Landing page
		heroTitle: "Belajar SQL Interaktif",
		heroSubtitle: "Praktik SQL langsung di browser dengan eksekusi WebAssembly. Tanpa akun, tanpa koneksi database eksternal, instan dan aman.",
		pgTitle: "PostgreSQL",
		pgDesc: "Mendukung DDL, DML, Relasi, Subquery, hingga Window Function via PGlite.",
		myTitle: "MySQL / SQLite",
		myDesc: "Eksekusi query cepat dan kompatibel menggunakan engine WASM sql.js.",
		continueModule: (n: number) => `Lanjut ke Modul ${n}`,
		startModule1: "Mulai dari Modul 1",
		sessionInfo: "Info Sesi",
		resetSession: "Reset Sesi",
		resetDatabase: "Reset Database",
		engine: "Engine",
		// Challenge Mode
		finalBossBadge: "FINAL BOSS",
		challengeTitle: "Simulasi Ujian & Latihan Acak",
		challengeDesc: "Uji pemahaman komprehensifmu! Soal-soal dari seluruh modul (DDL, WHERE, Agregasi, JOIN, Subquery, Window Functions, Transaksi, hingga Indexing) akan diacak tanpa urutan kategori tertentu.",
		challengeTasksCount: "20 Soal Acak per Sesi",
		challengeUnlockCondition: "Selesaikan Modul 1–9 untuk membuka",
		challengeStartBtn: "Mulai Ujian →",
		challengeLockedBtn: "Terkunci",
		challengeHeaderTitle: "Latihan Acak Komprehensif Seluruh Materi",
		challengeCompletedBadge: "Ujian Selesai",
		finishExamNav: "Selesai & Kembali ke Menu",
		challengeCongratulations: "🏆 Ujian Komprehensif Selesai! Luar Biasa!",
		challengeCompleteMsg: "Kamu telah berhasil menuntaskan seluruh 20 soal tantangan acak dari semua modul kurikulum!",
		challengeRedirectToast: "Selesaikan Modul 1 sampai 9 terlebih dahulu sebelum membuka Ujian Komprehensif."
	}
};
