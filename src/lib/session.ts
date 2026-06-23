import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Obtiene la sesión actual o redirige a /signin.
 * Uso: const session = await requireSession();
 * Devuelve session.user con { id, name, email, ... }.
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  return session;
}

/**
 * Variante para Server Actions: lanza Error si no hay sesión.
 * No usar en page components — usar requireSession() para redirect automático.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("No autenticado");
  return session.user.id;
}
