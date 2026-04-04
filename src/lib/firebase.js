import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyB8qJM5kA5t126rNWBPMCzEbzspTgHYGqQ",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "medipath-c91bf.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "medipath-c91bf",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "medipath-c91bf.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "236982445915",
    appId: env.VITE_FIREBASE_APP_ID || "1:236982445915:web:50e12a30e5e9994ae2dc7e",
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-L0E14LNC76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
