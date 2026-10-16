'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isOwner, ownerEmail, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    // If on /login or /design, don't redirect away
    if (pathname === '/login' || pathname === '/design') {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email && !isOwner) {
      const email = user.email;
      setDeniedEmail(email);
      // Spec: signed-in users whose email is not NEXT_PUBLIC_OWNER_EMAIL are signed out and see "Access denied"
      void signOut();
    }
  }, [user, loading, isOwner, pathname, router, signOut]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-ice" />
          <p className="font-display text-sm tracking-wide text-muted">
            AUTHENTICATING COMMAND CENTER...
          </p>
        </div>
      </div>
    );
  }

  // Show Access Denied if email was unauthorized
  if (deniedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md rounded-bento border border-border-token bg-surface p-8 shadow-2xl">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-status-danger/10 text-status-danger">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text">
            Access Denied
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The account <span className="font-mono text-text">{deniedEmail}</span> is not
            authorized. This private command center is restricted strictly to the designated system
            owner.
          </p>
          <div className="mt-4 rounded-xl border border-border-token bg-surface-2 p-3 text-xs text-muted">
            Required owner account:{' '}
            <span className="font-mono text-accent-ice">{ownerEmail || 'Not configured'}</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                setDeniedEmail(null);
                router.push('/login');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-ice px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              <LogOut className="h-4 w-4" />
              Sign In With Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in and not on a public path
  if (!user && pathname !== '/login' && pathname !== '/design') {
    return null;
  }

  return <>{children}</>;
}
