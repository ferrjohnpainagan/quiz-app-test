import { Hono } from 'hono';
import { questions } from '@/lib/data/questions';
import { gradeQuiz } from '@/lib/utils/grading';
import { gradeRequestSchema, validateAnswerTypes } from '@/lib/validation/schemas';

const grade = new Hono();

// Time limit for quiz (5 minutes)
const TIME_LIMIT = 5 * 60 * 1000; // milliseconds

grade.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Step 1: Validate request structure and sanitize inputs
    const validation = gradeRequestSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          error: 'Invalid request',
          details: validation.error.issues.map(i => i.message)
        },
        400
      );
    }

    const { answers, startedAt } = validation.data;

    // Step 2: Validate time limit (server-authoritative)
    const submittedAt = Date.now();
    const elapsed = submittedAt - startedAt;

    if (elapsed > TIME_LIMIT) {
      return c.json(
        {
          error: 'Time limit exceeded',
          timeLimit: TIME_LIMIT,
          elapsed,
        },
        400
      );
    }

    // Step 3: Validate answer types match question types
    const typeValidation = validateAnswerTypes(answers, questions);

    if (!typeValidation.valid) {
      return c.json(
        { error: typeValidation.error },
        400
      );
    }

    // Step 4: Grade the quiz
    const results = gradeQuiz(questions, answers);
    const score = results.filter((r) => r.correct).length;

    return c.json({
      score,
      total: questions.length,
      results,
    });
  } catch (error) {
    // Don't leak error details to client
    console.error('Grading error:', error);
    return c.json({ error: 'Failed to grade quiz' }, 500);
  }
});

export default grade;
