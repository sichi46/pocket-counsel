// apps/web/src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for pocket-counsel project
const firebaseConfig = {
  apiKey: "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U",
  authDomain: "pocket-counsel.firebaseapp.com",
  projectId: "pocket-counsel",
  storageBucket: "pocket-counsel.appspot.com",
  messagingSenderId: "787651119619",
  appId: "1:787651119619:web:your-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
