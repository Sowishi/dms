import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlxWJMxbvfVJl7FGk6KPcTpO_bWedB2hc",
  authDomain: "dms-backup-89e7f.firebaseapp.com",
  projectId: "dms-backup-89e7f",
  storageBucket: "dms-backup-89e7f.appspot.com",
  messagingSenderId: "604947325852",
  appId: "1:604947325852:web:2aaa139529b88fd9085e59",
};
// Initialize Firebas
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
