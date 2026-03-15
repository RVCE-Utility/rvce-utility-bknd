import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getDatabase,
  onValue,
  push,
  ref,
  runTransaction,
} from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = firebaseConfig.databaseURL
  ? getDatabase(app, firebaseConfig.databaseURL)
  : getDatabase(app);

let analyticsPromise: Promise<Analytics | null> | null = null;

export const getClientAnalytics = async () => {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) {
    return null;
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
};

export interface RedesignFeedbackPayload {
  rating?: number;
  suggestion?: string;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  page?: string | null;
  version?: string;
  engagement?: string | null;
}

export interface RedesignFeedbackEntry {
  id: string;
  rating: number;
  suggestion: string;
  userId: string | null;
  email: string | null;
  name: string | null;
  page: string | null;
  version: string;
  engagement: string | null;
  createdAt: number;
}

const normalizeFeedbackField = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const listenToRedesignFeedback = (
  callback: (entries: RedesignFeedbackEntry[]) => void,
  onError?: (error: unknown) => void,
) => {
  const feedbackRef = ref(db, "feedback/redesign");

  return onValue(
    feedbackRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const raw = snapshot.val() as Record<
        string,
        Partial<RedesignFeedbackEntry>
      >;
      const entries = Object.entries(raw)
        .map(([id, value]) => ({
          id,
          rating: Number(value?.rating) || 0,
          suggestion: (value?.suggestion || "").toString(),
          userId: normalizeFeedbackField(value?.userId),
          email: normalizeFeedbackField(value?.email),
          name: normalizeFeedbackField(value?.name),
          page: normalizeFeedbackField(value?.page),
          version: (value?.version || "redesign-2026-v1").toString(),
          engagement: normalizeFeedbackField(value?.engagement),
          createdAt: Number(value?.createdAt) || 0,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      callback(entries);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
};

export const incrementVisitCount = async () => {
  const visitsRef = ref(db, "stats/totalVisits");
  await runTransaction(visitsRef, (currentVisits) => {
    if (currentVisits === null) {
      return 14503;
    }
    return (Number(currentVisits) || 0) + 1;
  });
};

export const incrementResourceCount = async (count = 1) => {
  const resourceRef = ref(db, "stats/totalResources");
  await runTransaction(resourceRef, (currentCount) => {
    if (currentCount === null) {
      return 345 + count;
    }
    return (Number(currentCount) || 0) + count;
  });
};

export const incrementVerifiedUserCount = async () => {
  const verifiedUsersRef = ref(db, "stats/verifiedUsers");
  await runTransaction(verifiedUsersRef, (currentCount) => {
    if (currentCount === null) {
      return 1433;
    }
    return (Number(currentCount) || 0) + 1;
  });
};

export const submitRedesignFeedback = async (
  payload: RedesignFeedbackPayload,
) => {
  const feedbackRef = ref(db, "feedback/redesign");
  const rating = Math.min(5, Math.max(1, Number(payload?.rating) || 1));

  const safePayload = {
    rating,
    suggestion: (payload?.suggestion || "").toString().slice(0, 500),
    userId: payload?.userId || null,
    email: payload?.email || null,
    name: payload?.name || null,
    page: payload?.page || null,
    version: payload?.version || "redesign-2026-v1",
    engagement: payload?.engagement || null,
    createdAt: Date.now(),
  };

  return push(feedbackRef, safePayload);
};

export { app, db };
