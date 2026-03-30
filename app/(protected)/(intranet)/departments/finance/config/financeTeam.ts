import type { DepartmentMember } from "@/types/DepartmentMember";

// 🔁 Reemplazar con fetch a tu API:
// const res = await fetch("/api/departments/finance/team");
// const team = await res.json();

export const financeTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Carolina Jiménez",
    role: "Directora Financiera",
    image: null,
    description: "Lidera la estrategia financiera y el control presupuestario.",
    linkedin: "https://linkedin.com",
    email: "carolina@empresa.com",
  },
  {
    id: "2",
    name: "Sergio Mendoza",
    role: "Contador Senior",
    image: null,
    description: "Gestión contable, cierres mensuales y reportes fiscales.",
    linkedin: "https://linkedin.com",
    email: "sergio@empresa.com",
  },
  {
    id: "3",
    name: "Paola Ruiz",
    role: "Analista Financiera",
    image: null,
    description: "Análisis de presupuesto, proyecciones y métricas financieras.",
    linkedin: "https://linkedin.com",
    email: "paola@empresa.com",
  },
  {
    id: "4",
    name: "Hernán Castillo",
    role: "Coordinador de Tesorería",
    image: null,
    description: "Control de flujo de caja, pagos y cuentas por cobrar.",
    linkedin: "https://linkedin.com",
    email: "hernan@empresa.com",
  },
];