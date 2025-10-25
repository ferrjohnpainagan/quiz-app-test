import { Context, Next } from 'hono';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// Note: In Cloudflare Workers, setInterval is not available
// This simple in-memory rate limiter will reset on worker restart
// For production, consider using Cloudflare KV or Durable Objects

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return c.json(
        { error: 'Too many requests. Please try again later.' },
        429
      );
    }

    record.count++;
    return next();
  };
}
