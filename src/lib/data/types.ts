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
    /**
     * Dual-purpose field:
     * - Curriculum questions: Technical SQL lesson (conceptual analogy, engine behavior, best practices).
     * - Exam questions (bank: 'exam'): Business scenario narrative / context brief (must not contain SQL keywords).
     */
    conceptExplanation: LocalizedString;
    syntaxPatterns?: SyntaxPatternItem[];
    instructions: LocalizedString;
    seed_sql: string;
    expected_query: string;
    starterQuery: string;
    table_names: string[];
    isDdlCreate?: boolean;
    /**
     * When true, this question is always included in every session regardless of
     * the random sampling logic. Mandatory questions are pinned in slot order
     * after the randomly-sampled diverse set.
     */
    isMandatory?: boolean;
    targetSchemaBlueprint?: SchemaBlueprintColumn[];
    mockPreviewData?: MockPreviewData;
    previewData?: MockPreviewData;
    verification_query?: string;
    bank?: 'curriculum' | 'exam';
    referenceQuery?: string;
    topics?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    scoring?: ExamScoringConfig;
    engineOverrides?: {
        postgres?: QuestionEngineOverride;
        mysql?: QuestionEngineOverride;
    };
}

export interface StructuralCheck {
    sql: string;
    weight: number;
    description?: LocalizedString;
}

export type ExamScoringConfig =
    | { mode: 'plan' }
    | { mode: 'structural'; checks: StructuralCheck[] };

export interface ExamQuestion extends Question {
    bank: 'exam';
    topics: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    referenceQuery: string;
    scoring: ExamScoringConfig;
}

export interface Module {
    id: number;
    title: LocalizedString;
    description: LocalizedString;
    questions: Question[];
}

