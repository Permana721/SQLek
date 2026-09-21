export interface LocalizedString {
    en: string;
    id: string;
}

export interface SyntaxPatternItem {
    label: LocalizedString;
    code: string;
}

export interface SchemaBlueprintColumn {
    name: string;
    type: string;
    constraint?: string;
}

export interface MockPreviewData {
    columns: string[];
    rows: Record<string, any>[];
    totalRowCount?: number;
    tableName?: string;
    isDynamic?: boolean;
}

export interface QuestionEngineOverride {
    title?: LocalizedString;
    conceptExplanation?: LocalizedString;
    syntaxPatterns?: SyntaxPatternItem[];
    instructions?: LocalizedString;
    seed_sql?: string;
    expected_query?: string;
    starterQuery?: string;
    table_names?: string[];
    targetSchemaBlueprint?: SchemaBlueprintColumn[];
    mockPreviewData?: MockPreviewData;
    previewData?: MockPreviewData;
    verification_query?: string;
}

export interface Question {
    id: number;
    moduleId: number;
    categorySlot: number;
    title: LocalizedString;
    conceptExplanation: LocalizedString;
    syntaxPatterns: SyntaxPatternItem[];
    instructions: LocalizedString;
    seed_sql: string;
    expected_query: string;
    starterQuery: string;
    table_names: string[];
    isDdlCreate?: boolean;
    targetSchemaBlueprint?: SchemaBlueprintColumn[];
    mockPreviewData?: MockPreviewData;
    previewData?: MockPreviewData;
    verification_query?: string;
    engineOverrides?: {
        postgres?: QuestionEngineOverride;
        mysql?: QuestionEngineOverride;
    };
}

export interface Module {
    id: number;
    title: LocalizedString;
    description: LocalizedString;
    questions: Question[];
}
