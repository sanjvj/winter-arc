import { describe, it, expect } from 'vitest';
import { isIndiaOrRemote, isEntryLevel } from '../src/job-filter';

describe('isIndiaOrRemote', () => {
  it('accepts Indian tech hub cities and country names', () => {
    expect(isIndiaOrRemote('Bengaluru, India')).toBe(true);
    expect(isIndiaOrRemote('Bangalore')).toBe(true);
    expect(isIndiaOrRemote('Hyderabad')).toBe(true);
    expect(isIndiaOrRemote('Pune, Maharashtra')).toBe(true);
    expect(isIndiaOrRemote('Mumbai')).toBe(true);
    expect(isIndiaOrRemote('Gurugram / Gurgaon')).toBe(true);
    expect(isIndiaOrRemote('Noida')).toBe(true);
    expect(isIndiaOrRemote('Chennai, Tamil Nadu')).toBe(true);
    expect(isIndiaOrRemote('Delhi NCR')).toBe(true);
    expect(isIndiaOrRemote('Remote - India')).toBe(true);
  });

  it('accepts generic remote and worldwide locations', () => {
    expect(isIndiaOrRemote('Remote')).toBe(true);
    expect(isIndiaOrRemote('Remote / Anywhere')).toBe(true);
    expect(isIndiaOrRemote('Worldwide')).toBe(true);
    expect(isIndiaOrRemote('Global Remote')).toBe(true);
    expect(isIndiaOrRemote('Work From Home')).toBe(true);
    expect(isIndiaOrRemote('')).toBe(true);
  });

  it('rejects foreign physical locations and foreign restricted home-based roles', () => {
    expect(isIndiaOrRemote('Home Based - Shenzhen, China')).toBe(false);
    expect(isIndiaOrRemote('Shenzhen, China')).toBe(false);
    expect(isIndiaOrRemote('London, United Kingdom')).toBe(false);
    expect(isIndiaOrRemote('Home Based - London, UK')).toBe(false);
    expect(isIndiaOrRemote('San Francisco, USA')).toBe(false);
    expect(isIndiaOrRemote('Remote - US Only')).toBe(false);
    expect(isIndiaOrRemote('Remote - Americas')).toBe(false);
    expect(isIndiaOrRemote('Berlin, Germany')).toBe(false);
    expect(isIndiaOrRemote('Tokyo, Japan')).toBe(false);
    expect(isIndiaOrRemote('Sydney, Australia')).toBe(false);
    expect(isIndiaOrRemote('Singapore')).toBe(false);
  });
});

describe('isEntryLevel', () => {
  it('accepts entry-level, junior, intern, and SDE-1 roles', () => {
    expect(isEntryLevel('Software Engineer')).toBe(true);
    expect(isEntryLevel('SDE 1')).toBe(true);
    expect(isEntryLevel('SDE-1')).toBe(true);
    expect(isEntryLevel('Software Development Engineer Intern')).toBe(true);
    expect(isEntryLevel('Graduate Software Engineer')).toBe(true);
    expect(isEntryLevel('Junior Frontend Developer')).toBe(true);
    expect(isEntryLevel('Associate Software Engineer')).toBe(true);
    expect(isEntryLevel('Software Engineer', 'Looking for 0-1 years of experience in React')).toBe(true);
    expect(isEntryLevel('Frontend Engineer', 'Freshers welcome or up to 1 year of experience')).toBe(true);
  });

  it('rejects mid-level, level 2, senior, lead, staff, or multi-year requirements', () => {
    expect(isEntryLevel('Software Engineer II')).toBe(false);
    expect(isEntryLevel('SDE 2')).toBe(false);
    expect(isEntryLevel('SDE-2')).toBe(false);
    expect(isEntryLevel('DevOps Engineer II')).toBe(false);
    expect(isEntryLevel('Senior Backend Engineer')).toBe(false);
    expect(isEntryLevel('Lead Data Engineer')).toBe(false);
    expect(isEntryLevel('Staff Engineer')).toBe(false);
    expect(isEntryLevel('Engineering Manager')).toBe(false);
    expect(isEntryLevel('Sales Engineer')).toBe(false);
    expect(isEntryLevel('Software Engineer', 'Requires minimum 3 years of experience')).toBe(false);
    expect(isEntryLevel('Software Engineer', 'Looking for 2-4 years of experience in Node.js')).toBe(false);
    expect(isEntryLevel('Fullstack Developer', 'At least 2+ years of experience with PostgreSQL')).toBe(false);
    expect(isEntryLevel('Software Engineer', undefined, 3)).toBe(false);
  });
});

