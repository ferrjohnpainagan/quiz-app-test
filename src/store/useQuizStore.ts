import { generateSeed, shuffleQuestions } from "@/lib/utils/shuffle"
import {
  Answer,
  ClientQuestion,
  GradeResponse,
  ShuffleMapping,
} from "@/types/quiz"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const TIME_LIMIT = 5 * 60 * 1000 // 5 minutes in milliseconds

interface QuizState {
  // Quiz data
  questions: ClientQuestion[]
  originalQuestions: ClientQuestion[] // Store original for results page
  answers: Record<string, string | number | number[]>
  results: GradeResponse | null

  // Shuffle state
  seed: string | null
  shuffleMapping: ShuffleMapping | null

  // Timer state
  startedAt: number | null // Unix timestamp
  timeLimit: number

  // UI state
  loading: boolean
  error: string | null
  submitting: boolean
  quizStarted: boolean
}

interface QuizActions {
  // Quiz actions
  fetchQuestions: () => Promise<void>
  setAnswer: (id: string, value: string | number | number[]) => void
  submitQuiz: () => Promise<void>
  resetQuiz: () => void

  // Timer actions
  startQuiz: () => void
  getTimeRemaining: () => number
  isTimeExpired: () => boolean
}

type QuizStore = QuizState & QuizActions

const initialState: QuizState = {
  questions: [],
  originalQuestions: [],
  answers: {},
  results: null,
  seed: null,
  shuffleMapping: null,
  startedAt: null,
  timeLimit: TIME_LIMIT,
  loading: false,
  error: null,
  submitting: false,
  quizStarted: false,
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch questions from API
      fetchQuestions: async () => {
        set({ loading: true, error: null })
        try {
          const res = await fetch("/api/quiz")
          if (!res.ok) throw new Error("Failed to load quiz")

          const data = await res.json()
          const originalQuestions = data.questions

          // Generate seed and shuffle questions
          const seed = generateSeed()
          const { shuffled, mapping } = shuffleQuestions(
            originalQuestions,
            seed
          )

          set({
            questions: shuffled, // Display shuffled version
            originalQuestions, // Keep original for results page
            seed,
            shuffleMapping: mapping,
            loading: false,
          })
        } catch (err) {
          set({ error: "Failed to load quiz", loading: false })
        }
      },

      // Start the quiz timer
      startQuiz: () => {
        const now = Date.now()
        set({
          startedAt: now,
          quizStarted: true,
          answers: {}, // Reset answers when starting new quiz
          results: null,
          error: null,
        })
      },

      // Set answer for a question
      setAnswer: (id, value) => {
        set((state) => ({
          answers: { ...state.answers, [id]: value },
        }))
      },

      // Calculate remaining time in milliseconds
      getTimeRemaining: () => {
        const { startedAt, timeLimit } = get()
        if (!startedAt) return timeLimit

        const elapsed = Date.now() - startedAt
        const remaining = timeLimit - elapsed
        return Math.max(0, remaining)
      },

      // Check if time has expired
      isTimeExpired: () => {
        return get().getTimeRemaining() === 0
      },

      // Submit quiz answers
      submitQuiz: async () => {
        const { answers, startedAt, shuffleMapping } = get()

        if (!startedAt) {
          set({ error: "Quiz not started" })
          return
        }

        set({ submitting: true, error: null })

        try {
          // Transform answers to API format
          const answerArray: Answer[] = Object.entries(answers).map(
            ([id, value]) => ({
              id,
              value,
            })
          )

          const res = await fetch("/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: answerArray,
              startedAt, // Send timestamp for backend validation
              shuffleMapping, // Send shuffle mapping for index translation
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Failed to submit quiz")
          }

          set({
            results: data,
            submitting: false,
            quizStarted: false, // Quiz is complete
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to submit quiz",
            submitting: false,
          })
        }
      },

      // Reset quiz to initial state
      resetQuiz: () => {
        set(initialState)
      },
    }),
    {
      name: "quiz-storage", // localStorage key
      // Persist quiz state but not loading/error/submitting
      partialize: (state) => ({
        startedAt: state.startedAt,
        answers: state.answers,
        quizStarted: state.quizStarted,
        questions: state.questions,
        originalQuestions: state.originalQuestions,
        seed: state.seed,
        shuffleMapping: state.shuffleMapping,
      }),
    }
  )
)
