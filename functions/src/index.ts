// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

initializeApp();

export const createUser = onCall({ region: "us-central1" }, async (req) => {
  const { email, password, nombre, isAdmin } = (req.data || {}) as {
    email?: string; password?: string; nombre?: string; isAdmin?: boolean;
  };

  if (!email || !password || !nombre) {
    throw new HttpsError("invalid-argument",
      "Faltan campos requeridos: email, password, nombre");
  }

  try {
    const userRecord = await getAuth().createUser({
      email, password, displayName: nombre, disabled: false,
    });
    const uid = userRecord.uid;

    await getDatabase().ref(`usuarios/${uid}`).set({
      nombre,
      correo: email,
      isAdmin: isAdmin || false,
      activo: true,
      createdAt: new Date().toISOString(),
      accessModules: [],
      permissions: [],
    });

    return { ok: true, uid };
  } catch (err: any) {
    throw new HttpsError("internal", err?.message || "Error creando usuario");
  }
});
