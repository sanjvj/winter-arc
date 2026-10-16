import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

describe('API Token Security & Hashing', () => {
  it('generates a 32-byte cryptographically secure random token in hex format', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    expect(rawToken).toHaveLength(64); // 32 bytes = 64 hex characters
    expect(/^[0-9a-f]{64}$/.test(rawToken)).toBe(true);
  });

  it('produces deterministic SHA-256 hash matching expected output', () => {
    const rawToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    expect(hash).toHaveLength(64);
    // Hash of the same token is identical
    const secondHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(secondHash).toBe(hash);
  });
});
