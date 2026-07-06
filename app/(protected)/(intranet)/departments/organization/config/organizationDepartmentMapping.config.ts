export interface OrganizationDepartmentMapping {
  department: string;

  /**
   * Nombre visible que aparecerá en el organigrama.
   */
  displayName?: string;

  /**
   * Correo del líder que debería contener este departamento.
   * Sirve para ubicar personas aunque no tengan manager configurado.
   */
  leaderEmail?: string;

  /**
   * Departamento padre dentro de la estructura corporativa.
   */
  parentDepartment?: string;
}

export const ORGANIZATION_DEPARTMENT_MAPPINGS: OrganizationDepartmentMapping[] =
  [
    {
      department: "Tecnología",
      displayName: "Tecnología",
      parentDepartment: "Servicios Administrativos",
    },

    {
      department: "Talento Humano",
      displayName: "Talento Humano",
      parentDepartment: "Servicios Administrativos",
    },

    {
      department: "Finanzas",
      displayName: "Finanzas",
      parentDepartment: "Gerencia General",
    },

    {
      department: "Jurídico",
      displayName: "Jurídico",
      parentDepartment: "Gerencia General",
    },

    {
      department: "Logística",
      displayName: "Logística",
      parentDepartment: "Gerencia General",
    },

    {
      department: "Comercial",
      displayName: "Comercial",
      parentDepartment: "Gerencia General",
    },

    {
      department: "Producto",
      displayName: "Producto",
      parentDepartment: "Gerencia General",
    },

    {
      department: "E-Commerce",
      displayName: "E-Commerce",
      parentDepartment: "Comercial",
    },
  ];