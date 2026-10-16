import { z } from 'zod';

// Date string regex: YYYY-MM-DD
export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD');

// Time string regex: HH:mm
export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be formatted as HH:mm');

// 1. Settings Schema
export const FloorSchema = z.object({
  problems: z.number().int().min(0).default(2),
  revisions: z.number().int().min(0).default(1),
  applications: z.number().int().min(0).default(5),
  requireLog: z.boolean().default(true),
});

export const TargetsSchema = z.object({
  problemsPerDay: z.number().int().min(0).default(3),
  applicationsPerDay: z.number().int().min(0).default(5),
  mocksPerWeek: z.number().int().min(0).default(2),
  startupHours: z.number().min(0).default(4.5),
  gymHours: z.number().min(0).default(2),
  sleepHours: z.number().min(0).default(7),
});

export const ScheduleBlockSchema = z.object({
  id: z.string(),
  start: TimeStringSchema,
  end: TimeStringSchema,
  label: z.string(),
  category: z.string(),
});

export const FxRatesSchema = z.object({
  USD: z.number().positive().default(85),
  EUR: z.number().positive().default(95),
  GBP: z.number().positive().default(110),
});

export const SkillKeywordSchema = z.object({
  word: z.string(),
  weight: z.number().min(0),
});

export const JobFiltersSchema = z.object({
  includeTitleKeywords: z.array(z.string()).default([]),
  excludeTitleKeywords: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  preferredLocations: z.array(z.string()).default([]),
  allowRemoteIndia: z.boolean().default(true),
  maxMinExperienceYears: z.number().min(0).default(2),
  minSalaryLPA: z.number().min(0).default(5),
  includeUnknownSalary: z.boolean().default(true),
  includeInternships: z.boolean().default(false),
  maxAgeDays: z.number().int().positive().default(3),
  blockedCompanies: z.array(z.string()).default([]),
  skillKeywords: z.array(SkillKeywordSchema).default([]),
  fxRates: FxRatesSchema.default({ USD: 85, EUR: 95, GBP: 110 }),
});

export const SettingsSchema = z.object({
  planStartDate: DateStringSchema,
  planLengthDays: z.number().int().positive().default(90),
  floor: FloorSchema.default({
    problems: 2,
    revisions: 1,
    applications: 5,
    requireLog: true,
  }),
  targets: TargetsSchema.default({
    problemsPerDay: 3,
    applicationsPerDay: 5,
    mocksPerWeek: 2,
    startupHours: 4.5,
    gymHours: 2,
    sleepHours: 7,
  }),
  scheduleBlocks: z.array(ScheduleBlockSchema).default([]),
  patternTargets: z.record(z.string(), z.number().int().min(0)).default({}),
  jobFilters: JobFiltersSchema.default({
    includeTitleKeywords: [],
    excludeTitleKeywords: [],
    locations: [],
    preferredLocations: [],
    allowRemoteIndia: true,
    maxMinExperienceYears: 2,
    minSalaryLPA: 5,
    includeUnknownSalary: true,
    includeInternships: false,
    maxAgeDays: 3,
    blockedCompanies: [],
    skillKeywords: [],
    fxRates: { USD: 85, EUR: 95, GBP: 110 },
  }),
  apiTokenHash: z.string().default(''),
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
});

// 2. Daily Log Schema
export const OverridesSchema = z.object({
  problems: z.number().int().min(0).optional(),
  revisions: z.number().int().min(0).optional(),
  applications: z.number().int().min(0).optional(),
});

export const DailyLogSchema = z.object({
  date: DateStringSchema,
  wakeTime: TimeStringSchema,
  sleepTime: TimeStringSchema,
  sleepHours: z.number().min(0).max(24),
  startupHours: z.number().min(0).max(24),
  gymDone: z.boolean(),
  gymHours: z.number().min(0).max(24),
  energy: z.number().int().min(1).max(5),
  win: z.string(),
  wentWrong: z.string(),
  tomorrowTop3: z.tuple([z.string(), z.string(), z.string()]),
  notes: z.string().default(''),
  overrides: OverridesSchema.default({}),
  dueRevisionsAtStart: z.number().int().min(0).default(0),
  floorMet: z.boolean().default(false),
  submitted: z.boolean().default(false),
  submittedAt: z.unknown().nullable().default(null),
  checklist: z.record(z.string(), z.boolean()).default({}),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
});

// 3. Problem Schema
export const RevisionHistoryItemSchema = z.object({
  date: DateStringSchema,
  result: z.enum(['pass', 'fail']),
  fromStep: z.number().int().min(0).max(5),
  toStep: z.number().int().min(0).max(5),
});

export const ProblemRevisionSchema = z.object({
  step: z.number().int().min(0).max(5).default(0),
  nextDue: DateStringSchema.nullable().default(null),
  history: z.array(RevisionHistoryItemSchema).default([]),
  mastered: z.boolean().default(false),
});

export const ProblemComplexitySchema = z.object({
  time: z.string().default(''),
  space: z.string().default(''),
});

export const ProblemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().url().or(z.literal('')),
  platform: z.enum(['leetcode', 'codeforces', 'hackerrank', 'gfg', 'other']).default('leetcode'),
  pattern: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  solvedAt: DateStringSchema,
  timeTakenMin: z.number().int().min(0),
  outcome: z.enum(['clean', 'hinted', 'failed']),
  insight: z.string().max(200).default(''),
  stuckAt: z.string().default(''),
  complexity: ProblemComplexitySchema.default({ time: '', space: '' }),
  tags: z.array(z.string()).default([]),
  revision: ProblemRevisionSchema.default({
    step: 0,
    nextDue: null,
    history: [],
    mastered: false,
  }),
});

// 4. Mistakes Schema
export const MistakeSchema = z.object({
  id: z.string().optional(),
  date: DateStringSchema,
  text: z.string().min(1),
  pattern: z.string().optional(),
  problemId: z.string().optional(),
  reviewedWeeks: z.array(z.string()).default([]),
});

// 5. Mock Interview Schema
export const MockSchema = z.object({
  id: z.string().optional(),
  date: DateStringSchema,
  type: z.enum(['dsa', 'lld', 'system-design', 'behavioral', 'full-loop', 'hr']),
  platform: z.enum(['peer', 'paid', 'ai', 'real']),
  interviewer: z.string().optional(),
  durationMin: z.number().int().min(0),
  score: z.number().int().min(1).max(5),
  strengths: z.string().default(''),
  weaknesses: z.string().default(''),
  actionItems: z.array(z.string()).default([]),
  problemTitles: z.array(z.string()).default([]),
});

// 6. Application Schema
export const StatusHistoryItemSchema = z.object({
  status: z.string(),
  date: DateStringSchema,
});

export const ApplicationStatusEnum = z.enum([
  'saved',
  'applied',
  'oa',
  'interview',
  'offer',
  'rejected',
  'ghosted',
  'withdrawn',
]);

export const ApplicationSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1),
  role: z.string().min(1),
  url: z.string().url().or(z.literal('')),
  source: z.string().default('manual'),
  status: ApplicationStatusEnum.default('saved'),
  appliedDate: DateStringSchema,
  referral: z.boolean().default(false),
  referrerName: z.string().optional(),
  salaryLPA: z.number().positive().optional(),
  location: z.string().default(''),
  followUpDate: DateStringSchema.optional(),
  notes: z.string().default(''),
  jobId: z.string().optional(),
  statusHistory: z.array(StatusHistoryItemSchema).default([]),
  createdAt: z.unknown().optional(),
});

// 7. Job Schema (scraped jobs)
export const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().default(''),
  url: z.string().url().or(z.literal('')),
  source: z.string().default('scraper'),
  salaryRaw: z.string().optional(),
  salaryLPA: z.number().positive().optional(),
  salaryEstimated: z.boolean().default(false),
  experienceMinYears: z.number().min(0).optional(),
  postedDate: DateStringSchema,
  status: z.enum(['new', 'saved', 'applied', 'dismissed']).default('new'),
  closed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.unknown().optional(),
});

// 8. Scraper Run Schema
export const PerSourceRunSchema = z.object({
  name: z.string(),
  fetched: z.number().int().min(0),
  kept: z.number().int().min(0),
  error: z.string().optional(),
});

export const ScraperRunSchema = z.object({
  id: z.string().optional(),
  startedAt: z.unknown(),
  finishedAt: z.unknown(),
  perSource: z.array(PerSourceRunSchema),
  totalNew: z.number().int().min(0),
  ok: z.boolean(),
});

// 9. Roadmap Schema
export const WeekGoalSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  done: z.boolean().default(false),
});

export const RoadmapWeekSchema = z.object({
  n: z.number().int().min(1),
  theme: z.string(),
  goals: z.array(WeekGoalSchema),
});

export const TopicSchema = z.object({
  id: z.string(),
  group: z.string(),
  text: z.string().min(1),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
});

export const RoadmapSchema = z.object({
  weeks: z.array(RoadmapWeekSchema).default([]),
  topics: z.array(TopicSchema).default([]),
});

// 10. Pattern Notes Schema
export const PatternNoteSchema = z.object({
  pattern: z.string(),
  markdown: z.string().default(''),
  updatedAt: z.unknown().optional(),
});

// 11. Weekly Review Schema
export const WeeklyReviewSchema = z.object({
  weekStart: DateStringSchema,
  whatWorked: z.string().default(''),
  whatToChange: z.string().default(''),
  nextFocus: z.string().default(''),
  createdAt: z.unknown().optional(),
});

// Inferred TypeScript Types
export type Floor = z.infer<typeof FloorSchema>;
export type Targets = z.infer<typeof TargetsSchema>;
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;
export type FxRates = z.infer<typeof FxRatesSchema>;
export type JobFilters = z.infer<typeof JobFiltersSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

export type Overrides = z.infer<typeof OverridesSchema>;
export type DailyLog = z.infer<typeof DailyLogSchema>;

export type RevisionHistoryItem = z.infer<typeof RevisionHistoryItemSchema>;
export type ProblemRevision = z.infer<typeof ProblemRevisionSchema>;
export type Problem = z.infer<typeof ProblemSchema>;

export type Mistake = z.infer<typeof MistakeSchema>;
export type Mock = z.infer<typeof MockSchema>;

export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;
export type StatusHistoryItem = z.infer<typeof StatusHistoryItemSchema>;
export type Application = z.infer<typeof ApplicationSchema>;

export type Job = z.infer<typeof JobSchema>;
export type PerSourceRun = z.infer<typeof PerSourceRunSchema>;
export type ScraperRun = z.infer<typeof ScraperRunSchema>;

export type WeekGoal = z.infer<typeof WeekGoalSchema>;
export type RoadmapWeek = z.infer<typeof RoadmapWeekSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;

export type PatternNote = z.infer<typeof PatternNoteSchema>;
export type WeeklyReview = z.infer<typeof WeeklyReviewSchema>;
