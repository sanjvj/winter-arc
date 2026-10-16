import { Application } from './schemas';
import { diffDaysIST } from './time';

export interface FunnelMetrics {
  total: number;
  saved: number;
  applied: number;
  oa: number;
  interview: number;
  offer: number;
  rejected: number;
  ghosted: number;
  withdrawn: number;
  oaRate: number; // % of applied
  interviewRate: number; // % of applied
  offerRate: number; // % of applied
  averageDaysToFirstResponse: number | null; // average days from applied to OA/interview/rejection
  referralConversion: {
    applied: number;
    interview: number;
    rate: number;
  };
  nonReferralConversion: {
    applied: number;
    interview: number;
    rate: number;
  };
}

/**
 * Checks whether an application reached a given status stage either currently
 * or at any point in its recorded statusHistory.
 */
function hasReachedStatus(app: Application, targetStatuses: string[]): boolean {
  if (targetStatuses.includes(app.status)) {
    return true;
  }
  return app.statusHistory?.some((h) => targetStatuses.includes(h.status)) ?? false;
}

/**
 * Calculates application funnel conversion rates, response latency,
 * and referral vs non-referral performance.
 */
export function calculatePipelineFunnel(applications: Application[]): FunnelMetrics {
  const total = applications.length;

  let saved = 0;
  let applied = 0;
  let oa = 0;
  let interview = 0;
  let offer = 0;
  let rejected = 0;
  let ghosted = 0;
  let withdrawn = 0;

  let referralApplied = 0;
  let referralInterview = 0;
  let nonReferralApplied = 0;
  let nonReferralInterview = 0;

  const responseLatencies: number[] = [];

  for (const app of applications) {
    if (app.status === 'saved') {
      saved++;
    } else {
      applied++;
      if (app.referral) {
        referralApplied++;
      } else {
        nonReferralApplied++;
      }
    }

    if (app.status === 'rejected') rejected++;
    if (app.status === 'ghosted') ghosted++;
    if (app.status === 'withdrawn') withdrawn++;

    // Did application reach OA?
    const reachedOA = hasReachedStatus(app, ['oa', 'interview', 'offer']);
    if (reachedOA) {
      oa++;
    }

    // Did application reach Interview?
    const reachedInterview = hasReachedStatus(app, ['interview', 'offer']);
    if (reachedInterview) {
      interview++;
      if (app.referral) {
        referralInterview++;
      } else {
        nonReferralInterview++;
      }
    }

    // Did application reach Offer?
    if (hasReachedStatus(app, ['offer'])) {
      offer++;
    }

    // Calculate response latency if a response was received (OA, interview, or rejected)
    const responseStatuses = ['oa', 'interview', 'offer', 'rejected'];
    if (app.appliedDate && app.statusHistory && app.statusHistory.length > 0) {
      const responseEntries = app.statusHistory
        .filter((h) => responseStatuses.includes(h.status) && h.date >= app.appliedDate)
        .sort((a, b) => a.date.localeCompare(b.date));

      const firstResponse = responseEntries[0];
      if (firstResponse) {
        const days = diffDaysIST(app.appliedDate, firstResponse.date);
        if (days >= 0) {
          responseLatencies.push(days);
        }
      }
    }
  }

  const oaRate = applied > 0 ? Math.round((oa / applied) * 1000) / 10 : 0;
  const interviewRate = applied > 0 ? Math.round((interview / applied) * 1000) / 10 : 0;
  const offerRate = applied > 0 ? Math.round((offer / applied) * 1000) / 10 : 0;

  const averageDaysToFirstResponse =
    responseLatencies.length > 0
      ? Math.round(
          (responseLatencies.reduce((sum, d) => sum + d, 0) / responseLatencies.length) * 10,
        ) / 10
      : null;

  const referralRate =
    referralApplied > 0 ? Math.round((referralInterview / referralApplied) * 1000) / 10 : 0;
  const nonReferralRate =
    nonReferralApplied > 0
      ? Math.round((nonReferralInterview / nonReferralApplied) * 1000) / 10
      : 0;

  return {
    total,
    saved,
    applied,
    oa,
    interview,
    offer,
    rejected,
    ghosted,
    withdrawn,
    oaRate,
    interviewRate,
    offerRate,
    averageDaysToFirstResponse,
    referralConversion: {
      applied: referralApplied,
      interview: referralInterview,
      rate: referralRate,
    },
    nonReferralConversion: {
      applied: nonReferralApplied,
      interview: nonReferralInterview,
      rate: nonReferralRate,
    },
  };
}

/**
 * Returns active applications with overdue follow-ups, sorted oldest-first.
 * Excludes terminal statuses (rejected, withdrawn, offer).
 */
export function getOverdueFollowUps(
  applications: Application[],
  referenceDate: string,
): Application[] {
  const terminalStatuses = ['rejected', 'withdrawn', 'offer'];

  return applications
    .filter((app) => {
      if (terminalStatuses.includes(app.status)) return false;
      return Boolean(app.followUpDate && app.followUpDate <= referenceDate);
    })
    .sort((a, b) => {
      const dateA = a.followUpDate ?? '';
      const dateB = b.followUpDate ?? '';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      return a.company.localeCompare(b.company);
    });
}
