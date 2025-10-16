// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiZIM-9xSHG0DGQBtxz-AnF0pVORaF9GI",
  authDomain: "kaciyorweb1-54021323-ce66d.firebaseapp.com",
  projectId: "kaciyorweb1-54021323-ce66d",
  storageBucket: "kaciyorweb1-54021323-ce66d.firebasestorage.app",
  messagingSenderId: "846171709261",
  appId: "1:846171709261:web:24a266f8e1ab896b5c6104"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
