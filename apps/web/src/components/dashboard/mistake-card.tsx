'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Mistake } from '@winter-arc/shared';

interface MistakeCardProps {
  mistakes: Mistake[];
  loading?: boolean;
}

export function MistakeCard({ mistakes = [], loading = false }: MistakeCardProps) {
  // Select one unreviewed or most recent mistake
  const featuredMistake = useMemo(() => {
    if (mistakes.length === 0) return null;
    const unreviewed = mistakes.filter((m) => !m.reviewedWeeks || m.reviewedWeeks.length === 0);
    if (unreviewed.length > 0) {
      return unreviewed[Math.floor(Math.random() * unreviewed.length)];
    }
    return mistakes[mistakes.length - 1];
  }, [mistakes]);

  if (!featuredMistake && !loading) {
    return (
      <BentoCard
        size="M"
        state="empty"
        className="order-14 xl:order-none"
        icon={<AlertTriangle className="h-4 w-4 text-status-warn" />}
        title="Mistake to Review"
        emptyMessage="Zero mistakes logged yet. Record anti-patterns and failed attempts in your notebook."
        emptyAction={
          <Link
            href="/mistakes"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Open Mistakes Log <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-14 xl:order-none"
      icon={<AlertTriangle className="h-4 w-4 text-status-warn" />}
      title="Anti-Pattern Focus"
      action={
        <Link
          href="/mistakes"
          className="text-muted hover:text-accent-ice transition-colors p-1"
          title="Open Mistakes Log"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span>Date: {featuredMistake?.date}</span>
            {featuredMistake?.pattern && (
              <span className="text-status-warn font-semibold">{featuredMistake.pattern}</span>
            )}
          </div>
          <p className="text-xs text-text/90 font-medium line-clamp-3 leading-relaxed">
            &ldquo;{featuredMistake?.text}&rdquo;
          </p>
        </div>

        <div className="border-t border-border-token/50 pt-1.5 text-[10px] font-mono text-muted flex items-center justify-between">
          <span>Unreviewed Anti-Pattern</span>
          <span className="text-accent-ice hover:underline">Reinforce in Review →</span>
        </div>
      </div>
    </BentoCard>
  );
}
