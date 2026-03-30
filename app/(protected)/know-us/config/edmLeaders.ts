// app/components/company/config/companyLeaders.ts
// 💡 Reemplaza initials/avatar con fotos y nombres reales del equipo directivo actual.

export type Leader = {
  name: string;
  role: string;
  area: string;
  initials?: string;
  /** Correo corporativo usado para obtener la foto desde Microsoft Graph */
  email?: string;
};

export const companyLeaders: Leader[] = [
  {
    name: "Maria Perez",
    role: "Co-Fundadora",
    area: "Dirección Estratégica",
    initials: "MP",
    email: "maria.perez@estudiodemoda.com.co", // ← reemplaza con el correo real
  },
  {
    name: "Alberto Gomez",
    role: "Co-Fundador",
    area: "Dirección Estratégica",
    initials: "AG",
    email: "alberto.gomez@estudiodemoda.com.co",
  },
  {
    name: "Dir. Comercial",
    role: "Director(a) Comercial",
    area: "Retail & Wholesale",
    initials: "DC",
    email: "dircomercial@estudiodemoda.com.co", // ← agrega el correo cuando tengas el nombre real
  },
  {
    name: "Dir. Talento Humano",
    role: "Director(a) de Talento",
    area: "Cultura & Personas",
    initials: "TH",
    email: "dirtalentohumano@estudiodemoda.com.co"
  },
  {
    name: "Dir. Operaciones",
    role: "Director(a) de Operaciones",
    area: "Logística & Supply Chain",
    initials: "DO",
    email: "diroperaciones@estudiodemoda.com.co",
  },
  {
    name: "Dir. Marketing",
    role: "Director(a) de Marketing",
    area: "Marca & Comunicaciones",
    initials: "MK",
    email: "dirmarketing@estudiodemoda.com.co",
  },
  {
    name: "Dir. Tecnología",
    role: "Director(a) de Tecnología",
    area: "Transformación Digital",
    initials: "TI",
    email: "dirtecnologia@estudiodemoda.com.co",
  },
];