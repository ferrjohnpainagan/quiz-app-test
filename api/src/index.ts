import { Hono } from 'hono';
import quiz from './routes/quiz';
import grade from './routes/grade';
import { securityHeadersMiddleware, createCorsMiddleware } from './middleware/security';
import { rateLimit } from './middleware/rateLimit';

// Define the environment bindings type
export interface Env {
  NODE_ENV?: string;
  ALLOWED_ORIGINS?: string;
}

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Apply security middleware globally (order matters - CORS first)
app.use('/*', createCorsMiddleware());
app.use('/*', securityHeadersMiddleware);

// Apply rate limiting to grade endpoint (10 requests per minute)
app.use('/grade/*', rateLimit(10, 60000));

app.route('/quiz', quiz);
app.route('/grade', grade);

export default app;
