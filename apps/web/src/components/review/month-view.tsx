'use client';

import React, { useState } from 'react';
import {
  DailyLog,
  Problem,
  Application,
  Mock,
  Targets,
  Floor,
  addDaysIST,
  calculateWeeklySummary,
  calculateMonthRollup,
} from '@winter-arc/shared';
import { Layers, CheckCircle2, Code2, Send, Mic, Zap, Moon } from 'lucide-react';

interface MonthViewProps {
  planStartDate: string;
  dailyLogs: DailyLog[];
  problems: Problem[];
  applications: Application[];
  mocks: Mock[];
  targets: Targets;
  floor: Floor;
}

const MONTH_BLOCKS = [
  { id: 'm1', label: 'Month 1 (Weeks 1 - 4)', startWeek: 1, endWeek: 4 },
  { id: 'm2', label: 'Month 2 (Weeks 5 - 8)', startWeek: 5, endWeek: 8 },
  { id: 'm3', label: 'Month 3 (Weeks 9 - 12)', startWeek: 9, endWeek: 12 },
];

export const MonthView: React.FC<MonthViewProps> = ({
  planStartDate,
  dailyLogs,
  problems,
  applications,
  mocks,
  targets,
  floor,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState('m1');
  const activeBlock = MONTH_BLOCKS.find((b) => b.id === selectedBlockId) || MONTH_BLOCKS[0];

  if (!activeBlock) return null;

  // Generate 4 weekly summaries
  const weeklySummaries = [];
  for (let w = activeBlock.startWeek; w <= activeBlock.endWeek; w++) {
    const weekStart = addDaysIST(planStartDate, (w - 1) * 7);
    const summary = calculateWeeklySummary({
      weekStart,
      dailyLogs,
      problems,
      applications,
      mocks,
      targets,
      floor,
    });
    weeklySummaries.push(summary);
  }

  const rollup = calculateMonthRollup(activeBlock.label, weeklySummaries);

  return (
    <div className="space-y-6">
      {/* Month Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-bento border border-border-token bg-surface p-2">
        {MONTH_BLOCKS.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => setSelectedBlockId(block.id)}
            className={`flex-1 min-w-[160px] rounded-md px-3 py-2 text-xs font-mono font-semibold transition-colors text-center ${
              selectedBlockId === block.id
                ? 'bg-accent-ice text-bg shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            {block.label}
          </button>
        ))}
      </div>

      {/* Aggregate Month Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-success" /> Floor Consistency
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-status-success">
              {rollup.floorPercentage}%
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">
            {rollup.floorDaysMet} of {rollup.weeksCount * 7} days
          </div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Code2 className="h-3.5 w-3.5 text-accent-ice" /> Problems
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">
              {rollup.totalProblems}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">solved across 4 weeks</div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Layers className="h-3.5 w-3.5 text-muted" /> Revisions
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">
              {weeklySummaries.reduce((acc, ws) => acc + ws.totals.revisions, 0)}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">spaced recall passes</div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Send className="h-3.5 w-3.5 text-accent-ice" /> Applications
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">
              {rollup.totalApplications}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">roles applied</div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Mic className="h-3.5 w-3.5 text-status-warn" /> Mocks
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">{rollup.totalMocks}</span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">interviews completed</div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Zap className="h-3.5 w-3.5 text-accent-ice" /> Startup Hours
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">
              {rollup.totalStartupHours}h
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">business building</div>
        </div>

        <div className="rounded-bento border border-border-token bg-surface p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Moon className="h-3.5 w-3.5 text-muted" /> Avg Sleep
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-text">
              {rollup.averageSleep}h
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-0.5">hours per night</div>
        </div>
      </div>

      {/* Week-by-Week Comparison Table */}
      <div className="overflow-x-auto rounded-bento border border-border-token bg-surface">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-token bg-surface-2 text-[11px] font-mono uppercase text-muted">
              <th className="py-3 px-4">Week</th>
              <th className="py-3 px-4">Date Range</th>
              <th className="py-3 px-4">Problems</th>
              <th className="py-3 px-4">Applications</th>
              <th className="py-3 px-4">Mocks</th>
              <th className="py-3 px-4">Startup</th>
              <th className="py-3 px-4">Gym</th>
              <th className="py-3 px-4">Avg Sleep</th>
              <th className="py-3 px-4 text-center">Floor Days</th>
            </tr>
          </thead>
          <tbody className="divide-y border-border-token font-mono">
            {weeklySummaries.map((ws, i) => {
              const weekNum = activeBlock.startWeek + i;
              const weekEnd = addDaysIST(ws.weekStart, 6);

              return (
                <tr key={ws.weekStart} className="hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-text font-display">Week {weekNum}</td>
                  <td className="py-3 px-4 text-muted">
                    {ws.weekStart} to {weekEnd}
                  </td>
                  <td className="py-3 px-4">{ws.totals.problems}</td>
                  <td className="py-3 px-4">{ws.totals.applications}</td>
                  <td className="py-3 px-4">{ws.totals.mocks}</td>
                  <td className="py-3 px-4">{ws.totals.startupHours}h</td>
                  <td className="py-3 px-4">{ws.totals.gymDays}d</td>
                  <td className="py-3 px-4">{ws.totals.averageSleep}h</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-semibold ${
                        ws.totals.floorDays === 7 ? 'text-status-success' : 'text-text'
                      }`}
                    >
                      {ws.totals.floorDays} / 7
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
