export interface QueryResultRow {
	[key: string]: any;
}

export interface DbResult {
	columns: string[];
	rows: QueryResultRow[];
	rawRows?: any[][];
}

export interface IDbEngine {
	init(seedSql: string): Promise<void>;
	query(sql: string): Promise<DbResult>;
	destroy(): Promise<void>;
	dumpDataDir?(compression?: 'none' | 'gzip'): Promise<Blob | File>;
	loadDataDir?(file: Blob | File): Promise<void>;
	getInternalDb?(): any;
}
