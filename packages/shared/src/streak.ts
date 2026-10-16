import { addDaysIST, diffDaysIST, todayIST } from './time';

export interface DailyLogSummary {
  date: string;
  floorMet: boolean;
  submitted?: boolean;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalFloorDays: number;
  atRisk: boolean;
}

/**
 * Spec 7.3: Streak Engine
 * Evaluates consecutive dates ending at referenceDate (today in IST) where floorMet == true.
 *
 * Rules:
 * - If today's floor is met, count backward consecutively starting from today (atRisk = false).
 * - If today's floor is not met, count backward from yesterday. If yesterday was met, currentStreak
 *   is that ongoing streak and atRisk = true (streak is active but endangered; not broken).
 * - A missed floor on any past date prior to today strictly breaks the streak.
 * - longestStreak: maximum consecutive sequence of floorMet == true across all recorded history.
 * - totalFloorDays: total count of unique days where floorMet == true.
 */
export function calculateStreak(
  dailyLogs: DailyLogSummary[],
  referenceDate: string = todayIST(),
): StreakResult {
  if (!dailyLogs || dailyLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalFloorDays: 0,
      atRisk: false,
    };
  }

  // Create lookup map of date -> floorMet
  const logMap = new Map<string, boolean>();
  for (const log of dailyLogs) {
    // If multiple entries for same date exist, true takes precedence
    const existing = logMap.get(log.date);
    logMap.set(log.date, existing ? true : Boolean(log.floorMet));
  }

  // Calculate totalFloorDays
  let totalFloorDays = 0;
  const floorMetDates: string[] = [];
  for (const [date, isMet] of logMap.entries()) {
    if (isMet) {
      totalFloorDays++;
      floorMetDates.push(date);
    }
  }

  // Calculate longestStreak
  floorMetDates.sort(); // Lexicographical sort works for YYYY-MM-DD
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: string | null = null;

  for (const date of floorMetDates) {
    if (prevDate === null) {
      currentRun = 1;
    } else {
      const diff = diffDaysIST(prevDate, date);
      if (diff === 1) {
        currentRun++;
      } else if (diff > 1) {
        currentRun = 1;
      }
      // If diff == 0, duplicate date, ignore
    }
    prevDate = date;
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // Calculate currentStreak and atRisk
  const todayMet = Boolean(logMap.get(referenceDate));

  if (todayMet) {
    let streak = 1;
    let checkDate = addDaysIST(referenceDate, -1);
    while (logMap.get(checkDate) === true) {
      streak++;
      checkDate = addDaysIST(checkDate, -1);
    }
    return {
      currentStreak: streak,
      longestStreak: Math.max(longestStreak, streak),
      totalFloorDays,
      atRisk: false,
    };
  } else {
    // Today not met: check yesterday
    const yesterday = addDaysIST(referenceDate, -1);
    const yesterdayMet = Boolean(logMap.get(yesterday));

    if (yesterdayMet) {
      let streak = 1;
      let checkDate = addDaysIST(yesterday, -1);
      while (logMap.get(checkDate) === true) {
        streak++;
        checkDate = addDaysIST(checkDate, -1);
      }
      return {
        currentStreak: streak,
        longestStreak,
        totalFloorDays,
        atRisk: true,
      };
    } else {
      // Neither today nor yesterday met
      return {
        currentStreak: 0,
        longestStreak,
        totalFloorDays,
        atRisk: false,
      };
    }
  }
}
