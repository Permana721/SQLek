export interface ColumnMetadata {
	name: string;
	type: string;
	isPk: boolean;
	isFk: boolean;
	isUnique: boolean;
	isNullable: boolean;
	defaultValue?: string | null;
}

export interface ForeignKeyRelationship {
	constraintName?: string;
	sourceTable: string;
	sourceColumn: string;
	targetTable: string;
	targetColumn: string;
	onDelete?: string;
	onUpdate?: string;
}

export interface TableEntity {
	name: string;
	columns: ColumnMetadata[];
	primaryKeys: string[];
}

export interface DatabaseSchema {
	tables: TableEntity[];
	relationships: ForeignKeyRelationship[];
}
