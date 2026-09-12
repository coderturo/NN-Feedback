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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "./SignaturePad";
import {
  saveSupervisorSignature,
  removeSupervisorSignature,
  getStoredSupervisorSignature,
  getSupervisorSignatureDataUrl,
} from "@/lib/signatureUtils";
import { toast } from "sonner";
import { Upload, PenTool, Sparkles, Trash2, CheckCircle2, Shield } from "lucide-react";

interface SupervisorSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisorName: string;
  onSignatureUpdated?: () => void;
}

export function SupervisorSignatureModal({
  open,
  onOpenChange,
  supervisorName,
  onSignatureUpdated,
}: SupervisorSignatureModalProps) {
  const targetSupervisor = supervisorName || "Arturo Santiago";

  const [activeTab, setActiveTab] = React.useState<"upload" | "draw" | "default">("upload");
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [drawnSignature, setDrawnSignature] = React.useState<string | null>(null);
  const [currentSaved, setCurrentSaved] = React.useState<string | null>(null);

  // Cargar firma actual guardada al abrir el modal
  React.useEffect(() => {
    if (open) {
      const saved = getStoredSupervisorSignature(targetSupervisor);
      setCurrentSaved(saved);
      if (saved) {
        setUploadedImage(saved);
      }
    }
  }, [open, targetSupervisor]);

  // Manejar subida de archivo de imagen
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Por favor selecciona un archivo de imagen (PNG, JPG, WEBP).",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      toast.success("Imagen de firma cargada", {
        description: "Haz clic en 'Guardar como Plantilla' para confirmar.",
      });
    };
    reader.readAsDataURL(file);
  };

  // Guardar firma como plantilla
  const handleSaveSignature = () => {
    let signatureToSave: string | null = null;

    if (activeTab === "upload" && uploadedImage) {
      signatureToSave = uploadedImage;
    } else if (activeTab === "draw" && drawnSignature) {
      signatureToSave = drawnSignature;
    }

    if (!signatureToSave) {
      toast.error("No hay firma para guardar", {
        description: "Primero sube una imagen o dibuja tu firma con el mouse.",
      });
      return;
    }

    saveSupervisorSignature(targetSupervisor, signatureToSave);
    setCurrentSaved(signatureToSave);
    onSignatureUpdated?.();
    toast.success("Firma de supervisor guardada", {
      description: `Se utilizará como plantilla oficial para ${targetSupervisor}.`,
    });
    onOpenChange(false);
  };

  // Restaurar firma por defecto
  const handleResetDefault = () => {
    removeSupervisorSignature(targetSupervisor);
    setCurrentSaved(null);
    setUploadedImage(null);
    setDrawnSignature(null);
    onSignatureUpdated?.();
    toast.success("Firma restaurada", {
      description: `Se usará la firma caligráfica por defecto para ${targetSupervisor}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-slate-300 shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-3 bg-slate-100 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E31E24]" />
            Configurar Firma de Supervisor
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Personaliza tu firma para <strong>{targetSupervisor}</strong>. Se guardará como plantilla y se aplicará automáticamente a todas tus actas.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Pestañas de método */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "draw" | "default")} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-slate-100 p-1 border border-slate-200">
              <TabsTrigger value="upload" className="text-xs font-semibold">
                <Upload className="w-3.5 h-3.5 mr-1" />
                Subir Imagen
              </TabsTrigger>
              <TabsTrigger value="draw" className="text-xs font-semibold">
                <PenTool className="w-3.5 h-3.5 mr-1" />
                Dibujar
              </TabsTrigger>
              <TabsTrigger value="default" className="text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Por Defecto
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SUBIR IMAGEN */}
            <TabsContent value="upload" className="pt-4 space-y-3">
              <Label className="text-xs font-semibold text-slate-700">
                Selecciona la imagen de tu firma (PNG o JPG recomendado):
              </Label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#E31E24] transition-colors rounded-xl p-5 text-center bg-slate-50/50">
                <input
                  type="file"
                  id="supervisor-sig-upload"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="supervisor-sig-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="p-2.5 bg-white rounded-full shadow-xs border border-slate-200">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">
                    Haz clic para buscar tu archivo de firma
                  </span>
                  <span className="text-[11px] text-slate-400">PNG con fondo transparente o blanco</span>
                </label>
              </div>

              {uploadedImage && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Vista previa de imagen cargada:
                  </span>
                  <div className="h-16 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Firma subida"
                      className="max-h-14 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: DIBUJAR */}
            <TabsContent value="draw" className="pt-4 space-y-3">
              <Label className="text-xs font-semibold text-slate-700">
                Dibuja tu firma con el mouse una sola vez:
              </Label>
              <SignaturePad value={drawnSignature} onChange={setDrawnSignature} />
            </TabsContent>

            {/* TAB 3: POR DEFECTO */}
            <TabsContent value="default" className="pt-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Firma caligráfica estilizada generada automáticamente por el sistema para{" "}
                <strong>{targetSupervisor}</strong>:
              </p>
              <div className="h-20 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSupervisorSignatureDataUrl(targetSupervisor)}
                  alt="Firma por defecto"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDefault}
                className="w-full text-xs border-slate-300"
              >
                Restablecer a esta firma por defecto
              </Button>
            </TabsContent>
          </Tabs>

          {/* Estado de firma actual */}
          {currentSaved && activeTab !== "default" && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tienes una firma personalizada guardada
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetDefault}
                className="text-xs text-rose-600 hover:text-rose-700 h-6 px-2"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>
          )}

          {/* Botones de acción del Modal */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs border-slate-300"
            >
              Cancelar
            </Button>
            {activeTab !== "default" && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSignature}
                className="bg-[#E31E24] hover:bg-[#c71b1f] text-white text-xs font-bold"
              >
                Guardar como Plantilla
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
