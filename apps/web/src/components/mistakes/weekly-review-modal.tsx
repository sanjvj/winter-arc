'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
import { Mistake, Problem, todayIST, weekStartMondayIST } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { updateDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentMistakes: Mistake[];
  problems: Problem[];
}

export function WeeklyReviewModal({
  isOpen,
  onClose,
  recentMistakes,
  problems,
}: WeeklyReviewModalProps) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const current = recentMistakes[index] ?? null;
  const today = todayIST();
  const currentWeekStart = weekStartMondayIST(today);

  const problemMap = new Map<string, Problem>();
  for (const p of problems) {
    if (p.id) problemMap.set(p.id, p);
    problemMap.set(p.title, p);
  }

  const linkedProblem = current?.problemId ? problemMap.get(current.problemId) : null;

  const handleMarkAllReviewed = async () => {
    if (!user?.uid) return;

    let count = 0;
    for (const m of recentMistakes) {
      if (m.id && !m.reviewedWeeks.includes(currentWeekStart)) {
        await updateDocument(user.uid, 'mistakes', m.id, {
          reviewedWeeks: [...m.reviewedWeeks, currentWeekStart],
        });
        count++;
      }
    }

    toast.success(
      'Review Complete',
      `Marked ${count} recent mistake(s) reviewed for week of ${currentWeekStart}.`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-surface border border-border-token rounded-bento p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-token">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-status-warn/20 text-status-warn font-mono">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-text">
                  Weekly Anti-Pattern Review
                </h3>
                <p className="text-[11px] text-muted">Review mistakes from the last 7 days</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {recentMistakes.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <CheckCircle2 className="mx-auto h-8 w-8 text-status-success mb-2" />
              <h4 className="font-display text-sm font-bold text-text">No Recent Mistakes!</h4>
              <p className="text-xs text-muted mt-1">Zero mistakes recorded in the last 7 days.</p>
            </div>
          ) : current ? (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted">
                <span>
                  Mistake {index + 1} of {recentMistakes.length}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Logged on {current.date}
                </span>
              </div>

              {/* Main Card */}
              <div className="p-5 rounded-xl bg-surface-2 border border-border-token space-y-3">
                <p className="text-sm font-medium text-text leading-relaxed">
                  &ldquo;{current.text}&rdquo;
                </p>

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-token/60 text-xs">
                  {current.pattern && (
                    <span className="px-2 py-0.5 rounded bg-surface border border-border-token text-muted font-mono">
                      Pattern: {current.pattern}
                    </span>
                  )}
                  {linkedProblem && (
                    <span className="text-muted">
                      Problem:{' '}
                      <strong className="text-text font-medium">{linkedProblem.title}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Reflection Callout */}
              <p className="text-xs text-muted italic text-center">
                Reflect: Did you avoid this trap in recent solves? What is the trigger that prevents
                it?
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border-token flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index <= 0}
              className="p-2 rounded-lg bg-surface-2 border border-border-token text-muted hover:text-text disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(recentMistakes.length - 1, i + 1))}
              disabled={index >= recentMistakes.length - 1}
              className="p-2 rounded-lg bg-surface-2 border border-border-token text-muted hover:text-text disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:text-text hover:bg-surface-2 border border-border-token"
            >
              Close
            </button>
            {recentMistakes.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllReviewed}
                className="px-4 py-2 rounded-lg bg-accent-burgundy text-white text-xs font-display font-semibold hover:bg-accent-burgundy-glow flex items-center gap-1.5 transition-all shadow-burgundy"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark All Reviewed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
