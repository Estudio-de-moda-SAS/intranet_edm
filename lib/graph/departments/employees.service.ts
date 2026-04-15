/**
 * @module graph/departments/employees.service
 * Service de directorio de empleados para la intranet EDM.
 *
 * @remarks
 * Provee acceso al directorio completo de colaboradores de la organización
 * a través de Microsoft Graph, con soporte para paginación automática,
 * fotos de perfil en base64 y búsqueda por ID.
 *
 * Sigue el mismo patrón de {@link callGraph}/{@link callGraphBlob} y
 * {@link getToken} que el resto de los services de departamento, sin
 * dependencias externas adicionales.
 *
 * **Scopes de Graph requeridos:**
 * | Scope                | Dato obtenido                        |
 * |----------------------|--------------------------------------|
 * | `User.Read.All`      | Lista completa de usuarios del tenant|
 * | `User.ReadBasic.All` | Perfil básico de cada usuario        |
 * | `ProfilePhoto.Read`  | Foto de perfil de cada usuario       |
 *
 * @example
 * ```ts
 * // Obtener todos los empleados activos
 * const employees = await getAllEmployees();
 *
 * // Obtener un empleado con su foto
 * const employee = await getEmployeeById("abc-123");
 * ```
 */

import { callGraph, callGraphBlob } from "@/lib/graph/graphClient";
import { getToken }                 from "@/lib/graph/shared.service";
import type { Employee }            from "@/types/employee";
import { GRAPH_DEPT_TO_ID }         from "@/config/employeeFilters";

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock del directorio de empleados para desarrollo local sin Azure.
 *
 * @remarks
 * Cubre los departamentos principales de EDM con perfiles representativos.
 * Los estados incluyen `"active"`, `"leave"` y `"remote"` para permitir
 * probar los distintos estados visuales del directorio sin necesidad de
 * conectarse a Entra ID.
 *
 * Se usa como retorno directo de {@link getAllEmployees} y
 * {@link getEmployeeById} cuando `NEXT_PUBLIC_AUTH_BYPASS === "true"`.
 */
export const MOCK_EMPLOYEES: Employee[] = [
  { id: "1",  displayName: "Camila Restrepo",  jobTitle: "Directora de RR.HH.",     department: "Recursos Humanos", departmentId: "rrhh",      mail: "c.restrepo@empresa.com", mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "c.restrepo@empresa.com" },
  { id: "2",  displayName: "Andrés Moreno",    jobTitle: "Business Partner RRHH",   department: "Recursos Humanos", departmentId: "rrhh",      mail: "a.moreno@empresa.com",   mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "a.moreno@empresa.com"   },
  { id: "3",  displayName: "Valeria Gómez",    jobTitle: "Analista de Nómina",      department: "Recursos Humanos", departmentId: "rrhh",      mail: "v.gomez@empresa.com",    mobilePhone: null, officeLocation: "Bogotá",   status: "leave",  userPrincipalName: "v.gomez@empresa.com"    },
  { id: "4",  displayName: "Santiago Díaz",    jobTitle: "Analista de Selección",   department: "Recursos Humanos", departmentId: "rrhh",      mail: "s.diaz@empresa.com",     mobilePhone: null, officeLocation: "Medellín", status: "remote", userPrincipalName: "s.diaz@empresa.com"     },
  { id: "5",  displayName: "Felipe Ruiz",      jobTitle: "Jefe de TI",              department: "TI",               departmentId: "ti",        mail: "f.ruiz@empresa.com",     mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "f.ruiz@empresa.com"     },
  { id: "6",  displayName: "Natalia Ospina",   jobTitle: "Desarrolladora Frontend", department: "TI",               departmentId: "ti",        mail: "n.ospina@empresa.com",   mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "n.ospina@empresa.com"   },
  { id: "7",  displayName: "Diego Vargas",     jobTitle: "Director Financiero",     department: "Finanzas",         departmentId: "finanzas",  mail: "d.vargas@empresa.com",   mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "d.vargas@empresa.com"   },
  { id: "8",  displayName: "Isabella Mendoza", jobTitle: "Directora de Marketing",  department: "Retail",           departmentId: "retail",    mail: "i.mendoza@empresa.com",  mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "i.mendoza@empresa.com"  },
  { id: "9",  displayName: "Ricardo León",     jobTitle: "Gerente de Operaciones",  department: "Logística",        departmentId: "logistica", mail: "r.leon@empresa.com",     mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "r.leon@empresa.com"     },
  { id: "10", displayName: "Ana Jiménez",      jobTitle: "Analista Jurídica",       department: "Jurídica",         departmentId: "juridica",  mail: "a.jimenez@empresa.com",  mobilePhone: null, officeLocation: "Bogotá",   status: "active", userPrincipalName: "a.jimenez@empresa.com"  },
];

// ── Tipos de Graph ────────────────────────────────────────────────────────────

/**
 * Subconjunto del perfil de usuario devuelto por `/v1.0/users` en Graph,
 * limitado a los campos seleccionados en {@link SELECT_FIELDS}.
 */
export type GraphUser = {
  /** Object ID del usuario en Azure AD. */
  id: string;

  /** Nombre display del usuario en Entra ID. */
  displayName: string;

  /** Cargo del usuario. `null` si no está configurado en Entra ID. */
  jobTitle: string | null;

  /** Departamento del usuario. `null` si no está configurado en Entra ID. */
  department: string | null;

  /** Correo corporativo. `null` si el usuario no tiene buzón asignado. */
  mail: string | null;

  /** Teléfono móvil corporativo. `null` si no está configurado. */
  mobilePhone: string | null;

  /** Ubicación de oficina. `null` si no está configurada. */
  officeLocation: string | null;

  /** UPN del usuario, usado como identificador alternativo al correo. */
  userPrincipalName: string;

  /** `true` si la cuenta está habilitada en Entra ID. */
  accountEnabled: boolean;
};

/**
 * Página de resultados de la consulta `/v1.0/users` en Graph.
 *
 * @remarks
 * `@odata.nextLink` contiene la URL completa de la siguiente página
 * cuando hay más resultados. {@link getAllEmployees} extrae el path
 * relativo para pasarlo a {@link callGraph}.
 */
export type GraphUsersPage = {
  /** Array de usuarios de la página actual. */
  value: GraphUser[];

  /**
   * URL completa de la siguiente página de resultados.
   * `undefined` si esta es la última página.
   */
  "@odata.nextLink"?: string;
};

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Campos del perfil de usuario seleccionados en todas las consultas
 * a `/v1.0/users` de este módulo.
 *
 * @remarks
 * Definido como constante para garantizar consistencia entre
 * {@link getAllEmployees} y {@link getEmployeeById}, y facilitar
 * agregar o quitar campos en un único lugar.
 */
export const SELECT_FIELDS =
  "id,displayName,jobTitle,department,mail,mobilePhone,officeLocation,userPrincipalName,accountEnabled";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Infiere el estado de presencia de un colaborador a partir de su perfil
 * de Entra ID.
 *
 * @remarks
 * Actualmente solo distingue entre `"inactive"` (cuenta deshabilitada) y
 * `"active"` (cuenta habilitada). Los estados `"remote"` y `"leave"` no
 * pueden inferirse desde Graph sin acceso a datos de presencia o nómina —
 * están disponibles únicamente en los datos mock.
 *
 * Cuando se integre con la API de presencia de Graph
 * (`/users/{id}/presence`), esta función debe extenderse para retornar
 * `"remote"` según el `availabilityStatus`.
 *
 * @param user - Perfil del usuario de Graph.
 * @returns Estado de presencia inferido del colaborador.
 */
export function inferStatus(user: GraphUser): Employee["status"] {
  if (!user.accountEnabled) return "inactive";
  return "active";
}

/**
 * Transforma un usuario crudo de Graph al tipo {@link Employee} de la
 * intranet, normalizando campos nulos y resolviendo el `departmentId`.
 *
 * @remarks
 * El `departmentId` se resuelve mediante {@link GRAPH_DEPT_TO_ID}, que
 * mapea el nombre de departamento de Entra ID al identificador interno
 * usado en los filtros del directorio. Si el departamento no está en el
 * mapa, se asigna `"other"`.
 *
 * El campo `mail` tiene como fallback `userPrincipalName` para usuarios
 * sin buzón de Exchange asignado (ej. cuentas de servicio).
 *
 * @param user - Perfil del usuario de Graph.
 * @returns Objeto {@link Employee} normalizado listo para la UI.
 */
export function mapUser(user: GraphUser): Employee {
  const dept = user.department ?? "";
  return {
    id:                user.id,
    displayName:       user.displayName       ?? "—",
    jobTitle:          user.jobTitle          ?? "—",
    department:        dept,
    departmentId:      GRAPH_DEPT_TO_ID[dept] ?? "other",
    mail:              user.mail ?? user.userPrincipalName,
    mobilePhone:       user.mobilePhone,
    officeLocation:    user.officeLocation,
    status:            inferStatus(user),
    userPrincipalName: user.userPrincipalName,
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Retorna el directorio completo de colaboradores activos de la
 * organización desde Microsoft Graph.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_EMPLOYEES} directamente sin
 * consultar Graph.
 *
 * En producción, pagina automáticamente usando `@odata.nextLink` hasta
 * obtener todos los usuarios del tenant — necesario en organizaciones con
 * más de 999 usuarios (límite de `$top` en Graph). El `nextLink` de Graph
 * incluye la URL base completa; se extrae solo el path relativo para
 * pasarlo a {@link callGraph}.
 *
 * Solo se incluyen usuarios con `accountEnabled eq true`, excluyendo
 * cuentas deshabilitadas y de servicio.
 *
 * @returns Array de {@link Employee} con todos los colaboradores activos
 *   del tenant, sin límite de paginación.
 * @throws `Error` si Graph responde con error y no hay bypass activo.
 *
 * @example
 * ```ts
 * const employees = await getAllEmployees();
 * const byDept = employees.filter(e => e.departmentId === "ti");
 * ```
 */
export async function getAllEmployees(): Promise<Employee[]> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return MOCK_EMPLOYEES;
  }

  const token     = await getToken();
  const employees: Employee[] = [];
  let   endpoint: string | null =
    `/users?$select=${SELECT_FIELDS}&$filter=accountEnabled eq true&$top=999`;

  while (endpoint) {
    const page: GraphUsersPage = await callGraph(endpoint, token);
    for (const user of page.value) {
      employees.push(mapUser(user));
    }
    endpoint = page["@odata.nextLink"]
      ? page["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "")
      : null;
  }

  return employees;
}

/**
 * Obtiene la foto de perfil de un colaborador desde Graph y la retorna
 * como data URL en formato base64.
 *
 * @remarks
 * En modo bypass retorna `undefined` — el componente de avatar mostrará
 * las iniciales del colaborador como fallback.
 *
 * Cualquier error (usuario sin foto, permiso insuficiente, fallo de red)
 * se captura silenciosamente y resulta en `undefined`, evitando que un
 * fallo de foto interrumpa el renderizado del directorio.
 *
 * @param userId - Object ID del colaborador en Azure AD.
 * @returns Data URL `"data:image/jpeg;base64,..."` con la foto del
 *   colaborador, o `undefined` si no tiene foto o si ocurre cualquier error.
 *
 * @example
 * ```ts
 * const photo = await getEmployeePhoto("abc-123");
 * // photo → "data:image/jpeg;base64,/9j/4AAQ..." si tiene foto
 * // photo → undefined si no tiene foto
 * ```
 */
export async function getEmployeePhoto(userId: string): Promise<string | undefined> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return undefined;

  try {
    const token = await getToken();
    const blob  = await callGraphBlob(`/users/${userId}/photo/$value`, token);
    if (!blob) return undefined;
    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/**
 * Obtiene el perfil completo de un colaborador por su Object ID, incluyendo
 * su foto de perfil si está disponible.
 *
 * @remarks
 * En modo bypass busca en {@link MOCK_EMPLOYEES} por `id` y retorna `null`
 * si no se encuentra.
 *
 * En producción consulta `/users/{id}` en Graph y luego obtiene la foto
 * mediante {@link getEmployeePhoto}. Si la foto está disponible, la asigna
 * al campo `photo` del empleado. Cualquier error en la consulta principal
 * retorna `null` en lugar de propagar la excepción.
 *
 * @param id - Object ID del colaborador en Azure AD.
 * @returns Objeto {@link Employee} con el perfil completo y foto incluida
 *   si está disponible, o `null` si el colaborador no existe o si Graph
 *   devuelve un error.
 *
 * @example
 * ```ts
 * const employee = await getEmployeeById("abc-123");
 * if (!employee) return notFound();
 *
 * return <EmployeeProfile employee={employee} />;
 * ```
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return MOCK_EMPLOYEES.find((e) => e.id === id) ?? null;
  }

  try {
    const token:    string    = await getToken();
    const user:     GraphUser = await callGraph(
      `/users/${id}?$select=${SELECT_FIELDS}`,
      token,
    );
    const employee = mapUser(user);
    const photo    = await getEmployeePhoto(id);
    if (photo !== undefined) {
      employee.photo = photo;
    }
    return employee;
  } catch {
    return null;
  }
}