'use client';

import React from 'react';
import Link from 'next/link';
import { useDoc } from '@/lib/data';
import { DailyLog, DailyLogSchema, todayIST, nowHourIST } from '@winter-arc/shared';
import { AlertTriangle, Moon, ArrowRight } from 'lucide-react';

export function InAppBanners() {
  const today = todayIST();
  const currentHour = nowHourIST();

  const { data: todayLog } = useDoc<DailyLog>('dailyLogs', today, DailyLogSchema);

  const isFloorMet = Boolean(todayLog?.floorMet);
  const isSubmitted = Boolean(todayLog?.submitted);

  // Banner 1: After 18:00 IST if floor not met
  const showStreakAtRisk = currentHour >= 18 && !isFloorMet;

  // Banner 2: After 21:00 IST if day is not closed
  const showLogOpenReminder = currentHour >= 21 && !isSubmitted;

  if (!showStreakAtRisk && !showLogOpenReminder) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {/* 1. Streak at Risk (After 18:00 IST) */}
      {showStreakAtRisk && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-status-warn/10 border border-status-warn/30 text-status-warn animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0 text-status-warn animate-pulse" />
            <span>
              <strong className="font-bold">Streak at risk:</strong> Today&apos;s minimum floor is
              not yet complete. Complete your daily minimums before midnight.
            </span>
          </div>
          <Link
            href="/log"
            className="flex items-center gap-1 text-xs font-mono font-bold text-status-warn hover:underline shrink-0"
          >
            Review Log <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* 2. Daily Log Reminder (After 21:00 IST) */}
      {showLogOpenReminder && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/30 text-accent-indigo animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <Moon className="h-4 w-4 shrink-0 text-accent-indigo" />
            <span>
              <strong className="font-bold">Daily log open:</strong> Close today&apos;s log before
              sleeping to register your streak.
            </span>
          </div>
          <Link
            href="/log"
            className="flex items-center gap-1 text-xs font-mono font-bold text-accent-indigo hover:underline shrink-0"
          >
            Close Day <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
