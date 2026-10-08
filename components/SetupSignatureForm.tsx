"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/SignaturePad";
import { saveSignatureAction } from "@/actions/account";
import { toast } from "sonner";
import { PenTool, Upload, Loader2, ArrowRight, CheckCircle2, Image as ImageIcon, RotateCcw } from "lucide-react";

export function SetupSignatureForm() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = React.useState<"draw" | "upload">("draw");
  const [drawnSignature, setDrawnSignature] = React.useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = React.useState<string | null>(null);
  const [selectedSignature, setSelectedSignature] = React.useState<string | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Manejar cambio en tab Dibujar
  const handleDrawChange = (dataUrl: string | null) => {
    setDrawnSignature(dataUrl);
    if (activeTab === "draw") {
      setSelectedSignature(dataUrl);
    }
  };

  // Manejar cambio de pestañas
  const handleTabChange = (val: string) => {
    const tab = val as "draw" | "upload";
    setActiveTab(tab);
    if (tab === "draw") {
      setSelectedSignature(drawnSignature);
    } else {
      setSelectedSignature(uploadedSignature);
    }
  };

  // Procesar archivo de imagen subido
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validación de tipo
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      const msg = "Solo se permiten imágenes en formato PNG o JPG.";
      setUploadError(msg);
      toast.error("Formato inválido", { description: msg });
      return;
    }

    // Validación de tamaño (máx 350 KB)
    if (file.size > 350 * 1024) {
      const msg = "La imagen supera el límite de 350 KB. Por favor selecciona una imagen más liviana.";
      setUploadError(msg);
      toast.error("Archivo muy pesado", { description: msg });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Reducir tamaño manteniendo proporción (ancho máx 600px, alto máx 300px)
        const maxWidth = 600;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setUploadError("No se pudo procesar la imagen.");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL("image/png");

        setUploadedSignature(optimizedDataUrl);
        setSelectedSignature(optimizedDataUrl);
      };

      img.onerror = () => {
        setUploadError("No se pudo cargar la imagen seleccionada.");
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleClearUpload = () => {
    setUploadedSignature(null);
    if (activeTab === "upload") {
      setSelectedSignature(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveSignature = async () => {
    if (!selectedSignature || submitting) return;

    setSubmitting(true);
    try {
      const result = await saveSignatureAction(selectedSignature);

      if (!result.success) {
        toast.error("Error al guardar firma", {
          description: result.error,
        });
        return;
      }

      toast.success("Firma configurada exitosamente", {
        description: "Accediendo a la plataforma...",
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error en submit de firma:", err);
      toast.error("Error inesperado", {
        description: "No se pudo guardar la firma. Intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-stone-100 p-1 rounded-xl">
          <TabsTrigger
            value="draw"
            className="flex items-center gap-2 rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
          >
            <PenTool className="size-3.5" />
            Dibujar
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="flex items-center gap-2 rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
          >
            <Upload className="size-3.5" />
            Subir imagen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="pt-4">
          <SignaturePad
            value={drawnSignature}
            onChange={handleDrawChange}
            label="Traza tu firma en el lienzo (mouse o táctil)"
          />
        </TabsContent>

        <TabsContent value="upload" className="pt-4 space-y-4">
          <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 text-center hover:bg-stone-50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileUpload}
              className="hidden"
              id="signature-file-upload"
            />
            <div className="flex flex-col items-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-xs text-stone-700">
                <ImageIcon className="size-6" />
              </div>
              <p className="text-sm font-bold text-stone-900">
                Selecciona una imagen de tu firma
              </p>
              <p className="mt-1 text-xs text-stone-500 max-w-sm">
                Sube un archivo PNG o JPG transparente o sobre fondo blanco (máximo 350 KB).
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-stone-300 text-xs font-semibold"
                >
                  <Upload className="size-3.5 mr-1.5" />
                  Examinar archivo
                </Button>
                {uploadedSignature && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearUpload}
                    className="text-xs text-stone-500 hover:text-red-600 rounded-xl"
                  >
                    <RotateCcw className="size-3.5 mr-1" />
                    Quitar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs font-semibold text-red-600">{uploadError}</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Vista previa de la firma sobre fondo blanco */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Vista previa de la firma
          </p>
          {selectedSignature && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="size-3.5" /> Lista para confirmar
            </span>
          )}
        </div>

        <div className="flex min-h-[110px] w-full items-center justify-center rounded-2xl border border-stone-200 bg-white p-4 shadow-inner">
          {selectedSignature ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={selectedSignature}
              alt="Vista previa de firma"
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <p className="text-xs text-stone-400 text-center">
              Dibuja o sube tu firma arriba para visualizarla aquí antes de guardar.
            </p>
          )}
        </div>
        <p className="text-[11px] text-stone-400">
          Esta firma se estampará en los comprobantes y actas PDF que emitas.
        </p>
      </div>

      {/* Botón de acción */}
      <Button
        type="button"
        onClick={handleSaveSignature}
        disabled={!selectedSignature || submitting}
        className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando firma...
          </>
        ) : (
          <>
            Guardar firma y continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
