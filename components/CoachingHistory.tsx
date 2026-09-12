"use client";

import * as React from "react";
import { getCoachingHistory } from "@/actions/coaching";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, History, RefreshCw, Handshake, Eye } from "lucide-react";
import { CoachingVoucherModal } from "./CoachingVoucherModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CampaignId } from "@/lib/campaigns";
import type { CoachingSession } from "@/lib/db/schema";
import type { PDFVoucherData } from "@/lib/pdfGenerator";

type VoucherData = PDFVoucherData & { emailSent?: boolean; emailError?: string };

export function CoachingHistory({ campaign }: { campaign: CampaignId }) {
  const [sessions, setSessions] = React.useState<CoachingSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedVoucher, setSelectedVoucher] = React.useState<VoucherData | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCoachingHistory(campaign);
      setSessions(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredSessions = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.asesorNombre?.toLowerCase().includes(q) ||
      s.asesorEmail?.toLowerCase().includes(q) ||
      s.supervisorNombre?.toLowerCase().includes(q) ||
      s.tema?.toLowerCase().includes(q) ||
      s.compromiso?.toLowerCase().includes(q)
    );
  });

  const handleOpenVoucher = (session: CoachingSession) => {
    setSelectedVoucher({
      campaign: session.campaign in { maquinarias: true, ambipar: true, arval: true } ? session.campaign as CampaignId : campaign,
      asesorNombre: session.asesorNombre,
      asesorEmail: session.asesorEmail,
      supervisorNombre: session.supervisorNombre,
      fecha: format(new Date(session.fecha), "dd 'de' MMMM, yyyy", { locale: es }),
      tema: session.tema,
      detalleLlamada: session.detalleLlamada,
      meGusta: session.meGusta,
      mePreocupa: session.mePreocupa,
      teSugiero: session.teSugiero || undefined,
      compromiso: session.compromiso,
    });
    setModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-12">
      <Card className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white py-0 shadow-sm lg:col-span-12">
        <CardHeader className="flex flex-col gap-4 border-b border-stone-100 bg-stone-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-[#E31E24]" />
              Historial de Auditorias & Compromisos
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Revisa los acuerdos previos de cada asesor antes de iniciar una nueva sesion
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            disabled={loading}
            className="rounded-lg text-xs border-slate-300 bg-white hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {/* Buscador */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por asesor, supervisor o compromiso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg border-slate-300 bg-white text-sm"
            />
          </div>

          {/* Tabla de Resultados */}
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Cargando historial de compromisos...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white rounded-xl border border-dashed border-slate-300 p-8">
              <Handshake className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                {sessions.length === 0
                  ? "Aun no hay sesiones registradas en la base de datos."
                  : "No se encontraron resultados para tu busqueda."}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {sessions.length === 0
                  ? "Registra una nueva auditoria en la pestana 'Nueva Auditoria' para comenzar a almacenar el historial."
                  : "Prueba buscando con otro termino o limpia el buscador."}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <Table>
                <TableHeader className="bg-slate-100 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase text-slate-700">Fecha</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-slate-700">Asesor</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-slate-700">Supervisor</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-slate-700">Tipo</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-slate-700">Compromiso Asumido</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-slate-700 text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <TableCell className="text-xs text-slate-700 font-mono whitespace-nowrap">
                        {format(new Date(session.fecha), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-900">{session.asesorNombre}</div>
                        <div className="text-[11px] text-slate-500">{session.asesorEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-800 font-medium">
                        {session.supervisorNombre}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal border-slate-300">
                          {session.tema}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-800 max-w-xs truncate italic">
                        &quot;{session.compromiso}&quot;
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenVoucher(session)}
                          className="text-[#E31E24] hover:text-[#c71b1f] hover:bg-rose-50 h-8 px-2"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver Acta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Acta / Voucher */}
      <CoachingVoucherModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={selectedVoucher}
      />
    </div>
  );
}
