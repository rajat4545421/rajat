export interface MoleculeRole {
  name: string;
  formula: string;
  badge: string;
  color: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
  plainEnglishRole: string;
  carbonCount?: string;
  details: string;
}

export interface EquationBreakdown {
  id: string;
  title: string;
  subject: string;
  recommendedProfessorId: 'kevin' | 'steve' | 'max' | 'elena';
  rawLatex: string;
  plainEnglishStory: string;
  reactionContext: string;
  whereItHappens: string;
  reactants: MoleculeRole[];
  products: MoleculeRole[];
  theTransformer: {
    name: string;
    description: string;
  };
  theThreeKeySteps: {
    title: string;
    description: string;
    icon: string;
  }[];
  examTraps: string[];
  memoryHook: string;
}

export const FEATURED_EQUATIONS: EquationBreakdown[] = [
  {
    id: 'pyruvate-link-reaction',
    title: 'The Pyruvate Link Reaction (Bridge to Krebs Cycle)',
    subject: 'Biochemistry & Cellular Respiration',
    recommendedProfessorId: 'kevin',
    rawLatex: '\\text{Pyruvate} + \\text{CoA-SH} + \\text{NAD}^+ \\longrightarrow \\text{Acetyl-CoA} + \\text{CO}_2 + \\text{NADH}',
    plainEnglishStory: 'A 3-carbon food fragment from glucose (Pyruvate) is trimmed down to a 2-carbon unit by exhaling 1 carbon as CO₂, while charging up an energy battery (NADH) and attaching to a molecular delivery tag (Coenzyme A) so it can enter the powerhouse Krebs Cycle.',
    reactionContext: 'Connects Glycolysis (in the cytoplasm) to the Citric Acid / Krebs Cycle (in the mitochondrial matrix).',
    whereItHappens: 'Mitochondrial Matrix in eukaryotic cells (or cytoplasm in prokaryotes).',
    theTransformer: {
      name: 'Pyruvate Dehydrogenase Multi-Enzyme Complex (PDH)',
      description: 'A massive biological machine combining 3 distinct enzymes and 5 cofactors (including Thiamine/B1) that catalyzes decarboxylation and oxidation in one continuous coordinated step.',
    },
    reactants: [
      {
        name: 'Pyruvate',
        formula: 'CH_3COCOO^-',
        badge: '3-Carbon Raw Fuel',
        color: 'emerald',
        plainEnglishRole: 'The leftover half of a glucose molecule manufactured during glycolysis.',
        carbonCount: '3 Carbons (3C)',
        details: 'High-energy organic substrate ready for oxidative breakdown.',
      },
      {
        name: 'CoA-SH (Coenzyme A)',
        formula: 'CoA-SH',
        badge: 'Molecular Delivery Truck',
        color: 'amber',
        plainEnglishRole: 'A molecular carrier with an active thiol (-SH) hook that grabs acetyl groups.',
        carbonCount: 'Carrier Tag',
        details: 'Derived from Vitamin B5 (pantothenic acid). Forms a high-energy thioester bond with the 2C acetyl fragment.',
      },
      {
        name: 'NAD⁺',
        formula: 'NAD^+',
        badge: 'Empty Battery Charger',
        color: 'blue',
        plainEnglishRole: 'The electron taxi waiting to pick up 2 high-energy electrons and a proton.',
        carbonCount: 'Electron Carrier',
        details: 'Oxidized nicotinamide adenine dinucleotide (derived from Vitamin B3 / Niacin).',
      },
    ],
    products: [
      {
        name: 'Acetyl-CoA',
        formula: 'CH_3CO-SCoA',
        badge: '2-Carbon VIP Ticket to Krebs',
        color: 'purple',
        plainEnglishRole: 'The activated fuel that merges with oxaloacetate inside the Citric Acid Cycle.',
        carbonCount: '2 Carbons (2C)',
        details: 'Contains an unstable high-energy thioester bond that releases immense energy when cleaved.',
      },
      {
        name: 'Carbon Dioxide (CO₂)',
        formula: 'CO_2',
        badge: 'Exhaled Waste Gas',
        color: 'slate',
        plainEnglishRole: 'The 1st carbon atom expelled from food that diffuses into blood and out of your lungs.',
        carbonCount: '1 Carbon (1C)',
        details: 'The result of oxidative decarboxylation. Carbon count is conserved: 3C = 2C + 1C.',
      },
      {
        name: 'NADH',
        formula: 'NADH + H^+',
        badge: 'Fully Charged Battery',
        color: 'emerald',
        plainEnglishRole: 'A battery loaded with high-energy electrons traveling straight to the Electron Transport Chain.',
        carbonCount: 'Energy Carrier',
        details: 'Each NADH will power the pumping of protons across the inner mitochondrial membrane, generating ~2.5 ATP.',
      },
    ],
    theThreeKeySteps: [
      {
        title: 'Step 1: Decarboxylation (Losing 1 Carbon)',
        description: 'Enzyme chops off the carboxyl group (-COO⁻) from Pyruvate, releasing it as CO₂ gas. The 3-carbon molecule shrinks to a 2-carbon hydroxyethyl group.',
        icon: '✂️',
      },
      {
        title: 'Step 2: Oxidation (Harvesting High-Energy Electrons)',
        description: 'The 2-carbon fragment is oxidized (loses electrons and hydrogens). NAD⁺ swoops in and gets reduced to high-energy NADH.',
        icon: '⚡',
      },
      {
        title: 'Step 3: Transfer to CoA (Arming the Molecule)',
        description: 'The remaining 2-carbon acetyl group is linked to Coenzyme A by a high-energy sulfur bond, creating Acetyl-CoA ready for the Krebs Cycle.',
        icon: '🔗',
      },
    ],
    examTraps: [
      '⚠️ Remember the Glucose Multiplier: 1 single Glucose molecule produces 2 Pyruvates. Therefore, double everything! For 1 Glucose: 2 Pyruvate + 2 CoA + 2 NAD⁺ ➔ 2 Acetyl-CoA + 2 CO₂ + 2 NADH.',
      '⚠️ Is ATP directly synthesized here? NO! Zero ATP is made directly in this reaction. Energy is conserved exclusively as NADH.',
      '⚠️ First CO₂ in Respiration: This is the very first step in cellular respiration where carbon dioxide is released (glycolysis produced zero CO₂).',
    ],
    memoryHook: '💡 The "Cut, Charge, Tag" Rule: Cut off a CO₂, Charge an NADH battery, Tag on Coenzyme A!',
  },
  {
    id: 'photosynthesis-net-reaction',
    title: 'Photosynthesis Net Equation',
    subject: 'Biology & Bioenergetics',
    recommendedProfessorId: 'kevin',
    rawLatex: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light Energy} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    plainEnglishStory: 'Plants inhale carbon dioxide from the air and drink water from their roots, then use sunlight to rearrange those atoms into sweet sugar (glucose food) and exhale clean oxygen gas for us to breathe.',
    reactionContext: 'Chloroplasts: Light-dependent reactions in thylakoid membranes + Calvin Cycle in the stroma.',
    whereItHappens: 'Chloroplasts of green plant cells.',
    theTransformer: {
      name: 'Chlorophyll Photocomplexes & RuBisCO',
      description: 'Photosystems I & II trap photons to split water, while RuBisCO fixes atmospheric CO₂ into stable hexose sugars.',
    },
    reactants: [
      {
        name: 'Carbon Dioxide (6 CO₂)',
        formula: '6CO_2',
        badge: 'Air Carbon Source',
        color: 'slate',
        plainEnglishRole: 'Diffuses in through leaf stomata to build the sugar backbone.',
        carbonCount: '6 Carbons total',
        details: 'Fixed during the light-independent Calvin Cycle.',
      },
      {
        name: 'Water (6 H₂O)',
        formula: '6H_2O',
        badge: 'Electron Donor & Drink',
        color: 'blue',
        plainEnglishRole: 'Absorbed by roots; split by light to provide hydrogen ions and electrons.',
        carbonCount: '0 Carbons',
        details: 'Photolysis of water creates the oxygen we breathe!',
      },
      {
        name: 'Photons (Sunlight)',
        formula: 'h\\nu',
        badge: 'Solar Energy Input',
        color: 'amber',
        plainEnglishRole: 'Excites chlorophyll electrons to drive ATP and NADPH synthesis.',
        carbonCount: 'Pure Energy',
        details: 'Absorbed predominantly in blue (430nm) and red (660nm) spectrums.',
      },
    ],
    products: [
      {
        name: 'Glucose (C₆H₁₂O₆)',
        formula: 'C_6H_{12}O_6',
        badge: 'Chemical Stored Fuel',
        color: 'emerald',
        plainEnglishRole: 'Dense high-energy sugar used for plant growth, starch, and cellulose.',
        carbonCount: '6 Carbons (Hexose)',
        details: 'Stores ~2870 kJ/mol of chemical bond energy.',
      },
      {
        name: 'Oxygen Gas (6 O₂)',
        formula: '6O_2',
        badge: 'Byproduct of Water Splitting',
        color: 'purple',
        plainEnglishRole: 'Exhaled waste product released through leaf stomata into the atmosphere.',
        carbonCount: '0 Carbons',
        details: 'Exam Trap: The oxygen comes from splitting H₂O, NEVER from CO₂!',
      },
    ],
    theThreeKeySteps: [
      {
        title: 'Step 1: Water Splitting (Photolysis)',
        description: 'Light hits Photosystem II and tears water apart into protons, electrons, and O₂ gas.',
        icon: '💧',
      },
      {
        title: 'Step 2: Energy Carrier Generation',
        description: 'Electrons flow down an electron transport chain to forge ATP and reduce NADP⁺ into NADPH.',
        icon: '⚡',
      },
      {
        title: 'Step 3: Carbon Fixation (Calvin Cycle)',
        description: 'ATP and NADPH power RuBisCO to fuse gaseous CO₂ into solid, delicious glucose molecules.',
        icon: '🌱',
      },
    ],
    examTraps: [
      '⚠️ Where does the oxygen come from? Radioactive oxygen isotope tracking proved that all exhaled O₂ originates from H₂O, not from CO₂!',
      '⚠️ Dark Reactions do not need darkness: The Calvin cycle is light-independent, but it still shuts down at night because it requires fresh ATP/NADPH made in the light.',
    ],
    memoryHook: '💡 Remember "Water Gives Oxygen, Air Gives Sugar": H₂O becomes O₂, CO₂ becomes C₆H₁₂O₆!',
  },
  {
    id: 'newtons-second-law',
    title: "Newton's Second Law & Momentum Formulation",
    subject: 'Physics & Classical Mechanics',
    recommendedProfessorId: 'max',
    rawLatex: '\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} = m\\vec{a}',
    plainEnglishStory: 'The net push or pull you exert on an object is equal to how quickly its momentum changes over time. If the object’s mass stays constant, the force simply equals its mass multiplied by its acceleration.',
    reactionContext: 'Fundamental law governing all classical translational motion in inertial reference frames.',
    whereItHappens: 'Everywhere in the universe at non-relativistic speeds ($v \\ll c$).',
    theTransformer: {
      name: 'Inertial Reference Frame Dynamics',
      description: 'Defines how unbalanced external forces break equilibrium and cause velocities to change.',
    },
    reactants: [
      {
        name: 'Net Force (F_net)',
        formula: '\\vec{F}_{\\text{net}}',
        badge: 'Vector Push / Pull',
        color: 'rose',
        plainEnglishRole: 'The vector sum of ALL simultaneous forces acting on the body.',
        carbonCount: 'Newtons (kg·m/s²)',
        details: 'If F_net = 0, acceleration is zero (Newton’s 1st Law).',
      },
    ],
    products: [
      {
        name: 'Mass (m)',
        formula: 'm',
        badge: 'Inertial Resistance',
        color: 'slate',
        plainEnglishRole: 'The quantity of matter; a measure of how stubborn the object is to changing speed.',
        carbonCount: 'Kilograms (kg)',
        details: 'Scalar quantity, always positive in classical physics.',
      },
      {
        name: 'Acceleration (a)',
        formula: '\\vec{a}',
        badge: 'Rate of Velocity Change',
        color: 'blue',
        plainEnglishRole: 'How quickly the object speeds up, slows down, or changes direction.',
        carbonCount: 'm/s²',
        details: 'Acceleration ALWAYS points in the exact same vector direction as F_net.',
      },
    ],
    theThreeKeySteps: [
      {
        title: 'Step 1: Draw the Free Body Diagram',
        description: 'Isolate the object and draw every real contact and non-contact force acting on it.',
        icon: '📐',
      },
      {
        title: 'Step 2: Vector Component Resolution',
        description: 'Split forces into perpendicular axes: ΣF_x = m·a_x and ΣF_y = m·a_y.',
        icon: '➕',
      },
      {
        title: 'Step 3: Solve for the Missing Kinematic Quantity',
        description: 'Calculate unknown acceleration, friction, tension, or normal force.',
        icon: '🎯',
      },
    ],
    examTraps: [
      '⚠️ Net Force vs Individual Force: m·a is NOT a force you draw on a free-body diagram! m·a is the RESULT of adding up all forces.',
      '⚠️ Variable Mass: For rockets burning fuel, you must use F = dp/dt = m(dv/dt) + v(dm/dt), not simply F = ma!',
    ],
    memoryHook: '💡 Push harder = accelerate faster. Heavier object = accelerate slower. F = ma!',
  },
];
