'use client';

import React from 'react';
import { weekStartMondayIST, addDaysIST, getPlanDayNumberIST, todayIST } from '@winter-arc/shared';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekPickerProps {
  selectedWeekStart: string; // YYYY-MM-DD (Monday)
  onSelectWeekStart: (weekStart: string) => void;
  planStartDate: string;
}

export const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeekStart,
  onSelectWeekStart,
  planStartDate,
}) => {
  const currentWeekMonday = weekStartMondayIST(todayIST());
  const selectedSunday = addDaysIST(selectedWeekStart, 6);

  // Derive which week of 12 this is
  const planDay = getPlanDayNumberIST(planStartDate || todayIST(), selectedWeekStart);
  const weekNum = Math.ceil(planDay / 7);

  const handlePrevWeek = () => {
    onSelectWeekStart(addDaysIST(selectedWeekStart, -7));
  };

  const handleNextWeek = () => {
    onSelectWeekStart(addDaysIST(selectedWeekStart, 7));
  };

  const handleJumpToCurrent = () => {
    onSelectWeekStart(currentWeekMonday);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-bento border border-border-token bg-surface p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevWeek}
          className="rounded-md border border-border-token bg-surface-2 p-1.5 text-muted hover:text-text hover:bg-surface transition-colors"
          title="Previous Week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 px-1">
          <Calendar className="h-4 w-4 text-accent-ice" />
          <div>
            <div className="font-display font-bold text-sm text-text">
              {weekNum > 0 && weekNum <= 12 ? `Week ${weekNum}` : 'Selected Week'}
              <span className="font-mono text-xs font-normal text-muted ml-2">
                ({selectedWeekStart} to {selectedSunday})
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextWeek}
          className="rounded-md border border-border-token bg-surface-2 p-1.5 text-muted hover:text-text hover:bg-surface transition-colors"
          title="Next Week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {selectedWeekStart !== currentWeekMonday && (
        <button
          type="button"
          onClick={handleJumpToCurrent}
          className="rounded bg-accent-ice/15 border border-accent-ice/30 px-2.5 py-1 text-xs font-mono text-accent-ice hover:bg-accent-ice/25 transition-colors"
        >
          Jump to This Week
        </button>
      )}
    </div>
  );
};
