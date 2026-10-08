import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supervisorSignatures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireUser(options: { redirect?: boolean } = { redirect: true }) {
  const session = await getSession();
  if (!session?.user) {
    if (options.redirect) {
      redirect("/login");
    }
    throw new Error("No autenticado: sesión requerida");
  }
  return session;
}

export async function requireRole(role: string, options: { redirect?: boolean } = { redirect: true }) {
  const session = await requireUser(options);
  const userRole = (session.user as { role?: string | null }).role;
  if (userRole !== role) {
    if (options.redirect) {
      redirect("/");
    }
    throw new Error(`Acceso denegado: se requiere el rol ${role}`);
  }
  return session;
}

export async function getPostLoginRoute(user: {
  id: string;
  role?: string | null;
  mustChangePassword?: boolean | null;
}): Promise<string> {
  if (user.mustChangePassword) {
    return "/cambiar-contrasena";
  }

  if (user.role === "supervisor") {
    if (db) {
      const [sig] = await db
        .select({ userId: supervisorSignatures.userId })
        .from(supervisorSignatures)
        .where(eq(supervisorSignatures.userId, user.id))
        .limit(1);

      if (!sig) {
        return "/firma";
      }
    } else {
      return "/firma";
    }
  }

  return "/";
}
