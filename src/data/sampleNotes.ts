export interface SampleNote {
  id: string;
  title: string;
  subject: string;
  preview: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    id: 'sample-biology',
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Biology / Biochemistry',
    preview: 'Glycolysis, Krebs Cycle, Electron Transport Chain, Chemiosmosis and Net ATP yields.',
    content: `CELLULAR RESPIRATION & ENERGY HARVESTING

1. Overview:
Cellular respiration is the catabolic biochemical pathway by which organisms break down glucose (C6H12O6) in the presence of oxygen (O2) to synthesize adenosine triphosphate (ATP), releasing carbon dioxide (CO2) and water (H2O) as metabolic byproducts.
Overall reaction equation: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.

2. Stage 1: Glycolysis (Location: Cytoplasm / Cytosol)
- Anaerobic process (does NOT require O2).
- Phase 1 (Energy Investment): Requires 2 ATP molecules to phosphorylate glucose into fructose-1,6-bisphosphate.
- Phase 2 (Energy Payoff): Generates 4 ATP via substrate-level phosphorylation and 2 NADH molecules.
- Net Yield per glucose: 2 Net ATP, 2 NADH, 2 molecules of Pyruvate (3 carbons each).
- Rate-limiting enzyme: Phosphofructokinase-1 (PFK-1), allosterically inhibited by high ATP and citrate, activated by AMP.

3. Intermediate Step: Pyruvate Oxidation / Link Reaction (Location: Mitochondrial Matrix)
- Chemical Equation: Pyruvate + CoA-SH + NAD+ -> Acetyl-CoA + CO2 + NADH
- Each pyruvate enters the mitochondria via pyruvate translocase.
- Converted into Acetyl-CoA by Pyruvate Dehydrogenase Complex (PDC).
- Generates 1 NADH and 1 CO2 per pyruvate (Total for 1 glucose: 2 NADH, 2 CO2, 2 Acetyl-CoA).

4. Stage 2: Citric Acid Cycle / Krebs Cycle (Location: Mitochondrial Matrix)
- 2-carbon Acetyl-CoA joins with 4-carbon Oxaloacetate (OAA) to form 6-carbon Citrate (catalyzed by Citrate Synthase).
- Two decarboxylation steps release 2 CO2 per turn.
- Per turn of the cycle (1 Acetyl-CoA): 3 NADH, 1 FADH2, 1 GTP (equivalent to 1 ATP), 2 CO2.
- Since 1 glucose yields 2 Acetyl-CoA: Total cycle yield per glucose is 6 NADH, 2 FADH2, 2 ATP/GTP, 4 CO2.

5. Stage 3: Oxidative Phosphorylation (Location: Inner Mitochondrial Membrane / Cristae)
- Part A: Electron Transport Chain (ETC): Complexes I, II, III, IV.
  - Complex I (NADH dehydrogenase) receives electrons from NADH, pumps 4 H+ into intermembrane space.
  - Complex II (Succinate dehydrogenase) accepts electrons from FADH2 (does not pump protons).
  - Mobile electron carriers: Ubiquinone (CoQ) and Cytochrome c.
  - Final electron acceptor: Molecular Oxygen (O2), which combines with protons to form H2O.
- Part B: Chemiosmosis & ATP Synthase:
  - The proton gradient (proton motive force) across the inner membrane drives protons back into matrix through ATP Synthase (F0F1 complex).
  - Rotation of ATP synthase catalytic head phosphorylates ADP into ATP.
  - Net yield: ~2.5 ATP per NADH, ~1.5 ATP per FADH2.
  - Total theoretical net yield per glucose: ~30 to 32 ATP.

6. Anaerobic Fermentation:
- When O2 is absent, ETC halts.
- Lactic acid fermentation occurs in human skeletal muscle during intense exercise (Pyruvate reduced to Lactate by Lactate Dehydrogenase, regenerating NAD+ so glycolysis can continue).
- Alcohol fermentation occurs in yeast (Pyruvate -> Acetaldehyde -> Ethanol + CO2).`
  },
  {
    id: 'sample-cs',
    title: 'Algorithm Complexity & Big-O Notation',
    subject: 'Computer Science',
    preview: 'Asymptotic analysis, time vs space tradeoffs, common sorting & searching bounds.',
    content: `ALGORITHMIC ANALYSIS & DATA STRUCTURE PERFORMANCE

1. Concept of Asymptotic Notation:
- Used to describe the mathematical upper bound and performance of algorithms as the input size (n) approaches infinity.
- Big-O (O): Worst-case upper bound.
- Big-Omega (Ω): Best-case lower bound.
- Big-Theta (Θ): Tight bound (both upper and lower).

2. Common Time Complexities (Fastest to Slowest):
- O(1) Constant Time: Direct array indexing, hash table lookups (average case), push/pop on stack.
- O(log n) Logarithmic Time: Binary Search on sorted arrays, balanced binary search tree lookups.
- O(n) Linear Time: Linear search, traversing an array or linked list once.
- O(n log n) Linearithmic Time: Optimal comparison sorts: Merge Sort, Heap Sort, Quick Sort (average case).
- O(n^2) Quadratic Time: Nested loops, Bubble Sort, Insertion Sort, Selection Sort (worst case).
- O(2^n) Exponential Time: Recursive Fibonacci without memoization, generating all subsets of a set.
- O(n!) Factorial Time: Traveling Salesperson Problem brute-force permutation.

3. Sorting Algorithms Comparison:
- Merge Sort:
  - Best: O(n log n), Average: O(n log n), Worst: O(n log n).
  - Space complexity: O(n) auxiliary memory. Stable sort. Divide and conquer.
- Quick Sort:
  - Best: O(n log n), Average: O(n log n), Worst: O(n^2) (occurs when bad pivot chosen on already sorted input).
  - Space: O(log n) call stack. In-place, generally faster in cache performance.
- Insertion Sort:
  - Best: O(n) when nearly sorted. Worst: O(n^2). Great for tiny arrays (n < 20).

4. Space-Time Tradeoffs:
- Dynamic Programming & Memoization: Sacrifices O(n) memory to reduce exponential O(2^n) recursion down to O(n) time.
- Hash Tables: Average lookup O(1), but collision chaining or open addressing degrades to O(n) in worst case.`
  },
  {
    id: 'sample-history',
    title: 'Origins & Outbreak of World War I',
    subject: 'History',
    preview: 'The M-A-I-N catalysts, July Crisis of 1914, Balkan powder keg, and alliance domino effect.',
    content: `ORIGINS AND CATALYSTS OF WORLD WAR I (1914-1918)

1. The M-A-I-N Long-Term Causes:
- M - Militarism:
  - Anglo-German Naval Arms Race: Britain built HMS Dreadnought (1906); Kaiser Wilhelm II attempted to rival the Royal Navy with Tirpitz plan.
  - Standing armies grew drastically across Continental Europe. Military timetables (Schlieffen Plan) created rigid mobilization imperatives.
- A - Alliances:
  - Triple Entente: Britain, France, Russia.
  - Triple Alliance: Germany, Austria-Hungary, Italy (Italy later defected in 1915).
  - Mutual defense pacts guaranteed that a localized dispute would trigger a pan-European conflagration.
- I - Imperialism:
  - Scramble for Africa and rivalry over overseas colonies and raw materials.
  - First Moroccan Crisis (1905) and Agadir Crisis (1911) inflamed Franco-German hostility.
- N - Nationalism:
  - Pan-Slavism: Russian backing of Slavic aspirations in the Balkans.
  - Balkan Powder Keg: Decline of the Ottoman Empire led to regional volatility (Balkan Wars 1912-1913).

2. The Catalyst: The July Crisis (1914):
- June 28, 1914: Archduke Franz Ferdinand (heir to Austro-Hungarian throne) and his wife Sophie were assassinated in Sarajevo by Gavrilo Princip, a member of the Serbian nationalist group 'Black Hand'.
- July 5: Germany issues the "Blank Cheque" to Austria-Hungary, pledging unconditional support against Serbia.
- July 23: Austria-Hungary sends a harsh 10-point Ultimatum to Serbia intentionally formulated to be rejected.
- July 28: Austria-Hungary declares war on Serbia.

3. The Domino Effect of Mobilization:
- July 30: Russia begins full mobilization to protect Serbia.
- August 1: Germany declares war on Russia; France mobilizes.
- August 3: Germany declares war on France and activates the Schlieffen Plan (invading neutral Belgium to bypass French border fortresses).
- August 4: Great Britain declares war on Germany for violating Belgian neutrality (1839 Treaty of London).`
  }
];
