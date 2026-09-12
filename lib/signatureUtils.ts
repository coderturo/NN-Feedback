/**
 * Utilidades para la gestión y persistencia de firmas de supervisores.
 */

const STORAGE_PREFIX = "nn_feedback_supervisor_sig_";

/**
 * Obtiene la firma personalizada guardada en localStorage para un supervisor.
 */
export function getStoredSupervisorSignature(supervisorName: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${STORAGE_PREFIX}${supervisorName.replace(/\s+/g, "_").toLowerCase()}`;
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("Error leyendo firma de localStorage:", e);
    return null;
  }
}

/**
 * Guarda una firma personalizada (imagen o dibujo) para un supervisor en localStorage.
 */
export function saveSupervisorSignature(supervisorName: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${STORAGE_PREFIX}${supervisorName.replace(/\s+/g, "_").toLowerCase()}`;
    localStorage.setItem(key, dataUrl);
  } catch (e) {
    console.warn("Error guardando firma en localStorage:", e);
  }
}

/**
 * Elimina la firma personalizada de un supervisor en localStorage.
 */
export function removeSupervisorSignature(supervisorName: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${STORAGE_PREFIX}${supervisorName.replace(/\s+/g, "_").toLowerCase()}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Error eliminando firma en localStorage:", e);
  }
}

/**
 * Resuelve la firma del supervisor: busca primero la firma personalizada guardada (subida o dibujada),
 * y si no existe ninguna, genera la firma caligráfica por defecto.
 */
export function resolveSupervisorSignature(supervisorName: string): string {
  const custom = getStoredSupervisorSignature(supervisorName);
  if (custom) {
    return custom;
  }
  return getSupervisorSignatureDataUrl(supervisorName);
}

/**
 * Genera una firma caligráfica estilizada por defecto en canvas.
 */
export function getSupervisorSignatureDataUrl(supervisorName: string): string {
  if (typeof document === "undefined") {
    return "";
  }

  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Firma estilizada en tinta azul marino
  ctx.save();
  ctx.font = "italic 36px 'Brush Script MT', 'Caveat', 'Segoe Script', 'Great Vibes', cursive, serif";
  ctx.fillStyle = "#1e3a8a"; // Azul marino clásico
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Rotación ligera humanizada
  ctx.rotate(-0.05);

  let signatureText = supervisorName;
  if (supervisorName.toLowerCase().includes("arturo santiago")) {
    signatureText = "A. Santiago";
  } else if (supervisorName.toLowerCase().includes("operaciones")) {
    signatureText = "Sup. Operaciones";
  } else if (supervisorName.toLowerCase().includes("calidad")) {
    signatureText = "Sup. Calidad";
  }

  ctx.fillText(signatureText, 170, 50);

  // Trazo de rúbrica / floritura caligráfica
  ctx.beginPath();
  ctx.moveTo(60, 68);
  ctx.bezierCurveTo(120, 80, 220, 55, 300, 72);
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bucle decorativo final
  ctx.beginPath();
  ctx.arc(290, 68, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#1e3a8a";
  ctx.fill();

  ctx.restore();

  return canvas.toDataURL("image/png");
}
