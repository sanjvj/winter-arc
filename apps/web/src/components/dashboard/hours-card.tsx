'use client';

import React from 'react';
import { BentoCard } from '@/components/bento';
import { Clock, Laptop, Dumbbell } from 'lucide-react';
import { Targets } from '@winter-arc/shared';

interface HoursCardProps {
  startupHours: number;
  gymHours: number;
  gymDone: boolean;
  targets: Targets;
  loading?: boolean;
}

export function HoursCard({
  startupHours,
  gymHours,
  gymDone,
  targets,
  loading = false,
}: HoursCardProps) {
  const startupPct = Math.min(
    100,
    Math.round((startupHours / Math.max(0.1, targets.startupHours)) * 100),
  );
  const gymPct = Math.min(100, Math.round((gymHours / Math.max(0.1, targets.gymHours)) * 100));

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-7 xl:order-none"
      icon={<Clock className="h-4 w-4 text-accent-indigo" />}
      title="Hours Allocation"
      action={<span className="text-[10px] font-mono text-muted">vs Daily Targets</span>}
    >
      <div className="flex flex-col justify-between h-full py-1 space-y-3">
        {/* Startup Hours */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-muted">
              <Laptop className="h-3 w-3 text-accent-ice" /> Startup
            </span>
            <span className="text-text font-semibold">
              {startupHours} / {targets.startupHours}h
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-ice rounded-full transition-all duration-300"
              style={{ width: `${startupPct}%` }}
            />
          </div>
        </div>

        {/* Gym Workout */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-muted">
              <Dumbbell className="h-3 w-3 text-status-success" /> Gym Fitness
            </span>
            <span className="text-text font-semibold">
              {gymDone ? `${gymHours} / ${targets.gymHours}h` : 'Rest Day'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                gymDone ? 'bg-status-success' : 'bg-muted/40'
              }`}
              style={{ width: `${gymDone ? gymPct : 0}%` }}
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
