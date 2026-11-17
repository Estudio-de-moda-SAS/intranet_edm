/**
 * @module documentSites
 *
 * Configuración del catálogo de áreas documentales corporativas.
 *
 * @remarks
 * Cada gerencia tiene su **propio sitio de SharePoint** (site collection
 * independiente, ej. `/sites/GerenciadeTI`) — ya no cuelgan todas de un
 * mismo sitio raíz, así que no hay nada que "listar" para descubrirlas.
 *
 * El catálogo es por tanto la lista explícita {@link DOCUMENT_SITES}: una
 * entrada por gerencia con su URL y su cosmética opcional. En tiempo de
 * ejecución `documentCatalog.service.ts` resuelve cada URL vía Graph
 * (`resolveSharePointSiteByUrl`) en paralelo y descarta en silencio las que
 * fallen (403/404): así cada usuario solo ve las gerencias a las que tiene
 * permiso en SharePoint, sin lógica de permisos propia en la Intranet.
 *
 * Para agregar una gerencia nueva basta con añadir su URL aquí.
 */

/** Configuración de un sitio de gerencia. */
export interface DocumentSiteConfig {
  /**
   * URL del sitio de SharePoint de la gerencia, tal como se ve en el
   * navegador (se aceptan URLs con `/SitePages/...`, `.aspx`, etc.).
   */
  url: string;
  /**
   * Nombre visible. Si se omite se usa el `displayName` que devuelve Graph.
   */
  name?: string;
  /**
   * Identificador estable del área (usado en rutas/estado). Si se omite se
   * deriva de {@link normalizeDepartmentKey} aplicado al nombre.
   */
  id?: string;
  icon?: string;
  accentColor?: string;
  description?: string;
}

/**
 * Sitios de gerencia que forman el catálogo documental.
 *
 * @remarks
 * El orden del arreglo es el orden en el que aparecen en el sidebar.
 */
export const DOCUMENT_SITES: readonly DocumentSiteConfig[] = [
  {
    url: "https://estudiodemoda.sharepoint.com/sites/DocumentosCorporativos/DC",
    icon: "",
    accentColor: "indigo",
    description: "Repositorio documental de los documentos generales de la compañia.",
  }, 
  {
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeTI/",
    icon: "Laptop",
    accentColor: "indigo",
    description: "Repositorio documental de la Gerencia de TI.",
  },
  {
    icon: "ShoppingCart",
    accentColor: "indigo",
    description: "Repositorio documental del área de Ecommerce.",
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeMultimarca/E-Commerce",
  },
  {
    icon: "Landmark",
    accentColor: "indigo",
    description: "Repositorio documental del área Financiera.",
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeFinanciera/Contabilidad"
  },
  {
    icon: "Tag",
    accentColor: "indigo",
    description: "Repositorio documental de Gerencia multimarcas.",
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeMultimarca",
  },
  {
    icon: "Tag",
    accentColor: "indigo",
    description: "Repositorio documental de Producto.",
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeMonomarca/Producto",
  },
  {
    icon: "Tag",
    accentColor: "indigo",
    description: "Repositorio documental de Producto.",
    url: "https://estudiodemoda.sharepoint.com/sites/GerenciadeMonomarca",
  },

];


/**
 * Normaliza un nombre de sitio/área a una clave estable (minúsculas, sin
 * tildes, separada por guiones), usada para generar el `id` de un área
 * cuando su entrada en {@link DOCUMENT_SITES} no lo define.
 */
export function normalizeDepartmentKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
