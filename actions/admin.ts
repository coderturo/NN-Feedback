"use server";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";
import { requireUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export interface CreateSupervisorResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  temporaryPassword?: string;
}

function generateTemporaryPassword(length = 12): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  pwd += "ABCDEFGHJKLMNPQRSTUVWXYZ"[crypto.randomInt(0, 23)];
  pwd += "abcdefghjkmnpqrstuvwxyz"[crypto.randomInt(0, 23)];
  pwd += "23456789"[crypto.randomInt(0, 8)];
  pwd += "!@#$%"[crypto.randomInt(0, 5)];

  for (let i = 4; i < length; i++) {
    pwd += chars[crypto.randomInt(0, chars.length)];
  }

  return pwd.split("").sort(() => crypto.randomInt(-1, 2)).join("");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createSupervisorAction(params: {
  name: string;
  email: string;
  customPassword?: string;
}): Promise<CreateSupervisorResult> {
  try {
    const session = await requireUser({ redirect: false });
    const userRole = (session.user as { role?: string | null }).role;
    if (userRole !== "admin") {
      return {
        success: false,
        error: "Acceso denegado: solo los administradores pueden crear supervisores.",
      };
    }

    const cleanName = params.name?.trim();
    const cleanEmail = params.email?.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return {
        success: false,
        error: "Por favor, ingresa un nombre válido para el supervisor.",
      };
    }

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      return {
        success: false,
        error: "Por favor, ingresa un correo electrónico válido.",
      };
    }

    const tempPassword = params.customPassword?.trim() || generateTemporaryPassword(12);

    if (tempPassword.length < 8) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 8 caracteres.",
      };
    }

    if (db) {
      const existing = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, cleanEmail))
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: `Ya existe un usuario registrado con el correo "${cleanEmail}".`,
        };
      }
    }

    const result = await auth.api.createUser({
      body: {
        email: cleanEmail,
        password: tempPassword,
        name: cleanName,
        role: "supervisor",
        data: {
          mustChangePassword: true,
        },
      },
    });

    if (db && result?.user?.id) {
      await db
        .update(user)
        .set({ mustChangePassword: true })
        .where(eq(user.id, result.user.id));
    }

    return {
      success: true,
      message: "Supervisor creado exitosamente.",
      user: {
        id: result.user.id,
        name: cleanName,
        email: cleanEmail,
        role: "supervisor",
      },
      temporaryPassword: tempPassword,
    };
  } catch (error: unknown) {
    console.error("Error al crear supervisor:", error);
    const errObj = error as { body?: { message?: string }; message?: string } | null;
    const msg = errObj?.body?.message || errObj?.message || "";
    if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("duplicate")) {
      return {
        success: false,
        error: `Ya existe un usuario registrado con el correo "${params.email}".`,
      };
    }
    return {
      success: false,
      error: msg || "Error desconocido al crear supervisor.",
    };
  }
}
