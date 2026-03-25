import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDAfLJi2wPLIquV8cIIRkYTnCl14DAW1tI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'scan-addis.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'scan-addis',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'scan-addis.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '306997629562',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:306997629562:web:79bc178afd648c519ee1c3',
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Loaded' : '✗ Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
