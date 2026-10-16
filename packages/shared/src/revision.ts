import { Problem, ProblemRevision } from './schemas';
import { addDaysIST } from './time';

/**
 * Spec 7.4: Spaced Repetition Revision Intervals in Days
 * [1, 3, 7, 14, 30] correspond to steps 0, 1, 2, 3, 4.
 * Step 5 corresponds to 'mastered'.
 */
export const REVISION_INTERVALS = [1, 3, 7, 14, 30] as const;
export const MAX_REVISION_STEP = 5;

/**
 * Initializes a new problem's revision metadata.
 * - Clean solve in <= 25 min fast-tracks to Step 2 (nextDue = solvedAt + 7 days).
 * - All other solves initialize at Step 0 (nextDue = solvedAt + 1 day).
 */
export function initProblemRevision(
  solvedAt: string,
  outcome: 'clean' | 'hinted' | 'failed',
  timeTakenMin: number,
): ProblemRevision {
  if (outcome === 'clean' && timeTakenMin <= 25) {
    return {
      step: 2,
      nextDue: addDaysIST(solvedAt, REVISION_INTERVALS[2]), // 7 days
      history: [],
      mastered: false,
    };
  }

  return {
    step: 0,
    nextDue: addDaysIST(solvedAt, REVISION_INTERVALS[0]), // 1 day
    history: [],
    mastered: false,
  };
}

/**
 * Advances or demotes a problem's revision state based on a review outcome.
 *
 * Rules:
 * - If problem is already mastered, return unchanged.
 * - Idempotency: If a review entry already exists on reviewDate in history, return unchanged.
 * - On PASS:
 *   - Advances exactly one step (even if overdue by more than the interval).
 *   - If step < 4: step advances to step + 1, nextDue = reviewDate + INTERVALS[step + 1].
 *   - If step === 4: step advances to 5, mastered = true, nextDue = null.
 * - On FAIL:
 *   - Resets to Step 0, nextDue = reviewDate + 1 day (tomorrow), mastered = false.
 */
export function advanceRevision(
  current: ProblemRevision,
  reviewDate: string,
  result: 'pass' | 'fail',
): ProblemRevision {
  if (current.mastered) {
    return current;
  }

  // Idempotency check: review already performed on this date
  const alreadyReviewedToday = current.history.some((h) => h.date === reviewDate);
  if (alreadyReviewedToday) {
    return current;
  }

  const fromStep = current.step;

  if (result === 'pass') {
    if (fromStep >= 4) {
      // Step 4 passed -> Mastered (Step 5)
      return {
        step: 5,
        nextDue: null,
        mastered: true,
        history: [
          ...current.history,
          {
            date: reviewDate,
            result: 'pass',
            fromStep,
            toStep: 5,
          },
        ],
      };
    }

    const nextStep = fromStep + 1;
    const intervalDays = REVISION_INTERVALS[nextStep] ?? 30;

    return {
      step: nextStep,
      nextDue: addDaysIST(reviewDate, intervalDays),
      mastered: false,
      history: [
        ...current.history,
        {
          date: reviewDate,
          result: 'pass',
          fromStep,
          toStep: nextStep,
        },
      ],
    };
  }

  // Result === 'fail'
  return {
    step: 0,
    nextDue: addDaysIST(reviewDate, REVISION_INTERVALS[0]), // Due tomorrow (+1 day)
    mastered: false,
    history: [
      ...current.history,
      {
        date: reviewDate,
        result: 'fail',
        fromStep,
        toStep: 0,
      },
    ],
  };
}

export interface RevisionQueueResult {
  queue: Problem[];
  overdue: Problem[];
  dueToday: Problem[];
  masteredCount: number;
  totalDue: number;
}

/**
 * Computes the revision queue for a given reference date (IST).
 * - Overdue items: nextDue < referenceDate and !mastered, sorted oldest-first (ascending nextDue).
 * - Due today: nextDue === referenceDate and !mastered.
 * - Queue = [...overdue, ...dueToday].
 */
export function getRevisionQueue(problems: Problem[], referenceDate: string): RevisionQueueResult {
  const overdue: Problem[] = [];
  const dueToday: Problem[] = [];
  let masteredCount = 0;

  for (const problem of problems) {
    if (problem.revision.mastered) {
      masteredCount++;
      continue;
    }

    const nextDue = problem.revision.nextDue;
    if (!nextDue) {
      continue;
    }

    if (nextDue < referenceDate) {
      overdue.push(problem);
    } else if (nextDue === referenceDate) {
      dueToday.push(problem);
    }
  }

  // Sort overdue oldest-first (earliest nextDue first)
  overdue.sort((a, b) => {
    const dueA = a.revision.nextDue ?? '';
    const dueB = b.revision.nextDue ?? '';
    if (dueA !== dueB) {
      return dueA.localeCompare(dueB);
    }
    return a.title.localeCompare(b.title);
  });

  // Sort dueToday alphabetically for deterministic order
  dueToday.sort((a, b) => a.title.localeCompare(b.title));

  return {
    queue: [...overdue, ...dueToday],
    overdue,
    dueToday,
    masteredCount,
    totalDue: overdue.length + dueToday.length,
  };
}

export interface DayForecast {
  date: string;
  dueCount: number;
  scheduledCount: number;
  overdueCount: number;
}

/**
 * Generates a 14-day revision forecast starting at referenceDate.
 * For day 0 (today), dueCount reflects total immediate workload (overdue + scheduled today).
 * For day 1..13, dueCount reflects scheduled items on that specific calendar day.
 */
export function getRevisionForecast(
  problems: Problem[],
  referenceDate: string,
  daysAhead: number = 14,
): DayForecast[] {
  const forecast: DayForecast[] = [];

  // Count overdue items once
  const overdueCount = problems.filter(
    (p) => !p.revision.mastered && p.revision.nextDue && p.revision.nextDue < referenceDate,
  ).length;

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = addDaysIST(referenceDate, i);
    const scheduled = problems.filter(
      (p) => !p.revision.mastered && p.revision.nextDue === targetDate,
    ).length;

    const isToday = i === 0;
    const dueCount = isToday ? scheduled + overdueCount : scheduled;

    forecast.push({
      date: targetDate,
      dueCount,
      scheduledCount: scheduled,
      overdueCount: isToday ? overdueCount : 0,
    });
  }

  return forecast;
}
