import { describe, it, expect } from 'vitest';
import { calculateStreak, DailyLogSummary } from '../src';

describe('Spec 7.3: Streak Engine', () => {
  it('returns zeros and atRisk false for empty history', () => {
    const result = calculateStreak([], '2026-10-16');
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalFloorDays: 0,
      atRisk: false,
    });
  });

  it('evaluates active streak ending today as not at risk (today completed)', () => {
    const logs: DailyLogSummary[] = [
      { date: '2026-10-14', floorMet: true },
      { date: '2026-10-15', floorMet: true },
      { date: '2026-10-16', floorMet: true },
    ];

    const result = calculateStreak(logs, '2026-10-16');
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.totalFloorDays).toBe(3);
    expect(result.atRisk).toBe(false);
  });

  it('marks streak as atRisk: true when today is pending but yesterday was completed', () => {
    const logs: DailyLogSummary[] = [
      { date: '2026-10-13', floorMet: true },
      { date: '2026-10-14', floorMet: true },
      { date: '2026-10-15', floorMet: true }, // Yesterday
      { date: '2026-10-16', floorMet: false }, // Today not met yet
    ];

    const result = calculateStreak(logs, '2026-10-16');
    expect(result.currentStreak).toBe(3); // Preserves streak achieved up to yesterday
    expect(result.longestStreak).toBe(3);
    expect(result.totalFloorDays).toBe(3);
    expect(result.atRisk).toBe(true); // Active but endangered
  });

  it('strictly breaks the streak if yesterday was missed even if older days were completed', () => {
    const logs: DailyLogSummary[] = [
      { date: '2026-10-12', floorMet: true },
      { date: '2026-10-13', floorMet: true },
      { date: '2026-10-14', floorMet: true },
      { date: '2026-10-15', floorMet: false }, // Yesterday missed!
      { date: '2026-10-16', floorMet: false }, // Today not met yet
    ];

    const result = calculateStreak(logs, '2026-10-16');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(3);
    expect(result.totalFloorDays).toBe(3);
    expect(result.atRisk).toBe(false);
  });

  it('starts a new streak of 1 if today is met after yesterday was missed', () => {
    const logs: DailyLogSummary[] = [
      { date: '2026-10-13', floorMet: true },
      { date: '2026-10-14', floorMet: true },
      { date: '2026-10-15', floorMet: false }, // Yesterday missed
      { date: '2026-10-16', floorMet: true }, // Today met
    ];

    const result = calculateStreak(logs, '2026-10-16');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(2);
    expect(result.totalFloorDays).toBe(3);
    expect(result.atRisk).toBe(false);
  });

  it('accurately identifies longest streak across multiple separated periods', () => {
    const logs: DailyLogSummary[] = [
      // 5-day streak
      { date: '2026-09-01', floorMet: true },
      { date: '2026-09-02', floorMet: true },
      { date: '2026-09-03', floorMet: true },
      { date: '2026-09-04', floorMet: true },
      { date: '2026-09-05', floorMet: true },
      // Gap
      { date: '2026-09-06', floorMet: false },
      // 2-day streak
      { date: '2026-09-07', floorMet: true },
      { date: '2026-09-08', floorMet: true },
      // Gap
      { date: '2026-09-09', floorMet: false },
      // Current 3-day streak ending today
      { date: '2026-09-10', floorMet: true },
      { date: '2026-09-11', floorMet: true },
      { date: '2026-09-12', floorMet: true },
    ];

    const result = calculateStreak(logs, '2026-09-12');
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5); // The 5-day streak in early September
    expect(result.totalFloorDays).toBe(10);
    expect(result.atRisk).toBe(false);
  });

  it('accurately bridges month boundaries (e.g. Feb 28 to Mar 1 in non-leap year)', () => {
    const logs: DailyLogSummary[] = [
      { date: '2026-02-27', floorMet: true },
      { date: '2026-02-28', floorMet: true },
      { date: '2026-03-01', floorMet: true },
      { date: '2026-03-02', floorMet: true },
    ];

    const result = calculateStreak(logs, '2026-03-02');
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
    expect(result.totalFloorDays).toBe(4);
    expect(result.atRisk).toBe(false);
  });

  it('accurately bridges year boundaries (Dec 31 to Jan 1)', () => {
    const logs: DailyLogSummary[] = [
      { date: '2025-12-30', floorMet: true },
      { date: '2025-12-31', floorMet: true },
      { date: '2026-01-01', floorMet: true },
      { date: '2026-01-02', floorMet: true },
    ];

    const result = calculateStreak(logs, '2026-01-02');
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
    expect(result.totalFloorDays).toBe(4);
    expect(result.atRisk).toBe(false);
  });

  it('verifies DST-free consecutive days under Asia/Kolkata context', () => {
    // IST never shifts daylight saving time (always UTC+05:30)
    const logs: DailyLogSummary[] = [
      { date: '2026-03-28', floorMet: true },
      { date: '2026-03-29', floorMet: true },
      { date: '2026-03-30', floorMet: true },
      { date: '2026-03-31', floorMet: true },
    ];

    const result = calculateStreak(logs, '2026-03-31');
    expect(result.currentStreak).toBe(4);
  });
});
