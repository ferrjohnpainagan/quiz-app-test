import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { Context } from "hono"

interface Env {
  NODE_ENV?: string;
  ALLOWED_ORIGINS?: string;
}

const getAllowedOrigins = (c: Context): string[] => {
  const env = c.env as Env;

  // Production: strict whitelist
  if (env.NODE_ENV === "production") {
    return env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ["https://prod-quiz-app.com"]
  }

  // Development: localhost only (same-machine access)
  return ["http://localhost:3000"]
}

// Export configured security headers middleware
// Uses optimal defaults with custom CSP for our Next.js app
export const securityHeadersMiddleware = secureHeaders({
  // Content Security Policy allowing inline styles for TailwindCSS
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
  // Other headers use Hono's secure defaults
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
})

// Export CORS middleware factory
export const createCorsMiddleware = () => {
  return cors({
    origin: (origin, c) => {
      const allowed = getAllowedOrigins(c);
      return allowed.includes(origin) ? origin : allowed[0];
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
    maxAge: 600, // Cache preflight requests for 10 minutes
  })
}
