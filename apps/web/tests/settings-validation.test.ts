import { describe, it, expect } from 'vitest';
import { SettingsSchema, createDefaultSettings } from '@winter-arc/shared';

describe('Settings Form Validation', () => {
  it('accepts valid default settings', () => {
    const valid = createDefaultSettings('2026-10-16');
    const result = SettingsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid plan start date formats', () => {
    const settings = {
      ...createDefaultSettings('2026-10-16'),
      planStartDate: '16/10/2026', // invalid date format
    };
    const result = SettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects negative target quotas', () => {
    const settings = {
      ...createDefaultSettings('2026-10-16'),
      targets: {
        problemsPerDay: -1, // invalid negative number
        applicationsPerDay: 5,
        mocksPerWeek: 2,
        startupHours: 4.5,
        gymHours: 2,
        sleepHours: 7,
      },
    };
    const result = SettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects invalid schedule block time format', () => {
    const settings = {
      ...createDefaultSettings('2026-10-16'),
      scheduleBlocks: [
        {
          id: 'bad-1',
          start: '25:99', // invalid hour and minute
          end: '07:00',
          label: 'Invalid Time Block',
          category: 'routine',
        },
      ],
    };
    const result = SettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });
});
