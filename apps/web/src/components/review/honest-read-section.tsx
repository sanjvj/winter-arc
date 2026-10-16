'use client';

import React from 'react';
import { Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HonestReadSectionProps {
  honestRead: string[];
}

export const HonestReadSection: React.FC<HonestReadSectionProps> = ({ honestRead }) => {
  return (
    <div className="rounded-bento border border-border-token bg-surface p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-border-token pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-accent-ice" />
          <h3 className="font-display text-base font-bold text-text">
            The Honest Read (Objective Facts)
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase text-muted bg-surface-2 border border-border-token px-2 py-0.5 rounded">
          Rule-based • No Speculation
        </span>
      </div>

      <p className="text-xs text-muted">
        Deterministic factual analysis generated strictly from this week&apos;s logged metrics.
      </p>

      {honestRead.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted/60">
          No activity recorded yet for this week to compute facts.
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {honestRead.map((statement, idx) => {
            const isPositive =
              statement.includes('All 7 days') ||
              statement.includes('Zero streak breaks') ||
              statement.includes('Great job') ||
              statement.includes('Target met') ||
              statement.includes('7 of 7 days');

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs font-mono transition-colors ${
                  isPositive
                    ? 'border-status-success/30 bg-status-success/5 text-status-success'
                    : 'border-status-warn/30 bg-status-warn/5 text-text'
                }`}
              >
                {isPositive ? (
                  <CheckCircle2 className="h-4 w-4 text-status-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-status-warn flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{statement}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
