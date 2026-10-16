'use client';

import React from 'react';
import { BentoCard } from '@/components/bento';
import { Target, CheckCircle2 } from 'lucide-react';
import { Floor } from '@winter-arc/shared';

interface FloorRingsCardProps {
  floor: Floor;
  problems: number;
  revisions: number;
  applications: number;
  dueRevisionsAtStart: number;
  loading?: boolean;
}

export function FloorRingsCard({
  floor,
  problems,
  revisions,
  applications,
  dueRevisionsAtStart,
  loading = false,
}: FloorRingsCardProps) {
  const effectiveRevisionsFloor = dueRevisionsAtStart === 0 ? 0 : floor.revisions;

  const problemsPct = Math.min(100, Math.round((problems / Math.max(1, floor.problems)) * 100));
  const revisionsPct =
    effectiveRevisionsFloor === 0
      ? 100
      : Math.min(100, Math.round((revisions / effectiveRevisionsFloor) * 100));
  const applicationsPct = Math.min(
    100,
    Math.round((applications / Math.max(1, floor.applications)) * 100),
  );

  const allMet =
    problems >= floor.problems &&
    (dueRevisionsAtStart === 0 || revisions >= floor.revisions) &&
    applications >= floor.applications;

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-2 xl:order-none"
      icon={<Target className="h-4 w-4 text-accent-ice" />}
      title="Daily Floor Progress"
      action={
        allMet ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Met
          </span>
        ) : (
          <span className="text-[10px] font-mono text-muted">Daily Minimums</span>
        )
      }
    >
      <div className="flex flex-col justify-between h-full py-1 space-y-2">
        {/* Problems Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">DSA Solves</span>
            <span className="text-text font-semibold">
              {problems} / {floor.problems}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-ice rounded-full transition-all duration-300"
              style={{ width: `${problemsPct}%` }}
            />
          </div>
        </div>

        {/* Revisions Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">Revisions</span>
            <span className="text-text font-semibold">
              {dueRevisionsAtStart === 0
                ? '0 due (Met)'
                : `${revisions} / ${effectiveRevisionsFloor}`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-indigo rounded-full transition-all duration-300"
              style={{ width: `${revisionsPct}%` }}
            />
          </div>
        </div>

        {/* Applications Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">Applications</span>
            <span className="text-text font-semibold">
              {applications} / {floor.applications}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-success rounded-full transition-all duration-300"
              style={{ width: `${applicationsPct}%` }}
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
