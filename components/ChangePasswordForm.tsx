"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { changePasswordAction } from "@/actions/account";
import { toast } from "sonner";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación de la contraseña no coincide.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("La nueva contraseña no puede ser idéntica a la contraseña actual.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await changePasswordAction(currentPassword, newPassword);

      if (!result.success) {
        setErrorMessage(result.error || "No se pudo actualizar la contraseña.");
        toast.error("Error al cambiar contraseña", {
          description: result.error,
        });
        return;
      }

      toast.success("Contraseña actualizada con éxito", {
        description: "Redirigiendo...",
      });

      const nextRoute = result.nextRoute || "/";
      router.push(nextRoute);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error al actualizar contraseña:", err);
      setErrorMessage("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-[1.5rem] border border-stone-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-stone-100 bg-stone-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <KeyRound className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Actualizar Contraseña
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Ingresa tu clave temporal y define una nueva clave personal
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-800">
              Contraseña actual / temporal <span className="text-red-600">*</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="rounded-lg h-10 border-slate-300 bg-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-800">
              Nueva contraseña <span className="text-red-600">*</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="rounded-lg h-10 border-slate-300 bg-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-800">
              Confirmar nueva contraseña <span className="text-red-600">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="rounded-lg h-10 border-slate-300 bg-white"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-red-600 pt-1">
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando credenciales...
                </>
              ) : (
                <>
                  Guardar nueva contraseña
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Esta será la contraseña que usarás para tus próximos accesos.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
