// src/firebase.js (o el nombre de archivo que prefieras)

// 1. Importa los módulos de Firebase que vas a usar
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// 2. Configuración de tu app web en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAZdGe8o4ZQtSqHXVWS42Lk7Hb_eltnV4A",
  authDomain: "crm-pecaditos-integrales.firebaseapp.com",
  databaseURL: "https://crm-pecaditos-integrales-default-rtdb.firebaseio.com/", // <- MUY IMPORTANTE
  projectId: "crm-pecaditos-integrales",
  storageBucket: "crm-pecaditos-integrales.firebasestorage.app",
  messagingSenderId: "524481504623",
  appId: "1:524481504623:web:46b76ad2288346435c349a",
  measurementId: "G-3PV0358P6Y"
};

// 3. Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Opcional: Solo si usas Analytics
const database = getDatabase(app);   // Para Realtime Database

// 4. Exporta para usar en el resto de tu proyecto
export { app, analytics, database };

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
