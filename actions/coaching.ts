"use server";

import { db } from "@/lib/db";
import { coachingSessions, NewCoachingSession } from "@/lib/db/schema";
import { resend } from "@/lib/resend";
import { render } from "@react-email/render";
import CoachingSummaryEmail from "@/emails/CoachingSummaryEmail";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import { CampaignId, campaigns } from "@/lib/campaigns";

export interface SubmitSessionInput {
  campaign: CampaignId;
  fecha: string; // ISO date string
  tema: string;
  supervisorNombre: string;
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
  error?: string;
}

export async function submitCoachingSession(
  input: SubmitSessionInput
): Promise<SubmitSessionResult> {
  try {
    const sessionDate = new Date(input.fecha);

    // 1. Guardar en Neon Postgres (Drizzle)
    let savedId: string | undefined = undefined;
    let dbSaved = false;

    if (process.env.DATABASE_URL) {
      try {
        const newRecord: NewCoachingSession = {
          fecha: sessionDate,
          campaign: input.campaign,
          tema: input.tema,
          supervisorNombre: input.supervisorNombre,
          supervisorEmail: input.supervisorEmail || null,
          asesorNombre: input.asesorNombre,
          asesorEmail: input.asesorEmail,
          detalleLlamada: input.detalleLlamada,
          meGusta: input.meGusta,
          mePreocupa: input.mePreocupa,
          teSugiero: input.teSugiero || null,
          compromiso: input.compromiso,
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
            supervisorNombre: input.supervisorNombre,
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

export async function getCoachingHistory(campaign?: CampaignId, asesorEmail?: string) {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    if (asesorEmail) {
      return await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.asesorEmail, asesorEmail))
        .orderBy(desc(coachingSessions.fecha));
    }

    if (campaign) {
      return await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.campaign, campaign))
        .orderBy(desc(coachingSessions.fecha))
        .limit(50);
    }

    return await db
      .select()
      .from(coachingSessions)
      .orderBy(desc(coachingSessions.fecha))
      .limit(50);
  } catch (error) {
    console.error("Error obteniendo historial de sesiones:", error);
    return [];
  }
}
