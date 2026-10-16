import { describe, it, expect } from 'vitest';
import {
  createDefaultSettings,
  createDefaultRoadmap,
  DEFAULT_SCHEDULE_BLOCKS,
  DEFAULT_PATTERN_TARGETS,
} from '../src/seeds';
import { SettingsSchema, RoadmapSchema } from '../src/schemas';

describe('Seed Data Integrity', () => {
  it('conforms to SettingsSchema with no validation errors', () => {
    const defaultSettings = createDefaultSettings('2026-10-01');
    const parsed = SettingsSchema.parse(defaultSettings);

    expect(parsed.planStartDate).toBe('2026-10-01');
    expect(parsed.planLengthDays).toBe(90);
    expect(parsed.floor.problems).toBe(2);
    expect(parsed.floor.revisions).toBe(1);
    expect(parsed.floor.applications).toBe(5);
  });

  it('contains exactly 13 schedule blocks covering routine to sleep', () => {
    expect(DEFAULT_SCHEDULE_BLOCKS.length).toBe(13);
    expect(DEFAULT_SCHEDULE_BLOCKS[0]?.start).toBe('06:00');
    expect(DEFAULT_SCHEDULE_BLOCKS[12]?.start).toBe('22:45');
  });

  it('contains 18 pattern targets that sum to exactly 168 problems', () => {
    const patterns = Object.keys(DEFAULT_PATTERN_TARGETS);
    expect(patterns.length).toBe(18);

    const totalTarget = Object.values(DEFAULT_PATTERN_TARGETS).reduce((acc, val) => acc + val, 0);
    expect(totalTarget).toBe(168);
  });

  it('conforms to RoadmapSchema and contains exactly 12 weeks with 3-5 goals each', () => {
    const roadmap = createDefaultRoadmap();
    const parsed = RoadmapSchema.parse(roadmap);

    expect(parsed.weeks.length).toBe(12);
    for (const week of parsed.weeks) {
      expect(week.goals.length).toBeGreaterThanOrEqual(3);
      expect(week.goals.length).toBeLessThanOrEqual(5);
    }
    expect(parsed.topics.length).toBe(36);
  });
});
