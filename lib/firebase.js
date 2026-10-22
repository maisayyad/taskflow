// Firebase client initialisation. Public web config comes from environment variables
// (see .env.example). Initialisation is lazy so pages can still render (and show a helpful
// "not configured" message) when the variables are missing, e.g. during `next build`.

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Next.js only inlines NEXT_PUBLIC_* variables when they are referenced literally.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let instance = null;

/** Returns { app, auth, db }. Throws if the environment variables are missing. */
export function getFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and fill in the values.",
    );
  }
  if (!instance) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    instance = { app, auth: getAuth(app), db: getFirestore(app) };
  }
  return instance;
}
