// Generates high-fidelity exam question images onto a canvas for instant scanning demo
export interface SampleQuestionSpec {
  id: string;
  title: string;
  subject: string;
  promptText: string;
  difficulty: string;
}

export const SAMPLE_QUESTIONS: SampleQuestionSpec[] = [
  {
    id: 'physics-projectile',
    title: 'Physics: Projectile Trajectory',
    subject: 'Physics',
    difficulty: 'AP / College Exam',
    promptText: `EXAM QUESTION - SECTION B: CLASSICAL MECHANICS
Q3. A projectile is launched from ground level with an initial velocity of v₀ = 40 m/s at an angle of θ = 30° above the horizontal. Neglecting air resistance and taking g = 9.8 m/s²:
(a) Determine the maximum height H reached by the projectile.
(b) Calculate the total time of flight T before it returns to ground level.
(c) Find the horizontal range R of the projectile.`
  },
  {
    id: 'calculus-integral',
    title: 'Math: Definite Integration by Parts',
    subject: 'Calculus',
    difficulty: 'University Calculus',
    promptText: `MATHEMATICS TRIPOS - CALCULUS & ANALYSIS
Problem 4 (6 Marks):
Evaluate the definite integral:
        ∫ [from 0 to π/2]  x · cos(2x) dx

Show all integration by parts steps clearly, specifying your choice of u and dv, and evaluate the final exact rational/pi value.`
  },
  {
    id: 'chem-equilibrium',
    title: 'Chemistry: Le Chatelier & Kp',
    subject: 'Chemistry',
    difficulty: 'AP Chemistry / General Chem',
    promptText: `DEPARTMENT OF CHEMISTRY - CHEMICAL EQUILIBRIUM
Question 2:
For the exothermic Haber process reaction:
        N₂(g) + 3H₂(g) ⇌ 2NH₃(g)    ΔH° = -92.4 kJ/mol

At 500 K, the equilibrium partial pressures are:
P(N₂) = 1.2 atm, P(H₂) = 0.80 atm, P(NH₃) = 2.4 atm.
(a) Calculate the equilibrium constant Kp at 500 K.
(b) If the container volume is halved at constant temperature, state in which direction the system shifts to re-establish equilibrium, explaining why via the reaction quotient Qp.`
  },
  {
    id: 'bio-genetics',
    title: 'Biology: Hardy-Weinberg Equilibrium',
    subject: 'Biology',
    difficulty: 'Genetics Exam',
    promptText: `GENETICS & EVOLUTION - SHORT ANSWER
Q7. In a population of 10,000 students, 1600 are unable to taste the bitter chemical PTC (phenylthiocarbamide), which is an autosomal recessive trait governed by allele (t).
Assuming the population is in Hardy-Weinberg equilibrium:
(a) Calculate the frequency of the recessive allele (q) and dominant allele (p).
(b) Calculate the percentage of the population expected to be heterozygous carriers (Tt).
(c) How many individuals in this population are homozygous dominant (TT)?`
  }
];

export function renderQuestionImageToDataUrl(spec: SampleQuestionSpec): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - clean exam paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid/ruled lines like an exam booklet
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let y = 40; y < canvas.height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(canvas.width - 30, y);
    ctx.stroke();
  }

  // Left red margin line
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, canvas.height);
  ctx.stroke();

  // Header banner
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NATIONAL EXAMINATIONS BOARD • CANDIDATE WORKSHEET', 100, 36);

  ctx.fillStyle = '#059669';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`SUBJECT: ${spec.subject.toUpperCase()}  |  DIFFICULTY: ${spec.difficulty.toUpperCase()}`, 100, 56);

  // Divider
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 68);
  ctx.lineTo(canvas.width - 40, 68);
  ctx.stroke();

  // Question Body Text
  ctx.fillStyle = '#1e293b';
  ctx.font = '15px "JetBrains Mono", monospace';
  
  const lines = spec.promptText.split('\n');
  let currentY = 105;

  lines.forEach((line) => {
    // Check if header line
    if (line.startsWith('EXAM') || line.startsWith('MATHEMATICS') || line.startsWith('DEPARTMENT') || line.startsWith('GENETICS')) {
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(line, 100, currentY);
      currentY += 26;
      ctx.fillStyle = '#1e293b';
      ctx.font = '15px "JetBrains Mono", monospace';
    } else {
      ctx.fillText(line, 100, currentY);
      currentY += 25;
    }
  });

  // Footer mark
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Hallmark: Made by Rajat • Powered by Zygard Vision Engine', 100, canvas.height - 25);

  return canvas.toDataURL('image/png');
}
