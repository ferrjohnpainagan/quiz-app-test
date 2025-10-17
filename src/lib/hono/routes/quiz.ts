import { Hono } from 'hono';
import { questions } from '@/lib/data/questions';
import { ClientQuestion } from '@/types/quiz';

const quiz = new Hono();

quiz.get('/', (c) => {
  // Remove answer keys from questions for security
  const clientQuestions: ClientQuestion[] = questions.map((q) => {
    if (q.type === 'text') {
      const { correctText, ...rest } = q;
      return rest;
    } else if (q.type === 'radio') {
      const { correctIndex, ...rest } = q;
      return rest;
    } else {
      const { correctIndexes, ...rest } = q;
      return rest;
    }
  });

  return c.json({ questions: clientQuestions });
});

export default quiz;
