import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCKe3naEYWHoI32tT1QCN3zKPO-iyU_vZ4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'winter-arc-c2def.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'winter-arc-c2def',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'winter-arc-c2def.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1014198011522',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1014198011522:web:3203caf9757981023b569b',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-P6Z2XNVGS0',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Initialize analytics only on client-side when not in emulator mode
let analytics: unknown = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId && process.env.NEXT_PUBLIC_USE_EMULATORS !== 'true') {
  import('firebase/analytics')
    .then(({ isSupported, getAnalytics }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    })
    .catch(() => {});
}

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

export { app, auth, db, analytics };
