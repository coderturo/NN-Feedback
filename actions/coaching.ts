"use server";

import { db } from "@/lib/db";
import { coachingSessions, supervisorSignatures, NewCoachingSession } from "@/lib/db/schema";
import { resend } from "@/lib/resend";
import { render } from "@react-email/render";
import CoachingSummaryEmail from "@/emails/CoachingSummaryEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { desc, eq, and } from "drizzle-orm";
import { CampaignId, campaigns } from "@/lib/campaigns";
import { requireUser } from "@/lib/auth-server";

export interface SubmitSessionInput {
  campaign: CampaignId;
  fecha: string; // ISO date string
  tema: string;
  supervisorNombre?: string;
  supervisorEmail?: string;
  asesorNombre: string;
  asesorEmail: string;
  detalleLlamada: string;
  meGusta: string;
  mePreocupa: string;
  teSugiero?: string;
  compromiso: string;
}

export interface SubmitSessionResult {
  success: boolean;
  message: string;
  sessionId?: string;
  emailSent?: boolean;
  emailError?: string;
  dbSaved?: boolean;
  firmaSupervisor?: string | null;
  supervisorNombre?: string;
  error?: string;
}

export async function submitCoachingSession(
  input: SubmitSessionInput
): Promise<SubmitSessionResult> {
  try {
    const session = await requireUser({ redirect: false });
    const sessionDate = new Date(input.fecha);

    const supervisorId = session.user.id;
    const supervisorNombre = session.user.name;
    const supervisorEmail = session.user.email;

    // Obtener la firma registrada del supervisor
    let firmaSupervisor: string | null = null;
    if (db) {
      const [sig] = await db
        .select({ dataUrl: supervisorSignatures.dataUrl })
        .from(supervisorSignatures)
        .where(eq(supervisorSignatures.userId, supervisorId))
        .limit(1);
      firmaSupervisor = sig?.dataUrl || null;
    }

    // 1. Guardar en Neon Postgres (Drizzle)
    let savedId: string | undefined = undefined;
    let dbSaved = false;

    if (db) {
      try {
        const newRecord: NewCoachingSession = {
          fecha: sessionDate,
          campaign: input.campaign,
          tema: input.tema,
          supervisorId,
          supervisorNombre,
          supervisorEmail: supervisorEmail || null,
          asesorNombre: input.asesorNombre,
          asesorEmail: input.asesorEmail,
          detalleLlamada: input.detalleLlamada,
          meGusta: input.meGusta,
          mePreocupa: input.mePreocupa,
          teSugiero: input.teSugiero || null,
          compromiso: input.compromiso,
          firmaSupervisor,
        };

        const [result] = await db
          .insert(coachingSessions)
          .values(newRecord)
          .returning({ id: coachingSessions.id });

        savedId = result?.id;
        dbSaved = true;
      } catch (dbError) {
        console.error("Error guardando en Neon Postgres:", dbError);
      }
    } else {
      console.warn("DATABASE_URL no configurada. Omitiendo guardado en base de datos.");
    }

    // 2. Enviar correo de confirmación con Resend
    let emailSent = false;
    let emailError: string | undefined = undefined;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_dummy_key") {
      try {
        const fechaFormateada = format(sessionDate, "dd 'de' MMMM, yyyy", { locale: es });
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const fromName = process.env.RESEND_FROM_NAME || "Capacitacion NN";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
        const selectedCampaign = campaigns[input.campaign];

        const emailHtml = await render(
          CoachingSummaryEmail({
            asesorNombre: input.asesorNombre,
            campaignName: selectedCampaign.name,
            campaignAccent: selectedCampaign.accent,
            campaignSoft: selectedCampaign.soft,
            campaignLogoUrl: appUrl ? `${appUrl}${selectedCampaign.logo}` : undefined,
            supervisorNombre,
            fecha: fechaFormateada,
            tema: input.tema,
            detalleLlamada: input.detalleLlamada,
            meGusta: input.meGusta,
            mePreocupa: input.mePreocupa,
            teSugiero: input.teSugiero,
            compromiso: input.compromiso,
          })
        );

        const response = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [input.asesorEmail],
          subject: `Acta de Coaching: ${input.tema} — ${input.asesorNombre}`,
          html: emailHtml,
        });

        if (response.error) {
          console.error("Error enviando correo con Resend:", response.error);
          emailError = response.error.message;
        } else {
          emailSent = true;
        }
      } catch (mailEx) {
        console.error("Excepción enviando correo con Resend:", mailEx);
        emailError = mailEx instanceof Error ? mailEx.message : "Error al conectar con Resend";
      }
    } else {
      emailError = "RESEND_API_KEY no está configurada en .env.local.";
      console.warn(emailError);
    }

    return {
      success: true,
      message: "Sesión de coaching procesada exitosamente.",
      sessionId: savedId,
      dbSaved,
      emailSent,
      emailError,
      firmaSupervisor,
      supervisorNombre,
    };
  } catch (error) {
    console.error("Error procesando sesión:", error);
    return {
      success: false,
      message: "Ocurrió un error al procesar la sesión.",
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getCoachingHistory(campaign?: CampaignId) {
  const session = await requireUser({ redirect: false });

  if (!db) {
    return [];
  }

  try {
    const userRole = (session.user as { role?: string | null }).role;
    const isSupervisor = userRole === "supervisor";

    const conditions = [];

    if (isSupervisor) {
      conditions.push(eq(coachingSessions.supervisorId, session.user.id));
    }

    if (campaign) {
      conditions.push(eq(coachingSessions.campaign, campaign));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(coachingSessions)
      .where(whereClause)
      .orderBy(desc(coachingSessions.fecha))
      .limit(50);
  } catch (error) {
    console.error("Error obteniendo historial de sesiones:", error);
    return [];
  }
}

export async function deleteCoachingSession(id: string) {
  try {
    const session = await requireUser({ redirect: false });
    const userRole = (session.user as { role?: string | null }).role;
    if (userRole !== "admin") {
      return {
        success: false,
        error: "Acceso denegado: solo los administradores pueden eliminar registros del historial.",
      };
    }

    if (!id) {
      return {
        success: false,
        error: "ID de sesión requerido.",
      };
    }

    if (!db) {
      return {
        success: false,
        error: "Base de datos no disponible.",
      };
    }

    await db.delete(coachingSessions).where(eq(coachingSessions.id, id));

    return {
      success: true,
      message: "Sesión eliminada correctamente del historial.",
    };
  } catch (error) {
    console.error("Error al eliminar sesión de coaching:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al eliminar la sesión.",
    };
  }
}

export async function clearCoachingHistory(campaign?: CampaignId) {
  try {
    const session = await requireUser({ redirect: false });
    const userRole = (session.user as { role?: string | null }).role;
    if (userRole !== "admin") {
      return {
        success: false,
        error: "Acceso denegado: solo los administradores pueden vaciar el historial.",
      };
    }

    if (!db) {
      return {
        success: false,
        error: "Base de datos no disponible.",
      };
    }

    if (campaign) {
      await db.delete(coachingSessions).where(eq(coachingSessions.campaign, campaign));
    } else {
      await db.delete(coachingSessions);
    }

    return {
      success: true,
      message: campaign
        ? `Historial de la campaña "${campaign}" eliminado correctamente.`
        : "Todo el historial de sesiones ha sido eliminado.",
    };
  } catch (error) {
    console.error("Error al vaciar historial de coaching:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al vaciar el historial.",
    };
  }
}

