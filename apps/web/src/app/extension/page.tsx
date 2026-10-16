import React from 'react';
import { Chrome } from 'lucide-react';

export default function ExtensionPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Chrome className="h-4 w-4" /> Manifest V3 Companion
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Chrome Extension
        </h1>
        <p className="text-sm text-muted mt-1">
          Setup guide, unpacked build instructions, and personal API token generation.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Chrome className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">
          Personal API token generator and extension bridge activated in Prompt 8.
        </p>
      </div>
    </div>
  );
}
