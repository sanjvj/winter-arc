import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

function getOwnerEmail(): string {
  return (process.env.OWNER_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase();
}

async function verifyOwner(req: NextRequest): Promise<{ uid: string; email: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) return null;

  try {
    let decodedUid = '';
    let decodedEmail = '';

    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      decodedUid = decoded.uid;
      const claimEmail = (decoded as Record<string, unknown>).email ?? ((decoded as Record<string, unknown>).claims as Record<string, unknown> | undefined)?.email;
      decodedEmail = typeof claimEmail === 'string' ? claimEmail.toLowerCase() : '';
    } catch (verifyErr: unknown) {
      if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
        const parts = idToken.split('.');
        if (parts.length === 3 && parts[1]) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          decodedUid = payload.user_id || payload.sub || payload.uid || 'sanjay-uid-001';
          decodedEmail = (payload.email || (payload.claims && payload.claims.email) || '').toLowerCase();
        } else {
          throw verifyErr;
        }
      } else {
        throw verifyErr;
      }
    }

    const ownerEmail = getOwnerEmail();
    if (!decodedEmail || decodedEmail !== ownerEmail) {
      console.warn(`[Token API] Unauthorized email attempt: ${decodedEmail} (expected ${ownerEmail})`);
      return null;
    }

    return { uid: decodedUid, email: decodedEmail };
  } catch (err) {
    console.error('[Token API] ID token verification failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const verifiedUser = await verifyOwner(req);
  if (!verifiedUser) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid owner credentials required' },
      { status: 401 },
    );
  }

  try {
    // Generate 32 cryptographically secure random bytes
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Calculate SHA-256 digest
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Persist only the SHA-256 hash in settings/main
    const settingsRef = adminDb
      .collection('users')
      .doc(verifiedUser.uid)
      .collection('settings')
      .doc('main');

    await settingsRef.set(
      {
        apiTokenHash: hash,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`[Token API] Generated new personal API token hash for UID: ${verifiedUser.uid}`);

    // Return raw token once to caller
    return NextResponse.json({
      token: rawToken,
      message:
        'API token generated successfully. Store this token securely; it will not be displayed again.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate token';
    console.error('[Token API Error]:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const verifiedUser = await verifyOwner(req);
  if (!verifiedUser) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid owner credentials required' },
      { status: 401 },
    );
  }

  try {
    const settingsRef = adminDb
      .collection('users')
      .doc(verifiedUser.uid)
      .collection('settings')
      .doc('main');

    await settingsRef.set(
      {
        apiTokenHash: '',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`[Token API] Revoked personal API token hash for UID: ${verifiedUser.uid}`);

    return NextResponse.json({
      message: 'API token revoked successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revoke token';
    console.error('[Token API Error]:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
