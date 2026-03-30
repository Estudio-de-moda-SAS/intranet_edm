// types/employee.ts

export type EmployeeStatus = "active" | "leave" | "remote" | "inactive";

export type Employee = {
  id: string;
  displayName: string;
  jobTitle: string;
  department: string;          // Valor raw que viene de Graph (ej: "Recursos Humanos")
  departmentId: string;        // Mapeado a DEPARTMENTS[].id (ej: "rrhh")
  mail: string;
  mobilePhone: string | null;
  officeLocation: string | null;
  photo?: string;              // base64 o URL; undefined si no hay foto
  status: EmployeeStatus;
  userPrincipalName: string;
};

export type EmployeeFilters = {
  query: string;
  departmentId: string;        // "" = todos
  status: EmployeeStatus | ""; // "" = todos
};
