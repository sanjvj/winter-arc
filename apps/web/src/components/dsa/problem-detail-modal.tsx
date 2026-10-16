'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Problem, todayIST, diffDaysIST } from '@winter-arc/shared';

interface ProblemDetailModalProps {
  problem: Problem | null;
  onClose: () => void;
}

export function ProblemDetailModal({ problem, onClose }: ProblemDetailModalProps) {
  if (!problem) return null;

  const today = todayIST();
  const nextDue = problem.revision.nextDue;
  const isMastered = problem.revision.mastered;
  const isOverdue = !isMastered && nextDue !== null && nextDue < today;
  const daysOverdue = isOverdue && nextDue ? diffDaysIST(nextDue, today) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface border border-border-token rounded-bento p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-token">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-surface-2 border border-border-token text-accent-ice">
                {problem.platform}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-2 border border-border-token text-text">
                {problem.pattern}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                  problem.difficulty === 'easy'
                    ? 'bg-status-success/15 text-status-success border-status-success/30'
                    : problem.difficulty === 'medium'
                      ? 'bg-status-warn/15 text-status-warn border-status-warn/30'
                      : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                }`}
              >
                {problem.difficulty}
              </span>

              {isMastered ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-status-success/20 text-status-success border border-status-success/40 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Mastered
                </span>
              ) : isOverdue ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-status-danger/20 text-status-danger border border-status-danger/40 flex items-center gap-1 font-mono">
                  <AlertTriangle className="h-3 w-3" /> Overdue by {daysOverdue}d
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-ice/15 text-accent-ice border border-accent-ice/30 font-mono">
                  Step {problem.revision.step} (Due: {nextDue ?? 'N/A'})
                </span>
              )}
            </div>

            <h2 className="font-display text-xl font-bold text-text flex items-center gap-2">
              {problem.title}
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent-ice transition-colors"
                  title="Open Problem Link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 py-5 text-sm">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-surface-2 border border-border-token text-xs">
            <div>
              <span className="text-muted block">Solved Date</span>
              <span className="font-mono text-text flex items-center gap-1 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-muted" /> {problem.solvedAt}
              </span>
            </div>
            <div>
              <span className="text-muted block">Time Taken</span>
              <span className="font-mono text-text flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-muted" /> {problem.timeTakenMin} mins
              </span>
            </div>
            <div>
              <span className="text-muted block">Initial Outcome</span>
              <span className="capitalize font-medium text-text mt-0.5 block">
                {problem.outcome}
              </span>
            </div>
            <div>
              <span className="text-muted block">Complexity</span>
              <span className="font-mono text-text mt-0.5 block">
                {problem.complexity?.time || 'O(?)'} / {problem.complexity?.space || 'O(?)'}
              </span>
            </div>
          </div>

          {/* Key Insight */}
          <div className="p-3.5 rounded-lg bg-surface-2 border border-border-token">
            <span className="text-xs font-semibold text-accent-ice uppercase tracking-wider block mb-1">
              Key Insight (The Trick)
            </span>
            <p className="text-text font-medium">{problem.insight || 'No insight recorded.'}</p>
          </div>

          {/* Where I got stuck */}
          {problem.stuckAt && (
            <div className="p-3.5 rounded-lg bg-surface-2 border border-border-token">
              <span className="text-xs font-semibold text-status-warn uppercase tracking-wider block mb-1">
                Where I Got Stuck (Anti-Pattern)
              </span>
              <p className="text-muted">{problem.stuckAt}</p>
            </div>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div>
              <span className="text-xs text-muted block mb-1.5">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-surface-2 border border-border-token text-muted font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Revision History Timeline */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Revision History (
              {problem.revision.history.length} reviews)
            </h3>

            {problem.revision.history.length === 0 ? (
              <p className="text-xs text-muted italic p-3 rounded-lg bg-surface-2 border border-border-token">
                No active recall reviews logged yet. Next scheduled review is {nextDue ?? 'N/A'}.
              </p>
            ) : (
              <div className="space-y-2">
                {problem.revision.history.map((h, i) => (
                  <div
                    key={`${h.date}-${i}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-border-token text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          h.result === 'pass' ? 'bg-status-success' : 'bg-status-danger'
                        }`}
                      />
                      <span className="font-mono text-muted">{h.date}</span>
                      <span
                        className={`capitalize font-medium ${
                          h.result === 'pass' ? 'text-status-success' : 'text-status-danger'
                        }`}
                      >
                        {h.result}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-muted">
                      <span>Step {h.fromStep}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-text font-bold">Step {h.toStep}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-token flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text bg-surface-2 hover:bg-surface-2/80 border border-border-token transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
