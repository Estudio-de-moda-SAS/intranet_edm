import type { DepartmentMember } from "@/types/DepartmentMember";

// 🔁 Reemplazar con fetch a tu API:
// const res = await fetch("/api/departments/logistics/team");
// const team = await res.json();

export const logisticsTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Mauricio Ossa",
    role: "Director de Logística",
    image: null,
    description: "Lidera la operación logística, rutas y estrategia de distribución.",
    linkedin: "https://linkedin.com",
    email: "mauricio@empresa.com",
  },
  {
    id: "2",
    name: "Sandra Cifuentes",
    role: "Coordinadora de Envíos",
    image: null,
    description: "Gestión y seguimiento de envíos nacionales e internacionales.",
    linkedin: "https://linkedin.com",
    email: "sandra@empresa.com",
  },
  {
    id: "3",
    name: "Jhon Varela",
    role: "Analista de Rutas",
    image: null,
    description: "Optimización de rutas, tiempos de entrega y rendimiento de flota.",
    linkedin: "https://linkedin.com",
    email: "jhon@empresa.com",
  },
  {
    id: "4",
    name: "Gloria Suárez",
    role: "Jefe de Almacén",
    image: null,
    description: "Control de inventario, capacidad de almacenes y stock crítico.",
    linkedin: "https://linkedin.com",
    email: "gloria@empresa.com",
  },
];