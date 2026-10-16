import { collection, doc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { toast } from '@/components/ui/toast';
import { todayIST } from '@winter-arc/shared';

export async function loadDemoData(uid: string): Promise<boolean> {
  if (!uid) return false;

  try {
    toast.info('Loading Demo Data', 'Populating sample problems, applications, and logs...');
    const batch = writeBatch(db);
    const today = todayIST();

    // 1. Demo Problems
    const problemsCol = collection(db, 'users', uid, 'problems');
    const p1 = doc(problemsCol);
    batch.set(p1, {
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      platform: 'leetcode',
      pattern: 'Arrays & Hashing',
      difficulty: 'easy',
      solvedAt: today,
      timeTakenMin: 12,
      outcome: 'clean',
      insight: 'Hash map complement lookup gives O(n) time',
      stuckAt: '',
      complexity: { time: 'O(n)', space: 'O(n)' },
      tags: ['hashmap', 'array'],
      revision: {
        step: 2,
        nextDue: '2026-10-23',
        history: [{ date: today, result: 'pass', fromStep: 1, toStep: 2 }],
        mastered: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const p2 = doc(problemsCol);
    batch.set(p2, {
      title: 'Container With Most Water',
      url: 'https://leetcode.com/problems/container-with-most-water/',
      platform: 'leetcode',
      pattern: 'Two Pointers',
      difficulty: 'medium',
      solvedAt: today,
      timeTakenMin: 22,
      outcome: 'clean',
      insight: 'Shrink window by moving the pointer with shorter height',
      stuckAt: '',
      complexity: { time: 'O(n)', space: 'O(1)' },
      tags: ['two-pointers', 'greedy'],
      revision: {
        step: 0,
        nextDue: today,
        history: [],
        mastered: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Demo Mistakes
    const mistakesCol = collection(db, 'users', uid, 'mistakes');
    const m1 = doc(mistakesCol);
    batch.set(m1, {
      date: today,
      text: 'Off-by-one loop boundary on binary search right pointer when using low <= high.',
      pattern: 'Binary Search',
      reviewedWeeks: ['2026-W42'],
      createdAt: serverTimestamp(),
    });

    // 3. Demo Mock
    const mocksCol = collection(db, 'users', uid, 'mocks');
    const mk1 = doc(mocksCol);
    batch.set(mk1, {
      date: today,
      type: 'dsa',
      platform: 'peer',
      interviewer: 'Alex (Senior SWE)',
      durationMin: 50,
      score: 4,
      strengths: 'Clear verbal communication, proactive edge case identification.',
      weaknesses: 'Took 10 minutes to formulate optimal space complexity solution.',
      actionItems: ['Practice in-place memory optimization for graph problems'],
      problemTitles: ['Alien Dictionary', 'Course Schedule II'],
      createdAt: serverTimestamp(),
    });

    // 4. Demo Applications
    const appsCol = collection(db, 'users', uid, 'applications');
    const a1 = doc(appsCol);
    batch.set(a1, {
      company: 'Razorpay',
      role: 'SDE-1 (Backend)',
      url: 'https://careers.razorpay.com/job/sample',
      source: 'referral',
      status: 'oa',
      appliedDate: today,
      referral: true,
      referrerName: 'Karthik S.',
      salaryLPA: 22,
      location: 'Bengaluru, India',
      notes: 'OA invitation received. Scheduled for Saturday.',
      statusHistory: [
        { status: 'saved', date: today },
        { status: 'applied', date: today },
        { status: 'oa', date: today },
      ],
      createdAt: serverTimestamp(),
    });

    const a2 = doc(appsCol);
    batch.set(a2, {
      company: 'Swiggy',
      role: 'Software Development Engineer - Fresher',
      url: 'https://careers.swiggy.com/job/sample',
      source: 'career-page',
      status: 'interview',
      appliedDate: today,
      referral: false,
      salaryLPA: 18,
      location: 'Bengaluru, India',
      notes: 'Technical round 1 cleared. Moving to system design & behavioral round.',
      statusHistory: [
        { status: 'saved', date: today },
        { status: 'applied', date: today },
        { status: 'oa', date: today },
        { status: 'interview', date: today },
      ],
      createdAt: serverTimestamp(),
    });

    // 5. Demo Daily Log
    const logDoc = doc(db, 'users', uid, 'dailyLogs', today);
    batch.set(logDoc, {
      date: today,
      wakeTime: '06:00',
      sleepTime: '22:45',
      sleepHours: 7.25,
      startupHours: 4.5,
      gymDone: true,
      gymHours: 2.0,
      energy: 5,
      win: 'Solved 2 medium problems and passed Swiggy Technical Round 1!',
      wentWrong: 'Lost 20 minutes in the morning on phone notifications.',
      tomorrowTop3: [
        'Complete 3 Dynamic Programming problems',
        'Review Splitwise LLD design',
        'Submit 5 referral applications',
      ],
      notes: 'Energy stayed high all day. Gym leg workout was intense.',
      overrides: {},
      dueRevisionsAtStart: 1,
      floorMet: true,
      submitted: true,
      submittedAt: serverTimestamp(),
      checklist: { 'sb-1': true, 'sb-2': true, 'sb-3': true, 'sb-9': true },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    toast.success('Demo Data Loaded', 'Sample problems, applications, and logs loaded.');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load demo data';
    console.error('[Demo Data Error]:', err);
    toast.error('Demo Load Failed', message);
    return false;
  }
}

export async function clearDemoData(uid: string): Promise<boolean> {
  if (!uid) return false;

  try {
    toast.info('Clearing Data', 'Removing transactional records...');

    const collectionsToClear = [
      'problems',
      'mistakes',
      'mocks',
      'applications',
      'dailyLogs',
      'jobs',
      'weeklyReviews',
    ];

    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, 'users', uid, colName));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    toast.success('Clear Complete', 'All transactional and demo records removed.');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to clear data';
    console.error('[Demo Clear Error]:', err);
    toast.error('Clear Failed', message);
    return false;
  }
}
