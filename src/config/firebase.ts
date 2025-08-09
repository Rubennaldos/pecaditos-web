// src/config/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app);
// importante: misma región donde desplegaste la Function (us-central1)
const functions = getFunctions(app, "us-central1");

export { app, db, auth, functions };
