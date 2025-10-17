import { Hono } from 'hono';
import quiz from './routes/quiz';
import grade from './routes/grade';
import { securityHeadersMiddleware, corsMiddleware } from './middleware/security';
import { rateLimit } from './middleware/rateLimit';

const app = new Hono().basePath('/api');

// Apply security middleware globally (order matters - CORS first)
app.use('/*', corsMiddleware);
app.use('/*', securityHeadersMiddleware);

// Apply rate limiting to grade endpoint (10 requests per minute)
app.use('/grade/*', rateLimit(10, 60000));

app.route('/quiz', quiz);
app.route('/grade', grade);

export default app;
