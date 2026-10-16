'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { FloorEvaluationResult, StreakResult } from '@winter-arc/shared';

interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: FloorEvaluationResult;
  streak: StreakResult;
  onConfirmCloseAnyway?: () => void;
}

export function CloseDayModal({
  isOpen,
  onClose,
  evaluation,
  streak,
  onConfirmCloseAnyway,
}: CloseDayModalProps) {
  if (!isOpen) return null;

  const { floorMet, missing } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border-token rounded-bento p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {floorMet ? (
          /* SUCCESS CASE: Floor Met */
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center text-status-success shadow-lg shadow-status-success/10">
              <Flame className="h-7 w-7 text-accent-ice animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-status-success">
                Day Closed Successfully
              </span>
              <h2 className="font-display text-xl font-bold text-text">Daily Floor Achieved! 🔥</h2>
              <p className="text-xs text-muted max-w-xs mx-auto">
                All daily minimum targets satisfied. Your discipline is compounding.
              </p>
            </div>

            <div className="bg-surface-2 border border-border-token rounded-lg p-3.5 flex items-center justify-around font-mono">
              <div>
                <span className="block text-[10px] text-muted uppercase">Current Streak</span>
                <span className="text-xl font-bold text-accent-ice">
                  {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="w-px h-8 bg-border-token" />
              <div>
                <span className="block text-[10px] text-muted uppercase">Longest Streak</span>
                <span className="text-xl font-bold text-text">{streak.longestStreak} days</span>
              </div>
              <div className="w-px h-8 bg-border-token" />
              <div>
                <span className="block text-[10px] text-muted uppercase">Total Floor Days</span>
                <span className="text-xl font-bold text-status-success">
                  {streak.totalFloorDays}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border-token text-xs font-mono text-muted hover:text-text transition-colors"
              >
                Keep Reviewing
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-burgundy text-white font-mono text-xs font-bold hover:bg-accent-burgundy-glow transition-all shadow-burgundy"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* WARNING CASE: Floor Not Met */
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-status-warn/10 border border-status-warn/30 flex items-center justify-center text-status-warn flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display text-base font-bold text-text">
                  Daily Floor Incomplete
                </h3>
                <p className="text-xs text-muted">
                  You are attempting to close today with incomplete minimums.
                </p>
              </div>
            </div>

            <div className="bg-surface-2 border border-border-token rounded-lg p-3 space-y-2">
              <span className="block text-[11px] font-mono font-semibold text-status-warn uppercase tracking-wider">
                Missing Requirements:
              </span>
              <ul className="space-y-1.5">
                {missing.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-mono text-text/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-warn" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted/90 bg-status-danger/10 border border-status-danger/20 rounded-lg p-2.5 font-mono text-[11px]">
              Closing the day with missing floor items will mark today as incomplete and break your
              streak.
            </p>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-accent-ice text-background font-mono text-xs font-bold hover:bg-accent-ice/90 transition-colors text-center"
              >
                Back to Complete Tasks
              </button>
              {onConfirmCloseAnyway && (
                <button
                  type="button"
                  onClick={onConfirmCloseAnyway}
                  className="px-3 py-2 rounded-lg border border-status-danger/30 text-status-danger hover:bg-status-danger/10 font-mono text-xs transition-colors"
                >
                  Close Anyway
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
