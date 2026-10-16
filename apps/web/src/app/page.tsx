'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useDoc, useCollection, setDocument } from '@/lib/data';
import {
  Settings,
  SettingsSchema,
  DailyLog,
  DailyLogSchema,
  Problem,
  ProblemSchema,
  Application,
  ApplicationSchema,
  Mock,
  MockSchema,
  Job,
  JobSchema,
  Roadmap,
  RoadmapSchema,
  Mistake,
  MistakeSchema,
  ScraperRun,
  ScraperRunSchema,
  createDefaultSettings,
  todayIST,
  nowHourIST,
  getPlanDayNumberIST,
  calculateDailyCounters,
  evaluateFloorMet,
  calculateStreak,
  weekStartMondayIST,
} from '@winter-arc/shared';
import { BentoGrid } from '@/components/bento';

import { HeroCard } from '@/components/dashboard/hero-card';
import { StreakCard } from '@/components/dashboard/streak-card';
import { FloorRingsCard } from '@/components/dashboard/floor-rings-card';
import { HoursCard } from '@/components/dashboard/hours-card';
import { RevisionsDueCard } from '@/components/dashboard/revisions-due-card';
import { ChecklistCard } from '@/components/dashboard/checklist-card';
import { HeatmapCard } from '@/components/dashboard/heatmap-card';
import { WeekGlanceCard } from '@/components/dashboard/week-glance-card';
import { MocksCard } from '@/components/dashboard/mocks-card';
import { JobPreviewCard } from '@/components/dashboard/job-preview-card';
import { PatternCoverageCard } from '@/components/dashboard/pattern-coverage-card';
import { PipelineFunnelCard } from '@/components/dashboard/pipeline-funnel-card';
import { RoadmapCard } from '@/components/dashboard/roadmap-card';
import { MistakeCard } from '@/components/dashboard/mistake-card';
import { TrendsCard } from '@/components/dashboard/trends-card';
import { ScraperHealthCard } from '@/components/dashboard/scraper-health-card';

export default function DashboardPage() {
  const { user } = useAuth();
  const today = todayIST();
  const currentHour = nowHourIST();

  // 1. Live Data Subscriptions
  const { data: remoteSettings, loading: loadingSettings } = useDoc<Settings>(
    'settings',
    'main',
    SettingsSchema,
  );
  const settings = remoteSettings || createDefaultSettings(today);

  const { data: allLogs, loading: loadingLogs } = useCollection<DailyLog>(
    'dailyLogs',
    DailyLogSchema,
  );
  const { data: todayLog, loading: loadingTodayLog } = useDoc<DailyLog>(
    'dailyLogs',
    today,
    DailyLogSchema,
  );

  const { data: allProblems, loading: loadingProblems } = useCollection<Problem>(
    'problems',
    ProblemSchema,
  );
  const { data: allApplications, loading: loadingApplications } = useCollection<Application>(
    'applications',
    ApplicationSchema,
  );
  const { data: allMocks, loading: loadingMocks } = useCollection<Mock>('mocks', MockSchema);
  const { data: allJobs, loading: loadingJobs } = useCollection<Job>('jobs', JobSchema);
  const { data: roadmap, loading: loadingRoadmap } = useDoc<Roadmap>(
    'roadmap',
    'main',
    RoadmapSchema,
  );
  const { data: allMistakes, loading: loadingMistakes } = useCollection<Mistake>(
    'mistakes',
    MistakeSchema,
  );
  const { data: allRuns, loading: loadingRuns } = useCollection<ScraperRun>(
    'scraperRuns',
    ScraperRunSchema,
  );

  // Map of date -> DailyLog
  const logsByDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    if (allLogs) {
      for (const log of allLogs) {
        map.set(log.date, log);
      }
    }
    return map;
  }, [allLogs]);

  // Streak Calculation
  const streakResult = useMemo(() => {
    return calculateStreak(allLogs || [], today);
  }, [allLogs, today]);

  // Today's Counters & Floor Evaluation
  const dailyCounters = useMemo(() => {
    return calculateDailyCounters(today, {
      problems: allProblems || [],
      applications: allApplications || [],
      mocks: allMocks || [],
      overrides: todayLog?.overrides,
    });
  }, [today, allProblems, allApplications, allMocks, todayLog?.overrides]);

  const floorEvaluation = useMemo(() => {
    return evaluateFloorMet(
      dailyCounters,
      settings.floor,
      todayLog?.dueRevisionsAtStart || 0,
      todayLog?.submitted || false,
    );
  }, [dailyCounters, settings.floor, todayLog?.dueRevisionsAtStart, todayLog?.submitted]);

  // Revisions Due Count Today
  const dueRevisionsCount = useMemo(() => {
    if (!allProblems) return 0;
    return allProblems.filter(
      (p) =>
        p.revision && !p.revision.mastered && p.revision.nextDue && p.revision.nextDue <= today,
    ).length;
  }, [allProblems, today]);

  // Weekly Stats (Monday to Sunday)
  const weekStart = weekStartMondayIST(today);
  const problemsThisWeek = useMemo(() => {
    if (!allProblems) return 0;
    return allProblems.filter((p) => p.solvedAt >= weekStart && p.solvedAt <= today).length;
  }, [allProblems, weekStart, today]);

  const applicationsThisWeek = useMemo(() => {
    if (!allApplications) return 0;
    return allApplications.filter((a) => a.appliedDate >= weekStart && a.appliedDate <= today)
      .length;
  }, [allApplications, weekStart, today]);

  const mocksThisWeek = useMemo(() => {
    if (!allMocks) return 0;
    return allMocks.filter((m) => m.date >= weekStart && m.date <= today).length;
  }, [allMocks, weekStart, today]);

  // Plan Day Calculation
  const planDay = useMemo(() => {
    return getPlanDayNumberIST(settings.planStartDate, today);
  }, [settings.planStartDate, today]);

  // Schedule Block Checklist Toggle from Dashboard
  const handleToggleBlock = async (blockId: string) => {
    if (!user?.uid) return;
    const currentChecklist = todayLog?.checklist || {};
    const nextChecklist = {
      ...currentChecklist,
      [blockId]: !currentChecklist[blockId],
    };

    const updatedLog: DailyLog = todayLog
      ? { ...todayLog, checklist: nextChecklist }
      : {
          date: today,
          wakeTime: '06:00',
          sleepTime: '22:45',
          sleepHours: 7.25,
          startupHours: 0,
          gymDone: false,
          gymHours: 0,
          energy: 3,
          win: '',
          wentWrong: '',
          tomorrowTop3: ['', '', ''],
          notes: '',
          overrides: {},
          dueRevisionsAtStart: dueRevisionsCount,
          floorMet: false,
          submitted: false,
          submittedAt: null,
          checklist: nextChecklist,
        };

    await setDocument(user.uid, 'dailyLogs', today, updatedLog, DailyLogSchema);
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-12">
      <BentoGrid>
        {/* ROW 1: Hero (H 8x1) & Streak (M 4x1) */}
        <HeroCard
          ownerName={user?.displayName || 'Sanjay'}
          planDay={planDay}
          planLengthDays={settings.planLengthDays}
          currentHourIST={currentHour}
          floorEvaluation={floorEvaluation}
          problemsCount={dailyCounters.problems}
          revisionsCount={dailyCounters.revisions}
          applicationsCount={dailyCounters.applications}
          floorProblems={settings.floor.problems}
          floorRevisions={todayLog?.dueRevisionsAtStart === 0 ? 0 : settings.floor.revisions}
          floorApplications={settings.floor.applications}
          loading={loadingSettings || loadingTodayLog}
        />

        <StreakCard streak={streakResult} loading={loadingLogs} />

        {/* ROW 2: Floor Rings (M 4x1) | Hours Today (M 4x1) | Revisions Due (M 4x1) */}
        <FloorRingsCard
          floor={settings.floor}
          problems={dailyCounters.problems}
          revisions={dailyCounters.revisions}
          applications={dailyCounters.applications}
          dueRevisionsAtStart={todayLog?.dueRevisionsAtStart || 0}
          loading={loadingSettings || loadingTodayLog}
        />

        <HoursCard
          startupHours={todayLog?.startupHours || 0}
          gymHours={todayLog?.gymHours || 0}
          gymDone={todayLog?.gymDone || false}
          targets={settings.targets}
          loading={loadingSettings || loadingTodayLog}
        />

        <RevisionsDueCard dueCount={dueRevisionsCount} loading={loadingProblems} />

        {/* ROWS 3-4: Today's Checklist (L 4x2) | 90-Day Heatmap (H 8x1) + Week at a Glance (M 4x1) + Mocks (M 4x1) */}
        <ChecklistCard
          scheduleBlocks={settings.scheduleBlocks}
          completedMap={todayLog?.checklist || {}}
          onToggleBlock={handleToggleBlock}
          loading={loadingSettings || loadingTodayLog}
        />

        <HeatmapCard
          planStartDate={settings.planStartDate}
          planLengthDays={settings.planLengthDays}
          logsByDate={logsByDate}
          loading={loadingSettings || loadingLogs}
        />

        <WeekGlanceCard
          problemsThisWeek={problemsThisWeek}
          applicationsThisWeek={applicationsThisWeek}
          mocksThisWeek={mocksThisWeek}
          floor={settings.floor}
          targets={settings.targets}
          loading={loadingSettings || loadingProblems || loadingApplications}
        />

        <MocksCard mocks={allMocks || []} loading={loadingMocks} />

        {/* ROWS 5-6: Job Feed Preview (L 4x2) | Pattern Coverage (XL 8x2) */}
        <JobPreviewCard jobs={allJobs || []} loading={loadingJobs} />

        <PatternCoverageCard
          patternTargets={settings.patternTargets}
          problems={allProblems || []}
          loading={loadingSettings || loadingProblems}
        />

        {/* ROW 7: Pipeline Funnel (M 4x1) | Roadmap Milestone (M 4x1) | Mistake to Review (M 4x1) */}
        <PipelineFunnelCard applications={allApplications || []} loading={loadingApplications} />

        <RoadmapCard roadmap={roadmap} planDay={planDay} loading={loadingRoadmap} />

        <MistakeCard mistakes={allMistakes || []} loading={loadingMistakes} />

        {/* ROW 8: Energy & Sleep Trend (W 6x1) | Scraper Health (W 6x1) */}
        <TrendsCard logsByDate={logsByDate} loading={loadingLogs} />

        <ScraperHealthCard runs={allRuns || []} loading={loadingRuns} />
      </BentoGrid>
    </div>
  );
}
