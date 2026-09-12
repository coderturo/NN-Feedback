import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NN Feedback — Gestión de coaching",
  description:
    "Plataforma multi-campaña para auditoría, retroalimentación y seguimiento de compromisos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900">
        {children}
        <Toaster richColors expand position="top-center" />
      </body>
    </html>
  );
}
