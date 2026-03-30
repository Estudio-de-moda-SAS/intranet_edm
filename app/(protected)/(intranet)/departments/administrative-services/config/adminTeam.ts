// app/(protected)/(intranet)/departments/administrative/config/adminTeam.ts

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  area: string;
};

export const adminTeam: TeamMember[] = [
  {
    id: "adm-1",
    name: "Mariana Solís",
    role: "Directora Administrativa",
    email: "m.solis@empresa.com",
    phone: "Ext. 1100",
    area: "Dirección",
  },
  {
    id: "adm-2",
    name: "Ricardo Fuentes",
    role: "Coordinador de Compras",
    email: "r.fuentes@empresa.com",
    phone: "Ext. 1105",
    area: "Compras",
  },
  {
    id: "adm-3",
    name: "Valeria Campos",
    role: "Analista de Servicios Generales",
    email: "v.campos@empresa.com",
    phone: "Ext. 1108",
    area: "Servicios Generales",
  },
  {
    id: "adm-4",
    name: "Jorge Espinoza",
    role: "Coordinador de Archivo y Documentación",
    email: "j.espinoza@empresa.com",
    phone: "Ext. 1110",
    area: "Documentación",
  },
  {
    id: "adm-5",
    name: "Daniela Reyes",
    role: "Asistente Administrativa",
    email: "d.reyes@empresa.com",
    phone: "Ext. 1112",
    area: "Dirección",
  },
  {
    id: "adm-6",
    name: "Esteban Vargas",
    role: "Analista de Viáticos y Gastos",
    email: "e.vargas@empresa.com",
    phone: "Ext. 1115",
    area: "Finanzas Admin.",
  },
];
