import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("⚠️ RESEND_API_KEY no está definida. Configúrala en tu archivo .env.local");
}

export const resend = new Resend(apiKey || "re_dummy_key");
