import { describe, it, expect } from 'vitest';
import { answerSchema, gradeRequestSchema, validateAnswerTypes } from '@/lib/validation/schemas';
import { Question } from '@/types/quiz';

describe('Security: Validation Schema Tests', () => {
  describe('XSS Prevention', () => {
    it('should sanitize text input with script tags', () => {
      const input = {
        id: '1',
        value: '<script>alert("XSS")</script>',
      };

      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Angle brackets should be removed
        expect(result.data.value).not.toContain('<');
        expect(result.data.value).not.toContain('>');
        expect(result.data.value).toBe('scriptalert("XSS")/script');
      }
    });

    it('should sanitize text with HTML tags', () => {
      const input = {
        id: '1',
        value: '<div>test</div><img src=x onerror=alert(1)>',
      };

      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).not.toMatch(/<[^>]*>/);
      }
    });
  });

  describe('Invalid Question ID Protection', () => {
    it('should reject non-existent question ID', () => {
      const input = {
        id: '999',
        value: 'hack',
      };

      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid question ID');
      }
    });

    it('should reject question ID 0', () => {
      const input = { id: '0', value: 'test' };
      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept valid question IDs 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        const input = { id: String(i), value: 'test' };
        const result = answerSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Text Length Limits', () => {
    it('should reject text longer than 500 characters', () => {
      const longText = 'A'.repeat(1000);
      const input = { id: '1', value: longText };

      const result = answerSchema.safeParse(input);

      // Zod validates max length before transforming, so it should fail
      expect(result.success).toBe(false);
      if (!result.success) {
        // Just verify it was rejected
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept text exactly 500 characters', () => {
      const text = 'A'.repeat(500);
      const input = { id: '1', value: text };

      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data.value as string).length).toBe(500);
      }
    });
  });

  describe('Numeric Bounds Protection', () => {
    it('should reject negative indices', () => {
      const input = { id: '4', value: -1 };
      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be negative');
      }
    });

    it('should reject indices above 10', () => {
      const input = { id: '4', value: 99 };
      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('out of bounds');
      }
    });

    it('should reject non-integer values', () => {
      const input = { id: '4', value: 1.5 };
      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod returns 'Invalid input' for union type mismatch
        expect(result.error.issues[0].message).toBeTruthy();
      }
    });

    it('should accept valid indices 0-10', () => {
      for (let i = 0; i <= 10; i++) {
        const input = { id: '4', value: i };
        const result = answerSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Checkbox Selection Limits', () => {
    it('should reject more than 10 checkbox selections', () => {
      const input = {
        id: '8',
        value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      };

      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod may report the index out of bounds error first
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept exactly 10 selections', () => {
      const input = {
        id: '8',
        value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      };

      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative indices in array', () => {
      const input = { id: '8', value: [0, -1, 2] };
      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject out of bounds indices in array', () => {
      const input = { id: '8', value: [0, 1, 99] };
      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('Request Size Limits', () => {
    it('should reject more than 20 answers', () => {
      const answers = Array.from({ length: 21 }, (_, i) => ({
        id: '1',
        value: 'test',
      }));

      const result = gradeRequestSchema.safeParse({ answers });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Too many answers');
      }
    });

    it('should reject empty answers array', () => {
      const result = gradeRequestSchema.safeParse({ answers: [] });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one answer');
      }
    });

    it('should accept exactly 20 answers', () => {
      const answers = Array.from({ length: 20 }, (_, i) => ({
        id: '1',
        value: 'test',
      }));

      const result = gradeRequestSchema.safeParse({ answers });
      expect(result.success).toBe(true);
    });
  });

  describe('Type Confusion Protection', () => {
    const questions: Question[] = [
      { id: '1', type: 'text', question: 'Q1', correctText: 'answer' },
      { id: '2', type: 'radio', question: 'Q2', choices: ['A', 'B'], correctIndex: 0 },
      { id: '3', type: 'checkbox', question: 'Q3', choices: ['A', 'B'], correctIndexes: [0] },
    ];

    it('should reject array for text question', () => {
      const answers = [{ id: '1', value: [1, 2, 3] }];
      const result = validateAnswerTypes(answers, questions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expects text answer');
    });

    it('should reject string for radio question', () => {
      const answers = [{ id: '2', value: 'wrong' }];
      const result = validateAnswerTypes(answers, questions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expects number answer');
    });

    it('should reject number for checkbox question', () => {
      const answers = [{ id: '3', value: 1 }];
      const result = validateAnswerTypes(answers, questions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expects array answer');
    });

    it('should accept correct types', () => {
      const answers = [
        { id: '1', value: 'text' },
        { id: '2', value: 0 },
        { id: '3', value: [0, 1] },
      ];

      const result = validateAnswerTypes(answers, questions);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject answer for non-existent question', () => {
      const answers = [{ id: '999', value: 'test' }];
      const result = validateAnswerTypes(answers, questions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const input = { id: '1', value: null };
      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const input = { id: '1', value: undefined };
      const result = answerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from text', () => {
      const input = { id: '1', value: '  test  ' };
      const result = answerSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe('test');
      }
    });
  });
});
