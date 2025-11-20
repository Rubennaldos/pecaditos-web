// src/services/auth.ts
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { ref, get, set, query, orderByChild, equalTo } from "firebase/database";

// --- FUNCIÓN EXISTING (LOGIN) ---
export async function signInAndEnsureProfile(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user);
  return user;
}

// --- FUNCIÓN EXISTING (CREAR PERFIL SI NO EXISTE) ---
async function ensureUserProfile(user: User) {
  const profileRef = ref(db, `usuarios/${user.uid}`);
  const snap = await get(profileRef);
  if (snap.exists()) return;

  // Intenta completar datos desde /clients por authUid
  const byUid = query(ref(db, "clients"), orderByChild("authUid"), equalTo(user.uid));
  let cliSnap = await get(byUid);

  // Si no encontramos por authUid, intentamos buscar por RUC (para portales mayoristas)
  if (!cliSnap.exists() && user.email && user.email.includes('@sys.pecaditos.com')) {
    const ruc = user.email.split('@')[0]; // Extraer RUC del email generado
    const byRuc = query(ref(db, "clients"), orderByChild("rucDni"), equalTo(ruc));
    cliSnap = await get(byRuc);
  }

  let payload: any = {
    nombre: user.displayName || (user.email ? user.email.split("@")[0] : "Cliente"),
    correo: user.email ?? null,
    isAdmin: false,
    activo: true,
    accessModules: [],
    permissions: [],
    createdAt: Date.now(),
  };

  if (cliSnap.exists()) {
    const [clientId, c]: [string, any] = Object.entries(cliSnap.val())[0] as any;
    payload = {
      ...payload,
      nombre: c?.razonSocial || payload.nombre,
      correo: c?.emailFacturacion ?? payload.correo,
      activo: (c?.estado || "activo") === "activo",
      accessModules: c?.accessModules || [],
      permissions: c?.permissions || [],
      clientId,
      portalLoginRuc: c?.rucDni || null,
      rol: c?.rol || null
    };
    
    console.log('[Auth] Perfil creado con módulos:', payload.accessModules);
    
    // Actualizar authUid en el cliente si no existe (optimizar futuros logins)
    if (!c?.authUid) {
      const clientRef = ref(db, `clients/${clientId}`);
      await set(clientRef, { ...c, authUid: user.uid });
      console.log('[Auth] authUid actualizado en cliente:', clientId);
    }
  } else {
    console.warn('[Auth] Cliente no encontrado en /clients');
  }

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