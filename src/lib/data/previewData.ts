import type { MockPreviewData, Question } from './types';

export const STATIC_TABLE_PREVIEWS: Record<string, MockPreviewData> = {
	movies: {
		columns: ['id', 'title', 'director', 'year', 'rating'],
		rows: [
			{ id: 1, title: 'Toy Story', director: 'John Lasseter', year: 1995, rating: 8.3 },
			{ id: 2, title: "A Bug's Life", director: 'John Lasseter', year: 1998, rating: 7.2 },
			{ id: 3, title: 'Toy Story 2', director: 'John Lasseter', year: 1999, rating: 7.9 },
			{ id: 4, title: 'Monsters, Inc.', director: 'Pete Docter', year: 2001, rating: 8.1 },
			{ id: 5, title: 'Finding Nemo', director: 'Andrew Stanton', year: 2003, rating: 8.2 }
		]
	},
	books: {
		columns: ['id', 'title', 'price'],
		rows: [
			{ id: 1, title: 'The Pragmatic Programmer', price: 45 },
			{ id: 2, title: 'Clean Architecture', price: 38 },
			{ id: 3, title: 'Designing Data-Intensive Applications', price: 52 },
			{ id: 4, title: 'Refactoring', price: 42 },
			{ id: 5, title: 'Database Internals', price: 48 }
		]
	},
	items: {
		columns: ['id', 'name', 'category', 'price', 'stock', 'status'],
		rows: [
			{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1200, stock: 15, status: 'Available' },
			{ id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 30, stock: 100, status: 'Available' },
			{ id: 3, name: 'Desk Chair', category: 'Furniture', price: 250, stock: 0, status: 'OutOfStock' },
			{ id: 4, name: 'Standing Desk', category: 'Furniture', price: 550, stock: 5, status: 'Available' },
			{ id: 5, name: 'Coffee Mug', category: 'Kitchen', price: 15, stock: 200, status: 'Available' }
		]
	},
	sales: {
		columns: ['id', 'region', 'seller', 'category', 'amount'],
		rows: [
			{ id: 1, region: 'North', seller: 'Alice', category: 'Tech', amount: 1200 },
			{ id: 2, region: 'South', seller: 'Bob', category: 'Tech', amount: 850 },
			{ id: 3, region: 'North', seller: 'Alice', category: 'Furniture', amount: 450 },
			{ id: 4, region: 'West', seller: 'Charlie', category: 'Tech', amount: 1500 },
			{ id: 5, region: 'East', seller: 'Diana', category: 'Furniture', amount: 600 }
		]
	},
	customers: {
		columns: ['id', 'first_name', 'last_name', 'score', 'join_date', 'discount_code'],
		rows: [
			{ id: 1, first_name: 'john', last_name: 'doe', score: 85, join_date: '2022-01-15', discount_code: 'SAVE10' },
			{ id: 2, first_name: 'jane', last_name: 'smith', score: 92, join_date: '2021-06-20', discount_code: null },
			{ id: 3, first_name: 'alex', last_name: 'jones', score: 45, join_date: '2023-03-10', discount_code: 'WELCOME' },
			{ id: 4, first_name: 'sarah', last_name: 'connor', score: 78, join_date: '2020-11-05', discount_code: null },
			{ id: 5, first_name: 'michael', last_name: 'brown', score: 60, join_date: '2022-08-30', discount_code: 'SAVE20' }
		]
	},
	departments: {
		columns: ['id', 'dept_name'],
		rows: [
			{ id: 1, dept_name: 'Engineering' },
			{ id: 2, dept_name: 'Sales' },
			{ id: 3, dept_name: 'Marketing' },
			{ id: 4, dept_name: 'HR' }
		]
	},
	employees: {
		columns: ['id', 'name', 'department_id', 'manager_id', 'salary'],
		rows: [
			{ id: 1, name: 'Alice', department_id: 1, manager_id: null, salary: 90000 },
			{ id: 2, name: 'Bob', department_id: 1, manager_id: 1, salary: 75000 },
			{ id: 3, name: 'Charlie', department_id: 2, manager_id: null, salary: 85000 },
			{ id: 4, name: 'Diana', department_id: 2, manager_id: 3, salary: 60000 },
			{ id: 5, name: 'Evan', department_id: 3, manager_id: null, salary: 70000 }
		]
	},
	project_a: {
		columns: ['id', 'member_name', 'role', 'score'],
		rows: [
			{ id: 1, member_name: 'Alice', role: 'Lead', score: 90 },
			{ id: 2, member_name: 'Bob', role: 'Dev', score: 80 },
			{ id: 3, member_name: 'Charlie', role: 'Tester', score: 70 },
			{ id: 4, member_name: 'Diana', role: 'Dev', score: 85 }
		]
	},
	project_b: {
		columns: ['id', 'member_name', 'role', 'score'],
		rows: [
			{ id: 3, member_name: 'Charlie', role: 'Tester', score: 75 },
			{ id: 4, member_name: 'Diana', role: 'Dev', score: 85 },
			{ id: 5, member_name: 'Evan', role: 'Design', score: 95 },
			{ id: 6, member_name: 'Fiona', role: 'Lead', score: 88 }
		]
	},
	accounts: {
		columns: ['id', 'owner', 'balance', 'category'],
		rows: [
			{ id: 1, owner: 'User A', balance: 1500, category: 'Checking' },
			{ id: 2, owner: 'User B', balance: 3200, category: 'Savings' },
			{ id: 3, owner: 'User C', balance: 800, category: 'Checking' },
			{ id: 4, owner: 'User D', balance: 4500, category: 'Savings' },
			{ id: 5, owner: 'User E', balance: 2100, category: 'Checking' }
		]
	},
	cart: {
		columns: ['user_id', 'product_id', 'quantity'],
		rows: [
			{ user_id: 1, product_id: 101, quantity: 2 },
			{ user_id: 1, product_id: 102, quantity: 1 },
			{ user_id: 2, product_id: 101, quantity: 5 }
		]
	},
	orders: {
		columns: ['id', 'customer_id', 'order_date', 'amount'],
		rows: [
			{ id: 1, customer_id: 10, order_date: '2023-01-01', amount: 100 },
			{ id: 2, customer_id: 10, order_date: '2023-03-01', amount: 250 },
			{ id: 3, customer_id: 10, order_date: '2023-02-01', amount: 150 },
			{ id: 4, customer_id: 20, order_date: '2023-01-15', amount: 300 },
			{ id: 5, customer_id: 20, order_date: '2023-04-10', amount: 450 }
		]
	},
	products: {
		columns: ['id', 'name', 'category', 'price', 'description', 'metadata'],
		rows: [
			{ id: 1, name: 'Mechanical Keyboard', category: 'Electronics', price: 150, description: 'Ergonomic wireless mechanical keyboard with rgb backlight', metadata: '{"brand": "Logitech", "color": "black", "in_stock": true}' },
			{ id: 2, name: 'Ergonomic Mouse', category: 'Electronics', price: 80, description: 'Vertical wireless ergonomic optical mouse with bluetooth', metadata: '{"brand": "Logitech", "color": "white", "in_stock": false}' },
			{ id: 3, name: 'Standing Desk', category: 'Furniture', price: 600, description: 'Dual motor adjustable height standing desk with bamboo top', metadata: '{"brand": "IKEA", "material": "bamboo", "in_stock": true}' },
			{ id: 4, name: 'Office Chair', category: 'Furniture', price: 350, description: 'Mesh ergonomic chair with lumbar support and armrests', metadata: '{"brand": "Herman Miller", "color": "black", "in_stock": true}' },
			{ id: 5, name: 'Noise-Cancelling Headphones', category: 'Electronics', price: 250, description: 'Wireless over-ear noise cancelling headphones with mic', metadata: '{"brand": "Sony", "color": "silver", "in_stock": true}' }
		]
	}
};

export function getQuestionPreviewData(q: Question | null | undefined): MockPreviewData | null {
	if (!q) return null;
	if (q.previewData) return q.previewData;
	if (q.mockPreviewData) return q.mockPreviewData;
	if (q.table_names && q.table_names.length > 0) {
		const tableName = q.table_names[0];
		if (STATIC_TABLE_PREVIEWS[tableName]) {
			return STATIC_TABLE_PREVIEWS[tableName];
		}
	}
	return null;
}
