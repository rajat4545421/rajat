import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { X, Send, Sparkles, Bot, User, RefreshCw, Volume2, VolumeX, Lightbulb, Trash2, GraduationCap } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { AI_PROFESSORS, Professor, getProfessorById } from '../data/professors';
import { formatCleanErrorMessage } from '../utils/errorUtils';
import { RajatHallmark } from './RajatHallmark';

interface ZygardChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notesContext: string;
  noteTitle: string;
  userProfile?: UserProfile | null;
  initialProfessorId?: Professor['id'];
  initialPrompt?: string;
}

const MODES = [
  { id: 'tutor', label: 'Tutor', desc: 'Detailed explanation & help' },
  { id: 'quiz-me', label: 'Oral Quiz', desc: 'Zygard asks questions' },
  { id: 'explain-simple', label: 'ELI5', desc: 'Intuitive everyday analogies' },
  { id: 'exam-strategist', label: 'Exam Tips', desc: 'Scoring tricks & traps' },
];

export const ZygardChatDrawer: React.FC<ZygardChatDrawerProps> = ({
  isOpen,
  onClose,
  notesContext,
  noteTitle,
  userProfile,
  initialProfessorId = 'kevin',
  initialPrompt,
}) => {
  const [selectedProfessorId, setSelectedProfessorId] = useState<Professor['id']>(initialProfessorId);
  const activeProfessor = getProfessorById(selectedProfessorId);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'zygard',
      text: `👋 Greetings${userProfile?.username ? ` **${userProfile.username}**` : ''}! I'm **${activeProfessor.name}** (${activeProfessor.subject}).
${activeProfessor.tagline}
Ask me to explain any difficult equation (like *Pyruvate + CoA-SH + NAD⁺ ➔ Acetyl-CoA + CO₂ + NADH*), break down complex concepts, or quiz you!`,
      timestamp: Date.now(),
      suggestedFollowUps: [
        'Explain the Pyruvate Link Reaction in plain English',
        'Break down this formula step-by-step',
        'What are the 3 biggest exam traps here?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('tutor');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProfessorId) {
      setSelectedProfessorId(initialProfessorId);
    }
  }, [initialProfessorId]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSelectProfessor = (profId: Professor['id']) => {
    setSelectedProfessorId(profId);
    const prof = getProfessorById(profId);
    const switchNotice: ChatMessage = {
      id: `switch-${Date.now()}`,
      sender: 'zygard',
      text: `🎓 **Switched to ${prof.name}** (${prof.title}).
*${prof.tagline}*
How can I assist you in **${prof.subject}** today?`,
      timestamp: Date.now(),
      suggestedFollowUps: prof.sampleQuestions,
    };
    setMessages((prev) => [...prev, switchNotice]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          notesContext,
          mode,
          professorId: selectedProfessorId,
          studentProfile: userProfile,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const botMsg: ChatMessage = {
        id: `zygard-${Date.now()}`,
        sender: 'zygard',
        text: data.reply || "I'm ready for your next study question!",
        timestamp: Date.now(),
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'zygard',
        text: `⚠️ ${formatCleanErrorMessage(err, 'Sorry, I encountered an issue connecting. Please try again.')}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const prof = getProfessorById(selectedProfessorId);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'zygard',
        text: `Chat reset. I am **${prof.name}**. What would you like to review next regarding **${noteTitle || 'your notes'}**?`,
        timestamp: Date.now(),
        suggestedFollowUps: prof.sampleQuestions,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-xs">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Zygard AI Bot</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Exam Mentor & Socratic Study Partner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <RajatHallmark variant="compact" />
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Professors Faculty Bar */}
      <div className="px-4 py-2 bg-slate-900/95 text-slate-300 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            AI Professor Faculty:
          </span>
          <span className="text-[10px] font-semibold text-emerald-400">
            Active: {activeProfessor.name} ({activeProfessor.title})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {AI_PROFESSORS.map((prof) => {
            const isSelected = prof.id === selectedProfessorId;
            return (
              <button
                key={prof.id}
                onClick={() => handleSelectProfessor(prof.id)}
                className={`flex flex-col items-center p-1.5 rounded-lg text-left transition ${
                  isSelected
                    ? 'bg-emerald-500/20 border border-emerald-400 text-white shadow-xs'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={`${prof.name} - ${prof.title}`}
              >
                <div className="flex items-center gap-1 w-full justify-center">
                  <span className="text-xs">{prof.avatarEmoji}</span>
                  <span className="text-[11px] font-bold truncate">{prof.name.replace('Prof. ', '')}</span>
                </div>
                <span className="text-[9px] text-slate-400 truncate w-full text-center">{prof.subject.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Picker Chips */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Mode:
        </span>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              mode === m.id
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title={m.desc}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-2xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  <div className="markdown-body">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.text}</Markdown>
                  </div>
                )}

                {/* Follow-up suggestions */}
                {!isUser && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      Suggested Follow-ups:
                    </span>
                    <div className="flex flex-col gap-1">
                      {m.suggestedFollowUps.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="text-left text-[11px] font-medium px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 transition"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-500 p-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>Zygard is analyzing and formulating a study answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zygard any question or doubt..."
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
