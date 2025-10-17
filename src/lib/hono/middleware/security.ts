import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"

const getAllowedOrigins = (): string[] => {
  // Production: strict whitelist
  if (process.env.NODE_ENV === "production") {
    return [
      process.env.NEXT_PUBLIC_APP_URL ?? "https://prod-quiz-app.com",
      // Add staging URLs if needed
    ]
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

// Export configured CORS middleware
// Allows localhost origins for development
export const corsMiddleware = cors({
  origin: getAllowedOrigins(),
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
  credentials: true,
  maxAge: 600, // Cache preflight requests for 10 minutes
})
