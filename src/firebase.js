// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAiStgVjUvsTkUTB_Goe3ySU4M0trqwgbc",
//   authDomain: "gogo-b114b.firebaseapp.com",
//   projectId: "gogo-b114b",
//   storageBucket: "gogo-b114b.firebasestorage.app",
//   messagingSenderId: "593295856162",
//   appId: "1:593295856162:web:27725be6d2e511e588307b",
//   measurementId: "G-F8EH73LCM8"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const requiredEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingEnvKeys = requiredEnvKeys.filter((key) => !import.meta.env[key]);
if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing Firebase env vars: ${missingEnvKeys.join(", ")}. Update your .env and restart the dev server.`
  );
}

const firebaseConfig = {
  apiKey: "AIzaSyAjLwQB5TkGapgPczFpd4mpqoXJnL2v9SI",
  authDomain: "gogo-3b5d9.firebaseapp.com",
  projectId: "gogo-3b5d9",
  storageBucket: "gogo-3b5d9.firebasestorage.app",
  messagingSenderId: "368132898837",
  appId: "1:368132898837:web:2fca12da8dd13cde9dce1c",
  measurementId: "G-VRM35D4WDS"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
