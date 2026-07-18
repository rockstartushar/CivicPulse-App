import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
const hasFirebaseConfig = Boolean(config.apiKey && config.projectId && config.appId && !String(config.apiKey).startsWith('REPLACE_'));

// Demo mode and missing credentials skip Firebase so Expo Go can start without a project.
let app: FirebaseApp | null = null;
if (!demoMode && hasFirebaseConfig) {
  app = getApps()[0] ?? initializeApp(config);
}

export const auth: Auth | null = app ? getAuth(app) : null;
