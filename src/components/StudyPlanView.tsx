import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, AlertTriangle, BookOpen, Sparkles, Clock, Search } from 'lucide-react';
import { StudyPlanItem, ExamFocusArea, KeyTermOrFormula } from '../types';

interface StudyPlanViewProps {
  studyPlan: StudyPlanItem[];
  focusAreas: ExamFocusArea[];
  keyTerms: KeyTermOrFormula[];
  onTogglePlanItem: (id: string) => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  noteTitle: string;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  studyPlan,
  focusAreas,
  keyTerms,
  onTogglePlanItem,
  onGeneratePlan,
  isGenerating,
  noteTitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const completedSessions = studyPlan.filter((s) => s.completed).length;
  const progressPct = studyPlan.length > 0 ? Math.round((completedSessions / studyPlan.length) * 100) : 0;

  const filteredTerms = keyTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.exampleOrFormula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (studyPlan.length === 0 && focusAreas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Calendar className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            No Study Plan or Exam Matrix Generated Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Let Zygard organize a spaced revision schedule, identify high-yield focus areas, and compile a quick formula cheat sheet.
          </p>
        </div>
        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Building Revision Roadmap...' : 'Generate Exam Revision Plan'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Revision Countdown & Session Tracker */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Revision Schedule
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Exam Study Roadmap: {noteTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              {completedSessions} of {studyPlan.length} sessions completed
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {progressPct}% Ready
            </span>
          </div>
        </div>

        {/* Sessions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {studyPlan.map((session) => (
            <div
              key={session.id}
              onClick={() => onTogglePlanItem(session.id)}
              className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 select-none ${
                session.completed
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-amber-600 shrink-0"
              >
                {session.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {session.dayOrSession}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3" />
                    {session.durationMinutes} min
                  </span>
                </div>
                <h4 className={`text-xs font-semibold text-slate-700 ${session.completed ? 'line-through text-slate-400' : ''}`}>
                  {session.focusTopic}
                </h4>
                <p className={`text-xs text-slate-500 mt-1 leading-relaxed ${session.completed ? 'line-through text-slate-400' : ''}`}>
                  {session.studyAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. High-Yield Exam Focus & Traps Matrix */}
      {focusAreas.length > 0 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Exam Priorities
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              High-Yield Focus Areas & Trap Warnings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific areas test writers frequently target and tricky distinctions to avoid losing easy marks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {focusAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {area.topic}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      area.importance === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : area.importance === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {area.importance} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Exam Strategy:</strong> {area.examTips}
                </p>

                {area.pitfalls && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-xs text-rose-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Common Exam Trap:</strong> {area.pitfalls}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Formulas & Key Terminology Cheat Sheet */}
      {keyTerms.length > 0 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Quick Reference
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Key Formulas & Terminology Glossary
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search formulas or terms..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th className="py-2.5 px-3 font-bold w-1/4">Term / Concept</th>
                  <th className="py-2.5 px-3 font-bold w-1/2">Definition & Meaning</th>
                  <th className="py-2.5 px-3 font-bold w-1/4">Formula / Exam Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTerms.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 align-top">
                      {t.term}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 leading-relaxed align-top">
                      {t.definition}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-teal-800 bg-teal-50/30 rounded-md align-top">
                      {t.exampleOrFormula}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
