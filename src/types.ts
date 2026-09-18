export type SummaryStyle =
  | 'high-yield'
  | 'bullet-cheatsheet'
  | 'deep-dive'
  | 'feynman'
  | 'cram-sheet';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  memoryTip?: string;
  status?: 'unreviewed' | 'mastered' | 'review_again';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  whyOthersAreWrong?: string;
  topic: string;
  userAnswerIndex?: number;
}

export interface StudyPlanItem {
  id: string;
  dayOrSession: string;
  focusTopic: string;
  studyAction: string;
  durationMinutes: number;
  completed?: boolean;
}

export interface ExamFocusArea {
  topic: string;
  importance: 'critical' | 'high' | 'medium';
  examTips: string;
  pitfalls?: string;
}

export interface KeyTermOrFormula {
  term: string;
  definition: string;
  exampleOrFormula: string;
}

export interface StudyKit {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  keyTerms: KeyTermOrFormula[];
  focusAreas: ExamFocusArea[];
  studyPlan: StudyPlanItem[];
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  content: string;
  summary?: string;
  studyKit?: StudyKit;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'zygard';
  text: string;
  timestamp: number;
  suggestedFollowUps?: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'guest';
  subjects: string[];
  educationLevel: string;
  examGoal?: string;
  studyPacePreference: 'rapid-review' | 'deep-mastery' | 'balanced';
  joinedAt: number;
}

export interface ScannedQuestionResult {
  id: string;
  extractedQuestion: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Exam Level';
  questionType: 'Multiple Choice' | 'Numerical Calculation' | 'Conceptual / Free Response' | 'Derivation / Proof';
  finalAnswer: string;
  stepByStepSolution: string[];
  keyFormulasOrRules: string[];
  commonMistakes: string;
  similarPracticeQuestion?: {
    question: string;
    solution: string;
  };
  imagePreviewUrl?: string;
  timestamp: number;
}


