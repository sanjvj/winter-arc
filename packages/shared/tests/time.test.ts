import { describe, it, expect } from 'vitest';
import {
  todayIST,
  formatDateIST,
  addDaysIST,
  diffDaysIST,
  weekStartMondayIST,
  getPlanDayNumberIST,
} from '../src/time';

describe('IST Time Utilities', () => {
  describe('Midnight boundary handling', () => {
    it('evaluates date before midnight IST correctly', () => {
      // 2026-10-16 23:59:50 IST is 2026-10-16 18:29:50 UTC
      const preMidnight = new Date('2026-10-16T18:29:50.000Z');
      expect(todayIST(preMidnight)).toBe('2026-10-16');
    });

    it('evaluates date after midnight IST correctly', () => {
      // 2026-10-17 00:00:10 IST is 2026-10-16 18:30:10 UTC
      const postMidnight = new Date('2026-10-16T18:30:10.000Z');
      expect(todayIST(postMidnight)).toBe('2026-10-17');
    });

    it('formats boundary times consistently', () => {
      const utcTime = new Date('2026-10-16T18:30:00.000Z'); // Exact midnight in IST
      expect(formatDateIST(utcTime, 'yyyy-MM-dd HH:mm:ss')).toBe('2026-10-17 00:00:00');
    });
  });

  describe('Month and Year End Boundaries', () => {
    it('handles transition from December 31 to January 1 across year rollover', () => {
      const dec31 = '2026-12-31';
      expect(addDaysIST(dec31, 1)).toBe('2027-01-01');
      expect(addDaysIST('2027-01-01', -1)).toBe('2026-12-31');
    });

    it('handles leap year February 28 to February 29', () => {
      const leapFeb28 = '2024-02-28';
      expect(addDaysIST(leapFeb28, 1)).toBe('2024-02-29');
      expect(addDaysIST(leapFeb28, 2)).toBe('2024-03-01');
    });

    it('handles non-leap year February 28 to March 1', () => {
      const nonLeapFeb28 = '2025-02-28';
      expect(addDaysIST(nonLeapFeb28, 1)).toBe('2025-03-01');
    });

    it('handles 30-day month end (April 30 to May 1)', () => {
      expect(addDaysIST('2026-04-30', 1)).toBe('2026-05-01');
    });

    it('handles 31-day consecutive months (July 31 to August 1)', () => {
      expect(addDaysIST('2026-07-31', 1)).toBe('2026-08-01');
    });
  });

  describe('diffDaysIST', () => {
    it('calculates calendar day differences accurately', () => {
      expect(diffDaysIST('2026-10-01', '2026-10-10')).toBe(9);
      expect(diffDaysIST('2026-10-10', '2026-10-01')).toBe(-9);
      expect(diffDaysIST('2026-10-16', '2026-10-16')).toBe(0);
      expect(diffDaysIST('2026-02-28', '2026-03-01')).toBe(1);
    });
  });

  describe('weekStartMondayIST', () => {
    it('returns the same date when input is already a Monday', () => {
      // 2026-10-12 is Monday
      expect(weekStartMondayIST('2026-10-12')).toBe('2026-10-12');
    });

    it('returns preceding Monday when input is a mid-week day', () => {
      // 2026-10-16 is Friday
      expect(weekStartMondayIST('2026-10-16')).toBe('2026-10-12');
    });

    it('returns preceding Monday when input is Sunday', () => {
      // 2026-10-18 is Sunday
      expect(weekStartMondayIST('2026-10-18')).toBe('2026-10-12');
    });
  });

  describe('getPlanDayNumberIST', () => {
    it('evaluates day 1 on start date', () => {
      expect(getPlanDayNumberIST('2026-10-01', '2026-10-01')).toBe(1);
    });

    it('evaluates day 90 on 89 days after start date', () => {
      const day90Date = addDaysIST('2026-10-01', 89);
      expect(getPlanDayNumberIST('2026-10-01', day90Date)).toBe(90);
    });
  });
});
