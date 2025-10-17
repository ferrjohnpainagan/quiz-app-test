import { Hono } from 'hono';
import quiz from './routes/quiz';
import grade from './routes/grade';

const app = new Hono().basePath('/api');

app.route('/quiz', quiz);
app.route('/grade', grade);

export default app;
