'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-status-warn">
        <WifiOff className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-text">Connection Required</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Winter Arc Command Center communicates with live Firestore to safeguard streaks, problem logs, and job pipelines. Please restore your internet connection to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-ice px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </button>
    </div>
  );
}
