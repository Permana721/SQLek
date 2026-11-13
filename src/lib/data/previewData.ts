import type { MockPreviewData, Question } from './types';
import type { IDbEngine } from '$lib/db/engine';

export type { MockPreviewData };

export const STATIC_TABLE_PREVIEWS: Record<string, MockPreviewData> = {
	movies: {
		tableName: 'movies',
		columns: ['id', 'title', 'director', 'year', 'rating'],
		totalRowCount: 15,
		rows: [
			{ id: 1, title: 'Toy Story', director: 'John Lasseter', year: 1995, rating: 8.3 },
			{ id: 2, title: "A Bug's Life", director: 'John Lasseter', year: 1998, rating: 7.2 },
			{ id: 3, title: 'Toy Story 2', director: 'John Lasseter', year: 1999, rating: 7.9 },
			{ id: 4, title: 'Monsters, Inc.', director: 'Pete Docter', year: 2001, rating: 8.1 },
			{ id: 5, title: 'Finding Nemo', director: 'Andrew Stanton', year: 2003, rating: 8.2 },
			{ id: 6, title: 'The Incredibles', director: 'Brad Bird', year: 2004, rating: 8.0 },
			{ id: 7, title: 'Cars', director: 'John Lasseter', year: 2006, rating: 7.2 },
			{ id: 8, title: 'Ratatouille', director: 'Brad Bird', year: 2007, rating: 8.1 },
			{ id: 9, title: 'WALL-E', director: 'Andrew Stanton', year: 2008, rating: 8.4 },
			{ id: 10, title: 'Up', director: 'Pete Docter', year: 2009, rating: 8.3 },
			{ id: 11, title: 'Toy Story 3', director: 'Lee Unkrich', year: 2010, rating: 8.3 },
			{ id: 12, title: 'Cars 2', director: 'John Lasseter', year: 2011, rating: 6.2 },
			{ id: 13, title: 'Brave', director: 'Brenda Chapman', year: 2012, rating: 7.1 },
			{ id: 14, title: 'Shutter Island', director: 'Martin Scorsese', year: 2010, rating: 8.2 },
			{ id: 15, title: 'Interstellar', director: 'Christopher Nolan', year: 2014, rating: 8.7 }
		]
	},
	books: {
		tableName: 'books',
		columns: ['id', 'title', 'price'],
		totalRowCount: 5,
		rows: [
			{ id: 1, title: 'The Pragmatic Programmer', price: 45 },
			{ id: 2, title: 'Clean Architecture', price: 38 },
			{ id: 3, title: 'Designing Data-Intensive Applications', price: 52 },
			{ id: 4, title: 'Refactoring', price: 42 },
			{ id: 5, title: 'Database Internals', price: 48 }
		]
	},
	items: {
		tableName: 'items',
		columns: ['id', 'name', 'category', 'price', 'stock', 'status'],
		totalRowCount: 12,
		rows: [
			{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1200, stock: 15, status: 'Available' },
			{ id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 30, stock: 100, status: 'Available' },
			{ id: 3, name: 'Desk Chair', category: 'Furniture', price: 250, stock: 0, status: 'OutOfStock' },
			{ id: 4, name: 'Standing Desk', category: 'Furniture', price: 550, stock: 5, status: 'Available' },
			{ id: 5, name: 'Coffee Mug', category: 'Kitchen', price: 15, stock: 200, status: 'Available' },
			{ id: 6, name: 'Mechanical Keyboard', category: 'Electronics', price: 110, stock: 45, status: 'Available' },
			{ id: 7, name: 'Monitor 4K', category: 'Electronics', price: 400, stock: 8, status: 'Available' },
			{ id: 8, name: 'Bookshelf', category: 'Furniture', price: 180, stock: 0, status: 'Discontinued' },
			{ id: 9, name: 'USB Cable', category: 'Electronics', price: 10, stock: 300, status: 'Available' },
			{ id: 10, name: 'Notebook', category: 'Stationery', price: 8, stock: 150, status: 'Available' },
			{ id: 11, name: 'Fountain Pen', category: 'Stationery', price: 45, stock: 25, status: 'Available' },
			{ id: 12, name: 'Desk Lamp', category: 'Furniture', price: 60, stock: 12, status: 'Available' }
		]
	},
	sales: {
		tableName: 'sales',
		columns: ['id', 'region', 'seller', 'category', 'amount'],
		totalRowCount: 15,
		rows: [
			{ id: 1, region: 'North', seller: 'Alice', category: 'Tech', amount: 1200 },
			{ id: 2, region: 'South', seller: 'Bob', category: 'Tech', amount: 850 },
			{ id: 3, region: 'North', seller: 'Alice', category: 'Furniture', amount: 450 },
			{ id: 4, region: 'West', seller: 'Charlie', category: 'Tech', amount: 1500 },
			{ id: 5, region: 'East', seller: 'Diana', category: 'Furniture', amount: 600 },
			{ id: 6, region: 'North', seller: 'Eve', category: 'Tech', amount: 950 },
			{ id: 7, region: 'South', seller: 'Bob', category: 'Furniture', amount: 300 },
			{ id: 8, region: 'West', seller: 'Charlie', category: 'Furniture', amount: 700 },
			{ id: 9, region: 'North', seller: 'Alice', category: 'Tech', amount: 1100 },
			{ id: 10, region: 'East', seller: 'Diana', category: 'Tech', amount: 1300 },
			{ id: 11, region: 'South', seller: 'Frank', category: 'Tech', amount: 400 },
			{ id: 12, region: 'West', seller: 'Grace', category: 'Tech', amount: 1750 },
			{ id: 13, region: 'East', seller: 'Diana', category: 'Furniture', amount: 250 },
			{ id: 14, region: 'North', seller: 'Eve', category: 'Furniture', amount: 500 },
			{ id: 15, region: 'South', seller: 'Frank', category: 'Furniture', amount: 350 }
		]
	},
	customers: {
		tableName: 'customers',
		columns: ['id', 'first_name', 'last_name', 'score', 'join_date', 'discount_code'],
		totalRowCount: 8,
		rows: [
			{ id: 1, first_name: 'john', last_name: 'doe', score: 85, join_date: '2022-01-15', discount_code: 'SAVE10' },
			{ id: 2, first_name: 'jane', last_name: 'smith', score: 92, join_date: '2021-06-20', discount_code: null },
			{ id: 3, first_name: 'alex', last_name: 'jones', score: 45, join_date: '2023-03-10', discount_code: 'WELCOME' },
			{ id: 4, first_name: 'sarah', last_name: 'connor', score: 78, join_date: '2020-11-05', discount_code: null },
			{ id: 5, first_name: 'michael', last_name: 'brown', score: 60, join_date: '2022-08-30', discount_code: 'SAVE20' },
			{ id: 6, first_name: 'emily', last_name: 'davis', score: 95, join_date: '2019-04-12', discount_code: null },
			{ id: 7, first_name: 'david', last_name: 'wilson', score: 30, join_date: '2023-01-22', discount_code: 'PROMO' },
			{ id: 8, first_name: 'lisa', last_name: 'taylor', score: 88, join_date: '2021-12-01', discount_code: null }
		]
	},
	departments: {
		tableName: 'departments',
		columns: ['id', 'dept_name'],
		totalRowCount: 4,
		rows: [
			{ id: 1, dept_name: 'Engineering' },
			{ id: 2, dept_name: 'Sales' },
			{ id: 3, dept_name: 'Marketing' },
			{ id: 4, dept_name: 'HR' }
		]
	},
	employees: {
		tableName: 'employees',
		columns: ['id', 'name', 'department_id', 'manager_id', 'salary'],
		totalRowCount: 8,
		rows: [
			{ id: 1, name: 'Alice', department_id: 1, manager_id: null, salary: 90000 },
			{ id: 2, name: 'Bob', department_id: 1, manager_id: 1, salary: 75000 },
			{ id: 3, name: 'Charlie', department_id: 2, manager_id: null, salary: 85000 },
			{ id: 4, name: 'Diana', department_id: 2, manager_id: 3, salary: 60000 },
			{ id: 5, name: 'Evan', department_id: 3, manager_id: null, salary: 70000 },
			{ id: 6, name: 'Fiona', department_id: null, manager_id: null, salary: 50000 },
			{ id: 7, name: 'George', department_id: 1, manager_id: 1, salary: 80000 },
			{ id: 8, name: 'Hannah', department_id: 2, manager_id: 3, salary: 62000 }
		]
	},
	project_a: {
		tableName: 'project_a',
		columns: ['id', 'member_name', 'role', 'score'],
		totalRowCount: 4,
		rows: [
			{ id: 1, member_name: 'Alice', role: 'Lead', score: 90 },
			{ id: 2, member_name: 'Bob', role: 'Dev', score: 80 },
			{ id: 3, member_name: 'Charlie', role: 'Tester', score: 70 },
			{ id: 4, member_name: 'Diana', role: 'Dev', score: 85 }
		]
	},
	project_b: {
		tableName: 'project_b',
		columns: ['id', 'member_name', 'role', 'score'],
		totalRowCount: 4,
		rows: [
			{ id: 3, member_name: 'Charlie', role: 'Tester', score: 75 },
			{ id: 4, member_name: 'Diana', role: 'Dev', score: 85 },
			{ id: 5, member_name: 'Evan', role: 'Design', score: 95 },
			{ id: 6, member_name: 'Fiona', role: 'Lead', score: 88 }
		]
	},
	accounts: {
		tableName: 'accounts',
		columns: ['id', 'owner', 'balance', 'category'],
		totalRowCount: 5,
		rows: [
			{ id: 1, owner: 'User A', balance: 1500, category: 'Checking' },
			{ id: 2, owner: 'User B', balance: 3200, category: 'Savings' },
			{ id: 3, owner: 'User C', balance: 800, category: 'Checking' },
			{ id: 4, owner: 'User D', balance: 4500, category: 'Savings' },
			{ id: 5, owner: 'User E', balance: 2100, category: 'Checking' }
		]
	},
	cart: {
		tableName: 'cart',
		columns: ['user_id', 'product_id', 'quantity'],
		totalRowCount: 3,
		rows: [
			{ user_id: 1, product_id: 101, quantity: 2 },
			{ user_id: 1, product_id: 102, quantity: 1 },
			{ user_id: 2, product_id: 101, quantity: 5 }
		]
	},
	orders: {
		tableName: 'orders',
		columns: ['id', 'customer_id', 'order_date', 'amount'],
		totalRowCount: 5,
		rows: [
			{ id: 1, customer_id: 10, order_date: '2023-01-01', amount: 100 },
			{ id: 2, customer_id: 10, order_date: '2023-03-01', amount: 250 },
			{ id: 3, customer_id: 10, order_date: '2023-02-01', amount: 150 },
			{ id: 4, customer_id: 20, order_date: '2023-01-15', amount: 300 },
			{ id: 5, customer_id: 20, order_date: '2023-04-10', amount: 450 }
		]
	},
	products: {
		tableName: 'products',
		columns: ['id', 'name', 'category', 'price', 'description', 'metadata'],
		totalRowCount: 5,
		rows: [
			{ id: 1, name: 'Mechanical Keyboard', category: 'Electronics', price: 150, description: 'Ergonomic wireless mechanical keyboard with rgb backlight', metadata: '{"brand": "Logitech", "color": "black", "in_stock": true}' },
			{ id: 2, name: 'Ergonomic Mouse', category: 'Electronics', price: 80, description: 'Vertical wireless ergonomic optical mouse with bluetooth', metadata: '{"brand": "Logitech", "color": "white", "in_stock": false}' },
			{ id: 3, name: 'Standing Desk', category: 'Furniture', price: 600, description: 'Dual motor adjustable height standing desk with bamboo top', metadata: '{"brand": "IKEA", "material": "bamboo", "in_stock": true}' },
			{ id: 4, name: 'Office Chair', category: 'Furniture', price: 350, description: 'Mesh ergonomic chair with lumbar support and armrests', metadata: '{"brand": "Herman Miller", "color": "black", "in_stock": true}' },
			{ id: 5, name: 'Noise-Cancelling Headphones', category: 'Electronics', price: 250, description: 'Wireless over-ear noise cancelling headphones with mic', metadata: '{"brand": "Sony", "color": "silver", "in_stock": true}' }
		]
	},
	subscriptions: {
		tableName: 'subscriptions',
		columns: ['id', 'user_id', 'plan_name', 'started_at', 'monthly_fee'],
		totalRowCount: 6,
		rows: [
			{ id: 1, user_id: 101, plan_name: 'Pro', started_at: '2024-01-15 08:30:00', monthly_fee: 29.99 },
			{ id: 2, user_id: 102, plan_name: 'Basic', started_at: '2024-01-28 14:10:00', monthly_fee: 9.99 },
			{ id: 3, user_id: 103, plan_name: 'Enterprise', started_at: '2024-02-05 10:00:00', monthly_fee: 99.99 },
			{ id: 4, user_id: 104, plan_name: 'Pro', started_at: '2024-02-20 16:45:00', monthly_fee: 29.99 },
			{ id: 5, user_id: 105, plan_name: 'Basic', started_at: '2024-03-01 11:20:00', monthly_fee: 9.99 },
			{ id: 6, user_id: 106, plan_name: 'Enterprise', started_at: '2024-03-15 13:00:00', monthly_fee: 99.99 }
		]
	},
	products_pricing: {
		tableName: 'products_pricing',
		columns: ['id', 'product_code', 'raw_price', 'discount_rate', 'notes'],
		totalRowCount: 4,
		rows: [
			{ id: 1, product_code: '  PROD-001  ', raw_price: '199.95', discount_rate: '0.15', notes: '  In stock  ' },
			{ id: 2, product_code: '  PROD-002  ', raw_price: '49.50', discount_rate: '0.10', notes: '  Low inventory  ' },
			{ id: 3, product_code: '  PROD-003  ', raw_price: '899.00', discount_rate: '0.20', notes: '  Flagship item  ' },
			{ id: 4, product_code: '  PROD-004  ', raw_price: '29.99', discount_rate: '0.05', notes: '  Clearance  ' }
		]
	},
	salary_grades: {
		tableName: 'salary_grades',
		columns: ['id', 'grade_level', 'min_salary', 'max_salary'],
		totalRowCount: 4,
		rows: [
			{ id: 1, grade_level: 'Junior', min_salary: 40000, max_salary: 65000 },
			{ id: 2, grade_level: 'Mid', min_salary: 65001, max_salary: 85000 },
			{ id: 3, grade_level: 'Senior', min_salary: 85001, max_salary: 110000 },
			{ id: 4, grade_level: 'Lead', min_salary: 110001, max_salary: 150000 }
		]
	},
	stores: {
		tableName: 'stores',
		columns: ['id', 'store_name', 'city'],
		totalRowCount: 3,
		rows: [
			{ id: 1, store_name: 'Downtown Flagship', city: 'Seattle' },
			{ id: 2, store_name: 'Metro Center', city: 'Portland' },
			{ id: 3, store_name: 'Airport Hub', city: 'San Francisco' }
		]
	},
	org_hierarchy: {
		tableName: 'org_hierarchy',
		columns: ['id', 'name', 'manager_id', 'role'],
		totalRowCount: 6,
		rows: [
			{ id: 1, name: 'Sarah Chen', manager_id: null, role: 'CEO' },
			{ id: 2, name: 'Marcus Brody', manager_id: 1, role: 'VP Engineering' },
			{ id: 3, name: 'Elena Rostova', manager_id: 1, role: 'VP Sales' },
			{ id: 4, name: 'Liam Vance', manager_id: 2, role: 'Lead Architect' },
			{ id: 5, name: 'Aisha Patel', manager_id: 2, role: 'Senior Engineer' },
			{ id: 6, name: 'Kenji Sato', manager_id: 3, role: 'Account Director' }
		]
	},
	active_tickets: {
		tableName: 'active_tickets',
		columns: ['id', 'title', 'status', 'closed_at'],
		totalRowCount: 4,
		rows: [
			{ id: 1, title: 'Database connection timeout', status: 'closed', closed_at: '2024-02-15' },
			{ id: 2, title: 'UI alignment glitch', status: 'open', closed_at: null },
			{ id: 3, title: 'SSL certificate renewal', status: 'closed', closed_at: '2024-02-18' },
			{ id: 4, title: 'Memory leak in worker', status: 'investigating', closed_at: null }
		]
	},
	ticket_archive: {
		tableName: 'ticket_archive',
		columns: ['id', 'title', 'status', 'closed_at', 'archived_at'],
		totalRowCount: 0,
		rows: []
	},
	job_queue: {
		tableName: 'job_queue',
		columns: ['id', 'task_type', 'payload', 'status'],
		totalRowCount: 4,
		rows: [
			{ id: 1, task_type: 'email_alert', payload: '{"to":"alice@example.com"}', status: 'queued' },
			{ id: 2, task_type: 'data_export', payload: '{"report":"quarterly"}', status: 'queued' },
			{ id: 3, task_type: 'image_resize', payload: '{"file":"avatar.png"}', status: 'processing' },
			{ id: 4, task_type: 'webhook_sync', payload: '{"event":"user_signup"}', status: 'queued' }
		]
	},
	article_tags: {
		tableName: 'article_tags',
		columns: ['id', 'title', 'tags', 'view_count'],
		totalRowCount: 4,
		rows: [
			{ id: 1, title: 'Getting Started with Postgres', tags: '{"postgres", "sql", "tutorial"}', view_count: 1420 },
			{ id: 2, title: 'Deep Dive into B-Tree Indexes', tags: '{"postgres", "indexing", "performance"}', view_count: 2890 },
			{ id: 3, title: 'Modern Web Development with SvelteKit', tags: '{"frontend", "javascript", "svelte"}', view_count: 950 },
			{ id: 4, title: 'Database Concurrency and Locks', tags: '{"postgres", "transactions", "locking"}', view_count: 3100 }
		]
	},
	user_accounts: {
		tableName: 'user_accounts',
		columns: ['id', 'email', 'is_active', 'signup_date'],
		totalRowCount: 5,
		rows: [
			{ id: 1, email: 'ALICE@EXAMPLE.COM', is_active: true, signup_date: '2023-01-15' },
			{ id: 2, email: 'bob.builder@acme.org', is_active: false, signup_date: '2023-03-22' },
			{ id: 3, email: 'CHARLIE@DOMAIN.NET', is_active: true, signup_date: '2023-05-10' },
			{ id: 4, email: 'diana.prince@themyscira.gov', is_active: true, signup_date: '2023-07-04' },
			{ id: 5, email: 'evan.inactive@testing.io', is_active: false, signup_date: '2023-09-18' }
		]
	},
	invoices: {
		tableName: 'invoices',
		columns: ['id', 'invoice_number', 'subtotal'],
		totalRowCount: 3,
		rows: [
			{ id: 1, invoice_number: 'INV-2024-001', subtotal: 500.00 },
			{ id: 2, invoice_number: 'INV-2024-002', subtotal: 1250.00 },
			{ id: 3, invoice_number: 'INV-2024-003', subtotal: 80.00 }
		]
	},
	staff_members: {
		tableName: 'staff_members',
		columns: ['id', 'first_name', 'last_name', 'title'],
		totalRowCount: 3,
		rows: [
			{ id: 1, first_name: 'sarah', last_name: 'connor', title: 'Dr.' },
			{ id: 2, first_name: 'john', last_name: 'matrix', title: 'Col.' },
			{ id: 3, first_name: 'ellen', last_name: 'ripley', title: 'Lt.' }
		]
	},
	customer_orders: {
		tableName: 'customer_orders',
		columns: ['id', 'customer_id', 'total_amount', 'status'],
		totalRowCount: 5,
		rows: [
			{ id: 1, customer_id: 101, total_amount: 150.00, status: 'completed' },
			{ id: 2, customer_id: 102, total_amount: 300.00, status: 'pending' },
			{ id: 3, customer_id: 101, total_amount: 75.00, status: 'completed' },
			{ id: 4, customer_id: 103, total_amount: 420.00, status: 'processing' },
			{ id: 5, customer_id: 101, total_amount: 210.00, status: 'completed' }
		]
	},
	catalog_items: {
		tableName: 'catalog_items',
		columns: ['id', 'item_name', 'category', 'price'],
		totalRowCount: 5,
		rows: [
			{ id: 1, item_name: 'Gaming Laptop', category: 'Electronics', price: 1200.00 },
			{ id: 2, item_name: 'Wireless Mouse', category: 'Electronics', price: 35.00 },
			{ id: 3, item_name: '4K Monitor', category: 'Electronics', price: 350.00 },
			{ id: 4, item_name: 'Desk Lamp', category: 'Office', price: 45.00 },
			{ id: 5, item_name: 'Ergonomic Desk', category: 'Office', price: 450.00 }
		]
	},
	member_subscriptions: {
		tableName: 'member_subscriptions',
		columns: ['id', 'user_email', 'plan_tier', 'is_active'],
		totalRowCount: 5,
		rows: [
			{ id: 1, user_email: 'alice@example.com', plan_tier: 'Premium', is_active: true },
			{ id: 2, user_email: 'bob@example.com', plan_tier: 'Basic', is_active: true },
			{ id: 3, user_email: 'carol@example.com', plan_tier: 'Premium', is_active: false },
			{ id: 4, user_email: 'david@example.com', plan_tier: 'Premium', is_active: true },
			{ id: 5, user_email: 'eva@example.com', plan_tier: 'Basic', is_active: false }
		]
	},
	bank_accounts: {
		tableName: 'bank_accounts',
		columns: ['id', 'owner_name', 'balance'],
		totalRowCount: 3,
		rows: [
			{ id: 1, owner_name: 'Alice', balance: 500.00 },
			{ id: 2, owner_name: 'Bob', balance: 200.00 },
			{ id: 3, owner_name: 'Charlie', balance: 1000.00 }
		]
	},
	store_orders: {
		tableName: 'store_orders',
		columns: ['id', 'status'],
		totalRowCount: 2,
		rows: [
			{ id: 1, status: 'pending' },
			{ id: 2, status: 'pending' }
		]
	},
	inventory_stock: {
		tableName: 'inventory_stock',
		columns: ['id', 'stock_count'],
		totalRowCount: 2,
		rows: [
			{ id: 101, stock_count: 50 },
			{ id: 102, stock_count: 20 }
		]
	},
	coupons: {
		tableName: 'coupons',
		columns: ['id', 'code', 'expiration_date', 'is_active'],
		totalRowCount: 4,
		rows: [
			{ id: 1, code: 'SUMMER2024', expiration_date: '2024-05-15', is_active: true },
			{ id: 2, code: 'WELCOME10', expiration_date: '2024-07-01', is_active: true },
			{ id: 3, code: 'SPRINGPROMO', expiration_date: '2024-04-30', is_active: true },
			{ id: 4, code: 'FALLSALE', expiration_date: '2024-09-01', is_active: true }
		]
	},
	user_profiles: {
		tableName: 'user_profiles',
		columns: ['id', 'username', 'email', 'role'],
		totalRowCount: 0,
		rows: []
	},
	staff_contracts: {
		tableName: 'staff_contracts',
		columns: ['id', 'employee_name', 'salary'],
		totalRowCount: 0,
		rows: []
	},
	line_items: {
		tableName: 'line_items',
		columns: ['id', 'item_name', 'unit_price', 'quantity', 'line_total'],
		totalRowCount: 0,
		rows: []
	},
	order_audit_logs: {
		tableName: 'order_audit_logs',
		columns: ['id', 'order_id', 'old_status', 'new_status', 'action'],
		totalRowCount: 0,
		rows: []
	},
	product_catalog: {
		tableName: 'product_catalog',
		columns: ['id', 'product_name', 'price'],
		totalRowCount: 2,
		rows: [
			{ id: 1, product_name: 'Ergonomic Chair', price: 250.00 },
			{ id: 2, product_name: 'Standing Desk', price: 450.00 }
		]
	},
	product_price_logs: {
		tableName: 'product_price_logs',
		columns: ['id', 'product_id', 'old_price', 'new_price', 'action'],
		totalRowCount: 0,
		rows: []
	},
	club_members: {
		tableName: 'club_members',
		columns: ['id', 'member_name', 'membership_tier'],
		totalRowCount: 3,
		rows: [
			{ id: 101, member_name: 'Franklin', membership_tier: 'Gold' },
			{ id: 102, member_name: 'Grace', membership_tier: 'Silver' },
			{ id: 103, member_name: 'Hector', membership_tier: 'Platinum' }
		]
	},
	member_deletions_archive: {
		tableName: 'member_deletions_archive',
		columns: ['id', 'deleted_member_id', 'member_name', 'membership_tier', 'action'],
		totalRowCount: 0,
		rows: []
	},
	order_items_denorm: {
		tableName: 'order_items_denorm',
		columns: ['order_id', 'item_id', 'item_name', 'item_category', 'unit_price', 'quantity'],
		totalRowCount: 4,
		rows: [
			{ order_id: 1, item_id: 101, item_name: 'Laptop', item_category: 'Electronics', unit_price: 1200.00, quantity: 1 },
			{ order_id: 1, item_id: 102, item_name: 'Mouse', item_category: 'Electronics', unit_price: 25.00, quantity: 2 },
			{ order_id: 2, item_id: 101, item_name: 'Laptop', item_category: 'Electronics', unit_price: 1200.00, quantity: 1 },
			{ order_id: 2, item_id: 103, item_name: 'Desk Pad', item_category: 'Stationery', unit_price: 15.00, quantity: 3 }
		]
	},
	student_course_enrollments: {
		tableName: 'student_course_enrollments',
		columns: ['student_id', 'course_code', 'course_title', 'instructor_name', 'semester', 'final_grade'],
		totalRowCount: 4,
		rows: [
			{ student_id: 201, course_code: 'CS101', course_title: 'Intro to Computer Science', instructor_name: 'Prof. Turing', semester: 'Fall 2024', final_grade: 'A' },
			{ student_id: 201, course_code: 'MATH201', course_title: 'Linear Algebra', instructor_name: 'Prof. Euler', semester: 'Fall 2024', final_grade: 'B+' },
			{ student_id: 202, course_code: 'CS101', course_title: 'Intro to Computer Science', instructor_name: 'Prof. Turing', semester: 'Fall 2024', final_grade: 'A-' },
			{ student_id: 203, course_code: 'MATH201', course_title: 'Linear Algebra', instructor_name: 'Prof. Euler', semester: 'Fall 2024', final_grade: 'A' }
		]
	},
	warehouse_inventory_flat: {
		tableName: 'warehouse_inventory_flat',
		columns: ['warehouse_id', 'sku_code', 'warehouse_city', 'warehouse_capacity', 'quantity_on_hand'],
		totalRowCount: 4,
		rows: [
			{ warehouse_id: 1, sku_code: 'SKU-A1', warehouse_city: 'Chicago', warehouse_capacity: 50000, quantity_on_hand: 120 },
			{ warehouse_id: 1, sku_code: 'SKU-B2', warehouse_city: 'Chicago', warehouse_capacity: 50000, quantity_on_hand: 450 },
			{ warehouse_id: 2, sku_code: 'SKU-A1', warehouse_city: 'Dallas', warehouse_capacity: 35000, quantity_on_hand: 80 },
			{ warehouse_id: 3, sku_code: 'SKU-C3', warehouse_city: 'Seattle', warehouse_capacity: 42000, quantity_on_hand: 310 }
		]
	},
	employee_records: {
		tableName: 'employee_records',
		columns: ['emp_id', 'emp_name', 'dept_code', 'dept_name', 'dept_budget'],
		totalRowCount: 4,
		rows: [
			{ emp_id: 1, emp_name: 'Alice Smith', dept_code: 'ENG', dept_name: 'Engineering', dept_budget: 500000.00 },
			{ emp_id: 2, emp_name: 'Bob Jones', dept_code: 'ENG', dept_name: 'Engineering', dept_budget: 500000.00 },
			{ emp_id: 3, emp_name: 'Charlie Brown', dept_code: 'MKT', dept_name: 'Marketing', dept_budget: 250000.00 },
			{ emp_id: 4, emp_name: 'Diana Prince', dept_code: 'FIN', dept_name: 'Finance', dept_budget: 300000.00 }
		]
	},
	store_locations: {
		tableName: 'store_locations',
		columns: ['store_id', 'store_name', 'postal_code', 'city_name', 'state_code', 'tax_rate'],
		totalRowCount: 4,
		rows: [
			{ store_id: 1, store_name: 'Downtown Outlet', postal_code: '94101', city_name: 'San Francisco', state_code: 'CA', tax_rate: 8.50 },
			{ store_id: 2, store_name: 'Bayview Branch', postal_code: '94101', city_name: 'San Francisco', state_code: 'CA', tax_rate: 8.50 },
			{ store_id: 3, store_name: 'Sunset Store', postal_code: '94122', city_name: 'San Francisco', state_code: 'CA', tax_rate: 8.50 },
			{ store_id: 4, store_name: 'Austin Hub', postal_code: '73301', city_name: 'Austin', state_code: 'TX', tax_rate: 6.25 }
		]
	},
	account_subscriptions: {
		tableName: 'account_subscriptions',
		columns: ['account_id', 'subscriber_name', 'plan_code', 'plan_name', 'monthly_fee', 'storage_limit_gb'],
		totalRowCount: 4,
		rows: [
			{ account_id: 101, subscriber_name: 'Acme Corp', plan_code: 'BIZ', plan_name: 'Business Tier', monthly_fee: 79.99, storage_limit_gb: 1000 },
			{ account_id: 102, subscriber_name: 'Beta LLC', plan_code: 'BIZ', plan_name: 'Business Tier', monthly_fee: 79.99, storage_limit_gb: 1000 },
			{ account_id: 103, subscriber_name: 'Charlie Co', plan_code: 'PRO', plan_name: 'Professional Tier', monthly_fee: 29.99, storage_limit_gb: 250 },
			{ account_id: 104, subscriber_name: 'Delta Inc', plan_code: 'ENT', plan_name: 'Enterprise Tier', monthly_fee: 199.99, storage_limit_gb: 5000 }
		]
	},
	raw_patient_consultations: {
		tableName: 'raw_patient_consultations',
		columns: ['consultation_id', 'patient_id', 'patient_name', 'patient_gender', 'clinic_id', 'clinic_name', 'clinic_city', 'fee'],
		totalRowCount: 4,
		rows: [
			{ consultation_id: 1, patient_id: 501, patient_name: 'Arthur Dent', patient_gender: 'M', clinic_id: 10, clinic_name: 'Central Health', clinic_city: 'London', fee: 150.00 },
			{ consultation_id: 2, patient_id: 502, patient_name: 'Tricia McMillan', patient_gender: 'F', clinic_id: 10, clinic_name: 'Central Health', clinic_city: 'London', fee: 200.00 },
			{ consultation_id: 3, patient_id: 501, patient_name: 'Arthur Dent', patient_gender: 'M', clinic_id: 20, clinic_name: 'Metro Clinic', clinic_city: 'Bristol', fee: 120.00 },
			{ consultation_id: 4, patient_id: 503, patient_name: 'Ford Prefect', patient_gender: 'M', clinic_id: 20, clinic_name: 'Metro Clinic', clinic_city: 'Bristol', fee: 180.00 }
		]
	},
	raw_hotel_reservations: {
		tableName: 'raw_hotel_reservations',
		columns: ['reservation_id', 'guest_id', 'guest_name', 'guest_email', 'room_id', 'room_type', 'nightly_rate', 'total_nights'],
		totalRowCount: 4,
		rows: [
			{ reservation_id: 101, guest_id: 701, guest_name: 'Eleanor Vance', guest_email: 'eleanor@hill.org', room_id: 301, room_type: 'Deluxe Suite', nightly_rate: 220.00, total_nights: 3 },
			{ reservation_id: 102, guest_id: 702, guest_name: 'Luke Sanderson', guest_email: 'luke@hill.org', room_id: 302, room_type: 'Standard King', nightly_rate: 140.00, total_nights: 2 },
			{ reservation_id: 103, guest_id: 701, guest_name: 'Eleanor Vance', guest_email: 'eleanor@hill.org', room_id: 302, room_type: 'Standard King', nightly_rate: 140.00, total_nights: 4 },
			{ reservation_id: 104, guest_id: 703, guest_name: 'Theodora', guest_email: 'theo@hill.org', room_id: 301, room_type: 'Deluxe Suite', nightly_rate: 220.00, total_nights: 1 }
		]
	},
	raw_vendor_invoices: {
		tableName: 'raw_vendor_invoices',
		columns: ['invoice_id', 'vendor_id', 'vendor_name', 'vendor_city', 'item_id', 'item_description', 'item_unit_cost', 'units_billed'],
		totalRowCount: 4,
		rows: [
			{ invoice_id: 1001, vendor_id: 801, vendor_name: 'Apex Industrial', vendor_city: 'Detroit', item_id: 901, item_description: 'Steel Bolts M8', item_unit_cost: 1.25, units_billed: 500 },
			{ invoice_id: 1002, vendor_id: 802, vendor_name: 'Belmont Precision', vendor_city: 'Cleveland', item_id: 902, item_description: 'Copper Washers 10mm', item_unit_cost: 0.85, units_billed: 1200 },
			{ invoice_id: 1003, vendor_id: 801, vendor_name: 'Apex Industrial', vendor_city: 'Detroit', item_id: 903, item_description: 'Titanium Rod 1m', item_unit_cost: 45.00, units_billed: 20 },
			{ invoice_id: 1004, vendor_id: 802, vendor_name: 'Belmont Precision', vendor_city: 'Cleveland', item_id: 901, item_description: 'Steel Bolts M8', item_unit_cost: 1.25, units_billed: 300 }
		]
	}
};

export function getQuestionPreviewData(q: Question | null | undefined, tableName?: string): MockPreviewData | null {
	if (!q) return null;
	if (q.previewData) return q.previewData;
	if (q.mockPreviewData) return q.mockPreviewData;
	const targetTable = tableName || (q.table_names && q.table_names.length > 0 ? q.table_names[0] : null);
	if (targetTable && STATIC_TABLE_PREVIEWS[targetTable]) {
		return STATIC_TABLE_PREVIEWS[targetTable];
	}
	return null;
}

export async function fetchDynamicPreview(
	engine: IDbEngine | null,
	tableName: string,
	currentQuestion?: Question | null,
	limit: number = 10
): Promise<MockPreviewData | null> {
	if (!engine || !tableName || currentQuestion?.isDdlCreate) {
		return currentQuestion ? getQuestionPreviewData(currentQuestion, tableName) : null;
	}

	try {
		const querySql = limit > 0 ? `SELECT * FROM ${tableName} LIMIT ${limit};` : `SELECT * FROM ${tableName};`;
		const result = await engine.query(querySql);
		const columns =
			result.columns && result.columns.length > 0
				? result.columns
				: (result as any).fields?.map((f: any) => f.name) ||
				  (result.rows.length > 0 ? Object.keys(result.rows[0]) : []);

		let totalRowCount = result.rows.length;
		try {
			const countRes = await engine.query(`SELECT COUNT(*) as count FROM ${tableName};`);
			if (countRes.rows && countRes.rows.length > 0) {
				const row = countRes.rows[0];
				const countVal = row.count ?? row.COUNT ?? Object.values(row)[0];
				if (countVal !== undefined && countVal !== null) {
					totalRowCount = Number(countVal);
				}
			}
		} catch {
			// If COUNT query fails, keep fetched row count as totalRowCount
		}

		return {
			tableName,
			columns,
			rows: result.rows,
			totalRowCount,
			isDynamic: true
		};
	} catch (err) {
		// Fallback to static preview if the table hasn't been created yet (e.g., CREATE TABLE tasks)
		return currentQuestion ? getQuestionPreviewData(currentQuestion, tableName) : null;
	}
}

export async function fetchAllDynamicPreviews(
	engine: IDbEngine | null,
	currentQuestion: Question | null,
	limit: number = 10
): Promise<Record<string, MockPreviewData>> {
	if (!currentQuestion) return {};
	if (currentQuestion.isDdlCreate) {
		const staticPreview = getQuestionPreviewData(currentQuestion);
		const primaryTable = currentQuestion.table_names?.[0] || 'Schema';
		return staticPreview ? { [primaryTable]: staticPreview } : {};
	}

	const tables = currentQuestion.table_names || [];
	if (tables.length === 0) {
		const staticPreview = getQuestionPreviewData(currentQuestion);
		return staticPreview ? { Schema: staticPreview } : {};
	}

	const previews: Record<string, MockPreviewData> = {};
	for (const tableName of tables) {
		const preview = await fetchDynamicPreview(engine, tableName, currentQuestion, limit);
		if (preview) {
			previews[tableName] = preview;
		}
	}
	return previews;
}
