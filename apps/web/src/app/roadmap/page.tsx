'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useDoc } from '@/lib/data/use-doc';
import {
  Roadmap,
  RoadmapSchema,
  Settings,
  SettingsSchema,
  createDefaultRoadmap,
  getPlanDayNumberIST,
  todayIST,
  Topic,
} from '@winter-arc/shared';
import { Map, Calendar, Layers } from 'lucide-react';
import { WeeksTimeline } from '@/components/roadmap/weeks-timeline';
import { TopicsBoard } from '@/components/roadmap/topics-board';
import { setDocument } from '@/lib/data/mutations';
import { toast } from '@/components/ui/toast';

export default function RoadmapPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const {
    data: roadmap,
    loading: roadmapLoading,
    error: roadmapError,
  } = useDoc<Roadmap>('roadmap', 'main', RoadmapSchema);

  const { data: settings } = useDoc<Settings>('settings', 'main', SettingsSchema);

  const [activeTab, setActiveTab] = useState<'timeline' | 'topics'>('timeline');

  // Derive current week number (1 - 12)
  const planDay = getPlanDayNumberIST(settings?.planStartDate || todayIST(), todayIST());
  const currentWeekNum = Math.max(1, Math.min(12, Math.ceil(planDay / 7)));

  // Ensure fallback roadmap
  const activeRoadmap = roadmap || createDefaultRoadmap();

  // 1. Goal Mutations
  const handleToggleGoal = async (weekIndex: number, goalId: string) => {
    if (!uid) return;
    const weeks = [...activeRoadmap.weeks];
    const targetWeek = weeks[weekIndex];
    if (!targetWeek) return;

    const updatedGoals = targetWeek.goals.map((g) =>
      g.id === goalId ? { ...g, done: !g.done } : g,
    );
    weeks[weekIndex] = { ...targetWeek, goals: updatedGoals };

    const updated: Roadmap = { ...activeRoadmap, weeks };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (!ok) {
      toast.error('Update Failed', 'Could not toggle goal status.');
    }
  };

  const handleAddGoal = async (weekIndex: number, text: string) => {
    if (!uid) return;
    const weeks = [...activeRoadmap.weeks];
    const targetWeek = weeks[weekIndex];
    if (!targetWeek) return;

    const newGoal = {
      id: `goal-${Date.now()}`,
      text,
      done: false,
    };

    weeks[weekIndex] = {
      ...targetWeek,
      goals: [...targetWeek.goals, newGoal],
    };

    const updated: Roadmap = { ...activeRoadmap, weeks };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (ok) {
      toast.success('Goal Added', `Added to Week ${targetWeek.n}`);
    }
  };

  const handleDeleteGoal = async (weekIndex: number, goalId: string) => {
    if (!uid) return;
    const weeks = [...activeRoadmap.weeks];
    const targetWeek = weeks[weekIndex];
    if (!targetWeek) return;

    weeks[weekIndex] = {
      ...targetWeek,
      goals: targetWeek.goals.filter((g) => g.id !== goalId),
    };

    const updated: Roadmap = { ...activeRoadmap, weeks };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (ok) {
      toast.success('Goal Removed', 'Milestone goal deleted.');
    }
  };

  const handleEditTheme = async (weekIndex: number, theme: string) => {
    if (!uid) return;
    const weeks = [...activeRoadmap.weeks];
    const targetWeek = weeks[weekIndex];
    if (!targetWeek) return;

    weeks[weekIndex] = { ...targetWeek, theme };
    const updated: Roadmap = { ...activeRoadmap, weeks };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (ok) {
      toast.success('Theme Updated', `Week ${targetWeek.n} updated.`);
    }
  };

  // 2. Topic Mutations
  const handleUpdateTopicStatus = async (topicId: string, status: Topic['status']) => {
    if (!uid) return;
    const topics = activeRoadmap.topics.map((t) => (t.id === topicId ? { ...t, status } : t));
    const updated: Roadmap = { ...activeRoadmap, topics };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (!ok) {
      toast.error('Update Failed', 'Could not update topic status.');
    }
  };

  const handleAddTopic = async (group: string, text: string) => {
    if (!uid) return;
    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      group,
      text,
      status: 'todo',
    };
    const topics = [...activeRoadmap.topics, newTopic];
    const updated: Roadmap = { ...activeRoadmap, topics };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (ok) {
      toast.success('Topic Added', `Added to ${group}`);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!uid) return;
    const topics = activeRoadmap.topics.filter((t) => t.id !== topicId);
    const updated: Roadmap = { ...activeRoadmap, topics };
    const ok = await setDocument(uid, 'roadmap', 'main', updated, RoadmapSchema);
    if (ok) {
      toast.success('Topic Removed', 'Topic deleted from board.');
    }
  };

  if (roadmapLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="h-32 animate-pulse rounded-bento bg-surface" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-bento bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (roadmapError) {
    return (
      <div className="rounded-bento border border-status-danger/30 bg-status-danger/10 p-6 text-center text-status-danger">
        <p className="font-semibold">Failed to load syllabus roadmap.</p>
        <p className="text-xs text-muted mt-1">{roadmapError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <Map className="h-4 w-4" /> 90-Day Execution Trajectory
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
            Syllabus Roadmap
          </h1>
          <p className="text-sm text-muted mt-1">
            12-week milestones, CS fundamentals, and LLD / System Design competency boards.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center rounded-md border border-border-token bg-surface p-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono transition-colors ${
              activeTab === 'timeline'
                ? 'bg-accent-ice text-bg font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> 12-Week Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono transition-colors ${
              activeTab === 'topics'
                ? 'bg-accent-ice text-bg font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Topics Board
          </button>
        </div>
      </div>

      {/* Main View */}
      {activeTab === 'timeline' ? (
        <WeeksTimeline
          weeks={activeRoadmap.weeks}
          currentWeekNum={currentWeekNum}
          onToggleGoal={handleToggleGoal}
          onAddGoal={handleAddGoal}
          onDeleteGoal={handleDeleteGoal}
          onEditTheme={handleEditTheme}
        />
      ) : (
        <TopicsBoard
          topics={activeRoadmap.topics}
          onUpdateTopicStatus={handleUpdateTopicStatus}
          onAddTopic={handleAddTopic}
          onDeleteTopic={handleDeleteTopic}
        />
      )}
    </div>
  );
}
