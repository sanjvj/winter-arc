'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { RotateCcw, ArrowRight } from 'lucide-react';

interface RevisionsDueCardProps {
  dueCount: number;
  loading?: boolean;
}

export function RevisionsDueCard({ dueCount, loading = false }: RevisionsDueCardProps) {
  if (dueCount === 0 && !loading) {
    return (
      <BentoCard
        size="M"
        state="empty"
        className="order-4 xl:order-none"
        icon={<RotateCcw className="h-4 w-4 text-accent-indigo" />}
        title="Spaced Revision"
        emptyMessage="Queue is clean! Zero algorithmic problems due for revision today."
        emptyAction={
          <Link
            href="/dsa"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Solve new problems in DSA Tracker <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-4 xl:order-none"
      icon={<RotateCcw className="h-4 w-4 text-accent-burgundy-glow" />}
      title="Spaced Revision"
      action={
        <Link
          href="/revision"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-burgundy text-white font-mono text-xs font-semibold hover:bg-accent-burgundy-glow transition-colors shadow-burgundy"
        >
          Start
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tracking-tight text-white">
            {dueCount}
          </span>
          <span className="font-mono text-xs text-muted">
            {dueCount === 1 ? 'Problem Due Today' : 'Problems Due Today'}
          </span>
        </div>
        <p className="text-[11px] text-muted font-sans mt-1">
          Review intervals: 1d, 3d, 7d, 14d, 30d. Keep retrieval pathways active.
        </p>
      </div>
    </BentoCard>
  );
}
