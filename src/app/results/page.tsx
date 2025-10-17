'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GradeResponse } from '@/types/quiz';

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

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.total) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Quiz Results</h1>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {results.score}/{results.total}
              </div>
              <div className="text-xl text-slate-600">
                {percentage}% Correct
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Results by Question:</h3>
            <div className="space-y-2">
              {results.results.map((result) => (
                <div
                  key={result.id}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    result.correct
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      result.correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {result.correct ? '✓' : '✗'}
                  </span>
                  <span className="text-slate-700">
                    Question {result.id}: {result.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
