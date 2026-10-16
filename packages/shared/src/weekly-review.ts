import { DailyLog, Problem, Application, Mock, Targets, Floor } from './schemas';
import { addDaysIST, formatDateIST } from './time';
import { calculateDailyCounters } from './floor';

export interface DailyMetricItem {
  date: string;
  dayName: string; // 'Mon', 'Tue', etc.
  problems: number;
  revisions: number;
  applications: number;
  mocks: number;
  startupHours: number;
  gymDone: boolean;
  gymHours: number;
  sleepHours: number;
  energy: number;
  floorMet: boolean;
  score: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  days: DailyMetricItem[];
  totals: {
    problems: number;
    revisions: number;
    applications: number;
    mocks: number;
    startupHours: number;
    gymDays: number;
    averageSleep: number;
    floorDays: number;
  };
  targets: {
    problems: number;
    applications: number;
    mocks: number;
    startupHours: number;
    gymDays: number;
    sleepHours: number;
    floorDays: number;
  };
  bestDay: DailyMetricItem | null;
  worstDay: DailyMetricItem | null;
  honestRead: string[];
}

export interface MonthRollupResult {
  monthName: string;
  weeksCount: number;
  totalProblems: number;
  totalApplications: number;
  totalMocks: number;
  totalStartupHours: number;
  totalGymDays: number;
  averageSleep: number;
  floorDaysMet: number;
  floorPercentage: number;
}

/**
 * Returns the 7 consecutive YYYY-MM-DD date strings for a Monday-based week.
 */
export function getWeekDaysIST(weekStartMonday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysIST(weekStartMonday, i));
}

/**
 * Calculates an objective daily performance score to determine Best/Worst days.
 */
function calculateDayScore(item: Omit<DailyMetricItem, 'score'>): number {
  let score = item.floorMet ? 50 : 0;
  score += Math.min(20, item.problems * 5);
  score += Math.min(20, item.applications * 3);
  score += Math.min(10, Math.round(item.startupHours * 2));
  score += item.gymDone ? 10 : 0;
  score += Math.min(10, item.energy * 2);
  return score;
}

/**
 * Aggregates all daily logs and activity items for a 7-day Monday-based week.
 */
export function calculateWeeklySummary(params: {
  weekStart: string;
  dailyLogs: DailyLog[];
  problems: Problem[];
  applications: Application[];
  mocks: Mock[];
  targets: Targets;
  floor: Floor;
}): WeeklySummary {
  const { weekStart, dailyLogs, problems, applications, mocks, targets } = params;
  const weekDays = getWeekDaysIST(weekStart);
  const weekEnd = weekDays[6] ?? addDaysIST(weekStart, 6);

  const logsByDate = new Map<string, DailyLog>();
  for (const log of dailyLogs) {
    logsByDate.set(log.date, log);
  }

  let totalProblems = 0;
  let totalRevisions = 0;
  let totalApplications = 0;
  let totalMocks = 0;
  let totalStartupHours = 0;
  let totalGymDays = 0;
  let totalSleepHours = 0;
  let loggedDaysCount = 0;
  let floorDays = 0;

  const days: DailyMetricItem[] = weekDays.map((date) => {
    const dayName = formatDateIST(date, 'EEE');
    const log = logsByDate.get(date);

    // Auto-derived counters with overrides
    const counters = calculateDailyCounters(date, {
      problems,
      applications,
      mocks,
      overrides: log?.overrides,
    });

    const startupHours = log?.startupHours ?? 0;
    const gymDone = log?.gymDone ?? false;
    const gymHours = log?.gymHours ?? 0;
    const sleepHours = log?.sleepHours ?? 0;
    const energy = log?.energy ?? 3;
    const floorMet = log?.floorMet ?? false;

    totalProblems += counters.problems;
    totalRevisions += counters.revisions;
    totalApplications += counters.applications;
    totalMocks += counters.mocks;
    totalStartupHours += startupHours;
    if (gymDone) totalGymDays++;
    if (log) {
      totalSleepHours += sleepHours;
      loggedDaysCount++;
    }
    if (floorMet) floorDays++;

    const baseItem = {
      date,
      dayName,
      problems: counters.problems,
      revisions: counters.revisions,
      applications: counters.applications,
      mocks: counters.mocks,
      startupHours,
      gymDone,
      gymHours,
      sleepHours,
      energy,
      floorMet,
    };

    return {
      ...baseItem,
      score: calculateDayScore(baseItem),
    };
  });

  // Calculate best and worst days based on score among days that have logged activity
  const candidateDays = days.filter(
    (d) => logsByDate.has(d.date) || d.problems > 0 || d.applications > 0 || d.mocks > 0,
  );
  const evaluationPool = candidateDays.length > 0 ? candidateDays : days;

  let bestDay: DailyMetricItem | null = null;
  let worstDay: DailyMetricItem | null = null;

  for (const day of evaluationPool) {
    if (!bestDay || day.score > bestDay.score) {
      bestDay = day;
    }
    if (!worstDay || day.score < worstDay.score) {
      worstDay = day;
    }
  }

  const averageSleep =
    loggedDaysCount > 0 ? Math.round((totalSleepHours / loggedDaysCount) * 10) / 10 : 0;

  const weeklyTargets = {
    problems: targets.problemsPerDay * 7,
    applications: targets.applicationsPerDay * 7,
    mocks: targets.mocksPerWeek,
    startupHours: Math.round(targets.startupHours * 7 * 10) / 10,
    gymDays: 5, // 5 days planned
    sleepHours: targets.sleepHours,
    floorDays: 7,
  };

  const totals = {
    problems: totalProblems,
    revisions: totalRevisions,
    applications: totalApplications,
    mocks: totalMocks,
    startupHours: Math.round(totalStartupHours * 10) / 10,
    gymDays: totalGymDays,
    averageSleep,
    floorDays,
  };

  const summaryWithoutHonestRead: Omit<WeeklySummary, 'honestRead'> = {
    weekStart,
    weekEnd,
    days,
    totals,
    targets: weeklyTargets,
    bestDay,
    worstDay,
  };

  const honestRead = generateHonestRead({
    ...summaryWithoutHonestRead,
    honestRead: [],
  });

  return {
    ...summaryWithoutHonestRead,
    honestRead,
  };
}

/**
 * Generates rule-based, plain factual assertions based on thresholds.
 * Strictly asserts objective facts computed from data; contains zero speculative causes.
 */
export function generateHonestRead(summary: WeeklySummary): string[] {
  const statements: string[] = [];
  const { totals, targets, days } = summary;

  // 1. Applications Threshold
  const daysBelowAppTarget = days.filter(
    (d) => d.applications < Math.ceil(targets.applications / 7),
  ).length;
  if (daysBelowAppTarget > 0) {
    statements.push(
      `Applications were below daily target on ${daysBelowAppTarget} of 7 days (${totals.applications} total vs ${targets.applications} target).`,
    );
  } else {
    statements.push(
      `Applications met or exceeded daily target on all 7 days (${totals.applications} total).`,
    );
  }

  // 2. Mocks Threshold
  if (totals.mocks === 0) {
    statements.push(`No mock interview was conducted this week (target: ${targets.mocks}).`);
  } else if (totals.mocks < targets.mocks) {
    statements.push(`${totals.mocks} of ${targets.mocks} targeted mock interviews completed.`);
  } else {
    statements.push(`Mock interview target achieved (${totals.mocks} completed).`);
  }

  // 3. Daily Floor Threshold
  if (totals.floorDays === 7) {
    statements.push('Daily floor completed on all 7 of 7 days (100% floor rate).');
  } else {
    statements.push(
      `Daily floor completed on ${totals.floorDays} of 7 days (${7 - totals.floorDays} day(s) missed).`,
    );
  }

  // 4. Startup Hours Threshold
  if (totals.startupHours >= targets.startupHours) {
    statements.push(
      `Startup hours met weekly target: ${totals.startupHours} hrs logged vs ${targets.startupHours} hrs targeted.`,
    );
  } else {
    const deficit = Math.round((targets.startupHours - totals.startupHours) * 10) / 10;
    statements.push(
      `Startup hours below target: ${totals.startupHours} hrs logged vs ${targets.startupHours} hrs targeted (${deficit} hr deficit).`,
    );
  }

  // 5. Gym Sessions Threshold
  if (totals.gymDays >= targets.gymDays) {
    statements.push(
      `Gym consistency achieved: ${totals.gymDays} of ${targets.gymDays} planned sessions completed.`,
    );
  } else {
    statements.push(
      `Gym sessions missed: ${totals.gymDays} of ${targets.gymDays} planned sessions completed.`,
    );
  }

  // 6. Sleep Threshold
  if (totals.averageSleep > 0 && totals.averageSleep < targets.sleepHours - 0.5) {
    statements.push(
      `Average sleep was ${totals.averageSleep} hrs/night (below ${targets.sleepHours} hr target).`,
    );
  } else if (totals.averageSleep > 0) {
    statements.push(
      `Average sleep was ${totals.averageSleep} hrs/night (target: ${targets.sleepHours} hrs).`,
    );
  }

  return statements;
}

/**
 * Rolls up 4 weeks into a monthly summary (e.g., Month 1 = Weeks 1-4).
 */
export function calculateMonthRollup(monthName: string, weeks: WeeklySummary[]): MonthRollupResult {
  const weeksCount = weeks.length;
  let totalProblems = 0;
  let totalApplications = 0;
  let totalMocks = 0;
  let totalStartupHours = 0;
  let totalGymDays = 0;
  let sleepSum = 0;
  let floorDaysMet = 0;

  for (const w of weeks) {
    totalProblems += w.totals.problems;
    totalApplications += w.totals.applications;
    totalMocks += w.totals.mocks;
    totalStartupHours += w.totals.startupHours;
    totalGymDays += w.totals.gymDays;
    sleepSum += w.totals.averageSleep;
    floorDaysMet += w.totals.floorDays;
  }

  const averageSleep = weeksCount > 0 ? Math.round((sleepSum / weeksCount) * 10) / 10 : 0;
  const totalPossibleFloorDays = weeksCount * 7;
  const floorPercentage =
    totalPossibleFloorDays > 0 ? Math.round((floorDaysMet / totalPossibleFloorDays) * 100) : 0;

  return {
    monthName,
    weeksCount,
    totalProblems,
    totalApplications,
    totalMocks,
    totalStartupHours: Math.round(totalStartupHours * 10) / 10,
    totalGymDays,
    averageSleep,
    floorDaysMet,
    floorPercentage,
  };
}
