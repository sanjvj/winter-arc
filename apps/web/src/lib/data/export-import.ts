import { collection, doc, getDoc, getDocs, writeBatch, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { toast } from '@/components/ui/toast';

export interface ExportDataPayload {
  version: 1;
  exportedAt: string;
  uid: string;
  settings?: DocumentData;
  roadmap?: DocumentData;
  dailyLogs?: DocumentData[];
  problems?: DocumentData[];
  mistakes?: DocumentData[];
  mocks?: DocumentData[];
  applications?: DocumentData[];
  jobs?: DocumentData[];
  weeklyReviews?: DocumentData[];
  patternNotes?: DocumentData[];
}

export interface ImportDryRunSummary {
  valid: boolean;
  error?: string;
  hasSettings: boolean;
  hasRoadmap: boolean;
  counts: {
    dailyLogs: number;
    problems: number;
    mistakes: number;
    mocks: number;
    applications: number;
    jobs: number;
    weeklyReviews: number;
    patternNotes: number;
  };
}

export async function exportAllUserData(uid: string): Promise<ExportDataPayload | null> {
  if (!uid) return null;

  try {
    toast.info('Exporting Data', 'Packaging complete Winter Arc collections...');

    // Singletons
    const settingsSnap = await getDoc(doc(db, 'users', uid, 'settings', 'main'));
    const roadmapSnap = await getDoc(doc(db, 'users', uid, 'roadmap', 'main'));

    // Collections
    const fetchCol = async (name: string) => {
      const snap = await getDocs(collection(db, 'users', uid, name));
      return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    };

    const [dailyLogs, problems, mistakes, mocks, applications, jobs, weeklyReviews, patternNotes] =
      await Promise.all([
        fetchCol('dailyLogs'),
        fetchCol('problems'),
        fetchCol('mistakes'),
        fetchCol('mocks'),
        fetchCol('applications'),
        fetchCol('jobs'),
        fetchCol('weeklyReviews'),
        fetchCol('patternNotes'),
      ]);

    const payload: ExportDataPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      uid,
      settings: settingsSnap.exists() ? settingsSnap.data() : undefined,
      roadmap: roadmapSnap.exists() ? roadmapSnap.data() : undefined,
      dailyLogs,
      problems,
      mistakes,
      mocks,
      applications,
      jobs,
      weeklyReviews,
      patternNotes,
    };

    // Trigger browser file download
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winter-arc-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Export Complete', 'Downloaded complete Winter Arc JSON backup.');
    return payload;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    console.error('[Export Error]:', err);
    toast.error('Export Failed', message);
    return null;
  }
}

export function analyzeImportData(rawJson: string): {
  summary: ImportDryRunSummary;
  parsedData: ExportDataPayload | null;
} {
  try {
    const data = JSON.parse(rawJson) as ExportDataPayload;

    if (!data || typeof data !== 'object') {
      return {
        summary: {
          valid: false,
          error: 'Invalid JSON file content.',
          hasSettings: false,
          hasRoadmap: false,
          counts: {
            dailyLogs: 0,
            problems: 0,
            mistakes: 0,
            mocks: 0,
            applications: 0,
            jobs: 0,
            weeklyReviews: 0,
            patternNotes: 0,
          },
        },
        parsedData: null,
      };
    }

    const counts = {
      dailyLogs: Array.isArray(data.dailyLogs) ? data.dailyLogs.length : 0,
      problems: Array.isArray(data.problems) ? data.problems.length : 0,
      mistakes: Array.isArray(data.mistakes) ? data.mistakes.length : 0,
      mocks: Array.isArray(data.mocks) ? data.mocks.length : 0,
      applications: Array.isArray(data.applications) ? data.applications.length : 0,
      jobs: Array.isArray(data.jobs) ? data.jobs.length : 0,
      weeklyReviews: Array.isArray(data.weeklyReviews) ? data.weeklyReviews.length : 0,
      patternNotes: Array.isArray(data.patternNotes) ? data.patternNotes.length : 0,
    };

    return {
      summary: {
        valid: true,
        hasSettings: Boolean(data.settings),
        hasRoadmap: Boolean(data.roadmap),
        counts,
      },
      parsedData: data,
    };
  } catch (err) {
    return {
      summary: {
        valid: false,
        error: 'JSON parsing syntax error: ' + (err instanceof Error ? err.message : 'Unknown'),
        hasSettings: false,
        hasRoadmap: false,
        counts: {
          dailyLogs: 0,
          problems: 0,
          mistakes: 0,
          mocks: 0,
          applications: 0,
          jobs: 0,
          weeklyReviews: 0,
          patternNotes: 0,
        },
      },
      parsedData: null,
    };
  }
}

export async function commitImportData(uid: string, data: ExportDataPayload): Promise<boolean> {
  if (!uid || !data) return false;

  try {
    toast.info('Importing Data', 'Writing backup collections to Firestore...');

    const batch = writeBatch(db);

    if (data.settings) {
      batch.set(doc(db, 'users', uid, 'settings', 'main'), data.settings);
    }
    if (data.roadmap) {
      batch.set(doc(db, 'users', uid, 'roadmap', 'main'), data.roadmap);
    }

    const importArray = (name: string, arr?: DocumentData[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        const id = item.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, 'users', uid, name, id);
        batch.set(docRef, item);
      }
    };

    importArray('dailyLogs', data.dailyLogs);
    importArray('problems', data.problems);
    importArray('mistakes', data.mistakes);
    importArray('mocks', data.mocks);
    importArray('applications', data.applications);
    importArray('jobs', data.jobs);
    importArray('weeklyReviews', data.weeklyReviews);
    importArray('patternNotes', data.patternNotes);

    await batch.commit();

    toast.success('Import Successful', 'All backup collections restored into your command center.');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    console.error('[Import Error]:', err);
    toast.error('Import Failed', message);
    return false;
  }
}
