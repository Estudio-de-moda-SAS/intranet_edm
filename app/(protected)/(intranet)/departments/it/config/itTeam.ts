// app/it/config/itTeam.ts
import type { DepartmentMember } from "@/types/DepartmentMember";

// 🔁 Reemplazar con fetch a tu API:
// const res = await fetch("/api/departments/it/team");
// const team = await res.json();

export const itTeam: DepartmentMember[] = [
  {
    id:          "1",
    name:        "Andrés Mejía",
    role:        "Director de TI",
    image:       null,
    description: "Lidera la estrategia tecnológica, gobernanza de TI y transformación digital de la organización.",
    linkedin:    "https://linkedin.com",
    email:       "andres@empresa.com",
  },
  {
    id:          "2",
    name:        "Luisa Fernanda Cano",
    role:        "Ingeniera de Sistemas",
    image:       null,
    description: "Desarrollo, integración y mantenimiento de sistemas internos y APIs corporativas.",
    linkedin:    "https://linkedin.com",
    email:       "luisa@empresa.com",
  },
  {
    id:          "3",
    name:        "Camilo Ospina",
    role:        "Especialista en Ciberseguridad",
    image:       null,
    description: "Gestión de amenazas, monitoreo SIEM, aplicación de parches y cumplimiento ISO 27001.",
    linkedin:    "https://linkedin.com",
    email:       "camilo@empresa.com",
  },
  {
    id:          "4",
    name:        "Tatiana Reyes",
    role:        "Técnica de Soporte",
    image:       null,
    description: "Atención de tickets, soporte a usuarios, gestión de equipos y onboarding tecnológico.",
    linkedin:    "https://linkedin.com",
    email:       "tatiana@empresa.com",
  },
];