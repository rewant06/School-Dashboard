import { initializeApp } from "firebase/app"; // Import Firebase initialization function.
import { getAuth } from "firebase/auth"; // Import Firebase Authentication.
import { getFirestore } from "firebase/firestore"; // Import Firestore for database operations.
import { getAnalytics } from "firebase/analytics"; // Import Firebase Analytics.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Firebase API key from environment variables.
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Firebase Auth domain.
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Firebase project ID.
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Firebase storage bucket.
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Firebase messaging sender ID.
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Firebase app ID.
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Firebase measurement ID (optional).
};

// Initialize Firebase app.
export const app = initializeApp(firebaseConfig); // Export the initialized Firebase app instance.

// Export Firebase services for use in other parts of the app.
export const auth = getAuth(app); // Export Firebase Authentication instance.
export const db = getFirestore(app); // Export Firestore database instance.
export const analytics = getAnalytics(app); // Export Firebase Analytics instance (optional).