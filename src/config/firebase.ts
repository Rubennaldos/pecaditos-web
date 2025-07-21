
// Firebase Configuration - SISTEMA DE PRODUCCIÓN
// Configuración lista para conectar con Firebase

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// INSTRUCCIONES: Reemplazar con sus credenciales reales de Firebase
const firebaseConfig = {
  apiKey: "SU_API_KEY_AQUI",
  authDomain: "su-proyecto.firebaseapp.com",
  databaseURL: "https://su-proyecto-default-rtdb.firebaseio.com",
  projectId: "su-proyecto-id",
  storageBucket: "su-proyecto.appspot.com",
  messagingSenderId: "SU_SENDER_ID",
  appId: "SU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;

/* 
CONFIGURACIÓN FIREBASE - SISTEMA DE PRODUCCIÓN LISTO

PASOS PARA ACTIVAR:
1. Crear proyecto en Firebase Console (https://console.firebase.google.com)
2. Activar Authentication (Email/Password)
3. Activar Realtime Database
4. Reemplazar las credenciales en firebaseConfig arriba
5. Configurar reglas de seguridad:

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
        ".read": "$uid === auth.uid || auth.uid == 'ADMIN_UID'",
        ".write": "$uid === auth.uid || auth.uid == 'ADMIN_UID'"
      }
    },
    "inventory": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "logistics": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}

USUARIO ADMIN INICIAL:
- Email: albertonaldos@gmail.com
- Crear manualmente en Firebase Auth
- Agregar claims personalizados para admin

*/
