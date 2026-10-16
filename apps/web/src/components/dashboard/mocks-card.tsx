'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Mic, ArrowRight, Star } from 'lucide-react';
import { Mock } from '@winter-arc/shared';

interface MocksCardProps {
  mocks: Mock[];
  loading?: boolean;
}

export function MocksCard({ mocks = [], loading = false }: MocksCardProps) {
  if (mocks.length === 0 && !loading) {
    return (
      <BentoCard
        size="M"
        state="empty"
        className="order-12 xl:order-none"
        icon={<Mic className="h-4 w-4 text-accent-indigo" />}
        title="Mock Interviews"
        emptyMessage="No mocks recorded this week. Schedule a peer or AI technical mock."
        emptyAction={
          <Link
            href="/mocks"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Log a mock interview <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  const totalScore = mocks.reduce((sum, m) => sum + m.score, 0);
  const avgScore = (totalScore / Math.max(1, mocks.length)).toFixed(1);
  const latestMock = mocks[mocks.length - 1];

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-12 xl:order-none"
      icon={<Mic className="h-4 w-4 text-accent-indigo" />}
      title="Mock Interviews"
      action={
        <Link
          href="/mocks"
          className="text-muted hover:text-accent-ice transition-colors p-1"
          title="Open Mocks Tracker"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-text">{mocks.length}</span>
            <span className="font-mono text-xs text-muted ml-1.5">Mocks Completed</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 border border-border-token text-xs font-mono text-status-warn">
            <Star className="h-3 w-3 fill-status-warn text-status-warn" />
            <span className="font-bold">{avgScore}</span>
            <span className="text-muted">/ 5</span>
          </div>
        </div>

        <div className="border-t border-border-token/50 pt-2 text-xs font-mono">
          <span className="text-muted block text-[10px] uppercase">Latest Focus Area</span>
          <p className="truncate text-text text-[11px] font-sans mt-0.5">
            {latestMock?.weaknesses || 'Maintain structured communication.'}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
