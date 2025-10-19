# Enrolla Quiz App

A full-stack quiz application built with Next.js 15, Hono, and TailwindCSS. Features multiple question types, runtime validation, comprehensive security measures, and deterministic shuffling.

## Quick Start

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
npm run dev
```

Access at [http://localhost:3000](http://localhost:3000)

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Run production server
npm test             # Run tests
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── api/[[...route]]/   # Hono API routes
│   ├── page.tsx            # Quiz page
│   └── results/page.tsx    # Results page
├── components/             # React components
├── lib/
│   ├── hono/              # Hono backend + middleware
│   ├── data/              # Mock quiz data
│   ├── utils/             # Grading, shuffling, sanitization
│   └── validation/        # Zod schemas
├── store/                 # Zustand state management
├── types/quiz.ts          # TypeScript types
└── __tests__/             # Vitest tests
```

## Architecture Overview

### Backend: Hono API

Using Hono instead of Next.js native API routes for:

- Better TypeScript inference and type-safe request/response handling
- Clean middleware composition (CORS, security headers, rate limiting)
- Superior DX with cleaner routing syntax
- Edge-ready architecture

**Runtime:** Node.js (easier debugging, familiar tooling, sufficient for this scope)

### Frontend: Next.js App Router

- Modern React patterns with Server Components support
- File-system routing
- Current Next.js best practices

### State Management: Zustand

Using Zustand with persistence middleware for:

- Timer state across page refreshes
- Answer preservation during quiz
- Shuffle mapping storage
- Partial state persistence (only quiz data, not loading states)

**Why Zustand over useState?**

- Quiz timer needs to persist across page refreshes
- Deterministic shuffling requires storing seed and mappings
- Results need to be accessible across pages
- Built-in persistence middleware simplifies localStorage logic

### Security Architecture

**4-Layer Defense:**

1. **Security Middleware** - CORS, CSP headers, rate limiting (10 req/min)
2. **Schema Validation (Zod)** - Type checking, length limits, XSS sanitization
3. **Business Validation** - Answer type matching, question existence
4. **Grading Logic** - Type guards, pure functions

**Key Security Features:**

- XSS prevention (CSP headers + input sanitization)
- CSRF protection (CORS whitelist)
- DoS mitigation (payload limits + rate limiting)
- Type confusion prevention (Zod + business logic)
- Client/server type separation (answer keys never sent to frontend)

```typescript
// Server types (include answers)
type Question = TextQuestion | RadioQuestion | CheckboxQuestion

// Client types (answers stripped)
type ClientQuestion =
  | Omit<TextQuestion, "correctText">
  | Omit<RadioQuestion, "correctIndex">
  | Omit<CheckboxQuestion, "correctIndexes">
```

## Validation Approach

### 1. Compile-Time (TypeScript)

- Discriminated unions prevent invalid question types
- Type inference reduces manual annotations
- Answer keys cannot be exposed to client (compile-time guarantee)

### 2. Runtime (Zod)

```typescript
const answerSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .refine((id) => VALID_QUESTION_IDS.includes(String(id))),
  value: z.union([
    z.string().max(500).transform(sanitizeText), // XSS prevention
    z.number().int().min(0).max(10), // Bounds checking
    z.array(z.number().int().min(0).max(10)).max(10),
  ]),
})
```

### 3. Business Logic

Custom `validateAnswerTypes()` ensures:

- Text questions receive strings
- Radio questions receive numbers
- Checkbox questions receive arrays
- Returns 400 if types don't match

**Why Zod?**

- Type inference eliminates schema/type duplication
- Excellent error messages
- Transform support for sanitization
- Industry standard

## Libraries & Rationale

| Library         | Version | Purpose                                              |
| --------------- | ------- | ---------------------------------------------------- |
| **Next.js**     | 15.5    | App Router requirement, modern React patterns        |
| **Hono**        | 4.10    | Type-safe API routes, better DX, built-in middleware |
| **Zod**         | 4.1     | Runtime validation with type inference               |
| **Zustand**     | 5.0     | Global state with persistence for timer + shuffling  |
| **TailwindCSS** | 4.x     | Requirement, utility-first styling                   |
| **Vitest**      | Latest  | Fast test execution (<1s for 51 tests)               |
| **seedrandom**  | 3.0     | Deterministic shuffling                              |

**Key Decisions:**

- **Hono's built-in middleware with custom configuration**

  - Using `secureHeaders()` and `cors()` from Hono but with custom CSP for TailwindCSS
  - Custom origin whitelist (localhost in dev, env-based in production)
  - Better defaults than custom implementations, with flexibility to override

- **Zustand for timer persistence**

  - Built-in `persist` middleware handles localStorage serialization automatically
  - Simpler API than Redux (no actions/reducers boilerplate)
  - Better TypeScript inference than Context API
  - Only 1KB gzipped vs 3KB for Redux

- **No external UI library**
  - Smaller bundle size (no component library overhead)
  - Full control over accessibility and styling

## Bonus Features

**Implemented 4 of 4 bonus features** (requirement was 1-2):

1. **Custom State Management (Zustand)** - Global state with persistence middleware for timer, answers, and shuffle mappings
2. **Timed Quiz** - 5-minute countdown timer with auto-submit on expiration, persists across page refreshes
3. **Unit Tests** - 51 tests (25 grading + 26 security), 100% pass rate, <1s execution
4. **Deterministic Shuffling** - Fisher-Yates algorithm with seeded random for reproducible question/choice order

### Why Fisher-Yates Algorithm?

**Fisher-Yates** is the optimal choice for shuffling over other algorithms:

- **Unbiased:** Produces truly uniform random permutations (each arrangement has equal probability 1/n!)
- **Efficient:** O(n) time complexity, O(1) space - single pass through array
- **In-place:** No additional memory allocation needed
- **Deterministic with seed:** Using `seedrandom`, same seed always produces same shuffle order

**Alternative algorithms considered:**

| Algorithm                                                  | Why Not Used                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| **Sort by random** (`arr.sort(() => Math.random() - 0.5)`) | Biased distribution, not truly random, browser-dependent behavior |
| **Swap random pairs**                                      | Requires many iterations for uniform distribution, less efficient |
| **Sattolo's algorithm**                                    | Creates only cyclic permutations (not all permutations possible)  |

**Implementation with seeded PRNG:**

```typescript
export function shuffleArray<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed) // Deterministic random number generator
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}
```

Fisher-Yates is the industry standard (used by Python's `random.shuffle()`, C++'s `std::shuffle()`) because it's the only common algorithm that guarantees both uniformity and efficiency.

## Testing

**Suite:** Vitest
**Coverage:** 51 tests, 100% pass rate, <1 second execution

### Test Breakdown

**Grading Logic (25 tests):**

- Text questions: exact match, case-insensitive, whitespace handling
- Radio questions: correct/incorrect indices
- Checkbox questions: order-independent, missing/extra selections
- Edge cases: empty answers, special characters, ID type conversion

**Security Validation (26 tests):**

- XSS prevention: script tag sanitization
- Invalid IDs: non-existent question rejection
- Length limits: 500 char text, 10 checkbox selections, 20 answers
- Bounds checking: negative/out-of-bounds indices
- Type confusion: wrong answer types

```bash
npm test
```

## Trade-offs & Design Decisions

### Intentional Simplifications

**1. Text Answer Grading**

- Exact match only (case-insensitive, trimmed)
- No fuzzy matching or synonym support
- Simpler logic, clearer expectations
- Future: Levenshtein distance or multiple accepted answers

**2. Checkbox Grading**

- All-or-nothing scoring (no partial credit)
- Clearer expectations for users
- Simpler grading logic
- Future: Partial scoring option

**3. Mock Data**

- Hardcoded questions in codebase
- Database integration out of scope for demo
- Answer keys visible in source (acceptable for take-home)
- Future: PostgreSQL with admin interface

### Production-Quality Decisions (Not Cut)

- Security hardening (XSS, rate limiting, CORS, CSP)
- Comprehensive test coverage
- Proper error handling (400/500 status codes)
- Type safety (client/server separation)
- Deterministic shuffling with index mapping
- Timer persistence across refreshes

## API Documentation

### GET /api/quiz

Returns shuffled questions with answer keys removed.

**Response (200):**

```json
{
  "questions": [
    {
      "id": "1",
      "type": "text",
      "question": "What does ICAO stand for?"
    },
    {
      "id": "4",
      "type": "radio",
      "question": "What is the standard QNH pressure?",
      "choices": ["1013.25 hPa", "1000 hPa", "29.92 inHg", "Both A and C"]
    }
  ]
}
```

### POST /api/grade

Grades submitted answers using shuffle mapping to translate back to original indices.

**Request:**

```json
{
  "answers": [
    { "id": "1", "value": "International Civil Aviation Organization" },
    { "id": "4", "value": 3 }
  ],
  "startedAt": 1640000000000,
  "shuffleMapping": {
    "seed": "uuid-v4",
    "questionOrder": ["1", "4", "7", ...],
    "choiceMappings": [
      {
        "questionId": "4",
        "originalToShuffled": { "0": 2, "1": 0, ... },
        "shuffledToOriginal": { "0": 1, "2": 0, ... }
      }
    ]
  }
}
```

**Response (200):**

```json
{
  "score": 8,
  "total": 10,
  "results": [
    { "id": "1", "correct": true },
    { "id": "4", "correct": false }
  ]
}
```

## Time Spent

| Phase                   | Hours           | Notes                                       |
| ----------------------- | --------------- | ------------------------------------------- |
| **Setup & Types**       | 1.5             | Next.js + Hono + TypeScript setup           |
| **Backend API**         | 1.5             | GET /quiz, POST /grade with Zod validation  |
| **Frontend Components** | 3               | Quiz page, results page, component logic    |
| **Grading Logic**       | 1.5             | Pure functions for all question types       |
| **Styling**             | 2.5             | TailwindCSS + responsive design             |
| **Security**            | 2.5             | Validation, middleware, XSS prevention      |
| **Testing**             | 2               | 51 Vitest tests                             |
| **State Management**    | 2               | Zustand store with persistence              |
| **Timer**               | 1.5             | Countdown with auto-submit, Unix timestamps |
| **Shuffling**           | 2               | Fisher-Yates algorithm, index mappings      |
| **Documentation**       | 1.5             | Progress docs + README                      |
| **Total**               | **~20.5 hours** | Spread over 3 days                          |

### Time Distribution

- Core requirements: ~10 hours
- Bonus features: ~7 hours (Zustand + Timer + Tests + Shuffling)
- Security: ~2.5 hours
- Documentation: ~1.5 hours

## Development Process

Detailed progress documentation available in [docs/progress/](docs/progress/README.md):

1. Foundation & Core Architecture
2. Grading System & Results
3. Testing & Security
4. State Management & Timer
5. Deterministic Shuffling

Each document covers technical decisions, implementation details, and lessons learned.

**Tech Stack:**

- [Next.js](https://nextjs.org/)
- [Hono](https://hono.dev/)
- [Zod](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)
- [Zustand](https://zustand.docs.pmnd.rs/)
