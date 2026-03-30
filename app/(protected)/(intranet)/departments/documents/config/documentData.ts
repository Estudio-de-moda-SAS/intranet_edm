// app/documents/config/documentData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Datos mock del repositorio documental.
// En producción estos vendrían de tu API / SharePoint / S3 / DB.
//
// Campos clave para el sistema de permisos:
//   classification:  'public' | 'internal' | 'confidential' | 'restricted'
//   ownerDepartment: departamento propietario del documento
// ─────────────────────────────────────────────────────────────────────────────

import type { DocClassification } from "./documentClassification";

export type DocStatus =
  | "draft" | "review" | "approved" | "published" | "archived" | "expired";

export type DocumentItem = {
  id:              string;
  title:           string;
  category:        string;
  pages:           number;
  size:            number;       // MB
  created:         string;
  updated:         string;
  status:          DocStatus;
  owner:           string;       // Nombre del responsable
  ownerDepartment: string;       // Departamento propietario — usado para permisos
  classification:  DocClassification;
  previewUrl?:  string;   
  downloadUrl?: string; 
};

export const DOCUMENTS: DocumentItem[] = [

  // ── Públicos — todos los colaboradores ───────────────────────
  {
    id: "DOC-1-MicrosoftIA", title: "La guia empresarial para soluciones de IA de Microsoft",
    category: "IT", pages: 12, size: 2.1,
    created: "10 Mar", updated: "12 Mar", status: "approved",
    owner: "Microsoft", ownerDepartment: "Tecnología",
    classification: "public", previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf", downloadUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
  },
{
  id: "DOC-TEST-EXCEL",
  title: "Excel de Prueba — Office Online Embed",
  category: "IT",
  pages: 1,
  size: 0.1,
  created: "18 Mar", updated: "18 Mar", status: "approved",
  owner: "TI Corporativo", ownerDepartment: "Tecnología",
  classification: "public",
  previewUrl:  "https://view.officeapps.live.com/op/embed.aspx?src=https://go.microsoft.com/fwlink/?LinkID=521962",
  downloadUrl: "https://go.microsoft.com/fwlink/?LinkID=521962",
},

{
  id: "DOC-TEST-WORD",
  title: "Word de Prueba — Documento con Formato",
  category: "RRHH", pages: 3, size: 0.1,
  created: "18 Mar", updated: "18 Mar", status: "published",
  owner: "TI Corporativo", ownerDepartment: "Tecnología",
  classification: "public",
  previewUrl:  "https://view.officeapps.live.com/op/embed.aspx?src=https://calibre-ebook.com/downloads/demos/demo.docx",
  downloadUrl: "https://calibre-ebook.com/downloads/demos/demo.docx",
},
  {
    id: "DOC-1022", title: "Manual Onboarding Empleados",
    category: "RRHH", pages: 16, size: 3.2,
    created: "07 Mar", updated: "11 Mar", status: "published",
    owner: "Recursos Humanos", ownerDepartment: "RRHH",
    classification: "public",
  },
  {
    id: "DOC-1021", title: "Política Uso de Equipos",
    category: "IT", pages: 5, size: 0.9,
    created: "05 Mar", updated: "06 Mar", status: "approved",
    owner: "Seguridad IT", ownerDepartment: "Seguridad IT",
    classification: "public",
  },
  {
    id: "DOC-1016", title: "Política Trabajo Remoto",
    category: "RRHH", pages: 6, size: 1.1,
    created: "10 Feb", updated: "14 Feb", status: "archived",
    owner: "RRHH", ownerDepartment: "RRHH",
    classification: "public",
  },
  {
    id: "DOC-1015", title: "Reglamento Interno de Trabajo",
    category: "Legal", pages: 22, size: 4.1,
    created: "01 Ene", updated: "01 Feb", status: "published",
    owner: "Legal", ownerDepartment: "Legal",
    classification: "public",
  },
  {
    id: "DOC-1014", title: "Código de Conducta Corporativo",
    category: "Gerencia", pages: 10, size: 1.8,
    created: "15 Ene", updated: "20 Ene", status: "published",
    owner: "Gerencia", ownerDepartment: "Gerencia",
    classification: "public",
  },

  // ── Internos — manager+ ───────────────────────────────────────
  {
    id: "DOC-1023", title: "Procedimiento Gestión de Incidentes",
    category: "IT", pages: 8, size: 1.4,
    created: "09 Mar", updated: "10 Mar", status: "review",
    owner: "Infraestructura", ownerDepartment: "Infraestructura",
    classification: "internal",
  },
  {
    id: "DOC-1018", title: "Procedimiento Gestión de Proveedores",
    category: "Compras", pages: 11, size: 2.0,
    created: "20 Feb", updated: "22 Feb", status: "approved",
    owner: "Procurement", ownerDepartment: "Procurement",
    classification: "internal",
  },
  {
    id: "DOC-1017", title: "Manual Uso CRM Corporativo",
    category: "Ventas", pages: 13, size: 2.8,
    created: "15 Feb", updated: "18 Feb", status: "expired",
    owner: "Sales Ops", ownerDepartment: "Sales Ops",
    classification: "internal",
  },
  {
    id: "DOC-1013", title: "Plan Anual de Capacitación",
    category: "RRHH", pages: 9, size: 1.6,
    created: "02 Ene", updated: "10 Feb", status: "approved",
    owner: "Recursos Humanos", ownerDepartment: "RRHH",
    classification: "internal",
  },
  {
    id: "DOC-1012", title: "Proceso de Onboarding para Managers",
    category: "RRHH", pages: 7, size: 1.3,
    created: "15 Dic", updated: "05 Ene", status: "published",
    owner: "Recursos Humanos", ownerDepartment: "RRHH",
    classification: "internal",
  },

  // ── Confidenciales — área propietaria + admin ─────────────────
  {
    id: "DOC-1020", title: "Procedimiento Compras Corporativas",
    category: "Finanzas", pages: 9, size: 1.7,
    created: "02 Mar", updated: "04 Mar", status: "draft",
    owner: "Finanzas", ownerDepartment: "Finanzas",
    classification: "confidential",
  },
  {
    id: "DOC-1019", title: "Normativa Protección de Datos",
    category: "Legal", pages: 14, size: 2.5,
    created: "28 Feb", updated: "01 Mar", status: "published",
    owner: "Legal", ownerDepartment: "Jurídica",
    classification: "confidential",
  },
  {
    id: "DOC-1011", title: "Estructura Salarial y Bandas",
    category: "RRHH", pages: 8, size: 1.5,
    created: "01 Ene", updated: "01 Mar", status: "approved",
    owner: "Recursos Humanos", ownerDepartment: "RRHH",
    classification: "confidential",
  },
  {
    id: "DOC-1010", title: "Informe Auditoría Interna Q1",
    category: "Finanzas", pages: 24, size: 5.2,
    created: "01 Mar", updated: "15 Mar", status: "review",
    owner: "Finanzas", ownerDepartment: "Finanzas",
    classification: "confidential",
  },
  {
    id: "DOC-1009", title: "Registro de Incidentes de Seguridad",
    category: "IT", pages: 6, size: 1.0,
    created: "01 Feb", updated: "10 Mar", status: "approved",
    owner: "Seguridad IT", ownerDepartment: "Tecnología",
    classification: "confidential",
  },
  {
    id: "DOC-1008", title: "Base de Datos de Clientes B2B",
    category: "Ventas", pages: 3, size: 8.4,
    created: "01 Dic", updated: "01 Mar", status: "approved",
    owner: "Sales Ops", ownerDepartment: "Retail",
    classification: "confidential",
  },

  // ── Restringidos — solo admin ─────────────────────────────────
  {
    id: "DOC-1007", title: "Contrato Marco Proveedores Estratégicos",
    category: "Legal", pages: 32, size: 6.8,
    created: "01 Nov", updated: "15 Feb", status: "approved",
    owner: "Legal", ownerDepartment: "Jurídica",
    classification: "restricted",
  },
  {
    id: "DOC-1006", title: "Plan Estratégico 2025–2027",
    category: "Gerencia", pages: 45, size: 9.1,
    created: "01 Dic", updated: "28 Feb", status: "approved",
    owner: "Gerencia", ownerDepartment: "Gerencia",
    classification: "restricted",
  },
  {
    id: "DOC-1005", title: "Política de Compensación Ejecutiva",
    category: "RRHH", pages: 12, size: 2.3,
    created: "15 Ene", updated: "01 Mar", status: "approved",
    owner: "Recursos Humanos", ownerDepartment: "RRHH",
    classification: "restricted",
  },
];
