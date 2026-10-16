import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Settings className="h-4 w-4" /> Global Configurations
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Configure daily floors, targets, scraper filters, API tokens, and demo data fixtures.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Settings className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Settings panels and demo data controls activated in Prompt 7 & 9.</p>
      </div>
    </div>
  );
}
