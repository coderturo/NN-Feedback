export const campaigns = {
  maquinarias: {
    id: "maquinarias",
    name: "Maquinarias",
    logo: "/images/maquinarias-logo.jpg",
    accent: "#e31e24",
    soft: "#fff1f2",
    description: "Calidad, operaciones y seguimiento comercial.",
  },
  ambipar: {
    id: "ambipar",
    name: "Ambipar",
    logo: "/images/ambipar-logo.jpg",
    accent: "#13a538",
    soft: "#f0fdf4",
    description: "Gestión de experiencias y excelencia operativa.",
  },
  arval: {
    id: "arval",
    name: "Arval",
    logo: "/images/arval-logo.png",
    accent: "#0066b3",
    soft: "#eff6ff",
    description: "Acompañamiento, movilidad y servicio al cliente.",
  },
} as const;

export type CampaignId = keyof typeof campaigns;
export type Campaign = (typeof campaigns)[CampaignId];
