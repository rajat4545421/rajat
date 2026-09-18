import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle, RotateCcw, Sparkles, Send, Award, FileEdit } from 'lucide-react';
import { QuizQuestion } from '../types';
import { formatCleanErrorMessage } from '../utils/errorUtils';

interface ExamQuizProps {
  quiz: QuizQuestion[];
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  noteTitle: string;
}

interface GradedResult {
  score: number;
  maxScore: number;
  verdict: string;
  strengths: string[];
  missedConcepts: string[];
  modelAnswer: string;
  zygardTip: string;
}

export const ExamQuiz: React.FC<ExamQuizProps> = ({
  quiz,
  onGenerateQuiz,
  isGenerating,
  noteTitle,
}) => {
  const [activeMode, setActiveMode] = useState<'mcq' | 'frq'>('mcq');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // FRQ practice state
  const [frqQuestion, setFrqQuestion] = useState(
    'Explain the primary rate-limiting step of this process and how it is allosterically regulated during cellular or real-world conditions.'
  );
  const [studentWrittenAnswer, setStudentWrittenAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradedResult | null>(null);

  const currentQuestion = quiz[currentIdx];

  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion || userAnswers[currentQuestion.id] !== undefined) return;

    const newAnswers = {
      ...userAnswers,
      [currentQuestion.id]: optionIdx,
    };
    setUserAnswers(newAnswers);

    // If finished all questions, trigger confetti if score >= 80%
    if (Object.keys(newAnswers).length === quiz.length && quiz.length > 0) {
      let correct = 0;
      quiz.forEach((q) => {
        if (newAnswers[q.id] === q.correctOptionIndex) correct++;
      });
      if (correct / quiz.length >= 0.8) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCurrentIdx(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionIndex) correct++;
    });
    return {
      correct,
      total: quiz.length,
      percentage: quiz.length > 0 ? Math.round((correct / quiz.length) * 100) : 0,
    };
  };

  const handleGradeFRQ = async () => {
    if (!studentWrittenAnswer.trim()) return;
    setIsGrading(true);
    setGradeResult(null);

    try {
      const res = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: frqQuestion,
          idealAnswer: noteTitle,
          studentAnswer: studentWrittenAnswer,
          maxScore: 10,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGradeResult(data);
      if (data.score >= 8) {
        confetti({ particleCount: 60, spread: 50 });
      }
    } catch (err) {
      console.error(err);
      alert(formatCleanErrorMessage(err, 'Failed to grade answer. Please try again.'));
    } finally {
      setIsGrading(false);
    }
  };

  if (quiz.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            No Exam Questions Ready Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Have Zygard create realistic multiple-choice exam questions designed to test trick concepts, critical distinctions, and application problems.
          </p>
        </div>
        <button
          onClick={onGenerateQuiz}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing Exam...' : 'Generate Exam Quiz from Notes'}</span>
        </button>
      </div>
    );
  }

  const scoreStats = calculateScore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Quiz Mode Switcher */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMode('mcq')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeMode === 'mcq'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Multiple Choice Mock Exam ({quiz.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('frq')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeMode === 'frq'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>AI Free-Response Answer Grader</span>
          </button>
        </div>

        {activeMode === 'mcq' && (
          <button
            onClick={handleResetQuiz}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {activeMode === 'mcq' ? (
        <div className="space-y-5">
          {/* Question Index Navigator Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {quiz.map((q, i) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correctOptionIndex;
                const isCurrent = i === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 border-indigo-500 font-extrabold'
                        : ''
                    } ${
                      !isAnswered
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-slate-600 flex items-center gap-3">
              <span>
                Answered: {Object.keys(userAnswers).length} / {quiz.length}
              </span>
              <span className="text-indigo-700 font-bold">
                Score: {scoreStats.correct} ({scoreStats.percentage}%)
              </span>
            </div>
          </div>

          {/* Current Question Stage */}
          {currentQuestion && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                  Question {currentIdx + 1} of {quiz.length} • {currentQuestion.topic || 'Exam Focus'}
                </span>
                {userAnswers[currentQuestion.id] !== undefined && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full ${
                      userAnswers[currentQuestion.id] === currentQuestion.correctOptionIndex
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {userAnswers[currentQuestion.id] === currentQuestion.correctOptionIndex ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <p className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  const isAnswered = userAnswers[currentQuestion.id] !== undefined;
                  const isCorrect = optIdx === currentQuestion.correctOptionIndex;

                  let optionStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800';
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-300';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  const optLetter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${optionStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-xs font-bold shrink-0 text-slate-700 shadow-2xs">
                        {optLetter}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Traps Reveal */}
              {userAnswers[currentQuestion.id] !== undefined && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Zygard Exam Explanation:</span>
                  </div>
                  <p className="text-indigo-900 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>

                  {currentQuestion.whyOthersAreWrong && (
                    <p className="text-slate-600 pt-1 border-t border-indigo-100/60">
                      <strong>Exam Trap:</strong> {currentQuestion.whyOthersAreWrong}
                    </p>
                  )}
                </div>
              )}

              {/* Next / Prev buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous Question
                </button>

                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(quiz.length - 1, prev + 1))}
                  disabled={currentIdx === quiz.length - 1}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-2xs disabled:opacity-40"
                >
                  Next Question
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FRQ Written Grader Tab */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Exam Free-Response Question Practice
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Practice Writing High-Scoring Written Answers
            </h3>
            <p className="text-xs text-slate-500">
              Professors look for specific key terminology and causal logic. Type your answer below and Zygard will evaluate it with a rubric score, pointing out missed concepts and a 10/10 model response.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Target Exam Prompt:
            </label>
            <input
              type="text"
              value={frqQuestion}
              onChange={(e) => setFrqQuestion(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Your Written Answer:
            </label>
            <textarea
              rows={6}
              value={studentWrittenAnswer}
              onChange={(e) => setStudentWrittenAnswer(e.target.value)}
              placeholder="Write your explanation as you would on a real exam..."
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <button
            onClick={handleGradeFRQ}
            disabled={isGrading || !studentWrittenAnswer.trim()}
            className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isGrading ? (
              <span>Zygard is grading your exam answer...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Grade My Response with Zygard</span>
              </>
            )}
          </button>

          {gradeResult && (
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">
                    Exam Evaluation: {gradeResult.verdict}
                  </span>
                </div>
                <span className="text-base font-extrabold text-indigo-700">
                  {gradeResult.score} / {gradeResult.maxScore} pts
                </span>
              </div>

              {gradeResult.strengths?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1">
                    ✓ Strong Points & Credit Earned:
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {gradeResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {gradeResult.missedConcepts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase mb-1">
                    ✗ Missing Keywords / Deductions:
                  </h4>
                  <ul className="list-disc list-inside text-xs text-rose-700 space-y-1">
                    {gradeResult.missedConcepts.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {gradeResult.modelAnswer && (
                <div className="bg-white p-4 rounded-xl border border-indigo-100 text-xs">
                  <span className="font-bold text-slate-900 block mb-1">
                    🌟 Model 10/10 Exam Answer:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{gradeResult.modelAnswer}</p>
                </div>
              )}

              {gradeResult.zygardTip && (
                <div className="text-xs text-indigo-900 font-medium bg-amber-50 p-3 rounded-lg border border-amber-200">
                  💡 <strong>Exam Strategy Tip:</strong> {gradeResult.zygardTip}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
