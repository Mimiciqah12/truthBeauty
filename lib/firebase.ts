import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4--PakWYvphzPoQ-GO-QgtQw-7TLP0Gc",
  authDomain: "truthbeauty-2a7a1.firebaseapp.com",
  projectId: "truthbeauty-2a7a1",
  storageBucket: "truthbeauty-2a7a1.firebasestorage.app",
  messagingSenderId: "1036720532494",
  appId: "1:1036720532494:web:33e6af3c634b51b75a605f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
