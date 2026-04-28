// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "food-delivery-app-68cef.firebaseapp.com",
  projectId: "food-delivery-app-68cef",
  storageBucket: "food-delivery-app-68cef.firebasestorage.app",
  messagingSenderId: "650838949383",
  appId: "1:650838949383:web:a1f8d59d943460f94674a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
export {app,auth};  