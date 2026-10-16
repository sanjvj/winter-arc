'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { ListTodo, ArrowRight, Check } from 'lucide-react';
import { ScheduleBlock, nowTimeIST } from '@winter-arc/shared';

interface ChecklistCardProps {
  scheduleBlocks: ScheduleBlock[];
  completedMap: Record<string, boolean>;
  onToggleBlock: (blockId: string) => void;
  loading?: boolean;
}

export function ChecklistCard({
  scheduleBlocks,
  completedMap,
  onToggleBlock,
  loading = false,
}: ChecklistCardProps) {
  const currentTime = nowTimeIST();

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <BentoCard
      size="L"
      state={loading ? 'loading' : 'default'}
      className="order-3 xl:order-none"
      icon={<ListTodo className="h-4 w-4 text-accent-ice" />}
      title="Today's Schedule"
      action={
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-accent-ice font-semibold">
            {completedCount}/{scheduleBlocks.length}
          </span>
          <Link
            href="/log"
            className="text-muted hover:text-text transition-colors p-1"
            title="Open Full Log"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-y-auto space-y-1.5 pr-1 max-h-[260px] scrollbar-thin">
          {scheduleBlocks.map((block) => {
            const isCompleted = Boolean(completedMap[block.id]);
            const isCurrent = currentTime >= block.start && currentTime < block.end;

            return (
              <div
                key={block.id}
                onClick={() => onToggleBlock(block.id)}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-accent-ice/80 bg-accent-ice/10 ring-1 ring-accent-ice shadow-sm'
                    : isCompleted
                      ? 'border-border-token/40 bg-surface-2/40 opacity-70'
                      : 'border-border-token bg-surface hover:border-border-token/80 hover:bg-surface-2/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-status-success border-status-success text-background'
                        : 'border-border-token bg-surface-2'
                    }`}
                  >
                    {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`block font-medium truncate ${
                        isCompleted ? 'line-through text-muted' : 'text-text'
                      }`}
                    >
                      {block.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {block.start} - {block.end}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isCurrent && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-accent-ice animate-pulse bg-accent-ice/20 px-1.5 py-0.5 rounded">
                      Now
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-muted uppercase bg-surface-2 px-1.5 py-0.5 rounded border border-border-token">
                    {block.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
