/**
 * Server-side Firebase initialization for API routes
 * This file can be imported in Next.js API routes and server components
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let serverFirebaseInstance: {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} | null = null;

/**
 * Get or initialize Firebase for server-side use (API routes, server components)
 * This is separate from the client-side initialization
 */
export function getServerFirebase() {
  // Return cached instance if available
  if (serverFirebaseInstance) {
    return serverFirebaseInstance;
  }

  // Check if already initialized globally
  const apps = getApps();
  let app: FirebaseApp;

  if (apps.length > 0) {
    app = apps[0];
  } else {
    // Initialize new app with config
    try {
      // Try to initialize without config first (for Firebase App Hosting)
      app = initializeApp();
    } catch (e) {
      // Fallback to using the config object
      if (process.env.NODE_ENV !== "production") {
        app = initializeApp(firebaseConfig, 'server-app');
      } else {
        console.warn('Firebase initialization on server failed:', e);
        app = initializeApp(firebaseConfig, 'server-app');
      }
    }
  }

  // Cache the instance
  serverFirebaseInstance = {
    app,
    firestore: getFirestore(app),
    auth: getAuth(app)
  };

  return serverFirebaseInstance;
}
