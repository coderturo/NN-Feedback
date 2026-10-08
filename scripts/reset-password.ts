import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import crypto from "crypto";
import { eq } from "drizzle-orm";

function generateTemporaryPassword(length = 14): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
  let pwd = "";
  pwd += "ABCDEFGHJKLMNPQRSTUVWXYZ"[crypto.randomInt(0, 24)];
  pwd += "abcdefghijkmnopqrstuvwxyz"[crypto.randomInt(0, 24)];
  pwd += "23456789"[crypto.randomInt(0, 8)];
  pwd += "!@#$%^&*"[crypto.randomInt(0, 8)];

  for (let i = 4; i < length; i++) {
    pwd += chars[crypto.randomInt(0, chars.length)];
  }

  return pwd.split("").sort(() => crypto.randomInt(-1, 2)).join("");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  const args = process.argv.slice(2);
  const [email] = args;

  if (!email) {
    console.error("\n❌ Uso incorrecto.");
    console.error("Uso: npm run user:reset -- <correo>");
    console.error("Ejemplo: npm run user:reset -- supervisor1@empresa.com\n");
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    console.error(`\n❌ El correo "${cleanEmail}" no tiene un formato válido.\n`);
    process.exit(1);
  }

  try {
    const { auth } = await import("../lib/auth");
    const { db } = await import("../lib/db");
    const { user } = await import("../lib/db/auth-schema");

    const ctx = await auth.$context;
    const existing = await ctx.internalAdapter.findUserByEmail(cleanEmail);

    if (!existing || !existing.user) {
      console.error(`\n❌ Error: No se encontró ningún usuario con el correo "${cleanEmail}".\n`);
      process.exit(1);
    }

    const targetUser = existing.user;
    const tempPassword = generateTemporaryPassword(14);
    const hashedPassword = await ctx.password.hash(tempPassword);

    // 1. Actualizar contraseña hasheada en account
    await ctx.internalAdapter.updatePassword(targetUser.id, hashedPassword);

    // 2. Revocar todas las sesiones activas
    await ctx.internalAdapter.deleteUserSessions(targetUser.id);

    // 3. Forzar cambio de contraseña en próximo inicio de sesión
    if (db) {
      await db
        .update(user)
        .set({ mustChangePassword: true })
        .where(eq(user.id, targetUser.id));
    }

    console.log("\n==================================================");
    console.log("✅ Contraseña restablecida exitosamente");
    console.log("==================================================");
    console.log(`Usuario:  ${targetUser.name} (${cleanEmail})`);
    console.log(`Rol:      ${(targetUser as { role?: string }).role || "supervisor"}`);
    console.log("Estado:   Sesiones activas revocadas.");
    console.log("--------------------------------------------------");
    console.log(`🔑 Nueva contraseña temporal: ${tempPassword}`);
    console.log("⚠️  Guarda esta contraseña ahora. No se volverá a mostrar.");
    console.log("El usuario deberá cambiarla obligatoriamente en su próximo acceso.");
    console.log("==================================================\n");

    process.exit(0);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error(`\n❌ Error al restablecer contraseña: ${msg}\n`);
    process.exit(1);
  }
}

main();
