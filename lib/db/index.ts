import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL no está definida. Configúrala en tu archivo .env.local");
}

const fullSchema = { ...schema, ...authSchema };

// No crear el cliente con una cadena vacía: en despliegues sin DATABASE_URL
// Neon puede fallar durante la carga del módulo, antes de que la Server Action
// pueda informar el error al usuario.
export const db = connectionString
  ? drizzle(neon(connectionString), { schema: fullSchema })
  : null;
