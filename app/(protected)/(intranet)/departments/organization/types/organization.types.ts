export interface OrganizationUnit {
  id: string;
  name: string;
  leader?: string | undefined;
  description?: string | undefined;
  employeeCount?: number | undefined;
  contactEmail?: string | undefined;
  teamsUrl?: string | undefined;
  location?: string | undefined;
  parentName?: string | undefined;

  /**
   * Correo del usuario responsable en Microsoft 365.
   * Se usa para consultar datos reales desde Microsoft Graph.
   */
  graphUserEmail?: string | undefined;

  /**
   * Datos enriquecidos desde Graph.
   * Se llenarán en runtime, no necesariamente desde el mock.
   */
  graphUserId?: string | undefined;
  graphDisplayName?: string | undefined;
  graphJobTitle?: string | undefined;
  graphDepartment?: string | undefined;
  graphOfficeLocation?: string | undefined;
  graphPhotoUrl?: string | undefined;

  children?: OrganizationUnit[] | undefined;
}

/**
 * Nodo construido directamente desde Microsoft Graph.
 */
export interface GraphOrganizationTreeNode {
  id: string;
  displayName: string;
  jobTitle?: string | undefined;
  email?: string | undefined;
  department?: string | undefined;
  officeLocation?: string | undefined;
  photoUrl?: string | undefined;
  children: GraphOrganizationTreeNode[];
}