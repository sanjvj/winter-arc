import React from 'react';
import { Mic } from 'lucide-react';

export default function MocksPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Mic className="h-4 w-4" /> Technical & Behavioral Defense
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Mock Interviews
        </h1>
        <p className="text-sm text-muted mt-1">
          DSA, System Design, LLD, and Behavioral mocks with scoring and actionable feedback.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Mic className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Mock interview logs and feedback ledger activated in Prompt 7.</p>
      </div>
    </div>
  );
}
