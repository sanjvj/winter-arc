'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useCollection } from '@/lib/data/use-collection';
import { useDoc } from '@/lib/data/use-doc';
import {
  Mock,
  MockSchema,
  Settings,
  SettingsSchema,
  Roadmap,
  RoadmapSchema,
  createDefaultRoadmap,
  getPlanDayNumberIST,
  todayIST,
} from '@winter-arc/shared';
import { Mic, Plus, Filter } from 'lucide-react';
import { MockModal } from '@/components/mocks/mock-modal';
import { MockCard } from '@/components/mocks/mock-card';
import { MockCharts } from '@/components/mocks/mock-charts';
import { setDocument } from '@/lib/data/mutations';
import { toast } from '@/components/ui/toast';

export default function MocksPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const {
    data: mocks,
    loading: mocksLoading,
    error: mocksError,
  } = useCollection<Mock>('mocks', MockSchema);

  const { data: settings } = useDoc<Settings>('settings', 'main', SettingsSchema);
  const { data: roadmap } = useDoc<Roadmap>('roadmap', 'main', RoadmapSchema);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<Mock | null>(null);

  const handleEdit = (mock: Mock) => {
    setEditingMock(mock);
    setIsModalOpen(true);
  };

  const handleAddGoalToRoadmap = async (actionItemText: string) => {
    if (!uid) return;

    const planDay = getPlanDayNumberIST(settings?.planStartDate || todayIST(), todayIST());
    const currentWeekNum = Math.max(1, Math.min(12, Math.ceil(planDay / 7)));

    const currentRoadmap = roadmap || createDefaultRoadmap();
    const weeks = [...(currentRoadmap.weeks || [])];
    let weekIndex = weeks.findIndex((w) => w.n === currentWeekNum);

    if (weekIndex === -1) {
      weeks.push({
        n: currentWeekNum,
        theme: `Week ${currentWeekNum} Execution`,
        goals: [],
      });
      weekIndex = weeks.length - 1;
    }

    const currentWeek = weeks[weekIndex];
    if (!currentWeek) return;

    if (
      currentWeek.goals.some(
        (g) => g.text.toLowerCase().trim() === actionItemText.toLowerCase().trim(),
      )
    ) {
      toast.error('Duplicate Goal', `Goal already exists in Week ${currentWeekNum}.`);
      return;
    }

    const newGoal = {
      id: `goal-${Date.now()}`,
      text: actionItemText,
      done: false,
    };

    const updatedWeek = {
      ...currentWeek,
      goals: [...currentWeek.goals, newGoal],
    };

    weeks[weekIndex] = updatedWeek;

    const ok = await setDocument(
      uid,
      'roadmap',
      'main',
      {
        ...currentRoadmap,
        weeks,
      },
      RoadmapSchema,
    );

    if (ok) {
      toast.success(
        'Added to Roadmap',
        `Goal added to Week ${currentWeekNum}: "${actionItemText}"`,
      );
    }
  };

  const filteredMocks = useMemo(() => {
    if (!mocks) return [];
    const list = selectedType === 'all' ? mocks : mocks.filter((m) => m.type === selectedType);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [mocks, selectedType]);

  if (mocksLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-bento bg-surface" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-bento bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (mocksError) {
    return (
      <div className="rounded-bento border border-status-danger/30 bg-status-danger/10 p-6 text-center text-status-danger">
        <p className="font-semibold">Failed to load mock interviews.</p>
        <p className="text-xs text-muted mt-1">{mocksError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <Mic className="h-4 w-4" /> Technical & Behavioral Defense
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text mt-1">
            Mock Interviews
          </h1>
          <p className="text-sm text-muted mt-1">
            DSA, System Design, LLD, and Behavioral mocks with scoring and actionable feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMock(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-burgundy px-4 py-2 text-xs font-mono font-semibold text-white hover:bg-accent-burgundy-glow transition-all shadow-burgundy self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Log Mock Interview
        </button>
      </div>

      {/* Analytics Charts */}
      {mocks && <MockCharts mocks={mocks} targets={settings?.targets} />}

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-bento border border-border-token bg-surface p-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <Filter className="h-3.5 w-3.5 text-muted" /> Filter by Type:
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-border-token bg-surface-2 px-2.5 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
          >
            <option value="all">All Types ({mocks?.length || 0})</option>
            <option value="dsa">DSA Problem Solving</option>
            <option value="lld">Low-Level Design (LLD)</option>
            <option value="system-design">High-Level System Design</option>
            <option value="behavioral">Behavioral / Leadership</option>
            <option value="full-loop">Full Loop / Onsite Simulation</option>
            <option value="hr">HR / Culture Fit</option>
          </select>
        </div>

        <div className="text-xs font-mono text-muted">
          Showing {filteredMocks.length} mock evaluation{filteredMocks.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Mocks List */}
      <div className="space-y-4">
        {filteredMocks.map((mock) => (
          <MockCard
            key={mock.id || `${mock.date}-${mock.type}`}
            mock={mock}
            onEdit={handleEdit}
            onAddGoal={handleAddGoalToRoadmap}
          />
        ))}

        {filteredMocks.length === 0 && (
          <div className="rounded-bento border border-border-token bg-surface p-12 text-center text-muted">
            <Mic className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
            <p className="text-sm font-medium">No mock interviews found.</p>
            <p className="text-xs text-muted/60 mt-1">
              {selectedType !== 'all'
                ? 'Try changing the type filter above.'
                : 'Log a mock interview to evaluate your technical and behavioral readiness.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <MockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        uid={uid}
        initialMock={editingMock}
      />
    </div>
  );
}
