import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { supervisorSignatures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SetupSignatureForm } from "@/components/SetupSignatureForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutGrid, PenTool } from "lucide-react";

export const metadata = {
  title: "Configurar Firma — NN Feedback",
  description: "Registro de la firma digital del supervisor",
};

export default async function FirmaPage() {
  const session = await requireUser();

  // Si todavía debe cambiar la contraseña, debe pasar primero por ese paso
  if (session.user.mustChangePassword) {
    redirect("/cambiar-contrasena");
  }

  // Solo los supervisores deben registrar su firma
  const userRole = (session.user as { role?: string | null }).role;
  if (userRole !== "supervisor") {
    redirect("/");
  }

  // Si ya tiene firma registrada, avanzar a la aplicación principal
  if (db) {
    const [existingSig] = await db
      .select({ userId: supervisorSignatures.userId })
      .from(supervisorSignatures)
      .where(eq(supervisorSignatures.userId, session.user.id))
      .limit(1);

    if (existingSig) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-stone-950 flex flex-col justify-between">
      {/* Header con marca corporativa */}
      <header className="w-full border-b border-stone-200/80 bg-[#fafaf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm">
              <LayoutGrid className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">NN</span>
              <span className="text-sm font-extrabold tracking-tight text-stone-950">Feedback</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal centrado */}
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <Card className="w-full rounded-[1.5rem] border border-stone-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-stone-100 bg-stone-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                <PenTool className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Configura tu firma
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Aparecerá en las actas de coaching que emitas a tus asesores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <SetupSignatureForm />
        </Card>
      </main>

      {/* Footer corporativo */}
      <footer className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 text-xs text-stone-400 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} NN Feedback</p>
        <p>Calidad que se conversa.</p>
      </footer>
    </div>
  );
}
