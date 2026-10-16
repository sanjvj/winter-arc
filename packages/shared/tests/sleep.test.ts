import { describe, it, expect } from 'vitest';
import { calculateSleepHours, nowTimeIST, nowHourIST } from '../src';

describe('Sleep Duration & IST Time Helpers', () => {
  it('correctly calculates sleep crossing midnight (e.g., 22:45 to 06:30)', () => {
    // 22:45 to 24:00 = 1h 15m (1.25)
    // 00:00 to 06:30 = 6h 30m (6.5)
    // Total = 7.75 hours
    const hours = calculateSleepHours('22:45', '06:30');
    expect(hours).toBe(7.75);
  });

  it('correctly calculates sleep crossing midnight (23:00 to 07:00)', () => {
    const hours = calculateSleepHours('23:00', '07:00');
    expect(hours).toBe(8);
  });

  it('correctly calculates same-day sleep (e.g. afternoon nap 13:00 to 14:30)', () => {
    const hours = calculateSleepHours('13:00', '14:30');
    expect(hours).toBe(1.5);
  });

  it('handles invalid time strings gracefully returning 0', () => {
    expect(calculateSleepHours('invalid', '06:00')).toBe(0);
    expect(calculateSleepHours('22:00', '99:99')).toBe(0);
  });

  it('formats deterministic IST nowTime and nowHour from reference date', () => {
    // 2026-10-16 14:30 UTC = 2026-10-16 20:00 IST (+5:30)
    const ref = new Date('2026-10-16T14:30:00.000Z');
    expect(nowTimeIST(ref)).toBe('20:00');
    expect(nowHourIST(ref)).toBe(20);
  });
});
