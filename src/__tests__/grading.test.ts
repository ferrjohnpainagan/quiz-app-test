import { describe, it, expect } from 'vitest';
import {
  gradeTextQuestion,
  gradeRadioQuestion,
  gradeCheckboxQuestion,
  gradeQuiz,
} from '@/lib/utils/grading';
import { Question, Answer } from '@/types/quiz';

describe('Grading Logic Tests', () => {
  describe('gradeTextQuestion', () => {
    const question: Question = {
      id: '1',
      type: 'text',
      question: 'What is the capital of France?',
      correctText: 'Paris',
    };

    it('should accept exact match', () => {
      expect(gradeTextQuestion(question, 'Paris')).toBe(true);
    });

    it('should accept case-insensitive match', () => {
      expect(gradeTextQuestion(question, 'paris')).toBe(true);
      expect(gradeTextQuestion(question, 'PARIS')).toBe(true);
      expect(gradeTextQuestion(question, 'pArIs')).toBe(true);
    });

    it('should trim whitespace', () => {
      expect(gradeTextQuestion(question, '  Paris  ')).toBe(true);
      expect(gradeTextQuestion(question, 'Paris\n')).toBe(true);
      expect(gradeTextQuestion(question, '\tParis')).toBe(true);
    });

    it('should reject incorrect answer', () => {
      expect(gradeTextQuestion(question, 'London')).toBe(false);
      expect(gradeTextQuestion(question, 'New York')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(gradeTextQuestion(question, '')).toBe(false);
    });

    it('should return false for wrong question type', () => {
      const radioQuestion: Question = {
        id: '2',
        type: 'radio',
        question: 'Test',
        choices: ['A', 'B'],
        correctIndex: 0,
      };
      expect(gradeTextQuestion(radioQuestion, 'test')).toBe(false);
    });
  });

  describe('gradeRadioQuestion', () => {
    const question: Question = {
      id: '2',
      type: 'radio',
      question: 'Which is correct?',
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 2,
    };

    it('should accept correct index', () => {
      expect(gradeRadioQuestion(question, 2)).toBe(true);
    });

    it('should reject incorrect indices', () => {
      expect(gradeRadioQuestion(question, 0)).toBe(false);
      expect(gradeRadioQuestion(question, 1)).toBe(false);
      expect(gradeRadioQuestion(question, 3)).toBe(false);
    });

    it('should return false for wrong question type', () => {
      const textQuestion: Question = {
        id: '1',
        type: 'text',
        question: 'Test',
        correctText: 'answer',
      };
      expect(gradeRadioQuestion(textQuestion, 0)).toBe(false);
    });
  });

  describe('gradeCheckboxQuestion', () => {
    const question: Question = {
      id: '3',
      type: 'checkbox',
      question: 'Select all that apply',
      choices: ['A', 'B', 'C', 'D', 'E'],
      correctIndexes: [1, 3, 4],
    };

    it('should accept correct selection in any order', () => {
      expect(gradeCheckboxQuestion(question, [1, 3, 4])).toBe(true);
      expect(gradeCheckboxQuestion(question, [4, 1, 3])).toBe(true);
      expect(gradeCheckboxQuestion(question, [3, 4, 1])).toBe(true);
    });

    it('should reject missing selections', () => {
      expect(gradeCheckboxQuestion(question, [1, 3])).toBe(false); // Missing 4
      expect(gradeCheckboxQuestion(question, [4])).toBe(false); // Missing 1, 3
    });

    it('should reject extra selections', () => {
      expect(gradeCheckboxQuestion(question, [1, 3, 4, 0])).toBe(false);
      expect(gradeCheckboxQuestion(question, [0, 1, 2, 3, 4])).toBe(false);
    });

    it('should reject completely wrong selections', () => {
      expect(gradeCheckboxQuestion(question, [0, 2])).toBe(false);
    });

    it('should reject empty array', () => {
      expect(gradeCheckboxQuestion(question, [])).toBe(false);
    });

    it('should handle single correct answer', () => {
      const singleQuestion: Question = {
        id: '4',
        type: 'checkbox',
        question: 'Test',
        choices: ['A', 'B'],
        correctIndexes: [0],
      };
      expect(gradeCheckboxQuestion(singleQuestion, [0])).toBe(true);
      expect(gradeCheckboxQuestion(singleQuestion, [1])).toBe(false);
    });

    it('should return false for wrong question type', () => {
      const textQuestion: Question = {
        id: '1',
        type: 'text',
        question: 'Test',
        correctText: 'answer',
      };
      expect(gradeCheckboxQuestion(textQuestion, [0])).toBe(false);
    });
  });

  describe('gradeQuiz', () => {
    const questions: Question[] = [
      {
        id: '1',
        type: 'text',
        question: 'Text Q',
        correctText: 'correct',
      },
      {
        id: '2',
        type: 'radio',
        question: 'Radio Q',
        choices: ['A', 'B', 'C'],
        correctIndex: 1,
      },
      {
        id: '3',
        type: 'checkbox',
        question: 'Checkbox Q',
        choices: ['A', 'B', 'C'],
        correctIndexes: [0, 2],
      },
    ];

    it('should grade all correct answers', () => {
      const answers: Answer[] = [
        { id: '1', value: 'correct' },
        { id: '2', value: 1 },
        { id: '3', value: [0, 2] },
      ];

      const results = gradeQuiz(questions, answers);

      expect(results).toHaveLength(3);
      expect(results[0].correct).toBe(true);
      expect(results[1].correct).toBe(true);
      expect(results[2].correct).toBe(true);
    });

    it('should grade all incorrect answers', () => {
      const answers: Answer[] = [
        { id: '1', value: 'wrong' },
        { id: '2', value: 0 },
        { id: '3', value: [1] },
      ];

      const results = gradeQuiz(questions, answers);

      expect(results).toHaveLength(3);
      expect(results[0].correct).toBe(false);
      expect(results[1].correct).toBe(false);
      expect(results[2].correct).toBe(false);
    });

    it('should grade mixed correct and incorrect', () => {
      const answers: Answer[] = [
        { id: '1', value: 'correct' },
        { id: '2', value: 0 },
        { id: '3', value: [0, 2] },
      ];

      const results = gradeQuiz(questions, answers);

      expect(results[0].correct).toBe(true);
      expect(results[1].correct).toBe(false);
      expect(results[2].correct).toBe(true);
    });

    it('should mark unanswered questions as incorrect', () => {
      const answers: Answer[] = [
        { id: '1', value: 'correct' },
        // Missing question 2
        { id: '3', value: [0, 2] },
      ];

      const results = gradeQuiz(questions, answers);

      expect(results).toHaveLength(3);
      expect(results[0].correct).toBe(true);
      expect(results[1].correct).toBe(false); // Unanswered
      expect(results[2].correct).toBe(true);
    });

    it('should handle ID type conversion (string vs number)', () => {
      const answers: Answer[] = [
        { id: 1, value: 'correct' }, // number ID
        { id: '2', value: 1 }, // string ID
        { id: 3, value: [0, 2] }, // number ID
      ];

      const results = gradeQuiz(questions, answers);

      expect(results).toHaveLength(3);
      expect(results[0].correct).toBe(true);
      expect(results[1].correct).toBe(true);
      expect(results[2].correct).toBe(true);
    });

    it('should return results in same order as questions', () => {
      const answers: Answer[] = [
        { id: '3', value: [0, 2] },
        { id: '1', value: 'correct' },
        { id: '2', value: 1 },
      ];

      const results = gradeQuiz(questions, answers);

      expect(results[0].id).toBe('1');
      expect(results[1].id).toBe('2');
      expect(results[2].id).toBe('3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty quiz', () => {
      const results = gradeQuiz([], []);
      expect(results).toHaveLength(0);
    });

    it('should handle text with special characters', () => {
      const question: Question = {
        id: '1',
        type: 'text',
        question: 'Test',
        correctText: 'C++',
      };
      expect(gradeTextQuestion(question, 'C++')).toBe(true);
      expect(gradeTextQuestion(question, 'c++')).toBe(true);
    });

    it('should handle checkbox with duplicates in answer', () => {
      const question: Question = {
        id: '1',
        type: 'checkbox',
        question: 'Test',
        choices: ['A', 'B'],
        correctIndexes: [0, 1],
      };
      // Even with duplicates, after sorting should still work
      expect(gradeCheckboxQuestion(question, [0, 1, 0])).toBe(false);
    });
  });
});
