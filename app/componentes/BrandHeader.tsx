"use client";
import { Badge } from "@/components/ui/badge"

export default function BrandHeader() {
  return (
    <section className="text-center mb-6">
      <div className="mx-auto mb-3 inline-flex rounded-xl bg-neutral-950 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">NN Feedback</div>

      {/* Título secundario */}
      <h2 className="text-3xl font-semibold text-neutral-950">Feedback del asesor</h2>

      {/* Descripción */}
      <p className="text-neutral-950 mt-2 max-w-xl mx-auto">
        La mejora es progresiva, pero debe existir un compromiso real y
        duradero! Tu Objetivo es: Mejorar continuamente hasta alcanzar el éxito
      </p>

      {/* Etiquetas informativas */}
      <div className="mt-3 flex gap-2 justify-center text-xs">
        <Badge variant="destructive">Mejora constante</Badge>
        <Badge variant="destructive">Tiempo estimado: 15 min</Badge>
      </div>
    </section>
  );
}
