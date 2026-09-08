import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, getDoc, runTransaction } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcNjTGO7_NV27BMKq9nVx84dLpaS-Xwik",
  authDomain: "concise-sequence-fhnbb.firebaseapp.com",
  projectId: "concise-sequence-fhnbb",
  storageBucket: "concise-sequence-fhnbb.firebasestorage.app",
  messagingSenderId: "635026276450",
  appId: "1:635026276450:web:d21448b61808376387513b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-faufargames-31f39b23-72dd-4d47-abaa-8d15fb3b5ce5");

export { doc, setDoc, updateDoc, onSnapshot, collection, getDoc, runTransaction };
