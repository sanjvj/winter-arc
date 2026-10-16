import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  // Only available in emulator development mode
  if (process.env.NEXT_PUBLIC_USE_EMULATORS !== 'true') {
    return NextResponse.json({ error: 'Endpoint forbidden in production' }, { status: 403 });
  }

  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const uid = email.includes('owner') || email.includes('sanjay') ? 'sanjay-uid-001' : 'stranger-uid-002';
    
    // Ensure user record exists in Firebase Auth with the email property
    try {
      await adminAuth.getUser(uid);
      await adminAuth.updateUser(uid, { email });
    } catch {
      await adminAuth.createUser({ uid, email });
    }

    const token = await adminAuth.createCustomToken(uid, { email });

    // In emulator, ensure account has email populated on auth profile
    try {
      const signInRes = await fetch(
        'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=dummy-api-key',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, returnSecureToken: true }),
        },
      );
      const signInData = (await signInRes.json()) as { idToken?: string };
      if (signInData.idToken) {
        await fetch(
          'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=dummy-api-key',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: signInData.idToken, email, returnSecureToken: true }),
          },
        );
      }
    } catch (e: unknown) {
      console.warn('[dev-token] Failed to sync email in emulator:', e);
    }

    return NextResponse.json({ token, uid, email });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate token';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
