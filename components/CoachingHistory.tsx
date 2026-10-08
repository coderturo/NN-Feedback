"use client";

import * as React from "react";
import {
  getCoachingHistory,
  deleteCoachingSession,
  clearCoachingHistory,
} from "@/actions/coaching";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, History, RefreshCw, Handshake, Eye, Trash2, AlertTriangle } from "lucide-react";
import { CoachingVoucherModal } from "./CoachingVoucherModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CampaignId, campaigns } from "@/lib/campaigns";
import type { CoachingSession } from "@/lib/db/schema";
import type { PDFVoucherData } from "@/lib/pdfGenerator";
import { toast } from "sonner";

type VoucherData = PDFVoucherData & { emailSent?: boolean; emailError?: string };

interface CoachingHistoryProps {
  campaign: CampaignId;
  userRole?: string | null;
}

export function CoachingHistory({ campaign, userRole }: CoachingHistoryProps) {
  const [sessions, setSessions] = React.useState<CoachingSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedVoucher, setSelectedVoucher] = React.useState<VoucherData | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Admin delete states
  const [sessionToDelete, setSessionToDelete] = React.useState<CoachingSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = React.useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = React.useState(false);
  const [clearingAll, setClearingAll] = React.useState(false);

  const isAdmin = userRole === "admin";

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
      campaign:
        session.campaign in { maquinarias: true, ambipar: true, arval: true }
          ? (session.campaign as CampaignId)
          : campaign,
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
      firmaSupervisor: session.firmaSupervisor || undefined,
    });
    setModalOpen(true);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSessionId(sessionToDelete.id);
    try {
      const res = await deleteCoachingSession(sessionToDelete.id);
      if (!res.success) {
        toast.error("Error al eliminar", { description: res.error });
        return;
      }
      toast.success("Registro eliminado", {
        description: `Se eliminó la auditoría de ${sessionToDelete.asesorNombre}.`,
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setSessionToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al eliminar el registro.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleClearHistory = async () => {
    setClearingAll(true);
    try {
      const res = await clearCoachingHistory(campaign);
      if (!res.success) {
        toast.error("Error al vaciar historial", { description: res.error });
        return;
      }
      toast.success("Historial vaciado", {
        description: `Se eliminaron las auditorías registradas en ${campaign}.`,
      });
      setSessions([]);
      setClearAllDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al vaciar el historial.");
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-12">
      <Card className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white py-0 shadow-sm lg:col-span-12">
        <CardHeader className="flex flex-col gap-4 border-b border-stone-100 bg-stone-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5" style={{ color: campaigns[campaign].accent }} />
              Historial de Auditorías & Compromisos
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Revisa los acuerdos previos de cada asesor antes de iniciar una nueva sesión
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && sessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearAllDialogOpen(true)}
                className="rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Vaciar Historial
              </Button>
            )}
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
          </div>
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
                  ? "Aún no hay sesiones registradas en la base de datos."
                  : "No se encontraron resultados para tu búsqueda."}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {sessions.length === 0
                  ? "Registra una nueva auditoría en la pestaña 'Nueva Auditoría' para comenzar a almacenar el historial."
                  : "Prueba buscando con otro término o limpia el buscador."}
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
                    <TableHead className="text-xs font-bold uppercase text-slate-700 text-right">Acción</TableHead>
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenVoucher(session)}
                            style={{ color: campaigns[campaign].accent }}
                            className="hover:opacity-80 hover:bg-stone-50 h-8 px-2 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Ver Acta
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSessionToDelete(session)}
                              className="text-stone-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                              title="Eliminar registro del historial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
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

      {/* Modal de confirmación para eliminar sesión individual */}
      <Dialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
          <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-xs">
                <Trash2 className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-stone-950">
                  ¿Eliminar registro de auditoría?
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500">
                  Esta acción eliminará de forma permanente la sesión del historial.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {sessionToDelete && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs space-y-1.5 my-2">
              <p className="text-stone-700">
                <span className="font-bold text-stone-900">Asesor:</span>{" "}
                {sessionToDelete.asesorNombre}
              </p>
              <p className="text-stone-700">
                <span className="font-bold text-stone-900">Fecha:</span>{" "}
                {format(new Date(sessionToDelete.fecha), "dd/MM/yyyy")}
              </p>
              <p className="text-stone-700 truncate">
                <span className="font-bold text-stone-900">Compromiso:</span> &quot;
                {sessionToDelete.compromiso}&quot;
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setSessionToDelete(null)}
              disabled={!!deletingSessionId}
              className="rounded-xl border-stone-200 text-xs font-semibold hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={!!deletingSessionId}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
            >
              {deletingSessionId ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para vaciar historial completo */}
      <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
          <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-xs">
                <AlertTriangle className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-stone-950">
                  ¿Vaciar historial de compromisos?
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500">
                  Se eliminarán todos los registros de auditoría de esta campaña.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 my-2">
            ⚠️ Se borrarán permanentemente <strong>{sessions.length}</strong> registro(s) para la
            campaña <strong className="uppercase">{campaign}</strong>. Esta acción no se puede
            deshacer.
          </div>

          <DialogFooter className="flex gap-2 pt-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setClearAllDialogOpen(false)}
              disabled={clearingAll}
              className="rounded-xl border-stone-200 text-xs font-semibold hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={clearingAll}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
            >
              {clearingAll ? "Vaciando..." : "Sí, vaciar historial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
