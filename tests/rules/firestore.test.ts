import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

const OWNER_EMAIL = 'sanjay@winterarc.local';
const OWNER_UID = 'sanjay-uid-001';
const OTHER_UID = 'stranger-uid-002';
const OTHER_EMAIL = 'stranger@example.com';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    // Ensure rules are built
    if (!fs.existsSync(rulesPath)) {
      throw new Error(`firestore.rules not found at ${rulesPath}. Run pnpm rules:build first.`);
    }
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'winter-arc-test-project',
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('denies unauthenticated read and write requests', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.collection('users').doc(OWNER_UID).collection('settings').doc('main');

    await assertFails(docRef.get());
    await assertFails(docRef.set({ theme: 'dark' }));
  });

  it('denies authenticated user accessing another user UID path', async () => {
    // Authenticated with owner email, but trying to read/write a different UID
    const authedDb = testEnv.authenticatedContext(OWNER_UID, { email: OWNER_EMAIL }).firestore();

    const strangerDocRef = authedDb
      .collection('users')
      .doc(OTHER_UID)
      .collection('settings')
      .doc('main');

    await assertFails(strangerDocRef.get());
    await assertFails(strangerDocRef.set({ theme: 'dark' }));
  });

  it('denies authenticated user when email is not the literal OWNER_EMAIL', async () => {
    // User with matching UID but unauthorized email
    const unauthorizedDb = testEnv
      .authenticatedContext(OTHER_UID, { email: OTHER_EMAIL })
      .firestore();

    const docRef = unauthorizedDb
      .collection('users')
      .doc(OTHER_UID)
      .collection('settings')
      .doc('main');

    await assertFails(docRef.get());
    await assertFails(docRef.set({ theme: 'dark' }));
  });

  it('allows owner with matching UID and OWNER_EMAIL to read and write', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID, { email: OWNER_EMAIL }).firestore();

    const docRef = ownerDb.collection('users').doc(OWNER_UID).collection('settings').doc('main');

    await assertSucceeds(docRef.set({ theme: 'dark', planStartDate: '2026-10-01' }));
    await assertSucceeds(docRef.get());
  });

  it('denies read and write access to collections outside /users/{uid}/**', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID, { email: OWNER_EMAIL }).firestore();

    const rootDocRef = ownerDb.collection('publicData').doc('feed');
    await assertFails(rootDocRef.get());
    await assertFails(rootDocRef.set({ message: 'public' }));
  });
});
