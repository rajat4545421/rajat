import React from 'react';
import { Sparkles, BookOpen, Layers, HelpCircle, Calendar, MessageSquareText, PlusCircle, CheckCircle2, User, Settings, Camera, Atom, GraduationCap } from 'lucide-react';
import { UserProfile } from '../types';
import { RajatHallmark } from './RajatHallmark';

interface NavbarProps {
  activeTab: 'notes' | 'equations' | 'flashcards' | 'quiz' | 'plan' | 'scan';
  setActiveTab: (tab: 'notes' | 'equations' | 'flashcards' | 'quiz' | 'plan' | 'scan') => void;
  onNewNote: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  notesCount: number;
  masteryPercent: number;
  hasStudyKit: boolean;
  userProfile: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenFacultyLounge?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewNote,
  onOpenChat,
  isChatOpen,
  notesCount,
  masteryPercent,
  hasStudyKit,
  userProfile,
  onOpenAuthModal,
  onOpenFacultyLounge,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name & Rajat Hallmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Zygard
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Study Bot
                </span>
                <div className="hidden xl:block">
                  <RajatHallmark variant="badge" />
                </div>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Summarize notes • 4 AI Professors • Equations & Reactions • Active Recall
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="tab-notes-btn"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Notes</span>
            </button>

            <button
              id="tab-equations-btn"
              onClick={() => setActiveTab('equations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'equations'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive Equation & Chemical Reaction Explainer"
            >
              <Atom className="w-4 h-4 text-emerald-600" />
              <span>Equations</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded uppercase tracking-wider">
                New
              </span>
            </button>

            <button
              id="tab-scan-btn"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'scan'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Scan Question</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded uppercase tracking-wider">
                AI
              </span>
            </button>

            <button
              id="tab-flashcards-btn"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Flashcards</span>
              {hasStudyKit && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              id="tab-quiz-btn"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Exam Quiz</span>
            </button>

            <button
              id="tab-plan-btn"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'plan'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Plan</span>
            </button>
          </nav>

          {/* Right Action: 4 Professors Lounge + Student Profile + Recall stats + New Note + Ask Zygard */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* AI Faculty Lounge Button */}
            {onOpenFacultyLounge && (
              <button
                onClick={onOpenFacultyLounge}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs transition shadow-2xs"
                title="Meet the 4 Specialized AI Professors (Kevin, Max, Steve, Elena)"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                <span>4 AI Professors</span>
              </button>
            )}

            {/* Student Profile / Sign In Pill */}
            {userProfile ? (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-800 transition shadow-2xs group"
                title="Manage Your Study Profile & Enrolled Subjects"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-bold text-slate-900 leading-none">
                    {userProfile.username}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 max-w-[110px] truncate">
                    {userProfile.subjects.length} Subjects
                  </div>
                </div>
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign In / Profile</span>
              </button>
            )}

            {/* Recall Mastery badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-800">{masteryPercent}%</span>
            </div>

            <button
              id="navbar-new-note-btn"
              onClick={onNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition"
              title="Add or paste fresh notes"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">New Note</span>
            </button>

            <button
              id="navbar-chat-toggle-btn"
              onClick={onOpenChat}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all ${
                isChatOpen
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Ask Zygard</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 space-x-1 justify-between overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'notes' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('equations')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'equations' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Atom className="w-3 h-3 text-emerald-600" />
            <span>Equations</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'scan' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Camera className="w-3 h-3 text-emerald-600" />
            <span>Scan Question</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'flashcards' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'quiz' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Exam Quiz
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'plan' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Plan
          </button>
        </div>
      </div>
    </header>
  );
};

