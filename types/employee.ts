/**
 * @module types/employee
 * Tipos para el directorio de colaboradores de la intranet EDM.
 *
 * @remarks
 * Define la estructura del colaborador tal como se consume en los
 * componentes de UI, normalizada a partir del perfil de Microsoft Graph
* por `mapUser` en `employees.service.ts`.
 *
 * La distinción entre `department` y `departmentId` es importante:
 * `department` es el valor raw de Entra ID (puede tener cualquier formato
 * o capitalización), mientras que `departmentId` es el identificador
 * normalizado que corresponde a `DEPARTMENTS` en `lib/config.ts` * y se usa para filtros y navegación.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Estado de presencia o disponibilidad de un colaborador.
 *
 * | Valor      | Descripción                                      |
 * |------------|--------------------------------------------------|
 * | `active`   | Colaborador activo en oficina o trabajo normal   |
 * | `leave`    | En licencia o permiso (vacaciones, incapacidad)  |
 * | `remote`   | Trabajando en modalidad remota                   |
 * | `inactive` | Cuenta deshabilitada en Entra ID                 |
 *
 * @remarks
 * En producción, solo `"active"` e `"inactive"` se infieren
 * automáticamente desde el campo `accountEnabled` de Graph mediante
 * `inferStatus` en `employees.service.ts`. Los estados `"leave"` y
 * `"remote"` requieren integración con la API de presencia de Graph
 * (`/users/{id}/presence`) o con el sistema HRIS — actualmente solo
 * están disponibles en los datos mock.
 */
export type EmployeeStatus = "active" | "leave" | "remote" | "inactive";

/**
 * Colaborador del directorio corporativo de EDM.
 *
 * @remarks
 * Representa el perfil normalizado de un usuario de Entra ID, listo
 * para renderizar en los componentes de directorio sin transformaciones
 * adicionales. Se construye en `mapUser` de `employees.service.ts` a
 * partir de la respuesta cruda de `/v1.0/users` en Graph.
 *
 * El campo `photo` es un data URL en base64 (`"data:image/jpeg;base64,..."`)
 * obtenido desde `getEmployeePhoto`. Cuando es `undefined`, el componente
 * de avatar debe mostrar las iniciales del colaborador como fallback.
 */
export type Employee = {
  /** Object ID del usuario en Azure AD. */
  id: string;

  /** Nombre display del colaborador tal como aparece en Entra ID. */
  displayName: string;

  /** Cargo del colaborador (ej. `"Desarrolladora Frontend"`). */
  jobTitle: string;

  /**
   * Nombre del departamento tal como viene de Entra ID.
   * Puede tener cualquier formato o capitalización según como esté
   * configurado en Azure AD (ej. `"Recursos Humanos"`, `"TI"`).
   */
  department: string;

  /**
   * Identificador normalizado del departamento, mapeado desde
   * `department` mediante `GRAPH_DEPT_TO_ID` en `config/employeeFilters.ts`.
* Corresponde al campo `id` de `DEPARTMENTS` en `lib/config.ts`   * (ej. `"rrhh"`, `"ti"`, `"finanzas"`).
   * Valor `"other"` si el departamento no está en el mapa.
   */
  departmentId: string;

  /**
   * Correo corporativo del colaborador.
   * Fallback a `userPrincipalName` para usuarios sin buzón de Exchange.
   */
  mail: string;

  /**
   * Teléfono móvil corporativo del colaborador.
   * `null` si no está configurado en Entra ID.
   */
  mobilePhone: string | null;

  /**
   * Ubicación de oficina del colaborador (ej. `"Bogotá"`, `"Medellín"`).
   * `null` si no está configurada en Entra ID.
   */
  officeLocation: string | null;

  /**
   * Foto de perfil del colaborador como data URL base64
   * (`"data:image/jpeg;base64,..."`).
   * `undefined` si el colaborador no tiene foto en Entra ID o si
   * falló la obtención — el componente de avatar muestra iniciales
   * como fallback.
   */
  photo?: string;

  /** Estado de presencia o disponibilidad del colaborador. */
  status: EmployeeStatus;

  /**
   * User Principal Name del colaborador en Azure AD
   * (ej. `"n.ospina@empresa.com"`).
   * Se usa como identificador alternativo cuando `mail` no está disponible.
   */
  userPrincipalName: string;
};

/**
 * Estado de los filtros activos en el directorio de colaboradores.
 *
 * @remarks
 * Los campos con valor vacío (`""`) indican que no hay filtro activo
 * para esa dimensión — el directorio muestra todos los colaboradores
 * sin restricción en ese campo.
 *
 * Se usa como estado del hook de filtros del directorio y como
 * parámetro de las funciones de filtrado en los componentes de UI.
 */
export type EmployeeFilters = {
  /** Texto de búsqueda libre sobre `displayName`, `jobTitle` y `mail`. */
  query: string;

  /**
   * ID del departamento a filtrar, corresponde a {@link Employee.departmentId}.
   * `""` muestra colaboradores de todos los departamentos.
   */
  departmentId: string;

  /**
   * Estado de presencia a filtrar.
   * `""` muestra colaboradores con cualquier estado.
   */
  status: EmployeeStatus | "";
};