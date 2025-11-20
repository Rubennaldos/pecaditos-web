// src/services/auth.ts
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { ref, get, set, query, orderByChild, equalTo, update } from "firebase/database";

// --- FUNCIÓN EXISTING (LOGIN) ---
export async function signInAndEnsureProfile(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user);
  return user;
}

// --- FUNCIÓN EXISTING (CREAR/ACTUALIZAR PERFIL) ---
async function ensureUserProfile(user: User) {
  const profileRef = ref(db, `usuarios/${user.uid}`);
  
  console.log('[Auth] Verificando/actualizando perfil para uid:', user.uid);

  // Buscar datos del cliente
  let clientData: any = null;
  let clientId: string | null = null;

  // Si el email es de portal mayorista, buscar por RUC
  if (user.email && user.email.includes('@sys.pecaditos.com')) {
    const ruc = user.email.split('@')[0];
    console.log('[Auth] Buscando cliente por RUC:', ruc);
    
    // Obtener todos los clientes y buscar el que coincida con el RUC
    const clientsRef = ref(db, "clients");
    const clientsSnap = await get(clientsRef);
    
    if (clientsSnap.exists()) {
      const clients = clientsSnap.val();
      const entry = Object.entries(clients).find(([_, c]: [string, any]) => c.rucDni === ruc);
      
      if (entry) {
        [clientId, clientData] = entry;
        console.log('[Auth] Cliente encontrado por RUC:', {
          clientId,
          razonSocial: clientData?.razonSocial,
          accessModules: clientData?.accessModules
        });
      } else {
        console.warn('[Auth] No se encontró cliente con RUC:', ruc);
      }
    }
  }

  // Construir payload del perfil
  let payload: any = {
    nombre: user.displayName || (user.email ? user.email.split("@")[0] : "Cliente"),
    correo: user.email ?? null,
    isAdmin: false,
    activo: true,
    accessModules: [],
    permissions: [],
    rol: null,
    createdAt: Date.now(),
  };

  // Si encontramos datos del cliente, usarlos
  if (clientData) {
    const clientModules = Array.isArray(clientData.accessModules) 
      ? clientData.accessModules 
      : [];
    
    payload = {
      ...payload,
      nombre: clientData.razonSocial || payload.nombre,
      correo: clientData.emailFacturacion ?? payload.correo,
      activo: (clientData.estado || "activo") === "activo",
      accessModules: clientModules,
      permissions: clientModules,
      clientId,
      portalLoginRuc: clientData.rucDni || null,
      rol: clientData.rol || 'retailUser'
    };
    
    console.log('[Auth] Perfil actualizado con módulos del cliente:', clientModules);
    
    // Actualizar authUid en el cliente si no existe
    if (clientId && !clientData.authUid) {
      const clientRef = ref(db, `clients/${clientId}`);
      await update(clientRef, { authUid: user.uid });
      console.log('[Auth] authUid actualizado en cliente:', clientId);
    }
  } else {
    console.warn('[Auth] No se encontraron datos del cliente para:', user.email);
  }

  // Guardar/actualizar perfil
  console.log('[Auth] Guardando perfil en /usuarios con', payload.accessModules?.length || 0, 'módulos');
  await set(profileRef, payload);
}

// --- 👇 ESTA ES LA NUEVA FUNCIÓN QUE FALTABA 👇 ---

/**
 * Normaliza credenciales para el proveedor de autenticación.
 * Convierte RUC y PIN en Email y Password válidos para Firebase.
 * identifier: RUC del usuario
 * accessCode: PIN del usuario
 */
export function formatAuthCredentials(
  identifier: string,
  accessCode: string
): { email: string; password: string } {
  const CLEAN_IDENTIFIER = identifier.trim();
  const CLEAN_ACCESS_CODE = accessCode.trim();

  // 1. Generamos un correo "ficticio" único para el sistema
  const email = `${CLEAN_IDENTIFIER}@sys.pecaditos.com`.toLowerCase();
  
  // 2. Creamos una contraseña fuerte combinando el PIN con una llave del sistema
  const password = `${CLEAN_ACCESS_CODE}SystemAuthKey`;

  return { email, password };
}