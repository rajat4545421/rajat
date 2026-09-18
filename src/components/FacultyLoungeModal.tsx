import React from 'react';
import { X, Sparkles, BookOpen, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { AI_PROFESSORS, Professor } from '../data/professors';

interface FacultyLoungeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfessorId: Professor['id'];
  onSelectProfessor: (prof: Professor) => void;
  onStartChat: (prof: Professor, prompt?: string) => void;
}

export const FacultyLoungeModal: React.FC<FacultyLoungeModalProps> = ({
  isOpen,
  onClose,
  selectedProfessorId,
  onSelectProfessor,
  onStartChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
              🎓
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Zygard AI Faculty Lounge — 4 Specialized AI Professors
              </h2>
              <p className="text-xs text-slate-500">
                Each professor is specialized in their domain to break down complex problems and equations into intuitive steps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_PROFESSORS.map((prof) => {
              const isSelected = selectedProfessorId === prof.id;
              return (
                <div
                  key={prof.id}
                  className={`rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top line with Avatar and Subject */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${prof.theme.bgLight} border ${prof.theme.border}`}>
                          {prof.avatarEmoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">
                              {prof.name}
                            </h3>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                                Active Guide
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {prof.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {prof.bio}
                    </p>

                    {/* Specialties */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Domain Specialties:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prof.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${prof.theme.badge}`}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick sample prompt */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Try asking {prof.name}:
                      </div>
                      <div className="space-y-1">
                        {prof.sampleQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => {
                              onSelectProfessor(prof);
                              onStartChat(prof, q);
                              onClose();
                            }}
                            className="w-full text-left text-[11px] text-slate-600 hover:text-slate-950 hover:bg-slate-100 p-1.5 rounded-lg transition flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">• {q}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-800 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectProfessor(prof);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active Guide' : 'Set as Active Guide'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectProfessor(prof);
                        onStartChat(prof);
                        onClose();
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
