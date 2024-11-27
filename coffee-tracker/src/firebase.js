// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // For authentication
import { getFirestore } from "firebase/firestore"; // For Firestore database
import { getStorage } from "firebase/storage"; // For file storage

const firebaseConfig = {
    apiKey: "AIzaSyDqeTF3cCwkIDfQStMVjigyC1yoVepEKas",
    authDomain: "coffee-tracker-c42ad.firebaseapp.com",
    databaseURL: "https://coffee-tracker-c42ad-default-rtdb.firebaseio.com",
    projectId: "coffee-tracker-c42ad",
    storageBucket: "coffee-tracker-c42ad.firebasestorage.app",
    messagingSenderId: "167626350886",
    appId: "1:167626350886:web:154bf3c7b25a93d343a1e7",
    measurementId: "G-KG36XK49E5"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

export { app, analytics, auth, db, storage };
