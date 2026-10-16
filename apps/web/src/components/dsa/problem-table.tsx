'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Problem, STANDARD_PATTERNS, todayIST, diffDaysIST } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { deleteDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface ProblemTableProps {
  problems: Problem[];
  loading: boolean;
  onOpenAddDrawer: () => void;
  onSelectProblem: (problem: Problem) => void;
}

export function ProblemTable({
  problems,
  loading,
  onOpenAddDrawer,
  onSelectProblem,
}: ProblemTableProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'due-asc'>(
    'date-desc',
  );
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const today = todayIST();

  // Filter & sort logic
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        // Text search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchPattern = p.pattern.toLowerCase().includes(q);
          const matchInsight = p.insight.toLowerCase().includes(q);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
          if (!matchTitle && !matchPattern && !matchInsight && !matchTags) {
            return false;
          }
        }

        // Pattern filter
        if (selectedPattern !== 'all' && p.pattern !== selectedPattern) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) {
          return false;
        }

        // Outcome filter
        if (selectedOutcome !== 'all' && p.outcome !== selectedOutcome) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          const isMastered = p.revision.mastered;
          const isOverdue =
            !isMastered && p.revision.nextDue !== null && p.revision.nextDue < today;

          if (selectedStatus === 'mastered' && !isMastered) return false;
          if (selectedStatus === 'overdue' && !isOverdue) return false;
          if (selectedStatus === 'in-revision' && (isMastered || isOverdue)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.solvedAt.localeCompare(a.solvedAt);
        }
        if (sortBy === 'date-asc') {
          return a.solvedAt.localeCompare(b.solvedAt);
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'due-asc') {
          const dueA = a.revision.nextDue ?? '9999-99-99';
          const dueB = b.revision.nextDue ?? '9999-99-99';
          return dueA.localeCompare(dueB);
        }
        return 0;
      });
  }, [
    problems,
    search,
    selectedPattern,
    selectedDifficulty,
    selectedOutcome,
    selectedStatus,
    sortBy,
    today,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleDelete = async (e: React.MouseEvent, problem: Problem) => {
    e.stopPropagation();
    if (!user?.uid || !problem.id) return;
    if (!window.confirm(`Delete "${problem.title}"? This cannot be undone.`)) return;

    const ok = await deleteDocument(user.uid, 'problems', problem.id);
    if (ok) {
      toast.info('Problem Deleted', `Removed ${problem.title}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-surface-2 animate-pulse rounded-lg" />
        <div className="h-64 bg-surface-2 animate-pulse rounded-bento" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search problems, patterns, insights, #tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-2 border border-border-token rounded-lg pl-9 pr-3 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice"
          />
        </div>

        {/* Pattern Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedPattern}
            onChange={(e) => {
              setSelectedPattern(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
          >
            <option value="all">All Patterns ({problems.length})</option>
            {STANDARD_PATTERNS.map((pat) => {
              const count = problems.filter((p) => p.pattern === pat).length;
              return (
                <option key={pat} value={pat}>
                  {pat} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Difficulty */}
        <div className="md:col-span-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-accent-ice capitalize"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Outcome */}
        <div className="md:col-span-2">
          <select
            value={selectedOutcome}
            onChange={(e) => {
              setSelectedOutcome(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-accent-ice capitalize"
          >
            <option value="all">All Outcomes</option>
            <option value="clean">Clean</option>
            <option value="hinted">Hinted</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-1">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
          >
            <option value="all">Status</option>
            <option value="overdue">Overdue</option>
            <option value="in-revision">Revision</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
          >
            <option value="date-desc">Solved: Newest</option>
            <option value="date-asc">Solved: Oldest</option>
            <option value="due-asc">Due Soonest</option>
            <option value="title-asc">Title: A-Z</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-bento border border-border-token bg-surface overflow-hidden shadow-sm">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Filter className="mx-auto h-8 w-8 text-accent-ice/50 mb-3" />
            <h3 className="font-display text-sm font-semibold text-text">No Problems Found</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {problems.length === 0
                ? "You haven't logged any problems yet. Press 'n' to log your first solve."
                : 'No problems match your current search and filter settings.'}
            </p>
            {problems.length === 0 && (
              <button
                onClick={onOpenAddDrawer}
                className="mt-4 px-4 py-2 rounded-lg bg-accent-ice text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Problem (shortcut &apos;n&apos;)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-token bg-surface-2 text-muted font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Pattern</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Solved</th>
                  <th className="py-3 px-4">Time & Outcome</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-token">
                {paginatedProblems.map((problem) => {
                  const isMastered = problem.revision.mastered;
                  const nextDue = problem.revision.nextDue;
                  const isOverdue = !isMastered && nextDue !== null && nextDue < today;
                  const daysOverdue = isOverdue && nextDue ? diffDaysIST(nextDue, today) : 0;

                  return (
                    <tr
                      key={problem.id ?? problem.title}
                      onClick={() => onSelectProblem(problem)}
                      className="hover:bg-surface-2/60 transition-colors cursor-pointer group"
                    >
                      {/* Revision Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isMastered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-status-success/20 text-status-success border border-status-success/40">
                            <CheckCircle2 className="h-3 w-3" /> Mastered
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-status-danger/20 text-status-danger border border-status-danger/40">
                            <AlertTriangle className="h-3 w-3" /> Overdue {daysOverdue}d
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-accent-ice/15 text-accent-ice border border-accent-ice/30">
                            Step {problem.revision.step} ({nextDue})
                          </span>
                        )}
                      </td>

                      {/* Title & Link */}
                      <td className="py-3 px-4 font-medium text-text">
                        <div className="flex items-center gap-1.5 max-w-xs sm:max-w-md">
                          <span className="truncate">{problem.title}</span>
                          {problem.url && (
                            <a
                              href={problem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted hover:text-accent-ice shrink-0"
                              title="External Link"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Pattern */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-surface-2 border border-border-token text-muted font-medium">
                          {problem.pattern}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                            problem.difficulty === 'easy'
                              ? 'bg-status-success/15 text-status-success border-status-success/30'
                              : problem.difficulty === 'medium'
                                ? 'bg-status-warn/15 text-status-warn border-status-warn/30'
                                : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Solved Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-muted text-[11px]">
                        {problem.solvedAt}
                      </td>

                      {/* Time & Outcome */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-muted text-[11px]">
                          {problem.timeTakenMin}m
                        </span>
                        <span className="mx-1 text-muted">·</span>
                        <span className="capitalize font-medium text-text text-[11px]">
                          {problem.outcome}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProblem(problem);
                            }}
                            className="p-1.5 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors"
                            title="View Problem Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, problem)}
                            className="p-1.5 rounded text-muted hover:text-status-danger hover:bg-surface-2 transition-colors"
                            title="Delete Problem"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredProblems.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-token bg-surface-2 text-xs text-muted">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredProblems.length)} of{' '}
              {filteredProblems.length} problems
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-border-token bg-surface text-muted hover:text-text disabled:opacity-40 transition-opacity"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-mono text-text">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-border-token bg-surface text-muted hover:text-text disabled:opacity-40 transition-opacity"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
