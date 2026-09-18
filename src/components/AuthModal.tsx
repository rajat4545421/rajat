import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, User, BookOpen, Layers, ShieldCheck, Mail, Lock, Plus, X } from 'lucide-react';
import { UserProfile } from '../types';
import { RajatHallmark } from './RajatHallmark';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
  initialMode?: 'signin' | 'signup' | 'customize';
  canClose?: boolean;
}

const PRESET_SUBJECTS = [
  'Biology / Biochemistry',
  'Computer Science',
  'Chemistry (Organic & Gen)',
  'Physics',
  'Mathematics / Calculus',
  'World & US History',
  'Economics & Finance',
  'Psychology',
  'Literature & Essay Writing',
  'Medicine & Anatomy',
  'Law & Constitutional Studies',
  'Engineering',
];

const EDUCATION_LEVELS = [
  'High School (General)',
  'AP / IB / Honors Prep',
  'College / Undergraduate',
  'Postgraduate / Masters',
  'Competitive Exams (MCAT / SAT / GRE / JEE / NEET)',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentProfile,
  initialMode = 'signin',
  canClose = false,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'customize'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentProfile?.subjects && currentProfile.subjects.length > 0
      ? currentProfile.subjects
      : ['Biology / Biochemistry', 'Computer Science']
  );
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [educationLevel, setEducationLevel] = useState(
    currentProfile?.educationLevel || 'College / Undergraduate'
  );
  const [examGoal, setExamGoal] = useState(
    currentProfile?.examGoal || 'Ace Upcoming Midterms & Finals'
  );
  const [studyPace, setStudyPace] = useState<'rapid-review' | 'deep-mastery' | 'balanced'>(
    currentProfile?.studyPacePreference || 'balanced'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
      setCustomSubjectInput('');
    }
  };

  // Google Login Flow
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMsg('');

    // Simulate authentic Google Auth transition with authentic student profile
    setTimeout(() => {
      setIsLoading(false);
      const googleProfile: UserProfile = {
        id: `google-${Date.now()}`,
        username: username.trim() || 'Rajat Student',
        email: email.trim() || 'rastogirajat2007@gmail.com',
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        authProvider: 'google',
        subjects: selectedSubjects,
        educationLevel,
        examGoal,
        studyPacePreference: studyPace,
        joinedAt: Date.now(),
      };

      // Prompt to review/confirm subjects
      if (mode !== 'customize') {
        setUsername(googleProfile.username);
        setMode('customize');
      } else {
        onAuthSuccess(googleProfile);
      }
    }, 600);
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'signup') {
      if (!username.trim()) {
        setErrorMsg('Please choose a username for your study account.');
        return;
      }
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please provide a valid email and password.');
        return;
      }
      // Advance to subjects customization step
      setMode('customize');
      return;
    }

    if (mode === 'signin') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const derivedName = email.split('@')[0] || 'Student';
        const user: UserProfile = {
          id: `email-${Date.now()}`,
          username: username.trim() || derivedName,
          email,
          authProvider: 'email',
          subjects: selectedSubjects,
          educationLevel,
          examGoal,
          studyPacePreference: studyPace,
          joinedAt: Date.now(),
        };
        onAuthSuccess(user);
      }, 500);
      return;
    }

    // mode === 'customize'
    if (!username.trim()) {
      setErrorMsg('Please specify your username.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one study subject.');
      return;
    }

    const finalProfile: UserProfile = {
      id: currentProfile?.id || `student-${Date.now()}`,
      username: username.trim(),
      email: email.trim() || currentProfile?.email || 'student@zygard.ai',
      avatarUrl: currentProfile?.avatarUrl,
      authProvider: currentProfile?.authProvider || 'email',
      subjects: selectedSubjects,
      educationLevel,
      examGoal,
      studyPacePreference: studyPace,
      joinedAt: currentProfile?.joinedAt || Date.now(),
    };

    onAuthSuccess(finalProfile);
  };

  const handleGuestBypass = () => {
    const guestProfile: UserProfile = {
      id: `guest-${Date.now()}`,
      username: 'Guest Scholar',
      email: 'guest@zygard.ai',
      authProvider: 'guest',
      subjects: ['Biology / Biochemistry', 'Computer Science'],
      educationLevel: 'College / Undergraduate',
      examGoal: 'Exam Revision',
      studyPacePreference: 'balanced',
      joinedAt: Date.now(),
    };
    onAuthSuccess(guestProfile);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Close button if optional */}
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Hero */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-7 h-7 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Zygard
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Study Bot
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                Personalized study notes, instant exam summaries, and active recall mastery.
              </p>
            </div>

            {/* Creator Hallmark Badge */}
            <div className="pt-1">
              <RajatHallmark variant="badge" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-800 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Mode Tabs (Sign In / Sign Up / Customize) */}
          {mode !== 'customize' ? (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Student Account (Sign Up)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
                  Personalization Step
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Configure Your Student Study Profile
                </h3>
              </div>
              <RajatHallmark variant="compact" />
            </div>
          )}

          {/* GOOGLE SIGN IN BUTTON */}
          {mode !== 'customize' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs transition hover:border-slate-400"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Login via Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or with email
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
            </div>
          )}

          {/* Form for Sign In / Sign Up */}
          {mode !== 'customize' ? (
            <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g., Rajat_Student or AlexScholar"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>
                  {mode === 'signup'
                    ? 'Continue to Choose Study Subjects →'
                    : 'Sign In to Zygard'}
                </span>
              </button>
            </form>
          ) : (
            /* CUSTOMIZATION / SUBJECTS PICKER STEP */
            <form onSubmit={handleEmailAuthSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  1. Confirm Student Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Rajat, Emma_Bio, Jordan_CS..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Study Subjects Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    2. Select Your Study Subjects
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {selectedSubjects.length} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Zygard tailors note summaries, active recall cards, and exam quizzes according to your chosen subjects.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_SUBJECTS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{subj}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add custom subject */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    placeholder="Add custom subject (e.g. Genetics, Macroeconomics)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  3. Academic & Exam Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Pace */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  4. Preferred Study Pace
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rapid-review', label: 'Rapid High-Yield', desc: 'Exam cramming' },
                    { id: 'balanced', label: 'Balanced', desc: 'Optimal retention' },
                    { id: 'deep-mastery', label: 'Deep Mastery', desc: 'First principles' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStudyPace(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        studyPace === p.id
                          ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit & Start */}
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Save Profile & Start Studying with Zygard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Guest demo option & Creator Hallmark banner */}
          <div className="pt-2 space-y-3">
            <div className="text-center">
              <button
                type="button"
                onClick={handleGuestBypass}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:underline"
              >
                Skip for now and continue as Guest Scholar →
              </button>
            </div>

            <RajatHallmark variant="banner" />
          </div>
        </div>
      </div>
    </div>
  );
};
