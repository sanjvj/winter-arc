'use client';

import React from 'react';
import { Mock } from '@winter-arc/shared';
import {
  Calendar,
  Clock,
  Star,
  Edit3,
  Target,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MockCardProps {
  mock: Mock;
  onEdit: (mock: Mock) => void;
  onAddGoal: (text: string) => void;
}

export const MockCard: React.FC<MockCardProps> = ({ mock, onEdit, onAddGoal }) => {
  const strengthsList = mock.strengths
    ? mock.strengths
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const weaknessesList = mock.weaknesses
    ? mock.weaknesses
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="rounded-bento border border-border-token bg-surface p-5 transition-all duration-150 hover:border-accent-ice/40 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-token pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-accent-ice/15 border border-accent-ice/30 px-2.5 py-1 text-xs font-mono font-semibold uppercase text-accent-ice">
            {mock.type}
          </span>
          <span className="rounded bg-surface-2 border border-border-token px-2 py-0.5 text-xs font-mono text-muted">
            {mock.platform}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
            <Calendar className="h-3 w-3" /> {mock.date}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
            <Clock className="h-3 w-3" /> {mock.durationMin}m
          </span>
          {mock.interviewer && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
              <User className="h-3 w-3" /> {mock.interviewer}
            </span>
          )}
        </div>

        {/* Score & Edit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-2 border border-border-token px-2.5 py-1 rounded-md">
            <div className="flex text-status-warn">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  className={`h-3.5 w-3.5 ${
                    mock.score >= val ? 'fill-current text-status-warn' : 'text-muted/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-text ml-1.5">{mock.score}/5</span>
          </div>

          <button
            type="button"
            onClick={() => onEdit(mock)}
            className="rounded p-1.5 text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title="Edit Mock Log"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Problems Tackled */}
      {mock.problemTitles && mock.problemTitles.length > 0 && (
        <div>
          <div className="text-[11px] font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Questions / Scenarios Covered
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mock.problemTitles.map((p, idx) => (
              <span
                key={idx}
                className="rounded bg-surface-2 border border-border-token px-2 py-0.5 text-xs font-mono text-text"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengthsList.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-status-success flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3 w-3" /> What Went Well
            </div>
            <div className="flex flex-wrap gap-1.5">
              {strengthsList.map((str, idx) => (
                <span
                  key={idx}
                  className="rounded bg-status-success/15 border border-status-success/30 px-2 py-0.5 text-xs font-mono text-status-success"
                >
                  {str}
                </span>
              ))}
            </div>
          </div>
        )}

        {weaknessesList.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-status-warn flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3 w-3" /> Gaps & Weaknesses
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weaknessesList.map((w, idx) => (
                <span
                  key={idx}
                  className="rounded bg-status-warn/15 border border-status-warn/30 px-2 py-0.5 text-xs font-mono text-status-warn"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Items with One-Click Turn into Roadmap Goal */}
      {mock.actionItems && mock.actionItems.length > 0 && (
        <div className="border-t border-border-token pt-3">
          <div className="text-[11px] font-mono uppercase text-muted mb-2 flex items-center gap-1">
            <Target className="h-3 w-3 text-accent-ice" /> Concrete Action Items
          </div>
          <div className="space-y-2">
            {mock.actionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-lg border border-border-token bg-surface-2 p-2.5 text-xs"
              >
                <span className="text-text font-medium flex-1">{item}</span>
                <button
                  type="button"
                  onClick={() => onAddGoal(item)}
                  className="inline-flex items-center gap-1 rounded bg-accent-ice/15 border border-accent-ice/30 px-2.5 py-1 text-[11px] font-mono text-accent-ice hover:bg-accent-ice/25 transition-colors flex-shrink-0"
                  title="Turn this action item into an active Roadmap goal"
                >
                  <Target className="h-3 w-3" />
                  <span>→ Roadmap Goal</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
