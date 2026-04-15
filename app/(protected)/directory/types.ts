/**
 * @module types
 * Tipos y utilidades base para el directorio de empleados.
 *
 * @remarks
 * Este archivo centraliza los contratos de datos del módulo de directorio,
 * incluyendo:
 *
 * - tipos internos de la aplicación
 * - tipos de compatibilidad con Microsoft Graph API
 * - utilidades de transformación de datos externos a estructuras internas
 * - contratos auxiliares de filtros y estado de UI
 *
 * Su objetivo es servir como capa de tipado y adaptación entre:
 *
 * - la representación interna de empleados en la app
 * - la estructura de datos proporcionada por Microsoft Graph API `/v1.0/users`
 *
 * Esto facilita una futura integración real con Graph manteniendo
 * una separación clara entre datos externos e internos.
 */

/* -------------------------------------------------------------------------- */
/* Tipos internos del dominio                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Departamentos válidos dentro del directorio de empleados.
 *
 * @remarks
 * Representa el conjunto de áreas soportadas por la aplicación
 * para clasificación, filtrado y visualización de empleados.
 */
export type Department =
  | "TI"
  | "Recursos Humanos"
  | "Finanzas"
  | "Jurídica"
  | "Comercial"
  | "eCommerce"
  | "Logística"
  | "Tiendas"
  | "Dirección General";

/**
 * Estados internos disponibles para un empleado.
 *
 * @remarks
 * Este valor se usa principalmente en la capa de UI para representar
 * disponibilidad o condición laboral de forma simplificada.
 */
export type EmployeeStatus = "active" | "vacation" | "remote" | "away";

/**
 * Estructura interna de un empleado dentro de la aplicación.
 *
 * @remarks
 * Este modelo está diseñado para mapearse de forma cercana con
 * la respuesta de Microsoft Graph API, facilitando una migración
 * futura hacia datos reales provenientes de `/v1.0/users`.
 *
 * Mapeo principal con Graph:
 *
 * - `id` → `user.id`
 * - `displayName` → `user.displayName`
 * - `jobTitle` → `user.jobTitle`
 * - `department` → `user.department`
 * - `mail` → `user.mail`
 * - `mobilePhone` → `user.mobilePhone`
 * - `businessPhone` → `user.businessPhones[0]`
 * - `officeLocation` → `user.officeLocation`
 * - `city` → `user.city`
 * - `photo` → `/v1.0/users/{id}/photo/$value`
 * - `managerName` → `/v1.0/users/{id}/manager`
 * - `extension` → `user.onPremisesExtensionAttributes.extensionAttribute1`
 *
 * Algunos campos, como `status`, son internos o derivados y no
 * necesariamente existen de forma directa en Graph.
 */
export interface Employee {
  /**
   * Identificador único del empleado.
   */
  id: string;

  /**
   * Nombre completo mostrado en la interfaz.
   */
  displayName: string;

  /**
   * Nombre del empleado.
   */
  firstName: string;

  /**
   * Apellido del empleado.
   */
  lastName: string;

  /**
   * Cargo o título laboral.
   */
  jobTitle: string;

  /**
   * Departamento o área a la que pertenece.
   */
  department: Department;

  /**
   * Correo electrónico principal.
   */
  mail: string;

  /**
   * Teléfono móvil del empleado.
   */
  mobilePhone: string | null;

  /**
   * Teléfono corporativo principal.
   *
   * @remarks
   * En Graph normalmente corresponde al primer valor de `businessPhones[0]`.
   */
  businessPhone: string | null;

  /**
   * Extensión telefónica interna.
   *
   * @remarks
   * Normalmente se obtiene desde:
   * `onPremisesExtensionAttributes.extensionAttribute1`.
   */
  extension: string | null;

  /**
   * Ubicación física de oficina.
   */
  officeLocation: string | null;

  /**
   * Ciudad asociada al empleado.
   */
  city: string | null;

  /**
   * URL de foto del empleado o placeholder.
   *
   * @remarks
   * Aunque Graph entrega la foto como blob, en la app se almacena
   * como URL resuelta para facilitar su renderizado.
   */
  photo: string | null;

  /**
   * Estado interno del empleado.
   *
   * @remarks
   * Este campo no existe directamente en Graph y puede derivarse
   * desde presencia u otras fuentes de negocio.
   */
  status: EmployeeStatus;

  /**
   * Fecha de ingreso del empleado en formato ISO.
   */
  hireDate: string | null;

  /**
   * Nombre visible del jefe o manager inmediato.
   */
  managerName: string | null;
}

/* -------------------------------------------------------------------------- */
/* Tipos de compatibilidad con Microsoft Graph API                             */
/* -------------------------------------------------------------------------- */

/**
 * Estructura relevante de un usuario proveniente de Microsoft Graph API.
 *
 * @remarks
 * Este tipo modela la respuesta parcial esperada de `/v1.0/users`
 * con los campos necesarios para construir un {@link Employee}.
 */
export interface GraphUser {
  /**
   * Identificador único del usuario en Graph.
   */
  id: string;

  /**
   * Nombre completo mostrado por Graph.
   */
  displayName: string;

  /**
   * Nombre del usuario.
   */
  givenName: string;

  /**
   * Apellido del usuario.
   */
  surname: string;

  /**
   * Cargo laboral.
   */
  jobTitle: string | null;

  /**
   * Departamento reportado en Graph.
   */
  department: string | null;

  /**
   * Correo principal.
   */
  mail: string | null;

  /**
   * Teléfono móvil.
   */
  mobilePhone: string | null;

  /**
   * Lista de teléfonos corporativos.
   */
  businessPhones: string[];

  /**
   * Ubicación de oficina.
   */
  officeLocation: string | null;

  /**
   * Ciudad.
   */
  city: string | null;

  /**
   * Atributos extendidos on-premises.
   *
   * @remarks
   * Se usa, por ejemplo, para recuperar la extensión telefónica.
   */
  onPremisesExtensionAttributes: {
    /**
     * Extensión telefónica del usuario.
     */
    extensionAttribute1: string | null;

    /**
     * Resto de atributos extendidos disponibles en Graph.
     */
    [key: string]: string | null;
  } | null;
}

/**
 * Estructura relevante de presencia proveniente de Microsoft Graph API.
 *
 * @remarks
 * Este tipo permite derivar un estado interno de UI
 * a partir de la disponibilidad reportada por Graph.
 */
export interface GraphPresence {
  /**
   * Identificador del usuario asociado a la presencia.
   */
  id: string;

  /**
   * Estado de disponibilidad en Graph.
   */
  availability:
    | "Available"
    | "Busy"
    | "Away"
    | "BeRightBack"
    | "DoNotDisturb"
    | "Offline";

  /**
   * Actividad específica reportada por Graph.
   */
  activity: string;
}

/* -------------------------------------------------------------------------- */
/* Adaptadores                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Convierte un usuario de Microsoft Graph al modelo interno {@link Employee}.
 *
 * @param graphUser Usuario obtenido desde Graph API.
 * @param photoUrl URL de foto ya resuelta para el usuario.
 * @param managerName Nombre del manager inmediato.
 * @param presence Presencia del usuario obtenida desde Graph.
 *
 * @returns Objeto {@link Employee} adaptado al modelo interno de la app.
 *
 * @remarks
 * Esta función actúa como adaptador entre la estructura externa de Graph
 * y el contrato interno utilizado por la aplicación.
 *
 * Responsabilidades principales:
 *
 * - normalizar valores nulos
 * - mapear nombres de campos
 * - resolver teléfono corporativo principal
 * - derivar estado interno a partir de presencia
 * - establecer valores por defecto cuando sea necesario
 *
 * @example
 * ```ts
 * const employee = fromGraphUser(graphUser, photoUrl, managerName, presence);
 * ```
 */
export function fromGraphUser(
  graphUser: GraphUser,
  photoUrl: string | null = null,
  managerName: string | null = null,
  presence?: GraphPresence
): Employee {
  /**
   * Mapa de conversión entre disponibilidad de Graph y estado interno de UI.
   */
  const statusMap: Record<GraphPresence["availability"], EmployeeStatus> = {
    Available: "active",
    Busy: "away",
    Away: "vacation",
    BeRightBack: "remote",
    DoNotDisturb: "away",
    Offline: "away",
  };

  return {
    id: graphUser.id,
    displayName: graphUser.displayName,
    firstName: graphUser.givenName,
    lastName: graphUser.surname,
    jobTitle: graphUser.jobTitle ?? "",
    department: (graphUser.department as Department) ?? "TI",
    mail: graphUser.mail ?? "",
    mobilePhone: graphUser.mobilePhone,
    businessPhone: graphUser.businessPhones?.[0] ?? null,
    extension:
      graphUser.onPremisesExtensionAttributes?.extensionAttribute1 ?? null,
    officeLocation: graphUser.officeLocation,
    city: graphUser.city,
    photo: photoUrl,
    status: presence ? statusMap[presence.availability] : "active",
    hireDate: null,
    managerName,
  };
}

/* -------------------------------------------------------------------------- */
/* Filtros y estado de interfaz                                                */
/* -------------------------------------------------------------------------- */

/**
 * Filtros disponibles para el directorio de empleados.
 *
 * @property search Texto de búsqueda libre.
 * @property department Departamento seleccionado.
 * @property status Estado seleccionado.
 *
 * @remarks
 * Este contrato se utiliza para modelar la capa de filtrado
 * aplicada sobre el directorio en la interfaz.
 */
export interface DirectoryFilters {
  search: string;
  department: Department | "Todos";
  status: EmployeeStatus | "Todos";
}

/**
 * Estado de interfaz del directorio de empleados.
 *
 * @property filters Filtros actualmente aplicados.
 * @property viewMode Modo de visualización del directorio.
 * @property selectedEmployee Empleado actualmente seleccionado.
 *
 * @remarks
 * Este tipo agrupa el estado principal de interacción del módulo,
 * facilitando su manejo centralizado en componentes o hooks.
 */
export interface DirectoryState {
  filters: DirectoryFilters;
  viewMode: "grid" | "list";
  selectedEmployee: Employee | null;
}