import { describe, it, expect } from 'vitest';
import { MODULES } from '$lib/data/questions';

describe('Task Goals Audit - Zero SQL Solution Leaks', () => {
    // Prohibited SQL statement and clause fragments that must not appear in instructions
    const leakedPatterns = [
        /using\s+[`'"]?[A-Z_\s();*]+[`'"]?/i,
        /menggunakan\s+(?:perintah\s+|klausa\s+|operator\s+|sintaks\s+)?[`'"]?[A-Z_\s();*]+[`'"]?/i,
        /`\s*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|LOCK|UNLOCK)\b[^`]*`/i,
        /`\s*(?:WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|UNION|INTERSECT|EXCEPT|ON CONFLICT|ON DUPLICATE KEY)\b[^`]*`/i,
        /`\s*[a-zA-Z0-9_]+\s*(?:=|<|>|<=|>=|!=|<>|\+|-|\*|\/)\s*[^`]+`/i, // e.g. `price > 100`, `rating = rating + 0.5`
        /->>|@>|JSON_CONTAINS|JSON_EXTRACT|JSON_CONTAINS_PATH/i
    ];

    const questions: Array<{ id: number; module: number; slot: number; text: string; lang: string; source: string }> = [];

    for (const mod of MODULES) {
        for (const q of mod.questions) {
            if (q.instructions?.en) {
                questions.push({ id: q.id, module: q.moduleId, slot: q.categorySlot, text: q.instructions.en, lang: 'en', source: 'base' });
            }
            if (q.instructions?.id) {
                questions.push({ id: q.id, module: q.moduleId, slot: q.categorySlot, text: q.instructions.id, lang: 'id', source: 'base' });
            }
            if (q.engineOverrides) {
                for (const [engine, override] of Object.entries(q.engineOverrides)) {
                    if (override.instructions?.en) {
                        questions.push({ id: q.id, module: q.moduleId, slot: q.categorySlot, text: override.instructions.en, lang: 'en', source: `${engine}-override` });
                    }
                    if (override.instructions?.id) {
                        questions.push({ id: q.id, module: q.moduleId, slot: q.categorySlot, text: override.instructions.id, lang: 'id', source: `${engine}-override` });
                    }
                }
            }
        }
    }

    it('collects all question instructions across all 9 modules', () => {
        console.log('Total collected instructions (EN, ID, Base, Overrides):', questions.length);
        expect(questions.length).toBeGreaterThan(300);
    });

    it('ensures no task goal instruction leaks SQL statements, clauses, or expressions', () => {
        const violations: Array<{ id: number; module: number; slot: number; source: string; lang: string; text: string; pattern: string }> = [];

        for (const item of questions) {
            for (const pattern of leakedPatterns) {
                if (pattern.test(item.text)) {
                    // Check if it's a false positive or genuine leak
                    violations.push({
                        id: item.id,
                        module: item.module,
                        slot: item.slot,
                        source: item.source,
                        lang: item.lang,
                        text: item.text,
                        pattern: pattern.source
                    });
                    break;
                }
            }
        }

        if (violations.length > 0) {
            for (const v of violations) {
                console.log(`VIOLATION: [Q${v.id} M${v.module} S${v.slot} ${v.lang} ${v.source}] (${v.pattern}) -> ${v.text}`);
            }
        }

        expect(violations).toEqual([]);
    });

    it('ensures no instruction contains SQL semicolons or statement terminators', () => {
        const violations = questions.filter(q => q.text.includes(';'));
        if (violations.length > 0) {
            for (const v of violations) {
                console.log(`SEMICOLON: [Q${v.id} M${v.module} S${v.slot} ${v.lang} ${v.source}] -> ${v.text}`);
            }
        }
        expect(violations).toEqual([]);
    });

    it('ensures no instruction contains copy-pasteable SQL statement starters', () => {
        const statementStarters = [
            /\bSELECT\s+[a-zA-Z0-9_*`]/,
            /\bINSERT\s+INTO\b/i,
            /\bDELETE\s+FROM\b/i,
            /\bUPDATE\s+[a-zA-Z0-9_`]+\s+SET\b/i,
            /\bCREATE\s+(?:TABLE|DATABASE|SCHEMA|ROLE|USER|VIEW|INDEX)\b/i,
            /\bDROP\s+(?:TABLE|DATABASE|SCHEMA|ROLE|USER|VIEW|INDEX)\b/i,
            /\bALTER\s+(?:TABLE|ROLE|USER)\b/i,
            /\bTRUNCATE\s+(?:TABLE\b)?/i,
            /\bGRANT\s+(?:SELECT|INSERT|UPDATE|DELETE|ALL)\b/i,
            /\bREVOKE\s+(?:SELECT|INSERT|UPDATE|DELETE|ALL)\b/i
        ];

        const violations: Array<{ id: number; module: number; slot: number; source: string; lang: string; text: string; pattern: string }> = [];

        for (const item of questions) {
            for (const p of statementStarters) {
                if (p.test(item.text)) {
                    violations.push({
                        id: item.id,
                        module: item.module,
                        slot: item.slot,
                        source: item.source,
                        lang: item.lang,
                        text: item.text,
                        pattern: p.source
                    });
                    break;
                }
            }
        }

        if (violations.length > 0) {
            for (const v of violations) {
                console.log(`STATEMENT STARTER: [Q${v.id} M${v.module} S${v.slot} ${v.lang} ${v.source}] (${v.pattern}) -> ${v.text}`);
            }
        }

        expect(violations).toEqual([]);
    });
});
