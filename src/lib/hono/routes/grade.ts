import { Hono } from 'hono';
import { questions } from '@/lib/data/questions';
import { gradeQuiz } from '@/lib/utils/grading';
import { gradeRequestSchema } from '@/lib/validation/schemas';

const grade = new Hono();

grade.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = gradeRequestSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: 'Invalid request', details: validation.error }, 400);
    }

    const { answers } = validation.data;
    const results = gradeQuiz(questions, answers);
    const score = results.filter((r) => r.correct).length;

    return c.json({
      score,
      total: questions.length,
      results,
    });
  } catch (error) {
    return c.json({ error: 'Failed to grade quiz' }, 500);
  }
});

export default grade;
