import { describe, it, expect } from 'vitest';
import { parseProblemUrl, slugToTitle } from '../src';

describe('Problem URL Parser & Platform Auto-Detection', () => {
  it('correctly converts slugs to Title Case', () => {
    expect(slugToTitle('two-sum')).toBe('Two Sum');
    expect(slugToTitle('trapping-rain-water')).toBe('Trapping Rain Water');
    expect(slugToTitle('longest-substring-without-repeating-characters')).toBe(
      'Longest Substring Without Repeating Characters',
    );
    expect(slugToTitle('lru-cache')).toBe('Lru Cache');
    expect(slugToTitle('course-schedule-ii')).toBe('Course Schedule II');
    // GFG timestamp stripped
    expect(slugToTitle('subarray-with-given-sum-1587115621')).toBe('Subarray With Given Sum');
  });

  it('parses LeetCode problem URLs', () => {
    const res1 = parseProblemUrl('https://leetcode.com/problems/two-sum/');
    expect(res1.platform).toBe('leetcode');
    expect(res1.title).toBe('Two Sum');
    expect(res1.slug).toBe('two-sum');
    expect(res1.canonicalUrl).toBe('https://leetcode.com/problems/two-sum/');

    const res2 = parseProblemUrl(
      'https://leetcode.com/problems/trapping-rain-water/description/?envType=study-plan-v2',
    );
    expect(res2.platform).toBe('leetcode');
    expect(res2.title).toBe('Trapping Rain Water');
    expect(res2.slug).toBe('trapping-rain-water');
    expect(res2.canonicalUrl).toBe('https://leetcode.com/problems/trapping-rain-water/');
  });

  it('parses Codeforces problemset and contest URLs', () => {
    const res1 = parseProblemUrl('https://codeforces.com/problemset/problem/4/A');
    expect(res1.platform).toBe('codeforces');
    expect(res1.title).toBe('CF 4A');

    const res2 = parseProblemUrl('https://codeforces.com/contest/1234/problem/B');
    expect(res2.platform).toBe('codeforces');
    expect(res2.title).toBe('CF 1234B');
  });

  it('parses HackerRank challenge URLs', () => {
    const res = parseProblemUrl('https://www.hackerrank.com/challenges/simple-array-sum/problem');
    expect(res.platform).toBe('hackerrank');
    expect(res.title).toBe('Simple Array Sum');
    expect(res.slug).toBe('simple-array-sum');
  });

  it('parses GeeksforGeeks problem URLs', () => {
    const res = parseProblemUrl(
      'https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1?page=1',
    );
    expect(res.platform).toBe('gfg');
    expect(res.title).toBe('Subarray With Given Sum');
  });

  it('handles unknown or empty URLs gracefully', () => {
    const res1 = parseProblemUrl('');
    expect(res1.platform).toBe('other');
    expect(res1.title).toBe('');

    const res2 = parseProblemUrl('https://myblog.com/problems/reverse-linked-list');
    expect(res2.platform).toBe('other');
    expect(res2.title).toBe('Reverse Linked List');
  });
});
