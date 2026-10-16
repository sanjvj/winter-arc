import { describe, it, expect } from 'vitest';
import { scoreAndFilterJob, parseSalaryLPA, extractTags, generateJobId } from '../src/filter';
import { SourceConfigSchema } from '../src/types';

describe('Scraper Filter & Scoring Engine', () => {
  it('discards senior and executive roles', () => {
    const raw = {
      id: '1',
      title: 'Senior Software Engineering Manager',
      company: 'Acme Corp',
      location: 'Bengaluru',
      url: 'https://example.com/job/1',
      source: 'greenhouse',
      description: 'Lead large engineering teams',
      postedDate: new Date().toISOString().slice(0, 10),
    };

    expect(scoreAndFilterJob(raw)).toBeNull();
  });

  it('discards non-tech roles', () => {
    const raw = {
      id: '2',
      title: 'Talent Acquisition Recruiter',
      company: 'Acme Corp',
      location: 'Remote',
      url: 'https://example.com/job/2',
      source: 'lever',
      description: 'Source tech candidates',
      postedDate: new Date().toISOString().slice(0, 10),
    };

    expect(scoreAndFilterJob(raw)).toBeNull();
  });

  it('keeps and scores junior / fresher SDE roles', () => {
    const today = new Date().toISOString().slice(0, 10);
    const raw = {
      id: '3',
      title: 'Junior Software Engineer (Full Stack)',
      company: 'Razorpay',
      location: 'Bengaluru, India',
      url: 'https://example.com/job/3',
      source: 'greenhouse',
      description: 'Looking for a passionate engineer with TypeScript, React, and Node.js skills.',
      postedDate: today,
      salaryRaw: '18-22 LPA',
    };

    const scored = scoreAndFilterJob(raw);
    expect(scored).not.toBeNull();
    expect(scored?.company).toBe('Razorpay');
    expect(scored?.salaryLPA).toBe(20);
    expect(scored?.tags).toContain('TypeScript');
    expect(scored?.tags).toContain('React');
    expect(scored?.tags).toContain('Node.js');
    expect(scored?.status).toBe('new');
    expect(scored?.score).toBeGreaterThan(15);
  });

  it('parses LPA salaries correctly', () => {
    expect(parseSalaryLPA('18 LPA')).toEqual({ salaryLPA: 18, salaryEstimated: false });
    expect(parseSalaryLPA('15-25 Lac')).toEqual({ salaryLPA: 20, salaryEstimated: false });
    expect(parseSalaryLPA('$100,000')).toEqual({ salaryLPA: 84, salaryEstimated: true });
    expect(parseSalaryLPA('')).toEqual({ salaryEstimated: false });
  });

  it('generates deterministic job IDs', () => {
    const id1 = generateJobId('Razorpay', 'SDE 1', 'https://careers.razorpay.com/job/1');
    const id2 = generateJobId('razorpay ', 'sde 1', 'https://careers.razorpay.com/job/1');
    expect(id1).toBe(id2);
  });

  it('validates source configuration schema', () => {
    const valid = SourceConfigSchema.safeParse({
      type: 'greenhouse',
      name: 'Razorpay',
      token: 'razorpaysoftwareprivatelimited',
      enabled: true,
    });
    expect(valid.success).toBe(true);

    const invalid = SourceConfigSchema.safeParse({
      type: 'unknown_type',
      name: 'Bad',
    });
    expect(invalid.success).toBe(false);
  });
});
