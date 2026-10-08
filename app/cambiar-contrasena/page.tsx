import { redirect } from "next/navigation";
import { requireUser, getPostLoginRoute } from "@/lib/auth-server";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { LayoutGrid } from "lucide-react";

export const metadata = {
  title: "Actualizar Contraseña — NN Feedback",
  description: "Actualización obligatoria de contraseña temporal",
};

export default async function ChangePasswordPage() {
  const session = await requireUser();

  // Si el usuario ya cambió su contraseña temporal, avanzar al siguiente paso
  if (!session.user.mustChangePassword) {
    const nextRoute = await getPostLoginRoute(session.user);
    redirect(nextRoute);
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-stone-950 flex flex-col justify-between">
      {/* Header con marca */}
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

      {/* Contenido principal */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
          {/* Tarjeta Hero Oscura (7 cols en desktop, order-2 en móvil) */}
          <div className="relative order-2 lg:order-1 flex min-h-80 items-center justify-center overflow-hidden rounded-[1.75rem] bg-stone-950 p-8 sm:p-12 text-center text-white lg:col-span-7">
            <div className="absolute -right-12 -top-16 size-72 rounded-full opacity-20 blur-3xl bg-stone-400" />
            <div className="relative flex flex-col items-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Paso obligatorio · Seguridad
              </p>
              <h1 className="max-w-xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                Define tu contraseña personal.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-300">
                Por políticas de seguridad, las cuentas con contraseñas temporales deben actualizar sus credenciales antes de acceder a la plataforma.
              </p>
            </div>
          </div>

          {/* Formulario de Cambio de Contraseña (5 cols en desktop, order-1 en móvil) */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <ChangePasswordForm />
          </div>
        </div>
      </main>

      {/* Footer corporativo */}
      <footer className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 text-xs text-stone-400 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} NN Feedback</p>
        <p>Calidad que se conversa.</p>
      </footer>
    </div>
  );
}
