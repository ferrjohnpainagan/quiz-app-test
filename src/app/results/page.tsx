"use client"

import { useQuizStore } from "@/store/useQuizStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Results() {
  const router = useRouter()
  const { results, resetQuiz } = useQuizStore()

  useEffect(() => {
    if (!results) {
      router.push("/start")
    }
  }, [results, router])

  const handleRetake = () => {
    resetQuiz()
    router.push("/start")
  }

  if (!results) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#E6EED6" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BBC5AA] border-t-[#A72608] rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[#090C02] font-medium">Loading results...</p>
        </div>
      </div>
    )
  }

  const percentage = Math.round((results.score / results.total) * 100)
  const isPassing = percentage >= 70

  return (
    <div
      className="min-h-screen py-6 sm:py-12 px-4 pb-24 sm:pb-12"
      style={{ background: "#E6EED6" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-10 border border-[#DDE2C6]">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-md ${
                isPassing
                  ? "bg-gradient-to-br from-green-400 to-green-500"
                  : "bg-gradient-to-br from-[#BBC5AA] to-[#DDE2C6]"
              }`}
            >
              {isPassing ? (
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 text-[#090C02]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#090C02] mb-3">
              {isPassing ? "Excellent Work!" : "Quiz Complete"}
            </h1>
            <p className="text-lg text-[#090C02]/70 font-light">
              {isPassing
                ? "You demonstrated strong aviation knowledge"
                : "Keep studying and try again soon"}
            </p>
          </div>

          {/* Score Display */}
          <div
            className={`rounded-2xl p-8 mb-8 border-2 shadow-sm ${
              isPassing
                ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
                : "bg-gradient-to-br from-[#DDE2C6]/30 to-[#BBC5AA]/20 border-[#BBC5AA]"
            }`}
          >
            <div className="text-center">
              <div
                className={`text-7xl sm:text-8xl font-bold mb-4 ${
                  isPassing ? "text-green-600" : "text-[#A72608]"
                }`}
              >
                {results.score}/{results.total}
              </div>
              <div className="text-3xl text-[#090C02] font-semibold mb-2">
                {percentage}%
              </div>
              <div className="text-sm text-[#090C02]/60 font-medium">
                {isPassing ? "✓ Passing score (70%+)" : "Passing score: 70%"}
              </div>
            </div>
          </div>

          {/* Question Results */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#090C02] mb-5">
              Question Breakdown
            </h3>
            <div className="space-y-3">
              {results.results.map((result, index) => (
                <div
                  key={result.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all border-2 ${
                    result.correct
                      ? "bg-green-50/50 border-green-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      result.correct
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {result.correct ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1">
                    <span
                      className={`text-lg font-medium ${
                        result.correct ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      Question {index + 1}
                    </span>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      result.correct ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Button - Hidden on mobile */}
          <button
            onClick={handleRetake}
            className="hidden sm:block w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-[#8B1F07] hover:to-[#6B1505] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Take Quiz Again
          </button>
        </div>
      </div>

      {/* Sticky Mobile Button - Fixed at bottom on mobile, hidden on desktop */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#E6EED6] via-[#E6EED6] to-transparent">
        <button
          onClick={handleRetake}
          className="w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-[#8B1F07] hover:to-[#6B1505] active:scale-[0.98] transition-all duration-200 shadow-xl"
        >
          Take Quiz Again
        </button>
      </div>
    </div>
  )
}
