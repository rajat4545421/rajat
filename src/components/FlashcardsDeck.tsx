import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Layers, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb, Shuffle, Sparkles } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsDeckProps {
  flashcards: Flashcard[];
  onUpdateFlashcardStatus: (id: string, status: 'mastered' | 'review_again') => void;
  onGenerateCards: () => void;
  isGenerating: boolean;
  noteTitle: string;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({
  flashcards,
  onUpdateFlashcardStatus,
  onGenerateCards,
  isGenerating,
  noteTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<'all' | 'need_review' | 'mastered'>('all');

  const filteredCards = flashcards.filter((card) => {
    if (filter === 'mastered') return card.status === 'mastered';
    if (filter === 'need_review') return card.status === 'review_again';
    return true;
  });

  // Clamp index if filteredCards changes
  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  useEffect(() => {
    if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filter, filteredCards.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handlePrev();
      } else if (e.code === 'Digit1') {
        if (activeCard) handleMark('review_again');
      } else if (e.code === 'Digit2') {
        if (activeCard) handleMark('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length, activeCard]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleMark = (status: 'mastered' | 'review_again') => {
    if (!activeCard) return;
    onUpdateFlashcardStatus(activeCard.id, status);

    // If all cards mastered, trigger celebratory confetti!
    const masteredCount = flashcards.filter((c) => c.status === 'mastered').length + (status === 'mastered' && activeCard.status !== 'mastered' ? 1 : 0);
    if (masteredCount === flashcards.length && flashcards.length > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  const masteredCount = flashcards.filter((c) => c.status === 'mastered').length;
  const reviewCount = flashcards.filter((c) => c.status === 'review_again').length;
  const masteryPercentage = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  if (flashcards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Layers className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            No Flashcards Generated Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Zygard can analyze your notes and formulate active-recall flashcards with high-yield questions and custom mnemonics.
          </p>
        </div>
        <button
          onClick={onGenerateCards}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Building Flashcards...' : 'Generate Flashcards from Notes'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Progress */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Active Recall Trainer
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {noteTitle || 'Study Topic Flashcards'}
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => { setFilter('all'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              All ({flashcards.length})
            </button>
            <button
              onClick={() => { setFilter('need_review'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'need_review' ? 'bg-white text-amber-800 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Review ({reviewCount})
            </button>
            <button
              onClick={() => { setFilter('mastered'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'mastered' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Recall Retention Progress</span>
            <span className="text-emerald-700 font-bold">{masteryPercentage}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Flashcard 3D Stage */}
      {filteredCards.length > 0 && activeCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px] flex items-stretch"
          >
            <div
              className={`relative w-full rounded-2xl transition-all duration-300 transform-gpu p-8 flex flex-col justify-between border ${
                isFlipped
                  ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-emerald-300 shadow-md ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Card Top Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {activeCard.topic || 'Concept'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      activeCard.difficulty === 'hard'
                        ? 'bg-rose-50 text-rose-700'
                        : activeCard.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {activeCard.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card Center Content */}
              <div className="my-auto py-6 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  {isFlipped ? 'Answer & Explanation' : 'Active Recall Question'}
                </span>
                <p className={`font-semibold text-slate-900 leading-relaxed ${isFlipped ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl font-bold'}`}>
                  {isFlipped ? activeCard.answer : activeCard.question}
                </p>

                {/* Memory Hook / Tip if flipped */}
                {isFlipped && activeCard.memoryTip && (
                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-left max-w-lg">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Zygard Mnemonic:</strong> {activeCard.memoryTip}</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Prompt */}
              <div className="text-center text-xs text-slate-400 font-medium">
                {isFlipped ? 'Click card to see question' : 'Click card (or press Space) to flip'}
              </div>
            </div>
          </div>

          {/* Interactive Navigation & Rating Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            {/* Prev / Next controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Previous Card (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Flip Card (Space)
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Next Card (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Knowledge Self-Assessment Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleMark('review_again')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeCard.status === 'review_again'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 ring-1 ring-rose-300'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                }`}
                title="Shortcut: Press '1'"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Need Review (1)</span>
              </button>

              <button
                onClick={() => handleMark('mastered')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeCard.status === 'mastered'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                }`}
                title="Shortcut: Press '2'"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered! (2)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No cards found for filter "{filter}".
          <button
            onClick={() => setFilter('all')}
            className="ml-2 font-bold text-emerald-600 hover:underline"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
};
