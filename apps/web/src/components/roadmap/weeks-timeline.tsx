'use client';

import React, { useState } from 'react';
import { RoadmapWeek } from '@winter-arc/shared';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface WeeksTimelineProps {
  weeks: RoadmapWeek[];
  currentWeekNum: number;
  onToggleGoal: (weekIndex: number, goalId: string) => void;
  onAddGoal: (weekIndex: number, text: string) => void;
  onDeleteGoal: (weekIndex: number, goalId: string) => void;
  onEditTheme: (weekIndex: number, theme: string) => void;
}

export const WeeksTimeline: React.FC<WeeksTimelineProps> = ({
  weeks,
  currentWeekNum,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onEditTheme,
}) => {
  // Track expanded weeks; current week starts expanded
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    [currentWeekNum]: true,
  });

  // State for new goal inputs per week
  const [newGoalTexts, setNewGoalTexts] = useState<Record<number, string>>({});

  // Editing week theme
  const [editingThemeWeek, setEditingThemeWeek] = useState<number | null>(null);
  const [themeInput, setThemeInput] = useState('');

  const toggleExpand = (n: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [n]: !prev[n],
    }));
  };

  const handleAddGoalSubmit = (weekIndex: number, weekNum: number) => {
    const text = (newGoalTexts[weekNum] || '').trim();
    if (!text) return;
    onAddGoal(weekIndex, text);
    setNewGoalTexts((prev) => ({ ...prev, [weekNum]: '' }));
  };

  const handleStartThemeEdit = (weekNum: number, currentTheme: string) => {
    setEditingThemeWeek(weekNum);
    setThemeInput(currentTheme);
  };

  const handleSaveTheme = (weekIndex: number) => {
    if (themeInput.trim()) {
      onEditTheme(weekIndex, themeInput.trim());
    }
    setEditingThemeWeek(null);
  };

  // Calculate overall progress across all 12 weeks
  let totalGoals = 0;
  let totalCompleted = 0;
  for (const w of weeks) {
    for (const g of w.goals) {
      totalGoals++;
      if (g.done) totalCompleted++;
    }
  }
  const overallPercent = totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress Banner */}
      <div className="rounded-bento border border-border-token bg-surface p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
              <Calendar className="h-3.5 w-3.5 text-accent-ice" /> 12-Week Execution Progress
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-text">
                {totalCompleted} of {totalGoals}
              </span>
              <span className="text-xs font-mono text-muted">milestone goals completed</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-accent-ice">
                {overallPercent}%
              </div>
              <div className="text-[10px] font-mono text-muted">Curriculum Done</div>
            </div>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full rounded-full bg-surface-2 overflow-hidden border border-border-token">
          <div
            className="h-full bg-accent-ice transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* 12-Week List */}
      <div className="space-y-3">
        {weeks.map((week, idx) => {
          const isCurrent = week.n === currentWeekNum;
          const isExpanded = Boolean(expandedWeeks[week.n]);
          const weekDoneCount = week.goals.filter((g) => g.done).length;
          const weekTotal = week.goals.length;
          const weekPercent = weekTotal > 0 ? Math.round((weekDoneCount / weekTotal) * 100) : 0;

          return (
            <div
              key={week.n}
              className={`rounded-bento border transition-all duration-150 ${
                isCurrent
                  ? 'border-accent-ice/50 bg-surface shadow-sm ring-1 ring-accent-ice/20'
                  : 'border-border-token bg-surface/80'
              }`}
            >
              {/* Week Header */}
              <div
                onClick={() => toggleExpand(week.n)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-surface-2/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <button type="button" className="mt-0.5 sm:mt-0 p-1 text-muted hover:text-text">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-sm text-text">
                        Week {week.n}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-accent-ice/15 text-accent-ice border border-accent-ice/30">
                          <Sparkles className="h-2.5 w-2.5" /> Current Week
                        </span>
                      )}
                      <span className="text-xs font-mono text-muted">
                        ({weekDoneCount}/{weekTotal} goals)
                      </span>
                    </div>

                    {/* Week Theme */}
                    {editingThemeWeek === week.n ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 flex items-center gap-2 max-w-xl"
                      >
                        <input
                          type="text"
                          value={themeInput}
                          onChange={(e) => setThemeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTheme(idx);
                          }}
                          className="flex-1 rounded border border-border-token bg-surface-2 px-2.5 py-1 text-xs text-text focus:border-accent-ice focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTheme(idx)}
                          className="rounded bg-accent-ice px-2.5 py-1 text-xs font-mono text-bg font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-muted font-sans flex items-center gap-1.5 group">
                        <span className="truncate">{week.theme}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartThemeEdit(week.n, week.theme);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent-ice transition-opacity p-0.5"
                          title="Edit Theme"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Badges */}
                <div className="flex items-center gap-3 pl-8 sm:pl-0 flex-shrink-0">
                  <div className="w-24 h-2 rounded-full bg-surface-2 overflow-hidden border border-border-token">
                    <div
                      className={`h-full transition-all ${
                        weekPercent === 100 ? 'bg-status-success' : 'bg-accent-ice'
                      }`}
                      style={{ width: `${weekPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-text font-semibold w-9 text-right">
                    {weekPercent}%
                  </span>
                </div>
              </div>

              {/* Expanded Goals */}
              {isExpanded && (
                <div className="border-t border-border-token p-4 space-y-3 bg-surface-2/30">
                  <div className="space-y-2">
                    {week.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border-token bg-surface p-2.5 transition-colors hover:border-accent-ice/30 group"
                      >
                        <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleGoal(idx, goal.id)}
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              goal.done
                                ? 'bg-status-success border-status-success text-bg'
                                : 'border-border-token bg-surface hover:border-accent-ice'
                            }`}
                          >
                            {goal.done && <Check className="h-3 w-3" />}
                          </button>
                          <span
                            className={`text-xs ${
                              goal.done ? 'line-through text-muted' : 'text-text font-medium'
                            }`}
                          >
                            {goal.text}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => onDeleteGoal(idx, goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-status-danger p-1 transition-opacity"
                          title="Delete goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Goal Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newGoalTexts[week.n] || ''}
                      onChange={(e) =>
                        setNewGoalTexts((prev) => ({
                          ...prev,
                          [week.n]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGoalSubmit(idx, week.n);
                        }
                      }}
                      placeholder={`Add a goal to Week ${week.n}...`}
                      className="flex-1 rounded-md border border-border-token bg-surface px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGoalSubmit(idx, week.n)}
                      className="inline-flex items-center gap-1 rounded-md bg-surface-2 border border-border-token px-3 py-1.5 text-xs font-mono text-text hover:bg-surface hover:border-accent-ice transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
