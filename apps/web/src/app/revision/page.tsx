import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function RevisionPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <RefreshCw className="h-4 w-4" /> Spaced Repetition Engine
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Revision Queue
        </h1>
        <p className="text-sm text-muted mt-1">
          Interval progression [1, 3, 7, 14, 30 days] with zero penalty for overdue items.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <RefreshCw className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Spaced repetition review deck activated in Prompt 7.</p>
      </div>
    </div>
  );
}
