import { Question, Answer, QuestionResult } from '../types/quiz';

export function gradeTextQuestion(question: Question, userAnswer: string): boolean {
  if (question.type !== 'text') return false;

  const cleanAnswer = userAnswer.trim().toLowerCase();
  const cleanCorrect = question.correctText.trim().toLowerCase();

  return cleanAnswer === cleanCorrect;
}

export function gradeRadioQuestion(question: Question, userAnswer: number): boolean {
  if (question.type !== 'radio') return false;

  return userAnswer === question.correctIndex;
}

export function gradeCheckboxQuestion(question: Question, userAnswer: number[]): boolean {
  if (question.type !== 'checkbox') return false;

  const sortedAnswer = [...userAnswer].sort((a, b) => a - b);
  const sortedCorrect = [...question.correctIndexes].sort((a, b) => a - b);

  if (sortedAnswer.length !== sortedCorrect.length) return false;

  return sortedAnswer.every((val, idx) => val === sortedCorrect[idx]);
}

export function gradeQuiz(questions: Question[], answers: Answer[]): QuestionResult[] {
  return questions.map((question) => {
    const userAnswer = answers.find((a) => String(a.id) === String(question.id));

    if (!userAnswer) {
      return { id: question.id, correct: false };
    }

    let isCorrect = false;

    if (question.type === 'text') {
      isCorrect = gradeTextQuestion(question, userAnswer.value as string);
    } else if (question.type === 'radio') {
      isCorrect = gradeRadioQuestion(question, userAnswer.value as number);
    } else if (question.type === 'checkbox') {
      isCorrect = gradeCheckboxQuestion(question, userAnswer.value as number[]);
    }

    return { id: question.id, correct: isCorrect };
  });
}
