'use client';

import React, { useState } from 'react';
import { BentoCard } from '@/components/bento';
import { Calendar } from 'lucide-react';
import { DailyLog, addDaysIST, diffDaysIST, todayIST } from '@winter-arc/shared';

interface HeatmapCardProps {
  planStartDate: string;
  planLengthDays: number;
  logsByDate: Map<string, DailyLog>;
  loading?: boolean;
}

export function HeatmapCard({
  planStartDate,
  planLengthDays = 90,
  logsByDate,
  loading = false,
}: HeatmapCardProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    dayNum: number;
    log?: DailyLog;
  } | null>(null);

  const today = todayIST();

  // Generate 90 days from planStartDate
  const days: Array<{
    date: string;
    dayNum: number;
    log?: DailyLog;
    intensity: number;
    isPastOrToday: boolean;
  }> = [];

  for (let i = 0; i < planLengthDays; i++) {
    const dStr = addDaysIST(planStartDate, i);
    const log = logsByDate.get(dStr);
    const isPastOrToday = diffDaysIST(dStr, today) >= 0;

    let intensity = 0;
    if (log) {
      if (log.floorMet) {
        // Floor met
        intensity = 2;
        // Check for extras
        const problems = log.overrides?.problems ?? 0;
        const applications = log.overrides?.applications ?? 0;
        if (problems >= 4 || applications >= 8) {
          intensity = 4;
        } else if (problems > 2 || applications > 5) {
          intensity = 3;
        }
      } else if (log.submitted) {
        // Submitted but missed floor
        intensity = 1;
      }
    }

    days.push({
      date: dStr,
      dayNum: i + 1,
      log,
      intensity,
      isPastOrToday,
    });
  }

  const getCellColor = (intensity: number, isPastOrToday: boolean) => {
    if (!isPastOrToday) return 'bg-surface-2/30 border-border-token/20';
    switch (intensity) {
      case 1:
        return 'bg-status-warn/25 border-status-warn/40 text-status-warn';
      case 2:
        return 'bg-accent-ice/35 border-accent-ice/50';
      case 3:
        return 'bg-accent-ice/70 border-accent-ice';
      case 4:
        return 'bg-accent-ice border-accent-ice shadow-sm shadow-accent-ice/30';
      default:
        return 'bg-surface-2 border-border-token/40';
    }
  };

  return (
    <BentoCard
      size="H"
      state={loading ? 'loading' : 'default'}
      className="order-11 xl:order-none"
      icon={<Calendar className="h-4 w-4 text-accent-ice" />}
      title="90-Day Arc Heatmap"
      action={
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-surface-2 border border-border-token/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-status-warn/25 border border-status-warn/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-ice/35 border border-accent-ice/50" />
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-ice/70 border border-accent-ice" />
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-ice border border-accent-ice shadow-sm" />
          <span>More</span>
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        {/* Heatmap Grid (13 cols x 7 rows roughly for 90 days) */}
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
            {days.map((item) => {
              const isToday = item.date === today;
              return (
                <div
                  key={item.date}
                  onMouseEnter={() => setHoveredDay(item)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer ${getCellColor(
                    item.intensity,
                    item.isPastOrToday,
                  )} ${isToday ? 'ring-1 ring-accent-ice' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* Hover Tooltip Details */}
        <div className="text-[11px] font-mono text-muted flex items-center justify-between border-t border-border-token/50 pt-1.5 min-h-[22px]">
          {hoveredDay ? (
            <div className="flex items-center gap-2">
              <span className="text-text font-bold">
                Day {hoveredDay.dayNum} ({hoveredDay.date}):
              </span>
              {hoveredDay.log ? (
                hoveredDay.log.floorMet ? (
                  <span className="text-status-success font-semibold">
                    Floor Met • {hoveredDay.log.overrides?.problems ?? 0} problems,{' '}
                    {hoveredDay.log.overrides?.applications ?? 0} applications
                  </span>
                ) : (
                  <span className="text-status-warn font-semibold">
                    Floor Missed ({hoveredDay.log.submitted ? 'Closed' : 'Draft'})
                  </span>
                )
              ) : (
                <span>No log recorded</span>
              )}
            </div>
          ) : (
            <span className="text-muted/70">
              Hover over a day block to view detailed metrics and intensity.
            </span>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
