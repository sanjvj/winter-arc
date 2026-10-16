'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Problem, calculatePatternCoverage } from '@winter-arc/shared';

interface PatternCoverageSectionProps {
  problems: Problem[];
  patternTargets: Record<string, number>;
  onSelectPatternFilter?: (pattern: string) => void;
}

export function PatternCoverageSection({
  problems,
  patternTargets,
  onSelectPatternFilter,
}: PatternCoverageSectionProps) {
  const coverage = calculatePatternCoverage(problems, patternTargets);

  return (
    <div className="space-y-6">
      {/* Overview KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Solved vs Target */}
        <div className="p-4 rounded-bento bg-surface border border-border-token flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-muted tracking-wider block">
              Total Coverage
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-text">
                {coverage.totalSolved}
              </span>
              <span className="text-xs text-muted font-mono">/ {coverage.totalTarget} target</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-surface-2 flex items-center justify-center font-mono text-xs font-bold text-accent-ice">
            {coverage.overallPercentage}%
          </div>
        </div>

        {/* Weakest Patterns Banner */}
        <div className="md:col-span-2 p-4 rounded-bento bg-status-warn/10 border border-status-warn/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-status-warn shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display text-xs font-bold text-text uppercase tracking-wider">
                Weakest 3 Patterns To Target
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Focus your next DSA deep work blocks on closing the deficit in these topics:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {coverage.weakestPatterns.map((wp) => (
                  <button
                    key={wp.pattern}
                    type="button"
                    onClick={() => onSelectPatternFilter?.(wp.pattern)}
                    className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-surface border border-status-warn/40 text-status-warn hover:bg-surface-2 transition-colors flex items-center gap-1"
                  >
                    <span>{wp.pattern}:</span>
                    <span className="text-text font-bold">
                      {wp.solved}/{wp.target}
                    </span>
                    <span className="text-muted">({wp.percentage}%)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 18 Pattern Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coverage.patterns.map((item) => {
          const isWeakest = coverage.weakestPatterns.some((wp) => wp.pattern === item.pattern);

          return (
            <div
              key={item.pattern}
              onClick={() => onSelectPatternFilter?.(item.pattern)}
              className={`p-3.5 rounded-xl border bg-surface hover:bg-surface-2/60 transition-colors cursor-pointer ${
                isWeakest
                  ? 'border-status-warn/40 bg-status-warn/5'
                  : item.status === 'completed'
                    ? 'border-status-success/30'
                    : 'border-border-token'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-display text-xs font-bold text-text truncate">
                  {item.pattern}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold border ${
                    item.status === 'completed'
                      ? 'bg-status-success/20 text-status-success border-status-success/40'
                      : item.status === 'critical'
                        ? 'bg-status-danger/20 text-status-danger border-status-danger/40'
                        : item.status === 'behind'
                          ? 'bg-status-warn/20 text-status-warn border-status-warn/40'
                          : 'bg-surface-2 text-muted border-border-token'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Solved vs Target */}
              <div className="flex items-baseline justify-between text-xs font-mono text-muted mb-1.5">
                <span>
                  <strong className="text-text font-bold">{item.solved}</strong> / {item.target}{' '}
                  solved
                </span>
                <span className="text-accent-ice font-bold">{item.percentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.status === 'completed'
                      ? 'bg-status-success'
                      : isWeakest || item.status === 'critical'
                        ? 'bg-status-danger'
                        : item.status === 'behind'
                          ? 'bg-status-warn'
                          : 'bg-accent-ice'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
