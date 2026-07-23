/**
 * @module documentSites
 *
 * Catálogo corporativo de áreas documentales.
 *
 * @remarks
 * Este archivo centraliza la configuración de los sitios de SharePoint
 * habilitados para el módulo de Gestión Documental.
 *
 * Cada registro representa un área funcional de la organización y mantiene
 * la relación entre la experiencia de usuario y el sitio físico de SharePoint.
 *
 * Actualmente el catálogo es estático y se encuentra definido en código,
 * pero está diseñado para migrar posteriormente a una fuente dinámica
 * (Supabase, SQL Server o Microsoft Lists) sin afectar la capa de presentación.
 */

import type { DocumentDepartment } from "../types/documentDepartment.types";

/**
 * Catálogo de áreas documentales disponibles.
 *
 * @remarks
 * Registros temporales para validar visualmente el nuevo sidebar documental.
 *
 * Los valores `siteId: "pending"` deberán reemplazarse por los `siteId`
 * reales obtenidos desde Microsoft Graph.
 */
export const DOCUMENT_SITES: readonly DocumentDepartment[] = [
  {
    id: "capital-humano",
    name: "Capital Humano",
    siteId: "estudiodemoda.sharepoint.com,35a25e9a-b939-4364-837b-a13c258e6bd3,cd0ee108-4bdc-4d16-ac0b-b6f1a1342bba",
    siteUrl: "#",
    description: "Documentos de gestión humana.",
    icon: "Users",
    accentColor: "indigo",
    order: 1,
    enabled: true,
  },
  {
    id: "juridico",
    name: "Jurídico",
    siteId: "pending",
    siteUrl: "#",
    description: "Contratos, políticas y soporte legal.",
    icon: "Scale",
    accentColor: "violet",
    order: 2,
    enabled: true,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    siteId: "pending",
    siteUrl: "#",
    description: "Manuales, procesos y documentación TI.",
    icon: "Monitor",
    accentColor: "blue",
    order: 3,
    enabled: true,
  },
];

