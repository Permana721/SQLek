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
