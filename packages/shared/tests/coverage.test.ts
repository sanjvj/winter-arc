import { describe, it, expect } from 'vitest';
import { calculatePatternCoverage, Problem } from '../src';

describe('Spec 7.5: Pattern Coverage Calculation', () => {
  const makeProblem = (pattern: string): Problem => ({
    title: `Problem in ${pattern}`,
    url: 'https://leetcode.com/problems/test',
    platform: 'leetcode',
    pattern,
    difficulty: 'medium',
    solvedAt: '2026-10-01',
    timeTakenMin: 20,
    outcome: 'clean',
    insight: '',
    stuckAt: '',
    complexity: { time: '', space: '' },
    tags: [],
    revision: {
      step: 0,
      nextDue: null,
      history: [],
      mastered: false,
    },
  });

  const targets: Record<string, number> = {
    'Arrays & Hashing': 15,
    'Two Pointers': 10,
    'Sliding Window': 10,
    Stack: 10,
    '1-D DP': 12,
  };

  it('calculates coverage percentages and identifies weakest 3 patterns', () => {
    const problems: Problem[] = [
      // Arrays & Hashing: 15 / 15 -> 100%
      ...Array.from({ length: 15 }, () => makeProblem('Arrays & Hashing')),
      // Two Pointers: 8 / 10 -> 80%
      ...Array.from({ length: 8 }, () => makeProblem('Two Pointers')),
      // Sliding Window: 2 / 10 -> 20%
      ...Array.from({ length: 2 }, () => makeProblem('Sliding Window')),
      // Stack: 0 / 10 -> 0%
      // 1-D DP: 1 / 12 -> 8.3%
      makeProblem('1-D DP'),
    ];

    const result = calculatePatternCoverage(problems, targets);

    expect(result.totalSolved).toBe(26);

    const arrays = result.patterns.find((p) => p.pattern === 'Arrays & Hashing');
    expect(arrays).toBeDefined();
    expect(arrays?.solved).toBe(15);
    expect(arrays?.target).toBe(15);
    expect(arrays?.percentage).toBe(100);
    expect(arrays?.status).toBe('completed');

    const stack = result.patterns.find((p) => p.pattern === 'Stack');
    expect(stack?.solved).toBe(0);
    expect(stack?.percentage).toBe(0);
    expect(stack?.status).toBe('critical');

    // Weakest 3 patterns should be:
    // 1. Stack: 0%
    // 2. 1-D DP: 8.3%
    // 3. Sliding Window: 20%
    expect(result.weakestPatterns).toHaveLength(3);
    expect(result.weakestPatterns[0]?.pattern).toBe('Stack');
    expect(result.weakestPatterns[1]?.pattern).toBe('1-D DP');
    expect(result.weakestPatterns[2]?.pattern).toBe('Sliding Window');
  });
});
