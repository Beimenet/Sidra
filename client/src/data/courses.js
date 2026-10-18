/**
 * courses.js — Sidra Demo Course Data
 *
 * These are demonstration courses created for layout and design purposes.
 * They are NOT verified or published educational programs.
 * Instructors, curricula, and resources are illustrative only.
 *
 * To edit a course: update the relevant object in the COURSES array below.
 * To add a course:  copy an existing object, assign a new unique `id`, and fill in the fields.
 * To remove a course: delete its object from the array.
 *
 * Prices are illustrative demo values in Ethiopian Birr (ETB).
 * They do not represent confirmed final pricing.
 */

// ─── Category constants — edit these to add or rename categories ──────────────
export const CATEGORIES = [
  'Parenting Fundamentals',
  'Child Development',
  'Positive Parenting',
  'Child Behavior & Emotional Development',
  'Special & Inclusive Needs',
  'Family Wellbeing',
  'Early Childhood Development',
]

// ─── Level constants ──────────────────────────────────────────────────────────
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

// ─── Format constants ─────────────────────────────────────────────────────────
export const FORMATS = ['Video', 'Reading', 'Mixed', 'Downloadable Resources']

// ─── Helper: format price for display ────────────────────────────────────────
export function formatPrice(price) {
  if (price === 0) return 'Free'
  return `ETB ${price.toLocaleString()}`
}

// ─── Course data ──────────────────────────────────────────────────────────────
export const COURSES = [
  {
    id: 1,
    slug: 'parenting-fundamentals-strong-family-foundation',
    title: 'Parenting Fundamentals: Building a Strong Family Foundation',
    shortDescription:
      'Explore the core principles of nurturing, consistent parenting and learn how strong family foundations support children\'s lifelong development.',
    fullDescription:
      'This introductory course covers the essential building blocks of healthy family life. You will explore how daily routines, clear boundaries, warm communication, and consistent caregiving contribute to a secure and supportive home environment. The course is suitable for all parents and caregivers, regardless of their experience level.',
    category: 'Parenting Fundamentals',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 0,
    lessonCount: 6,
    duration: '1 hr 45 min',
    thumbnail: null, // Replace with imported image path when available
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Understand the key principles of supportive, consistent parenting',
      'Identify how daily routines contribute to a child\'s sense of security',
      'Recognise the role of family communication in child wellbeing',
      'Apply practical strategies for setting fair, consistent boundaries',
    ],
    audience: 'Parents, caregivers, and guardians of children of any age who want to build or strengthen their family foundation.',
    modules: [
      {
        id: 'm1-1',
        title: 'What Makes a Strong Family?',
        lessons: [
          { id: 'l1-1-1', title: 'Welcome and Course Overview', duration: '5 min', type: 'video', preview: true },
          { id: 'l1-1-2', title: 'The Building Blocks of Family Life', duration: '12 min', type: 'video', preview: false },
          { id: 'l1-1-3', title: 'Reflection: Your Family\'s Strengths', duration: '10 min', type: 'reading', preview: false },
        ],
      },
      {
        id: 'm1-2',
        title: 'Routines, Boundaries, and Consistency',
        lessons: [
          { id: 'l1-2-1', title: 'Why Routines Matter', duration: '14 min', type: 'video', preview: false },
          { id: 'l1-2-2', title: 'Setting Boundaries with Warmth', duration: '16 min', type: 'video', preview: false },
          { id: 'l1-2-3', title: 'Activity: Building Your Family Routine', duration: '20 min', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r1-1',
        title: 'Positive Parenting Tips — Healthy Children (AAP)',
        publisher: 'American Academy of Pediatrics (HealthyChildren.org)',
        url: 'https://www.healthychildren.org/English/family-life/family-dynamics/Pages/Positive-Parenting-Tips.aspx',
        type: 'article',
      },
      {
        id: 'r1-2',
        title: 'Building Strong Families — UNICEF Parenting',
        publisher: 'UNICEF',
        url: 'https://www.unicef.org/parenting',
        type: 'guide',
      },
    ],
  },

  {
    id: 2,
    slug: 'understanding-your-childs-development',
    title: 'Understanding Your Child\'s Development',
    shortDescription:
      'A clear guide to developmental milestones from birth through adolescence, helping parents know what to expect and how best to support each stage.',
    fullDescription:
      'Children develop in predictable yet highly individual ways. This course walks through the major stages of child development — physical, cognitive, language, and social-emotional — and helps parents understand what typical development looks like, how to encourage growth, and when to seek additional support.',
    category: 'Child Development',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 100,
    lessonCount: 8,
    duration: '2 hrs 30 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Identify key developmental milestones from birth to age 12',
      'Understand the difference between physical, cognitive, and social-emotional development',
      'Recognise signs that may warrant consultation with a professional',
      'Apply age-appropriate strategies to support your child\'s growth',
    ],
    audience: 'Parents and caregivers of infants, toddlers, school-age children, or anyone expecting a child.',
    modules: [
      {
        id: 'm2-1',
        title: 'The First Five Years',
        lessons: [
          { id: 'l2-1-1', title: 'Welcome: Why Development Matters', duration: '5 min', type: 'video', preview: true },
          { id: 'l2-1-2', title: 'Newborn to 12 Months: Milestones', duration: '18 min', type: 'video', preview: false },
          { id: 'l2-1-3', title: 'Toddler Years: Ages 1–3', duration: '16 min', type: 'video', preview: false },
          { id: 'l2-1-4', title: 'Pre-school Years: Ages 3–5', duration: '15 min', type: 'video', preview: false },
        ],
      },
      {
        id: 'm2-2',
        title: 'School Age and Beyond',
        lessons: [
          { id: 'l2-2-1', title: 'Middle Childhood: Ages 6–12', duration: '17 min', type: 'video', preview: false },
          { id: 'l2-2-2', title: 'Supporting Learning and Curiosity', duration: '14 min', type: 'reading', preview: false },
          { id: 'l2-2-3', title: 'When to Seek Professional Guidance', duration: '12 min', type: 'video', preview: false },
          { id: 'l2-2-4', title: 'Development Milestones Reference Sheet', duration: '—', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r2-1',
        title: 'Developmental Milestones — CDC',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        url: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html',
        type: 'guide',
      },
      {
        id: 'r2-2',
        title: 'Child Development Overview — WHO',
        publisher: 'World Health Organization',
        url: 'https://www.who.int/news-room/fact-sheets/detail/early-child-development',
        type: 'article',
      },
    ],
  },

  {
    id: 3,
    slug: 'positive-parenting-without-harsh-punishment',
    title: 'Positive Parenting Without Harsh Punishment',
    shortDescription:
      'Learn evidence-informed approaches to guidance and discipline that build cooperation, trust, and self-regulation without relying on fear or punishment.',
    fullDescription:
      'This course introduces parents to positive discipline strategies grounded in respect and connection. You will learn how to respond to challenging behaviour calmly, set effective limits, and teach children self-regulation skills — all without resorting to harsh punishment, shaming, or fear-based approaches.',
    category: 'Positive Parenting',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 150,
    lessonCount: 7,
    duration: '2 hrs 10 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Understand the principles behind positive discipline',
      'Identify the difference between punishment and logical consequences',
      'Apply practical techniques for managing challenging behaviour',
      'Build a calmer, more cooperative family environment',
    ],
    audience: 'Parents and caregivers of toddlers, pre-schoolers, and school-age children.',
    modules: [
      {
        id: 'm3-1',
        title: 'Rethinking Discipline',
        lessons: [
          { id: 'l3-1-1', title: 'Introduction: Discipline vs Punishment', duration: '8 min', type: 'video', preview: true },
          { id: 'l3-1-2', title: 'The Science Behind Positive Parenting', duration: '15 min', type: 'video', preview: false },
          { id: 'l3-1-3', title: 'Understanding Why Children Misbehave', duration: '14 min', type: 'video', preview: false },
        ],
      },
      {
        id: 'm3-2',
        title: 'Practical Positive Discipline Tools',
        lessons: [
          { id: 'l3-2-1', title: 'Natural and Logical Consequences', duration: '16 min', type: 'video', preview: false },
          { id: 'l3-2-2', title: 'Setting Limits with Empathy', duration: '14 min', type: 'video', preview: false },
          { id: 'l3-2-3', title: 'Problem-Solving Together', duration: '13 min', type: 'reading', preview: false },
          { id: 'l3-2-4', title: 'Activity: Creating a Family Agreement', duration: '20 min', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r3-1',
        title: 'Positive Parenting — UNICEF Parenting',
        publisher: 'UNICEF',
        url: 'https://www.unicef.org/parenting/child-behaviour/positive-parenting',
        type: 'guide',
      },
      {
        id: 'r3-2',
        title: 'Effective Discipline for Children — American Academy of Pediatrics',
        publisher: 'American Academy of Pediatrics',
        url: 'https://publications.aap.org/pediatrics/article/142/6/e20183112/37448/Effective-Discipline-to-Raise-Healthy-Children',
        type: 'article',
      },
    ],
  },

  {
    id: 4,
    slug: 'helping-children-understand-emotions',
    title: 'Helping Children Understand and Manage Their Emotions',
    shortDescription:
      'A practical course on emotional coaching — helping children name, understand, and regulate their feelings so they can thrive socially and academically.',
    fullDescription:
      'Emotional literacy is one of the most important skills a child can develop. This course teaches parents how to become emotion coaches — responding to children\'s big feelings with empathy, helping them label emotions, and guiding them toward healthy coping strategies. The approach is rooted in research on emotional intelligence and child development.',
    category: 'Child Behavior & Emotional Development',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 200,
    lessonCount: 9,
    duration: '2 hrs 50 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Understand the concept of emotional coaching and why it matters',
      'Help your child identify and name their emotions',
      'Respond to difficult emotions with empathy and validation',
      'Guide children in developing healthy emotional regulation strategies',
    ],
    audience: 'Parents and caregivers of children aged 2–12 who want to support their child\'s emotional development.',
    modules: [
      {
        id: 'm4-1',
        title: 'Understanding Children\'s Emotions',
        lessons: [
          { id: 'l4-1-1', title: 'What is Emotional Coaching?', duration: '7 min', type: 'video', preview: true },
          { id: 'l4-1-2', title: 'The Emotional Brain: A Parent\'s Guide', duration: '14 min', type: 'video', preview: false },
          { id: 'l4-1-3', title: 'Common Emotional Challenges in Children', duration: '13 min', type: 'video', preview: false },
        ],
      },
      {
        id: 'm4-2',
        title: 'Emotional Coaching in Practice',
        lessons: [
          { id: 'l4-2-1', title: 'Step 1: Noticing and Empathising', duration: '15 min', type: 'video', preview: false },
          { id: 'l4-2-2', title: 'Step 2: Labelling Emotions', duration: '12 min', type: 'video', preview: false },
          { id: 'l4-2-3', title: 'Step 3: Setting Limits on Behaviour', duration: '12 min', type: 'video', preview: false },
          { id: 'l4-2-4', title: 'Step 4: Problem-Solving with Your Child', duration: '16 min', type: 'video', preview: false },
          { id: 'l4-2-5', title: 'Emotion Vocabulary Cards', duration: '—', type: 'downloadable', preview: false },
          { id: 'l4-2-6', title: 'Reflection: Your Emotional Coaching Style', duration: '15 min', type: 'reading', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r4-1',
        title: 'Helping Children Manage Their Emotions — Zero to Three',
        publisher: 'Zero to Three',
        url: 'https://www.zerotothree.org/resources/series/managing-emotions',
        type: 'guide',
      },
      {
        id: 'r4-2',
        title: 'Emotions and Children\'s Health — NHS',
        publisher: 'NHS (UK)',
        url: 'https://www.nhs.uk/mental-health/children-and-young-adults/advice-for-parents/help-your-child-with-feelings/',
        type: 'article',
      },
    ],
  },

  {
    id: 5,
    slug: 'supporting-early-childhood-learning-at-home',
    title: 'Supporting Early Childhood Learning at Home',
    shortDescription:
      'Simple, play-based strategies that parents can use every day to stimulate curiosity, language, and early learning in children aged 0–6.',
    fullDescription:
      'Young children learn primarily through play and everyday interactions. This course shows parents how to turn daily routines — meal times, bath time, walks, and play — into rich learning opportunities. No special equipment or training is needed. The focus is on responsive, joyful engagement that supports brain development in the early years.',
    category: 'Early Childhood Development',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 0,
    lessonCount: 7,
    duration: '2 hrs 5 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Understand how play supports brain development in early childhood',
      'Use everyday moments as learning opportunities for young children',
      'Support language development through responsive conversation',
      'Create a stimulating and safe home learning environment',
    ],
    audience: 'Parents and caregivers of children aged 0–6, including expectant parents preparing for early childhood.',
    modules: [
      {
        id: 'm5-1',
        title: 'The Power of Play',
        lessons: [
          { id: 'l5-1-1', title: 'Why Play Is a Child\'s Work', duration: '8 min', type: 'video', preview: true },
          { id: 'l5-1-2', title: 'Types of Play and What They Teach', duration: '14 min', type: 'video', preview: false },
          { id: 'l5-1-3', title: 'Simple Play Ideas for Every Age', duration: '—', type: 'downloadable', preview: false },
        ],
      },
      {
        id: 'm5-2',
        title: 'Learning Through Daily Life',
        lessons: [
          { id: 'l5-2-1', title: 'Talk, Read, Sing: Language at Home', duration: '16 min', type: 'video', preview: false },
          { id: 'l5-2-2', title: 'Turning Routines into Learning Moments', duration: '13 min', type: 'video', preview: false },
          { id: 'l5-2-3', title: 'Creating a Stimulating Home Environment', duration: '15 min', type: 'reading', preview: false },
          { id: 'l5-2-4', title: 'Activity: Your 7-Day Learning Play Plan', duration: '25 min', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r5-1',
        title: 'Early Childhood Development — WHO',
        publisher: 'World Health Organization',
        url: 'https://www.who.int/news-room/fact-sheets/detail/early-child-development',
        type: 'article',
      },
      {
        id: 'r5-2',
        title: 'Learning Through Play — UNICEF',
        publisher: 'UNICEF',
        url: 'https://www.unicef.org/early-childhood-development/play',
        type: 'guide',
      },
    ],
  },

  {
    id: 6,
    slug: 'neurodiversity-inclusive-parenting',
    title: 'Understanding Neurodiversity and Inclusive Parenting',
    shortDescription:
      'An accessible introduction to neurodiversity — supporting parents of children with autism, ADHD, dyslexia, and other neurological differences.',
    fullDescription:
      'Every child\'s brain is unique. This course introduces the concept of neurodiversity and provides practical, compassionate guidance for families supporting children with autism spectrum disorder, ADHD, dyslexia, sensory processing differences, and related conditions. The goal is to help parents understand their child\'s needs, navigate available support, and advocate effectively.',
    category: 'Special & Inclusive Needs',
    level: 'Intermediate',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 350,
    lessonCount: 10,
    duration: '3 hrs 20 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only. It does not substitute for professional assessment or diagnosis.',
    objectives: [
      'Understand the concept of neurodiversity and what it means for families',
      'Learn about common neurodiverse conditions including autism, ADHD, and dyslexia',
      'Identify practical strategies to support a neurodiverse child at home and school',
      'Know how to navigate professional support systems and advocate for your child',
    ],
    audience: 'Parents and caregivers of children who have received or may be seeking a neurodevelopmental assessment, and those who want to create a more inclusive family environment.',
    modules: [
      {
        id: 'm6-1',
        title: 'Understanding Neurodiversity',
        lessons: [
          { id: 'l6-1-1', title: 'What Is Neurodiversity?', duration: '9 min', type: 'video', preview: true },
          { id: 'l6-1-2', title: 'Autism Spectrum Disorder: An Overview for Parents', duration: '18 min', type: 'video', preview: false },
          { id: 'l6-1-3', title: 'ADHD: Understanding Attention and Energy', duration: '16 min', type: 'video', preview: false },
          { id: 'l6-1-4', title: 'Dyslexia and Learning Differences', duration: '14 min', type: 'video', preview: false },
          { id: 'l6-1-5', title: 'Sensory Processing: When the World Feels Too Much', duration: '13 min', type: 'video', preview: false },
        ],
      },
      {
        id: 'm6-2',
        title: 'Supporting Your Child at Home and School',
        lessons: [
          { id: 'l6-2-1', title: 'Creating a Supportive Home Environment', duration: '15 min', type: 'video', preview: false },
          { id: 'l6-2-2', title: 'Working With Schools and Educators', duration: '16 min', type: 'video', preview: false },
          { id: 'l6-2-3', title: 'Navigating Professional Support Systems', duration: '14 min', type: 'reading', preview: false },
          { id: 'l6-2-4', title: 'Self-Care for Parents of Neurodiverse Children', duration: '13 min', type: 'video', preview: false },
          { id: 'l6-2-5', title: 'Resource Directory and Support Organisations', duration: '—', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r6-1',
        title: 'Autism Spectrum Disorder — CDC',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        url: 'https://www.cdc.gov/ncbddd/autism/facts.html',
        type: 'guide',
      },
      {
        id: 'r6-2',
        title: 'ADHD in Children — NHS',
        publisher: 'NHS (UK)',
        url: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/symptoms/',
        type: 'article',
      },
      {
        id: 'r6-3',
        title: 'What Is Neurodiversity? — Harvard Health',
        publisher: 'Harvard Health Publishing',
        url: 'https://www.health.harvard.edu/blog/what-is-neurodiversity-202111232645',
        type: 'article',
      },
    ],
  },

  {
    id: 7,
    slug: 'healthy-family-communication',
    title: 'Building Healthy Family Communication',
    shortDescription:
      'Develop communication habits that strengthen family bonds, reduce conflict, and help every family member feel heard, valued, and understood.',
    fullDescription:
      'Strong families are built on open, honest, and respectful communication. This course gives parents and caregivers practical tools to listen actively, express themselves clearly, resolve disagreements constructively, and create a family culture where every voice matters. Suitable for families with children of all ages.',
    category: 'Family Wellbeing',
    level: 'Beginner',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 250,
    lessonCount: 8,
    duration: '2 hrs 25 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Develop active listening skills with children and partners',
      'Express needs and emotions clearly and respectfully',
      'Manage family conflict in a calm, constructive way',
      'Build a family communication culture that supports every member',
    ],
    audience: 'Parents, caregivers, and guardians who want to improve communication within their family.',
    modules: [
      {
        id: 'm7-1',
        title: 'The Foundations of Family Communication',
        lessons: [
          { id: 'l7-1-1', title: 'Introduction: Why Communication Matters', duration: '6 min', type: 'video', preview: true },
          { id: 'l7-1-2', title: 'Active Listening With Children', duration: '15 min', type: 'video', preview: false },
          { id: 'l7-1-3', title: 'Speaking So Children Will Listen', duration: '14 min', type: 'video', preview: false },
          { id: 'l7-1-4', title: 'Family Communication Audit', duration: '—', type: 'downloadable', preview: false },
        ],
      },
      {
        id: 'm7-2',
        title: 'Difficult Conversations and Conflict',
        lessons: [
          { id: 'l7-2-1', title: 'Navigating Disagreements Calmly', duration: '17 min', type: 'video', preview: false },
          { id: 'l7-2-2', title: 'Family Meetings That Actually Work', duration: '14 min', type: 'video', preview: false },
          { id: 'l7-2-3', title: 'Talking About Hard Topics', duration: '16 min', type: 'reading', preview: false },
          { id: 'l7-2-4', title: 'Communication Scenario Practice Cards', duration: '—', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r7-1',
        title: 'Family Communication — Better Health Channel',
        publisher: 'Better Health Channel (Victoria State Government, Australia)',
        url: 'https://www.betterhealth.vic.gov.au/health/healthyliving/family-relationships-communication',
        type: 'article',
      },
      {
        id: 'r7-2',
        title: 'Talking With Children — Zero to Three',
        publisher: 'Zero to Three',
        url: 'https://www.zerotothree.org/resources/series/talking-with-babies-and-toddlers',
        type: 'guide',
      },
    ],
  },

  {
    id: 8,
    slug: 'screen-time-digital-habits-child-wellbeing',
    title: 'Screen Time, Digital Habits, and Child Wellbeing',
    shortDescription:
      'A balanced, evidence-informed course helping parents navigate screen time, social media, online safety, and healthy digital habits for children.',
    fullDescription:
      'Digital technology is part of every family\'s life. This course helps parents make informed, balanced decisions about screen time for children at different ages, understand the benefits and risks of digital media, establish healthy family tech habits, and talk to children about online safety. The approach is practical and non-judgmental — no screens, games, or devices are demonised.',
    category: 'Family Wellbeing',
    level: 'Intermediate',
    format: 'Mixed',
    instructor: 'Sidra Demo Instructor',
    price: 300,
    lessonCount: 9,
    duration: '2 hrs 55 min',
    thumbnail: null,
    demoNotice: 'This is a demonstration course. Content is illustrative only.',
    objectives: [
      'Understand age-appropriate screen time guidelines from major health bodies',
      'Distinguish between passive, interactive, and creative screen use',
      'Create a family media plan that works for your household',
      'Speak with children about online safety in an age-appropriate way',
    ],
    audience: 'Parents and caregivers of children from toddlers through teenagers who want to create healthy digital habits at home.',
    modules: [
      {
        id: 'm8-1',
        title: 'Understanding Screen Time',
        lessons: [
          { id: 'l8-1-1', title: 'Introduction: The Digital Family', duration: '7 min', type: 'video', preview: true },
          { id: 'l8-1-2', title: 'Screen Time Guidelines by Age', duration: '16 min', type: 'video', preview: false },
          { id: 'l8-1-3', title: 'Not All Screen Time Is the Same', duration: '13 min', type: 'video', preview: false },
          { id: 'l8-1-4', title: 'Signs That Screen Use May Be Problematic', duration: '12 min', type: 'reading', preview: false },
        ],
      },
      {
        id: 'm8-2',
        title: 'Building Healthy Digital Habits',
        lessons: [
          { id: 'l8-2-1', title: 'Creating a Family Media Plan', duration: '18 min', type: 'video', preview: false },
          { id: 'l8-2-2', title: 'Online Safety Conversations for Every Age', duration: '17 min', type: 'video', preview: false },
          { id: 'l8-2-3', title: 'Managing Social Media and Gaming', duration: '16 min', type: 'video', preview: false },
          { id: 'l8-2-4', title: 'Family Media Plan Template', duration: '—', type: 'downloadable', preview: false },
          { id: 'l8-2-5', title: 'Family Technology Agreement', duration: '—', type: 'downloadable', preview: false },
        ],
      },
    ],
    resources: [
      {
        id: 'r8-1',
        title: 'Screen Time and Children — American Academy of Pediatrics',
        publisher: 'American Academy of Pediatrics (HealthyChildren.org)',
        url: 'https://www.healthychildren.org/English/family-life/Media/Pages/Where-We-Stand-TV-Viewing-Time.aspx',
        type: 'guide',
      },
      {
        id: 'r8-2',
        title: 'Children and Digital Technology — WHO',
        publisher: 'World Health Organization',
        url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
        type: 'article',
      },
      {
        id: 'r8-3',
        title: 'Family Media Plan Tool — HealthyChildren.org',
        publisher: 'American Academy of Pediatrics',
        url: 'https://www.healthychildren.org/English/media/Pages/default.aspx',
        type: 'tool',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get a single course by numeric id */
export function getCourseById(id) {
  return COURSES.find((c) => c.id === Number(id)) ?? null
}

/** Get a single course by slug */
export function getCourseBySlug(slug) {
  return COURSES.find((c) => c.slug === slug) ?? null
}
