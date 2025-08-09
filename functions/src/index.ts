// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

// Inicializa Admin SDK
initializeApp();

/**
 * Callable: createUser
 * Espera: { email, password, nombre, rol }
 * Guarda: /usuarios/{uid}
 */
export const createUser = onCall(async (req) => {
  const { email, password, nombre, rol } = (req.data || {}) as {
    email?: string;
    password?: string;
    nombre?: string;
    rol?: string;
  };

  if (!email || !password || !nombre || !rol) {
    throw new HttpsError(
      "invalid-argument",
      "Faltan campos requeridos: email, password, nombre, rol"
    );
  }

  try {
    // 1) Crear usuario en Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: nombre,
      disabled: false,
    });

    const uid = userRecord.uid;

    // 2) Guardar perfil en RTDB
    const now = new Date().toISOString();
    const permissions =
      rol === "admin" || rol === "adminGeneral" ? ["all"] : [];

    await getDatabase()
      .ref(`usuarios/${uid}`)
      .set({
        nombre,
        correo: email,
        rol,
        activo: true,
        createdAt: now,
        permissions,
      });

    return { ok: true, uid };
  } catch (err: any) {
    throw new HttpsError("internal", err?.message || "Error creando usuario");
  }
});
