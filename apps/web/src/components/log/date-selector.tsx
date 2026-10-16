'use client';

import React from 'react';
import { formatDateIST, todayIST, addDaysIST } from '@winter-arc/shared';
import { DailyLog } from '@winter-arc/shared';
import { CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  logsByDate: Map<string, DailyLog>;
}

export function DateSelector({ selectedDate, onSelectDate, logsByDate }: DateSelectorProps) {
  const today = todayIST();

  // Last 7 days: today down to today - 6
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDaysIST(today, -i));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-accent-ice" />
          Editable Days (Last 7 Days)
        </span>
        <span className="font-mono text-[10px]">
          {selectedDate === today ? "Today's Log (Active)" : `Viewing ${selectedDate}`}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {days.map((date) => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const log = logsByDate.get(date);
          const hasDoc = Boolean(log);
          const isSubmitted = Boolean(log?.submitted);
          const isFloorMet = Boolean(log?.floorMet);

          const dayOfWeek = formatDateIST(date, 'EEE');
          const dayMonth = formatDateIST(date, 'd MMM');

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center justify-between p-2.5 rounded-lg border text-center transition-all min-h-[72px] ${
                isSelected
                  ? 'bg-surface-2 border-accent-ice shadow-sm shadow-accent-ice/10 ring-1 ring-accent-ice'
                  : 'bg-surface border-border-token hover:border-border-token/80 hover:bg-surface-2/60'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    isSelected ? 'text-accent-ice' : 'text-muted'
                  }`}
                >
                  {isToday ? 'Today' : dayOfWeek}
                </span>
              </div>

              <span
                className={`text-xs font-bold font-display my-0.5 ${
                  isSelected ? 'text-text' : 'text-text/90'
                }`}
              >
                {dayMonth}
              </span>

              {/* Status Indicator */}
              <div className="mt-1">
                {isSubmitted ? (
                  isFloorMet ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium text-status-success bg-status-success/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Met
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium text-status-warn bg-status-warn/10 px-1.5 py-0.5 rounded">
                      <AlertCircle className="h-2.5 w-2.5" /> Missed
                    </span>
                  )
                ) : hasDoc ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium text-accent-ice bg-accent-ice/10 px-1.5 py-0.5 rounded">
                    <Clock className="h-2.5 w-2.5" /> Draft
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-muted/60">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
