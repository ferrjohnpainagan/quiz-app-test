import { Hono } from 'hono';
import quiz from './routes/quiz';

const app = new Hono().basePath('/api');

app.route('/quiz', quiz);

export default app;
