// src/services/adminUsers.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/config/firebase";

type CreateUserParams = {
  email: string;
  password: string;
  nombre: string;
  rol: "admin" | "adminGeneral" | "pedidos" | "reparto" | "produccion" | "cobranzas" | "logistica" | "mayorista" | "cliente";
};

export async function createUserAdmin(params: CreateUserParams) {
  const functions = getFunctions(app, "us-central1"); // 👈 igual que la región de la Function
  const call = httpsCallable(functions, "createUser");
  const res = await call(params);
  return res.data as { ok: boolean; uid: string };
}
