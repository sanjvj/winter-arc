import { NextRequest, NextResponse } from 'next/server';
import { verifyExtToken } from '@/lib/ext-auth';
import { adminDb } from '@/lib/firebase/admin';
import { todayIST } from '@winter-arc/shared';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const AppliedPayloadSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  url: z.string().url().or(z.literal('')),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await verifyExtToken(req);
  if (!auth.success || !auth.uid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = AppliedPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const today = todayIST();
    const appDoc = {
      company: parsed.data.company,
      role: parsed.data.role,
      url: parsed.data.url,
      source: 'extension',
      status: 'applied',
      appliedDate: today,
      referral: false,
      location: '',
      notes: parsed.data.notes || 'Logged via Winter Arc Chrome Extension',
      statusHistory: [{ status: 'applied', date: today }],
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('applications')
      .add(appDoc);

    return NextResponse.json({
      success: true,
      applicationId: docRef.id,
      message: `Successfully logged application for ${parsed.data.company}`,
    });
  } catch (err: unknown) {
    console.error('[ExtApplied Error]:', err);
    return NextResponse.json({ error: 'Failed to record application' }, { status: 500 });
  }
}
