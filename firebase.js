import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGmK7o4KnxSUSfg30zcZ0zZg5z5CmkvLg",
  authDomain: "test-c0a0f.firebaseapp.com",
  projectId: "test-c0a0f",
  storageBucket: "test-c0a0f.appspot.com",
  messagingSenderId: "429459944490",
  appId: "1:429459944490:web:293dfa0851659be38fbf53",
};
// Initialize Firebas
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
