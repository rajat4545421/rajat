import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NotesInput } from './components/NotesInput';
import { SummaryView } from './components/SummaryView';
import { FlashcardsDeck } from './components/FlashcardsDeck';
import { ExamQuiz } from './components/ExamQuiz';
import { StudyPlanView } from './components/StudyPlanView';
import { ZygardChatDrawer } from './components/ZygardChatDrawer';
import { AuthModal } from './components/AuthModal';
import { RajatHallmark } from './components/RajatHallmark';
import { QuestionScannerView } from './components/QuestionScannerView';
import { EquationExplainerView } from './components/EquationExplainerView';
import { FacultyLoungeModal } from './components/FacultyLoungeModal';
import { Professor, getProfessorById } from './data/professors';
import { NoteItem, SummaryStyle, StudyKit, UserProfile, Flashcard } from './types';
import {
  loadSavedNotes,
  saveNotes,
  getActiveNoteId,
  setActiveNoteId,
  loadUserProfile,
  saveUserProfile,
} from './utils/storage';
import { SAMPLE_NOTES } from './data/sampleNotes';
import { formatCleanErrorMessage } from './utils/errorUtils';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeNoteId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notes' | 'equations' | 'flashcards' | 'quiz' | 'plan' | 'scan'>('notes');
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>('high-yield');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeProfessorId, setActiveProfessorId] = useState<Professor['id']>('kevin');
  const [isFacultyLoungeOpen, setIsFacultyLoungeOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Authentication & Student Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Operation states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    // 1. Load User Profile
    const savedUser = loadUserProfile();
    if (savedUser) {
      setUserProfile(savedUser);
      setIsAuthModalOpen(false);
    } else {
      // Opening Zygard app presents Sign Up / Sign In / Login via Google interface!
      setIsAuthModalOpen(true);
    }

    // 2. Load Notes
    const saved = loadSavedNotes();
    setNotes(saved);
    const savedActiveId = getActiveNoteId();
    if (savedActiveId && saved.some((n) => n.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else if (saved.length > 0) {
      setActiveId(saved[0].id);
    }
  }, []);

  // Sync notes to storage
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  // Sync active note id
  useEffect(() => {
    if (activeNoteId) {
      setActiveNoteId(activeNoteId);
    }
  }, [activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const updateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, ...updates } : n))
    );
  };

  // Handle successful Auth or Profile Customization
  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setIsAuthModalOpen(false);

    // If active note has generic subject, update to user's first subject
    if (profile.subjects && profile.subjects.length > 0 && activeNote) {
      if (activeNote.subject === 'General' || !activeNote.subject) {
        updateActiveNote({ subject: profile.subjects[0] });
      }
    }

    setStatusNotification({
      type: 'success',
      message: `Welcome, ${profile.username}! Zygard is calibrated to your ${profile.subjects.length} study subjects.`,
    });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleCreateNewNote = () => {
    const defaultSubject =
      userProfile?.subjects && userProfile.subjects.length > 0
        ? userProfile.subjects[0]
        : 'General';

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Exam Chapter',
      subject: defaultSubject,
      content: '',
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
    setActiveTab('notes');
    setStatusNotification({
      type: 'info',
      message: 'Created new note workspace. Paste your material and let Zygard summarize!',
    });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_NOTES.find((s) => s.id === sampleId);
    if (!sample) return;

    const existing = notes.find((n) => n.id === sample.id);
    if (existing) {
      setActiveId(existing.id);
    } else {
      const newNote: NoteItem = {
        id: sample.id,
        title: sample.title,
        subject: sample.subject,
        content: sample.content,
        createdAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
    }
    setActiveTab('notes');
    setStatusNotification({
      type: 'success',
      message: `Loaded sample notes: "${sample.title}"`,
    });
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // 1. Run Summarization with Student Profile Context
  const handleSummarize = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsSummarizing(true);
    setStatusNotification({
      type: 'info',
      message: 'Zygard is synthesizing high-yield exam takeaways for your study level...',
    });

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: activeNote.content,
          style: summaryStyle,
          title: activeNote.title,
          subject: activeNote.subject,
          studentProfile: userProfile,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      updateActiveNote({ summary: data.summary });
      setStatusNotification({
        type: 'success',
        message: 'Exam summary synthesized according to your study profile!',
      });
    } catch (err: any) {
      console.error(err);
      setStatusNotification({
        type: 'error',
        message: formatCleanErrorMessage(err, 'Failed to synthesize summary. Please try again.'),
      });
    } finally {
      setIsSummarizing(false);
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  // 2. Run Full Study Kit Generation with Student Profile Context
  const handleGenerateStudyKit = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsGeneratingKit(true);
    setStatusNotification({
      type: 'info',
      message: 'Zygard is building flashcards, mock exam quiz, and revision roadmap...',
    });

    try {
      let currentSummary = activeNote.summary;
      if (!currentSummary) {
        const sumRes = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: activeNote.content,
            style: summaryStyle,
            title: activeNote.title,
            subject: activeNote.subject,
            studentProfile: userProfile,
          }),
        });
        const sumData = await sumRes.json();
        if (sumData.error) throw new Error(sumData.error);
        if (sumData.summary) {
          currentSummary = sumData.summary;
        }
      }

      const kitRes = await fetch('/api/generate-study-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: activeNote.content,
          title: activeNote.title,
          subject: activeNote.subject,
          studentProfile: userProfile,
        }),
      });

      const kitData = await kitRes.json();
      if (kitData.error) throw new Error(kitData.error);

      const studyKit: StudyKit = {
        summary: currentSummary || '',
        flashcards: kitData.flashcards || [],
        quiz: kitData.quiz || [],
        keyTerms: kitData.keyTerms || [],
        focusAreas: kitData.focusAreas || [],
        studyPlan: (kitData.studyPlan || []).map((p: any) => ({
          ...p,
          completed: false,
        })),
      };

      updateActiveNote({
        summary: currentSummary,
        studyKit,
      });

      setStatusNotification({
        type: 'success',
        message: 'Complete Exam Study Kit generated! Flashcards & Quiz ready.',
      });
      setActiveTab('flashcards');
    } catch (err: any) {
      console.error(err);
      setStatusNotification({
        type: 'error',
        message: formatCleanErrorMessage(err, 'Failed to generate study kit. Please try again.'),
      });
    } finally {
      setIsGeneratingKit(false);
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  // Flashcard updates
  const handleUpdateFlashcardStatus = (id: string, status: 'mastered' | 'review_again') => {
    if (!activeNote?.studyKit) return;
    const updatedCards = activeNote.studyKit.flashcards.map((fc) =>
      fc.id === id ? { ...fc, status } : fc
    );
    updateActiveNote({
      studyKit: {
        ...activeNote.studyKit,
        flashcards: updatedCards,
      },
    });
  };

  // Study plan updates
  const handleTogglePlanItem = (id: string) => {
    if (!activeNote?.studyKit) return;
    const updatedPlan = activeNote.studyKit.studyPlan.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateActiveNote({
      studyKit: {
        ...activeNote.studyKit,
        studyPlan: updatedPlan,
      },
    });
  };

  // Question Scanner Handlers
  const handleAppendScannedToNotes = (textToAppend: string, title?: string, subject?: string) => {
    if (activeNote) {
      updateActiveNote({
        content: activeNote.content ? `${activeNote.content}\n\n${textToAppend}` : textToAppend,
        title:
          !activeNote.title || activeNote.title === 'New Exam Chapter' || activeNote.title === 'Untitled Note'
            ? (title || activeNote.title)
            : activeNote.title,
      });
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: title || 'Solved Exam Problem',
        subject: subject || (userProfile?.subjects?.[0] || 'General'),
        content: textToAppend,
        createdAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
    }
    setStatusNotification({
      type: 'success',
      message: 'Scanned problem & step-by-step solution appended to your notes!',
    });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleAddScannedFlashcard = (card: Flashcard) => {
    if (activeNote) {
      const existingDeck = activeNote.studyKit?.flashcards || [];
      const updatedDeck = [card, ...existingDeck];
      updateActiveNote({
        studyKit: {
          summary: activeNote.studyKit?.summary || activeNote.summary || '',
          flashcards: updatedDeck,
          quiz: activeNote.studyKit?.quiz || [],
          keyTerms: activeNote.studyKit?.keyTerms || [],
          focusAreas: activeNote.studyKit?.focusAreas || [],
          studyPlan: activeNote.studyKit?.studyPlan || [],
        },
      });
    }
    setStatusNotification({
      type: 'success',
      message: 'Active recall flashcard created from scanned problem!',
    });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Recall mastery calculation
  const totalCards = activeNote?.studyKit?.flashcards?.length || 0;
  const masteredCards = activeNote?.studyKit?.flashcards?.filter((c) => c.status === 'mastered').length || 0;
  const masteryPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewNote={handleCreateNewNote}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        notesCount={notes.length}
        masteryPercent={masteryPercent}
        hasStudyKit={Boolean(activeNote?.studyKit)}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenFacultyLounge={() => setIsFacultyLoungeOpen(true)}
      />

      {/* Notifications Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%]">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-bounce ${
              statusNotification.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : statusNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            {statusNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>{statusNotification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Note Tab Switcher Bar */}
        {notes.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider shrink-0">
              Your Notes:
            </span>
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition border ${
                  n.id === activeNote?.id
                    ? 'bg-white border-emerald-400 text-slate-900 font-bold shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {n.title || 'Untitled Note'}
              </button>
            ))}
          </div>
        )}

        {/* Tab views */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <NotesInput
              title={activeNote?.title || ''}
              setTitle={(val) => updateActiveNote({ title: val })}
              subject={activeNote?.subject || (userProfile?.subjects?.[0] || 'General')}
              setSubject={(val) => updateActiveNote({ subject: val })}
              content={activeNote?.content || ''}
              setContent={(val) => updateActiveNote({ content: val })}
              summaryStyle={summaryStyle}
              setSummaryStyle={setSummaryStyle}
              isSummarizing={isSummarizing}
              isGeneratingKit={isGeneratingKit}
              onSummarize={handleSummarize}
              onGenerateStudyKit={handleGenerateStudyKit}
              onLoadSample={handleLoadSample}
              userProfile={userProfile}
              onOpenProfileModal={() => setIsAuthModalOpen(true)}
              onOpenScanner={() => setActiveTab('scan')}
            />

            <SummaryView
              summary={activeNote?.summary || ''}
              noteTitle={activeNote?.title || 'Notes'}
              subject={activeNote?.subject || (userProfile?.subjects?.[0] || 'General')}
              isGeneratingKit={isGeneratingKit}
              onGenerateStudyKit={handleGenerateStudyKit}
              onGoToFlashcards={() => setActiveTab('flashcards')}
              hasStudyKit={Boolean(activeNote?.studyKit)}
            />
          </div>
        )}

        {activeTab === 'equations' && (
          <EquationExplainerView
            onAskProfessor={(profId, prompt) => {
              setActiveProfessorId(profId as any);
              setChatInitialPrompt(prompt);
              setIsChatOpen(true);
            }}
          />
        )}

        {activeTab === 'scan' && (
          <QuestionScannerView
            userProfile={userProfile}
            onAppendToNotes={handleAppendScannedToNotes}
            onAddFlashcard={handleAddScannedFlashcard}
            onOpenChatWithContext={(context, title) => {
              setIsChatOpen(true);
            }}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsDeck
            flashcards={activeNote?.studyKit?.flashcards || []}
            onUpdateFlashcardStatus={handleUpdateFlashcardStatus}
            onGenerateCards={handleGenerateStudyKit}
            isGenerating={isGeneratingKit}
            noteTitle={activeNote?.title || 'Notes'}
          />
        )}

        {activeTab === 'quiz' && (
          <ExamQuiz
            quiz={activeNote?.studyKit?.quiz || []}
            onGenerateQuiz={handleGenerateStudyKit}
            isGenerating={isGeneratingKit}
            noteTitle={activeNote?.title || 'Notes'}
          />
        )}

        {activeTab === 'plan' && (
          <StudyPlanView
            studyPlan={activeNote?.studyKit?.studyPlan || []}
            focusAreas={activeNote?.studyKit?.focusAreas || []}
            keyTerms={activeNote?.studyKit?.keyTerms || []}
            onTogglePlanItem={handleTogglePlanItem}
            onGeneratePlan={handleGenerateStudyKit}
            isGenerating={isGeneratingKit}
            noteTitle={activeNote?.title || 'Notes'}
          />
        )}

        {/* Creator Hallmark in the application footer */}
        <RajatHallmark variant="footer" className="mt-12" />
      </main>

      {/* Floating Action Button for Zygard AI Chat */}
      <button
        id="floating-zygard-chat-btn"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-emerald-700 text-white rounded-2xl shadow-xl transition-all hover:scale-105 border border-slate-700 font-bold text-xs sm:text-sm"
        title="Chat with Zygard AI Study Bot"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>Ask Zygard</span>
      </button>

      {/* Zygard Chat Drawer */}
      <ZygardChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialPrompt(undefined);
        }}
        notesContext={
          activeNote?.summary
            ? `Summary:\n${activeNote.summary}\n\nFull Notes:\n${activeNote.content}`
            : activeNote?.content || ''
        }
        noteTitle={activeNote?.title || 'Current Topic'}
        userProfile={userProfile}
        initialProfessorId={activeProfessorId}
        initialPrompt={chatInitialPrompt}
      />

      {/* 4 Specialized AI Professors Faculty Lounge Modal */}
      <FacultyLoungeModal
        isOpen={isFacultyLoungeOpen}
        onClose={() => setIsFacultyLoungeOpen(false)}
        selectedProfessorId={activeProfessorId}
        onSelectProfessor={(prof) => setActiveProfessorId(prof.id)}
        onStartChat={(prof, prompt) => {
          setActiveProfessorId(prof.id);
          setChatInitialPrompt(prompt);
          setIsFacultyLoungeOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Auth & Student Subjects Customization Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentProfile={userProfile}
        canClose={Boolean(userProfile)}
      />
    </div>
  );
}
