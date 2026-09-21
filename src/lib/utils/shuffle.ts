import { MODULES, resolveQuestionForEngine, type Question } from '$lib/data/questions';

export function sample<T>(array: T[], count: number = 5): T[] {
    const copy = [...array];
    let m = copy.length;
    let t: T;
    let i: number;

    while (m) {
        i = Math.floor(Math.random() * m--);
        t = copy[m];
        copy[m] = copy[i];
        copy[i] = t;
    }

    return copy.slice(0, count);
}

export function sampleDiverseQuestions(questions: Question[]): Question[] {
    const uniqueSlots = Array.from(new Set(questions.map((q) => q.categorySlot))).sort((a, b) => a - b);
    const picked: Question[] = [];

    for (const slot of uniqueSlots) {
        const candidates = questions.filter((q) => q.categorySlot === slot);
        if (candidates.length > 0) {
            const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
            picked.push(randomPick);
        }
    }

    if (picked.length === 0) {
        return sample(questions, 5);
    }

    return picked;
}

export function getRandomizedExamPool(engine: string, questionCount = 30): Question[] {
    const allQuestions = MODULES.flatMap((m) => m.questions).map((q) =>
        resolveQuestionForEngine(q, engine)
    );

    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, questionCount);
}