'use client';

import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Trash2, CheckCheck } from 'lucide-react';
import { Mistake, Problem, weekStartMondayIST } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { updateDocument, deleteDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface WeeklyMistakesListProps {
  mistakes: Mistake[];
  problems: Problem[];
}

interface WeekGroup {
  weekStart: string;
  mistakes: Mistake[];
  allReviewed: boolean;
  unreviewedCount: number;
}

export function WeeklyMistakesList({ mistakes, problems }: WeeklyMistakesListProps) {
  const { user } = useAuth();

  // Create problem lookup map for fast title lookup
  const problemMap = useMemo(() => {
    const map = new Map<string, Problem>();
    for (const p of problems) {
      if (p.id) map.set(p.id, p);
      map.set(p.title, p);
    }
    return map;
  }, [problems]);

  // Group mistakes by Monday-based week start
  const weekGroups: WeekGroup[] = useMemo(() => {
    const groups = new Map<string, Mistake[]>();

    for (const m of mistakes) {
      const wStart = weekStartMondayIST(m.date);
      const existing = groups.get(wStart) || [];
      existing.push(m);
      groups.set(wStart, existing);
    }

    // Sort weeks descending (newest week first)
    const sortedWeekStarts = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

    return sortedWeekStarts.map((weekStart) => {
      const items = groups.get(weekStart) || [];
      // Sort mistakes in week by date descending
      items.sort((a, b) => b.date.localeCompare(a.date));

      const unreviewed = items.filter((m) => !m.reviewedWeeks.includes(weekStart));
      return {
        weekStart,
        mistakes: items,
        allReviewed: unreviewed.length === 0,
        unreviewedCount: unreviewed.length,
      };
    });
  }, [mistakes]);

  // Batch mark week reviewed
  const handleMarkWeekReviewed = async (week: WeekGroup) => {
    if (!user?.uid) return;

    let updatedCount = 0;
    for (const m of week.mistakes) {
      if (m.id && !m.reviewedWeeks.includes(week.weekStart)) {
        const newReviewed = [...m.reviewedWeeks, week.weekStart];
        await updateDocument(user.uid, 'mistakes', m.id, {
          reviewedWeeks: newReviewed,
        });
        updatedCount++;
      }
    }

    toast.success(
      'Week Reviewed',
      `Marked ${updatedCount} mistake(s) reviewed for week of ${week.weekStart}.`,
    );
  };

  const handleDeleteMistake = async (mistake: Mistake) => {
    if (!user?.uid || !mistake.id) return;
    if (!window.confirm('Delete this mistake record?')) return;

    const ok = await deleteDocument(user.uid, 'mistakes', mistake.id);
    if (ok) {
      toast.info('Deleted', 'Mistake removed.');
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className="p-12 text-center text-muted rounded-bento border border-border-token bg-surface">
        <AlertTriangle className="mx-auto h-8 w-8 text-status-warn/50 mb-3" />
        <h3 className="font-display text-sm font-semibold text-text">No Mistakes Logged Yet</h3>
        <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
          Whenever you get stuck or find an anti-pattern during a problem, press &apos;m&apos; to
          log it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weekGroups.map((week) => (
        <div
          key={week.weekStart}
          className="rounded-bento border border-border-token bg-surface overflow-hidden"
        >
          {/* Week Header */}
          <div className="px-5 py-3 border-b border-border-token bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-ice" />
              <span className="font-display text-sm font-bold text-text">
                Week of {week.weekStart}
              </span>
              <span className="text-xs text-muted font-mono">
                ({week.mistakes.length} mistakes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {week.allReviewed ? (
                <span className="px-2.5 py-1 rounded text-xs font-medium bg-status-success/15 text-status-success border border-status-success/30 flex items-center gap-1 font-mono">
                  <CheckCheck className="h-3.5 w-3.5" /> Reviewed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMarkWeekReviewed(week)}
                  className="px-3 py-1 rounded-lg bg-surface hover:bg-surface-2 border border-border-token text-xs font-medium text-text flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-ice" /> Mark Week Reviewed (
                  {week.unreviewedCount})
                </button>
              )}
            </div>
          </div>

          {/* Mistakes Items */}
          <div className="divide-y divide-border-token">
            {week.mistakes.map((mistake) => {
              const linkedProblem = mistake.problemId ? problemMap.get(mistake.problemId) : null;

              return (
                <div
                  key={mistake.id ?? mistake.text}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-surface-2/40 transition-colors group"
                >
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs text-text font-medium leading-relaxed">{mistake.text}</p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="font-mono text-muted">{mistake.date}</span>

                      {mistake.pattern && (
                        <span className="px-2 py-0.2 rounded bg-surface-2 border border-border-token text-muted font-medium">
                          {mistake.pattern}
                        </span>
                      )}

                      {linkedProblem && (
                        <span className="text-muted flex items-center gap-1">
                          Linked:{' '}
                          <strong className="text-text font-medium">{linkedProblem.title}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteMistake(mistake)}
                      className="p-1.5 rounded text-muted hover:text-status-danger hover:bg-surface-2 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete Mistake"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
