// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// import { getAnalytics } from "firebase/analytics"; // Solo si usas Analytics

const firebaseConfig = {
  apiKey: "AIzaSyAZdGe8o4ZQtSqHXVWS42Lk7Hb_eltnV4A",
  authDomain: "crm-pecaditos-integrales.firebaseapp.com",
  databaseURL: "https://crm-pecaditos-integrales-default-rtdb.firebaseio.com",
  projectId: "crm-pecaditos-integrales",
  storageBucket: "crm-pecaditos-integrales.appspot.com",
  messagingSenderId: "524481504623",
  appId: "1:524481504623:web:46b76ad2288346435c349a",
  measurementId: "G-3PV0358P6Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// const analytics = getAnalytics(app); // Descomenta SOLO si usas Analytics

export { app, auth, db };
