'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Code2, ArrowRight, AlertCircle } from 'lucide-react';
import { Problem } from '@winter-arc/shared';

interface PatternCoverageCardProps {
  patternTargets: Record<string, number>;
  problems: Problem[];
  loading?: boolean;
}

export function PatternCoverageCard({
  patternTargets = {},
  problems = [],
  loading = false,
}: PatternCoverageCardProps) {
  // Tally solved problems by pattern
  const solvedCountByPattern: Record<string, number> = {};
  for (const p of problems) {
    if (p.pattern) {
      solvedCountByPattern[p.pattern] = (solvedCountByPattern[p.pattern] || 0) + 1;
    }
  }

  // Calculate stats for all patterns
  const patternsList = Object.keys(patternTargets).map((pattern) => {
    const target = patternTargets[pattern] || 1;
    const solved = solvedCountByPattern[pattern] || 0;
    const pct = Math.min(100, Math.round((solved / target) * 100));
    return {
      pattern,
      solved,
      target,
      pct,
    };
  });

  // Total solved vs total target
  const totalSolved = Object.values(solvedCountByPattern).reduce((a, b) => a + b, 0);
  const totalTarget = Object.values(patternTargets).reduce((a, b) => a + b, 0);

  // Identify weakest pattern (lowest percentage coverage)
  let weakest = patternsList.length > 0 && patternsList[0] ? patternsList[0] : null;
  for (const item of patternsList) {
    if (item && (weakest === null || item.pct < weakest.pct)) {
      weakest = item;
    }
  }

  return (
    <BentoCard
      size="XL"
      state={loading ? 'loading' : 'default'}
      className="order-10 xl:order-none"
      icon={<Code2 className="h-4 w-4 text-accent-indigo" />}
      title="DSA Pattern Coverage (168 Target)"
      action={
        <div className="flex items-center gap-2">
          {weakest && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-status-warn bg-status-warn/10 border border-status-warn/30 px-2 py-0.5 rounded-full font-bold">
              <AlertCircle className="h-3 w-3" /> Focus: {weakest.pattern} ({weakest.pct}%)
            </span>
          )}
          <Link
            href="/dsa"
            className="flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline"
          >
            DSA Tracker
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      }
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between text-xs font-mono text-muted mb-2">
          <span>
            Total Progress: <strong className="text-text font-bold">{totalSolved}</strong> /{' '}
            {totalTarget || 168} Solved
          </span>
          <span className="font-semibold text-accent-ice">
            {Math.round((totalSolved / Math.max(1, totalTarget || 168)) * 100)}% Complete
          </span>
        </div>

        {/* 18 Patterns Scrollable Bar Grid */}
        <div className="overflow-y-auto max-h-[220px] pr-2 scrollbar-thin grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {patternsList.map((item) => {
            const isWeakest = weakest?.pattern === item.pattern;
            return (
              <div
                key={item.pattern}
                className={`p-2 rounded-lg border text-xs space-y-1 transition-all ${
                  isWeakest
                    ? 'border-status-warn/50 bg-status-warn/5 ring-1 ring-status-warn/30'
                    : 'border-border-token bg-surface-2/40'
                }`}
              >
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span
                    className={`truncate font-semibold ${
                      isWeakest ? 'text-status-warn' : 'text-text'
                    }`}
                  >
                    {item.pattern}
                  </span>
                  <span className="text-muted text-[10px] shrink-0 ml-1">
                    {item.solved}/{item.target}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isWeakest
                        ? 'bg-status-warn'
                        : item.pct >= 100
                          ? 'bg-status-success'
                          : 'bg-accent-indigo'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
