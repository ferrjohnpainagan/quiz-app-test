"use client"

import ConfirmModal from "@/components/ConfirmModal"
import QuizQuestion from "@/components/QuizQuestion"
import Timer from "@/components/Timer"
import { useQuizStore } from "@/store/useQuizStore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function QuizPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info" as "warning" | "info",
  })

  const {
    questions,
    answers,
    quizStarted,
    startedAt,
    submitting,
    error,
    setAnswer,
    submitQuiz,
    isTimeExpired,
  } = useQuizStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!quizStarted || !startedAt) {
      router.push("/start")
      return
    }

    if (isTimeExpired()) {
      router.push("/start")
      return
    }
  }, [quizStarted, startedAt, router, isTimeExpired, mounted])

  const checkAnsweredQuestions = () => {
    const answered = questions.filter((q) => {
      const answer = answers[q.id]
      if (answer === undefined || answer === null || answer === "") return false
      if (Array.isArray(answer) && answer.length === 0) return false
      return true
    })
    return answered
  }

  const handleSubmitClick = () => {
    const answeredQuestions = checkAnsweredQuestions()

    // Block submission if no questions are answered
    if (answeredQuestions.length === 0) {
      setModalConfig({
        title: "No Answers Provided",
        message: "You must answer at least one question before submitting.",
        type: "warning",
      })
      setShowModal(true)
      return
    }

    // Warn if some questions are unanswered, but allow submission
    const unanswered = questions.length - answeredQuestions.length
    if (unanswered > 0) {
      setModalConfig({
        title: "Unanswered Questions",
        message: `You have ${unanswered} unanswered question${
          unanswered > 1 ? "s" : ""
        }. Submit anyway? Unanswered questions will be marked as incorrect.`,
        type: "warning",
      })
      setShowModal(true)
    } else {
      setModalConfig({
        title: "Submit Quiz?",
        message:
          "Are you sure you want to submit your quiz? You cannot change your answers after submission.",
        type: "info",
      })
      setShowModal(true)
    }
  }

  const handleConfirmSubmit = async () => {
    await submitQuiz()
    router.push("/results")
  }

  const handleModalClose = () => {
    const answeredQuestions = checkAnsweredQuestions()
    // Only close modal if at least one question is answered (allows "Go Back")
    // Or if user hasn't tried to submit yet (allows "Cancel" on info modal)
    setShowModal(false)
  }

  if (!mounted || !quizStarted || !startedAt) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#E6EED6" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BBC5AA] border-t-[#A72608] rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[#090C02] font-medium">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-24 sm:pb-0"
      style={{ background: "#E6EED6" }}
    >
      {/* Sticky Header with Timer */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#DDE2C6] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#090C02]">
              Aviation Quiz
            </h1>
            <p className="text-sm text-[#090C02]/60">
              {questions.length} questions · Answer all before time runs out
            </p>
          </div>
          <Timer />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm">
            <div className="flex items-start gap-3 text-red-800">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-[#DDE2C6] p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#BBC5AA] to-[#DDE2C6] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <QuizQuestion
                    question={question}
                    value={
                      answers[question.id] ||
                      (question.type === "checkbox" ? [] : "")
                    }
                    onChange={(value) => setAnswer(question.id, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Submit Button - Hidden on mobile */}
        <div className="hidden sm:block mt-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-[#DDE2C6] p-6">
          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl hover:from-[#8B1F07] hover:to-[#6B1505] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
          <p className="text-center text-sm text-[#090C02]/50 mt-4 font-light">
            Quiz will auto-submit when time expires
          </p>
        </div>
      </div>

      {/* Sticky Mobile Submit Button - Fixed at bottom on mobile, hidden on desktop */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#E6EED6] via-[#E6EED6] to-transparent">
        <button
          onClick={handleSubmitClick}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#A72608] to-[#8B1F07] text-white font-semibold py-4 px-8 rounded-xl hover:from-[#8B1F07] hover:to-[#6B1505] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-xl"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={handleModalClose}
        onConfirm={
          modalConfig.title === "No Answers Provided"
            ? handleModalClose
            : handleConfirmSubmit
        }
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={
          modalConfig.title === "No Answers Provided" ? "OK" : "Submit"
        }
        cancelText={
          modalConfig.title === "No Answers Provided" ? undefined : "Go Back"
        }
      />
    </div>
  )
}
