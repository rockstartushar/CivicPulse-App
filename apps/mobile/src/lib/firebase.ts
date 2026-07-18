import { initializeApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
const config = { apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID };
const app = getApps()[0] ?? initializeApp(config);
const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
// Demo mode deliberately does not initialise Firebase Auth, so it can run with no external credentials.
export const auth: Auth | null = demoMode ? null : getAuth(app);
