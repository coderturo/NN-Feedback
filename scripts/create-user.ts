import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import crypto from "crypto";

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
  const [email, name, role] = args;

  if (!email || !name || !role) {
    console.error("\n❌ Uso incorrecto.");
    console.error("Uso: npm run user:create -- <correo> \"<nombre>\" <admin|supervisor>");
    console.error("Ejemplo: npm run user:create -- supervisor1@empresa.com \"Carlos Mendoza\" supervisor\n");
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanRole = role.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    console.error(`\n❌ El correo "${cleanEmail}" no tiene un formato válido.\n`);
    process.exit(1);
  }

  if (cleanRole !== "admin" && cleanRole !== "supervisor") {
    console.error(`\n❌ Rol inválido: "${cleanRole}". Solo se permiten los roles "admin" o "supervisor".\n`);
    process.exit(1);
  }

  const tempPassword = generateTemporaryPassword(14);
  const { auth } = await import("../lib/auth");

  try {
    const result = await auth.api.createUser({
      body: {
        email: cleanEmail,
        password: tempPassword,
        name: cleanName,
        role: cleanRole,
        data: {
          mustChangePassword: true,
        },
      },
    });

    console.log("\n==================================================");
    console.log("✅ Usuario creado exitosamente");
    console.log("==================================================");
    console.log(`ID:       ${result.user.id}`);
    console.log(`Nombre:   ${cleanName}`);
    console.log(`Correo:   ${cleanEmail}`);
    console.log(`Rol:      ${cleanRole}`);
    console.log("--------------------------------------------------");
    console.log(`🔑 Contraseña temporal: ${tempPassword}`);
    console.log("⚠️  Guarda esta contraseña ahora. No se volverá a mostrar.");
    console.log("El usuario deberá cambiarla obligatoriamente en su primer acceso.");
    console.log("==================================================\n");

    process.exit(0);
  } catch (error: unknown) {
    const errObj = error as { body?: { message?: string }; message?: string } | null;
    const msg = errObj?.body?.message || errObj?.message || "Error desconocido";
    if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("duplicate")) {
      console.error(`\n❌ Error: Ya existe un usuario registrado con el correo "${cleanEmail}".\n`);
    } else {
      console.error(`\n❌ Error al crear usuario: ${msg}\n`);
    }
    process.exit(1);
  }
}

main();
