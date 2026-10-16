import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { addDays, differenceInCalendarDays, startOfWeek, parse } from 'date-fns';

export const TIMEZONE_IST = 'Asia/Kolkata';

/**
 * Returns today's date formatted as YYYY-MM-DD in IST (Asia/Kolkata).
 * An optional date instance can be provided (useful for deterministic testing).
 */
export function todayIST(referenceDate: Date = new Date()): string {
  return formatInTimeZone(referenceDate, TIMEZONE_IST, 'yyyy-MM-dd');
}

/**
 * Formats a Date instance or YYYY-MM-DD string according to a given pattern in IST.
 */
export function formatDateIST(dateInput: Date | string, pattern: string = 'yyyy-MM-dd'): string {
  let date: Date;
  if (typeof dateInput === 'string') {
    // Parse YYYY-MM-DD in IST context
    const parsed = parse(dateInput, 'yyyy-MM-dd', new Date());
    date = fromZonedTime(parsed, TIMEZONE_IST);
  } else {
    date = dateInput;
  }
  return formatInTimeZone(date, TIMEZONE_IST, pattern);
}

/**
 * Adds (or subtracts) days from a YYYY-MM-DD date string in IST calendar context.
 */
export function addDaysIST(dateStr: string, amount: number): string {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  const result = addDays(parsed, amount);
  return formatInTimeZone(result, TIMEZONE_IST, 'yyyy-MM-dd');
}

/**
 * Calculates calendar day difference (endDate - startDate).
 * e.g. diffDaysIST('2026-10-01', '2026-10-05') => 4
 */
export function diffDaysIST(startDateStr: string, endDateStr: string): number {
  const start = parse(startDateStr, 'yyyy-MM-dd', new Date());
  const end = parse(endDateStr, 'yyyy-MM-dd', new Date());
  return differenceInCalendarDays(end, start);
}

/**
 * Returns the Monday-based start of the week for a given YYYY-MM-DD date in IST.
 */
export function weekStartMondayIST(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  const monday = startOfWeek(parsed, { weekStartsOn: 1 });
  return formatInTimeZone(monday, TIMEZONE_IST, 'yyyy-MM-dd');
}

/**
 * Returns the 1-based day of a plan given its start date (YYYY-MM-DD).
 * Day 1 is the start date itself.
 */
export function getPlanDayNumberIST(
  startDateStr: string,
  targetDateStr: string = todayIST(),
): number {
  const diff = diffDaysIST(startDateStr, targetDateStr);
  return diff + 1;
}

/**
 * Returns a localized current time in IST formatted for display.
 */
export function nowInISTDisplay(referenceDate: Date = new Date()): string {
  return formatInTimeZone(referenceDate, TIMEZONE_IST, 'EEEE, d MMMM yyyy');
}
