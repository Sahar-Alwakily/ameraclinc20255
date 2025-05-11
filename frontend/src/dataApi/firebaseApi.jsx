// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // أضف هذا الاستيراد
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwISrrsswQWNSU0D-V0m8co61jmX0jYEw",
  authDomain: "ameraclinic-326b2.firebaseapp.com",
  projectId: "ameraclinic-326b2",
  storageBucket: "ameraclinic-326b2.firebasestorage.app",
  messagingSenderId: "1000806780465",
  appId: "1:1000806780465:web:3c1accd69277a9a5494f10",
  measurementId: "G-3SFZLYKMNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // لن تحصل على خطأ الآن

export { database };