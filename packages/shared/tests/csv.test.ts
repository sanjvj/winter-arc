import { describe, it, expect } from 'vitest';
import {
  parseProblemsCsv,
  exportProblemsCsv,
  exportApplicationsCsv,
  Problem,
  Application,
} from '../src';

describe('CSV Parsing, Dry-Run Validation, and Export', () => {
  const sampleCsv = `Title,URL,Pattern,Difficulty,Date,Outcome,TimeTaken,Insight
"Two Sum","https://leetcode.com/problems/two-sum/","Arrays & Hashing","Easy","2026-10-10","clean","15","Hash map complement"
"Valid Anagram","https://leetcode.com/problems/valid-anagram/","Arrays & Hashing","Easy","2026-10-11","clean","10","Frequency array"
"3Sum","https://leetcode.com/problems/3sum/","Two Pointers","Medium","2026-10-12","hinted","35","Sort then two pointers"
`;

  it('parses standard CSV with column mapping and computes revision states', () => {
    const result = parseProblemsCsv(sampleCsv);

    expect(result.errors).toHaveLength(0);
    expect(result.duplicates).toHaveLength(0);
    expect(result.valid).toHaveLength(3);

    const p1 = result.valid[0];
    expect(p1?.title).toBe('Two Sum');
    expect(p1?.difficulty).toBe('easy');
    expect(p1?.pattern).toBe('Arrays & Hashing');
    expect(p1?.solvedAt).toBe('2026-10-10');
    expect(p1?.outcome).toBe('clean');
    expect(p1?.timeTakenMin).toBe(15);
    expect(p1?.insight).toBe('Hash map complement');
    // Clean solve <= 25m fast-tracks to step 2 (+7 days)
    expect(p1?.revision.step).toBe(2);
    expect(p1?.revision.nextDue).toBe('2026-10-17');

    const p3 = result.valid[2];
    expect(p3?.title).toBe('3Sum');
    expect(p3?.difficulty).toBe('medium');
    expect(p3?.outcome).toBe('hinted');
    // Hinted solve starts at step 0 (+1 day)
    expect(p3?.revision.step).toBe(0);
    expect(p3?.revision.nextDue).toBe('2026-10-13');
  });

  it('detects duplicate URLs against existing problems and intra-batch duplicates', () => {
    const existing = new Set(['https://leetcode.com/problems/two-sum']);

    const duplicateCsv = `title,url,pattern,difficulty,date,outcome
"Duplicate Two Sum","https://leetcode.com/problems/two-sum/","Arrays & Hashing","easy","2026-10-15","clean"
"Valid Anagram 1","https://leetcode.com/problems/valid-anagram/","Arrays & Hashing","easy","2026-10-15","clean"
"Valid Anagram 2","https://leetcode.com/problems/valid-anagram/","Arrays & Hashing","easy","2026-10-15","clean"
`;

    const result = parseProblemsCsv(duplicateCsv, existing);

    expect(result.valid).toHaveLength(1); // Only Valid Anagram 1
    expect(result.duplicates).toHaveLength(2); // Two Sum (in existing) + Valid Anagram 2 (in batch)
    expect(result.duplicates[0]?.title).toBe('Duplicate Two Sum');
    expect(result.duplicates[1]?.title).toBe('Valid Anagram 2');
  });

  it('reports missing required title rows as errors', () => {
    const badCsv = `title,url,pattern,difficulty,date,outcome
"","https://leetcode.com/problems/empty/","Arrays & Hashing","easy","2026-10-15","clean"
"Valid Problem","https://leetcode.com/problems/valid/","Arrays & Hashing","easy","2026-10-15","clean"
`;

    const result = parseProblemsCsv(badCsv);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rowNumber).toBe(2);
  });

  it('exports problems to CSV matching format', () => {
    const problems: Problem[] = [
      {
        title: 'Two Sum',
        url: 'https://leetcode.com/problems/two-sum/',
        platform: 'leetcode',
        pattern: 'Arrays & Hashing',
        difficulty: 'easy',
        solvedAt: '2026-10-10',
        timeTakenMin: 15,
        outcome: 'clean',
        insight: 'Hash map complement, with a comma',
        stuckAt: '',
        complexity: { time: 'O(N)', space: 'O(N)' },
        tags: [],
        revision: {
          step: 2,
          nextDue: '2026-10-17',
          history: [],
          mastered: false,
        },
      },
    ];

    const csvOutput = exportProblemsCsv(problems);
    expect(csvOutput).toContain('Two Sum');
    expect(csvOutput).toContain('"Hash map complement, with a comma"');
    expect(csvOutput).toContain('2026-10-10');
  });

  it('exports applications to CSV matching format', () => {
    const apps: Application[] = [
      {
        company: 'Google',
        role: 'Software Engineer',
        url: 'https://careers.google.com',
        source: 'referral',
        status: 'applied',
        appliedDate: '2026-10-12',
        referral: true,
        referrerName: 'Alice',
        salaryLPA: 35,
        location: 'Bengaluru',
        followUpDate: '2026-10-19',
        notes: 'Referred by college senior, team match pending',
        statusHistory: [],
      },
    ];

    const csvOutput = exportApplicationsCsv(apps);
    expect(csvOutput).toContain('Google,Software Engineer');
    expect(csvOutput).toContain('"Referred by college senior, team match pending"');
    expect(csvOutput).toContain('35');
    expect(csvOutput).toContain('Alice');
  });
});
