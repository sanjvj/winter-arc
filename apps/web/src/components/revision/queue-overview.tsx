'use client';

import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Play, ExternalLink } from 'lucide-react';
import {
  Problem,
  RevisionQueueResult,
  DayForecast,
  diffDaysIST,
  todayIST,
} from '@winter-arc/shared';

interface QueueOverviewProps {
  queueResult: RevisionQueueResult;
  forecast: DayForecast[];
  onStartReview: () => void;
  onSelectProblem?: (problem: Problem) => void;
}

export function QueueOverview({
  queueResult,
  forecast,
  onStartReview,
  onSelectProblem,
}: QueueOverviewProps) {
  const today = todayIST();
  const maxForecastDue = Math.max(1, ...forecast.map((f) => f.dueCount));

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Queue */}
        <div className="p-4 rounded-bento bg-surface border border-border-token flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-muted tracking-wider block">
              Total Queue
            </span>
            <span className="font-display text-2xl font-bold text-text mt-1 block">
              {queueResult.totalDue}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-accent-ice/10 text-accent-ice flex items-center justify-center font-mono text-xs font-bold border border-accent-ice/20">
            {queueResult.queue.length}
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-bento bg-surface border border-border-token flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-muted tracking-wider block">
              Overdue Backlog
            </span>
            <span
              className={`font-display text-2xl font-bold mt-1 block ${
                queueResult.overdue.length > 0 ? 'text-status-danger' : 'text-text'
              }`}
            >
              {queueResult.overdue.length}
            </span>
          </div>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
              queueResult.overdue.length > 0
                ? 'bg-status-danger/15 text-status-danger border-status-danger/30'
                : 'bg-surface-2 text-muted border-border-token'
            }`}
          >
            {queueResult.overdue.length}
          </div>
        </div>

        {/* Due Today */}
        <div className="p-4 rounded-bento bg-surface border border-border-token flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-muted tracking-wider block">
              Scheduled Today
            </span>
            <span className="font-display text-2xl font-bold text-text mt-1 block">
              {queueResult.dueToday.length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-2 text-text flex items-center justify-center font-mono text-xs font-bold border border-border-token">
            {queueResult.dueToday.length}
          </div>
        </div>

        {/* Mastered */}
        <div className="p-4 rounded-bento bg-surface border border-border-token flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-muted tracking-wider block">
              Mastered (30d+)
            </span>
            <span className="font-display text-2xl font-bold text-status-success mt-1 block">
              {queueResult.masteredCount}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-status-success/15 text-status-success flex items-center justify-center font-mono text-xs font-bold border border-status-success/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Start Review Callout */}
      {queueResult.totalDue > 0 && (
        <div className="p-5 rounded-bento bg-surface border border-border-token flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent-ice/15 border border-accent-ice/30 text-accent-ice flex items-center justify-center shrink-0">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-text">
                Active Recall Deck Ready
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {queueResult.overdue.length > 0
                  ? `${queueResult.overdue.length} overdue problems will appear first, followed by ${queueResult.dueToday.length} due today.`
                  : `${queueResult.dueToday.length} problems scheduled for review today.`}
              </p>
            </div>
          </div>

          <button
            onClick={onStartReview}
            className="px-6 py-2.5 rounded-lg bg-accent-ice text-black font-display font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shrink-0 shadow-md"
          >
            <Play className="h-4 w-4 fill-black" /> Start Review Session ({queueResult.totalDue})
          </button>
        </div>
      )}

      {/* 14-Day Revision Forecast Chart */}
      <div className="p-5 rounded-bento bg-surface border border-border-token">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-sm font-bold text-text flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-ice" /> 14-Day Revision Forecast
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Projected daily reviews based on current interval schedules
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted">Zero penalty for missed days</span>
        </div>

        {/* Forecast Bars */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-2">
          {forecast.map((day, i) => {
            const isToday = i === 0;
            const barHeightPct = Math.max(8, Math.round((day.dueCount / maxForecastDue) * 100));

            return (
              <div
                key={day.date}
                className={`p-2 rounded-lg flex flex-col items-center justify-between border transition-colors ${
                  isToday
                    ? 'border-accent-ice/50 bg-accent-ice/10'
                    : day.dueCount > 0
                      ? 'border-border-token bg-surface-2'
                      : 'border-transparent bg-surface-2/40'
                }`}
                style={{ minHeight: '120px' }}
                title={`${day.date}: ${day.dueCount} cards due (${day.overdueCount > 0 ? `${day.overdueCount} overdue, ` : ''}${day.scheduledCount} scheduled)`}
              >
                {/* Count badge */}
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isToday ? 'text-accent-ice' : day.dueCount > 0 ? 'text-text' : 'text-muted/40'
                  }`}
                >
                  {day.dueCount}
                </span>

                {/* Vertical Bar */}
                <div className="w-full flex items-end justify-center h-14 my-1">
                  <div
                    className={`w-3/4 rounded-t transition-all ${
                      isToday
                        ? 'bg-accent-ice'
                        : day.dueCount > 0
                          ? 'bg-border-token hover:bg-muted'
                          : 'bg-transparent'
                    }`}
                    style={{ height: `${day.dueCount > 0 ? barHeightPct : 0}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="text-center">
                  <span className="text-[10px] font-mono block text-muted">
                    {isToday ? 'Today' : day.date.slice(5)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Due Problems List (Oldest Overdue First) */}
      <div className="rounded-bento border border-border-token bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border-token bg-surface-2 flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-muted tracking-wider">
            Problems in Queue ({queueResult.totalDue})
          </span>
          <span className="text-[11px] text-muted">Oldest overdue listed first</span>
        </div>

        {queueResult.totalDue === 0 ? (
          <div className="p-12 text-center text-muted">
            <CheckCircle2 className="mx-auto h-8 w-8 text-status-success mb-2" />
            <h4 className="font-display text-sm font-semibold text-text">No Due Revisions!</h4>
            <p className="text-xs text-muted mt-0.5">
              Your revision queue is completely clear for today. Great work!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-token">
            {queueResult.queue.map((problem) => {
              const nextDue = problem.revision.nextDue;
              const isOverdue = nextDue !== null && nextDue < today;
              const daysOverdue = isOverdue && nextDue ? diffDaysIST(nextDue, today) : 0;

              return (
                <div
                  key={problem.id ?? problem.title}
                  onClick={() => onSelectProblem?.(problem)}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-2/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    {isOverdue ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-status-danger/20 text-status-danger border border-status-danger/40 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="h-3 w-3" /> Overdue {daysOverdue}d
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-ice/15 text-accent-ice border border-accent-ice/30 shrink-0">
                        Due Today
                      </span>
                    )}

                    <div>
                      <h4 className="font-medium text-xs text-text flex items-center gap-1.5">
                        {problem.title}
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted hover:text-accent-ice"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted mt-0.5 font-mono">
                        {problem.pattern} · Step {problem.revision.step} · Solved {problem.solvedAt}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${
                      problem.difficulty === 'easy'
                        ? 'bg-status-success/15 text-status-success border-status-success/30'
                        : problem.difficulty === 'medium'
                          ? 'bg-status-warn/15 text-status-warn border-status-warn/30'
                          : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
