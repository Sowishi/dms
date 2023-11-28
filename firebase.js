import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwaXRS1hh1rDoCUNUmIvrwj8JEnSKBIEQ",
  authDomain: "document-management-syst-ff949.firebaseapp.com",
  projectId: "document-management-syst-ff949",
  storageBucket: "document-management-syst-ff949.appspot.com",
  messagingSenderId: "277252095143",
  appId: "1:277252095143:web:5223a5ff99bcf95c8faf82"
};
// Initialize Firebas
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
