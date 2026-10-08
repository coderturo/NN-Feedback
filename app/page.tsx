import { redirect } from "next/navigation";
import { requireUser, getPostLoginRoute } from "@/lib/auth-server";
import { HomeShell } from "@/components/HomeShell";
import { db } from "@/lib/db";
import { supervisorSignatures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "NN Feedback — Plataforma de Calidad y Coaching",
  description: "Gestión de auditorías, acuerdos y sesiones de retroalimentación",
};

export default async function HomePage() {
  const session = await requireUser();

  // Redirigir según el estado del usuario (contraseña obligatoria o firma obligatoria)
  const nextRoute = await getPostLoginRoute(session.user);
  if (nextRoute !== "/") {
    redirect(nextRoute);
  }

  // Cargar firma vinculada del supervisor si existe
  let signature: string | null = null;
  if (db) {
    const [sig] = await db
      .select({ dataUrl: supervisorSignatures.dataUrl })
      .from(supervisorSignatures)
      .where(eq(supervisorSignatures.userId, session.user.id))
      .limit(1);
    signature = sig?.dataUrl || null;
  }

  return (
    <HomeShell
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as { role?: string | null }).role,
        signature,
      }}
    />
  );
}
