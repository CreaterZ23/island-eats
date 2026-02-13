import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZmHAS-T47jY-hC74OPQbm34zY7WCQzKs",
  authDomain: "island-eats-sunday-special.firebaseapp.com",
  projectId: "island-eats-sunday-special",
  storageBucket: "island-eats-sunday-special.firebasestorage.app",
  messagingSenderId: "167457735116",
  appId: "1:167457735116:web:f6a4bbc8ff46e1c1dc5d69",
  measurementId: "G-85LPM4JMHE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();
