"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge"

export default function BrandHeader() {
  return (
    <section className="text-center mb-6">
      {/* Logo y título */}
      <div className="mx-auto mb-2 inline-flex items-center gap-2">
        <Image
          src="/logo-maquinarias.png"
          alt="Logo Maquinarias"
          width={200}
          height={200}
          className="object-contain w-32 sm:w-40 md:w-48 lg:w-56"
          priority
        />
      </div>

      {/* Título secundario */}
      <h2 className="text-3xl font-semibold text-neutral-950">Feedback del Asesor</h2>

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
