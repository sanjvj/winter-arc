import { describe, it, expect } from 'vitest';
import { calculatePipelineFunnel, getOverdueFollowUps, Application } from '../src';

describe('Spec Funnel Analytics & Follow-ups', () => {
  const makeApp = (
    id: string,
    company: string,
    status: Application['status'],
    options: {
      referral?: boolean;
      appliedDate?: string;
      followUpDate?: string;
      statusHistory?: Array<{ status: string; date: string }>;
    } = {},
  ): Application => ({
    id,
    company,
    role: 'SDE-1',
    url: 'https://example.com/apply',
    source: 'referral',
    status,
    appliedDate: options.appliedDate ?? '2026-10-01',
    referral: options.referral ?? false,
    location: 'Bengaluru',
    notes: '',
    followUpDate: options.followUpDate,
    statusHistory: options.statusHistory ?? [{ status, date: options.appliedDate ?? '2026-10-01' }],
  });

  it('calculates funnel conversion rates and response latency', () => {
    const apps: Application[] = [
      makeApp('1', 'Google', 'interview', {
        referral: true,
        appliedDate: '2026-10-01',
        statusHistory: [
          { status: 'applied', date: '2026-10-01' },
          { status: 'oa', date: '2026-10-05' },
          { status: 'interview', date: '2026-10-12' },
        ],
      }),
      makeApp('2', 'Amazon', 'oa', {
        referral: false,
        appliedDate: '2026-10-02',
        statusHistory: [
          { status: 'applied', date: '2026-10-02' },
          { status: 'oa', date: '2026-10-08' },
        ],
      }),
      makeApp('3', 'Microsoft', 'rejected', {
        referral: false,
        appliedDate: '2026-10-03',
        statusHistory: [
          { status: 'applied', date: '2026-10-03' },
          { status: 'rejected', date: '2026-10-07' },
        ],
      }),
      makeApp('4', 'Stripe', 'offer', {
        referral: true,
        appliedDate: '2026-10-01',
        statusHistory: [
          { status: 'applied', date: '2026-10-01' },
          { status: 'interview', date: '2026-10-07' },
          { status: 'offer', date: '2026-10-15' },
        ],
      }),
      makeApp('5', 'Meta', 'applied', { referral: false }),
      makeApp('6', 'Apple', 'saved', { referral: false }),
    ];

    const funnel = calculatePipelineFunnel(apps);

    expect(funnel.total).toBe(6);
    expect(funnel.saved).toBe(1);
    expect(funnel.applied).toBe(5);

    // Reached OA: Google (1), Amazon (2), Stripe (4 - skipped straight to interview)
    // Note: Stripe reached interview/offer so counts in OA funnel stage
    expect(funnel.oa).toBe(3);
    expect(funnel.oaRate).toBe(60); // 3/5 = 60%

    // Reached Interview: Google (1), Stripe (4) -> 2
    expect(funnel.interview).toBe(2);
    expect(funnel.interviewRate).toBe(40); // 2/5 = 40%

    // Reached Offer: Stripe (4) -> 1
    expect(funnel.offer).toBe(1);
    expect(funnel.offerRate).toBe(20); // 1/5 = 20%

    // First Response Latency:
    // Google: applied 10-01, OA 10-05 -> 4 days
    // Amazon: applied 10-02, OA 10-08 -> 6 days
    // Microsoft: applied 10-03, rejected 10-07 -> 4 days
    // Stripe: applied 10-01, interview 10-07 -> 6 days
    // Average = (4 + 6 + 4 + 6) / 4 = 5.0 days
    expect(funnel.averageDaysToFirstResponse).toBe(5);

    // Referral split:
    // Referrals applied: 2 (Google, Stripe)
    // Referrals reaching interview: 2
    // Referral rate: 100%
    expect(funnel.referralConversion.applied).toBe(2);
    expect(funnel.referralConversion.interview).toBe(2);
    expect(funnel.referralConversion.rate).toBe(100);

    // Non-referrals applied: 3 (Amazon, Microsoft, Meta)
    // Non-referrals interview: 0
    expect(funnel.nonReferralConversion.applied).toBe(3);
    expect(funnel.nonReferralConversion.interview).toBe(0);
    expect(funnel.nonReferralConversion.rate).toBe(0);
  });

  it('filters and sorts overdue follow-ups oldest-first excluding terminal statuses', () => {
    const today = '2026-10-16';
    const apps: Application[] = [
      makeApp('1', 'Zomato', 'applied', { followUpDate: '2026-10-10' }),
      makeApp('2', 'Swiggy', 'applied', { followUpDate: '2026-10-05' }), // oldest
      makeApp('3', 'Razorpay', 'applied', { followUpDate: '2026-10-16' }), // due today
      makeApp('4', 'Zepto', 'applied', { followUpDate: '2026-10-22' }), // future
      makeApp('5', 'Blinkit', 'rejected', { followUpDate: '2026-10-01' }), // rejected -> excluded
      makeApp('6', 'Cred', 'offer', { followUpDate: '2026-10-02' }), // offer -> excluded
    ];

    const overdue = getOverdueFollowUps(apps, today);

    expect(overdue.map((a) => a.company)).toEqual(['Swiggy', 'Zomato', 'Razorpay']);
  });
});
