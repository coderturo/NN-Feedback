import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Row,
  Column,
  Img,
} from "@react-email/components";

interface CoachingSummaryEmailProps {
  campaignName: string;
  campaignAccent: string;
  campaignSoft: string;
  campaignLogoUrl?: string;
  asesorNombre: string;
  supervisorNombre: string;
  fecha: string;
  tema: string;
  detalleLlamada: string;
  meGusta: string;
  mePreocupa: string;
  teSugiero?: string;
  compromiso: string;
}

export function CoachingSummaryEmail({
  campaignName = "NN Feedback",
  campaignAccent = "#18181b",
  campaignSoft = "#f4f4f5",
  campaignLogoUrl,
  asesorNombre = "Asesor",
  supervisorNombre = "Supervisor",
  fecha = "10/09/2026",
  tema = "Monitoreo Semanal",
  detalleLlamada = "Llamada de asesoría y cotización.",
  meGusta = "Excelente tono y empatía con el cliente.",
  mePreocupa = "Falta claridad en el cierre de la oferta.",
  teSugiero = "Aplicar la técnica de preguntas de cierre alternativas.",
  compromiso = "Practicar el cierre alternativo en mis próximas 5 llamadas.",
}: CoachingSummaryEmailProps) {
  const headerStyle = { ...headerSection, borderBottom: `4px solid ${campaignAccent}` };
  const campaignCard = { ...detailCard, backgroundColor: campaignSoft, borderLeft: `4px solid ${campaignAccent}` };
  const campaignPill = { ...auditPill, backgroundColor: campaignAccent };
  const campaignCommitment = { ...commitmentBox, backgroundColor: campaignSoft, borderLeft: `4px solid ${campaignAccent}` };
  const campaignTitle = { ...commitmentTitle, color: campaignAccent };

  return (
    <Html lang="es">
      <Head />
      <Preview>Resumen de tu sesión de Coaching y Feedback - {campaignName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerStyle}>
            {campaignLogoUrl && <Img src={campaignLogoUrl} alt={campaignName} width="58" height="58" style={logo} />}
            <Text style={companyTitle}>{campaignName.toUpperCase()}</Text>
            <Text style={subTitle}>NN Feedback · Acta de sesión</Text>
          </Section>

            {/* Saludo */}
          <Section style={contentSection}>
            <Heading as="h2" style={heading}>
              Estimado(a) {asesorNombre}
            </Heading>
            <Text style={paragraph}>
              Compartimos el acta formal y acuerdos tomados durante tu sesión de retroalimentación 1 a 1 con tu supervisor.
            </Text>

            {/* Metadatos */}
            <Section style={metaBox}>
              <Row style={{ marginBottom: "8px" }}>
                <Column>
                  <Text style={metaLabel}>Fecha de Sesión:</Text>
                  <Text style={metaValue}>{fecha}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={metaLabel}>Supervisor:</Text>
                  <Text style={metaValue}>{supervisorNombre}</Text>
                </Column>
                <Column>
                  <Text style={metaLabel}>Asesor:</Text>
                  <Text style={metaValue}>{asesorNombre}</Text>
                </Column>
              </Row>
            </Section>

            {/* Detalle y tipo de auditoría */}
            <Section style={campaignCard}>
              <Row>
                <Column style={detailColumn}>
                  <Text style={sectionTitle}>Detalle de la llamada</Text>
                  <Text style={sectionBody}>{detalleLlamada}</Text>
                </Column>
                <Column style={auditColumn}>
                  <Text style={auditLabel}>Tipo de auditoría</Text>
                  <Text style={campaignPill}>{tema}</Text>
                </Column>
              </Row>
            </Section>

            {/* Bloque: Me gusta (Verde) */}
            <Section style={cardSuccess}>
              <Text style={badgeTitleSuccess}>[Puntos Positivos] Lo que me gustó</Text>
              <Text style={sectionBody}>{meGusta}</Text>
            </Section>

            {/* Bloque: Me preocupa (Naranja) */}
            <Section style={cardWarning}>
              <Text style={badgeTitleWarning}>[Oportunidades de Mejora] Lo que me preocupa</Text>
              <Text style={sectionBody}>{mePreocupa}</Text>
            </Section>

            {/* Bloque: Te sugiero (Azul) */}
            {teSugiero && (
              <Section style={cardInfo}>
                <Text style={badgeTitleInfo}>[Recomendaciones Operativas] Te sugiero</Text>
                <Text style={sectionBody}>{teSugiero}</Text>
              </Section>
            )}

            {/* Bloque principal: compromiso del asesor */}
            <Section style={campaignCommitment}>
              <Text style={campaignTitle}>Compromiso adquirido por el asesor</Text>
              <Text style={commitmentText}>&quot;{compromiso}&quot;</Text>
            </Section>

            <Hr style={divider} />

            <Text style={closingText}>
              Recuerda que la excelencia es un hábito y la mejora continua es el camino al éxito. Estaremos dando seguimiento a este compromiso en nuestra próxima sesión.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} NN Feedback
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default CoachingSummaryEmail;

// Estilos en línea para compatibilidad universal de clientes de correo
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "12px",
  overflow: "hidden" as const,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  border: "1px solid #e4e4e7",
};

const headerSection = {
  backgroundColor: "#18181b",
  padding: "24px 32px",
  textAlign: "center" as const,
  borderBottom: "4px solid #E31E24",
};

const logo = {
  display: "block" as const,
  margin: "0 auto 12px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  objectFit: "contain" as const,
};

const companyTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "2px",
  margin: "0 0 4px 0",
};

const subTitle = {
  color: "#a1a1aa",
  fontSize: "14px",
  margin: 0,
};

const contentSection = {
  padding: "28px 32px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#09090b",
  margin: "0 0 8px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#52525b",
  margin: "0 0 20px 0",
};

const metaBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "20px",
};

const metaLabel = {
  fontSize: "11px",
  textTransform: "uppercase" as const,
  color: "#64748b",
  fontWeight: "700",
  margin: "0 0 2px 0",
};

const metaValue = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0,
};

const detailCard = {
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "14px",
};

const detailColumn = { paddingRight: "12px" };
const auditColumn = { width: "156px", verticalAlign: "middle" as const, paddingLeft: "12px" };
const auditLabel = { fontSize: "10px", fontWeight: "700", textTransform: "uppercase" as const, color: "#64748b", margin: "0 0 6px" };
const auditPill = { borderRadius: "999px", color: "#ffffff", fontSize: "11px", fontWeight: "700", lineHeight: "16px", margin: 0, padding: "6px 10px", textAlign: "center" as const };

const sectionTitle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
  margin: "0 0 6px 0",
};

const sectionBody = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#1f2937",
  margin: 0,
};

const cardSuccess = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderLeft: "4px solid #16a34a",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "14px",
};

const badgeTitleSuccess = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#15803d",
  margin: "0 0 6px 0",
};

const cardWarning = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fef3c7",
  borderLeft: "4px solid #d97706",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "14px",
};

const badgeTitleWarning = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#b45309",
  margin: "0 0 6px 0",
};

const cardInfo = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderLeft: "4px solid #2563eb",
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "14px",
};

const badgeTitleInfo = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1d4ed8",
  margin: "0 0 6px 0",
};

const commitmentBox = {
  backgroundColor: "#fff1f2",
  border: "1px solid #fecdd3",
  borderLeft: "4px solid #E31E24",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "20px",
};

const commitmentTitle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#9f1239",
  margin: "0 0 8px 0",
};

const commitmentText = {
  fontSize: "15px",
  fontStyle: "italic",
  fontWeight: "600",
  color: "#881337",
  lineHeight: "22px",
  margin: 0,
};

const divider = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
};

const closingText = {
  fontSize: "12px",
  color: "#71717a",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: 0,
};

const footer = {
  backgroundColor: "#fafafa",
  padding: "16px 24px",
  textAlign: "center" as const,
  borderTop: "1px solid #f4f4f5",
};

const footerText = {
  fontSize: "11px",
  color: "#a1a1aa",
  margin: 0,
};
