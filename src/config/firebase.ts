
// Firebase Configuration
// TODO: Reemplazar con las credenciales reales de Firebase

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuración de Firebase (usando valores de desarrollo por defecto)
const firebaseConfig = {
  apiKey: "AIzaSyDemokey-firebase-development-only",
  authDomain: "pecaditos-integrales.firebaseapp.com",
  databaseURL: "https://pecaditos-integrales-default-rtdb.firebaseio.com",
  projectId: "pecaditos-integrales",
  storageBucket: "pecaditos-integrales.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;

/* 
INSTRUCCIONES PARA CONFIGURAR FIREBASE:

1. Crear proyecto en Firebase Console (https://console.firebase.google.com)
2. Activar Authentication (Email/Password)
3. Activar Realtime Database
4. Copiar la configuración y reemplazar firebaseConfig arriba
5. Configurar reglas de seguridad en Database Rules:

{
  "rules": {
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}

*/
