"use client"

import ConfirmModal from "@/components/ConfirmModal"
import { useQuizStore } from "@/store/useQuizStore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StartPage() {
  const router = useRouter()
  const { fetchQuestions, startQuiz, loading, error, questions } =
    useQuizStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions()
    }
  }, [questions.length, fetchQuestions])

  const handleStartClick = () => {
    setShowModal(true)
  }

  const handleConfirmStart = () => {
    startQuiz()
    router.push("/quiz")
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#E6EED6" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BBC5AA] border-t-[#A72608] rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[#090C02] font-medium">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#E6EED6" }}
      >
        <div className="max-w-md w-full bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-[#DDE2C6]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#090C02] mb-2">
              Unable to Load Quiz
            </h2>
            <p className="text-[#090C02]/70 mb-6">{error}</p>
            <button
              onClick={() => fetchQuestions()}
              className="w-full bg-[#A72608] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#8B1F07] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const modalMessage = `
• **10 questions** covering aviation topics
• **5 minutes** to complete — timer starts when you begin
• Mix of **text, multiple choice, and checkbox** questions
• Quiz **auto-submits** when time expires
• Your progress **saves automatically** if you refresh

**Pro tip:** Text answers are case-insensitive. Take your time and double-check before submitting!
  `.trim()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 pb-24 sm:pb-8"
      style={{ background: "#E6EED6" }}
    >
      <div className="max-w-2xl w-full">
        {/* Header Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 border border-[#DDE2C6] mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#BBC5AA] to-[#DDE2C6] rounded-2xl mb-6 shadow-md">
              <svg
                className="w-10 h-10 text-[#090C02]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#090C02] mb-3">
              Aviation Quiz
            </h1>
            <p className="text-lg text-[#090C02]/70 font-light mb-8">
              Test your knowledge of aircraft and flight operations
            </p>

            {/* Desktop Start Button - Hidden on mobile */}
            <button
              onClick={handleStartClick}
              className="hidden sm:block w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-[#8B1F07] hover:to-[#6B1505] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Quiz
            </button>

            {/* Footer Note */}
            <p className="text-center text-sm text-[#090C02]/50 mt-6 font-light">
              Once started, the timer cannot be paused
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Start Button - Fixed at bottom on mobile, hidden on desktop */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#E6EED6] via-[#E6EED6] to-transparent">
        <button
          onClick={handleStartClick}
          className="w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-[#8B1F07] hover:to-[#6B1505] active:scale-[0.98] transition-all duration-200 shadow-xl"
        >
          Start Quiz
        </button>
      </div>

      {/* Instructions Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmStart}
        title="Ready to start?"
        message={modalMessage}
        type="info"
        confirmText="Start Quiz"
        cancelText="Cancel"
      />
    </div>
  )
}
