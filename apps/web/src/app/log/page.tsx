'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  createDefaultSettings,
  todayIST,
  calculateSleepHours,
  calculateDailyCounters,
  evaluateFloorMet,
  calculateStreak,
  Overrides,
} from '@winter-arc/shared';
import {
  Clock,
  Flame,
  CheckCircle2,
  Moon,
  Laptop,
  Dumbbell,
  Zap,
  Trophy,
  AlertCircle,
  ListTodo,
  FileText,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { DateSelector } from '@/components/log/date-selector';
import { TopCountersStrip } from '@/components/log/top-counters-strip';
import { CloseDayModal } from '@/components/log/close-day-modal';
import { serverTimestamp } from 'firebase/firestore';

const ENERGY_LEVELS = [
  { level: 1, label: 'Exhausted', icon: '😫' },
  { level: 2, label: 'Low', icon: '🥱' },
  { level: 3, label: 'Steady', icon: '😐' },
  { level: 4, label: 'High', icon: '⚡' },
  { level: 5, label: 'Peak Arc', icon: '🔥' },
];

export default function LogPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(todayIST());

  // 1. Load Settings
  const { data: remoteSettings, loading: loadingSettings } = useDoc<Settings>(
    'settings',
    'main',
    SettingsSchema,
  );
  const settings = remoteSettings || createDefaultSettings(todayIST());

  // 2. Load Raw Records for Date Derivations
  const { data: allProblems } = useCollection<Problem>('problems', ProblemSchema);
  const { data: allApplications } = useCollection<Application>('applications', ApplicationSchema);
  const { data: allMocks } = useCollection<Mock>('mocks', MockSchema);
  const { data: allLogs } = useCollection<DailyLog>('dailyLogs', DailyLogSchema);

  // Map of date -> DailyLog for quick lookup and streak calculations
  const logsByDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    if (allLogs) {
      for (const log of allLogs) {
        map.set(log.date, log);
      }
    }
    return map;
  }, [allLogs]);

  // Current Streak Calculation
  const streakResult = useMemo(() => {
    return calculateStreak(allLogs || [], todayIST());
  }, [allLogs]);

  // 3. Load Active Daily Log Doc for selectedDate
  const {
    data: activeRemoteLog,
    loading: loadingLog,
    exists: logExists,
  } = useDoc<DailyLog>('dailyLogs', selectedDate, DailyLogSchema);

  // Form State
  const [formData, setFormData] = useState<DailyLog>({
    date: selectedDate,
    wakeTime: '06:00',
    sleepTime: '22:45',
    sleepHours: 7.25,
    startupHours: 4.0,
    gymDone: true,
    gymHours: 2.0,
    energy: 4,
    win: '',
    wentWrong: '',
    tomorrowTop3: ['', '', ''],
    notes: '',
    overrides: {},
    dueRevisionsAtStart: 0,
    floorMet: false,
    submitted: false,
    submittedAt: null,
    checklist: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  // Ref to track initial load to avoid premature autosave
  const isInitialMount = useRef(true);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync form state when selectedDate or activeRemoteLog changes
  useEffect(() => {
    isInitialMount.current = true;
    if (activeRemoteLog) {
      setFormData(activeRemoteLog);
    } else {
      // Initialize fresh day form
      const calculatedSleep = calculateSleepHours('22:45', '06:00');
      // Capture dueRevisionsAtStart from problem queue if available
      let dueRevisions = 0;
      if (allProblems) {
        dueRevisions = allProblems.filter(
          (p) =>
            p.revision &&
            !p.revision.mastered &&
            p.revision.nextDue &&
            p.revision.nextDue <= selectedDate,
        ).length;
      }

      setFormData({
        date: selectedDate,
        wakeTime: '06:00',
        sleepTime: '22:45',
        sleepHours: calculatedSleep,
        startupHours: 4.0,
        gymDone: true,
        gymHours: 2.0,
        energy: 4,
        win: '',
        wentWrong: '',
        tomorrowTop3: ['', '', ''],
        notes: '',
        overrides: {},
        dueRevisionsAtStart: dueRevisions,
        floorMet: false,
        submitted: false,
        submittedAt: null,
        checklist: {},
      });
    }

    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedDate, activeRemoteLog, allProblems]);

  // Derive Daily Counters for selectedDate
  const dailyCounters = useMemo(() => {
    return calculateDailyCounters(selectedDate, {
      problems: allProblems || [],
      applications: allApplications || [],
      mocks: allMocks || [],
      overrides: formData.overrides,
    });
  }, [selectedDate, allProblems, allApplications, allMocks, formData.overrides]);

  // Live Floor Met Evaluation
  const floorEvaluation = useMemo(() => {
    return evaluateFloorMet(
      dailyCounters,
      settings.floor,
      formData.dueRevisionsAtStart,
      formData.submitted,
    );
  }, [dailyCounters, settings.floor, formData.dueRevisionsAtStart, formData.submitted]);

  // Recalculate sleepHours whenever sleepTime or wakeTime changes
  const handleSleepChange = (sleep: string, wake: string) => {
    const hours = calculateSleepHours(sleep, wake);
    setFormData((prev) => ({
      ...prev,
      sleepTime: sleep,
      wakeTime: wake,
      sleepHours: hours,
    }));
  };

  // Debounced Autosave Effect
  useEffect(() => {
    if (isInitialMount.current || !user?.uid) return;

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await setDocument(
          user.uid,
          'dailyLogs',
          selectedDate,
          {
            ...formData,
            floorMet: floorEvaluation.floorMet,
          },
          DailyLogSchema,
        );
        const now = new Date();
        setLastSavedAt(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        );
      } catch (err) {
        console.error('[Autosave Error]:', err);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [formData, user?.uid, selectedDate, floorEvaluation.floorMet]);

  // Handle Override Updates
  const handleUpdateOverride = (key: keyof Overrides, value: number | undefined) => {
    setFormData((prev) => {
      const nextOverrides = { ...prev.overrides };
      if (value === undefined) {
        delete nextOverrides[key];
      } else {
        nextOverrides[key] = value;
      }
      return {
        ...prev,
        overrides: nextOverrides,
      };
    });
  };

  // Handle Checklist Item Toggle
  const handleToggleChecklist = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [blockId]: !prev.checklist[blockId],
      },
    }));
  };

  // "Close the Day" Submission
  const handleCloseDay = async (forceAnyway: boolean = false) => {
    if (!user?.uid) return;

    // Check floor
    const evaluation = evaluateFloorMet(
      dailyCounters,
      settings.floor,
      formData.dueRevisionsAtStart,
      true, // pretend submitted to see if all conditions hold
    );

    if (!evaluation.floorMet && !forceAnyway) {
      // Open modal with missing checklist
      setCloseModalOpen(true);
      return;
    }

    setIsSaving(true);
    const updatedLog: DailyLog = {
      ...formData,
      submitted: true,
      submittedAt: serverTimestamp(),
      floorMet: evaluation.floorMet,
    };

    const success = await setDocument(
      user.uid,
      'dailyLogs',
      selectedDate,
      updatedLog,
      DailyLogSchema,
    );

    setIsSaving(false);

    if (success) {
      setFormData(updatedLog);
      setCloseModalOpen(true);
      if (evaluation.floorMet) {
        toast.success('Day Closed! 🔥', `Daily floor achieved for ${selectedDate}.`);
      } else {
        toast.warn('Day Closed with Missing Floor', `Streak broken for ${selectedDate}.`);
      }
    }
  };

  if (loadingSettings || (loadingLog && !logExists)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-ice" />
        <span className="font-mono text-xs text-muted">Loading daily log...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-token pb-4">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" /> Rapid Daily Logging (&lt;60s)
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text mt-0.5">
            Log Command
          </h1>
        </div>

        {/* Status & Autosave Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {isSaving ? (
                <span className="flex items-center gap-1 text-accent-ice animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              ) : lastSavedAt ? (
                <span className="flex items-center gap-1 text-status-success">
                  <CheckCircle2 className="h-3 w-3" /> Autosaved {lastSavedAt}
                </span>
              ) : (
                <span className="text-muted">Draft ready</span>
              )}
            </div>
            <span className="text-[10px] font-mono text-muted">
              {formData.submitted ? 'Closed & Evaluated' : 'Open Draft'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleCloseDay(false)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-burgundy text-white font-mono text-xs font-bold hover:bg-accent-burgundy-glow transition-all shadow-burgundy active:scale-95"
          >
            <Flame className="h-3.5 w-3.5 text-white" />
            Close the Day
          </button>
        </div>
      </div>

      {/* 1. Date Selector Strip */}
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        logsByDate={logsByDate}
      />

      {/* 2. Top Metric Counters Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Auto-Derived Activity Counters</span>
          <span className="text-[10px] font-mono">Tap pencil to override</span>
        </div>
        <TopCountersStrip
          counters={dailyCounters}
          floor={settings.floor}
          dueRevisionsAtStart={formData.dueRevisionsAtStart}
          overrides={formData.overrides}
          onUpdateOverride={handleUpdateOverride}
        />
      </div>

      {/* 3. Core Daily Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep & Wake Times */}
        <div className="bg-surface border border-border-token rounded-bento p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
              <Moon className="h-4 w-4 text-accent-indigo" /> Sleep & Recovery
            </span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-accent-indigo/10 text-accent-indigo">
              {formData.sleepHours} hrs sleep
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-muted block mb-1">
                Sleep Time (Prev Night)
              </label>
              <input
                type="time"
                value={formData.sleepTime}
                onChange={(e) => handleSleepChange(e.target.value, formData.wakeTime)}
                className="w-full bg-surface-2 border border-border-token rounded-lg px-2.5 py-1.5 text-sm font-mono text-text focus:outline-none focus:border-accent-ice"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted block mb-1">
                Wake Time (Today)
              </label>
              <input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => handleSleepChange(formData.sleepTime, e.target.value)}
                className="w-full bg-surface-2 border border-border-token rounded-lg px-2.5 py-1.5 text-sm font-mono text-text focus:outline-none focus:border-accent-ice"
              />
            </div>
          </div>
        </div>

        {/* Startup & Gym Hours */}
        <div className="bg-surface border border-border-token rounded-bento p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
              <Laptop className="h-4 w-4 text-accent-ice" /> Work & Fitness
            </span>
            <span className="font-mono text-[10px] text-muted">
              Target: {settings.targets.startupHours}h startup | {settings.targets.gymHours}h gym
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Startup Hours Stepper */}
            <div>
              <label className="text-[10px] font-mono text-muted block mb-1">Startup Hours</label>
              <div className="flex items-center border border-border-token rounded-lg bg-surface-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      startupHours: Math.max(0, prev.startupHours - 0.5),
                    }))
                  }
                  className="px-2.5 py-1.5 hover:bg-surface text-muted hover:text-text transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={24}
                  value={formData.startupHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startupHours: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-transparent text-center font-mono text-sm text-text focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      startupHours: prev.startupHours + 0.5,
                    }))
                  }
                  className="px-2.5 py-1.5 hover:bg-surface text-muted hover:text-text transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Gym Done Toggle & Hours */}
            <div>
              <label className="text-[10px] font-mono text-muted block mb-1">Gym Workout</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      gymDone: !prev.gymDone,
                      gymHours: !prev.gymDone ? (prev.gymHours === 0 ? 2.0 : prev.gymHours) : 0,
                    }))
                  }
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1 ${
                    formData.gymDone
                      ? 'bg-status-success/10 border-status-success/30 text-status-success'
                      : 'bg-surface-2 border-border-token text-muted hover:text-text'
                  }`}
                >
                  <Dumbbell className="h-3 w-3" />
                  {formData.gymDone ? 'Done' : 'Rest'}
                </button>
                {formData.gymDone && (
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={6}
                    value={formData.gymHours}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gymHours: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-14 bg-surface-2 border border-border-token rounded-lg px-1.5 py-1.5 text-center font-mono text-xs text-text focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Energy Level Selector */}
      <div className="bg-surface border border-border-token rounded-bento p-4 space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
          <Zap className="h-4 w-4 text-accent-ice" /> Energy & Focus Rating
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ENERGY_LEVELS.map(({ level, label, icon }) => {
            const isSelected = formData.energy === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, energy: level }))}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-accent-ice/10 border-accent-ice text-accent-ice ring-1 ring-accent-ice'
                    : 'bg-surface-2 border-border-token text-muted hover:border-border-token/80 hover:text-text'
                }`}
              >
                <span className="text-xl mb-1">{icon}</span>
                <span className="font-mono text-xs font-bold">{level}</span>
                <span className="text-[10px] font-sans truncate w-full">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Schedule Blocks Checklist */}
      <div className="bg-surface border border-border-token rounded-bento p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
            <ListTodo className="h-4 w-4 text-accent-ice" /> Schedule Blocks Checklist
          </span>
          <span className="font-mono text-[10px] text-muted">
            {Object.values(formData.checklist).filter(Boolean).length} /{' '}
            {settings.scheduleBlocks.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {settings.scheduleBlocks.map((block) => {
            const isChecked = Boolean(formData.checklist[block.id]);
            return (
              <label
                key={block.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer min-h-[44px] ${
                  isChecked
                    ? 'bg-surface-2 border-accent-ice/40 text-text'
                    : 'bg-surface border-border-token text-muted hover:border-border-token/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleChecklist(block.id)}
                  className="w-4 h-4 rounded border-border-token text-accent-ice focus:ring-accent-ice/20 focus:ring-offset-0 bg-surface-2 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted">
                      {block.start} - {block.end}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-2 text-accent-ice border border-border-token">
                      {block.category}
                    </span>
                  </div>
                  <span
                    className={`block text-xs font-medium truncate ${
                      isChecked ? 'line-through text-muted' : 'text-text'
                    }`}
                  >
                    {block.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Win & What Went Wrong (Single-line inputs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border-token rounded-bento p-4 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-status-success font-display">
            <Trophy className="h-4 w-4 text-status-success" /> Win of the Day
          </label>
          <input
            type="text"
            value={formData.win}
            onChange={(e) => setFormData((prev) => ({ ...prev, win: e.target.value }))}
            placeholder="e.g. Solved hard DP problem under 20 mins"
            className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-ice placeholder:text-muted/50"
          />
        </div>

        <div className="bg-surface border border-border-token rounded-bento p-4 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-status-warn font-display">
            <AlertCircle className="h-4 w-4 text-status-warn" /> What Went Wrong
          </label>
          <input
            type="text"
            value={formData.wentWrong}
            onChange={(e) => setFormData((prev) => ({ ...prev, wentWrong: e.target.value }))}
            placeholder="e.g. Wasted 45m on social media after lunch"
            className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-ice placeholder:text-muted/50"
          />
        </div>
      </div>

      {/* 7. Tomorrow's Top 3 Priorities */}
      <div className="bg-surface border border-border-token rounded-bento p-4 space-y-3">
        <label className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
          <Flame className="h-4 w-4 text-accent-ice" /> Tomorrow&apos;s Top 3 Priorities
        </label>
        <div className="space-y-2">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent-ice w-6 text-center">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={formData.tomorrowTop3[idx] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => {
                    const next = [...prev.tomorrowTop3] as [string, string, string];
                    next[idx] = val;
                    return { ...prev, tomorrowTop3: next };
                  });
                }}
                placeholder={`Priority #${idx + 1} for tomorrow`}
                className="flex-1 bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-ice placeholder:text-muted/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 8. Notes */}
      <div className="bg-surface border border-border-token rounded-bento p-4 space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-text font-display">
          <FileText className="h-4 w-4 text-muted" /> Daily Reflection & Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any observations, thoughts, or startup breakthroughs..."
          className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent-ice placeholder:text-muted/50 resize-y"
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-40 bg-surface/90 backdrop-blur-md border border-border-token rounded-bento p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">Floor Status:</span>
          {floorEvaluation.floorMet ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-status-success font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Minimums Met
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-status-warn font-semibold">
              <AlertCircle className="h-3.5 w-3.5" /> {floorEvaluation.missing.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCloseDay(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-ice text-background font-mono text-xs font-bold hover:bg-accent-ice/90 transition-all shadow-md active:scale-95"
          >
            <Flame className="h-4 w-4 text-background" />
            Close the Day
          </button>
        </div>
      </div>

      {/* Close Day Outcome Modal */}
      <CloseDayModal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        evaluation={floorEvaluation}
        streak={streakResult}
        onConfirmCloseAnyway={() => {
          setCloseModalOpen(false);
          void handleCloseDay(true);
        }}
      />
    </div>
  );
}
