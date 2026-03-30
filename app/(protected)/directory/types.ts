// ─────────────────────────────────────────────────────────────────────────────
// types.ts — Directorio de Empleados
// Mapeado para compatibilidad con Microsoft Graph API /v1.0/users
// ─────────────────────────────────────────────────────────────────────────────

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

export type EmployeeStatus = "active" | "vacation" | "remote" | "away";

/**
 * Employee — estructura interna de la app.
 * Los campos están mapeados 1:1 con la respuesta de Microsoft Graph API
 * para facilitar la migración cuando se conecte a /v1.0/users.
 *
 * Graph field mapping:
 *   id              → user.id
 *   displayName     → user.displayName
 *   jobTitle        → user.jobTitle
 *   department      → user.department
 *   mail            → user.mail
 *   mobilePhone     → user.mobilePhone
 *   businessPhones  → user.businessPhones[0]
 *   officeLocation  → user.officeLocation
 *   city            → user.city
 *   photo           → /v1.0/users/{id}/photo/$value  (blob → objectURL)
 *   manager         → /v1.0/users/{id}/manager
 *   onPremisesExtensionAttributes → user.onPremisesExtensionAttributes
 */
export interface Employee {
  // Identity
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;

  // Role
  jobTitle: string;
  department: Department;

  // Contact
  mail: string;
  mobilePhone: string | null;
  businessPhone: string | null;     // Graph: businessPhones[0]
  extension: string | null;         // Graph: onPremisesExtensionAttributes.extensionAttribute1

  // Location
  officeLocation: string | null;
  city: string | null;

  // Photo — en Graph es un blob; aquí almacenamos URL directa o placeholder
  photo: string | null;

  // Status — campo custom (no existe en Graph, puede venir de presencia /v1.0/users/{id}/presence)
  status: EmployeeStatus;

  // Metadata
  hireDate: string | null;          // ISO date string
  managerName: string | null;       // Graph: manager.displayName (expand)
}

// ─────────────────────────────────────────────────────────────────────────────
// Microsoft Graph API response shape (para cuando migres)
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string | null;
  department: string | null;
  mail: string | null;
  mobilePhone: string | null;
  businessPhones: string[];
  officeLocation: string | null;
  city: string | null;
  onPremisesExtensionAttributes: {
    extensionAttribute1: string | null; // extensión telefónica
    [key: string]: string | null;
  } | null;
}

export interface GraphPresence {
  id: string;
  availability: "Available" | "Busy" | "Away" | "BeRightBack" | "DoNotDisturb" | "Offline";
  activity: string;
}

/**
 * Convierte una respuesta de Graph API al tipo interno Employee.
 * Úsala cuando conectes /v1.0/users con $select y $expand=manager
 */
export function fromGraphUser(graphUser: GraphUser, photoUrl: string | null = null, managerName: string | null = null, presence?: GraphPresence): Employee {
  const statusMap: Record<GraphPresence["availability"], EmployeeStatus> = {
    Available:    "active",
    Busy:         "away",
    Away:         "vacation",
    BeRightBack:  "remote",
    DoNotDisturb: "away",
    Offline:      "away",
  };

  return {
    id:            graphUser.id,
    displayName:   graphUser.displayName,
    firstName:     graphUser.givenName,
    lastName:      graphUser.surname,
    jobTitle:      graphUser.jobTitle ?? "",
    department:    (graphUser.department as Department) ?? "TI",
    mail:          graphUser.mail ?? "",
    mobilePhone:   graphUser.mobilePhone,
    businessPhone: graphUser.businessPhones?.[0] ?? null,
    extension:     graphUser.onPremisesExtensionAttributes?.extensionAttribute1 ?? null,
    officeLocation: graphUser.officeLocation,
    city:          graphUser.city,
    photo:         photoUrl,
    status:        presence ? statusMap[presence.availability] : "active",
    hireDate:      null,
    managerName:   managerName,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Filters & pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface DirectoryFilters {
  search: string;
  department: Department | "Todos";
  status: EmployeeStatus | "Todos";
}

export interface DirectoryState {
  filters: DirectoryFilters;
  viewMode: "grid" | "list";
  selectedEmployee: Employee | null;
}