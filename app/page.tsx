// app/page.tsxnpm i sonner lucide-react
import FeedbackForm from "./componentes/FeedbackForm";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/fondo-maquinarias.jpg')" }}
      />
      {/* Overlay para legibilidad (ajusta /30..../60) */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Contenedor principal */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12">
        <FeedbackForm />
      </div>
    </main>
  );
}
