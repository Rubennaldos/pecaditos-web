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
  
  // Si NO es email de portal mayorista, verificar si es usuario administrativo
  const isWholesaleEmail = user.email && user.email.includes('@sys.pecaditos.com');
  
  if (!isWholesaleEmail) {
    const snap = await get(profileRef);
    const existingProfile = snap.exists() ? snap.val() : null;
    
    // Si existe Y tiene rol válido, mantenerlo sin cambios (los módulos se completan en useAuth)
    if (existingProfile && (existingProfile.rol || existingProfile.role)) {
      console.log('[Auth] Usuario administrativo existente con rol válido:', existingProfile.rol || existingProfile.role, 'email:', user.email);
      return;
    }
    
    // Si existe pero está corrupto (sin rol) O no existe, recrearlo/repararlo
    console.log('[Auth] Recreando/reparando perfil administrativo para:', user.email);
    
    // Intentar encontrar configuración en usuarios administrativos
    const adminUsersRef = ref(db, 'users');
    const adminSnap = await get(adminUsersRef);
    let adminConfig: any = null;
    
    if (adminSnap.exists()) {
      const users = adminSnap.val();
      adminConfig = Object.values(users).find((u: any) => u.email === user.email);
      console.log('[Auth] Configuración admin encontrada:', adminConfig ? 'sí' : 'no');
    }
    
    // Si no hay config en /users, aplicar fallback por email conocido
    let fallbackRol: string | null = null;
    let fallbackIsAdmin = false;
    if (!adminConfig && user.email === 'albertonaldos@gmail.com') {
      fallbackRol = 'adminGeneral';
      fallbackIsAdmin = true;
      console.log('[Auth] Aplicando rol adminGeneral por email conocido para:', user.email);
    }
    
    // Crear perfil administrativo (usar config si existe, sino fallback básico)
    const adminPayload = {
      nombre: adminConfig?.nombre || user.displayName || user.email?.split("@")[0] || "Usuario",
      correo: user.email ?? null,
      isAdmin: adminConfig?.isAdmin ?? fallbackIsAdmin,
      activo: adminConfig?.activo ?? true,
      accessModules: adminConfig?.accessModules || adminConfig?.permissions || [],
      permissions: adminConfig?.permissions || adminConfig?.accessModules || [],
      rol: adminConfig?.rol || adminConfig?.role || fallbackRol,
      createdAt: existingProfile?.createdAt || Date.now(),
    };
    
    console.log('[Auth] Guardando perfil administrativo con rol:', adminPayload.rol);
    await set(profileRef, adminPayload);
    return;
  }

  // A partir de aquí, solo usuarios de portal mayorista
  console.log('[Auth] Sincronizando perfil de portal mayorista para uid:', user.uid);

  let clientData: any = null;
  let clientId: string | null = null;

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

  // Construir payload del perfil mayorista
  const clientModules = Array.isArray(clientData?.accessModules) 
    ? clientData.accessModules 
    : [];
  
  const payload: any = {
    nombre: clientData?.razonSocial || user.email.split("@")[0],
    correo: clientData?.emailFacturacion ?? user.email,
    isAdmin: false,
    activo: (clientData?.estado || "activo") === "activo",
    accessModules: clientModules,
    permissions: clientModules,
    clientId: clientId || null,
    portalLoginRuc: clientData?.rucDni || null,
    rol: clientData?.rol || 'retailUser',
    createdAt: Date.now(),
  };
  
  console.log('[Auth] Perfil mayorista actualizado con', clientModules.length, 'módulos');
  
  // Actualizar authUid en el cliente si no existe
  if (clientId && clientData && !clientData.authUid) {
    const clientRef = ref(db, `clients/${clientId}`);
    await update(clientRef, { authUid: user.uid });
    console.log('[Auth] authUid actualizado en cliente:', clientId);
  }

  // Guardar/actualizar perfil mayorista
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