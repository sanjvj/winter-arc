import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { createDefaultSettings, createDefaultRoadmap, todayIST } from '@winter-arc/shared';

export interface SeedResult {
  seeded: boolean;
  message: string;
}

/**
 * Idempotent seeder: Runs ONLY if settings/main is missing for the user.
 * If settings/main already exists, this function safely exits without writing.
 */
export async function seedFirstLogin(uid: string): Promise<SeedResult> {
  if (!uid) {
    return { seeded: false, message: 'No authenticated user UID provided.' };
  }

  const settingsDocRef = doc(db, 'users', uid, 'settings', 'main');
  const roadmapDocRef = doc(db, 'users', uid, 'roadmap', 'main');

  try {
    const settingsSnap = await getDoc(settingsDocRef);
    if (settingsSnap.exists()) {
      return { seeded: false, message: 'Settings already initialized. Seeding skipped.' };
    }

    console.log(`[Seed Engine] First login detected for user ${uid}. Initializing defaults...`);

    const batch = writeBatch(db);

    const defaultSettings = createDefaultSettings(todayIST());
    batch.set(settingsDocRef, {
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const defaultRoadmap = createDefaultRoadmap();
    batch.set(roadmapDocRef, {
      ...defaultRoadmap,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    console.log(
      `[Seed Engine] Successfully initialized settings/main and roadmap/main for user ${uid}.`,
    );
    return { seeded: true, message: 'First-login seed completed successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown seed failure';
    console.error(`[Seed Engine Error] Failed to seed user ${uid}:`, err);
    throw new Error(`First-login seed failed: ${message}`);
  }
}
