import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClakWnwv-kSqXi_nu2_3zyv2RNg7hFKto",
  authDomain: "dms-backup-bfeaa.firebaseapp.com",
  projectId: "dms-backup-bfeaa",
  storageBucket: "dms-backup-bfeaa.appspot.com",
  messagingSenderId: "826269767310",
  appId: "1:826269767310:web:74e3d9c41ff1ceccd05bdf",
};
// Initialize Firebas
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
