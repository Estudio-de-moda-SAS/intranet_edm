/**
 * @module documentSites
 *
 * Catálogo oficial de áreas documentales corporativas.
 *
 * @remarks
 * Fuente única de verdad para la fuente documental `corporate-sites`.
 * Cada entrada corresponde a un sitio o subsitio real de SharePoint,
 * verificado y resuelto manualmente (ver `DocumentsExplorer`, herramienta
 * interna de desarrollo). Agregar una nueva área es tan simple como
 * añadir una entrada más a este arreglo.
 */

import type { DocumentDepartment } from "../types/documentDepartment.types";

export const DOCUMENT_SITES: readonly DocumentDepartment[] = [
  {
    id: "juridica",
    name: "Jurídica",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,2d010a5a-744c-43b3-80c9-5c616cef6df8",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Juridica",
    description: "Repositorio documental del área Jurídica.",
    icon: "Scale",
    accentColor: "indigo",
    order: 1,
    enabled: true,
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,0a513e6c-f4ca-4079-9279-55a56ef04f03",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Ecommerce",
    description: "Repositorio documental del área de Ecommerce.",
    icon: "ShoppingCart",
    accentColor: "indigo",
    order: 2,
    enabled: true,
  },
  {
    id: "producto",
    name: "Producto",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,1aa218c0-e0b7-417d-82d8-e44510d2e6d6",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Producto",
    description: "Repositorio documental del área de Producto.",
    icon: "Package",
    accentColor: "indigo",
    order: 3,
    enabled: true,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,9fede951-be51-4fd6-a765-6d23f872c33e",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Tecnologia",
    description: "Repositorio documental del área de Tecnología.",
    icon: "Laptop",
    accentColor: "indigo",
    order: 4,
    enabled: true,
  },
  {
    id: "financiero",
    name: "Financiero",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,d8f6cc71-3965-4a8f-9286-54b19793684d",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Financiero",
    description: "Repositorio documental del área Financiera.",
    icon: "Landmark",
    accentColor: "indigo",
    order: 5,
    enabled: true,
  },
  {
    id: "cadena-abastecimiento",
    name: "Cadena de Abastecimiento",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,1116eea1-ec57-4da2-a294-7bde2134a2c0",
    siteUrl:
      "https://estudiodemoda.sharepoint.com/sites/FS/Cadena%20Abastecimiento",
    description: "Repositorio documental de Cadena de Abastecimiento.",
    icon: "Truck",
    accentColor: "indigo",
    order: 6,
    enabled: true,
  },
  {
    id: "capital-humano",
    name: "Capital Humano",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,c39f99d7-27d1-4c7a-9ca9-9706f82103b3",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Capital%20Humano",
    description: "Repositorio documental de Capital Humano.",
    icon: "Users",
    accentColor: "indigo",
    order: 7,
    enabled: true,
  },
  {
    id: "control-interno",
    name: "Control Interno",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,30f9cb9b-4cc3-4a0c-980a-448055a22233",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/Control%20Interno",
    description: "Repositorio documental de Control Interno.",
    icon: "ShieldCheck",
    accentColor: "indigo",
    order: 8,
    enabled: true,
  },
  {
    id: "gerencia-de-marcas",
    name: "Gerencia de Marcas",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,b460ae4a-ca3a-4aad-893c-a1531ce98d1c",
    siteUrl:
      "https://estudiodemoda.sharepoint.com/sites/FS/Gerencia%20de%20Marcas",
    description: "Repositorio documental de Gerencia de Marcas.",
    icon: "Tag",
    accentColor: "indigo",
    order: 9,
    enabled: true,
  },
  {
    id: "inteligencia-comercial",
    name: "Inteligencia Comercial",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,4a15a885-aa5e-45d6-a173-f70deb9cef73",
    siteUrl: "https://estudiodemoda.sharepoint.com/sites/FS/IC",
    description: "Repositorio documental de Inteligencia Comercial.",
    icon: "TrendingUp",
    accentColor: "indigo",
    order: 10,
    enabled: true,
  },
  {
    id: "servicios-administrativos",
    name: "Servicios Administrativos",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,e392a2e2-e0c1-4491-8713-6db640f5d451",
    siteUrl:
      "https://estudiodemoda.sharepoint.com/sites/FS/Servicios%20Administrativos",
    description: "Repositorio documental de Servicios Administrativos.",
    icon: "Building2",
    accentColor: "indigo",
    order: 11,
    enabled: true,
  },
  {
    id: "socios-comerciales",
    name: "Socios Comerciales",
    siteId:
      "estudiodemoda.sharepoint.com,1fb52e1a-d7f9-403c-bce1-8e5004c5a846,70634d9c-e043-4a80-b480-c24cd5ae51b9",
    siteUrl:
      "https://estudiodemoda.sharepoint.com/sites/FS/Socios%20Comerciales",
    description: "Repositorio documental de Socios Comerciales.",
    icon: "Handshake",
    accentColor: "indigo",
    order: 12,
    enabled: true,
  },
];