import { describe, it, expect } from 'vitest';
import {
  initProblemRevision,
  advanceRevision,
  getRevisionQueue,
  getRevisionForecast,
  Problem,
  ProblemRevision,
} from '../src';

describe('Spec 7.4: Spaced Repetition Revision Engine', () => {
  const solvedAt = '2026-10-01';

  describe('Problem Initialization', () => {
    it('fast-tracks clean solve <= 25 min to Step 2 (nextDue = +7 days)', () => {
      const rev = initProblemRevision(solvedAt, 'clean', 25);
      expect(rev.step).toBe(2);
      expect(rev.nextDue).toBe('2026-10-08'); // 2026-10-01 + 7 days
      expect(rev.mastered).toBe(false);
      expect(rev.history).toEqual([]);
    });

    it('fast-tracks clean solve in 10 min to Step 2', () => {
      const rev = initProblemRevision(solvedAt, 'clean', 10);
      expect(rev.step).toBe(2);
      expect(rev.nextDue).toBe('2026-10-08');
      expect(rev.mastered).toBe(false);
    });

    it('starts at Step 0 (+1 day) if clean solve took > 25 min', () => {
      const rev = initProblemRevision(solvedAt, 'clean', 26);
      expect(rev.step).toBe(0);
      expect(rev.nextDue).toBe('2026-10-02'); // +1 day
      expect(rev.mastered).toBe(false);
    });

    it('starts at Step 0 (+1 day) if outcome is hinted regardless of time', () => {
      const rev = initProblemRevision(solvedAt, 'hinted', 15);
      expect(rev.step).toBe(0);
      expect(rev.nextDue).toBe('2026-10-02');
      expect(rev.mastered).toBe(false);
    });

    it('starts at Step 0 (+1 day) if outcome is failed regardless of time', () => {
      const rev = initProblemRevision(solvedAt, 'failed', 20);
      expect(rev.step).toBe(0);
      expect(rev.nextDue).toBe('2026-10-02');
      expect(rev.mastered).toBe(false);
    });
  });

  describe('Pass Progression through all steps to Mastery', () => {
    it('progresses from Step 0 through Step 5 (mastered)', () => {
      // Step 0 -> Step 1 (+3 days)
      const initial: ProblemRevision = {
        step: 0,
        nextDue: '2026-10-02',
        history: [],
        mastered: false,
      };

      const rev1 = advanceRevision(initial, '2026-10-02', 'pass');
      expect(rev1.step).toBe(1);
      expect(rev1.nextDue).toBe('2026-10-05'); // +3 days
      expect(rev1.mastered).toBe(false);
      expect(rev1.history).toHaveLength(1);
      expect(rev1.history[0]).toEqual({
        date: '2026-10-02',
        result: 'pass',
        fromStep: 0,
        toStep: 1,
      });

      // Step 1 -> Step 2 (+7 days)
      const rev2 = advanceRevision(rev1, '2026-10-05', 'pass');
      expect(rev2.step).toBe(2);
      expect(rev2.nextDue).toBe('2026-10-12'); // +7 days
      expect(rev2.mastered).toBe(false);

      // Step 2 -> Step 3 (+14 days)
      const rev3 = advanceRevision(rev2, '2026-10-12', 'pass');
      expect(rev3.step).toBe(3);
      expect(rev3.nextDue).toBe('2026-10-26'); // +14 days
      expect(rev3.mastered).toBe(false);

      // Step 3 -> Step 4 (+30 days)
      const rev4 = advanceRevision(rev3, '2026-10-26', 'pass');
      expect(rev4.step).toBe(4);
      expect(rev4.nextDue).toBe('2026-11-25'); // +30 days (October has 31 days)
      expect(rev4.mastered).toBe(false);

      // Step 4 -> Step 5 (Mastered! nextDue = null)
      const rev5 = advanceRevision(rev4, '2026-11-25', 'pass');
      expect(rev5.step).toBe(5);
      expect(rev5.nextDue).toBeNull();
      expect(rev5.mastered).toBe(true);
      expect(rev5.history).toHaveLength(5);
      expect(rev5.history[4]).toEqual({
        date: '2026-11-25',
        result: 'pass',
        fromStep: 4,
        toStep: 5,
      });
    });

    it('no-ops if problem is already mastered', () => {
      const masteredRev: ProblemRevision = {
        step: 5,
        nextDue: null,
        history: [{ date: '2026-11-25', result: 'pass', fromStep: 4, toStep: 5 }],
        mastered: true,
      };

      const result = advanceRevision(masteredRev, '2026-11-30', 'pass');
      expect(result).toEqual(masteredRev);
    });
  });

  describe('Failure Demotion', () => {
    it('resets to Step 0 due tomorrow from any step', () => {
      const advancedRev: ProblemRevision = {
        step: 3,
        nextDue: '2026-10-10',
        history: [],
        mastered: false,
      };

      const failedRev = advanceRevision(advancedRev, '2026-10-10', 'fail');
      expect(failedRev.step).toBe(0);
      expect(failedRev.nextDue).toBe('2026-10-11'); // Tomorrow (+1 day)
      expect(failedRev.mastered).toBe(false);
      expect(failedRev.history[0]).toEqual({
        date: '2026-10-10',
        result: 'fail',
        fromStep: 3,
        toStep: 0,
      });
    });
  });

  describe('Overdue Advancement & Zero Penalty', () => {
    it('advances exactly one step only even when overdue by months', () => {
      const overdueRev: ProblemRevision = {
        step: 1, // scheduled for +7 days next
        nextDue: '2026-06-01',
        history: [],
        mastered: false,
      };

      // Reviewing 4 months late on 2026-10-15
      const reviewed = advanceRevision(overdueRev, '2026-10-15', 'pass');
      expect(reviewed.step).toBe(2);
      // New nextDue should be reviewDate (2026-10-15) + interval for step 2 (7 days) = 2026-10-22
      expect(reviewed.nextDue).toBe('2026-10-22');
      expect(reviewed.mastered).toBe(false);
      expect(reviewed.history[0]).toEqual({
        date: '2026-10-15',
        result: 'pass',
        fromStep: 1,
        toStep: 2,
      });
    });
  });

  describe('Idempotency (Double completion on same day)', () => {
    it('ignores repeat review on the exact same date', () => {
      const initial: ProblemRevision = {
        step: 0,
        nextDue: '2026-10-10',
        history: [],
        mastered: false,
      };

      const firstReview = advanceRevision(initial, '2026-10-10', 'pass');
      expect(firstReview.step).toBe(1);
      expect(firstReview.history).toHaveLength(1);

      // Attempt second review on the same day
      const secondReview = advanceRevision(firstReview, '2026-10-10', 'pass');
      expect(secondReview).toBe(firstReview);
      expect(secondReview.step).toBe(1);
      expect(secondReview.history).toHaveLength(1);

      // Attempt fail on the same day
      const thirdReview = advanceRevision(firstReview, '2026-10-10', 'fail');
      expect(thirdReview).toBe(firstReview);
    });
  });

  describe('getRevisionQueue', () => {
    const makeProblem = (
      id: string,
      title: string,
      nextDue: string | null,
      step: number = 0,
      mastered: boolean = false,
    ): Problem => ({
      id,
      title,
      url: `https://leetcode.com/problems/${id}`,
      platform: 'leetcode',
      pattern: 'Arrays & Hashing',
      difficulty: 'easy',
      solvedAt: '2026-10-01',
      timeTakenMin: 20,
      outcome: 'clean',
      insight: '',
      stuckAt: '',
      complexity: { time: '', space: '' },
      tags: [],
      revision: {
        step,
        nextDue,
        history: [],
        mastered,
      },
    });

    it('correctly classifies overdue and due today, sorting overdue oldest-first', () => {
      const p1 = makeProblem('p1', 'Problem Due Today B', '2026-10-16');
      const p2 = makeProblem('p2', 'Problem Due Today A', '2026-10-16');
      const p3 = makeProblem('p3', 'Old Overdue', '2026-10-10');
      const p4 = makeProblem('p4', 'Very Old Overdue', '2026-10-02');
      const p5 = makeProblem('p5', 'Future Problem', '2026-10-20');
      const p6 = makeProblem('p6', 'Mastered Problem', null, 5, true);

      const result = getRevisionQueue([p1, p2, p3, p4, p5, p6], '2026-10-16');

      expect(result.masteredCount).toBe(1);
      expect(result.totalDue).toBe(4); // 2 overdue + 2 due today

      // Overdue must be sorted oldest-first: p4 (10-02) before p3 (10-10)
      expect(result.overdue.map((p) => p.id)).toEqual(['p4', 'p3']);

      // Due today sorted alphabetically: p2 ('...A') before p1 ('...B')
      expect(result.dueToday.map((p) => p.id)).toEqual(['p2', 'p1']);

      // Queue combines overdue first, then due today
      expect(result.queue.map((p) => p.id)).toEqual(['p4', 'p3', 'p2', 'p1']);
    });
  });

  describe('getRevisionForecast', () => {
    const makeProblem = (title: string, nextDue: string | null): Problem => ({
      title,
      url: 'https://leetcode.com/problems/test',
      platform: 'leetcode',
      pattern: 'Trees',
      difficulty: 'medium',
      solvedAt: '2026-10-01',
      timeTakenMin: 20,
      outcome: 'clean',
      insight: '',
      stuckAt: '',
      complexity: { time: '', space: '' },
      tags: [],
      revision: {
        step: 1,
        nextDue,
        history: [],
        mastered: false,
      },
    });

    it('forecasts 14 calendar days with Day 0 including overdue backlog', () => {
      const problems: Problem[] = [
        makeProblem('Overdue 1', '2026-10-10'),
        makeProblem('Overdue 2', '2026-10-12'),
        makeProblem('Due Today', '2026-10-16'),
        makeProblem('Due In 2 Days', '2026-10-18'),
        makeProblem('Due In 5 Days', '2026-10-21'),
      ];

      const forecast = getRevisionForecast(problems, '2026-10-16', 14);

      expect(forecast).toHaveLength(14);
      // Day 0 (2026-10-16): 2 overdue + 1 scheduled = 3 due
      expect(forecast[0]?.date).toBe('2026-10-16');
      expect(forecast[0]?.overdueCount).toBe(2);
      expect(forecast[0]?.scheduledCount).toBe(1);
      expect(forecast[0]?.dueCount).toBe(3);

      // Day 1 (2026-10-17): 0
      expect(forecast[1]?.date).toBe('2026-10-17');
      expect(forecast[1]?.dueCount).toBe(0);

      // Day 2 (2026-10-18): 1
      expect(forecast[2]?.date).toBe('2026-10-18');
      expect(forecast[2]?.dueCount).toBe(1);

      // Day 5 (2026-10-21): 1
      expect(forecast[5]?.date).toBe('2026-10-21');
      expect(forecast[5]?.dueCount).toBe(1);
    });
  });
});
