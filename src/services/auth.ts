// src/services/auth.ts
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { ref, get, set, query, orderByChild, equalTo } from "firebase/database";

export async function signInAndEnsureProfile(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user);
  return user;
}

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
    rol: "cliente",
    activo: true,
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
      clientId,
    };
  }

  await set(profileRef, payload);
}
