'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  RotateCcw,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { DailyCounters, Floor, Overrides } from '@winter-arc/shared';
import { OverrideModal } from './override-modal';

interface TopCountersStripProps {
  counters: DailyCounters;
  floor: Floor;
  dueRevisionsAtStart: number;
  overrides: Overrides;
  onUpdateOverride: (key: keyof Overrides, value: number | undefined) => void;
}

export function TopCountersStrip({
  counters,
  floor,
  dueRevisionsAtStart,
  overrides,
  onUpdateOverride,
}: TopCountersStripProps) {
  const [activeModal, setActiveModal] = useState<'problems' | 'revisions' | 'applications' | null>(
    null,
  );

  // Revisions floor target is 0 if dueRevisionsAtStart == 0
  const effectiveRevisionsFloor = dueRevisionsAtStart === 0 ? 0 : floor.revisions;

  const isProblemsMet = counters.problems >= floor.problems;
  const isRevisionsMet = dueRevisionsAtStart === 0 || counters.revisions >= floor.revisions;
  const isApplicationsMet = counters.applications >= floor.applications;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Problems Solved */}
        <div className="bg-surface border border-border-token rounded-bento p-3.5 flex flex-col justify-between relative group hover:border-border-token/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Code2 className="h-3.5 w-3.5 text-accent-ice" />
              DSA Solved
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveModal('problems')}
                className="text-muted/60 hover:text-accent-ice p-1 rounded hover:bg-surface-2 transition-colors"
                title="Tap to override"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <Link
                href="/dsa"
                className="text-muted/60 hover:text-accent-ice p-1 rounded hover:bg-surface-2 transition-colors"
                title="Add problem in DSA tracker"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-text">{counters.problems}</span>
              <span className="font-mono text-xs text-muted">/ {floor.problems} min</span>
            </div>
            {isProblemsMet ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Met
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-warn bg-status-warn/10 px-2 py-0.5 rounded-full font-semibold">
                <AlertCircle className="h-3 w-3" /> {floor.problems - counters.problems} left
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono text-muted flex items-center justify-between border-t border-border-token/50 pt-1.5">
            <span>Auto: {counters.autoDerived.problems}</span>
            {overrides.problems !== undefined && (
              <span className="text-accent-ice font-semibold">Overridden</span>
            )}
          </div>
        </div>

        {/* 2. Revisions */}
        <div className="bg-surface border border-border-token rounded-bento p-3.5 flex flex-col justify-between relative group hover:border-border-token/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <RotateCcw className="h-3.5 w-3.5 text-accent-indigo" />
              Revisions
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveModal('revisions')}
                className="text-muted/60 hover:text-accent-indigo p-1 rounded hover:bg-surface-2 transition-colors"
                title="Tap to override"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <Link
                href="/revision"
                className="text-muted/60 hover:text-accent-indigo p-1 rounded hover:bg-surface-2 transition-colors"
                title="Open revision queue"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-text">
                {counters.revisions}
              </span>
              <span className="font-mono text-xs text-muted">/ {effectiveRevisionsFloor} min</span>
            </div>
            {isRevisionsMet ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Met
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-warn bg-status-warn/10 px-2 py-0.5 rounded-full font-semibold">
                <AlertCircle className="h-3 w-3" /> {effectiveRevisionsFloor - counters.revisions}{' '}
                left
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono text-muted flex items-center justify-between border-t border-border-token/50 pt-1.5">
            <span>
              {dueRevisionsAtStart === 0 ? '0 due at start' : `Due: ${dueRevisionsAtStart}`}
            </span>
            {overrides.revisions !== undefined && (
              <span className="text-accent-indigo font-semibold">Overridden</span>
            )}
          </div>
        </div>

        {/* 3. Applications */}
        <div className="bg-surface border border-border-token rounded-bento p-3.5 flex flex-col justify-between relative group hover:border-border-token/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Send className="h-3.5 w-3.5 text-accent-ice" />
              Applications
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveModal('applications')}
                className="text-muted/60 hover:text-accent-ice p-1 rounded hover:bg-surface-2 transition-colors"
                title="Tap to override"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <Link
                href="/pipeline"
                className="text-muted/60 hover:text-accent-ice p-1 rounded hover:bg-surface-2 transition-colors"
                title="Manage job pipeline"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-text">
                {counters.applications}
              </span>
              <span className="font-mono text-xs text-muted">/ {floor.applications} min</span>
            </div>
            {isApplicationsMet ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Met
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-warn bg-status-warn/10 px-2 py-0.5 rounded-full font-semibold">
                <AlertCircle className="h-3 w-3" /> {floor.applications - counters.applications}{' '}
                left
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono text-muted flex items-center justify-between border-t border-border-token/50 pt-1.5">
            <span>Auto: {counters.autoDerived.applications}</span>
            {overrides.applications !== undefined && (
              <span className="text-accent-ice font-semibold">Overridden</span>
            )}
          </div>
        </div>

        {/* 4. Mocks */}
        <div className="bg-surface border border-border-token rounded-bento p-3.5 flex flex-col justify-between relative group hover:border-border-token/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <MessageSquare className="h-3.5 w-3.5 text-accent-indigo" />
              Mocks Logged
            </span>
            <Link
              href="/mocks"
              className="text-muted/60 hover:text-accent-indigo p-1 rounded hover:bg-surface-2 transition-colors"
              title="View mocks tracker"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-text">{counters.mocks}</span>
              <span className="font-mono text-xs text-muted">today</span>
            </div>
            {counters.mocks > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Logged
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono text-muted border-t border-border-token/50 pt-1.5">
            <span>Auto-synced</span>
          </div>
        </div>
      </div>

      {/* Override Modals */}
      <OverrideModal
        isOpen={activeModal === 'problems'}
        onClose={() => setActiveModal(null)}
        title="DSA Solved"
        currentDerived={counters.autoDerived.problems}
        currentOverride={overrides.problems}
        onSaveOverride={(val) => onUpdateOverride('problems', val)}
      />

      <OverrideModal
        isOpen={activeModal === 'revisions'}
        onClose={() => setActiveModal(null)}
        title="Revisions Completed"
        currentDerived={counters.autoDerived.revisions}
        currentOverride={overrides.revisions}
        onSaveOverride={(val) => onUpdateOverride('revisions', val)}
      />

      <OverrideModal
        isOpen={activeModal === 'applications'}
        onClose={() => setActiveModal(null)}
        title="Applications Submitted"
        currentDerived={counters.autoDerived.applications}
        currentOverride={overrides.applications}
        onSaveOverride={(val) => onUpdateOverride('applications', val)}
      />
    </>
  );
}
