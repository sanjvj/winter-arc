'use client';

import React from 'react';
import { BentoCard } from '@/components/bento';
import { Flame, AlertTriangle, Trophy } from 'lucide-react';
import { StreakResult } from '@winter-arc/shared';

interface StreakCardProps {
  streak: StreakResult;
  loading?: boolean;
}

export function StreakCard({ streak, loading = false }: StreakCardProps) {
  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-6 xl:order-none"
      icon={<Flame className="h-4 w-4 text-status-warn" />}
      title="Floor Streak"
      action={
        streak.atRisk ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-status-warn/10 text-status-warn border border-status-warn/30 animate-pulse">
            <AlertTriangle className="h-3 w-3" /> At Risk
          </span>
        ) : streak.currentStreak > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-status-success/10 text-status-success border border-status-success/30">
            Active
          </span>
        ) : null
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-5xl md:text-6xl font-medium tracking-tight text-text">
            {streak.currentStreak}
          </span>
          <span className="font-mono text-xs text-muted uppercase tracking-wider">
            {streak.currentStreak === 1 ? 'Day Active' : 'Days Active'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-muted border-t border-border-token/50 pt-2 mt-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-accent-burgundy-glow" />
            <span>
              Best: <strong className="text-text">{streak.longestStreak}d</strong>
            </span>
          </div>
          <div>
            <span>
              Total Met: <strong className="text-status-success">{streak.totalFloorDays}d</strong>
            </span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
