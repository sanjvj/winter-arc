'use client';

import React from 'react';
import { WeeklySummary, Targets, Floor } from '@winter-arc/shared';
import { Check, X, Trophy, AlertTriangle, Code2, Send, Zap } from 'lucide-react';

interface WeeklyScorecardProps {
  summary: WeeklySummary;
  targets: Targets;
  floor: Floor;
}

export const WeeklyScorecard: React.FC<WeeklyScorecardProps> = ({ summary, targets }) => {
  const { days, totals, bestDay, worstDay } = summary;

  const targetProblems = targets.problemsPerDay * 7;
  const targetApplications = targets.applicationsPerDay * 7;
  const targetStartupHours = targets.startupHours * 7;
  const targetMocks = targets.mocksPerWeek;

  return (
    <div className="space-y-6">
      {/* Best & Worst Day Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Day */}
        <div className="rounded-bento border border-status-success/30 bg-status-success/5 p-4 flex items-start gap-3.5">
          <div className="rounded-full bg-status-success/20 p-2 text-status-success flex-shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-status-success font-semibold">
              Best Day of the Week
            </div>
            {bestDay ? (
              <div className="mt-1">
                <div className="font-display text-base font-bold text-text">
                  {bestDay.dayName} ({bestDay.date})
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Floor {bestDay.floorMet ? 'met' : 'unmet'} • {bestDay.problems} problem(s) •{' '}
                  {bestDay.startupHours}h startup • energy {bestDay.energy}/5
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted mt-1">No activity logged this week.</p>
            )}
          </div>
        </div>

        {/* Worst Day */}
        <div className="rounded-bento border border-status-warn/30 bg-status-warn/5 p-4 flex items-start gap-3.5">
          <div className="rounded-full bg-status-warn/20 p-2 text-status-warn flex-shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-status-warn font-semibold">
              Toughest Day of the Week
            </div>
            {worstDay ? (
              <div className="mt-1">
                <div className="font-display text-base font-bold text-text">
                  {worstDay.dayName} ({worstDay.date})
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Floor {worstDay.floorMet ? 'met' : 'unmet'} • {worstDay.problems} problem(s) •{' '}
                  {worstDay.startupHours}h startup • energy {worstDay.energy}/5
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted mt-1">No missed days recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Metric Table */}
      <div className="overflow-x-auto rounded-bento border border-border-token bg-surface">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-token bg-surface-2 text-[11px] font-mono uppercase text-muted">
              <th className="py-3 px-3">Day</th>
              <th className="py-3 px-3">Problems</th>
              <th className="py-3 px-3">Revisions</th>
              <th className="py-3 px-3">Apps</th>
              <th className="py-3 px-3">Mocks</th>
              <th className="py-3 px-3">Startup</th>
              <th className="py-3 px-3">Gym</th>
              <th className="py-3 px-3">Sleep</th>
              <th className="py-3 px-3">Energy</th>
              <th className="py-3 px-3 text-center">Floor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-token font-mono">
            {days.map((day) => (
              <tr key={day.date} className="hover:bg-surface-2/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-text">
                  {day.dayName.slice(0, 3)}{' '}
                  <span className="text-muted font-normal text-[10px]">{day.date.slice(5)}</span>
                </td>
                <td className="py-2.5 px-3">{day.problems > 0 ? day.problems : '—'}</td>
                <td className="py-2.5 px-3">{day.revisions > 0 ? day.revisions : '—'}</td>
                <td className="py-2.5 px-3">{day.applications > 0 ? day.applications : '—'}</td>
                <td className="py-2.5 px-3">{day.mocks > 0 ? day.mocks : '—'}</td>
                <td className="py-2.5 px-3">
                  {day.startupHours > 0 ? `${day.startupHours}h` : '—'}
                </td>
                <td className="py-2.5 px-3">
                  {day.gymDone ? (
                    <span className="text-status-success font-semibold">{day.gymHours}h</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2.5 px-3">{day.sleepHours > 0 ? `${day.sleepHours}h` : '—'}</td>
                <td className="py-2.5 px-3">{day.energy ? `${day.energy}/5` : '—'}</td>
                <td className="py-2.5 px-3 text-center">
                  {day.floorMet ? (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-status-success/20 text-status-success">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface-2 text-muted/40">
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-token bg-surface-2 font-mono font-bold text-text text-xs">
              <td className="py-3 px-3 uppercase text-accent-ice">Totals</td>
              <td className="py-3 px-3">
                {totals.problems}{' '}
                <span className="font-normal text-[10px] text-muted">/ {targetProblems}</span>
              </td>
              <td className="py-3 px-3">{totals.revisions}</td>
              <td className="py-3 px-3">
                {totals.applications}{' '}
                <span className="font-normal text-[10px] text-muted">/ {targetApplications}</span>
              </td>
              <td className="py-3 px-3">
                {totals.mocks}{' '}
                <span className="font-normal text-[10px] text-muted">/ {targetMocks}</span>
              </td>
              <td className="py-3 px-3">
                {totals.startupHours}h{' '}
                <span className="font-normal text-[10px] text-muted">/ {targetStartupHours}h</span>
              </td>
              <td className="py-3 px-3">{totals.gymDays} days</td>
              <td className="py-3 px-3">{totals.averageSleep}h avg</td>
              <td className="py-3 px-3">
                {Math.round(
                  days.reduce((a, d) => a + d.energy, 0) /
                    (days.filter((d) => d.energy > 0).length || 1),
                )}
                /5
              </td>
              <td className="py-3 px-3 text-center text-status-success">{totals.floorDays} / 7</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Daily Breakdown Mini Visual Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Problems by Day */}
        <div className="rounded-bento border border-border-token bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted mb-3">
            <Code2 className="h-3.5 w-3.5 text-accent-ice" /> Problems Solved by Day
          </div>
          <div className="flex items-end gap-1.5 h-20 pt-2">
            {days.map((d) => {
              const maxVal = Math.max(5, ...days.map((x) => x.problems));
              const heightPercent = Math.min(100, (d.problems / maxVal) * 100);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted">{d.problems}</span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      d.problems >= targets.problemsPerDay ? 'bg-status-success' : 'bg-accent-ice'
                    }`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />
                  <span className="text-[9px] font-mono text-muted">{d.dayName.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applications by Day */}
        <div className="rounded-bento border border-border-token bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted mb-3">
            <Send className="h-3.5 w-3.5 text-accent-ice" /> Applications by Day
          </div>
          <div className="flex items-end gap-1.5 h-20 pt-2">
            {days.map((d) => {
              const maxVal = Math.max(8, ...days.map((x) => x.applications));
              const heightPercent = Math.min(100, (d.applications / maxVal) * 100);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted">{d.applications}</span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      d.applications >= targets.applicationsPerDay
                        ? 'bg-status-success'
                        : 'bg-accent-ice'
                    }`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />
                  <span className="text-[9px] font-mono text-muted">{d.dayName.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Startup Hours by Day */}
        <div className="rounded-bento border border-border-token bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted mb-3">
            <Zap className="h-3.5 w-3.5 text-accent-ice" /> Startup Hours by Day
          </div>
          <div className="flex items-end gap-1.5 h-20 pt-2">
            {days.map((d) => {
              const maxVal = Math.max(6, ...days.map((x) => x.startupHours));
              const heightPercent = Math.min(100, (d.startupHours / maxVal) * 100);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted">{d.startupHours}h</span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      d.startupHours >= targets.startupHours ? 'bg-status-success' : 'bg-accent-ice'
                    }`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />
                  <span className="text-[9px] font-mono text-muted">{d.dayName.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
