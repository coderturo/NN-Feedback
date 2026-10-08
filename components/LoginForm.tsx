"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Lock, Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      setErrorMessage("Por favor, completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage("Correo o contraseña incorrectos.");
        toast.error("No se pudo iniciar sesión", {
          description: "Correo o contraseña incorrectos.",
        });
        return;
      }

      if (data) {
        toast.success("Sesión iniciada", {
          description: "Ingresando a la plataforma...",
        });
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Error en login:", err);
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
            <Lock className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Ingresa con tus credenciales asignadas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
              Correo Electrónico <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu.correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="rounded-lg h-10 border-slate-300 bg-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-800">
              Contraseña <span className="text-red-600">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                  Verificando...
                </>
              ) : (
                <>
                  Entrar a la plataforma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              ¿Sin acceso? Solicítalo al administrador.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
