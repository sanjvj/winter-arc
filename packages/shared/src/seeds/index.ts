import { ScheduleBlock, Settings, Roadmap } from '../schemas';

export const DEFAULT_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  { id: 'sb-1', start: '06:00', end: '06:30', label: 'Wake, water, no phone', category: 'routine' },
  { id: 'sb-2', start: '06:30', end: '09:30', label: 'DSA deep work', category: 'dsa' },
  { id: 'sb-3', start: '09:30', end: '10:15', label: 'Breakfast and break', category: 'rest' },
  {
    id: 'sb-4',
    start: '10:15',
    end: '11:45',
    label: 'Revision + CS fundamentals / LLD / system design',
    category: 'study',
  },
  { id: 'sb-5', start: '11:45', end: '13:45', label: 'Startup block 1', category: 'startup' },
  { id: 'sb-6', start: '13:45', end: '14:45', label: 'Lunch and rest', category: 'rest' },
  {
    id: 'sb-7',
    start: '14:45',
    end: '16:15',
    label: 'Job applications and referrals',
    category: 'jobs',
  },
  { id: 'sb-8', start: '16:15', end: '18:15', label: 'Startup block 2', category: 'startup' },
  { id: 'sb-9', start: '18:15', end: '20:15', label: 'Gym', category: 'gym' },
  { id: 'sb-10', start: '20:15', end: '21:00', label: 'Dinner', category: 'rest' },
  {
    id: 'sb-11',
    start: '21:00',
    end: '22:00',
    label: 'Mock / behavioral practice / startup overflow',
    category: 'mock',
  },
  {
    id: 'sb-12',
    start: '22:00',
    end: '22:30',
    label: 'Daily log and plan tomorrow',
    category: 'log',
  },
  { id: 'sb-13', start: '22:45', end: '06:00', label: 'Sleep', category: 'sleep' },
];

export const DEFAULT_PATTERN_TARGETS: Record<string, number> = {
  'Arrays & Hashing': 15,
  'Two Pointers': 10,
  'Sliding Window': 10,
  Stack: 10,
  'Binary Search': 12,
  'Linked List': 10,
  Trees: 15,
  Tries: 4,
  'Heap / Priority Queue': 8,
  Backtracking: 10,
  'Graphs BFS/DFS': 14,
  'Advanced Graphs': 8,
  '1-D DP': 12,
  '2-D DP': 8,
  Greedy: 8,
  Intervals: 6,
  'Bit Manipulation': 4,
  'Math & Geometry': 4,
};

export const DEFAULT_JOB_FILTERS = {
  includeTitleKeywords: [
    'software engineer',
    'software developer',
    'sde',
    'sde-1',
    'sde 1',
    'sde i',
    'associate software engineer',
    'graduate engineer',
    'full stack',
    'fullstack',
    'full-stack',
    'backend engineer',
    'frontend engineer',
    'web developer',
    'application developer',
    'junior developer',
    'trainee engineer',
    'member of technical staff',
    'fresher',
    'engineer i',
    'engineer 1',
  ],
  excludeTitleKeywords: [
    'senior',
    'sr.',
    'staff',
    'principal',
    'lead',
    'manager',
    'architect',
    'director',
    'head of',
    'vp',
    'sde-2',
    'sde 2',
    'sde ii',
    'engineer ii',
    'engineer 2',
    'iii',
    'intern',
    'internship',
    'qa',
    'tester',
    'sales',
    'support',
    'data entry',
  ],
  locations: ['India', 'Remote'],
  preferredLocations: [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Bengaluru',
    'Hyderabad',
    'Remote',
  ],
  allowRemoteIndia: true,
  maxMinExperienceYears: 2,
  minSalaryLPA: 5,
  includeUnknownSalary: true,
  includeInternships: false,
  maxAgeDays: 3,
  blockedCompanies: [],
  skillKeywords: [
    { word: 'react', weight: 3 },
    { word: 'next.js', weight: 3 },
    { word: 'typescript', weight: 3 },
    { word: 'node', weight: 3 },
    { word: 'javascript', weight: 2 },
    { word: 'firebase', weight: 2 },
    { word: 'postgres', weight: 2 },
    { word: 'sql', weight: 1 },
    { word: 'mongodb', weight: 1 },
    { word: 'rest', weight: 1 },
    { word: 'aws', weight: 1 },
    { word: 'docker', weight: 1 },
    { word: 'python', weight: 1 },
  ],
  fxRates: { USD: 85, EUR: 95, GBP: 110 },
};

export function createDefaultSettings(planStartDate: string): Settings {
  return {
    planStartDate,
    planLengthDays: 90,
    floor: {
      problems: 2,
      revisions: 1,
      applications: 5,
      requireLog: true,
    },
    targets: {
      problemsPerDay: 3,
      applicationsPerDay: 5,
      mocksPerWeek: 2,
      startupHours: 4.5,
      gymHours: 2,
      sleepHours: 7,
    },
    scheduleBlocks: DEFAULT_SCHEDULE_BLOCKS,
    patternTargets: DEFAULT_PATTERN_TARGETS,
    jobFilters: DEFAULT_JOB_FILTERS,
    apiTokenHash: '',
    theme: 'dark',
  };
}

export function createDefaultRoadmap(): Roadmap {
  return {
    weeks: [
      {
        n: 1,
        theme:
          'W1 Foundation: arrays/hashing, two pointers, resume rewrite, LinkedIn polish, set up this app.',
        goals: [
          { id: 'w1-g1', text: 'Master Arrays & Hashing fundamentals (15 problems)', done: false },
          { id: 'w1-g2', text: 'Master Two Pointers techniques (10 problems)', done: false },
          {
            id: 'w1-g3',
            text: 'Complete professional resume rewrite tailored for SDE-1',
            done: false,
          },
          { id: 'w1-g4', text: 'Optimize LinkedIn profile and portfolio branding', done: false },
          {
            id: 'w1-g5',
            text: 'Set up Winter Arc Command Center and test daily routine',
            done: false,
          },
        ],
      },
      {
        n: 2,
        theme:
          'W2 Sliding window, stack, binary search; OS + DBMS revision; start referral outreach.',
        goals: [
          { id: 'w2-g1', text: 'Solve Sliding Window pattern problems (10 target)', done: false },
          { id: 'w2-g2', text: 'Solve Stack & Monotonic Stack problems (10 target)', done: false },
          {
            id: 'w2-g3',
            text: 'Master Binary Search boundaries and variations (12 target)',
            done: false,
          },
          {
            id: 'w2-g4',
            text: 'Revise Operating Systems (threads, scheduling, memory)',
            done: false,
          },
          {
            id: 'w2-g5',
            text: 'Revise DBMS (ACID, isolation, indexing) & start referral outreach',
            done: false,
          },
        ],
      },
      {
        n: 3,
        theme: 'W3 Linked list, trees; applications at volume; first practice-tier interview.',
        goals: [
          {
            id: 'w3-g1',
            text: 'Solve Linked List reversal & fast/slow pointers (10 target)',
            done: false,
          },
          { id: 'w3-g2', text: 'Solve Trees BFS & DFS traversals (15 target)', done: false },
          {
            id: 'w3-g3',
            text: 'Submit applications at volume (5+ per day minimum floor)',
            done: false,
          },
          { id: 'w3-g4', text: 'Conduct first practice-tier peer interview', done: false },
        ],
      },
      {
        n: 4,
        theme: 'W4 Heaps, tries; CN + OOP revision; first peer mock; month-1 review.',
        goals: [
          { id: 'w4-g1', text: 'Master Heaps & Priority Queues (8 target)', done: false },
          {
            id: 'w4-g2',
            text: 'Implement Tries and prefix search structures (4 target)',
            done: false,
          },
          {
            id: 'w4-g3',
            text: 'Revise Computer Networks (HTTP/S, TCP/UDP, DNS) & OOP pillars',
            done: false,
          },
          { id: 'w4-g4', text: 'Conduct scheduled peer mock interview', done: false },
          { id: 'w4-g5', text: 'Complete Month-1 comprehensive retro review', done: false },
        ],
      },
      {
        n: 5,
        theme:
          'W5 Graphs BFS/DFS, backtracking; start LLD (OOP + SOLID, 2 designs); 2 mocks per week.',
        goals: [
          {
            id: 'w5-g1',
            text: 'Solve standard Graphs BFS & DFS problems (14 target)',
            done: false,
          },
          {
            id: 'w5-g2',
            text: 'Master Backtracking permutations and combinations (10 target)',
            done: false,
          },
          { id: 'w5-g3', text: 'Start Low Level Design (OOP + SOLID fundamentals)', done: false },
          {
            id: 'w5-g4',
            text: 'Implement 2 complete LLD designs (Parking Lot, Elevator)',
            done: false,
          },
          { id: 'w5-g5', text: 'Complete 2 formal mock interviews this week', done: false },
        ],
      },
      {
        n: 6,
        theme: 'W6 Advanced graphs, 1-D DP; LLD designs 3-4; system design basics.',
        goals: [
          {
            id: 'w6-g1',
            text: 'Solve Advanced Graphs (Dijkstra, Topological Sort) (8 target)',
            done: false,
          },
          { id: 'w6-g2', text: 'Master 1-D Dynamic Programming patterns (12 target)', done: false },
          {
            id: 'w6-g3',
            text: 'Implement LLD designs 3 & 4 (Library Management, BookMyShow)',
            done: false,
          },
          {
            id: 'w6-g4',
            text: 'Cover System Design basics (load balancing, caching, sharding)',
            done: false,
          },
        ],
      },
      {
        n: 7,
        theme: 'W7 2-D DP, greedy; LLD designs 5-6; mocks include one behavioral.',
        goals: [
          {
            id: 'w7-g1',
            text: 'Solve 2-D Dynamic Programming (knapsack, grid paths) (8 target)',
            done: false,
          },
          { id: 'w7-g2', text: 'Master Greedy algorithms (8 target)', done: false },
          { id: 'w7-g3', text: 'Implement LLD designs 5 & 6 (Splitwise, LRU Cache)', done: false },
          {
            id: 'w7-g4',
            text: 'Execute mock interview focusing explicitly on behavioral defense',
            done: false,
          },
        ],
      },
      {
        n: 8,
        theme:
          'W8 Intervals, bit manipulation, math; deep-dive prep on every client project; month-2 review.',
        goals: [
          {
            id: 'w8-g1',
            text: 'Solve Intervals scheduling & merge patterns (6 target)',
            done: false,
          },
          {
            id: 'w8-g2',
            text: 'Cover Bit Manipulation and Math/Geometry patterns (8 target)',
            done: false,
          },
          {
            id: 'w8-g3',
            text: 'Author deep-dive defense sheet for every client & startup project',
            done: false,
          },
          {
            id: 'w8-g4',
            text: 'Execute Month-2 comprehensive retrospective and calibration',
            done: false,
          },
        ],
      },
      {
        n: 9,
        theme:
          'W9 Company-specific prep for top targets; full-loop mock (3 rounds); review mistake log.',
        goals: [
          {
            id: 'w9-g1',
            text: 'Execute company-specific question sets for top target firms',
            done: false,
          },
          {
            id: 'w9-g2',
            text: 'Run full-loop mock interview simulation (3 back-to-back rounds)',
            done: false,
          },
          {
            id: 'w9-g3',
            text: 'Systematically review and clear entries in the Mistake Log',
            done: false,
          },
          {
            id: 'w9-g4',
            text: 'Aggressively push referral follow-ups for warm leads',
            done: false,
          },
        ],
      },
      {
        n: 10,
        theme:
          'W10 Weakest-pattern sprint from pattern coverage and mock weaknesses; system design mocks.',
        goals: [
          {
            id: 'w10-g1',
            text: 'Target weakest pattern identified by coverage analytics',
            done: false,
          },
          {
            id: 'w10-g2',
            text: 'Resolve specific critique points from previous mock reports',
            done: false,
          },
          {
            id: 'w10-g3',
            text: 'Execute dedicated System Design mock (rate limiter, URL shortener)',
            done: false,
          },
        ],
      },
      {
        n: 11,
        theme: 'W11 Interview season; light daily DSA; behavioral story bank (5 STAR stories).',
        goals: [
          {
            id: 'w11-g1',
            text: 'Maintain warm state with 2 light DSA problems daily',
            done: false,
          },
          {
            id: 'w11-g2',
            text: 'Polish 5 core STAR stories (conflict, failure, ownership, deadline, learning)',
            done: false,
          },
          {
            id: 'w11-g3',
            text: 'Practice 90-second pitch and 30-second gap defense out loud',
            done: false,
          },
          { id: 'w11-g4', text: 'Execute active interview loops with maximum poise', done: false },
        ],
      },
      {
        n: 12,
        theme: 'W12 Interview season; negotiation prep; offer comparison; final review.',
        goals: [
          {
            id: 'w12-g1',
            text: 'Finalize ongoing interview rounds and technical loops',
            done: false,
          },
          {
            id: 'w12-g2',
            text: 'Review compensation negotiation strategies and LPA frameworks',
            done: false,
          },
          {
            id: 'w12-g3',
            text: 'Compare offers against career trajectory and startup alignment',
            done: false,
          },
          {
            id: 'w12-g4',
            text: 'Conclude 90-day Winter Arc sprint with final review',
            done: false,
          },
        ],
      },
    ],
    topics: [
      // CS Core
      {
        id: 'top-1',
        group: 'CS core',
        text: 'OS: processes vs threads, scheduling, deadlocks, paging and memory',
        status: 'todo',
      },
      {
        id: 'top-2',
        group: 'CS core',
        text: 'DBMS: normalization, ACID properties, isolation levels, B-tree indexes',
        status: 'todo',
      },
      {
        id: 'top-3',
        group: 'CS core',
        text: 'CN: HTTP/HTTPS, TCP vs UDP, DNS resolution, status codes',
        status: 'todo',
      },
      {
        id: 'top-4',
        group: 'CS core',
        text: 'OOP: 4 pillars, SOLID principles, Singleton, Factory, Observer, Strategy',
        status: 'todo',
      },
      {
        id: 'top-5',
        group: 'CS core',
        text: 'SQL: complex joins, GROUP BY, HAVING, subqueries, window functions',
        status: 'todo',
      },

      // Full-stack
      {
        id: 'top-6',
        group: 'Full-stack',
        text: 'JS: closures, prototype chain, event loop, microtasks, promises, async/await',
        status: 'todo',
      },
      {
        id: 'top-7',
        group: 'Full-stack',
        text: 'React: rendering lifecycle, reconciliation, hooks dependencies, custom hooks',
        status: 'todo',
      },
      {
        id: 'top-8',
        group: 'Full-stack',
        text: 'Node: event loop phases, streams, buffer management, error handling',
        status: 'todo',
      },
      {
        id: 'top-9',
        group: 'Full-stack',
        text: 'REST API design: idempotency, versioning, status codes, pagination',
        status: 'todo',
      },
      {
        id: 'top-10',
        group: 'Full-stack',
        text: 'Auth: JWT vs session cookies, CSRF, XSS, refresh tokens',
        status: 'todo',
      },
      {
        id: 'top-11',
        group: 'Full-stack',
        text: 'Caching basics: Redis, cache invalidation, cache-aside pattern',
        status: 'todo',
      },

      // LLD
      {
        id: 'top-12',
        group: 'LLD',
        text: 'Parking Lot system design & class diagrams',
        status: 'todo',
      },
      {
        id: 'top-13',
        group: 'LLD',
        text: 'Elevator system design & state machine',
        status: 'todo',
      },
      { id: 'top-14', group: 'LLD', text: 'Library Management System', status: 'todo' },
      {
        id: 'top-15',
        group: 'LLD',
        text: 'BookMyShow / Movie Ticket Booking concurrency handling',
        status: 'todo',
      },
      { id: 'top-16', group: 'LLD', text: 'Splitwise expense-sharing algorithm', status: 'todo' },
      {
        id: 'top-17',
        group: 'LLD',
        text: 'LRU Cache implementation (Hash + Doubly Linked List)',
        status: 'todo',
      },

      // System Design
      {
        id: 'top-18',
        group: 'System design',
        text: 'Load balancing algorithms & consistent hashing',
        status: 'todo',
      },
      {
        id: 'top-19',
        group: 'System design',
        text: 'Database sharding, partitioning, replication & CAP theorem',
        status: 'todo',
      },
      {
        id: 'top-20',
        group: 'System design',
        text: 'Message queues (Kafka, RabbitMQ) & event-driven decoupling',
        status: 'todo',
      },
      {
        id: 'top-21',
        group: 'System design',
        text: 'Rate limiter design (Token bucket, Leaky bucket)',
        status: 'todo',
      },
      {
        id: 'top-22',
        group: 'System design',
        text: 'URL shortener (TinyURL) high-scale architecture',
        status: 'todo',
      },
      {
        id: 'top-23',
        group: 'System design',
        text: 'Real-time Chat application (WebSockets, pub/sub)',
        status: 'todo',
      },

      // Behavioral
      {
        id: 'top-24',
        group: 'Behavioral',
        text: '90-second concise self-introduction pitch',
        status: 'todo',
      },
      {
        id: 'top-25',
        group: 'Behavioral',
        text: '5 STAR stories: Conflict resolution with peer/manager',
        status: 'todo',
      },
      {
        id: 'top-26',
        group: 'Behavioral',
        text: '5 STAR stories: Major technical failure & recovery',
        status: 'todo',
      },
      {
        id: 'top-27',
        group: 'Behavioral',
        text: '5 STAR stories: Outsized ownership & startup execution',
        status: 'todo',
      },
      {
        id: 'top-28',
        group: 'Behavioral',
        text: '5 STAR stories: Tight deadline delivery & trade-offs',
        status: 'todo',
      },
      {
        id: 'top-29',
        group: 'Behavioral',
        text: '5 STAR stories: Rapid learning of unfamiliar stack',
        status: 'todo',
      },
      {
        id: 'top-30',
        group: 'Behavioral',
        text: 'Confident, poised 30-second explanation for 1-year career gap',
        status: 'todo',
      },
      {
        id: 'top-31',
        group: 'Behavioral',
        text: 'One-page architectural defense breakdown per client project',
        status: 'todo',
      },

      // Job-search ops
      {
        id: 'top-32',
        group: 'Job-search ops',
        text: 'ATS-optimized Resume v1 finalized',
        status: 'todo',
      },
      {
        id: 'top-33',
        group: 'Job-search ops',
        text: 'LinkedIn profile headline, summary & experience updated',
        status: 'todo',
      },
      {
        id: 'top-34',
        group: 'Job-search ops',
        text: 'Target list of 30 product & high-growth tech companies compiled',
        status: 'todo',
      },
      {
        id: 'top-35',
        group: 'Job-search ops',
        text: '10 alumni / engineering referral contacts identified',
        status: 'todo',
      },
      {
        id: 'top-36',
        group: 'Job-search ops',
        text: 'Command Center application pipeline tracker actively in use',
        status: 'todo',
      },
    ],
  };
}
