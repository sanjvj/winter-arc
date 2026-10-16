import { describe, it, expect } from 'vitest';
import {
  calculateDailyCounters,
  evaluateFloorMet,
  Floor,
  Problem,
  Application,
  Mock,
} from '../src';

describe('Spec 7.1: Daily Counter Derivations with Overrides', () => {
  const sampleProblems: Problem[] = [
    {
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum',
      platform: 'leetcode',
      pattern: 'Arrays & Hashing',
      difficulty: 'easy',
      solvedAt: '2026-10-16',
      timeTakenMin: 15,
      outcome: 'clean',
      insight: 'Hash map complement',
      stuckAt: '',
      complexity: { time: 'O(N)', space: 'O(N)' },
      tags: ['hashmap'],
      revision: {
        step: 1,
        nextDue: '2026-10-19',
        history: [{ date: '2026-10-16', result: 'pass', fromStep: 0, toStep: 1 }],
        mastered: false,
      },
    },
    {
      title: 'Valid Anagram',
      url: 'https://leetcode.com/problems/valid-anagram',
      platform: 'leetcode',
      pattern: 'Arrays & Hashing',
      difficulty: 'easy',
      solvedAt: '2026-10-16',
      timeTakenMin: 10,
      outcome: 'clean',
      insight: 'Character count array',
      stuckAt: '',
      complexity: { time: 'O(N)', space: 'O(1)' },
      tags: ['hashmap'],
      revision: {
        step: 0,
        nextDue: '2026-10-17',
        history: [],
        mastered: false,
      },
    },
    {
      title: 'Group Anagrams',
      url: 'https://leetcode.com/problems/group-anagrams',
      platform: 'leetcode',
      pattern: 'Arrays & Hashing',
      difficulty: 'medium',
      solvedAt: '2026-10-15', // Solved yesterday
      timeTakenMin: 25,
      outcome: 'clean',
      insight: 'Sorted string key',
      stuckAt: '',
      complexity: { time: 'O(N*K log K)', space: 'O(NK)' },
      tags: ['hashmap'],
      revision: {
        step: 2,
        nextDue: '2026-10-23',
        history: [{ date: '2026-10-16', result: 'pass', fromStep: 1, toStep: 2 }], // Revised today
        mastered: false,
      },
    },
  ];

  const sampleApplications: Application[] = [
    {
      company: 'Google',
      role: 'SDE-1',
      url: 'https://careers.google.com',
      source: 'career-page',
      status: 'applied',
      appliedDate: '2026-10-16',
      referral: false,
      location: 'Bengaluru',
      notes: '',
      statusHistory: [{ status: 'applied', date: '2026-10-16' }],
    },
    {
      company: 'Microsoft',
      role: 'Software Engineer',
      url: 'https://careers.microsoft.com',
      source: 'referral',
      status: 'applied',
      appliedDate: '2026-10-15', // Yesterday
      referral: true,
      location: 'Hyderabad',
      notes: '',
      statusHistory: [{ status: 'applied', date: '2026-10-15' }],
    },
  ];

  const sampleMocks: Mock[] = [
    {
      date: '2026-10-16',
      type: 'dsa',
      platform: 'peer',
      durationMin: 45,
      score: 4,
      strengths: 'Clear explanation',
      weaknesses: 'Edge case omission',
      actionItems: ['Check 0-length input'],
      problemTitles: ['Two Sum'],
    },
  ];

  it('correctly auto-derives problems, revisions, applications, and mocks for date D', () => {
    const result = calculateDailyCounters('2026-10-16', {
      problems: sampleProblems,
      applications: sampleApplications,
      mocks: sampleMocks,
    });

    expect(result.problems).toBe(2); // Two Sum, Valid Anagram
    expect(result.revisions).toBe(2); // Two Sum + Group Anagrams had history entry on 2026-10-16
    expect(result.applications).toBe(1); // Google
    expect(result.mocks).toBe(1);

    expect(result.autoDerived.problems).toBe(2);
    expect(result.autoDerived.revisions).toBe(2);
    expect(result.autoDerived.applications).toBe(1);
    expect(result.autoDerived.mocks).toBe(1);
  });

  it('allows explicit overrides to take precedence over auto-derived values', () => {
    const result = calculateDailyCounters('2026-10-16', {
      problems: sampleProblems,
      applications: sampleApplications,
      mocks: sampleMocks,
      overrides: {
        problems: 5,
        revisions: 0,
        applications: 8,
      },
    });

    expect(result.problems).toBe(5);
    expect(result.revisions).toBe(0);
    expect(result.applications).toBe(8);
    expect(result.mocks).toBe(1); // Mocks cannot be overridden

    // Auto-derived remains intact
    expect(result.autoDerived.problems).toBe(2);
    expect(result.autoDerived.revisions).toBe(2);
    expect(result.autoDerived.applications).toBe(1);
  });
});

describe('Spec 7.2: Daily Floor Completion Check (floorMet)', () => {
  const standardFloor: Floor = {
    problems: 2,
    revisions: 1,
    applications: 5,
    requireLog: true,
  };

  it('evaluates floorMet as true when all 4 conditions are satisfied', () => {
    const result = evaluateFloorMet(
      { problems: 2, revisions: 1, applications: 5 },
      standardFloor,
      3, // dueRevisionsAtStart
      true, // submitted
    );

    expect(result.floorMet).toBe(true);
    expect(result.conditions.problemsMet).toBe(true);
    expect(result.conditions.revisionsMet).toBe(true);
    expect(result.conditions.applicationsMet).toBe(true);
    expect(result.conditions.logSubmittedMet).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('evaluates floorMet as false when problems count is below floor', () => {
    const result = evaluateFloorMet(
      { problems: 1, revisions: 1, applications: 5 },
      standardFloor,
      3,
      true,
    );

    expect(result.floorMet).toBe(false);
    expect(result.conditions.problemsMet).toBe(false);
    expect(result.missing).toContain('1 more problem');
  });

  it('evaluates floorMet as false when applications count is below floor', () => {
    const result = evaluateFloorMet(
      { problems: 2, revisions: 1, applications: 2 },
      standardFloor,
      3,
      true,
    );

    expect(result.floorMet).toBe(false);
    expect(result.conditions.applicationsMet).toBe(false);
    expect(result.missing).toContain('3 more applications');
  });

  it('evaluates floorMet as false when daily log is not submitted and requireLog is true', () => {
    const result = evaluateFloorMet(
      { problems: 2, revisions: 1, applications: 5 },
      standardFloor,
      3,
      false, // Not submitted
    );

    expect(result.floorMet).toBe(false);
    expect(result.conditions.logSubmittedMet).toBe(false);
    expect(result.missing).toContain('Daily log must be closed and submitted');
  });

  it('evaluates floorMet as true when log is not submitted but requireLog is false', () => {
    const lenientFloor: Floor = { ...standardFloor, requireLog: false };
    const result = evaluateFloorMet(
      { problems: 2, revisions: 1, applications: 5 },
      lenientFloor,
      3,
      false,
    );

    expect(result.floorMet).toBe(true);
    expect(result.conditions.logSubmittedMet).toBe(true);
  });

  it('SPECIAL BOUNDARY: automatically meets revision requirement when dueRevisionsAtStart == 0 even if revisions == 0', () => {
    const result = evaluateFloorMet(
      { problems: 2, revisions: 0, applications: 5 },
      standardFloor,
      0, // Zero revisions due at day start
      true,
    );

    expect(result.floorMet).toBe(true);
    expect(result.conditions.revisionsMet).toBe(true);
  });

  it('fails revision requirement when dueRevisionsAtStart > 0 and revisions count is 0', () => {
    const result = evaluateFloorMet(
      { problems: 2, revisions: 0, applications: 5 },
      standardFloor,
      2, // 2 revisions were due at start
      true,
    );

    expect(result.floorMet).toBe(false);
    expect(result.conditions.revisionsMet).toBe(false);
    expect(result.missing).toContain('1 more revision');
  });
});
