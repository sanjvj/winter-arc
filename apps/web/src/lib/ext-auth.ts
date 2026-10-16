import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as crypto from 'crypto';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_REQUESTS_PER_MINUTE = 60;
const WINDOW_MS = 60 * 1000;

export async function verifyExtToken(req: NextRequest): Promise<{
  success: boolean;
  uid?: string;
  status?: number;
  error?: string;
}> {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-token');
  let rawToken = '';

  if (authHeader?.startsWith('Bearer ')) {
    rawToken = authHeader.slice(7).trim();
  } else if (authHeader) {
    rawToken = authHeader.trim();
  }

  if (!rawToken || rawToken.length < 32) {
    return { success: false, status: 401, error: 'Unauthorized: Missing or invalid API token' };
  }

  // Calculate SHA-256 of incoming token
  const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Rate Limiting per token hash
  const now = Date.now();
  let rateRecord = rateLimitMap.get(incomingHash);
  if (!rateRecord || now > rateRecord.resetAt) {
    rateRecord = { count: 1, resetAt: now + WINDOW_MS };
    rateLimitMap.set(incomingHash, rateRecord);
  } else {
    rateRecord.count += 1;
    if (rateRecord.count > MAX_REQUESTS_PER_MINUTE) {
      return {
        success: false,
        status: 429,
        error: 'Too Many Requests: Rate limit exceeded (60 req/min)',
      };
    }
  }

  try {
    // Find matching user by settings/main.apiTokenHash
    const settingsGroupSnap = await adminDb
      .collectionGroup('settings')
      .where('apiTokenHash', '==', incomingHash)
      .limit(1)
      .get();

    if (settingsGroupSnap.empty) {
      return { success: false, status: 401, error: 'Unauthorized: Invalid or revoked API token' };
    }

    const doc = settingsGroupSnap.docs[0];
    if (!doc) {
      return { success: false, status: 401, error: 'Unauthorized: Invalid token record' };
    }
    const parentUser = doc.ref.parent.parent;
    if (!parentUser) {
      return { success: false, status: 401, error: 'Unauthorized: Invalid user association' };
    }

    return { success: true, uid: parentUser.id };
  } catch (err: unknown) {
    console.error('[ExtAuth] Token verification failed:', err);
    return { success: false, status: 500, error: 'Internal Server Error' };
  }
}
