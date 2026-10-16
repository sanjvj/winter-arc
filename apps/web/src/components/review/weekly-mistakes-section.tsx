'use client';

import React from 'react';
import { Mistake } from '@winter-arc/shared';
import { updateDocument } from '@/lib/data/mutations';
import { AlertCircle, Check, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface WeeklyMistakesSectionProps {
  mistakes: Mistake[];
  weekStart: string;
  uid: string;
}

export const WeeklyMistakesSection: React.FC<WeeklyMistakesSectionProps> = ({
  mistakes,
  weekStart,
  uid,
}) => {
  const handleMarkReviewed = async (mistake: Mistake) => {
    if (!mistake.id || !uid) return;
    const current = mistake.reviewedWeeks || [];
    if (current.includes(weekStart)) return;

    const updated = [...current, weekStart];
    const ok = await updateDocument(uid, 'mistakes', mistake.id, {
      reviewedWeeks: updated,
    });
    if (ok) {
      toast.success('Mistake Reviewed', `Marked as reviewed for week of ${weekStart}`);
    }
  };

  return (
    <div className="rounded-bento border border-border-token bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border-token pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-status-warn" />
          <h3 className="font-display text-base font-bold text-text">Mistakes Notebook Review</h3>
        </div>
        <span className="font-mono text-xs text-muted">{mistakes.length} logged this week</span>
      </div>

      {mistakes.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted/60">
          No mistakes recorded during this week. Excellent execution.
        </div>
      ) : (
        <div className="space-y-2.5">
          {mistakes.map((mistake) => {
            const isReviewed = (mistake.reviewedWeeks || []).includes(weekStart);

            return (
              <div
                key={mistake.id || `${mistake.date}-${mistake.text}`}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-xs transition-colors ${
                  isReviewed
                    ? 'border-status-success/30 bg-status-success/5'
                    : 'border-border-token bg-surface-2/40'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted">{mistake.date}</span>
                    {mistake.pattern && (
                      <span className="rounded bg-surface-2 border border-border-token px-1.5 py-0.5 text-[10px] font-mono text-text">
                        {mistake.pattern}
                      </span>
                    )}
                  </div>
                  <p className="text-text font-medium leading-relaxed">{mistake.text}</p>
                </div>

                <div className="flex-shrink-0">
                  {isReviewed ? (
                    <span className="inline-flex items-center gap-1 rounded bg-status-success/20 px-2 py-1 text-[11px] font-mono text-status-success font-semibold border border-status-success/30">
                      <CheckCircle2 className="h-3 w-3" /> Reviewed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkReviewed(mistake)}
                      className="inline-flex items-center gap-1 rounded bg-accent-ice/15 border border-accent-ice/30 px-2.5 py-1 text-[11px] font-mono text-accent-ice hover:bg-accent-ice/25 transition-colors"
                    >
                      <Check className="h-3 w-3" /> Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
