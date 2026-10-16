import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MistakesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4" /> Anti-Patterns & Insights
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Mistakes Journal
        </h1>
        <p className="text-sm text-muted mt-1">
          Document mental pitfalls, off-by-one errors, and architectural misunderstandings.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <AlertTriangle className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Mistakes journal activated in Prompt 7.</p>
      </div>
    </div>
  );
}
