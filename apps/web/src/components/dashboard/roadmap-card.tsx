'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Map, ArrowRight } from 'lucide-react';
import { Roadmap } from '@winter-arc/shared';

interface RoadmapCardProps {
  roadmap: Roadmap | null;
  planDay: number;
  loading?: boolean;
}

export function RoadmapCard({ roadmap, planDay, loading = false }: RoadmapCardProps) {
  const currentWeekNumber = Math.min(12, Math.max(1, Math.ceil(planDay / 7)));
  const currentWeek = roadmap?.weeks?.find((w) => w.n === currentWeekNumber);

  if (!currentWeek && !loading) {
    return (
      <BentoCard
        size="M"
        state="empty"
        className="order-13 xl:order-none"
        icon={<Map className="h-4 w-4 text-accent-ice" />}
        title="Roadmap Syllabus"
        emptyMessage="Roadmap data pending. Initialize default roadmap in settings."
        emptyAction={
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Open Roadmap <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  const goals = currentWeek?.goals || [];
  const completedGoals = goals.filter((g) => g.done).length;
  const progressPct = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-13 xl:order-none"
      icon={<Map className="h-4 w-4 text-accent-ice" />}
      title="Roadmap Milestone"
      action={
        <Link
          href="/roadmap"
          className="text-muted hover:text-accent-ice transition-colors p-1"
          title="Open Full Roadmap"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-accent-ice">Week {currentWeekNumber} of 12</span>
            <span className="text-muted">
              {completedGoals} / {goals.length} Goals
            </span>
          </div>

          <p className="text-xs font-medium text-text mt-1 line-clamp-2">
            {currentWeek?.theme || 'Foundation Phase'}
          </p>
        </div>

        <div className="space-y-1 mt-2">
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-ice rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-muted">
            <span>Syllabus Target</span>
            <span>{progressPct}% Completed</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
