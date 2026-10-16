import React from 'react';
import { Columns3 } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
          <Columns3 className="h-4 w-4" /> Application Funnel
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
          Pipeline Kanban
        </h1>
        <p className="text-sm text-muted mt-1">
          Drag-and-drop tracker across saved, applied, OA, interview, and offer stages.
        </p>
      </div>

      <div className="rounded-bento border border-border-token bg-surface p-8 text-center text-muted">
        <Columns3 className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm">Interactive @dnd-kit Kanban pipeline activated in Prompt 7.</p>
      </div>
    </div>
  );
}
