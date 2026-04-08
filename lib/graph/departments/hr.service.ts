/**
 * @module graph/departments/hr.service
 * Service de datos para el departamento de Recursos Humanos de la
 * intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard de RRHH: KPIs de headcount, directorio de empleados,
 * solicitudes activas, procesos de reclutamiento, aniversarios laborales
 * y cursos de capacitación en progreso.
 *
 * En producción, el directorio de empleados y los aniversarios se obtienen
 * desde Microsoft Graph. Solicitudes, reclutamiento, capacitación y
 * headcount están pendientes de integración con el sistema HRIS corporativo
 * — actualmente se sirven desde {@link MOCK_DATA}.
 *
 * **Scopes de Graph requeridos:**
 * | Scope                | Dato obtenido                              |
 * |----------------------|--------------------------------------------|
 * | `User.Read.All`      | Directorio de empleados activos            |
 * | `User.ReadBasic.All` | Perfil básico para aniversarios laborales  |
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function HRPage() {
 *   const data = await getHRData();
 *   return <HRDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph }               from "@/lib/graph/graphClient";
import type { GraphPage }          from "@/lib/graph/graphClient";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos de Graph ────────────────────────────────────────────────────────────

/**
 * Subconjunto del perfil de usuario de Entra ID usado por las consultas
 * de RRHH en Graph.
 *
 * @remarks
 * Se usa en dos consultas distintas con campos diferentes:
 * - Directorio: `id`, `displayName`, `jobTitle`, `department`, `mail`
 * - Aniversarios: `id`, `displayName`, `department`, `hireDate`
 *
 * Todos los campos opcionales pueden ser `null` si no están configurados
 * en el perfil de Entra ID del colaborador.
 */
export type GraphHRUser = {
  /** Object ID del usuario en Azure AD. */
  id: string;

  /** Nombre display del usuario. */
  displayName: string;

  /** Cargo del usuario. `null` si no está configurado. */
  jobTitle?: string | null;

  /** Departamento del usuario. `null` si no está configurado. */
  department?: string | null;

  /** Correo corporativo. `null` si el usuario no tiene buzón asignado. */
  mail?: string | null;

  /**
   * Fecha de contratación en formato ISO 8601.
   * `null` si no está configurada en el perfil de Entra ID.
   * Se usa para calcular los años de antigüedad en {@link getHRData}.
   */
  hireDate?: string | null;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock del dashboard de RRHH para desarrollo local sin Azure.
 *
 * @remarks
 * Incluye KPIs, empleados, solicitudes, procesos de reclutamiento,
 * aniversarios, cursos de capacitación y headcount por departamento
 * con valores representativos del contexto de EDM.
 *
 * En producción, `employees` y `anniversaries` se reemplazan con datos
 * reales de Graph. El resto de los datos permanecen como mock hasta que
 * se integre el sistema HRIS corporativo.
 */
export const MOCK_DATA = {
  /**
   * KPIs del dashboard de RRHH.
   * Todos los valores son strings formateados para mostrar directamente
   * en la UI. `totalEmpleados` se sobreescribe en producción con el
   * conteo real de Graph.
   */
  kpis: {
    /** Número total de colaboradores activos en la organización. */
    totalEmpleados: "1,284",
    /** Número de vacantes abiertas en procesos de selección activos. */
    vacantesAbiertas: "9",
    /** Nuevos ingresos registrados en el mes en curso. */
    nuevosIngresos: "5",
    /** Solicitudes de RRHH abiertas pendientes de gestión. */
    solicitudesAbiertas: "28",
    /** Tasa de rotación mensual expresada como porcentaje. */
    rotacionMensual: "2.1%",
    /** Número de reconocimientos entre pares registrados en el mes. */
    reconocimientos: "17",
    /** Número de aniversarios laborales en los próximos 7 días. */
    aniversarios: "4",
    /** Número de colaboradores con cursos de capacitación en progreso. */
    enCapacitacion: "63",
  },

  /** Empleados activos representativos de los principales departamentos. */
  employees: [
    { id: "e1", name: "Laura Torres",  department: "Ecommerce", title: "Líder Digital",       status: "Activo" },
    { id: "e2", name: "Carlos Méndez", department: "Retail",    title: "Coord. de Tiendas",   status: "Activo" },
    { id: "e3", name: "Ana Martínez",  department: "Finanzas",  title: "Analista Financiera",  status: "Activo" },
    { id: "e4", name: "Luis Herrera",  department: "TI",        title: "Dev Backend",          status: "Activo" },
    { id: "e5", name: "María Sánchez", department: "Comercial", title: "Ejecutiva de Ventas",  status: "Activo" },
  ],

  /** Solicitudes de RRHH recientes con distintos estados. */
  requests: [
    { id: "r1", type: "Vacaciones",     employee: "Laura Torres",  status: "Pendiente", date: "2026-03-08" },
    { id: "r2", type: "Permiso médico", employee: "Carlos Méndez", status: "Aprobada",  date: "2026-03-06" },
    { id: "r3", type: "Capacitación",   employee: "Ana Martínez",  status: "Pendiente", date: "2026-03-09" },
    { id: "r4", type: "Home office",    employee: "Luis Herrera",  status: "Rechazada", date: "2026-03-05" },
  ],

  /** Procesos de reclutamiento activos con etapa y número de candidatos. */
  recruitment: [
    { id: "rc1", position: "Dev Frontend Senior", department: "TI",        stage: "Entrevistas", candidates: 4 },
    { id: "rc2", position: "Analista de Datos",   department: "Comercial", stage: "Pruebas",     candidates: 7 },
    { id: "rc3", position: "Coord. de Logística", department: "Retail",    stage: "Oferta",      candidates: 2 },
  ],

  /** Aniversarios laborales próximos de colaboradores. */
  anniversaries: [
    { id: "an1", name: "Pedro Gómez",    years: 5,  date: "2026-03-11", department: "TI"       },
    { id: "an2", name: "Sandra Reyes",   years: 10, date: "2026-03-12", department: "Finanzas" },
    { id: "an3", name: "Jorge Cárdenas", years: 3,  date: "2026-03-13", department: "Retail"   },
    { id: "an4", name: "Claudia Mora",   years: 7,  date: "2026-03-14", department: "RRHH"     },
  ],

  /** Cursos de capacitación activos con inscritos y progreso. */
  training: [
    { id: "tr1", course: "Liderazgo Efectivo",           enrolled: 24, progress: 68, dueDate: "2026-03-31" },
    { id: "tr2", course: "Seguridad de la Información",  enrolled: 89, progress: 45, dueDate: "2026-03-20" },
    { id: "tr3", course: "Excel Avanzado",               enrolled: 31, progress: 90, dueDate: "2026-03-15" },
  ],

  /** Headcount actual por departamento con ingresos y salidas del mes. */
  headcount: [
    { department: "Comercial",   total: 210, new: 3, exits: 1 },
    { department: "TI",          total: 145, new: 2, exits: 0 },
    { department: "Retail",      total: 480, new: 5, exits: 3 },
    { department: "Finanzas",    total: 98,  new: 1, exits: 1 },
    { department: "Ecommerce",   total: 120, new: 1, exits: 0 },
    { department: "RRHH",        total: 45,  new: 0, exits: 0 },
    { department: "Operaciones", total: 186, new: 0, exits: 2 },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento de Recursos Humanos.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción ejecuta dos consultas a Graph en paralelo con
 * `Promise.all`:
 *
 * 1. **Directorio** — `/users` con `accountEnabled eq true` para obtener
 *    el listado de empleados activos con cargo y departamento.
 * 2. **Aniversarios** — `/users` con `hireDate` para calcular los años
 *    de antigüedad de cada colaborador. Solo se incluyen colaboradores
 *    con al menos 1 año de antigüedad (`years > 0`).
 *
 * Cada consulta tiene su propio `.catch()` que retorna una página vacía,
 * garantizando que el fallo de una fuente no impida mostrar los demás datos.
 * Si Graph retorna arrays vacíos, se usa {@link MOCK_DATA} como fallback
 * para `employees` y `anniversaries`.
 *
 * El KPI `totalEmpleados` se sobreescribe con el conteo real de Graph
 * cuando hay datos disponibles, manteniendo el resto de KPIs desde mock
 * hasta integrar el sistema HRIS.
 *
 * ⏳ Pendiente de integración con HRIS:
 * - `requests` → solicitudes de permisos y vacaciones
 * - `recruitment` → vacantes y candidatos activos
 * - `training` → cursos y progreso de capacitación
 * - `headcount` → ingresos y salidas por departamento
 *
 * @returns Objeto {@link HRData} con el perfil del usuario y todos los
 *   datos del dashboard de RRHH.
 *
 * @example
 * ```tsx
 * export default async function HRPage() {
 *   const data = await getHRData();
 *   return <HRDashboard data={data} />;
 * }
 * ```
 */
export async function getHRData() {
  const shared = await getSharedData();

  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();

  const [usersRes, birthdaysRes] = await Promise.all([
    callGraph<GraphPage<GraphHRUser>>(
      "/users?$select=id,displayName,jobTitle,department,mail&$top=100&$filter=accountEnabled eq true",
      token,
    ).catch((): GraphPage<GraphHRUser> => ({ value: [] })),

    callGraph<GraphPage<GraphHRUser>>(
      "/users?$select=id,displayName,department,hireDate&$top=50",
      token,
    ).catch((): GraphPage<GraphHRUser> => ({ value: [] })),
  ]);

  const employees = usersRes.value.map((u) => ({
    id:         u.id,
    name:       u.displayName,
    department: u.department ?? "Sin área",
    title:      u.jobTitle   ?? "Sin cargo",
    status:     "Activo",
  }));

  const anniversaries = birthdaysRes.value
    .filter((u) => u.hireDate)
    .map((u) => {
      const hire  = new Date(u.hireDate!);
      const today = new Date();
      const years = today.getFullYear() - hire.getFullYear();
      return {
        id:         u.id,
        name:       u.displayName,
        years,
        date:       u.hireDate!.split("T")[0] ?? "",
        department: u.department ?? "",
      };
    })
    .filter((a) => a.years > 0);

  return {
    ...shared,
    kpis: {
      ...MOCK_DATA.kpis,
      totalEmpleados: employees.length.toString(),
    },
    employees:    employees.length    > 0 ? employees    : MOCK_DATA.employees,
    anniversaries: anniversaries.length > 0 ? anniversaries : MOCK_DATA.anniversaries,
    requests:    MOCK_DATA.requests,
    recruitment: MOCK_DATA.recruitment,
    training:    MOCK_DATA.training,
    headcount:   MOCK_DATA.headcount,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getHRData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getHRData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface HRDashboardProps {
 *   data: HRData;
 * }
 * ```
 */
export type HRData = Awaited<ReturnType<typeof getHRData>>;