import { describe, it, expect } from 'vitest';
import { isIndiaOrRemote } from '../src/job-filter';

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
