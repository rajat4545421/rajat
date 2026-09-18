import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Check, Download, Volume2, VolumeX, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface SummaryViewProps {
  summary: string;
  noteTitle: string;
  subject: string;
  isGeneratingKit: boolean;
  onGenerateStudyKit: () => void;
  onGoToFlashcards: () => void;
  hasStudyKit: boolean;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  summary,
  noteTitle,
  subject,
  isGeneratingKit,
  onGenerateStudyKit,
  onGoToFlashcards,
  hasStudyKit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.toLowerCase().replace(/\s+/g, '-')}-zygard-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Clean markdown tags for natural speech
      const plainText = summary
        .replace(/[#*`_~[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 3000));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!summary) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-800">
            Zygard Study Summary will appear here
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Click <strong>"Summarize with Zygard"</strong> above to extract high-yield concepts, exam pitfalls, and memory mnemonics tailored for your test preparation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Zygard Exam Synthesis
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-slate-600">{subject}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSpeech}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
              isSpeaking
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
            title={isSpeaking ? 'Stop voice reading' : 'Read summary aloud'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 transition"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 transition"
            title="Download as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .md</span>
          </button>
        </div>
      </div>

      {/* Rendered Markdown Body */}
      <div className="p-6 sm:p-8">
        <div className="markdown-body">
          <Markdown>{summary}</Markdown>
        </div>
      </div>

      {/* Footer Banner to transition to Study Kit */}
      <div className="bg-emerald-50/70 border-t border-emerald-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-emerald-900">
          <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Ready to test your active recall on this material?
          </span>
        </div>

        {hasStudyKit ? (
          <button
            onClick={onGoToFlashcards}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg shadow-2xs transition"
          >
            <span>Practice Active Recall Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onGenerateStudyKit}
            disabled={isGeneratingKit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg shadow-2xs transition disabled:opacity-50"
          >
            <span>Generate Flashcards & Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
