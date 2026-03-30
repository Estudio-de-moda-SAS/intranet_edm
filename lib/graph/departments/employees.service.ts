// lib/graph/departments/employees.service.ts
//
// Servicio de empleados — usa el mismo patrón de callGraph/callGraphBlob
// y getToken que el resto del proyecto. Sin dependencias externas adicionales.

import { callGraph, callGraphBlob } from "@/lib/graph/graphClient";
import { getToken }                 from "@/lib/graph/shared.service";
import type { Employee }            from "@/types/employee";
import { GRAPH_DEPT_TO_ID }         from "@/config/employeeFilters";

// ── Mock data (NEXT_PUBLIC_AUTH_BYPASS=true) ──────────────────────────────────

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", displayName: "Camila Restrepo",   jobTitle: "Directora de RR.HH.",       department: "Recursos Humanos", departmentId: "rrhh",      mail: "c.restrepo@empresa.com",  mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "c.restrepo@empresa.com"  },
  { id: "2", displayName: "Andrés Moreno",     jobTitle: "Business Partner RRHH",     department: "Recursos Humanos", departmentId: "rrhh",      mail: "a.moreno@empresa.com",    mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "a.moreno@empresa.com"    },
  { id: "3", displayName: "Valeria Gómez",     jobTitle: "Analista de Nómina",        department: "Recursos Humanos", departmentId: "rrhh",      mail: "v.gomez@empresa.com",     mobilePhone: null, officeLocation: "Bogotá",   status: "leave",    userPrincipalName: "v.gomez@empresa.com"     },
  { id: "4", displayName: "Santiago Díaz",     jobTitle: "Analista de Selección",     department: "Recursos Humanos", departmentId: "rrhh",      mail: "s.diaz@empresa.com",      mobilePhone: null, officeLocation: "Medellín", status: "remote",   userPrincipalName: "s.diaz@empresa.com"      },
  { id: "5", displayName: "Felipe Ruiz",       jobTitle: "Jefe de TI",                department: "TI",               departmentId: "ti",        mail: "f.ruiz@empresa.com",      mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "f.ruiz@empresa.com"      },
  { id: "6", displayName: "Natalia Ospina",    jobTitle: "Desarrolladora Frontend",   department: "TI",               departmentId: "ti",        mail: "n.ospina@empresa.com",    mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "n.ospina@empresa.com"    },
  { id: "7", displayName: "Diego Vargas",      jobTitle: "Director Financiero",       department: "Finanzas",         departmentId: "finanzas",  mail: "d.vargas@empresa.com",    mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "d.vargas@empresa.com"    },
  { id: "8", displayName: "Isabella Mendoza",  jobTitle: "Directora de Marketing",    department: "Retail",           departmentId: "retail",    mail: "i.mendoza@empresa.com",   mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "i.mendoza@empresa.com"   },
  { id: "9", displayName: "Ricardo León",      jobTitle: "Gerente de Operaciones",    department: "Logística",        departmentId: "logistica", mail: "r.leon@empresa.com",      mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "r.leon@empresa.com"      },
  { id:"10", displayName: "Ana Jiménez",       jobTitle: "Analista Jurídica",         department: "Jurídica",         departmentId: "juridica",  mail: "a.jimenez@empresa.com",   mobilePhone: null, officeLocation: "Bogotá",   status: "active",   userPrincipalName: "a.jimenez@empresa.com"   },
];

// ── Graph response shape ───────────────────────────────────────────────────────

type GraphUser = {
  id:                string;
  displayName:       string;
  jobTitle:          string | null;
  department:        string | null;
  mail:              string | null;
  mobilePhone:       string | null;
  officeLocation:    string | null;
  userPrincipalName: string;
  accountEnabled:    boolean;
};

type GraphUsersPage = {
  value:             GraphUser[];
  "@odata.nextLink"?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SELECT_FIELDS =
  "id,displayName,jobTitle,department,mail,mobilePhone,officeLocation,userPrincipalName,accountEnabled";

function inferStatus(user: GraphUser): Employee["status"] {
  if (!user.accountEnabled) return "inactive";
  return "active";
}

function mapUser(user: GraphUser): Employee {
  const dept = user.department ?? "";
  return {
    id:                user.id,
    displayName:       user.displayName          ?? "—",
    jobTitle:          user.jobTitle             ?? "—",
    department:        dept,
    departmentId:      GRAPH_DEPT_TO_ID[dept]    ?? "other",
    mail:              user.mail ?? user.userPrincipalName,
    mobilePhone:       user.mobilePhone,
    officeLocation:    user.officeLocation,
    status:            inferStatus(user),
    userPrincipalName: user.userPrincipalName,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Retorna todos los empleados activos.
 * En modo bypass devuelve datos mock para desarrollo local sin Azure.
 * En producción pagina Graph automáticamente hasta obtener todos los usuarios.
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
    // Graph devuelve la URL completa en nextLink; extraemos solo el path+query
    endpoint = page["@odata.nextLink"]
      ? page["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "")
      : null;
  }

  return employees;
}

/**
 * Retorna la foto de un usuario como Data URL (base64).
 * Retorna undefined si no hay foto o el request falla.
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
 * Retorna un empleado por id con su foto incluida.
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return MOCK_EMPLOYEES.find((e) => e.id === id) ?? null;
  }

  try {
    const token = await getToken();
    const user: GraphUser = await callGraph(
      `/users/${id}?$select=${SELECT_FIELDS}`,
      token
    );
    const employee  = mapUser(user);
const photo = await getEmployeePhoto(id)
if (photo !== undefined) {
  employee.photo = photo
}
return employee
  } catch {
    return null;
  }
}