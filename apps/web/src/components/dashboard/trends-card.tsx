'use client';

import React from 'react';
import { BentoCard } from '@/components/bento';
import { Activity, Zap, Moon } from 'lucide-react';
import { DailyLog, addDaysIST, todayIST } from '@winter-arc/shared';

interface TrendsCardProps {
  logsByDate: Map<string, DailyLog>;
  loading?: boolean;
}

export function TrendsCard({ logsByDate, loading = false }: TrendsCardProps) {
  const today = todayIST();

  // Last 14 days
  const points: Array<{
    date: string;
    energy: number;
    sleepHours: number;
  }> = [];

  for (let i = 13; i >= 0; i--) {
    const dStr = addDaysIST(today, -i);
    const log = logsByDate.get(dStr);
    points.push({
      date: dStr,
      energy: log?.energy ?? 3, // Default steady
      sleepHours: log?.sleepHours ?? 7,
    });
  }

  // Calculate averages
  const avgEnergy = (points.reduce((sum, p) => sum + p.energy, 0) / points.length).toFixed(1);
  const avgSleep = (points.reduce((sum, p) => sum + p.sleepHours, 0) / points.length).toFixed(1);

  return (
    <BentoCard
      size="W"
      state={loading ? 'loading' : 'default'}
      className="order-15 xl:order-none"
      icon={<Activity className="h-4 w-4 text-accent-ice" />}
      title="Energy & Sleep Trend (14-Day)"
      action={
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-accent-ice font-semibold">
            <Zap className="h-3 w-3" /> Avg {avgEnergy}/5
          </span>
          <span className="flex items-center gap-1 text-accent-indigo font-semibold">
            <Moon className="h-3 w-3" /> Avg {avgSleep}h
          </span>
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        {/* Visual Mini Trend Bars */}
        <div className="grid grid-cols-14 gap-1.5 items-end h-16 pt-2">
          {points.map((p, idx) => {
            const heightPct = Math.round((p.energy / 5) * 100);
            const isToday = idx === points.length - 1;
            return (
              <div
                key={p.date}
                className="flex flex-col items-center gap-1 h-full justify-end group relative"
                title={`${p.date}: Energy ${p.energy}/5, Sleep ${p.sleepHours}h`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday
                      ? 'bg-accent-ice'
                      : p.energy >= 4
                        ? 'bg-accent-ice/70 group-hover:bg-accent-ice'
                        : p.energy <= 2
                          ? 'bg-status-warn/60 group-hover:bg-status-warn'
                          : 'bg-surface-2 group-hover:bg-border-token'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-muted border-t border-border-token/50 pt-1.5 mt-1">
          <span>14 days ago</span>
          <span>Recovery & Focus Equilibrium</span>
          <span className="text-text font-bold">Today</span>
        </div>
      </div>
    </BentoCard>
  );
}
