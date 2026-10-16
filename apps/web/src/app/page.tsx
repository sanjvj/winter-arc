import React from 'react';
import { BentoGrid, BentoCard } from '@/components/bento';
import { Flame, Clock, Target, Code2, Briefcase, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ice">
            Mission Control
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text">
            Command Center
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/log"
            className="flex items-center gap-2 rounded-xl bg-accent-ice px-4 py-2 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
          >
            <Clock className="h-4 w-4" />
            Log Today (&lt;60s)
          </Link>
          <Link
            href="/design"
            className="flex items-center gap-1.5 rounded-xl border border-border-token bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-text"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-ice" />
            Design Showcase
          </Link>
        </div>
      </div>

      {/* Bento Grid Skeleton Preview */}
      <BentoGrid>
        {/* Streak Flame Card (S) */}
        <BentoCard
          size="S"
          icon={<Flame className="h-4 w-4 text-status-warn" />}
          title="Floor Streak"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-text">0</span>
            <span className="font-mono text-xs text-muted">Days Active</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Sprint Day 1 • Set pace today</p>
        </BentoCard>

        {/* Daily Floor Status (M) */}
        <BentoCard
          size="M"
          icon={<Target className="h-4 w-4 text-accent-ice" />}
          title="Daily Floor Targets"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">DSA Floor (min 2)</span>
              <span className="font-mono text-text">0 / 2</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-2">
              <div className="h-1.5 rounded-full bg-accent-ice w-0" />
            </div>
            <p className="text-[11px] text-muted">Floor not met yet: 2 more problems.</p>
          </div>
        </BentoCard>

        {/* Startup & Gym (W) */}
        <BentoCard
          size="W"
          icon={<Clock className="h-4 w-4 text-accent-indigo" />}
          title="Time Allocation (Startup & Fitness)"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-muted">Startup Target</p>
              <p className="font-display text-xl font-bold text-text">0.0 / 4.5 hrs</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Gym Fitness</p>
              <p className="font-display text-xl font-bold text-text">0.0 / 2.0 hrs</p>
            </div>
          </div>
        </BentoCard>

        {/* Due Revisions (T) */}
        <BentoCard
          size="T"
          icon={<RefreshCw className="h-4 w-4 text-status-warn" />}
          title="Due Revisions"
          emptyMessage="No pending spaced repetitions due today."
          state="empty"
        />

        {/* Active Pipeline (L) */}
        <BentoCard
          size="L"
          icon={<Briefcase className="h-4 w-4 text-accent-ice" />}
          title="Application Pipeline"
          emptyMessage="Zero active applications. Check fresh scraped roles."
          state="empty"
        />

        {/* DSA Patterns Coverage (XL) */}
        <BentoCard
          size="XL"
          icon={<Code2 className="h-4 w-4 text-accent-indigo" />}
          title="DSA Pattern Mastery Engine"
        >
          <div className="flex flex-col justify-center h-full space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Algorithmic Problem Solves</span>
              <span className="font-mono text-accent-ice">0 Solved / Target 150</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-2">
              <div className="h-2 rounded-full bg-accent-indigo w-0" />
            </div>
            <p className="text-xs text-muted">
              Prepare Two Pointers, Sliding Window, and Fast & Slow Pointers for Week 1 goals.
            </p>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
