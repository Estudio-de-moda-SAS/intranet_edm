// app/(protected)/(intranet)/departments/legal/config/legalTeam.ts

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  area: string;
};

export const legalTeam: TeamMember[] = [
  {
    id: "leg-1",
    name: "Alejandro Peña",
    role: "Director Jurídico",
    email: "a.pena@empresa.com",
    phone: "Ext. 1200",
    area: "Dirección",
  },
  {
    id: "leg-2",
    name: "Valentina Cruz",
    role: "Abogada Senior — Contratos",
    email: "v.cruz@empresa.com",
    phone: "Ext. 1202",
    area: "Contratos",
  },
  {
    id: "leg-3",
    name: "Rodrigo Ibáñez",
    role: "Abogado — Compliance y Privacidad",
    email: "r.ibanez@empresa.com",
    phone: "Ext. 1204",
    area: "Compliance",
  },
  {
    id: "leg-4",
    name: "Camila Fuentes",
    role: "Abogada — Laboral",
    email: "c.fuentes@empresa.com",
    phone: "Ext. 1206",
    area: "Laboral",
  },
  {
    id: "leg-5",
    name: "Tomás Herrera",
    role: "Abogado — Litigios",
    email: "t.herrera@empresa.com",
    phone: "Ext. 1208",
    area: "Litigios",
  },
  {
    id: "leg-6",
    name: "Isabela Montoya",
    role: "Asistente Jurídica",
    email: "i.montoya@empresa.com",
    phone: "Ext. 1201",
    area: "Dirección",
  },
];