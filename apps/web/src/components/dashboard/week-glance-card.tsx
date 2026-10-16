'use client';

import React from 'react';
import { BentoCard } from '@/components/bento';
import { CalendarRange } from 'lucide-react';
import { Floor, Targets } from '@winter-arc/shared';

interface WeekGlanceCardProps {
  problemsThisWeek: number;
  applicationsThisWeek: number;
  mocksThisWeek: number;
  floor: Floor;
  targets: Targets;
  loading?: boolean;
}

export function WeekGlanceCard({
  problemsThisWeek,
  applicationsThisWeek,
  mocksThisWeek,
  floor,
  targets,
  loading = false,
}: WeekGlanceCardProps) {
  const weeklyProblemsTarget = floor.problems * 7;
  const weeklyApplicationsTarget = floor.applications * 7;
  const weeklyMocksTarget = targets.mocksPerWeek;

  const probPct = Math.min(
    100,
    Math.round((problemsThisWeek / Math.max(1, weeklyProblemsTarget)) * 100),
  );
  const appPct = Math.min(
    100,
    Math.round((applicationsThisWeek / Math.max(1, weeklyApplicationsTarget)) * 100),
  );
  const mockPct = Math.min(100, Math.round((mocksThisWeek / Math.max(1, weeklyMocksTarget)) * 100));

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-8 xl:order-none"
      icon={<CalendarRange className="h-4 w-4 text-accent-ice" />}
      title="Week at a Glance"
      action={<span className="text-[10px] font-mono text-muted">Weekly Targets</span>}
    >
      <div className="flex flex-col justify-between h-full py-1 space-y-2">
        {/* Problems */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">DSA Solves</span>
            <span className="text-text font-semibold">
              {problemsThisWeek} / {weeklyProblemsTarget}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-ice rounded-full transition-all duration-300"
              style={{ width: `${probPct}%` }}
            />
          </div>
        </div>

        {/* Applications */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">Applications</span>
            <span className="text-text font-semibold">
              {applicationsThisWeek} / {weeklyApplicationsTarget}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-success rounded-full transition-all duration-300"
              style={{ width: `${appPct}%` }}
            />
          </div>
        </div>

        {/* Mocks */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">Mock Practice</span>
            <span className="text-text font-semibold">
              {mocksThisWeek} / {weeklyMocksTarget}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-indigo rounded-full transition-all duration-300"
              style={{ width: `${mockPct}%` }}
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
