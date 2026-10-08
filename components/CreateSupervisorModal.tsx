"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Mail,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { createSupervisorAction } from "@/actions/admin";
import { toast } from "sonner";

interface CreateSupervisorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSupervisorModal({
  open,
  onOpenChange,
}: CreateSupervisorModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [autoPassword, setAutoPassword] = React.useState(true);
  const [customPassword, setCustomPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Result state after creation
  const [createdUser, setCreatedUser] = React.useState<{
    name: string;
    email: string;
    role: string;
    temporaryPassword: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setAutoPassword(true);
    setCustomPassword("");
    setError(null);
    setCreatedUser(null);
    setCopiedPassword(false);
    setCopiedAll(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor, ingresa el nombre del supervisor.");
      return;
    }

    if (!email.trim()) {
      setError("Por favor, ingresa el correo electrónico.");
      return;
    }

    if (!autoPassword && customPassword.length < 8) {
      setError("La contraseña personalizada debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await createSupervisorAction({
        name: name.trim(),
        email: email.trim(),
        customPassword: autoPassword ? undefined : customPassword.trim(),
      });

      if (!res.success) {
        setError(res.error || "No se pudo crear el usuario supervisor.");
        toast.error("Error al crear supervisor", {
          description: res.error,
        });
        return;
      }

      setCreatedUser({
        name: res.user!.name,
        email: res.user!.email,
        role: res.user!.role,
        temporaryPassword: res.temporaryPassword || "",
      });

      toast.success("Supervisor creado exitosamente", {
        description: `Usuario: ${res.user!.email}`,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      toast.error("Error inesperado", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (!createdUser) return;
    navigator.clipboard.writeText(createdUser.temporaryPassword);
    setCopiedPassword(true);
    toast.success("Contraseña copiada al portapapeles");
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCopyCredentials = () => {
    if (!createdUser) return;
    const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "";
    const text = `Acceso a Plataforma NN Feedback:\n• Correo: ${createdUser.email}\n• Contraseña temporal: ${createdUser.temporaryPassword}\n• Enlace de acceso: ${loginUrl}\n\n*Nota: Al iniciar sesión por primera vez, el sistema te solicitará cambiar tu contraseña y registrar tu firma digital.*`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success("Credenciales completas copiadas al portapapeles");
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
        {!createdUser ? (
          <>
            <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs">
                  <UserPlus className="size-4.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-stone-950">
                    Crear Nuevo Supervisor
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">
                    Genera las credenciales de acceso para un nuevo supervisor del equipo.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="supervisor-name" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <User className="size-3.5 text-stone-400" />
                  Nombre Completo
                </Label>
                <Input
                  id="supervisor-name"
                  type="text"
                  placeholder="Ej. Carlos Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className="rounded-xl border-stone-200 bg-stone-50/50 text-sm focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supervisor-email" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-stone-400" />
                  Correo Corporativo
                </Label>
                <Input
                  id="supervisor-email"
                  type="email"
                  placeholder="ejemplo@nnfeedback.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="rounded-xl border-stone-200 bg-stone-50/50 text-sm focus:bg-white"
                />
              </div>

              <div className="space-y-2.5 rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-3.5 text-stone-500" />
                    <span className="text-xs font-bold text-stone-800">
                      Contraseña de Acceso
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPassword(!autoPassword)}
                    className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline underline-offset-2"
                  >
                    {autoPassword ? "Escribir manual" : "Generar automática"}
                  </button>
                </div>

                {autoPassword ? (
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                    <span>Se generará una contraseña temporal segura de un solo uso.</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      type="text"
                      placeholder="Mínimo 8 caracteres"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      disabled={loading}
                      className="rounded-lg border-stone-200 bg-white text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400">
                      El supervisor deberá actualizarla en su primer inicio de sesión.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="rounded-xl border-stone-200 text-xs font-semibold hover:bg-stone-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-stone-900 text-xs font-bold text-white hover:bg-stone-800"
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Creando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="size-3.5" />
                      <span>Crear Supervisor</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Vista de Confirmación con Credenciales */
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs mb-1">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-950">
                ¡Supervisor Creado Exitosamente!
              </h3>
              <p className="text-xs text-stone-500 max-w-xs">
                Copia y entrega estas credenciales al nuevo supervisor para que pueda ingresar.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Supervisor
                  </span>
                  <span className="font-bold text-stone-900 truncate block">
                    {createdUser.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Rol Asignado
                  </span>
                  <span className="font-semibold text-stone-700 capitalize">
                    {createdUser.role}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200/80 pt-2.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Correo Electrónico
                </span>
                <span className="text-xs font-mono font-medium text-stone-800 break-all select-all">
                  {createdUser.email}
                </span>
              </div>

              <div className="border-t border-stone-200/80 pt-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Contraseña Temporal
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:text-stone-950"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span className="text-emerald-600">¡Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar clave</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-stone-300 bg-white px-3 py-2">
                  <span className="font-mono text-xs font-bold tracking-wider text-stone-950 select-all">
                    {createdUser.temporaryPassword}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-800 leading-relaxed">
              <span className="font-bold">⚠️ Importante:</span> Al ingresar por primera vez, el sistema le pedirá de forma obligatoria cambiar la clave y registrar su firma digital.
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full rounded-xl bg-stone-900 text-xs font-bold text-white hover:bg-stone-800"
              >
                {copiedAll ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>¡Credenciales copiadas al portapapeles!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <Copy className="size-3.5" />
                    <span>Copiar todos los datos de acceso</span>
                  </div>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border-stone-200 text-xs font-semibold hover:bg-stone-100"
                >
                  <ArrowRight className="size-3.5 mr-1" />
                  Crear otro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 rounded-xl border-stone-200 text-xs font-semibold hover:bg-stone-100"
                >
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
