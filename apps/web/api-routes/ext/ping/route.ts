import { NextRequest, NextResponse } from 'next/server';
import { verifyExtToken } from '@/lib/ext-auth';

export async function GET(req: NextRequest) {
  const auth = await verifyExtToken(req);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  return NextResponse.json({
    ok: true,
    uid: auth.uid,
    timestamp: new Date().toISOString(),
    service: 'Winter Arc Extension Bridge',
  });
}
