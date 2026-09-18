import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  HelpCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { ScannedQuestionResult, UserProfile, Flashcard } from '../types';
import { SAMPLE_QUESTIONS, renderQuestionImageToDataUrl } from '../utils/sampleQuestions';
import { formatCleanErrorMessage } from '../utils/errorUtils';
import { RajatHallmark } from './RajatHallmark';

interface QuestionScannerViewProps {
  userProfile?: UserProfile | null;
  onAppendToNotes: (textToAppend: string, title?: string, subject?: string) => void;
  onAddFlashcard: (flashcard: Flashcard) => void;
  onOpenChatWithContext: (context: string, title: string) => void;
}

export const QuestionScannerView: React.FC<QuestionScannerViewProps> = ({
  userProfile,
  onAppendToNotes,
  onAddFlashcard,
  onOpenChatWithContext,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'camera' | 'samples'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedQuestionResult | null>(null);
  const [history, setHistory] = useState<ScannedQuestionResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [addedToNotes, setAddedToNotes] = useState(false);
  const [addedToFlashcards, setAddedToFlashcards] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Load history from session or initial sample
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zygard_scanned_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setScanResult(parsed[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save history
  const saveToHistory = (result: ScannedQuestionResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== result.id);
      const updated = [result, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('zygard_scanned_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Camera cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Live video is not supported in this browser window. You can take a photo with your device camera or upload an image.'
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      const errMessage = String(err?.message || err || '');
      const errName = String(err?.name || '');
      const isPermissionIssue =
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError' ||
        errMessage.toLowerCase().includes('dismiss') ||
        errMessage.toLowerCase().includes('permission') ||
        errMessage.toLowerCase().includes('denied');

      if (isPermissionIssue) {
        setCameraError(
          'Camera permission was dismissed or blocked by the browser. You can click "Take Photo with System Camera" below, upload an image from your device, or retry camera access.'
        );
      } else {
        setCameraError(
          errMessage || 'Unable to open live video stream. You can take a photo using your system camera or upload an image.'
        );
      }
      setIsCameraActive(false);
    }
  };

  // Capture Snapshot from Camera
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedImage(dataUrl);
    stopCamera();
    setActiveInputMode('upload'); // show preview
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setSelectedImage(res);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) setSelectedImage(res);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load sample question
  const handleSelectSample = (sample: (typeof SAMPLE_QUESTIONS)[0]) => {
    const dataUrl = renderQuestionImageToDataUrl(sample);
    setSelectedImage(dataUrl);
    setAdditionalNote('');
    setActiveInputMode('upload');
  };

  // Execute Scanner Request
  const handleScanQuestion = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError(null);
    setAddedToNotes(false);
    setAddedToFlashcards(false);
    setShowPracticeAnswer(false);

    try {
      const res = await fetch('/api/scan-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          studentProfile: userProfile,
          additionalNote: additionalNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newResult: ScannedQuestionResult = {
        id: `scan-${Date.now()}`,
        extractedQuestion: data.extractedQuestion || 'Scanned Question',
        subject: data.subject || 'General Study',
        topic: data.topic || 'Exam Topic',
        difficulty: data.difficulty || 'Exam Level',
        questionType: data.questionType || 'Conceptual / Free Response',
        finalAnswer: data.finalAnswer || '',
        stepByStepSolution: data.stepByStepSolution || [],
        keyFormulasOrRules: data.keyFormulasOrRules || [],
        commonMistakes: data.commonMistakes || '',
        similarPracticeQuestion: data.similarPracticeQuestion,
        imagePreviewUrl: selectedImage,
        timestamp: Date.now(),
      };

      setScanResult(newResult);
      saveToHistory(newResult);
    } catch (err: any) {
      console.error(err);
      setScanError(formatCleanErrorMessage(err, 'Could not recognize or solve this question. Please ensure the text is legible.'));
    } finally {
      setIsScanning(false);
    }
  };

  // Copy solution to clipboard
  const handleCopy = () => {
    if (!scanResult) return;
    const markdown = `# ${scanResult.subject} - ${scanResult.topic}
**Difficulty:** ${scanResult.difficulty} | **Type:** ${scanResult.questionType}

## Problem Statement
${scanResult.extractedQuestion}

## Final Answer
${scanResult.finalAnswer}

## Step-by-Step Working
${scanResult.stepByStepSolution.map((s) => `- ${s}`).join('\n')}

## Governing Formulas
${scanResult.keyFormulasOrRules.map((f) => `- ${f}`).join('\n')}

## Exam Traps to Avoid
${scanResult.commonMistakes}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Append to active note
  const handleAppend = () => {
    if (!scanResult) return;
    const noteText = `\n\n### 📸 Scanned Problem: ${scanResult.topic} (${scanResult.subject})
**Question:**
${scanResult.extractedQuestion}

**Final Answer:**
> ${scanResult.finalAnswer}

**Step-by-Step Derivation:**
${scanResult.stepByStepSolution.map((step) => `1. ${step}`).join('\n')}

**Key Formulas:**
${scanResult.keyFormulasOrRules.map((f) => `* \`${f}\``).join('\n')}

**Exam Watchout:**
⚠️ ${scanResult.commonMistakes}
`;
    onAppendToNotes(noteText, `Solved Problem: ${scanResult.topic}`, scanResult.subject);
    setAddedToNotes(true);
  };

  // Turn into flashcard
  const handleCreateFlashcard = () => {
    if (!scanResult) return;
    const diffLower: 'easy' | 'medium' | 'hard' =
      scanResult.difficulty === 'Easy' ? 'easy' : scanResult.difficulty === 'Hard' || scanResult.difficulty === 'Exam Level' ? 'hard' : 'medium';

    const card: Flashcard = {
      id: `fc-scan-${Date.now()}`,
      question: `[${scanResult.subject} • ${scanResult.topic}]\n${scanResult.extractedQuestion.slice(0, 220)}${
        scanResult.extractedQuestion.length > 220 ? '...' : ''
      }`,
      answer: `🎯 ${scanResult.finalAnswer}\n\nKey Step:\n${scanResult.stepByStepSolution[0] || ''}\n\nRule:\n${
        scanResult.keyFormulasOrRules[0] || 'Apply core principles'
      }`,
      topic: scanResult.topic || scanResult.subject,
      difficulty: diffLower,
      memoryTip: scanResult.commonMistakes ? `Avoid trap: ${scanResult.commonMistakes}` : undefined,
      status: 'unreviewed',
    };
    onAddFlashcard(card);
    setAddedToFlashcards(true);
  };

  // Ask Zygard about this problem
  const handleAskZygard = () => {
    if (!scanResult) return;
    const context = `Scanned Question (${scanResult.subject} - ${scanResult.topic}):
"""
${scanResult.extractedQuestion}
"""

Zygard's Solution:
Final Answer: ${scanResult.finalAnswer}
Steps:
${scanResult.stepByStepSolution.join('\n')}
`;
    onOpenChatWithContext(context, `Question: ${scanResult.topic}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Multimodal Vision AI
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/10 text-slate-200">
              Exam OCR & Step-by-Step Solver
            </span>
            <RajatHallmark variant="badge" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Question Scanner & Instant Concept Tutor
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Snap or upload photos of textbook questions, exam papers, handwritten math, or scientific diagrams.
            Zygard extracts the problem, provides rigorous step-by-step working, identifies exam traps, and creates
            follow-up practice challenges.
          </p>

          {userProfile && (
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                Calibrated to <strong>{userProfile.username}&apos;s</strong> {userProfile.educationLevel} curriculum.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dual-Column Layout: Left Scanner Controller, Right Solved Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input & Upload Options (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Provide Question Image</span>
              </h2>
              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setScanError(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  stopCamera();
                  setActiveInputMode('upload');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeInputMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload / Drop
              </button>
              <button
                onClick={() => {
                  setActiveInputMode('camera');
                  startCamera();
                }}
                className={`py-2 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                  activeInputMode === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setActiveInputMode('samples');
                }}
                className={`py-2 rounded-lg transition text-center ${
                  activeInputMode === 'samples'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sample Exams
              </button>
            </div>

            {/* TAB 1: UPLOAD / DRAG & DROP */}
            {activeInputMode === 'upload' && (
              <div className="space-y-4">
                {selectedImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img
                      src={selectedImage}
                      alt="Question to scan"
                      className="w-full max-h-64 object-contain mx-auto"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium border border-white/20 transition"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/30 group"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to upload or drag & drop question
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP, textbook screenshots, exam sheets
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-2xs">
                      Tip: You can also paste an image with <kbd className="font-mono font-bold">Ctrl+V</kbd>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* TAB 2: LIVE CAMERA CAPTURE */}
            {activeInputMode === 'camera' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 text-xs space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-900">Camera Access Notice</p>
                        <p className="text-slate-600 mt-0.5">{cameraError}</p>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Photo with Device Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveInputMode('upload');
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload Photo / File</span>
                      </button>

                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg font-medium text-xs transition flex items-center gap-1 hover:bg-amber-100/50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Live Stream</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Reticle / Focus Overlay */}
                    <div className="absolute inset-6 border-2 border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="bg-slate-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border border-emerald-500/30">
                        Align question within frame
                      </span>
                    </div>

                    {/* Controls overlay */}
                    <div className="absolute bottom-3 flex items-center gap-2">
                      <button
                        id="capture-question-snapshot-btn"
                        onClick={handleCaptureSnapshot}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap & Crop Question</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-white/20 transition"
                        title="Use device camera application for higher resolution"
                      >
                        Native Camera
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* TAB 3: SAMPLE EXAM QUESTIONS */}
            {activeInputMode === 'samples' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  Try one of these pre-rendered high-yield exam questions to test Zygard&apos;s vision solver:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_QUESTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s)}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                          {s.title}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {s.promptText.slice(0, 75)}...
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Optional note for Zygard (e.g. &ldquo;focus on part (b)&rdquo; or &ldquo;explain formula&rdquo;):
              </label>
              <input
                type="text"
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                placeholder="e.g., Provide intuition for step 2..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>

            {/* Scanner Action Button */}
            <button
              id="scan-question-submit-btn"
              onClick={handleScanQuestion}
              disabled={!selectedImage || isScanning}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                !selectedImage
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isScanning
                  ? 'bg-emerald-700 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Image & Solving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Scan & Solve Question</span>
                </>
              )}
            </button>

            {scanError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Scanned History Sidebar */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Scanned Problems ({history.length})</span>
                </span>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('zygard_scanned_history');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setScanResult(item);
                      if (item.imagePreviewUrl) setSelectedImage(item.imagePreviewUrl);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                      scanResult?.id === item.id
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-semibold'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{item.topic || item.subject}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.extractedQuestion}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {item.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Scanned Question Result & Step-by-Step Walkthrough (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div className="space-y-5">
              {/* Solved Card Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                      {scanResult.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
                      {scanResult.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                      {scanResult.questionType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                      {scanResult.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                      title="Copy Solution Markdown"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Statement Transcription */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Transcribed Question:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {scanResult.extractedQuestion}
                  </div>
                </div>

                {/* Final Answer Banner */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Final Answer / Correct Option</span>
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-emerald-900">
                    {scanResult.finalAnswer}
                  </p>
                </div>

                {/* Step-by-Step Derivation */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Rigorous Step-by-Step Working & Reasoning</span>
                  </span>
                  <div className="space-y-2">
                    {scanResult.stepByStepSolution.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start gap-3 shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 whitespace-pre-wrap">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Formulas & Principles */}
                {scanResult.keyFormulasOrRules && scanResult.keyFormulasOrRules.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Governing Laws & Formulas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.keyFormulasOrRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800"
                        >
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Exam Pitfalls & Traps */}
                {scanResult.commonMistakes && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1.5 text-xs sm:text-sm">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Common Exam Mistakes & Trap Alerts:</span>
                    </span>
                    <p className="text-amber-950/90 leading-relaxed">{scanResult.commonMistakes}</p>
                  </div>
                )}

                {/* Follow-up Practice Question (Active Recall) */}
                {scanResult.similarPracticeQuestion && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        <span>Active Recall Challenge (Similar Question)</span>
                      </span>
                      <button
                        onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <span>{showPracticeAnswer ? 'Hide Solution' : 'Show Solution'}</span>
                        {showPracticeAnswer ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 whitespace-pre-wrap">
                      {scanResult.similarPracticeQuestion.question}
                    </p>

                    {showPracticeAnswer && (
                      <div className="pt-2 border-t border-indigo-200/60 text-xs text-indigo-950 font-mono bg-white/70 p-3 rounded-lg">
                        <strong>Solution:</strong> {scanResult.similarPracticeQuestion.solution}
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Action Hub for this Scanned Question */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleAppend}
                    disabled={addedToNotes}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      addedToNotes
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{addedToNotes ? 'Added to Active Notes ✓' : 'Append to Notes'}</span>
                  </button>

                  <button
                    onClick={handleCreateFlashcard}
                    disabled={addedToFlashcards}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                      addedToFlashcards
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{addedToFlashcards ? 'Flashcard Created ✓' : 'Make Flashcard'}</span>
                  </button>

                  <button
                    onClick={handleAskZygard}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 transition ml-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ask Zygard Doubts</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4 min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">No Question Scanned Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Upload an image from your device, snap a picture with your camera, or pick a sample exam problem on the left to see Zygard&apos;s step-by-step breakdown.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {SAMPLE_QUESTIONS.slice(0, 3).map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 transition"
                  >
                    Try: {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
