import seedrandom from 'seedrandom';
import type { ClientQuestion, Answer } from '@/types/quiz';

/**
 * Choice mapping for a single question
 */
export interface ChoiceMapping {
  questionId: string;
  originalToShuffled: Record<number, number>;
  shuffledToOriginal: Record<number, number>;
}

/**
 * Complete shuffle mapping for all questions
 */
export interface ShuffleMapping {
  seed: string;
  questionOrder: string[];
  choiceMappings: ChoiceMapping[];
}

/**
 * Generates a random seed for shuffling
 * Uses crypto.randomUUID() for uniqueness
 */
export function generateSeed(): string {
  return crypto.randomUUID();
}

/**
 * Shuffles an array deterministically using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @param seed - Seed for reproducibility
 * @returns Shuffled array (new instance)
 */
export function shuffleArray<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed);
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Shuffles questions and their choices (for radio/checkbox types)
 * @param questions - Original questions from API
 * @param seed - Seed for reproducibility
 * @returns Shuffled questions and index mappings
 */
export function shuffleQuestions(
  questions: ClientQuestion[],
  seed: string
): { shuffled: ClientQuestion[]; mapping: ShuffleMapping } {
  // 1. Shuffle question order
  const shuffledQuestions = shuffleArray(questions, seed);
  const questionOrder = shuffledQuestions.map((q) => q.id);

  const choiceMappings: ChoiceMapping[] = [];

  // 2. For each radio/checkbox question, shuffle choices
  const withShuffledChoices = shuffledQuestions.map((question) => {
    if (question.type === 'text') {
      return question;
    }

    const originalChoices = question.choices!;
    const shuffledChoices = shuffleArray(originalChoices, `${seed}-${question.id}`);

    // 3. Build index mappings
    const originalToShuffled: Record<number, number> = {};
    const shuffledToOriginal: Record<number, number> = {};

    originalChoices.forEach((originalChoice, originalIndex) => {
      const shuffledIndex = shuffledChoices.indexOf(originalChoice);
      originalToShuffled[originalIndex] = shuffledIndex;
      shuffledToOriginal[shuffledIndex] = originalIndex;
    });

    choiceMappings.push({
      questionId: question.id,
      originalToShuffled,
      shuffledToOriginal,
    });

    return {
      ...question,
      choices: shuffledChoices,
    };
  });

  return {
    shuffled: withShuffledChoices,
    mapping: {
      seed,
      questionOrder,
      choiceMappings,
    },
  };
}

/**
 * Converts user's answer (based on shuffled indices) back to original indices
 * @param answer - User's answer with shuffled indices
 * @param mapping - Shuffle mapping from store
 * @returns Answer with original indices for backend validation
 */
export function mapAnswerToOriginal(answer: Answer, mapping: ShuffleMapping): Answer {
  const choiceMapping = mapping.choiceMappings.find((m) => m.questionId === answer.id);

  if (!choiceMapping) {
    // Text question or no mapping found, return as-is
    return answer;
  }

  // Map shuffled index(es) back to original
  if (typeof answer.value === 'number') {
    // Radio question
    return {
      ...answer,
      value: choiceMapping.shuffledToOriginal[answer.value],
    };
  } else if (Array.isArray(answer.value)) {
    // Checkbox question
    return {
      ...answer,
      value: answer.value.map((idx) => choiceMapping.shuffledToOriginal[idx]),
    };
  }

  // Text question
  return answer;
}
