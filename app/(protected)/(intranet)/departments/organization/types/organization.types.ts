export interface OrganizationUnit {
  id: string;
  name: string;
  leader?: string;
  description?: string;
  employeeCount?: number;
  contactEmail?: string;
  teamsUrl?: string;
  location?: string;
  parentName?: string;

  /**
   * Correo del usuario responsable en Microsoft 365.
   * Se usa para consultar datos reales desde Microsoft Graph.
   */
  graphUserEmail?: string;

  /**
   * Datos enriquecidos desde Graph.
   * Se llenarán en runtime, no necesariamente desde el mock.
   */
  graphUserId?: string;
  graphDisplayName?: string;
  graphJobTitle?: string;
  graphDepartment?: string;
  graphOfficeLocation?: string;
  graphPhotoUrl?: string;

  children?: OrganizationUnit[];
}