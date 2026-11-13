import { MODULES, EXAM_QUESTIONS, resolveQuestionForEngine, type Question, type ExamQuestion } from '$lib/data/questions';

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
    // Separate mandatory (always-included) questions from the random pool
    const mandatoryQuestions = questions
        .filter((q) => q.isMandatory === true)
        .sort((a, b) => a.categorySlot - b.categorySlot);
    const mandatoryIds = new Set(mandatoryQuestions.map((q) => q.id));
    const mandatorySlots = new Set(mandatoryQuestions.map((q) => q.categorySlot));

    // Build the diverse random sample from non-mandatory questions only (excluding slots filled by mandatory tasks)
    const nonMandatoryPool = questions.filter((q) => !mandatoryIds.has(q.id) && !mandatorySlots.has(q.categorySlot));
    const uniqueSlots = Array.from(new Set(nonMandatoryPool.map((q) => q.categorySlot))).sort((a, b) => a - b);
    const picked: Question[] = [];

    for (const slot of uniqueSlots) {
        const candidates = nonMandatoryPool.filter((q) => q.categorySlot === slot);
        if (candidates.length > 0) {
            const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
            picked.push(randomPick);
        }
    }

    if (picked.length === 0 && mandatoryQuestions.length === 0) {
        return sample(questions, 5);
    }

    // Append mandatory questions at the end, in categorySlot order
    return [...picked, ...mandatoryQuestions];
}

export function getRandomizedExamPool(engine: string = 'postgres', questionCount = 30): ExamQuestion[] {
    if (engine === 'mysql') {
        return [];
    }

    if (!EXAM_QUESTIONS || EXAM_QUESTIONS.length === 0) {
        return [];
    }

    const pool = [...EXAM_QUESTIONS];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const topicCounts: Record<string, number> = {};
    const picked: ExamQuestion[] = [];
    const remaining: ExamQuestion[] = [];

    const targetHard = Math.floor(questionCount / 2);
    let hardCount = 0;

    // Pass 1: select questions with max 2 per primary topic and balanced difficulty
    for (const q of pool) {
        const primaryTopic = q.topics?.[0] || 'general';
        const currentCount = topicCounts[primaryTopic] || 0;

        if (currentCount >= 2) {
            remaining.push(q);
            continue;
        }

        if (q.difficulty === 'hard' && hardCount >= targetHard && picked.length < questionCount - 5) {
            remaining.push(q);
            continue;
        }

        picked.push(q);
        topicCounts[primaryTopic] = currentCount + 1;
        if (q.difficulty === 'hard') hardCount++;

        if (picked.length === questionCount) break;
    }

    // Pass 2: fill up from remaining respecting max 2 per topic
    if (picked.length < questionCount) {
        for (const q of remaining) {
            const primaryTopic = q.topics?.[0] || 'general';
            const currentCount = topicCounts[primaryTopic] || 0;
            if (currentCount < 2) {
                picked.push(q);
                topicCounts[primaryTopic] = currentCount + 1;
                if (picked.length === questionCount) break;
            }
        }
    }

    // Fallback: fill to questionCount if needed with any remaining unique questions
    if (picked.length < questionCount) {
        const pickedIds = new Set(picked.map((q) => q.id));
        for (const q of pool) {
            if (!pickedIds.has(q.id)) {
                picked.push(q);
                pickedIds.add(q.id);
                if (picked.length === questionCount) break;
            }
        }
    }

    return picked.slice(0, questionCount);
}