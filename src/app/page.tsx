'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientQuestion, Answer } from '@/types/quiz';
import QuizQuestion from '@/components/QuizQuestion';

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | number[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load quiz');
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (id: string, value: string | number | number[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

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

      // Store results in sessionStorage to display on results page
      sessionStorage.setItem('quizResults', JSON.stringify(data));
      router.push('/results');
    } catch (err) {
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Aviation Quiz</h1>
          <p className="text-slate-600">Test your aviation knowledge with {questions.length} questions</p>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <QuizQuestion
                    question={question}
                    value={answers[question.id] || (question.type === 'checkbox' ? [] : '')}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
