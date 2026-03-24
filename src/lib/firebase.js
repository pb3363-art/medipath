import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB8qJM5kA5t126rNWBPMCzEbzspTgHYGqQ",
    authDomain: "medipath-c91bf.firebaseapp.com",
    projectId: "medipath-c91bf",
    storageBucket: "medipath-c91bf.firebasestorage.app",
    messagingSenderId: "236982445915",
    appId: "1:236982445915:web:50e12a30e5e9994ae2dc7e",
    measurementId: "G-L0E14LNC76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
