import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { ENV } from "./env.js";

let firebaseAuthInstance: Auth | null = null;

export const initFirebase = (): Auth | null => {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAuthInstance = getAuth(existingApps[0]);
    return firebaseAuthInstance;
  }

  const projectId = ENV.FIREBASE_PROJECT_ID;
  const clientEmail = ENV.FIREBASE_CLIENT_EMAIL;
  const privateKey = ENV.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      firebaseAuthInstance = getAuth(app);
      console.log("[Firebase] Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("[Firebase] Error initializing Firebase Admin SDK:", error);
    }
  } else {
    console.warn(
      "[Firebase] Firebase Admin credentials not set in environment (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)."
    );
  }

  return firebaseAuthInstance;
};

export const getFirebaseAuth = (): Auth | null => {
  if (!firebaseAuthInstance) {
    return initFirebase();
  }
  return firebaseAuthInstance;
};
