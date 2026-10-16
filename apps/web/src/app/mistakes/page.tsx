'use client';

import React, { useState } from 'react';
import { AlertTriangle, Play, Calendar, Hash } from 'lucide-react';
import { MistakeSchema, ProblemSchema, diffDaysIST, todayIST } from '@winter-arc/shared';
import { useCollection } from '@/lib/data';
import { QuickAddMistake } from '@/components/mistakes/quick-add-mistake';
import { WeeklyMistakesList } from '@/components/mistakes/weekly-mistakes-list';
import { WeeklyReviewModal } from '@/components/mistakes/weekly-review-modal';
import { RepeatedPatternsView } from '@/components/mistakes/repeated-patterns-view';

export default function MistakesPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'repeated'>('weekly');
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);

  const { data: mistakes, loading: mistakesLoading } = useCollection('mistakes', MistakeSchema);
  const { data: problems } = useCollection('problems', ProblemSchema);

  const today = todayIST();

  // Filter mistakes from the last 7 calendar days
  const recentMistakes = mistakes.filter((m) => {
    const diff = diffDaysIST(m.date, today);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-token">
        <div>
          <div className="flex items-center gap-2 text-status-warn font-mono text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Anti-Patterns & Mistakes Journal
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
            Mistakes Notebook
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Log mental traps, review weekly blindspots, and identify repeated error clusters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWeeklyReviewOpen(true)}
          className="px-4 py-2 rounded-lg bg-accent-burgundy text-white text-xs font-display font-semibold hover:bg-accent-burgundy-glow flex items-center gap-1.5 transition-all shrink-0 shadow-burgundy"
        >
          <Play className="h-4 w-4 fill-white" /> Weekly Review ({recentMistakes.length})
        </button>
      </div>

      {/* Quick Add Bar */}
      <QuickAddMistake problems={problems} />

      {/* Tabs */}
      <div className="flex border-b border-border-token space-x-6 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'weekly'
              ? 'border-accent-ice text-accent-ice font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Calendar className="h-4 w-4" /> Weekly Groups ({mistakes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repeated')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'repeated'
              ? 'border-accent-ice text-accent-ice font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Hash className="h-4 w-4" /> Most Repeated & Clusters
        </button>
      </div>

      {/* Content */}
      {mistakesLoading ? (
        <div className="space-y-4">
          <div className="h-40 bg-surface-2 animate-pulse rounded-bento" />
          <div className="h-40 bg-surface-2 animate-pulse rounded-bento" />
        </div>
      ) : activeTab === 'weekly' ? (
        <WeeklyMistakesList mistakes={mistakes} problems={problems} />
      ) : (
        <RepeatedPatternsView mistakes={mistakes} />
      )}

      {/* Weekly Review Walk-through Modal */}
      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
        recentMistakes={recentMistakes}
        problems={problems}
      />
    </div>
  );
}
