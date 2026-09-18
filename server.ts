import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Recommended models prioritized for resilience against high-demand spikes
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

export function formatErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred.";
  let msg = err.message || String(err);
  try {
    if (typeof msg === "string" && (msg.trim().startsWith("{") || msg.includes('{"error":'))) {
      const jsonStart = msg.indexOf("{");
      const jsonEnd = msg.lastIndexOf("}") + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(msg.slice(jsonStart, jsonEnd));
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        } else if (parsed?.error && typeof parsed.error === "string") {
          msg = parsed.error;
        } else if (parsed?.message) {
          msg = parsed.message;
        }
      }
    }
  } catch (_) {}

  const lower = msg.toLowerCase();
  if (lower.includes("high demand") || lower.includes("503") || lower.includes("unavailable")) {
    return "Zygard AI is currently experiencing high demand. Please try again in a few moments.";
  }
  if (lower.includes("exceeded your current quota") || lower.includes("quota") || lower.includes("429")) {
    return "Study request limit reached. Please wait a moment and try again.";
  }
  return msg;
}

interface GenerateParams {
  contents: any;
  config?: any;
}

async function generateWithResilience(params: GenerateParams): Promise<any> {
  const ai = getAI();
  let lastError: any = null;

  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        const isTransient =
          errStr.includes("503") ||
          errStr.includes("high demand") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("Resource has been exhausted") ||
          errStr.includes("429") ||
          errStr.includes("overloaded");

        if (isTransient) {
          console.warn(`[Zygard AI] Model ${model} (attempt ${attempt + 1}) busy or unavailable. Retrying/falling back...`);
          await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
          continue;
        } else {
          break;
        }
      }
    }
  }

  throw new Error(formatErrorMessage(lastError));
}

// 4 Specialized AI Professors Registry
const PROFESSOR_DIRECTIVES: Record<string, { name: string; title: string; prompt: string }> = {
  kevin: {
    name: "Prof. Kevin",
    title: "Biochemistry & Life Sciences Chair",
    prompt: `You are Prof. Kevin, specialist in Biochemistry, Cellular Respiration & Molecular Biology.
Your teaching superpower: You turn complex metabolic pathways (Glycolysis, Pyruvate link reaction, Krebs cycle, ETC, photosynthesis), enzymes, and genetics into intuitive, memorable real-world stories.
Rule for equations: When explaining biochemical equations (like Pyruvate + CoA-SH + NAD+ -> Acetyl-CoA + CO2 + NADH):
- Break down EVERY reactant into its physical job (e.g. Pyruvate = 3C raw fuel from food; CoA = molecular handle; NAD+ = empty electron battery).
- Detail the carbon bookkeeping (3C -> 2C + 1C) so students never lose test marks.
- Explain the cellular location and why the cell does this step.`,
  },
  max: {
    name: "Prof. Max",
    title: "Mathematics & Physics Fellow",
    prompt: `You are Prof. Max, specialist in Mathematics, Calculus, Classical Mechanics & Physics.
Your teaching superpower: You make abstract formulas visual and intuitive without skipping mathematical steps.
Rule for equations: Explain physical intuition and units first before algebraic symbols. Walk step-by-step through derivations and highlight common math/physics pitfalls.`,
  },
  steve: {
    name: "Prof. Steve",
    title: "Chemistry & Organic Reactions Chair",
    prompt: `You are Prof. Steve, specialist in Chemistry, Reaction Mechanisms & Organic Synthesis.
Your teaching superpower: You demystify chemical equations, electron arrows, and stoichiometry.
Rule for equations: Never present naked chemical equations without an intuitive "Plain-English Molecular Translation". Divide reactions into What Goes In, The Chemical Machine/Catalyst, and What Comes Out.`,
  },
  elena: {
    name: "Prof. Elena",
    title: "Computer Science & Logic Systems Specialist",
    prompt: `You are Prof. Elena, specialist in Computer Science, Data Structures, Algorithms & Logic Systems.
Your teaching superpower: You break down complex algorithms, recursion, Boolean algebra, system design, and Big-O into crystal-clear mental models with step-by-step traces.`,
  },
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    botName: "Zygard",
    professors: Object.keys(PROFESSOR_DIRECTIVES),
  });
});

// 1. Summarize Notes endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { notes, style = "high-yield", subject = "General", title = "Study Notes", studentProfile } = req.body;

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return res.status(400).json({ error: "Please provide valid notes to summarize." });
    }

    const ai = getAI();
    let stylePrompt = "";
    switch (style) {
      case "feynman":
        stylePrompt = "Use the Feynman Technique: explain complex concepts using vivid intuitive analogies, simple everyday language, and zero pretension, followed by a formal precision check.";
        break;
      case "bullet-cheatsheet":
        stylePrompt = "Create a rapid-fire Cheat Sheet: dense, bulleted, key definitions, equations/formulas, cause-and-effect pairs, and tables where suitable.";
        break;
      case "deep-dive":
        stylePrompt = "Provide an in-depth conceptual breakdown: cover underlying mechanisms, step-by-step sequence analysis, and real-world applications.";
        break;
      case "cram-sheet":
        stylePrompt = "Optimized for the night before the exam: highlight only must-know facts, formulas, 80/20 rule priorities, and high-frequency exam questions.";
        break;
      case "high-yield":
      default:
        stylePrompt = "High-Yield Exam Synthesis: balanced overview, core conceptual pillars, high-frequency exam traps, and memory mnemonics.";
        break;
    }

    const studentContext = studentProfile
      ? `Student Username: ${studentProfile.username || 'Student'}\nTarget Education/Exam Level: ${studentProfile.educationLevel || 'Standard'}\nStudent Focus Subjects: ${(studentProfile.subjects || []).join(', ')}\nExam Target: ${studentProfile.examGoal || 'Upcoming Exams'}\nTailor terminology difficulty and study examples specifically to match this student's education level and chosen subjects.`
      : "";

    const systemInstruction = `You are Zygard, the ultimate AI study bot designed to help students master their notes and crush their upcoming exams.
Your tone is sharp, encouraging, clear, and pedagogically rigorous.
${studentContext ? `Personalized Context:\n${studentContext}\n` : ""}
Never write vague generalities; distill the student's exact material into actionable study wisdom.
Format your output with rich, clean Markdown. Include:
1. 📌 Executive Summary (2-3 punchy sentences)
2. 🔑 Core Concepts & Detailed Breakdown (with bold terminology and clear logic)
   - CRITICAL EQUATION RULE: Whenever biochemical or mathematical reactions/formulas appear (e.g. Pyruvate + CoA-SH + NAD+ -> Acetyl-CoA + CO2 + NADH), NEVER just paste raw formulas. Always pair them with LaTeX ($$ ... $$) and a friendly, plain-English molecular translation explaining what went in, what changed, and what came out.
3. ⚠️ Exam Traps & Tricky Distinctions (things teachers love to test on)
4. 🧠 High-Yield Mnemonics / Memory Hooks
5. 🎯 3 Rapid Self-Test Questions (with brief answers in collapsible details or bullet tips)`;

    const prompt = `Topic/Title: ${title}
Subject: ${subject}
Requested Style: ${stylePrompt}

Here are the student's notes:
"""
${notes.slice(0, 30000)}
"""

Please synthesize these notes into a master exam-ready study guide according to the requested style.`;

    const response = await generateWithResilience({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const summaryText = response.text || "No summary could be generated. Please try again.";
    res.json({ summary: summaryText });
  } catch (err: any) {
    console.error("Summarization error:", formatErrorMessage(err));
    res.status(500).json({
      error: formatErrorMessage(err) || "Failed to generate summary with Zygard. Please try again.",
    });
  }
});

// 2. Generate Full Study Kit (Flashcards, Quizzes, Focus Areas, Study Plan)
app.post("/api/generate-study-kit", async (req, res) => {
  try {
    const { notes, title = "Study Topic", subject = "General", studentProfile } = req.body;

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return res.status(400).json({ error: "Please provide notes to generate study materials." });
    }

    const ai = getAI();
    const studentProfileContext = studentProfile
      ? `Student: ${studentProfile.username || 'Student'}\nEducation Level: ${studentProfile.educationLevel || 'Standard'}\nTarget Subjects: ${(studentProfile.subjects || []).join(', ')}\nExam Target: ${studentProfile.examGoal || 'Exams'}\nAdjust quiz question difficulty, flashcard depth, and study roadmap pacing to specifically match this student's level and learning profile.`
      : "";

    const systemInstruction = `You are Zygard, an expert study architect.
Given a student's notes, generate an all-inclusive exam study kit.
${studentProfileContext ? `Student Profile:\n${studentProfileContext}\n` : ""}
You must respond with ONLY valid JSON (no markdown ticks, no preamble, no trailing text) matching the schema below:

{
  "flashcards": [
    {
      "id": "fc-1",
      "question": "Clear, specific question targeting active recall",
      "answer": "Concise, definitive answer with key keywords",
      "topic": "Subtopic name",
      "difficulty": "easy" | "medium" | "hard",
      "memoryTip": "A clever mnemonic or association rule"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Realistic multiple choice exam question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Why this is correct",
      "whyOthersAreWrong": "Brief note on why the distractors are wrong",
      "topic": "Subtopic name"
    }
  ],
  "keyTerms": [
    {
      "term": "Key Concept or Formula",
      "definition": "Clear student-friendly definition",
      "exampleOrFormula": "Concrete equation or practical example"
    }
  ],
  "focusAreas": [
    {
      "topic": "High-priority topic",
      "importance": "critical" | "high" | "medium",
      "examTips": "Specific advice on how this will likely be tested",
      "pitfalls": "Common mistake students make on exams"
    }
  ],
  "studyPlan": [
    {
      "id": "plan-1",
      "dayOrSession": "Session 1 (Day 1)",
      "focusTopic": "Topic Name",
      "studyAction": "Active recall prompt, e.g., 'Review Flashcards 1-5 and diagram the Krebs cycle from memory'",
      "durationMinutes": 25
    }
  ]
}

Provide 6 to 8 flashcards, 5 to 6 quiz questions, 5 key terms/formulas, 3 to 4 focus areas, and 4 to 5 study plan sessions.`;

    const prompt = `Topic: ${title} (${subject})
Student Notes:
"""
${notes.slice(0, 30000)}
"""

Generate the complete JSON study kit now.`;

    const response = await generateWithResilience({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = (response.text || "").trim();
    // Clean code block fences if any
    const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsedData = JSON.parse(cleanedJson);

    res.json(parsedData);
  } catch (err: any) {
    console.error("Study kit generation error:", formatErrorMessage(err));
    res.status(500).json({
      error: formatErrorMessage(err) || "Failed to generate study kit. Please try again.",
    });
  }
});

// 3. Interactive AI Tutor Chat with Zygard & AI Professors
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, notesContext = "", mode = "tutor", professorId = "kevin", studentProfile } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Please provide a conversation history." });
    }

    const prof = PROFESSOR_DIRECTIVES[professorId] || PROFESSOR_DIRECTIVES.kevin;

    let personaDirective = "";
    if (mode === "quiz-me") {
      personaDirective = "You are in 'Oral Exam / Socratic Quiz' mode. Ask the student one sharp conceptual question at a time to test their recall. When they answer, grade them constructively, explain any nuance, and ask the next question.";
    } else if (mode === "explain-simple") {
      personaDirective = "You are in 'Explain Like I'm 5 / Intuitive Tutor' mode. Use vivid analogies, simple mechanics, and break down intimidation without dumbing down the core truth.";
    } else if (mode === "exam-strategist") {
      personaDirective = "You are in 'Exam Tactician' mode. Focus on scoring rubrics, how to write answers for full credit, common professor trick questions, and time-management tips.";
    } else {
      personaDirective = "You are in 'Comprehensive Study Buddy' mode. Answer questions accurately, reference the student's notes, provide clear examples, and encourage deep retention.";
    }

    const studentInfo = studentProfile
      ? `Student: ${studentProfile.username || 'Student'}\nEducation Level: ${studentProfile.educationLevel || 'Student'}\nEnrolled Subjects: ${(studentProfile.subjects || []).join(', ')}\nAddress them naturally as ${studentProfile.username || 'Student'}, framing explanations to their chosen subjects.`
      : "";

    const systemInstruction = `You are ${prof.name} (${prof.title}) on the Zygard AI Faculty team.
${prof.prompt}

${studentInfo ? `Personalized Student Info:\n${studentInfo}\n` : ""}
${personaDirective}

Context from Student's Notes:
"""
${notesContext ? notesContext.slice(0, 20000) : "No notes uploaded yet. Help the student with their study topic or answer general questions."}
"""

Guidelines:
- Keep answers structured, engaging, and easy to skim.
- Use bold text for key terminology.
- CRITICAL EQUATION RULE: If any chemical reaction or mathematical formula is mentioned (such as Pyruvate + CoA-SH + NAD+ -> Acetyl-CoA + CO2 + NADH), NEVER leave it as an abstract string alone. Always provide:
  1. LaTeX display ($$ ... $$)
  2. An intuitive "Plain-English Molecular Translation" describing what went in, what changed, and what came out.
  3. A quick memory hook or exam trap.
- At the end of your response, always include 2 to 3 suggested quick follow-up prompts on separate lines prefixed with '>> SUGGESTION: ' so the student can easily click them (e.g., '>> SUGGESTION: Quiz me on this step').`;

    const chatContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "zygard" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await generateWithResilience({
      contents: chatContents as any,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const fullText = response.text || "";
    // Parse out suggestions
    const lines = fullText.split("\n");
    const suggestions: string[] = [];
    const textLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith(">> SUGGESTION:")) {
        const suggestion = line.replace(">> SUGGESTION:", "").trim();
        if (suggestion) suggestions.push(suggestion);
      } else {
        textLines.push(line);
      }
    }

    res.json({
      reply: textLines.join("\n").trim(),
      suggestedFollowUps: suggestions.length > 0 ? suggestions.slice(0, 3) : [
        "Can you test me on this?",
        "Give me a real-world analogy",
        "What's a likely exam question for this?"
      ],
      professor: {
        id: professorId,
        name: prof.name,
        title: prof.title,
      },
    });
  } catch (err: any) {
    console.error("Chat error:", formatErrorMessage(err));
    res.status(500).json({
      error: formatErrorMessage(err) || "Failed to get response from Zygard.",
    });
  }
});

// 4. Grade Student Practice Answer
app.post("/api/grade-answer", async (req, res) => {
  try {
    const { question, idealAnswer, studentAnswer, maxScore = 10 } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: "Question and student answer are required." });
    }

    const ai = getAI();
    const systemInstruction = `You are Zygard evaluating an exam response.
Grade the student's answer fairly and constructively on a scale of 0 to ${maxScore}.
Respond ONLY with JSON:
{
  "score": number,
  "maxScore": ${maxScore},
  "verdict": "Outstanding" | "Good Progress" | "Needs Review",
  "strengths": ["string"],
  "missedConcepts": ["string"],
  "modelAnswer": "Clear, concise ideal exam answer that earns full marks",
  "zygardTip": "Actionable advice for the actual test"
}`;

    const prompt = `Question: ${question}
Standard / Target Concepts: ${idealAnswer || "Standard academic curriculum accuracy"}
Student Answer:
"""
${studentAnswer}
"""

Evaluate and return JSON now.`;

    const response = await generateWithResilience({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const raw = (response.text || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err: any) {
    console.error("Grading error:", formatErrorMessage(err));
    res.status(500).json({ error: formatErrorMessage(err) || "Could not grade answer." });
  }
});

// 5. Question Scanner (Multimodal OCR, Solver & Concept Tutor)
app.post("/api/scan-question", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", studentProfile, additionalNote } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "Please provide a valid question image to scan." });
    }

    const ai = getAI();

    // Clean data URL prefix if present
    let rawBase64 = imageBase64;
    let detectedMime = mimeType;
    const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      rawBase64 = match[2];
    }

    const studentContext = studentProfile
      ? `Student: ${studentProfile.username || 'Student'}\nAcademic Level: ${studentProfile.educationLevel || 'Standard'}\nTarget Subjects: ${(studentProfile.subjects || []).join(', ')}`
      : "";

    const systemInstruction = `You are Zygard's Vision Exam Solver & Concept Mentor.
Your mission is to examine images of questions (printed exams, textbooks, assignments, graphs, diagrams, or handwritten problems) and provide a flawless, pedagogical breakdown.
${studentContext ? `Student Context:\n${studentContext}\n` : ""}

You must respond with ONLY a valid JSON object (no markdown ticks, no preamble) with the following structure:
{
  "extractedQuestion": "Precise transcription of the question, including options A/B/C/D if multiple choice, and description of any diagrams/tables",
  "subject": "e.g., Physics, Calculus, Organic Chemistry, Biology, Economics",
  "topic": "Specific chapter or topic (e.g. Kinematics, Stoichiometry, Integration by Parts)",
  "difficulty": "Easy" | "Medium" | "Hard" | "Exam Level",
  "questionType": "Multiple Choice" | "Numerical Calculation" | "Conceptual / Free Response" | "Derivation / Proof",
  "finalAnswer": "Concise direct final answer with units or option letter (e.g., 'Option C: 24.5 m/s' or 'x = 3, y = -1')",
  "stepByStepSolution": [
    "Step 1: Identify given variables and what to solve...",
    "Step 2: State the governing equation...",
    "Step 3: Substitute values and calculate...",
    "Step 4: Final verification and sanity check..."
  ],
  "keyFormulasOrRules": [
    "Formula or fundamental law used 1",
    "Rule or theorem 2"
  ],
  "commonMistakes": "Key pitfalls and exam traps where students commonly lose points on this question",
  "similarPracticeQuestion": {
    "question": "A similar practice question testing the same concept",
    "solution": "Concise solution to the practice question"
  }
}`;

    const promptText = `Scan this question image, solve it step-by-step with complete mathematical and conceptual rigor, and return the JSON analysis.${additionalNote ? ` Student instruction: ${additionalNote}` : ""}`;

    const response = await generateWithResilience({
      contents: {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: detectedMime,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const raw = (response.text || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err: any) {
    console.error("Question scanner error:", formatErrorMessage(err));
    res.status(500).json({ error: formatErrorMessage(err) || "Failed to scan and solve question. Please try a clearer image." });
  }
});

// 6. Explain Chemical or Math Equation with 4 AI Professors
app.post("/api/explain-equation", async (req, res) => {
  try {
    const { equation, professorId = "kevin" } = req.body;

    if (!equation || typeof equation !== "string" || !equation.trim()) {
      return res.status(400).json({ error: "Please provide an equation or reaction to explain." });
    }

    const prof = PROFESSOR_DIRECTIVES[professorId] || PROFESSOR_DIRECTIVES.kevin;

    const systemInstruction = `You are ${prof.name} (${prof.title}).
${prof.prompt}

Your task: A student is finding this chemical reaction or mathematical/physics equation difficult to understand and intimidating.
Break it down so any student can understand it effortlessly.
Respond ONLY with a JSON object in this exact schema:
{
  "plainEnglishStory": "A crystal-clear, intuitive explanation of the equation in 2-3 sentences using zero pretension (e.g. for Pyruvate + CoA-SH + NAD+ -> Acetyl-CoA + CO2 + NADH, explain: A 3-carbon fuel piece drops 1 carbon as exhaled CO2, charges up an energy battery NADH, and attaches to a delivery handle CoA so it can enter the Krebs cycle)",
  "stepByStep": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "examTraps": ["Common exam trap 1", "Common exam trap 2"],
  "memoryHook": "A catchy, intuitive mnemonic or memory trick",
  "recommendedStudyTip": "Advice on how examiners test this equation"
}`;

    const promptText = `Please analyze and translate this equation/reaction for a student:
"""
${equation.trim()}
"""`;

    const response = await generateWithResilience({
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const raw = (response.text || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(raw);
    res.json({
      ...parsed,
      professor: {
        id: professorId,
        name: prof.name,
        title: prof.title,
      },
    });
  } catch (err: any) {
    console.error("Explain equation error:", formatErrorMessage(err));
    res.status(500).json({ error: formatErrorMessage(err) || "Failed to explain equation. Please try again." });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Zygard AI Bot server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
