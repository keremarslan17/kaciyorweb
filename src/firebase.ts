// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import GoogleAuthProvider
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4FGWdVAjsbub5MeD6qVgJBRp1yMgliVg",
  authDomain: "kaciyorortak.firebaseapp.com",
  projectId: "kaciyorortak",
  storageBucket: "kaciyorortak.firebasestorage.app",
  messagingSenderId: "666887184907",
  appId: "1:666887184907:web:ed629164b1cb274f0a5d0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Google Auth Provider for use in login component
export const googleProvider = new GoogleAuthProvider();
