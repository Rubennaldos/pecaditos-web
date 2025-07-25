import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZdGe8o4ZQtSqHXVWS42Lk7Hb_eltnV4A",
  authDomain: "crm-pecaditos-integrales.firebaseapp.com",
  databaseURL: "https://crm-pecaditos-integrales-default-rtdb.firebaseio.com",
  projectId: "crm-pecaditos-integrales",
  storageBucket: "crm-pecaditos-integrales.appspot.com", // CORRECTO
  messagingSenderId: "524481504623",
  appId: "1:524481504623:web:46b76ad2288346435c349a",
  measurementId: "G-3PV0358P6Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app); // Solo si usas Analytics
const db = getDatabase(app);

export { app, auth, db }; // <-- Así, solo exporta lo que tienes declarado




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
