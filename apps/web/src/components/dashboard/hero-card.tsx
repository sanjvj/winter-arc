'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { FloorEvaluationResult } from '@winter-arc/shared';

interface HeroCardProps {
  ownerName: string;
  planDay: number;
  planLengthDays: number;
  currentHourIST: number;
  floorEvaluation: FloorEvaluationResult;
  problemsCount: number;
  revisionsCount: number;
  applicationsCount: number;
  floorProblems: number;
  floorRevisions: number;
  floorApplications: number;
  loading?: boolean;
}

export function HeroCard({
  ownerName,
  planDay,
  planLengthDays,
  currentHourIST,
  floorEvaluation,
  problemsCount,
  revisionsCount,
  applicationsCount,
  floorProblems,
  floorRevisions,
  floorApplications,
  loading = false,
}: HeroCardProps) {
  const getGreeting = () => {
    if (currentHourIST < 12) return 'Good morning';
    if (currentHourIST < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const progressPercent = Math.min(100, Math.max(1, Math.round((planDay / planLengthDays) * 100)));

  return (
    <BentoCard
      size="H"
      state={loading ? 'loading' : 'default'}
      className="order-1 xl:order-none bg-gradient-to-r from-surface via-surface to-surface-2"
      icon={<Sparkles className="h-4 w-4 text-accent-burgundy-glow" />}
      title="Winter Arc Command Center"
      action={
        <Link
          href="/log"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-burgundy text-white font-mono text-xs font-bold hover:bg-accent-burgundy-glow transition-all active:scale-95 shadow-burgundy"
        >
          <Clock className="h-3 w-3" />
          Close the Day
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white">
            {getGreeting()}, {ownerName || 'Sanjay'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs font-semibold text-accent-burgundy-glow">
              Day {planDay} of {planLengthDays}
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="font-mono text-xs text-muted">{progressPercent}% Journey Elapsed</span>
          </div>
        </div>

        {/* Progress Bar & Floor Summary */}
        <div className="space-y-2 mt-3">
          <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden border border-border-token/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-burgundy to-accent-burgundy-glow transition-all duration-500 shadow-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
            <span className="text-muted">
              Floor:{' '}
              <strong className="text-text">
                {problemsCount}/{floorProblems}
              </strong>{' '}
              problems,{' '}
              <strong className="text-text">
                {revisionsCount}/{floorRevisions}
              </strong>{' '}
              revisions,{' '}
              <strong className="text-text">
                {applicationsCount}/{floorApplications}
              </strong>{' '}
              applications
            </span>

            {floorEvaluation.floorMet ? (
              <span className="inline-flex items-center gap-1 text-status-success font-semibold text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Minimum Floor Secured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-status-warn font-semibold text-[11px]">
                Floor In Progress: {floorEvaluation.missing[0] || 'Tasks pending'}
              </span>
            )}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
