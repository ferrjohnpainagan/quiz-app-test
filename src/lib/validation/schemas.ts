import { z } from 'zod';

export const answerSchema = z.object({
  id: z.union([z.string(), z.number()]),
  value: z.union([z.string(), z.number(), z.array(z.number())]),
});

export const gradeRequestSchema = z.object({
  answers: z.array(answerSchema),
});
