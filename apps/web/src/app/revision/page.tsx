'use client';

import React, { useState } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import {
  Problem,
  ProblemSchema,
  getRevisionQueue,
  getRevisionForecast,
  todayIST,
} from '@winter-arc/shared';
import { useCollection } from '@/lib/data';
import { QueueOverview } from '@/components/revision/queue-overview';
import { ActiveRecallModal } from '@/components/revision/active-recall-modal';
import { ProblemDetailModal } from '@/components/dsa/problem-detail-modal';

export default function RevisionPage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const { data: problems, loading } = useCollection('problems', ProblemSchema);

  const today = todayIST();
  const queueResult = getRevisionQueue(problems, today);
  const forecast = getRevisionForecast(problems, today, 14);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-token">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <RefreshCw className="h-4 w-4" /> Spaced Repetition Engine
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text mt-1">
            Revision Queue
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Active recall intervals [1, 3, 7, 14, 30 days] with zero penalty for overdue items.
          </p>
        </div>

        {queueResult.totalDue > 0 && (
          <button
            onClick={() => setIsReviewOpen(true)}
            className="px-4 py-2 rounded-lg bg-accent-burgundy text-white font-display font-semibold text-xs hover:bg-accent-burgundy-glow flex items-center gap-1.5 transition-all shrink-0 shadow-burgundy"
          >
            <Play className="h-4 w-4 fill-white" /> Start Review ({queueResult.totalDue})
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-2 animate-pulse rounded-bento" />
            ))}
          </div>
          <div className="h-40 bg-surface-2 animate-pulse rounded-bento" />
          <div className="h-64 bg-surface-2 animate-pulse rounded-bento" />
        </div>
      ) : (
        <QueueOverview
          queueResult={queueResult}
          forecast={forecast}
          onStartReview={() => setIsReviewOpen(true)}
          onSelectProblem={(p) => setSelectedProblem(p)}
        />
      )}

      {/* Active Recall Modal */}
      <ActiveRecallModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        queue={queueResult.queue}
      />

      {/* Problem Detail Modal */}
      <ProblemDetailModal problem={selectedProblem} onClose={() => setSelectedProblem(null)} />
    </div>
  );
}
