import * as admin from 'firebase-admin';

// Support emulator environment
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    const existing = admin.apps[0];
    if (existing) return existing;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'winter-arc-c2def';

  // In emulator mode or without full credentials, initialize with projectId
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' || !process.env.FIREBASE_PRIVATE_KEY) {
    return admin.initializeApp({
      projectId,
    });
  }

  // In production with service account credentials
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const adminApp = getAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
