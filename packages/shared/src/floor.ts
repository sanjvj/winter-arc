import { Problem, Application, Mock, Overrides, Floor } from './schemas';

export interface DailyCounters {
  problems: number;
  revisions: number;
  applications: number;
  mocks: number;
  autoDerived: {
    problems: number;
    revisions: number;
    applications: number;
    mocks: number;
  };
}

export interface FloorEvaluationResult {
  floorMet: boolean;
  conditions: {
    problemsMet: boolean;
    revisionsMet: boolean;
    applicationsMet: boolean;
    logSubmittedMet: boolean;
  };
  missing: string[];
}

/**
 * Spec 7.1: Calculates auto-derived counters for date D, applying overrides if present.
 */
export function calculateDailyCounters(
  date: string,
  data: {
    problems?: Problem[];
    applications?: Application[];
    mocks?: Mock[];
    overrides?: Overrides;
  },
): DailyCounters {
  const problemsList = data.problems || [];
  const applicationsList = data.applications || [];
  const mocksList = data.mocks || [];
  const overrides = data.overrides || {};

  // 1. Problems solved on date D
  const derivedProblems = problemsList.filter((p) => p.solvedAt === date).length;

  // 2. Revisions completed on date D (entries in revision.history)
  let derivedRevisions = 0;
  for (const p of problemsList) {
    if (p.revision?.history && Array.isArray(p.revision.history)) {
      derivedRevisions += p.revision.history.filter((h) => h.date === date).length;
    }
  }

  // 3. Applications submitted on date D
  const derivedApplications = applicationsList.filter((a) => a.appliedDate === date).length;

  // 4. Mocks completed on date D
  const derivedMocks = mocksList.filter((m) => m.date === date).length;

  const autoDerived = {
    problems: derivedProblems,
    revisions: derivedRevisions,
    applications: derivedApplications,
    mocks: derivedMocks,
  };

  return {
    problems: overrides.problems !== undefined ? overrides.problems : derivedProblems,
    revisions: overrides.revisions !== undefined ? overrides.revisions : derivedRevisions,
    applications:
      overrides.applications !== undefined ? overrides.applications : derivedApplications,
    mocks: derivedMocks,
    autoDerived,
  };
}

/**
 * Spec 7.2: Daily Floor Completion Check (floorMet(D))
 * Returns true if and only if all floor conditions evaluate to true.
 */
export function evaluateFloorMet(
  counts: {
    problems: number;
    revisions: number;
    applications: number;
  },
  floor: Floor,
  dueRevisionsAtStart: number = 0,
  submitted: boolean = false,
): FloorEvaluationResult {
  const problemsMet = counts.problems >= floor.problems;
  // If dueRevisionsAtStart == 0, revision requirement is automatically met
  const revisionsMet = dueRevisionsAtStart === 0 || counts.revisions >= floor.revisions;
  const applicationsMet = counts.applications >= floor.applications;
  const logSubmittedMet = floor.requireLog === false || submitted === true;

  const missing: string[] = [];
  if (!problemsMet) {
    const diff = floor.problems - counts.problems;
    missing.push(`${diff} more problem${diff > 1 ? 's' : ''}`);
  }
  if (!revisionsMet) {
    const diff = floor.revisions - counts.revisions;
    missing.push(`${diff} more revision${diff > 1 ? 's' : ''}`);
  }
  if (!applicationsMet) {
    const diff = floor.applications - counts.applications;
    missing.push(`${diff} more application${diff > 1 ? 's' : ''}`);
  }
  if (!logSubmittedMet) {
    missing.push('Daily log must be closed and submitted');
  }

  const floorMet = problemsMet && revisionsMet && applicationsMet && logSubmittedMet;

  return {
    floorMet,
    conditions: {
      problemsMet,
      revisionsMet,
      applicationsMet,
      logSubmittedMet,
    },
    missing,
  };
}
