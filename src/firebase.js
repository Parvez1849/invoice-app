
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRjArNNxSLT4ONWZYBsDd1By_1P3G94LQ",
  authDomain: "invoice-app-46a2d.firebaseapp.com",
  projectId: "invoice-app-46a2d",
  storageBucket: "invoice-app-46a2d.appspot.com",
  messagingSenderId: "1058217159564",
  appId: "1:1058217159564:web:d582e6af405374265f04a9",
  measurementId: "G-862W8HXC5M"
};


export const app = initializeApp(firebaseConfig);
export const auth=getAuth(); 
export const storage=getStorage();
export const db=getFirestore(app);