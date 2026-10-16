'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Problem, ProblemRevision, advanceRevision, todayIST } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { updateDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface ActiveRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Problem[];
  onProblemReviewed?: (problemId: string, updatedRevision: ProblemRevision) => void;
}

export interface SessionStats {
  totalReviewed: number;
  passedCount: number;
  failedCount: number;
}

export function ActiveRecallModal({
  isOpen,
  onClose,
  queue,
  onProblemReviewed,
}: ActiveRecallModalProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalReviewed: 0,
    passedCount: 0,
    failedCount: 0,
  });
  const [isCompleted, setIsCompleted] = useState(false);

  const currentProblem = queue[currentIndex] ?? null;

  // Stopwatch timer for current card
  useEffect(() => {
    if (!isOpen || isCompleted || !currentProblem) return;

    setTimerSeconds(0);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isCompleted, currentIndex, currentProblem]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleAnswer = useCallback(
    async (result: 'pass' | 'fail') => {
      if (!user?.uid || !currentProblem || !currentProblem.id) return;

      const today = todayIST();
      const updatedRev = advanceRevision(currentProblem.revision, today, result);

      // Optimistically update Firestore
      await updateDocument(user.uid, 'problems', currentProblem.id, {
        revision: updatedRev,
      });

      // Show toast with next due date
      if (result === 'pass') {
        if (updatedRev.mastered) {
          toast.success('Problem Mastered! 🏆', `Completed final 30-day revision.`);
        } else {
          toast.success(
            `Passed: Step ${updatedRev.step}`,
            `Next review scheduled for ${updatedRev.nextDue}.`,
          );
        }
      } else {
        toast.warn(
          'Demoted to Step 0',
          `Scheduled for re-review tomorrow (${updatedRev.nextDue}).`,
        );
      }

      onProblemReviewed?.(currentProblem.id, updatedRev);

      // Update session statistics
      setSessionStats((prev) => ({
        totalReviewed: prev.totalReviewed + 1,
        passedCount: prev.passedCount + (result === 'pass' ? 1 : 0),
        failedCount: prev.failedCount + (result === 'fail' ? 1 : 0),
      }));

      // Advance to next problem or finish
      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1);
        setRevealed(false);
      } else {
        setIsCompleted(true);
      }
    },
    [user, currentProblem, currentIndex, queue.length, onProblemReviewed],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isCompleted || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to reveal
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        handleReveal();
        return;
      }

      // If revealed, 'p' passes, 'f' fails
      if (revealed) {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleAnswer('pass');
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          handleAnswer('fail');
        }
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCompleted, currentProblem, revealed, handleAnswer, onClose]);

  if (!isOpen) return null;

  // Format timer seconds into mm:ss
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border-token rounded-bento p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[500px]">
        {/* Session Complete Screen */}
        {isCompleted ? (
          <div className="py-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-success/20 border border-status-success/40 text-status-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-text">
                Review Session Complete!
              </h2>
              <p className="text-sm text-muted mt-1">
                You&apos;ve cleared all scheduled active recall items for this session.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-xl bg-surface-2 border border-border-token text-center">
              <div>
                <span className="text-xs text-muted block">Reviewed</span>
                <span className="font-display text-xl font-bold text-text">
                  {sessionStats.totalReviewed}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted block">Passed</span>
                <span className="font-display text-xl font-bold text-status-success">
                  {sessionStats.passedCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted block">Demoted</span>
                <span className="font-display text-xl font-bold text-status-warn">
                  {sessionStats.failedCount}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-accent-ice text-black font-display font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Back to Queue
            </button>
          </div>
        ) : !currentProblem ? (
          <div className="py-12 text-center text-muted">
            <CheckCircle2 className="mx-auto h-10 w-10 text-status-success mb-3" />
            <h3 className="font-display text-base font-bold text-text">No Problems Due</h3>
            <p className="text-xs text-muted mt-1">All caught up on revisions!</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg bg-surface-2 text-text text-xs border border-border-token"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Card Top Progress Bar & Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-token text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-accent-ice font-semibold">
                    Card {currentIndex + 1} of {queue.length}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="font-mono text-muted flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {formatTimer(timerSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 border border-border-token text-text">
                    Current Step: {currentProblem.revision.step}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    title="Exit Session (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Problem Identification */}
              <div className="py-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-surface-2 border border-border-token text-accent-ice">
                    {currentProblem.platform}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-2 border border-border-token text-text">
                    {currentProblem.pattern}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                      currentProblem.difficulty === 'easy'
                        ? 'bg-status-success/15 text-status-success border-status-success/30'
                        : currentProblem.difficulty === 'medium'
                          ? 'bg-status-warn/15 text-status-warn border-status-warn/30'
                          : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                    }`}
                  >
                    {currentProblem.difficulty}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-text flex items-center gap-2">
                  {currentProblem.title}
                  {currentProblem.url && (
                    <a
                      href={currentProblem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-accent-ice"
                      title="Open problem in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </h2>

                <p className="text-xs text-muted mt-1 font-mono">
                  Solved on {currentProblem.solvedAt} · Initial time: {currentProblem.timeTakenMin}m
                  · Complexity: {currentProblem.complexity.time || 'O(?)'}
                </p>
              </div>

              {/* Active Recall Concealment / Solution Reveal */}
              <div className="my-3">
                {!revealed ? (
                  <div
                    onClick={handleReveal}
                    className="p-8 rounded-xl border border-dashed border-border-token bg-surface-2/60 hover:bg-surface-2 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center gap-2 min-h-[160px]"
                  >
                    <Eye className="h-7 w-7 text-accent-ice/70 group-hover:scale-110 transition-transform" />
                    <span className="font-display text-sm font-semibold text-text">
                      Try to recall the solution & pattern on scratchpad first.
                    </span>
                    <span className="text-xs text-muted">
                      Press{' '}
                      <kbd className="px-2 py-0.5 rounded bg-surface border border-border-token font-mono text-[11px]">
                        Space
                      </kbd>{' '}
                      or click here to reveal the key trick.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <div className="p-4 rounded-xl bg-accent-ice/10 border border-accent-ice/30">
                      <span className="text-xs font-mono uppercase tracking-wider text-accent-ice font-bold block mb-1">
                        Key Insight (The Trick)
                      </span>
                      <p className="text-sm font-medium text-text leading-relaxed">
                        {currentProblem.insight || 'No insight recorded.'}
                      </p>
                    </div>

                    {currentProblem.stuckAt && (
                      <div className="p-3.5 rounded-xl bg-status-warn/10 border border-status-warn/30">
                        <span className="text-xs font-mono uppercase tracking-wider text-status-warn font-bold block mb-1">
                          Where You Got Stuck Previously
                        </span>
                        <p className="text-xs text-muted leading-relaxed">
                          {currentProblem.stuckAt}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-border-token">
              {!revealed ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted font-mono">
                    Recall on paper or mental walk-through before flipping.
                  </span>
                  <button
                    onClick={handleReveal}
                    className="px-5 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text border border-border-token text-xs font-display font-semibold flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-accent-ice" /> Reveal Trick{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono">
                      Space
                    </kbd>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-muted font-mono">
                    Did you recall the optimal approach cleanly?
                  </span>

                  <div className="flex gap-2 justify-end">
                    {/* Fail button */}
                    <button
                      type="button"
                      onClick={() => handleAnswer('fail')}
                      className="px-4 py-2 rounded-lg bg-status-danger/15 hover:bg-status-danger/25 text-status-danger border border-status-danger/40 text-xs font-display font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Demote to Step 0{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono">
                        f
                      </kbd>
                    </button>

                    {/* Pass button */}
                    <button
                      type="button"
                      onClick={() => handleAnswer('pass')}
                      className="px-5 py-2 rounded-lg bg-status-success text-black hover:opacity-90 text-xs font-display font-semibold flex items-center gap-1.5 transition-opacity"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Pass & Advance{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">
                        p
                      </kbd>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
