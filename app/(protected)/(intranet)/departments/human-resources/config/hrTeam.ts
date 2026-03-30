import type { DepartmentMember } from "@/types/DepartmentMember";

// 🔁 Reemplazar con fetch a tu API:
// const res = await fetch("/api/departments/hr/team");
// const team = await res.json();

export const hrTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Natalia Gómez",
    role: "Directora de RRHH",
    image: null,
    description: "Lidera la estrategia de talento y cultura organizacional.",
    linkedin: "https://linkedin.com",
    email: "natalia@empresa.com",
  },
  {
    id: "2",
    name: "Felipe Arango",
    role: "Coordinador de Nómina",
    image: null,
    description: "Gestión de nómina, beneficios y cumplimiento laboral.",
    linkedin: "https://linkedin.com",
    email: "felipe@empresa.com",
  },
  {
    id: "3",
    name: "Isabela Mora",
    role: "Analista de Reclutamiento",
    image: null,
    description: "Selección de talento y gestión del proceso de onboarding.",
    linkedin: "https://linkedin.com",
    email: "isabela@empresa.com",
  },
  {
    id: "4",
    name: "Ricardo Pinto",
    role: "Especialista en Bienestar",
    image: null,
    description: "Programas de bienestar, capacitación y clima organizacional.",
    linkedin: "https://linkedin.com",
    email: "ricardo@empresa.com",
  },
];