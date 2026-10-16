import { Problem } from './schemas';

export const STANDARD_PATTERNS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs BFS/DFS',
  'Advanced Graphs',
  '1-D DP',
  '2-D DP',
  'Greedy',
  'Intervals',
  'Bit Manipulation',
  'Math & Geometry',
] as const;

export type StandardPattern = (typeof STANDARD_PATTERNS)[number];

export interface PatternCoverageItem {
  pattern: string;
  solved: number;
  target: number;
  percentage: number; // 0 to 100+
  status: 'critical' | 'behind' | 'on_track' | 'completed';
}

export interface PatternCoverageResult {
  patterns: PatternCoverageItem[];
  totalSolved: number;
  totalTarget: number;
  overallPercentage: number;
  weakestPatterns: PatternCoverageItem[];
}

/**
 * Spec 7.5: Pattern Coverage Calculation
 * Aggregates solved counts per pattern vs targets, determines completion rates,
 * and highlights the top 3 weakest patterns.
 */
export function calculatePatternCoverage(
  problems: Problem[],
  patternTargets: Record<string, number> = {},
): PatternCoverageResult {
  // Count solved problems per pattern
  const solvedCounts: Record<string, number> = {};
  for (const problem of problems) {
    const pattern = problem.pattern;
    solvedCounts[pattern] = (solvedCounts[pattern] ?? 0) + 1;
  }

  // Ensure all standard patterns plus any extra in patternTargets are included
  const allPatternKeys = Array.from(
    new Set([...STANDARD_PATTERNS, ...Object.keys(patternTargets)]),
  );

  let totalSolved = 0;
  let totalTarget = 0;

  const patterns: PatternCoverageItem[] = allPatternKeys.map((pattern) => {
    const solved = solvedCounts[pattern] ?? 0;
    const target = patternTargets[pattern] ?? 0;

    totalSolved += solved;
    totalTarget += target;

    const percentage =
      target > 0 ? Math.round((solved / target) * 1000) / 10 : solved > 0 ? 100 : 0;

    let status: PatternCoverageItem['status'] = 'on_track';
    if (percentage >= 100) {
      status = 'completed';
    } else if (percentage === 0) {
      status = 'critical';
    } else if (percentage < 50) {
      status = 'behind';
    }

    return {
      pattern,
      solved,
      target,
      percentage,
      status,
    };
  });

  // Calculate weakest patterns (lowest percentage, highest remaining need)
  const weakestPatterns = [...patterns]
    .filter((p) => p.target > 0)
    .sort((a, b) => {
      if (a.percentage !== b.percentage) {
        return a.percentage - b.percentage;
      }
      const neededA = a.target - a.solved;
      const neededB = b.target - b.solved;
      if (neededA !== neededB) {
        return neededB - neededA; // higher remaining need first
      }
      return a.pattern.localeCompare(b.pattern);
    })
    .slice(0, 3);

  const overallPercentage =
    totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 1000) / 10 : 0;

  return {
    patterns,
    totalSolved,
    totalTarget,
    overallPercentage,
    weakestPatterns,
  };
}
