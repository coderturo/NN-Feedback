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
import { Download, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { generateCoachingPDF, PDFVoucherData } from "@/lib/pdfGenerator";
import { resolveSupervisorSignature } from "@/lib/signatureUtils";
import { campaigns } from "@/lib/campaigns";

interface CoachingVoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: (PDFVoucherData & { emailSent?: boolean; emailError?: string }) | null;
}

export function CoachingVoucherModal({
  open,
  onOpenChange,
  data,
}: CoachingVoucherModalProps) {
  const [downloading, setDownloading] = React.useState(false);

  if (!data) return null;

  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      generateCoachingPDF(data);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-slate-200 shadow-2xl bg-slate-50">
        <DialogHeader className="p-6 pb-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Sesión Registrada en el Sistema
            </DialogTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
              {data.tema}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            La información ha sido guardada. Revisa el comprobante oficial a continuación o descárgalo en formato PDF.
          </DialogDescription>

          {/* Notificación de estado de correo */}
          {data.emailSent ? (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Copia del acta enviada exitosamente por correo electrónico.</span>
            </div>
          ) : data.emailError ? (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Aviso sobre el envío de correo:</span>
                <span className="text-[11px] text-amber-700">{data.emailError}</span>
              </div>
            </div>
          ) : null}
        </DialogHeader>

        {/* Vista previa del Acta Oficial */}
        <div className="p-6 space-y-4">
          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm space-y-5 text-slate-800">
            {/* Cabecera del Voucher */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div>
                <div className="relative mb-3 h-12 w-32 overflow-hidden rounded-lg bg-stone-50 p-1">
                  <Image
                    src={campaigns[data.campaign].logo}
                    alt={campaigns[data.campaign].name}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Acta de Sesión de Feedback · {campaigns[data.campaign].name}
                </h3>
                <p className="text-xs text-slate-500">Gestión de Calidad & Operaciones</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-rose-50 text-[#E31E24] border border-[#E31E24]/20 text-xs px-2.5 py-1 rounded font-semibold">
                  Oficial
                </span>
                <p className="text-xs text-slate-500 mt-2 font-mono">Fecha: {data.fecha}</p>
              </div>
            </div>

            {/* Participantes */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs">
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                  Asesor Auditado
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{data.asesorNombre}</p>
                <p className="text-slate-500 font-mono text-[11px]">{data.asesorEmail}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                  Supervisor a Cargo
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{data.supervisorNombre}</p>
              </div>
            </div>

            {/* Detalle de llamada */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Detalle de la Llamada Auditada
              </h4>
              <p className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {data.detalleLlamada}
              </p>
            </div>

            {/* Diagnóstico */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h5 className="text-xs font-bold text-emerald-900 mb-1">
                  Puntos Positivos / Reconocimiento (Lo que me gustó)
                </h5>
                <p className="text-xs text-emerald-950 leading-relaxed">{data.meGusta}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="text-xs font-bold text-amber-900 mb-1">
                  Oportunidades de Mejora (Lo que me preocupa)
                </h5>
                <p className="text-xs text-amber-950 leading-relaxed">{data.mePreocupa}</p>
              </div>

              {data.teSugiero && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <h5 className="text-xs font-bold text-sky-900 mb-1">
                    Recomendaciones Operativas (Te sugiero)
                  </h5>
                  <p className="text-xs text-sky-950 leading-relaxed">{data.teSugiero}</p>
                </div>
              )}
            </div>

            {/* Compromiso del Asesor */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#E31E24] mb-1">
                Compromiso Asumido por el Asesor
              </h5>
              <p className="text-sm font-semibold text-slate-900 italic leading-relaxed">
                &quot;{data.compromiso}&quot;
              </p>
            </div>

            {/* Firmas */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
              <div className="flex flex-col items-center">
                {data.firmaAsesor ? (
                  <div className="h-14 w-full flex items-center justify-center mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.firmaAsesor}
                      alt="Firma del Asesor"
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-14" />
                )}
                <div className="border-b border-slate-400 w-4/5 mb-1.5" />
                <span className="font-bold text-slate-800">{data.asesorNombre}</span>
                <span className="text-[11px] text-slate-400">Firma del Asesor</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-14 w-full flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.firmaSupervisor || resolveSupervisorSignature(data.supervisorNombre)}
                    alt="Firma del Supervisor"
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
                <div className="border-b border-slate-400 w-4/5 mb-1.5" />
                <span className="font-bold text-slate-800">{data.supervisorNombre}</span>
                <span className="text-[11px] text-slate-500 font-medium">Firma del Supervisor</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="border-slate-300">
              <Printer className="w-4 h-4 mr-1.5" />
              Imprimir
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-[#E31E24] hover:bg-[#c71b1f] text-white font-medium"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {downloading ? "Generando..." : "Descargar PDF Oficial"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
