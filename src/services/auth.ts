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

  // intenta completar datos desde /clients por authUid
  const byUid = query(ref(db, "clients"), orderByChild("authUid"), equalTo(user.uid));
  const cliSnap = await get(byUid);

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
      permissions: [], // Aseguramos array vacío si no existe
      clientId,
      portalLoginRuc: c?.rucDni || null // Guardamos referencia del RUC
    };
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