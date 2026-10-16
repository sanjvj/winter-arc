'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Flame, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithToken, user, isOwner } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If already authenticated and is owner, redirect to dashboard
  React.useEffect(() => {
    if (user && isOwner) {
      router.push('/');
    }
  }, [user, isOwner, router]);

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate with Google';
      setError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmulatorSignIn = async (email: string) => {
    try {
      setError(null);
      setIsSigningIn(true);
      const res = await fetch('/api/dev-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dev token');
      await signInWithToken(data.token, email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with emulator';
      setError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md rounded-bento border border-border-token bg-surface p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-ice/10 text-accent-ice">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Personal System
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-text">
              Winter Arc Command Center
            </h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          Single-tenant command dashboard for the 90-day SDE-1 execution sprint. Authorized access
          only.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-status-danger/20 bg-status-danger/10 p-3 text-xs text-status-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent-ice px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
          </button>

          {isEmulator && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border-token">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Emulator Test Logins
              </span>
              <button
                id="test-signin-owner"
                type="button"
                onClick={() => handleEmulatorSignIn('sanjay@winterarc.local')}
                disabled={isSigningIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-ice/30 bg-accent-ice/10 px-4 py-2.5 text-xs font-medium text-accent-ice hover:bg-accent-ice/20 disabled:opacity-50"
              >
                Sign In as Owner (sanjay@winterarc.local)
              </button>
              <button
                id="test-signin-stranger"
                type="button"
                onClick={() => handleEmulatorSignIn('stranger@example.com')}
                disabled={isSigningIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-status-danger/30 bg-status-danger/10 px-4 py-2.5 text-xs font-medium text-status-danger hover:bg-status-danger/20 disabled:opacity-50"
              >
                Sign In as Stranger (stranger@example.com)
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-border-token pt-4 text-center">
          <p className="font-mono text-xs text-muted">
            Strict Auth • Asia/Kolkata Calendar • Private Tenant
          </p>
        </div>
      </div>
    </main>
  );
}
