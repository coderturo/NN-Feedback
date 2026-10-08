"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";
import { supervisorSignatures } from "@/lib/db/schema";
import { requireUser, getPostLoginRoute } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export interface AccountActionResult {
  success: boolean;
  message?: string;
  error?: string;
  nextRoute?: string;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<AccountActionResult> {
  try {
    const session = await requireUser({ redirect: false });

    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: "Por favor, completa tanto la contraseña actual como la nueva.",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "La nueva contraseña debe tener al menos 8 caracteres.",
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        error: "La nueva contraseña debe ser diferente a la contraseña actual.",
      };
    }

    // 1. Invocar auth.api.changePassword de Better Auth
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    // 2. Solo tras éxito comprobado, actualizar mustChangePassword = false en la BD
    if (db) {
      await db
        .update(user)
        .set({ mustChangePassword: false })
        .where(eq(user.id, session.user.id));
    }

    // 3. Determinar siguiente ruta según orden de prioridad
    const updatedUser = {
      ...session.user,
      mustChangePassword: false,
    };
    const nextRoute = await getPostLoginRoute(updatedUser);

    return {
      success: true,
      message: "Contraseña actualizada exitosamente.",
      nextRoute,
    };
  } catch (error: unknown) {
    console.error("Error al cambiar contraseña:", error);
    const errObj = error as { body?: { message?: string }; message?: string };
    const rawMsg = errObj?.body?.message || errObj?.message || "";
    let friendlyError = "No se pudo actualizar la contraseña.";

    if (
      rawMsg.includes("Invalid password") ||
      rawMsg.includes("password") ||
      rawMsg.includes("Unauthorized")
    ) {
      friendlyError = "La contraseña actual es incorrecta.";
    } else if (rawMsg) {
      friendlyError = rawMsg;
    }

    return {
      success: false,
      error: friendlyError,
    };
  }
}

export async function saveSignatureAction(
  dataUrl: string
): Promise<AccountActionResult> {
  try {
    const session = await requireUser({ redirect: false });

    if (!dataUrl || typeof dataUrl !== "string") {
      return {
        success: false,
        error: "No se proporcionó la imagen de la firma.",
      };
    }

    // 1. Validación de prefijo MIME admitido
    const isPng = dataUrl.startsWith("data:image/png;base64,");
    const isJpeg = dataUrl.startsWith("data:image/jpeg;base64,");
    if (!isPng && !isJpeg) {
      return {
        success: false,
        error: "El formato de la firma no es válido. Solo se admiten imágenes PNG o JPG.",
      };
    }

    // 2. Validación de longitud máxima del base64 (máx ~700 KB)
    if (dataUrl.length > 900_000) {
      return {
        success: false,
        error: "El archivo de firma es demasiado pesado. Dibuja la firma o sube una imagen optimizada.",
      };
    }

    // 3. Validación de contenido base64 decodificable
    const parts = dataUrl.split(",");
    if (parts.length !== 2 || !parts[1]) {
      return {
        success: false,
        error: "La imagen de la firma está dañada o incompleta.",
      };
    }

    const buffer = Buffer.from(parts[1], "base64");
    if (buffer.length < 50) {
      return {
        success: false,
        error: "El lienzo de la firma parece estar vacío.",
      };
    }

    if (!db) {
      return {
        success: false,
        error: "Error interno: la base de datos no está disponible.",
      };
    }

    // 4. Guardar con upsert en supervisor_signatures
    await db
      .insert(supervisorSignatures)
      .values({
        userId: session.user.id,
        dataUrl,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: supervisorSignatures.userId,
        set: {
          dataUrl,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
      message: "Firma registrada correctamente.",
      nextRoute: "/",
    };
  } catch (error: unknown) {
    console.error("Error al guardar firma del supervisor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al guardar la firma.",
    };
  }
}
