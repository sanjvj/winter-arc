'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Check, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { addDocument } from '@/lib/data';
import {
  ProblemSchema,
  STANDARD_PATTERNS,
  parseProblemUrl,
  initProblemRevision,
  todayIST,
  Problem,
} from '@winter-arc/shared';
import { toast } from '@/components/ui/toast';

interface AddProblemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded?: (problem: Problem) => void;
}

export function AddProblemDrawer({ isOpen, onClose, onProblemAdded }: AddProblemDrawerProps) {
  const { user } = useAuth();
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<
    'leetcode' | 'codeforces' | 'hackerrank' | 'gfg' | 'other'
  >('leetcode');
  const [pattern, setPattern] = useState<string>('Arrays & Hashing');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [solvedAt, setSolvedAt] = useState<string>(todayIST());
  const [timeTakenMin, setTimeTakenMin] = useState<number>(20);
  const [outcome, setOutcome] = useState<'clean' | 'hinted' | 'failed'>('clean');
  const [insight, setInsight] = useState('');
  const [stuckAt, setStuckAt] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Focus URL input on open if no other element has active focus
  useEffect(() => {
    if (!isOpen) {
      return () => {};
    }
    const timer = setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        urlInputRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle URL change & auto-detection
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (!value.trim()) return;

    const parsed = parseProblemUrl(value);
    if (parsed.platform !== 'other') {
      setPlatform(parsed.platform);
    }
    if (parsed.title && !title) {
      setTitle(parsed.title);
    }
  };

  const handleSave = useCallback(async () => {
    if (!user?.uid) {
      toast.error('Authentication Error', 'You must be signed in to log problems.');
      return;
    }

    if (!title.trim()) {
      toast.warn('Missing Title', 'Please enter a problem title.');
      return;
    }

    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      toast.warn('Invalid URL', 'Please enter a valid URL starting with http:// or https://, or leave it blank.');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const revision = initProblemRevision(solvedAt, outcome, timeTakenMin);

      const problemData: Problem = {
        title: title.trim(),
        url: url.trim(),
        platform,
        pattern,
        difficulty,
        solvedAt,
        timeTakenMin,
        outcome,
        insight: insight.trim().slice(0, 200),
        stuckAt: stuckAt.trim(),
        complexity: {
          time: timeComplexity.trim(),
          space: spaceComplexity.trim(),
        },
        tags,
        revision,
      };

      const docId = await addDocument(user.uid, 'problems', problemData, ProblemSchema);

      if (docId) {
        toast.success(
          `Logged: ${problemData.title}`,
          revision.step === 2
            ? `⚡ Clean fast solve! Fast-tracked to Step 2 (next due ${revision.nextDue}).`
            : `Scheduled Step 0 revision for tomorrow (${revision.nextDue}).`,
        );

        onProblemAdded?.({ ...problemData, id: docId });

        // Reset form
        setUrl('');
        setTitle('');
        setInsight('');
        setStuckAt('');
        setTimeComplexity('');
        setSpaceComplexity('');
        setTagsInput('');
        setTimeTakenMin(20);
        setOutcome('clean');
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }, [
    user,
    title,
    url,
    platform,
    pattern,
    difficulty,
    solvedAt,
    timeTakenMin,
    outcome,
    insight,
    stuckAt,
    timeComplexity,
    spaceComplexity,
    tagsInput,
    onProblemAdded,
    onClose,
  ]);

  // Keyboard shortcut listener: Cmd/Ctrl+Enter to save, Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-surface border-l border-border-token p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-token">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-accent-ice font-mono text-xs font-bold border border-border-token">
                +n
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-text">Add DSA Problem</h2>
                <p className="text-xs text-muted">
                  Log solve and schedule active recall spaced repetition
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4 py-5">
            {/* URL with Platform auto-detect */}
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Problem URL <span className="text-muted">(auto-detects title & platform)</span>
              </label>
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice"
                />
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as typeof platform)}
                  className="bg-surface-2 border border-border-token rounded-lg px-2.5 py-2 text-xs font-mono text-text focus:outline-none focus:border-accent-ice uppercase"
                >
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="gfg">GFG</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Problem Title <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Trapping Rain Water"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice"
              />
            </div>

            {/* Pattern & Difficulty Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Pattern</label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
                >
                  {STANDARD_PATTERNS.map((pat) => (
                    <option key={pat} value={pat}>
                      {pat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text mb-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                        difficulty === diff
                          ? diff === 'easy'
                            ? 'bg-status-success/20 text-status-success border-status-success/40'
                            : diff === 'medium'
                              ? 'bg-status-warn/20 text-status-warn border-status-warn/40'
                              : 'bg-status-danger/20 text-status-danger border-status-danger/40'
                          : 'bg-surface-2 text-muted border-border-token hover:text-text'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcome & Time Taken Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Outcome</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['clean', 'hinted', 'failed'] as const).map((out) => (
                    <button
                      key={out}
                      type="button"
                      onClick={() => setOutcome(out)}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                        outcome === out
                          ? out === 'clean'
                            ? 'bg-status-success/20 text-status-success border-status-success/40'
                            : out === 'hinted'
                              ? 'bg-status-warn/20 text-status-warn border-status-warn/40'
                              : 'bg-status-danger/20 text-status-danger border-status-danger/40'
                          : 'bg-surface-2 text-muted border-border-token hover:text-text'
                      }`}
                    >
                      {out}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Time Taken <span className="text-muted">(mins)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={timeTakenMin}
                    onChange={(e) => setTimeTakenMin(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-surface-2 border border-border-token rounded-lg pl-9 pr-3 py-2 text-sm text-text focus:outline-none focus:border-accent-ice font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fast-track callout */}
            {outcome === 'clean' && timeTakenMin <= 25 ? (
              <div className="p-2.5 rounded-lg bg-status-success/10 border border-status-success/30 flex items-center gap-2 text-xs text-status-success">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  Clean solve in &le; 25m! Fast-tracks to Step 2 (next revision in 7 days).
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-surface-2 border border-border-token flex items-center gap-2 text-xs text-muted">
                <AlertCircle className="h-4 w-4 shrink-0 text-status-warn" />
                <span>
                  Starts at Step 0. Scheduled for first active-recall review tomorrow (+1d).
                </span>
              </div>
            )}

            {/* Key Insight (Max 200 chars) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-text">
                  Key Insight in one sentence <span className="text-muted">(hidden in recall)</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${insight.length > 200 ? 'text-status-danger' : 'text-muted'}`}
                >
                  {insight.length}/200
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={200}
                placeholder="What is the trick?"
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice resize-none"
              />
            </div>

            {/* Where I got stuck */}
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Where I got stuck <span className="text-muted">(anti-pattern notes)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Overcomplicated DP state when greedy was sufficient"
                value={stuckAt}
                onChange={(e) => setStuckAt(e.target.value)}
                className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice resize-none"
              />
            </div>

            {/* Complexity & Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Time Complexity</label>
                <input
                  type="text"
                  placeholder="e.g. O(N log N)"
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text font-mono focus:outline-none focus:border-accent-ice"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Space Complexity</label>
                <input
                  type="text"
                  placeholder="e.g. O(1)"
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text font-mono focus:outline-none focus:border-accent-ice"
                />
              </div>
            </div>

            {/* Tags & Solved Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. monotonic-stack, binary-search"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Solved Date (IST)
                </label>
                <input
                  type="date"
                  value={solvedAt}
                  onChange={(e) => setSolvedAt(e.target.value)}
                  className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-xs text-text font-mono focus:outline-none focus:border-accent-ice"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-border-token flex items-center justify-between">
          <span className="text-[11px] text-muted hidden sm:inline font-mono">
            Shortcut:{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-token">
              Cmd/Ctrl + Enter
            </kbd>{' '}
            to save
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:text-text hover:bg-surface-2 border border-border-token transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-accent-burgundy text-white hover:bg-accent-burgundy-glow font-display flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-burgundy"
            >
              {saving ? (
                <span>Logging...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Log Problem</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
