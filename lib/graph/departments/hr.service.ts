import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph } from "@/lib/graph/graphClient";
import type { GraphPage } from "@/lib/graph/graphClient"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

type GraphHRUser = {
  id:          string
  displayName: string
  jobTitle?:   string | null
  department?: string | null
  mail?:       string | null
  hireDate?:   string | null
}

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  kpis: {
    totalEmpleados:      "1,284",
    vacantesAbiertas:    "9",
    nuevosIngresos:      "5",
    solicitudesAbiertas: "28",
    rotacionMensual:     "2.1%",
    reconocimientos:     "17",
    aniversarios:        "4",
    enCapacitacion:      "63",
  },
  employees: [
    { id: "e1", name: "Laura Torres",    department: "Ecommerce",  title: "Líder Digital",      status: "Activo" },
    { id: "e2", name: "Carlos Méndez",   department: "Retail",     title: "Coord. de Tiendas",  status: "Activo" },
    { id: "e3", name: "Ana Martínez",    department: "Finanzas",   title: "Analista Financiera", status: "Activo" },
    { id: "e4", name: "Luis Herrera",    department: "TI",         title: "Dev Backend",         status: "Activo" },
    { id: "e5", name: "María Sánchez",   department: "Comercial",  title: "Ejecutiva de Ventas", status: "Activo" },
  ],
  requests: [
    { id: "r1", type: "Vacaciones",      employee: "Laura Torres",  status: "Pendiente", date: "2026-03-08" },
    { id: "r2", type: "Permiso médico",  employee: "Carlos Méndez", status: "Aprobada",  date: "2026-03-06" },
    { id: "r3", type: "Capacitación",    employee: "Ana Martínez",  status: "Pendiente", date: "2026-03-09" },
    { id: "r4", type: "Home office",     employee: "Luis Herrera",  status: "Rechazada", date: "2026-03-05" },
  ],
  recruitment: [
    { id: "rc1", position: "Dev Frontend Senior", department: "TI",        stage: "Entrevistas", candidates: 4 },
    { id: "rc2", position: "Analista de Datos",   department: "Comercial", stage: "Pruebas",     candidates: 7 },
    { id: "rc3", position: "Coord. de Logística", department: "Retail",    stage: "Oferta",      candidates: 2 },
  ],
  anniversaries: [
    { id: "an1", name: "Pedro Gómez",   years: 5,  date: "2026-03-11", department: "TI"       },
    { id: "an2", name: "Sandra Reyes",  years: 10, date: "2026-03-12", department: "Finanzas" },
    { id: "an3", name: "Jorge Cárdenas",years: 3,  date: "2026-03-13", department: "Retail"   },
    { id: "an4", name: "Claudia Mora",  years: 7,  date: "2026-03-14", department: "RRHH"     },
  ],
  training: [
    { id: "tr1", course: "Liderazgo Efectivo",     enrolled: 24, progress: 68, dueDate: "2026-03-31" },
    { id: "tr2", course: "Seguridad de la Información", enrolled: 89, progress: 45, dueDate: "2026-03-20" },
    { id: "tr3", course: "Excel Avanzado",          enrolled: 31, progress: 90, dueDate: "2026-03-15" },
  ],
  headcount: [
    { department: "Comercial",  total: 210, new: 3, exits: 1 },
    { department: "TI",         total: 145, new: 2, exits: 0 },
    { department: "Retail",     total: 480, new: 5, exits: 3 },
    { department: "Finanzas",   total: 98,  new: 1, exits: 1 },
    { department: "Ecommerce",  total: 120, new: 1, exits: 0 },
    { department: "RRHH",       total: 45,  new: 0, exits: 0 },
    { department: "Operaciones",total: 186, new: 0, exits: 2 },
  ],
};

export async function getHRData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

const [usersRes, birthdaysRes] = await Promise.all([
  callGraph<GraphPage<GraphHRUser>>(
    "/users?$select=id,displayName,jobTitle,department,mail&$top=100&$filter=accountEnabled eq true",
    token
  ).catch((): GraphPage<GraphHRUser> => ({ value: [] })),

  callGraph<GraphPage<GraphHRUser>>(
    "/users?$select=id,displayName,department,hireDate&$top=50",
    token
  ).catch((): GraphPage<GraphHRUser> => ({ value: [] })),
])

const employees = usersRes.value.map(u => ({
  id:         u.id,
  name:       u.displayName,
  department: u.department ?? "Sin área",
  title:      u.jobTitle   ?? "Sin cargo",
  status:     "Activo",
}))

const anniversaries = birthdaysRes.value
  .filter(u => u.hireDate)
  .map(u => {
    const hire  = new Date(u.hireDate!)
    const today = new Date()
    const years = today.getFullYear() - hire.getFullYear()
    return {
      id:         u.id,
      name:       u.displayName,
      years,
      date:       u.hireDate!.split("T")[0] ?? "",
      department: u.department ?? "",
    }
  })
  .filter(a => a.years > 0)
  return {
    ...shared,
    kpis: {
      ...MOCK_DATA.kpis,
      totalEmpleados: employees.length.toString(),
    },
    employees:   employees.length > 0 ? employees   : MOCK_DATA.employees,
    anniversaries: anniversaries.length > 0 ? anniversaries : MOCK_DATA.anniversaries,
    // Requests, recruitment y training vienen de tu sistema HRIS
    requests:    MOCK_DATA.requests,
    recruitment: MOCK_DATA.recruitment,
    training:    MOCK_DATA.training,
    headcount:   MOCK_DATA.headcount,
  };
}

export type HRData = Awaited<ReturnType<typeof getHRData>>;