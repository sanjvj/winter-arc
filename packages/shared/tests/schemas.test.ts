import { describe, it, expect } from 'vitest';
import {
  SettingsSchema,
  DailyLogSchema,
  ProblemSchema,
  MistakeSchema,
  MockSchema,
  ApplicationSchema,
  JobSchema,
  RoadmapSchema,
} from '../src/schemas';

describe('Zod Schema Boundary Validations', () => {
  it('validates a complete Settings document with defaults applied', () => {
    const rawSettings = {
      planStartDate: '2026-10-01',
      scheduleBlocks: [
        { id: 'sb-1', start: '06:00', end: '08:00', label: 'Gym', category: 'fitness' },
      ],
    };

    const parsed = SettingsSchema.parse(rawSettings);
    expect(parsed.planLengthDays).toBe(90);
    expect(parsed.floor.problems).toBe(2);
    expect(parsed.floor.requireLog).toBe(true);
    expect(parsed.targets.startupHours).toBe(4.5);
    expect(parsed.theme).toBe('dark');
  });

  it('rejects invalid date formats in DailyLog', () => {
    const invalidLog = {
      date: '16-10-2026', // Wrong format
      wakeTime: '06:00',
      sleepTime: '23:00',
      sleepHours: 7,
      startupHours: 4.5,
      gymDone: true,
      gymHours: 2,
      energy: 4,
      win: 'Shipped task',
      wentWrong: 'Nothing',
      tomorrowTop3: ['A', 'B', 'C'],
    };

    expect(() => DailyLogSchema.parse(invalidLog)).toThrow();
  });

  it('validates a valid Problem document with revision defaults', () => {
    const problem = {
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      platform: 'leetcode' as const,
      pattern: 'Two Pointers',
      difficulty: 'easy' as const,
      solvedAt: '2026-10-16',
      timeTakenMin: 18,
      outcome: 'clean' as const,
      insight: 'Used hash map for O(n) complement lookup',
      stuckAt: '',
    };

    const parsed = ProblemSchema.parse(problem);
    expect(parsed.revision.step).toBe(0);
    expect(parsed.revision.mastered).toBe(false);
  });

  it('validates Application document with default status', () => {
    const app = {
      company: 'Razorpay',
      role: 'SDE-1',
      url: 'https://careers.razorpay.com/job/123',
      appliedDate: '2026-10-16',
      referral: true,
    };

    const parsed = ApplicationSchema.parse(app);
    expect(parsed.status).toBe('saved');
    expect(parsed.notes).toBe('');
  });

  it('validates Job document scraped from portal', () => {
    const job = {
      title: 'Software Development Engineer - Fresher',
      company: 'Postman',
      location: 'Bengaluru, India',
      url: 'https://job.postman.com/sde',
      postedDate: '2026-10-16',
    };

    const parsed = JobSchema.parse(job);
    expect(parsed.status).toBe('new');
    expect(parsed.closed).toBe(false);
  });

  it('validates Mistake document', () => {
    const mistake = {
      date: '2026-10-16',
      text: 'Forgot base case in recursive tree traversal',
      pattern: 'Tree DFS',
    };
    const parsed = MistakeSchema.parse(mistake);
    expect(parsed.text).toBe('Forgot base case in recursive tree traversal');
  });

  it('validates Mock document', () => {
    const mock = {
      date: '2026-10-16',
      type: 'dsa' as const,
      platform: 'peer' as const,
      durationMin: 45,
      score: 4,
      strengths: 'Clear explanation of time complexity',
      weaknesses: 'Struggled with edge case handling',
    };
    const parsed = MockSchema.parse(mock);
    expect(parsed.score).toBe(4);
  });

  it('validates Roadmap document', () => {
    const roadmap = {
      weeks: [
        {
          n: 1,
          theme: 'Arrays & Two Pointers',
          goals: [{ id: 'g1', text: 'Solve 15 problems', done: false }],
        },
      ],
      topics: [{ id: 't1', group: 'DSA', text: 'Two Pointers', status: 'todo' as const }],
    };
    const parsed = RoadmapSchema.parse(roadmap);
    expect(parsed.weeks.length).toBe(1);
    expect(parsed.topics[0]?.status).toBe('todo');
  });
});
