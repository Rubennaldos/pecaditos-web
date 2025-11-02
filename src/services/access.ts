// src/services/access.ts
import { db } from "@/config/firebase";               // 👈 OJO: config/firebase, no lib/firebase
import { ref, set, update, get } from "firebase/database";

/**
 * Crea (o actualiza) un registro en /usuarios a partir de un cliente ya creado
 * en /clients y que YA tiene cuenta en Firebase Auth (authUid).
 * - Escribe en: /usuarios/{authUid}
 * - NO usa Firestore; todo con RTDB para que sea consistente con tu proyecto.
 */
export async function createAccessForClient(params: {
  authUid: string;         // UID del usuario en Firebase Auth (obligatorio)
  clientId: string;        // id del doc en /clients (opcional pero útil para trazabilidad)
  nombre: string;          // razonSocial del cliente
  email?: string | null;   // email del cliente (si tienes)
  activo?: boolean;        // estado inicial
  modules?: string[];      // módulos iniciales (si luego das permisos)
}) {
  const usuarioRef = ref(db, `usuarios/${params.authUid}`);

  // si ya existe, solo actualizamos
  const snap = await get(usuarioRef);
  const base = {
    nombre: params.nombre,
    correo: params.email ?? null,
    rol: "cliente",
    activo: params.activo ?? true,
    permissions: params.modules ?? [],
    clientId: params.clientId,
    updatedAt: Date.now(),
  };

  if (snap.exists()) {
    await update(usuarioRef, base);
  } else {
    await set(usuarioRef, { ...base, createdAt: Date.now() });
  }
}

/**
 * Alternativa: crear acceso leyendo /clients/{clientId} (si prefieres no pasar todos los datos).
 * Requiere que el cliente tenga authUid.
 */
export async function createAccessFromClientId(clientId: string) {
  const cliRef = ref(db, `clients/${clientId}`);
  const cliSnap = await get(cliRef);
  if (!cliSnap.exists()) throw new Error("Cliente no encontrado.");

  const c = cliSnap.val();
  if (!c.authUid) throw new Error("El cliente no tiene authUid (usuario de Auth).");

  await createAccessForClient({
    authUid: c.authUid,
    clientId,
    nombre: c.razonSocial || "Sin nombre",
    email: c.emailFacturacion || null,
    activo: (c.estado || "activo") === "activo",
    modules: [], // si quieres dar módulos iniciales, agrégalos aquí
  });
}
