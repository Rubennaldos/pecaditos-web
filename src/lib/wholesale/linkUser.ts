// src/lib/wholesale/linkUser.ts
import { db } from "@/config/firebase";
import { ref, get, set, remove } from "firebase/database";

/**
 * Lee el clientId actual de un usuario (si existe).
 */
export async function getUserClientId(uid: string): Promise<string | undefined> {
  const snap = await get(ref(db, `wholesale/users/${uid}`));
  return snap.val()?.clientId;
}

/**
 * Enlaza un usuario (uid) a un cliente mayorista (clientId) con un rol interno.
 * Si el usuario ya estaba ligado a otro cliente, lo desliga primero.
 */
export async function linkUserToClient(
  uid: string,
  clientId: string,
  internalRole: "comprador" | "aprobador" | "visor" = "comprador"
) {
  const prev = await getUserClientId(uid);
  const ops: Promise<any>[] = [];

  if (prev && prev !== clientId) {
    // quita del cliente anterior
    ops.push(remove(ref(db, `wholesale/clients/${prev}/users/${uid}`)));
  }

  // mapping directo
  ops.push(set(ref(db, `wholesale/users/${uid}`), { clientId, role: internalRole }));

  // mapping inverso (cliente -> usuarios)
  ops.push(set(ref(db, `wholesale/clients/${clientId}/users/${uid}`), { role: internalRole }));

  await Promise.all(ops);
}

/**
 * Desvincula completamente al usuario de su cliente mayorista (si lo tuviera).
 */
export async function unlinkUserFromClient(uid: string) {
  const clientId = await getUserClientId(uid);
  if (!clientId) return;

  await Promise.all([
    remove(ref(db, `wholesale/users/${uid}`)),
    remove(ref(db, `wholesale/clients/${clientId}/users/${uid}`)),
  ]);
}
