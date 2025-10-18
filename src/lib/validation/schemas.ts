import { Question } from "@/types/quiz"
import { z } from "zod"

// Security constants
const MAX_TEXT_LENGTH = 500
const MAX_CHECKBOX_SELECTIONS = 10
const MAX_ANSWERS = 20
const VALID_QUESTION_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

// Sanitize text input to prevent XSS
function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "") // Remove angle brackets to prevent script tags
    .trim()
    .slice(0, MAX_TEXT_LENGTH)
}

// Enhanced answer schema with security measures
export const answerSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .refine((id) => VALID_QUESTION_IDS.includes(String(id)), {
      message: "Invalid question ID",
    }),
  value: z.union([
    z
      .string()
      .max(MAX_TEXT_LENGTH, "Text answer too long")
      .transform(sanitizeText),
    z
      .number()
      .int("Answer must be an integer")
      .min(0, "Answer cannot be negative")
      .max(10, "Answer index out of bounds"),
    z
      .array(z.number().int().min(0).max(10))
      .max(MAX_CHECKBOX_SELECTIONS, "Too many selections"),
  ]),
})

// Shuffle mapping schemas
const choiceMappingSchema = z.object({
  questionId: z.string(),
  originalToShuffled: z.record(z.string(), z.number()),
  shuffledToOriginal: z.record(z.string(), z.number()),
})

const shuffleMappingSchema = z.object({
  seed: z.string().uuid("Invalid seed format"),
  questionOrder: z.array(z.string()),
  choiceMappings: z.array(choiceMappingSchema),
})

// Enhanced grade request schema with timestamp validation
export const gradeRequestSchema = z.object({
  answers: z
    .array(answerSchema)
    .min(1, "At least one answer required")
    .max(MAX_ANSWERS, "Too many answers"),
  startedAt: z
    .number()
    .int("Start time must be an integer")
    .positive("Start time must be positive"),
  shuffleMapping: shuffleMappingSchema.optional(), // Optional for backwards compatibility
})

// Validate that answer types match question types
export function validateAnswerTypes(
  answers: Array<{ id: string | number; value: string | number | number[] }>,
  questions: Question[]
): { valid: boolean; error?: string } {
  for (const answer of answers) {
    const question = questions.find((q) => String(q.id) === String(answer.id))

    if (!question) {
      return { valid: false, error: `Question ${answer.id} not found` }
    }

    const { type } = question
    const { value } = answer

    if (type === "text" && typeof value !== "string") {
      return {
        valid: false,
        error: `Question ${answer.id} expects text answer`,
      }
    }

    if (type === "radio" && typeof value !== "number") {
      return {
        valid: false,
        error: `Question ${answer.id} expects number answer`,
      }
    }

    if (type === "checkbox" && !Array.isArray(value)) {
      return {
        valid: false,
        error: `Question ${answer.id} expects array answer`,
      }
    }
  }

  return { valid: true }
}
