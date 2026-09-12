import jsPDF from "jspdf";
import { resolveSupervisorSignature } from "./signatureUtils";
import { CampaignId, campaigns } from "./campaigns";

export interface PDFVoucherData {
  campaign: CampaignId;
  asesorNombre: string;
  asesorEmail: string;
  supervisorNombre: string;
  fecha: string;
  tema: string;
  detalleLlamada: string;
  meGusta: string;
  mePreocupa: string;
  teSugiero?: string;
  compromiso: string;
  firmaAsesor?: string | null;
  firmaSupervisor?: string | null;
}

export function generateCoachingPDF(data: PDFVoucherData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Franja corporativa superior
  doc.setFillColor(227, 30, 36);
  doc.rect(0, 0, pageWidth, 5, "F");

  // Cabecera
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(campaigns[data.campaign].name.toUpperCase(), margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("GESTIÓN DE CALIDAD & OPERACIONES", margin, y + 4.5);

  // Badge de Fecha y Tipo a la derecha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const accent = campaigns[data.campaign].accent;
  const accentRgb = accent.match(/\w\w/g)?.map((value) => parseInt(value, 16)) ?? [227, 30, 36];
  doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
  doc.text(data.tema.toUpperCase(), pageWidth - margin, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha: ${data.fecha}`, pageWidth - margin, y + 4.5, { align: "right" });

  y += 10;

  // Título del Acta
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("ACTA DE SESIÓN DE FEEDBACK & COACHING 1 A 1", margin, y);
  y += 6;

  // Cuadro de Participantes
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("ASESOR AUDITADO:", margin + 4, y + 5);
  doc.text("SUPERVISOR A CARGO:", margin + contentWidth / 2, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.asesorNombre, margin + 4, y + 10);
  doc.text(data.supervisorNombre, margin + contentWidth / 2, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(data.asesorEmail, margin + 4, y + 14);

  y += 24;

  // Helper para dibujar tarjetas con texto
  const drawCard = (
    title: string,
    content: string,
    fillR: number,
    fillG: number,
    fillB: number,
    borderR: number,
    borderG: number,
    borderB: number,
    textR: number,
    textG: number,
    textB: number
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(textR, textG, textB);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const splitContent = doc.splitTextToSize(content || "Sin comentarios.", contentWidth - 8);
    const cardHeight = 8 + splitContent.length * 4.2;

    doc.setFillColor(fillR, fillG, fillB);
    doc.setDrawColor(borderR, borderG, borderB);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, "FD");

    // Título
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textR, textG, textB);
    doc.text(title, margin + 4, y + 5);

    // Contenido
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(splitContent, margin + 4, y + 9);

    y += cardHeight + 4;
  };

  // 1. Detalle de Llamada
  drawCard(
    "DETALLE DE LA LLAMADA AUDITADA",
    data.detalleLlamada,
    248, 250, 252,
    203, 213, 225,
    71, 85, 105
  );

  // 2. Me Gusta (Verde Esmeralda)
  drawCard(
    "PUNTOS POSITIVOS / RECONOCIMIENTO (LO QUE ME GUSTÓ)",
    data.meGusta,
    240, 253, 244,
    134, 239, 172,
    22, 101, 52
  );

  // 3. Me Preocupa (Ámbar)
  drawCard(
    "OPORTUNIDADES DE MEJORA / DESVÍOS (LO QUE ME PREOCUPA)",
    data.mePreocupa,
    254, 243, 199,
    252, 211, 77,
    180, 83, 9
  );

  // 4. Te Sugiero (Azul) si existe
  if (data.teSugiero) {
    drawCard(
      "RECOMENDACIONES OPERATIVAS (TE SUGIERO)",
      data.teSugiero,
      239, 246, 255,
      147, 197, 253,
      29, 78, 216
    );
  }

  // 5. El Compromiso del Asesor (Foco central en Rojo/Rosa)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const splitCompromiso = doc.splitTextToSize(
    `"${data.compromiso}"`,
    contentWidth - 8
  );
  const compCardHeight = 10 + splitCompromiso.length * 4.5;

  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(227, 30, 36);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, compCardHeight, 2, 2, "FD");

  doc.setTextColor(227, 30, 36);
  doc.text("COMPROMISO ADQUIRIDO POR EL ASESOR", margin + 4, y + 5.5);

  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(15, 23, 42);
  doc.text(splitCompromiso, margin + 4, y + 10.5);

  y += compCardHeight + 8;

  // Sección de Firmas
  const signBoxY = y;
  const colWidth = (contentWidth - 10) / 2;

  // Firma Asesor (con imagen si fue capturada)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);

  if (data.firmaAsesor) {
    try {
      // Dibujar imagen de firma en base64
      doc.addImage(data.firmaAsesor, "PNG", margin + 10, signBoxY - 5, colWidth - 20, 16);
    } catch (e) {
      console.warn("No se pudo incrustar la imagen de firma en PDF:", e);
    }
  }

  doc.line(margin + 5, signBoxY + 14, margin + colWidth - 5, signBoxY + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.asesorNombre, margin + colWidth / 2, signBoxY + 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Firma del Asesor", margin + colWidth / 2, signBoxY + 22, { align: "center" });

  // Firma Supervisor (personalizada o por defecto)
  const supColX = margin + colWidth + 10;
  const supSignature = data.firmaSupervisor || resolveSupervisorSignature(data.supervisorNombre);
  if (supSignature) {
    try {
      doc.addImage(supSignature, "PNG", supColX + 10, signBoxY - 5, colWidth - 20, 16);
    } catch (e) {
      console.warn("No se pudo incrustar la firma del supervisor en PDF:", e);
    }
  }

  doc.line(supColX + 5, signBoxY + 14, supColX + colWidth - 5, signBoxY + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.supervisorNombre, supColX + colWidth / 2, signBoxY + 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Firma del Supervisor", supColX + colWidth / 2, signBoxY + 22, { align: "center" });

  // Pie de página oficial
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Documento de seguimiento operativo y compromiso de calidad — NN Feedback",
    pageWidth / 2,
    290,
    { align: "center" }
  );

  const cleanName = data.asesorNombre.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Acta_Coaching_${cleanName}.pdf`);
}
