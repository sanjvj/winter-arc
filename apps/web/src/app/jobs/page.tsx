import React from 'react';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Briefcase className="h-4 w-4" /> 06:00 IST Scraper Feed
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Job Feed
        </h1>
        <p className="text-sm text-muted mt-1">
          Curated SDE-1 / fresher openings normalized with LPA salaries and keyword rankings.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Briefcase className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Scraped job feed will be ingested and displayed in Prompt 6 & 7.</p>
      </div>
    </div>
  );
}
