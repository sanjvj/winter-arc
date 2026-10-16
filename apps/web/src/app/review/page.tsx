'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useDoc } from '@/lib/data/use-doc';
import { useCollection } from '@/lib/data/use-collection';
import {
  DailyLog,
  DailyLogSchema,
  Problem,
  ProblemSchema,
  Application,
  ApplicationSchema,
  Mock,
  MockSchema,
  Mistake,
  MistakeSchema,
  Settings,
  SettingsSchema,
  Roadmap,
  RoadmapSchema,
  WeeklyReview,
  WeeklyReviewSchema,
  weekStartMondayIST,
  addDaysIST,
  todayIST,
  calculateWeeklySummary,
  getPlanDayNumberIST,
} from '@winter-arc/shared';
import { ClipboardCheck, Calendar, Layers } from 'lucide-react';
import { WeekPicker } from '@/components/review/week-picker';
import { WeeklyScorecard } from '@/components/review/weekly-scorecard';
import { HonestReadSection } from '@/components/review/honest-read-section';
import { WeeklyMistakesSection } from '@/components/review/weekly-mistakes-section';
import { WeeklyRoadmapGoals } from '@/components/review/weekly-roadmap-goals';
import { ReflectionsForm } from '@/components/review/reflections-form';
import { MonthView } from '@/components/review/month-view';

export default function ReviewPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(
    weekStartMondayIST(todayIST()),
  );

  // Settings & Roadmap
  const { data: settings, loading: settingsLoading } = useDoc<Settings>(
    'settings',
    'main',
    SettingsSchema,
  );
  const { data: roadmap } = useDoc<Roadmap>('roadmap', 'main', RoadmapSchema);

  // Activity collections
  const { data: dailyLogs, loading: logsLoading } = useCollection<DailyLog>(
    'dailyLogs',
    DailyLogSchema,
  );
  const { data: problems, loading: problemsLoading } = useCollection<Problem>(
    'problems',
    ProblemSchema,
  );
  const { data: applications, loading: appsLoading } = useCollection<Application>(
    'applications',
    ApplicationSchema,
  );
  const { data: mocks, loading: mocksLoading } = useCollection<Mock>('mocks', MockSchema);
  const { data: mistakes, loading: mistakesLoading } = useCollection<Mistake>(
    'mistakes',
    MistakeSchema,
  );

  // Stored weekly review document for selected week
  const { data: currentWeeklyReview } = useDoc<WeeklyReview>(
    'weeklyReviews',
    selectedWeekStart,
    WeeklyReviewSchema,
  );

  const isLoading =
    settingsLoading ||
    logsLoading ||
    problemsLoading ||
    appsLoading ||
    mocksLoading ||
    mistakesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="h-14 animate-pulse rounded-bento bg-surface" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 animate-pulse rounded-bento bg-surface" />
          <div className="h-28 animate-pulse rounded-bento bg-surface" />
        </div>
        <div className="h-64 animate-pulse rounded-bento bg-surface" />
      </div>
    );
  }

  const planStartDate = settings?.planStartDate || todayIST();
  const defaultTargets = settings?.targets || {
    problemsPerDay: 3,
    applicationsPerDay: 5,
    mocksPerWeek: 2,
    startupHours: 4.5,
    gymHours: 2,
    sleepHours: 7,
  };
  const defaultFloor = settings?.floor || {
    problems: 2,
    revisions: 1,
    applications: 5,
    requireLog: true,
  };

  // Derive which week this is
  const planDay = getPlanDayNumberIST(planStartDate, selectedWeekStart);
  const weekNum = Math.max(1, Math.min(12, Math.ceil(planDay / 7)));

  // Generate deterministic summary
  const summary = calculateWeeklySummary({
    weekStart: selectedWeekStart,
    dailyLogs: dailyLogs || [],
    problems: problems || [],
    applications: applications || [],
    mocks: mocks || [],
    targets: defaultTargets,
    floor: defaultFloor,
  });

  // Filter mistakes logged in selected week
  const selectedWeekEnd = addDaysIST(selectedWeekStart, 6);
  const weekMistakes = (mistakes || []).filter(
    (m) => m.date >= selectedWeekStart && m.date <= selectedWeekEnd,
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <ClipboardCheck className="h-4 w-4" /> Weekly Retrospectives
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
            Weekly Review & Honest Read
          </h1>
          <p className="text-sm text-muted mt-1">
            Deterministic weekly performance scorecard, factual audit, and reflection journal.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-border-token bg-surface p-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('week')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono transition-colors ${
              activeTab === 'week'
                ? 'bg-accent-ice text-bg font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Week View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('month')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono transition-colors ${
              activeTab === 'month'
                ? 'bg-accent-ice text-bg font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Month Rollup
          </button>
        </div>
      </div>

      {activeTab === 'week' ? (
        <div className="space-y-6">
          {/* Week Picker */}
          <WeekPicker
            selectedWeekStart={selectedWeekStart}
            onSelectWeekStart={setSelectedWeekStart}
            planStartDate={planStartDate}
          />

          {/* 7-Day Metric Scorecard */}
          <WeeklyScorecard summary={summary} targets={defaultTargets} floor={defaultFloor} />

          {/* Honest Read Rule Engine */}
          <HonestReadSection honestRead={summary.honestRead} />

          {/* Roadmap Goals */}
          <WeeklyRoadmapGoals roadmap={roadmap || null} weekNum={weekNum} />

          {/* Weekly Mistakes */}
          <WeeklyMistakesSection mistakes={weekMistakes} weekStart={selectedWeekStart} uid={uid} />

          {/* Reflection Journal */}
          <ReflectionsForm
            initialReview={currentWeeklyReview || null}
            weekStart={selectedWeekStart}
            uid={uid}
          />
        </div>
      ) : (
        <MonthView
          planStartDate={planStartDate}
          dailyLogs={dailyLogs || []}
          problems={problems || []}
          applications={applications || []}
          mocks={mocks || []}
          targets={defaultTargets}
          floor={defaultFloor}
        />
      )}
    </div>
  );
}
