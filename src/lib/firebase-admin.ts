import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';


const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!firebaseProjectId) {
  throw new Error('Firebase Project ID is missing. Set FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
}

if (!firebaseClientEmail) {
  throw new Error('Firebase Client Email is missing. Set FIREBASE_CLIENT_EMAIL');
}

if (!firebasePrivateKey) {
  throw new Error('Firebase Private Key is missing. Set FIREBASE_PRIVATE_KEY');
}

if (!firebaseStorageBucket) {
  throw new Error('Firebase Storage Bucket is missing. Set FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: firebaseProjectId,
      clientEmail: firebaseClientEmail,
      privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
    }),
    storageBucket: firebaseStorageBucket,
  });
}

export const adminStorage = getStorage();
