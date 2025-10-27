"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "./DatePicker";
import BrandHeader from "./BrandHeader";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/** 🎯 Google Forms config */
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSctqRNVr0dgmMz3Va2LEk7E-xbzI7Aghzv95onqoxGDISvVYg/formResponse";

/** IDs de entrada (de tu enlace prellenado) */
const ENTRY = {
  email: "entry.1264266624",
  nombre: "entry.1107389385",
  tema: "entry.284336716",
  fecha: "entry.1347151720",
  supervisor: "entry.2051471751",
  detalle: "entry.889217112",
  meGusta: "entry.249656818",
  mePreocupa: "entry.15627485",
  teSugiero: "entry.1811380278",
  compromiso: "entry.343654571",
} as const;

export default function FeedbackForm() {
  // 🧠 estados controlados
  const [email, setEmail] = React.useState("");
  const [nombre, setNombre] = React.useState("");
  const [tema, setTema] = React.useState<string | undefined>(undefined);
  const [fecha, setFecha] = React.useState<Date | null>(null);
  const [supervisor, setSupervisor] = React.useState<string | undefined>(undefined);
  const [detalle, setDetalle] = React.useState("");
  const [meGusta, setMeGusta] = React.useState("");
  const [mePreocupa, setMePreocupa] = React.useState("");
  const [teSugiero, setTeSugiero] = React.useState("");
  const [compromiso, setCompromiso] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = React.useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !email ||
      !nombre ||
      !tema ||
      !fecha ||
      !supervisor ||
      !detalle ||
      !meGusta ||
      !mePreocupa ||
      !compromiso
    ) {
      toast.error("Faltan campos requeridos", {
        description: "Completa los marcados con *",
      });
      return;
    }

    const formData = new FormData();
    formData.append(ENTRY.email, email);
    formData.append(ENTRY.nombre, nombre);
    formData.append(ENTRY.tema, tema!);
    formData.append(ENTRY.fecha, format(fecha!, "yyyy-MM-dd"));
    formData.append(ENTRY.supervisor, supervisor);
    formData.append(ENTRY.detalle, detalle);
    formData.append(ENTRY.meGusta, meGusta);
    formData.append(ENTRY.mePreocupa, mePreocupa);
    formData.append(ENTRY.teSugiero, teSugiero);
    formData.append(ENTRY.compromiso, compromiso);

    try {
      setSending(true);
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // limpiar
      setEmail("");
      setNombre("");
      setTema(undefined);
      setFecha(null);
      setSupervisor(undefined);
      setDetalle("");
      setMeGusta("");
      setMePreocupa("");
      setTeSugiero("");
      setCompromiso("");

      formRef.current?.reset();
      setResetKey((k) => k + 1);

      toast.success("¡Feedback enviado!", {
        description: "Tu respuesta fue registrada correctamente.",
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto bg-white/90 backdrop-blur-md border border-neutral-200 shadow-xl rounded-2xl">
      <CardContent className="p-8">
        {/* Encabezado dentro del Card */}
        <BrandHeader />

        {/* Formulario */}
        <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              placeholder="Ingresa tu correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name={ENTRY.email}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre y Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Tu nombre y apellido"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              name={ENTRY.nombre}
            />
          </div>

          {/* Tema y Supervisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tema (dropdown) */}
            <div className="space-y-2">
              <Label htmlFor="tema">
                Tema <span className="text-red-500">*</span>
              </Label>
              <Select  key={`tema-${resetKey}`} value={tema} onValueChange={setTema} required>
                <SelectTrigger id="tema">
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {/* Usa los mismos textos que el Forms */}
                  <SelectItem value="Monitoreo Semanal">
                    Monitoreo Semanal
                  </SelectItem>
                  <SelectItem value="Evaluación Mensual">
                    Evaluación Mensual
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Campo oculto para enviar a Google */}
              <input type="hidden" name={ENTRY.tema} value={tema ?? ""} />
            </div>

            {/* Supervisor (radio -> envía string exacto) */}
            <div className="space-y-2">
              <Label htmlFor="supervisor">
                Supervisor <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                key={`sup-${resetKey}`}  
                value={supervisor ?? undefined} 
                onValueChange={setSupervisor}
                className="flex items-center gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  {/* ⚠️ Usa el valor exacto que espera el Forms (sin acento, según tu prefill) */}
                  <RadioGroupItem value="Manuel Alvarez" id="sup-manuel" />
                  <Label htmlFor="sup-manuel">Manuel Álvarez</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Arturo Santiago" id="sup-arturo" />
                  <Label htmlFor="sup-arturo">Arturo Santiago</Label>
                </div>
              </RadioGroup>
              <input type="hidden" name={ENTRY.supervisor} value={supervisor} />
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha de la sesión <span className="text-red-500">*</span>
            </Label>
            <DatePicker key={resetKey} value={fecha} onChange={(d) => setFecha(d)} />
            {/* Campo oculto con formato igual al prefill */}
            <input
              type="hidden"
              name={ENTRY.fecha}
              value={fecha ? format(fecha, "yyyy-MM-dd") : ""}
              readOnly
            />
          </div>

          {/* Textos largos */}
          <div className="space-y-2">
            <Label>
              DETALLE DE LLAMADA <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Tu respuesta"
              required
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              name={ENTRY.detalle}
            />
          </div>

          <div className="space-y-2">
            <Label>
              ME GUSTA <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Tu respuesta"
              required
              value={meGusta}
              onChange={(e) => setMeGusta(e.target.value)}
              name={ENTRY.meGusta}
            />
          </div>

          <div className="space-y-2">
            <Label>
              ME PREOCUPA <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Tu respuesta"
              required
              value={mePreocupa}
              onChange={(e) => setMePreocupa(e.target.value)}
              name={ENTRY.mePreocupa}
            />
          </div>

          <div className="space-y-2">
            <Label>TE SUGIERO</Label>
            <Textarea
              placeholder="Tu respuesta"
              value={teSugiero}
              onChange={(e) => setTeSugiero(e.target.value)}
              name={ENTRY.teSugiero}
            />
          </div>

          <div className="space-y-2">
            <Label>
              COMPROMISO DEL ASESOR <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Tu respuesta"
              required
              value={compromiso}
              onChange={(e) => setCompromiso(e.target.value)}
              name={ENTRY.compromiso}
            />
          </div>

          {/* Botón */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-[#E31E24] hover:bg-[#c71b1f] text-white text-sm font-semibold py-2.5 rounded-lg"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
