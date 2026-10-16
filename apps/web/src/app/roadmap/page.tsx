import React from 'react';
import { Map } from 'lucide-react';

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Map className="h-4 w-4" /> 90-Day Execution Trajectory
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Syllabus Roadmap
        </h1>
        <p className="text-sm text-muted mt-1">
          Weekly milestones, topic checklists, and core algorithmic themes.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Map className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Structured 90-day roadmap syllabus activated in Prompt 7.</p>
      </div>
    </div>
  );
}
