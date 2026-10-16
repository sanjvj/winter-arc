import { describe, it, expect, vi } from 'vitest';
import { runScraper } from '../src/index';

describe('scraper smoke test', () => {
  it('initializes scraper without error', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => runScraper()).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
