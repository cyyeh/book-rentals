import firebase from 'firebase/compat/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseDB = getFirestore(firebaseApp);
