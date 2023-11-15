import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPjYQ_6b6efKbsnfUXS-VeElHM3vTsXe8",
  authDomain: "docsmanagementsystem-c4fee.firebaseapp.com",
  projectId: "docsmanagementsystem-c4fee",
  storageBucket: "docsmanagementsystem-c4fee.appspot.com",
  messagingSenderId: "783331167134",
  appId: "1:783331167134:web:951a6afd9d9ebba5bfa48f",
};

// Initialize Firebas
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
