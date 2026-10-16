import { describe, it, expect } from 'vitest';
import {
  getWeekDaysIST,
  addDaysIST,
  calculateWeeklySummary,
  calculateMonthRollup,
  DailyLog,
  Problem,
  Application,
  Mock,
  Targets,
  Floor,
} from '../src';

describe('Spec Weekly Review & Honest Read Rules', () => {
  const weekStart = '2026-10-12'; // Monday

  const defaultTargets: Targets = {
    problemsPerDay: 3,
    applicationsPerDay: 5,
    mocksPerWeek: 2,
    startupHours: 4.5,
    gymHours: 2,
    sleepHours: 7,
  };

  const defaultFloor: Floor = {
    problems: 2,
    revisions: 1,
    applications: 5,
    requireLog: true,
  };

  it('generates exact 7 days from Monday to Sunday in IST', () => {
    const days = getWeekDaysIST('2026-10-12');
    expect(days).toEqual([
      '2026-10-12', // Mon
      '2026-10-13', // Tue
      '2026-10-14', // Wed
      '2026-10-15', // Thu
      '2026-10-16', // Fri
      '2026-10-17', // Sat
      '2026-10-18', // Sun
    ]);
  });

  it('aggregates daily metrics, identifies best/worst days, and produces honest-read facts', () => {
    const dailyLogs: DailyLog[] = [
      {
        date: '2026-10-12',
        wakeTime: '06:00',
        sleepTime: '23:00',
        sleepHours: 7.0,
        startupHours: 5.0,
        gymDone: true,
        gymHours: 2.0,
        energy: 5,
        win: 'Crushed graph problems',
        wentWrong: '',
        tomorrowTop3: ['A', 'B', 'C'],
        notes: '',
        overrides: {},
        dueRevisionsAtStart: 0,
        floorMet: true,
        submitted: true,
        submittedAt: null,
        checklist: {},
      },
      {
        date: '2026-10-13',
        wakeTime: '06:00',
        sleepTime: '01:00',
        sleepHours: 5.0,
        startupHours: 2.0,
        gymDone: false,
        gymHours: 0,
        energy: 2,
        win: '',
        wentWrong: 'Distracted by social media',
        tomorrowTop3: ['A', 'B', 'C'],
        notes: '',
        overrides: {},
        dueRevisionsAtStart: 2,
        floorMet: false,
        submitted: true,
        submittedAt: null,
        checklist: {},
      },
    ];

    const problems: Problem[] = [
      {
        title: 'Two Sum',
        url: '',
        platform: 'leetcode',
        pattern: 'Arrays & Hashing',
        difficulty: 'easy',
        solvedAt: '2026-10-12',
        timeTakenMin: 15,
        outcome: 'clean',
        insight: '',
        stuckAt: '',
        complexity: { time: '', space: '' },
        tags: [],
        revision: {
          step: 1,
          nextDue: null,
          history: [{ date: '2026-10-12', result: 'pass', fromStep: 0, toStep: 1 }],
          mastered: false,
        },
      },
    ];

    const applications: Application[] = [
      {
        company: 'Stripe',
        role: 'SDE-1',
        url: '',
        source: 'referral',
        status: 'applied',
        appliedDate: '2026-10-12',
        referral: true,
        location: '',
        notes: '',
        statusHistory: [],
      },
    ];

    const mocks: Mock[] = []; // Zero mocks

    const summary = calculateWeeklySummary({
      weekStart,
      dailyLogs,
      problems,
      applications,
      mocks,
      targets: defaultTargets,
      floor: defaultFloor,
    });

    expect(summary.totals.problems).toBe(1);
    expect(summary.totals.applications).toBe(1);
    expect(summary.totals.mocks).toBe(0);
    expect(summary.totals.floorDays).toBe(1);

    // Best day should be Monday (10-12) where floor was met, energy 5, startup 5h
    expect(summary.bestDay?.date).toBe('2026-10-12');
    // Worst day should be Tuesday (10-13) where floor unmet, energy 2, 0 gym
    expect(summary.worstDay?.date).toBe('2026-10-13');

    // Verify Honest Read assertions
    const hr = summary.honestRead;
    expect(hr.some((s) => s.includes('Applications were below daily target on'))).toBe(true);
    expect(hr.some((s) => s.includes('No mock interview was conducted this week'))).toBe(true);
    expect(hr.some((s) => s.includes('Daily floor completed on 1 of 7 days'))).toBe(true);
    expect(hr.some((s) => s.includes('Startup hours below target'))).toBe(true);
    expect(hr.some((s) => s.includes('Average sleep was 6 hrs/night (below 7 hr target)'))).toBe(
      true,
    );
  });

  it('rolls up multiple weeks into a monthly summary', () => {
    const makeSummary = (
      wStart: string,
      problems: number,
      floorDays: number,
    ): ReturnType<typeof calculateWeeklySummary> => {
      return calculateWeeklySummary({
        weekStart: wStart,
        dailyLogs: Array.from({ length: floorDays }, (_, i) => ({
          date: addDaysIST(wStart, i),
          wakeTime: '06:00',
          sleepTime: '23:00',
          sleepHours: 7.0,
          startupHours: 4.5,
          gymDone: true,
          gymHours: 2.0,
          energy: 4,
          win: '',
          wentWrong: '',
          tomorrowTop3: ['', '', ''],
          notes: '',
          overrides: {},
          dueRevisionsAtStart: 0,
          floorMet: true,
          submitted: true,
          submittedAt: null,
          checklist: {},
        })),
        problems: Array.from({ length: problems }, () => ({
          title: 'Problem',
          url: '',
          platform: 'leetcode',
          pattern: 'Trees',
          difficulty: 'medium',
          solvedAt: wStart,
          timeTakenMin: 20,
          outcome: 'clean',
          insight: '',
          stuckAt: '',
          complexity: { time: '', space: '' },
          tags: [],
          revision: { step: 0, nextDue: null, history: [], mastered: false },
        })),
        applications: [],
        mocks: [],
        targets: defaultTargets,
        floor: defaultFloor,
      });
    };

    const weeks = [
      makeSummary('2026-10-05', 10, 7),
      makeSummary('2026-10-12', 15, 6),
      makeSummary('2026-10-19', 12, 7),
      makeSummary('2026-10-26', 14, 5),
    ];

    const monthRollup = calculateMonthRollup('Month 1 (Weeks 1-4)', weeks);

    expect(monthRollup.totalProblems).toBe(51); // 10 + 15 + 12 + 14
    expect(monthRollup.floorDaysMet).toBe(25); // 7 + 6 + 7 + 5 = 25 out of 28
    expect(monthRollup.floorPercentage).toBe(89); // 25/28 = 89.2% -> 89%
  });
});
