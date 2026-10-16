'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, Layers, Hash } from 'lucide-react';
import { Mistake } from '@winter-arc/shared';

interface RepeatedPatternsViewProps {
  mistakes: Mistake[];
}

export function RepeatedPatternsView({ mistakes }: RepeatedPatternsViewProps) {
  // Pattern aggregation
  const patternCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of mistakes) {
      const pat = m.pattern || 'Uncategorized';
      map.set(pat, (map.get(pat) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }, [mistakes]);

  // Common keyword anti-pattern clusters
  const keywordClusters = useMemo(() => {
    const keywords = [
      {
        key: 'Off-by-one / Boundaries',
        regex: /off[ -]by[ -]one|boundary|index|out of bounds|< vs <=/i,
      },
      { key: 'Base Case / Null Pointers', regex: /base case|null|empty|none|undefined/i },
      { key: 'Visited / Cycle / State', regex: /visited|cycle|loop|set|hash/i },
      { key: 'Integer Overflow / Types', regex: /overflow|integer|int64|modulo|negative/i },
      {
        key: 'Overcomplicated Approach',
        regex: /overcomplicate|dp when greedy|brute force|unnecessary/i,
      },
      { key: 'Sorting / Invariants', regex: /sort|invariant|monotonic/i },
    ];

    return keywords
      .map((k) => {
        const matchingMistakes = mistakes.filter((m) => k.regex.test(m.text));
        return {
          name: k.key,
          count: matchingMistakes.length,
          samples: matchingMistakes.slice(0, 3),
        };
      })
      .filter((k) => k.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [mistakes]);

  if (mistakes.length === 0) {
    return (
      <div className="p-12 text-center text-muted rounded-bento border border-border-token bg-surface">
        <AlertTriangle className="mx-auto h-8 w-8 text-status-warn/50 mb-3" />
        <h3 className="font-display text-sm font-semibold text-text">No Anti-Patterns Yet</h3>
        <p className="text-xs text-muted mt-1">
          Once you log mistakes, recurring traps and patterns will be analyzed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pattern Breakdown */}
      <div className="p-5 rounded-bento bg-surface border border-border-token">
        <h3 className="font-display text-sm font-bold text-text flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-accent-ice" /> Mistakes By Algorithmic Pattern
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patternCounts.map((item, i) => (
            <div
              key={item.pattern}
              className={`p-3 rounded-lg border bg-surface-2 flex items-center justify-between ${
                i === 0 ? 'border-status-danger/40' : 'border-border-token'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-text block">{item.pattern}</span>
                <span className="text-[11px] font-mono text-muted">
                  {Math.round((item.count / mistakes.length) * 100)}% of total mistakes
                </span>
              </div>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  i === 0 ? 'bg-status-danger/20 text-status-danger' : 'bg-surface text-text'
                }`}
              >
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Normalized Semantic Anti-Pattern Clusters */}
      <div className="p-5 rounded-bento bg-surface border border-border-token">
        <h3 className="font-display text-sm font-bold text-text flex items-center gap-2 mb-1">
          <Hash className="h-4 w-4 text-accent-ice" /> Most Repeated Anti-Pattern Themes
        </h3>
        <p className="text-xs text-muted mb-4">
          Automated keyword clustering identifying recurring mental stumbling blocks
        </p>

        {keywordClusters.length === 0 ? (
          <p className="text-xs text-muted italic">No repeated keyword clusters identified yet.</p>
        ) : (
          <div className="space-y-3">
            {keywordClusters.map((cluster) => (
              <div
                key={cluster.name}
                className="p-3.5 rounded-xl border border-border-token bg-surface-2 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-text flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-status-warn" /> {cluster.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-border-token text-status-warn font-semibold">
                    {cluster.count} occurrence(s)
                  </span>
                </div>

                <div className="space-y-1 pl-3.5 border-l-2 border-border-token">
                  {cluster.samples.map((s) => (
                    <p key={s.id ?? s.text} className="text-xs text-muted italic">
                      &ldquo;{s.text}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
