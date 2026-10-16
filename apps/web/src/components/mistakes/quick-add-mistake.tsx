'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { STANDARD_PATTERNS, Problem, Mistake, MistakeSchema, todayIST } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { addDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface QuickAddMistakeProps {
  problems: Problem[];
  onMistakeAdded?: () => void;
}

export function QuickAddMistake({ problems, onMistakeAdded }: QuickAddMistakeProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [pattern, setPattern] = useState<string>('');
  const [problemId, setProblemId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Global shortcut 'm' focuses the quick-add input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error('Authentication Error', 'You must be signed in.');
      return;
    }

    if (!text.trim()) {
      toast.warn('Missing Description', 'Please describe the mistake or anti-pattern.');
      return;
    }

    setSubmitting(true);
    try {
      const newMistake: Mistake = {
        date: todayIST(),
        text: text.trim(),
        pattern: pattern || undefined,
        problemId: problemId || undefined,
        reviewedWeeks: [],
      };

      const docId = await addDocument(user.uid, 'mistakes', newMistake, MistakeSchema);
      if (docId) {
        toast.success('Mistake Recorded', 'Added to your anti-patterns journal.');
        setText('');
        setPattern('');
        setProblemId('');
        onMistakeAdded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-bento border border-border-token bg-surface p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-status-warn/20 text-status-warn font-mono text-xs font-bold border border-status-warn/30">
              m
            </span>
            <span className="font-display text-xs font-bold text-text uppercase tracking-wider">
              Quick Add Mistake / Anti-Pattern
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted hidden sm:inline">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-token">m</kbd>{' '}
            to focus anywhere
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Mistake description */}
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. Forgot base case recursion check when tree is null; assumed sorted input without checking"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice"
          />

          {/* Optional pattern */}
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="bg-surface-2 border border-border-token rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent-ice sm:w-44"
          >
            <option value="">(Optional Pattern)</option>
            {STANDARD_PATTERNS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Optional linked problem */}
          <select
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
            className="bg-surface-2 border border-border-token rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent-ice sm:w-44 truncate"
          >
            <option value="">(Optional Problem)</option>
            {problems.map((p) => (
              <option key={p.id ?? p.title} value={p.id ?? p.title}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Add button */}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 rounded-lg bg-accent-burgundy text-white text-xs font-display font-semibold hover:bg-accent-burgundy-glow disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-burgundy"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>
      </form>
    </div>
  );
}
