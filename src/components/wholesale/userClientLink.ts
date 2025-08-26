import { ref, get, update, child } from 'firebase/database';
import { db } from '@/config/firebase';

/**
 * Vincula (o cambia) el clientId de un usuario y mantiene el índice inverso:
 * - users/{uid}/wholesaleClientId = nextId | null
 * - wholesale/clients/{oldId}/users/{uid} = null
 * - wholesale/clients/{nextId}/users/{uid} = true
 */
export async function linkUserToClient(uid: string, nextId: string | null) {
  const rootRef = ref(db);
  // lee el ID anterior del usuario (si existe)
  const prevSnap = await get(child(rootRef, `users/${uid}/wholesaleClientId`));
  const prevId: string | null = prevSnap.exists() ? String(prevSnap.val()) : null;

  const updates: Record<string, any> = {};
  // set en el usuario
  updates[`users/${uid}/wholesaleClientId`] = nextId ?? null;

  // limpia índice inverso previo
  if (prevId && prevId !== nextId) {
    updates[`wholesale/clients/${prevId}/users/${uid}`] = null;
  }
  // set índice inverso nuevo
  if (nextId) {
    updates[`wholesale/clients/${nextId}/users/${uid}`] = true;
  }

  await update(rootRef, updates);
}
