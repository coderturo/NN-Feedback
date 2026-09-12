"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "./DatePicker";
import { CoachingVoucherModal } from "./CoachingVoucherModal";
import { SignaturePad } from "./SignaturePad";
import { SupervisorSignatureModal } from "./SupervisorSignatureModal";
import { resolveSupervisorSignature, getStoredSupervisorSignature } from "@/lib/signatureUtils";
import { submitCoachingSession } from "@/actions/coaching";
import { toast } from "sonner";
import {
  UserCheck,
  Headphones,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Handshake,
  Send,
  Loader2,
  Info,
  PenTool,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CampaignId, campaigns } from "@/lib/campaigns";
import type { PDFVoucherData } from "@/lib/pdfGenerator";

type VoucherData = PDFVoucherData & { emailSent?: boolean; emailError?: string };

interface CoachingSessionFormProps {
  campaign: CampaignId;
  auditType: string;
  onAuditTypeChange: (auditType: string) => void;
}

export function CoachingSessionForm({ campaign, auditType, onAuditTypeChange }: CoachingSessionFormProps) {
  // Estados del formulario
  const [asesorNombre, setAsesorNombre] = React.useState("");
  const [asesorEmail, setAsesorEmail] = React.useState("");
  const [supervisorNombre, setSupervisorNombre] = React.useState("");
  const [fecha, setFecha] = React.useState<Date | null>(new Date());
  const [detalleLlamada, setDetalleLlamada] = React.useState("");
  const [meGusta, setMeGusta] = React.useState("");
  const [mePreocupa, setMePreocupa] = React.useState("");
  const [teSugiero, setTeSugiero] = React.useState("");
  const [compromiso, setCompromiso] = React.useState("");
  const [firmaAsesor, setFirmaAsesor] = React.useState<string | null>(null);

  // Estado de firma del supervisor
  const [sigModalOpen, setSigModalOpen] = React.useState(false);
  const [, setCustomSigVersion] = React.useState(0);

  const hasCustomSig = !!getStoredSupervisorSignature(supervisorNombre || "Arturo Santiago");

  // Estado de carga y modal
  const [submitting, setSubmitting] = React.useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = React.useState(false);
  const [voucherData, setVoucherData] = React.useState<VoucherData | null>(null);

  const resetForm = () => {
    setAsesorNombre("");
    setAsesorEmail("");
    setSupervisorNombre("");
    setFecha(new Date());
    onAuditTypeChange("Refuerzo Semanal");
    setDetalleLlamada("");
    setMeGusta("");
    setMePreocupa("");
    setTeSugiero("");
    setCompromiso("");
    setFirmaAsesor(null);
  };

  const handleVoucherOpenChange = (open: boolean) => {
    setVoucherModalOpen(open);
    if (!open) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !asesorNombre ||
      !asesorEmail ||
      !supervisorNombre ||
      !fecha ||
      !detalleLlamada ||
      !meGusta ||
      !mePreocupa ||
      !compromiso
    ) {
      toast.error("Faltan campos obligatorios", {
        description: "Por favor completa todos los campos requeridos marcados con *.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitCoachingSession({
        campaign,
        fecha: fecha.toISOString(),
        tema: auditType,
        supervisorNombre,
        asesorNombre,
        asesorEmail,
        detalleLlamada,
        meGusta,
        mePreocupa,
        teSugiero,
        compromiso,
      });

      if (result.success) {
        if (result.emailSent) {
          toast.success("Sesion guardada y notificada", {
            description: "Copia enviada por correo al asesor y registrada en la base de datos.",
          });
        } else {
          toast.success("Sesion guardada en la base de datos", {
            description: result.emailError
              ? `Nota de correo: ${result.emailError}`
              : "Sesion registrada. Puedes descargar el acta en PDF a continuacion.",
          });
        }

        const supSignature = resolveSupervisorSignature(supervisorNombre);

        setVoucherData({
          campaign,
          asesorNombre,
          asesorEmail,
          supervisorNombre,
          fecha: format(fecha, "dd 'de' MMMM, yyyy", { locale: es }),
          tema: auditType,
          detalleLlamada,
          meGusta,
          mePreocupa,
          teSugiero,
          compromiso,
          firmaAsesor,
          firmaSupervisor: supSignature,
          emailSent: result.emailSent,
          emailError: result.emailError,
        });

        setVoucherModalOpen(true);

      } else {
        toast.error("Error al registrar", {
          description: result.error || "Ocurrio un inconveniente al procesar la sesion.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado", {
        description: "Por favor revisa la conexion e intentalo nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-12">
        {/* ========================================================
            SECCION 1: FICHA DE LA SESION (Supervisor + Asesor)
        ======================================================== */}
        <Card className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white py-0 shadow-sm lg:col-span-7">
          <CardHeader className="border-b border-stone-100 bg-stone-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  1. Ficha de la Sesion de Feedback
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Identificacion de los participantes y parametros de la evaluacion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Asesor Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="asesorNombre" className="text-xs font-semibold text-slate-800">
                  Nombre y Apellido del Asesor <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="asesorNombre"
                  placeholder="Ej. Juan Carlos Perez"
                  value={asesorNombre}
                  onChange={(e) => setAsesorNombre(e.target.value)}
                  className="rounded-lg h-10 border-slate-300 bg-white"
                  required
                />
              </div>

              {/* Asesor Email */}
              <div className="space-y-1.5">
                <Label htmlFor="asesorEmail" className="text-xs font-semibold text-slate-800">
                  Correo Electronico del Asesor <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="asesorEmail"
                  type="email"
                  placeholder="asesor@empresa.com"
                  value={asesorEmail}
                  onChange={(e) => setAsesorEmail(e.target.value)}
                  className="rounded-lg h-10 border-slate-300 bg-white"
                  required
                />
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-0.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Se enviará una copia oficial del acta y compromiso a este correo automáticamente.
                  </span>
                </div>
              </div>

              {/* Supervisor a Cargo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="supervisor" className="text-xs font-semibold text-slate-800">
                    Supervisor a Cargo <span className="text-red-600">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSigModalOpen(true)}
                    className="h-6 px-2 text-[11px] text-[#E31E24] hover:text-[#c71b1f] hover:bg-rose-50"
                  >
                    <PenTool className="w-3 h-3 mr-1" />
                    {hasCustomSig ? "Firma personalizada activa" : "Configurar mi firma"}
                  </Button>
                </div>
                <Select value={supervisorNombre} onValueChange={setSupervisorNombre} required>
                  <SelectTrigger id="supervisor" className="rounded-lg h-10 border-slate-300 bg-white">
                    <SelectValue placeholder="Selecciona un supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arturo Santiago">Arturo Santiago</SelectItem>
                    <SelectItem value="Supervisor de Operaciones">Supervisor de Operaciones</SelectItem>
                    <SelectItem value="Supervisor de Calidad">Supervisor de Calidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tema o Tipo de Evaluacion */}
              <div className="space-y-1.5">
                <Label htmlFor="tema" className="text-xs font-semibold text-slate-800">
                  Tipo de Auditoria <span className="text-red-600">*</span>
                </Label>
                <Select value={auditType} onValueChange={onAuditTypeChange} required>
                  <SelectTrigger id="tema" className="rounded-lg h-10 border-slate-300 bg-white">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Refuerzo Semanal">Refuerzo Semanal</SelectItem>
                    <SelectItem value="Carta de conocimiento">Carta de conocimiento</SelectItem>
                    <SelectItem value="Carta de compromiso">Carta de compromiso</SelectItem>
                    <SelectItem value="Sancion">Sancion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de la Sesion */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-800">
                  Fecha de la Sesion <span className="text-red-600">*</span>
                </Label>
                <DatePicker value={fecha} onChange={setFecha} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECCION 2: AUDITORIA DE LLAMADA (Diagnostico Supervisor)
        ======================================================== */}
        <Card className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white py-0 shadow-sm lg:col-span-5">
          <CardHeader className="border-b border-stone-100 bg-stone-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E31E24] text-white rounded-lg">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  2. Diagnostico de la Llamada Auditada
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Espacio del supervisor para consignar hallazgos de calidad y atencion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {/* Detalle de llamada */}
            <div className="space-y-1.5">
              <Label htmlFor="detalle" className="text-xs font-semibold text-slate-800">
                Contexto / Detalle de la Llamada <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="detalle"
                placeholder="Indica el cliente, motivo de la llamada, duracion o situacion abordada..."
                rows={2}
                value={detalleLlamada}
                onChange={(e) => setDetalleLlamada(e.target.value)}
                className="rounded-lg border-slate-300 bg-white resize-none text-sm"
                required
              />
            </div>

            {/* Tarjeta: ME GUSTA (Verde Esmeralda) */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900">
                <ThumbsUp className="w-4 h-4 text-emerald-700" />
                <Label htmlFor="meGusta" className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Lo que me gusto (Puntos Positivos) <span className="text-red-600">*</span>
                </Label>
              </div>
              <p className="text-xs text-emerald-800">
                Reconoce los aciertos, empatia, escucha activa, buen uso de la marca o resolucion del asesor.
              </p>
              <Textarea
                id="meGusta"
                placeholder="Describe los aspectos destacados de la llamada..."
                rows={2}
                value={meGusta}
                onChange={(e) => setMeGusta(e.target.value)}
                className="rounded-lg border-emerald-300 bg-white focus-visible:ring-emerald-600 text-sm"
                required
              />
            </div>

            {/* Tarjeta: ME PREOCUPA (Ambar) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <Label htmlFor="mePreocupa" className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Lo que me preocupa (Oportunidades de Mejora) <span className="text-red-600">*</span>
                </Label>
              </div>
              <p className="text-xs text-amber-800">
                Senala puntos ciegos, falta de manejo de objeciones, informacion omitida o tiempos muertos.
              </p>
              <Textarea
                id="mePreocupa"
                placeholder="Describe las conductas o desvios que se deben corregir..."
                rows={2}
                value={mePreocupa}
                onChange={(e) => setMePreocupa(e.target.value)}
                className="rounded-lg border-amber-300 bg-white focus-visible:ring-amber-600 text-sm"
                required
              />
            </div>

            {/* Tarjeta: TE SUGIERO (Azul Cielo) */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-300 space-y-2">
              <div className="flex items-center gap-2 text-sky-900">
                <Lightbulb className="w-4 h-4 text-sky-700" />
                <Label htmlFor="teSugiero" className="text-xs font-bold uppercase tracking-wider text-sky-950">
                  Te sugiero (Recomendaciones Operativas)
                </Label>
              </div>
              <p className="text-xs text-sky-800">
                Ofrece una tecnica concreta, ejemplo de fraseo o metodo para aplicar de inmediato.
              </p>
              <Textarea
                id="teSugiero"
                placeholder="Ejemplo: 'Al detectar una objecion de precio, aplica la tecnica de preguntas alternativas...'"
                rows={2}
                value={teSugiero}
                onChange={(e) => setTeSugiero(e.target.value)}
                className="rounded-lg border-sky-300 bg-white focus-visible:ring-sky-600 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECCION 3: PACTO DEL ASESOR (Compromiso individual & Firma)
        ======================================================== */}
        <Card className="overflow-hidden rounded-[1.5rem] border-0 py-0 text-white shadow-sm lg:col-span-7" style={{ backgroundColor: campaigns[campaign].accent }}>
          <CardHeader className="border-b border-white/15 bg-black/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E31E24] text-white rounded-lg shadow-sm">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                  3. El Pacto de Mejora del Asesor
                  <span className="text-[11px] font-semibold bg-[#E31E24] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                    Compromiso
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-white/80">
                  El asesor toma la palabra, define su compromiso y rubrica con su firma digital
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 bg-white p-6 text-stone-900">
            <div className="space-y-1.5">
              <Label htmlFor="compromiso" className="text-xs font-bold text-slate-900">
                ¿A que te comprometes puntualmente a partir de esta sesion? <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="compromiso"
                placeholder="Escribe tu compromiso aqui (ej: 'Me comprometo a validar siempre la necesidad del cliente antes de presentar el precio')..."
                rows={3}
                value={compromiso}
                onChange={(e) => setCompromiso(e.target.value)}
                className="rounded-xl border-rose-300 bg-white focus-visible:ring-[#E31E24] text-sm p-3.5 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                required
              />
            </div>

            {/* Firma Digital con el Mouse / Touch */}
            <div className="pt-2 border-t border-slate-200">
              <SignaturePad value={firmaAsesor} onChange={setFirmaAsesor} />
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            BOTON DE ACCION Y CIERRE
        ======================================================== */}
        <div className="flex min-h-32 items-center justify-center rounded-[1.5rem] border border-stone-200 bg-white p-5 lg:col-span-5">
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full sm:w-auto bg-[#E31E24] hover:bg-[#c71b1f] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando y Notificando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Registrar Sesion & Emitir Acta
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Comprobante / PDF */}
      <CoachingVoucherModal
        open={voucherModalOpen}
        onOpenChange={handleVoucherOpenChange}
        data={voucherData}
      />

      {/* Modal de Configuración de Firma del Supervisor */}
      <SupervisorSignatureModal
        open={sigModalOpen}
        onOpenChange={setSigModalOpen}
        supervisorName={supervisorNombre || "Arturo Santiago"}
        onSignatureUpdated={() => setCustomSigVersion((v) => v + 1)}
      />
    </>
  );
}
