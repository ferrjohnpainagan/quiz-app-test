# Progress Report #002: Grading System and Results

**Date:** 2025-10-17
**Phase:** Core Requirements - Grading & Submission
**Status:** ✅ Complete

---

## Overview

Implemented the complete grading system including validation, grading logic, API endpoint, quiz submission flow, and results display. This phase completed the core quiz functionality, enabling users to submit answers and receive immediate feedback on their performance.

---

## What Was Built

### 1. Type Definitions for Grading
**Files:** [src/types/quiz.ts](../../src/types/quiz.ts)

#### Key Decisions:
- **Answer interface** following API specification requirements
  - Supports `id: string | number` per spec
  - Union type for `value` to handle all question types

```typescript
export interface Answer {
  id: string | number;
  value: string | number | number[];
}

export interface GradeRequest {
  answers: Answer[];
}

export interface QuestionResult {
  id: string | number;
  correct: boolean;
}

export interface GradeResponse {
  score: number;
  total: number;
  results: QuestionResult[];
}
```

**Rationale:**
- Types mirror API specification exactly
- Flexible `id` type accommodates different question ID formats
- Discriminated union for `value` handles text, radio, and checkbox answers
- Clear separation between request and response types

---

### 2. Validation with Zod
**Files:** [src/lib/validation/schemas.ts](../../src/lib/validation/schemas.ts)

#### Key Decisions:
- **Runtime validation** to ensure type safety at API boundary
- **Zod schemas** provide both validation and type inference

```typescript
export const answerSchema = z.object({
  id: z.union([z.string(), z.number()]),
  value: z.union([z.string(), z.number(), z.array(z.number())]),
});

export const gradeRequestSchema = z.object({
  answers: z.array(answerSchema),
});
```

**Benefits:**
- Runtime type checking prevents invalid data from reaching grading logic
- Schema composition keeps validation DRY
- Automatic TypeScript type inference from schemas
- Clear error messages for debugging

---

### 3. Grading Logic Implementation
**Files:** [src/lib/utils/grading.ts](../../src/lib/utils/grading.ts)

#### Key Decisions:
- **Separate grading functions** for each question type
- **Pure functions** for testability
- **Defensive type checking** using discriminated unions

**Text Question Grading:**
```typescript
export function gradeTextQuestion(question: Question, userAnswer: string): boolean {
  if (question.type !== 'text') return false;

  const cleanAnswer = userAnswer.trim().toLowerCase();
  const cleanCorrect = question.correctText.trim().toLowerCase();

  return cleanAnswer === cleanCorrect;
}
```
- Case-insensitive comparison
- Whitespace normalization (trim)
- Exact match required

**Radio Question Grading:**
```typescript
export function gradeRadioQuestion(question: Question, userAnswer: number): boolean {
  if (question.type !== 'radio') return false;

  return userAnswer === question.correctIndex;
}
```
- Simple index comparison
- Type guard ensures correct question type

**Checkbox Question Grading:**
```typescript
export function gradeCheckboxQuestion(question: Question, userAnswer: number[]): boolean {
  if (question.type !== 'checkbox') return false;

  const sortedAnswer = [...userAnswer].sort((a, b) => a - b);
  const sortedCorrect = [...question.correctIndexes].sort((a, b) => a - b);

  if (sortedAnswer.length !== sortedCorrect.length) return false;

  return sortedAnswer.every((val, idx) => val === sortedCorrect[idx]);
}
```
- Sorts arrays for order-independent comparison
- Length check for early exit
- All-or-nothing grading (no partial credit)

**Main Grading Function:**
```typescript
export function gradeQuiz(questions: Question[], answers: Answer[]): QuestionResult[] {
  return questions.map((question) => {
    const userAnswer = answers.find((a) => String(a.id) === String(question.id));

    if (!userAnswer) {
      return { id: question.id, correct: false };
    }

    let isCorrect = false;

    if (question.type === 'text') {
      isCorrect = gradeTextQuestion(question, userAnswer.value as string);
    } else if (question.type === 'radio') {
      isCorrect = gradeRadioQuestion(question, userAnswer.value as number);
    } else if (question.type === 'checkbox') {
      isCorrect = gradeCheckboxQuestion(question, userAnswer.value as number[]);
    }

    return { id: question.id, correct: isCorrect };
  });
}
```

**Design Patterns:**
- **Type guards** prevent incorrect question type handling
- **String coercion** for ID comparison handles both string and number IDs
- **Missing answers default to incorrect** - no special handling needed
- **Pure functions** - no side effects, easy to test

---

### 4. POST /api/grade Endpoint
**Files:**
- [src/lib/hono/routes/grade.ts](../../src/lib/hono/routes/grade.ts)
- [src/lib/hono/app.ts](../../src/lib/hono/app.ts)

#### Key Decisions:
- **Zod validation before processing** - fail fast on invalid input
- **Error handling with appropriate status codes** (400 vs 500)
- **Detailed error responses** for debugging

```typescript
grade.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = gradeRequestSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: 'Invalid request', details: validation.error }, 400);
    }

    const { answers } = validation.data;
    const results = gradeQuiz(questions, answers);
    const score = results.filter((r) => r.correct).length;

    return c.json({
      score,
      total: questions.length,
      results,
    });
  } catch (error) {
    return c.json({ error: 'Failed to grade quiz' }, 500);
  }
});
```

**Error Handling Strategy:**
- **400 Bad Request** - validation failures (client error)
- **500 Internal Server Error** - unexpected errors (server error)
- **Detailed validation errors** included in development for debugging
- **Generic error messages** prevent information leakage

**Route Registration:**
```typescript
// app.ts
app.route('/quiz', quiz);
app.route('/grade', grade);
```

---

### 5. Quiz Submission Flow
**Files:** [src/app/page.tsx](../../src/app/page.tsx)

#### Key Decisions:
- **Transform state to API format** before submission
- **Submitting state** prevents duplicate submissions
- **SessionStorage** for passing results to results page

```typescript
const handleSubmit = async () => {
  setSubmitting(true);

  const answerArray: Answer[] = Object.entries(answers).map(([id, value]) => ({
    id,
    value,
  }));

  try {
    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answerArray }),
    });

    const data = await res.json();

    sessionStorage.setItem('quizResults', JSON.stringify(data));
    router.push('/results');
  } catch (err) {
    setError('Failed to submit quiz');
    setSubmitting(false);
  }
};
```

**State Management:**
- `submitting` state prevents double submissions
- Error state allows retry without losing answers
- Navigation only occurs on successful submission

**Data Transformation:**
```typescript
// Internal state: Record<string, value>
{ "1": "answer", "2": 1, "3": [0, 2] }

// API format: Answer[]
[
  { id: "1", value: "answer" },
  { id: "2", value: 1 },
  { id: "3", value: [0, 2] }
]
```

---

### 6. Results Page
**Files:** [src/app/results/page.tsx](../../src/app/results/page.tsx)

#### Key Decisions:
- **SessionStorage for state passing** - avoids global state management
- **Redirect if no results** - prevents accessing results directly
- **Per-question feedback** with visual indicators

```typescript
export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<GradeResponse | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('quizResults');
    if (data) {
      setResults(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <h1>Quiz Results</h1>
      <h2>Score: {results.score} / {results.total}</h2>
      <div>
        <h3>Results by Question:</h3>
        {results.results.map((result) => (
          <div key={result.id}>
            Question {result.id}: {result.correct ? '✓ Correct' : '✗ Incorrect'}
          </div>
        ))}
      </div>
      <button onClick={() => router.push('/')}>Retake Quiz</button>
    </div>
  );
}
```

**UX Considerations:**
- Clear score display upfront
- Per-question feedback for learning
- Retake option for immediate retry
- Guard against direct URL access

---

## Technical Highlights

### Validation Architecture
1. **Multi-layer validation**
   - TypeScript types at compile time
   - Zod schemas at runtime
   - Business logic validation in grading functions

2. **Type safety throughout**
   - Zod infers types from schemas
   - No manual type/schema duplication
   - Discriminated unions prevent invalid states

### Grading Algorithm Design
1. **Text questions:** Normalized comparison (case-insensitive, trimmed)
2. **Radio questions:** Direct index comparison
3. **Checkbox questions:** Sorted array comparison (order-independent, all-or-nothing)

### Error Handling
1. **API layer:** 400 vs 500 status codes
2. **Frontend:** Loading, error, and submitting states
3. **Edge cases:** Missing answers default to incorrect

### Data Flow
```
User Input
    ↓
Record<id, value> (component state)
    ↓
Answer[] (API format)
    ↓
POST /api/grade
    ↓
Zod Validation
    ↓
Grading Logic
    ↓
GradeResponse
    ↓
SessionStorage
    ↓
Results Page
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                   │
│                                                 │
│  ┌───────────────────────────────────┐         │
│  │  page.tsx                         │         │
│  │  - answers: Record<id, value>     │         │
│  │  - handleSubmit()                 │         │
│  └────────┬──────────────────────────┘         │
│           │                                     │
│           │ Transform to Answer[]               │
│           │                                     │
│           ├─POST /api/grade─────────────────────┼──┐
│           │                                     │  │
│  ┌────────▼──────────────────────────┐         │  │
│  │  results/page.tsx                 │         │  │
│  │  - Display GradeResponse          │         │  │
│  │  - Per-question feedback          │         │  │
│  └───────────────────────────────────┘         │  │
└─────────────────────────────────────────────────┘  │
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Hono)                         │
│                                                     │
│  ┌───────────────────────────────────┐             │
│  │  POST /api/grade                  │             │
│  │  1. Parse JSON body               │             │
│  │  2. Validate with Zod ✓           │             │
│  │  3. Call grading logic            │             │
│  │  4. Return GradeResponse          │             │
│  └────────┬──────────────────────────┘             │
│           │                                         │
│  ┌────────▼──────────────────────────┐             │
│  │  grading.ts (Pure Functions)      │             │
│  │  - gradeTextQuestion()            │             │
│  │  - gradeRadioQuestion()           │             │
│  │  - gradeCheckboxQuestion()        │             │
│  │  - gradeQuiz() [orchestrator]     │             │
│  └────────┬──────────────────────────┘             │
│           │                                         │
│  ┌────────▼──────────────────────────┐             │
│  │  questions.ts (Data)              │             │
│  │  - Question[] (with answer keys)  │             │
│  └───────────────────────────────────┘             │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack Rationale

| Technology | Rationale |
|------------|-----------|
| **Zod** | Runtime validation, type inference, clear error messages |
| **SessionStorage** | Simple state passing without global state management |
| **Pure Functions** | Testable grading logic, no side effects |
| **Hono POST routes** | Built-in JSON parsing, clean error handling |

---

## Key Learnings & Insights

### What Worked Well:
- **Zod validation** - caught malformed requests before hitting business logic
- **Pure functions for grading** - easy to reason about, easy to test
- **Type-first approach** - types defined before implementation prevented bugs
- **SessionStorage for results** - avoided premature state management complexity

### What Could Be Improved:
- **No partial credit** for checkbox questions - could be more forgiving
- **Text matching is strict** - could support multiple acceptable answers
- **SessionStorage is fragile** - cleared on tab close, not ideal for production
- **No answer validation on frontend** - could warn about unanswered questions

### Decisions That Paid Off:
1. **Separate grading functions per type** - clean, testable, follows SRP
2. **Zod safeParse** - graceful validation failures with detailed errors
3. **Type guards in grading functions** - prevents runtime type errors
4. **String coercion for ID comparison** - handles both string and number IDs seamlessly

### Technical Insights:
- **Array sorting for checkboxes** - order-independent comparison is more user-friendly
- **Validation at API boundary** - fail fast, protect business logic
- **Missing answers default to false** - simpler than special handling
- **Error granularity** - 400 vs 500 helps debugging

---

## API Contract Compliance

### POST /api/grade

**Request Format:** ✅
```typescript
{
  answers: Array<{
    id: string | number,
    value: string | number | number[]
  }>
}
```

**Response Format (200):** ✅
```typescript
{
  score: number,
  total: number,
  results: Array<{
    id: string | number,
    correct: boolean
  }>
}
```

**Response Format (400):** ✅
```typescript
{
  error: string,
  details?: unknown
}
```

**Validation:** ✅ Invalid payloads return 400 status code with error details
