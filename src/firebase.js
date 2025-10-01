import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyClNbDQvD0uxKanKxJuzfqGkBqUMsc4tm0",
  authDomain: "goodhabit-80d05.firebaseapp.com",
  projectId: "goodhabit-80d05",
  storageBucket: "goodhabit-80d05.firebasestorage.app",
  messagingSenderId: "894539138331",
  appId: "1:894539138331:web:defee4fa833b2a0bbc7fbe"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);