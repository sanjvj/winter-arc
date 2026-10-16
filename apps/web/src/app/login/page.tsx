'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Flame, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, user, isOwner } = useAuth();
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
