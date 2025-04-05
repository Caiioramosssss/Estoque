import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKGs3DKittsw2YAfS3MTJDquRIjAMRpIg",
  authDomain: "sistema-de-estoque-cn.firebaseapp.com",
  projectId: "sistema-de-estoque-cn",
  storageBucket: "sistema-de-estoque-cn.firebasestorage.app",
  messagingSenderId: "384174765229",
  appId: "1:384174765229:web:67ba27ff321536e9624224",
  measurementId: "G-3HGJPXZ95Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;