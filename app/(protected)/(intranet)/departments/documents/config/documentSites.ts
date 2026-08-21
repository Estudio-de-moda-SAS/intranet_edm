/**
 * @module documentSites
 *
 * Configuración del catálogo de áreas documentales corporativas.
 *
 * @remarks
 * El catálogo ya no se registra manualmente sitio por sitio: se descubre en
 * tiempo real a partir de un único sitio raíz de SharePoint
 * ({@link DOCUMENTS_ROOT_SITE_ID}), listando sus subsitios directos vía
 * `getSharePointSubsites` (ver `documentCatalog.service.ts`).
 *
 * Este archivo solo aporta la configuración necesaria para esa resolución
 * dinámica:
 * - el `siteId` del sitio raíz,
 * - una cosmética opcional por área ({@link DEPARTMENT_OVERRIDES}: ícono,
 *   color, descripción, orden) para las áreas ya conocidas,
 * - una lista de exclusión ({@link EXCLUDED_SUBSITE_KEYS}) para subsitios
 *   que no deben mostrarse como área documental (sistema, pruebas, etc.).
 *
 * Un subsitio nuevo que no tenga entrada en `DEPARTMENT_OVERRIDES` se lista
 * igualmente, con un ícono genérico y al final del listado — no requiere
 * ningún cambio de código para aparecer.
 */

/**
 * `siteId` del sitio raíz de SharePoint bajo el cual viven todas las áreas
 * documentales (subsitios directos).
 *
 * @remarks
 * Derivado del prefijo `hostname,siteCollectionId` compartido por las 12
 * áreas registradas anteriormente de forma manual — todas colgaban del
 * mismo site collection (`.../sites/FS`). Graph acepta esta forma de dos
 * segmentos para referirse al sitio raíz de un site collection.
 *
 * Verificar con `GET /sites/{DOCUMENTS_ROOT_SITE_ID}` (o con la herramienta
 * interna `DocumentsExplorer.tsx`, activando temporalmente `SHOW_EXPLORER`
 * en `DocumentHomePage.tsx`) antes de confiar en este valor en producción.
 */
export const DOCUMENTS_ROOT_SITE_ID =
  "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846";

/**
 * Respaldo manual de URLs de subsitios conocidos.
 *
 * @remarks
 * `getSharePointSubsites(DOCUMENTS_ROOT_SITE_ID)` (`GET /sites/{id}/sites`)
 * requiere que el usuario tenga permiso sobre el **sitio raíz** para poder
 * enumerar sus subsitios — si no lo tiene, Graph responde 403 para esa
 * llamada aunque el usuario sí tenga permiso directo sobre uno o varios
 * subsitios. `documentCatalog.service.ts` usa esta lista como respaldo
 * exactamente en ese caso: resuelve cada URL de forma individual vía
 * `resolveSharePointSiteByUrl` y descarta en silencio las que también
 * fallen (el usuario tampoco tiene acceso ahí, lo cual es correcto).
 *
 * Vacía por defecto — no hay ningún subsitio "de más" hasta que se
 * complete con URLs reales verificadas contra el tenant (ej. con la
 * herramienta interna `DocumentsExplorer.tsx` o `resolveSharePointSiteByUrl`),
 * ej.: `"https://estudiodemoda.sharepoint.com/sites/FS/Juridica"`.
 */
export const KNOWN_SUBSITE_URLS: readonly string[] = [
  "https://estudiodemoda.sharepoint.com/sites/FS/Juridica",
  "https://estudiodemoda.sharepoint.com/sites/FS/Ecommerce",
  "https://estudiodemoda.sharepoint.com/sites/FS/Producto",
  "https://estudiodemoda.sharepoint.com/sites/FS/Tecnologia",
  "https://estudiodemoda.sharepoint.com/sites/FS/Financiero",
  "https://estudiodemoda.sharepoint.com/sites/FS/Cadena%20Abastecimiento",
  "https://estudiodemoda.sharepoint.com/sites/FS/Capital%20Humano",
  "https://estudiodemoda.sharepoint.com/sites/FS/Control%20Interno",
  "https://estudiodemoda.sharepoint.com/sites/FS/Gerencia%20de%20Marcas",
  "https://estudiodemoda.sharepoint.com/sites/FS/IC",
  "https://estudiodemoda.sharepoint.com/sites/FS/Servicios%20Administrativos",
  "https://estudiodemoda.sharepoint.com/sites/FS/Socios%20Comerciales",
];

/**
 * Normaliza un nombre de sitio/área a una clave estable (minúsculas, sin
 * tildes, separada por guiones), usada tanto para generar `id` a partir del
 * `displayName` que devuelve Graph como para las claves de
 * {@link DEPARTMENT_OVERRIDES} y {@link EXCLUDED_SUBSITE_KEYS}.
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

/** Cosmética opcional de un área documental conocida. */
export interface DepartmentOverride {
  icon?: string;
  accentColor?: string;
  description?: string;
  order?: number;
}

/**
 * Cosmética curada para las áreas ya conocidas, indexada por
 * {@link normalizeDepartmentKey} aplicado al nombre del sitio.
 *
 * @remarks
 * Las claves se derivaron del nombre humano de cada área tal como se
 * mostraba en el catálogo estático anterior. Deben verificarse contra el
 * `displayName` real que devuelve Graph para cada subsitio la primera vez
 * que se pruebe contra el tenant — si algún nombre real difiere, ajustar la
 * clave puntual aquí.
 *
 * Un subsitio descubierto que no aparezca en este mapa simplemente no tiene
 * cosmética curada: cae a un ícono genérico (`getDepartmentIcon`) y a un
 * orden posterior a todas las áreas curadas.
 */
export const DEPARTMENT_OVERRIDES: Record<string, DepartmentOverride> = {
  juridica: {
    icon: "Scale",
    accentColor: "indigo",
    description: "Repositorio documental del área Jurídica.",
    order: 1,
  },
  ecommerce: {
    icon: "ShoppingCart",
    accentColor: "indigo",
    description: "Repositorio documental del área de Ecommerce.",
    order: 2,
  },
  producto: {
    icon: "Package",
    accentColor: "indigo",
    description: "Repositorio documental del área de Producto.",
    order: 3,
  },
  tecnologia: {
    icon: "Laptop",
    accentColor: "indigo",
    description: "Repositorio documental del área de Tecnología.",
    order: 4,
  },
  financiero: {
    icon: "Landmark",
    accentColor: "indigo",
    description: "Repositorio documental del área Financiera.",
    order: 5,
  },
  "cadena-de-abastecimiento": {
    icon: "Truck",
    accentColor: "indigo",
    description: "Repositorio documental de Cadena de Abastecimiento.",
    order: 6,
  },
  "capital-humano": {
    icon: "Users",
    accentColor: "indigo",
    description: "Repositorio documental de Capital Humano.",
    order: 7,
  },
  "control-interno": {
    icon: "ShieldCheck",
    accentColor: "indigo",
    description: "Repositorio documental de Control Interno.",
    order: 8,
  },
  "gerencia-de-marcas": {
    icon: "Tag",
    accentColor: "indigo",
    description: "Repositorio documental de Gerencia de Marcas.",
    order: 9,
  },
  "inteligencia-comercial": {
    icon: "TrendingUp",
    accentColor: "indigo",
    description: "Repositorio documental de Inteligencia Comercial.",
    order: 10,
  },
  "servicios-administrativos": {
    icon: "Building2",
    accentColor: "indigo",
    description: "Repositorio documental de Servicios Administrativos.",
    order: 11,
  },
  "socios-comerciales": {
    icon: "Handshake",
    accentColor: "indigo",
    description: "Repositorio documental de Socios Comerciales.",
    order: 12,
  },
};

/**
 * Orden asignado a un subsitio descubierto que no tiene entrada en
 * {@link DEPARTMENT_OVERRIDES}. Las áreas nuevas aparecen después de todas
 * las curadas, ordenadas alfabéticamente entre sí.
 */
export const DEFAULT_DEPARTMENT_ORDER_BASE = 1000;

/**
 * Claves ({@link normalizeDepartmentKey} del nombre del subsitio) que deben
 * excluirse del catálogo de áreas documentales — sitios de sistema, de
 * prueba, o cualquier subsitio del sitio raíz que no deba listarse como
 * área. Vacío por defecto.
 */
export const EXCLUDED_SUBSITE_KEYS: readonly string[] = [];
