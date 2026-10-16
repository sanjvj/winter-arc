'use client';

import React from 'react';
import { Roadmap } from '@winter-arc/shared';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface WeeklyRoadmapGoalsProps {
  roadmap: Roadmap | null;
  weekNum: number;
}

export const WeeklyRoadmapGoals: React.FC<WeeklyRoadmapGoalsProps> = ({ roadmap, weekNum }) => {
  const currentWeek = roadmap?.weeks?.find((w) => w.n === weekNum);
  const goals = currentWeek?.goals || [];
  const completedCount = goals.filter((g) => g.done).length;
  const totalCount = goals.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-bento border border-border-token bg-surface p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-token pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-accent-ice" />
          <h3 className="font-display text-base font-bold text-text">
            Roadmap Goals for Week {weekNum}
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-text font-semibold">
            {completedCount}/{totalCount} Completed
          </span>
          <span className="text-accent-ice">({percent}%)</span>
        </div>
      </div>

      {currentWeek?.theme && (
        <p className="text-xs text-muted leading-relaxed italic">
          &ldquo;{currentWeek.theme}&rdquo;
        </p>
      )}

      {goals.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted/60">
          No milestone goals assigned for Week {weekNum} in the syllabus roadmap.
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
                goal.done
                  ? 'border-status-success/30 bg-status-success/5 text-muted'
                  : 'border-border-token bg-surface-2/40 text-text'
              }`}
            >
              {goal.done ? (
                <CheckCircle2 className="h-4 w-4 text-status-success flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted/40 flex-shrink-0" />
              )}
              <span className={goal.done ? 'line-through' : 'font-medium'}>{goal.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
