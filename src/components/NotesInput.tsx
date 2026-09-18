import React, { useRef } from 'react';
import { Sparkles, FileText, Upload, RefreshCw, Zap, BookmarkCheck, User, Settings, Camera } from 'lucide-react';
import { SummaryStyle, UserProfile } from '../types';
import { SAMPLE_NOTES } from '../data/sampleNotes';

interface NotesInputProps {
  title: string;
  setTitle: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  summaryStyle: SummaryStyle;
  setSummaryStyle: (val: SummaryStyle) => void;
  isSummarizing: boolean;
  isGeneratingKit: boolean;
  onSummarize: () => void;
  onGenerateStudyKit: () => void;
  onLoadSample: (sampleId: string) => void;
  userProfile?: UserProfile | null;
  onOpenProfileModal?: () => void;
  onOpenScanner?: () => void;
}

const DEFAULT_SUBJECT_OPTIONS = [
  'Biology / Biochemistry',
  'Computer Science',
  'History',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Economics & Business',
  'Psychology',
  'Literature',
  'General',
];

const STYLE_OPTIONS: { id: SummaryStyle; label: string; desc: string; icon: string }[] = [
  {
    id: 'high-yield',
    label: 'High-Yield Exam Synthesis',
    desc: 'Core pillars, high-frequency test traps, and memory mnemonics.',
    icon: '⚡',
  },
  {
    id: 'bullet-cheatsheet',
    label: 'Bullet Cheat Sheet',
    desc: 'Ultra-dense bullet points, formulas, definitions, and cause-effect rules.',
    icon: '📋',
  },
  {
    id: 'feynman',
    label: 'Feynman Technique',
    desc: 'Intuitive analogies, plain English breakdowns, eliminating jargon.',
    icon: '🧠',
  },
  {
    id: 'deep-dive',
    label: 'Deep Conceptual Breakdown',
    desc: 'Step-by-step mechanism analysis, derivations, and comprehensive logic.',
    icon: '🔍',
  },
  {
    id: 'cram-sheet',
    label: 'Night-Before Cram Sheet',
    desc: 'Top 20% most tested points that deliver 80% of test marks.',
    icon: '🌙',
  },
];

export const NotesInput: React.FC<NotesInputProps> = ({
  title,
  setTitle,
  subject,
  setSubject,
  content,
  setContent,
  summaryStyle,
  setSummaryStyle,
  isSummarizing,
  isGeneratingKit,
  onSummarize,
  onGenerateStudyKit,
  onLoadSample,
  userProfile,
  onOpenProfileModal,
  onOpenScanner,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine user enrolled subjects with defaults without duplicates
  const userEnrolled = userProfile?.subjects || [];
  const allSubjects = Array.from(new Set([...userEnrolled, ...DEFAULT_SUBJECT_OPTIONS]));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        if (!title.trim() || title === 'Untitled Note') {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Student Personalization Banner */}
      {userProfile && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Personalized for <strong>{userProfile.username}</strong> ({userProfile.educationLevel})
            </span>
            <span className="text-emerald-700 hidden md:inline">
              • Zygard adapts explanations & summaries to your enrolled subjects
            </span>
          </div>
          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Settings className="w-3 h-3" />
              <span>Change Subjects & Profile</span>
            </button>
          )}
        </div>
      )}

      {/* Top Controls: Title, Subject & Quick Presets */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Note Topic / Title
            </label>
            <input
              id="note-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cellular Respiration & ATP, Big-O Notation..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base"
            />
          </div>

          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Subject
              </label>
              {userEnrolled.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                  Your Enrolled List
                </span>
              )}
            </div>
            <select
              id="note-subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            >
              {userEnrolled.length > 0 && (
                <optgroup label="🌟 Your Enrolled Study Subjects">
                  {userEnrolled.map((sub) => (
                    <option key={`enrolled-${sub}`} value={sub}>
                      ★ {sub}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All Available Academic Disciplines">
                {allSubjects
                  .filter((s) => !userEnrolled.includes(s))
                  .map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            Try high-yield sample notes:
          </span>
          {SAMPLE_NOTES.map((s) => (
            <button
              key={s.id}
              onClick={() => onLoadSample(s.id)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200/80 transition"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Student Notes / Lecture Transcripts / Textbook Material
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {wordCount.toLocaleString()} words ({charCount.toLocaleString()} chars)
            </span>
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                title="Scan an exam question image or snap a photo with camera"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan Question</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-700 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .txt / .md
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="student-notes-textarea"
            rows={11}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your messy lecture notes, syllabus chapters, textbook excerpts, or discussion points here. Zygard will clean them up, summarize key mechanisms, and highlight exam traps..."
            className="w-full p-4 text-sm leading-relaxed font-sans text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-y"
          />
        </div>
      </div>

      {/* Summary Style Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Choose Summarization & Learning Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSummaryStyle(style.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                summaryStyle === style.id
                  ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{style.icon}</span>
                <span className="text-xs font-bold text-slate-800">{style.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          id="summarize-notes-btn"
          type="button"
          onClick={onSummarize}
          disabled={isSummarizing || isGeneratingKit || !content.trim()}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition"
        >
          {isSummarizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Zygard is synthesizing notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Summarize with Zygard</span>
            </>
          )}
        </button>

        <button
          id="generate-kit-btn"
          type="button"
          onClick={onGenerateStudyKit}
          disabled={isSummarizing || isGeneratingKit || !content.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs"
        >
          {isGeneratingKit ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              <span>Building Study Kit...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Generate Full Exam Kit (Cards + Quiz + Plan)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
