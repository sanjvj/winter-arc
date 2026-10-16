import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-winter-arc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-winter-arc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Check if running against emulators
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  // Only connect once in browser
  const isBrowser = typeof window !== 'undefined';
  const emulatorKey = '__FIREBASE_EMULATORS_CONNECTED__';
  if (isBrowser && !(window as unknown as Record<string, boolean>)[emulatorKey]) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      (window as unknown as Record<string, boolean>)[emulatorKey] = true;
      console.log('[Firebase] Connected to local Auth (:9099) and Firestore (:8080) emulators');
    } catch (e) {
      console.warn('[Firebase] Emulator connection skipped or already initialized:', e);
    }
  }
}

export { app, auth, db };
