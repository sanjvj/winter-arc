import { describe, it, expect, vi } from 'vitest';
import { initExtension } from '../src/index';

describe('extension smoke test', () => {
  it('initializes extension without error', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => initExtension()).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
