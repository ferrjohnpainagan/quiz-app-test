# Enrolla Quiz API

Hono backend deployed on Cloudflare Workers.

## Setup

1. Install dependencies:
```bash
cd api
npm install
```

2. Create `.dev.vars` file for local development:
```bash
cp .dev.vars.example .dev.vars
```

## Development

Run locally with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:8787/api`

## Deployment

### First-time setup

1. Install Wrangler CLI globally (if not already installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Deploy to production

```bash
npm run deploy
```

Your API will be deployed to: `https://enrolla-quiz-api.YOUR_SUBDOMAIN.workers.dev`

### Configure production environment

After deployment, update the production environment variables in [wrangler.toml](wrangler.toml):

```toml
[env.production.vars]
NODE_ENV = "production"
ALLOWED_ORIGINS = "https://your-production-frontend.com"
```

Then deploy to production environment:
```bash
wrangler deploy --env production
```

## API Endpoints

- `GET /api/quiz` - Fetch quiz questions (without answers)
- `POST /api/grade` - Submit answers for grading

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## Update Frontend

After deploying, update the frontend's `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://enrolla-quiz-api.YOUR_SUBDOMAIN.workers.dev/api
```
