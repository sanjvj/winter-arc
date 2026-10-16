import { describe, it, expect } from 'vitest';
import { analyzeImportData, ExportDataPayload } from '../src/lib/data/export-import';

describe('Data Export and Import Analyzer', () => {
  it('analyzes valid backup payload with dry-run counts', () => {
    const samplePayload: ExportDataPayload = {
      version: 1,
      exportedAt: '2026-10-16T12:00:00Z',
      uid: 'user-123',
      settings: { planLengthDays: 90 },
      roadmap: { weeks: [] },
      problems: [
        { id: 'p1', title: 'Two Sum' },
        { id: 'p2', title: 'Valid Anagram' },
      ],
      applications: [{ id: 'a1', company: 'Google' }],
    };

    const result = analyzeImportData(JSON.stringify(samplePayload));
    expect(result.summary.valid).toBe(true);
    expect(result.summary.hasSettings).toBe(true);
    expect(result.summary.hasRoadmap).toBe(true);
    expect(result.summary.counts.problems).toBe(2);
    expect(result.summary.counts.applications).toBe(1);
    expect(result.summary.counts.mocks).toBe(0);
  });

  it('rejects malformed non-JSON strings gracefully', () => {
    const result = analyzeImportData('{ not valid json');
    expect(result.summary.valid).toBe(false);
    expect(result.summary.error).toBeDefined();
    expect(result.parsedData).toBeNull();
  });

  it('handles null or primitive JSON data gracefully', () => {
    const result = analyzeImportData('null');
    expect(result.summary.valid).toBe(false);
  });
});
