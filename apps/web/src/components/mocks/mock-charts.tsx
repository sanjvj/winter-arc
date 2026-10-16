'use client';

import React from 'react';
import { Mock, weekStartMondayIST, addDaysIST, todayIST, Targets } from '@winter-arc/shared';
import { TrendingUp, Target, AlertCircle } from 'lucide-react';

interface MockChartsProps {
  mocks: Mock[];
  targets?: Targets;
}

export const MockCharts: React.FC<MockChartsProps> = ({ mocks, targets }) => {
  const today = todayIST();
  const currentWeekMonday = weekStartMondayIST(today);
  const currentWeekSunday = addDaysIST(currentWeekMonday, 6);
  const targetPerWeek = targets?.mocksPerWeek ?? 2;

  // 1. Weekly count
  const thisWeekMocks = mocks.filter(
    (m) => m.date >= currentWeekMonday && m.date <= currentWeekSunday,
  );
  const weekCount = thisWeekMocks.length;
  const targetPercent = Math.min(100, Math.round((weekCount / targetPerWeek) * 100));

  // 2. Score trend (chronological)
  const sortedMocks = [...mocks].sort((a, b) => a.date.localeCompare(b.date));
  const avgScore =
    mocks.length > 0
      ? (mocks.reduce((acc, m) => acc + m.score, 0) / mocks.length).toFixed(1)
      : '0.0';

  // 3. Weakness frequency
  const weaknessCount: Record<string, number> = {};
  for (const m of mocks) {
    if (!m.weaknesses) continue;
    const tags = m.weaknesses
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    for (const tag of tags) {
      const lower = tag.charAt(0).toUpperCase() + tag.slice(1);
      weaknessCount[lower] = (weaknessCount[lower] || 0) + 1;
    }
  }

  const topWeaknesses = Object.entries(weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Weekly Pace vs Target */}
      <div className="rounded-bento border border-border-token bg-surface p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
              <Target className="h-3.5 w-3.5 text-accent-ice" /> Weekly Pace
            </span>
            <span className="font-mono text-xs text-muted">
              {weekCount} / {targetPerWeek} Mocks
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-text">{weekCount}</span>
            <span className="text-xs font-mono text-muted">completed this week</span>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-surface-2 overflow-hidden border border-border-token">
            <div
              className={`h-full transition-all duration-300 ${
                weekCount >= targetPerWeek ? 'bg-status-success' : 'bg-accent-ice'
              }`}
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-3 text-[11px] font-mono text-muted/70">
          {weekCount >= targetPerWeek
            ? 'Weekly mock target reached! Great pace.'
            : `${targetPerWeek - weekCount} more mock(s) needed by Sunday to meet target.`}
        </div>
      </div>

      {/* 2. Score Trend */}
      <div className="rounded-bento border border-border-token bg-surface p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-status-success" /> Score Trend
            </span>
            <span className="font-mono text-xs text-status-success font-semibold">
              Avg {avgScore} / 5.0
            </span>
          </div>

          {sortedMocks.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted/60">
              No mocks logged yet to calculate score trends.
            </div>
          ) : (
            <div className="mt-3 flex items-end gap-1.5 h-16 pt-2">
              {sortedMocks.slice(-8).map((m, idx) => {
                const heightPercent = (m.score / 5) * 100;
                return (
                  <div
                    key={m.id || idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div className="text-[10px] font-mono text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.score}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${
                        m.score >= 4
                          ? 'bg-status-success'
                          : m.score === 3
                            ? 'bg-status-warn'
                            : 'bg-status-danger'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${m.date} (${m.type}): ${m.score}/5`}
                    />
                    <div className="text-[9px] font-mono text-muted/60 truncate max-w-full">
                      {m.date.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 text-[11px] font-mono text-muted/70">
          Latest {Math.min(8, sortedMocks.length)} mock evaluations (1 to 5 scale).
        </div>
      </div>

      {/* 3. Frequent Weaknesses */}
      <div className="rounded-bento border border-border-token bg-surface p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
              <AlertCircle className="h-3.5 w-3.5 text-status-warn" /> Frequent Weaknesses
            </span>
            <span className="font-mono text-xs text-muted">{topWeaknesses.length} tags</span>
          </div>

          {topWeaknesses.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted/60">
              No weakness tags logged yet.
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topWeaknesses.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-status-warn/15 border border-status-warn/30 px-2 py-1 text-xs font-mono text-status-warn"
                >
                  <span className="truncate max-w-[140px]">{tag}</span>
                  <span className="font-bold opacity-80">({count}x)</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-[11px] font-mono text-muted/70">
          Ranked recurring weaknesses to address in preparation.
        </div>
      </div>
    </div>
  );
};
