import React from 'react';
import { ClipboardCheck } from 'lucide-react';

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <ClipboardCheck className="h-4 w-4" /> Weekly Retrospectives
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Weekly Review
        </h1>
        <p className="text-sm text-muted mt-1">
          Document what worked, what to adjust, and the single primary focus for next week.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <ClipboardCheck className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Weekly review module activated in Prompt 7.</p>
      </div>
    </div>
  );
}
