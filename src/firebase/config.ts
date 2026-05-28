import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlbgbIrC9HYpwFZ1ccLes9sYfRk6oTbgM",
  authDomain: "gamezone-reservas-canchas.firebaseapp.com",
  projectId: "gamezone-reservas-canchas",
  storageBucket: "gamezone-reservas-canchas.firebasestorage.app",
  messagingSenderId: "950482400557",
  appId: "1:950482400557:web:e8fade0407d61071ba0fa4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);