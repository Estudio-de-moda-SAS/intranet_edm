import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const legalQuickLinks: QuickLinkConfig[] = [
  // Nueva solicitud — cualquiera puede pedirla (employee+)
  { label: "Nueva solicitud", href: "/legal/requests/new", icon: "FilePlus", color: "blue",
    description: "Revisión o consulta legal" },
  // Contratos — solo legal + admin
  { label: "Contratos",  href: "/legal/contracts",  icon: "FileSignature", color: "purple",
    description: "Repositorio de contratos",
    requiredPermission: "legal:view_contracts",
    disabledMsg: "Acceso restringido al equipo Jurídico" },
  // Litigios — solo legal + admin
  { label: "Litigios",   href: "/legal/litigations", icon: "Scale",        color: "coral",
    description: "Casos y expedientes activos",
    requiredPermission: "legal:view_litigation",
    disabledMsg: "Acceso restringido al equipo Jurídico" },
  // Compliance — manager+
  { label: "Compliance", href: "/legal/compliance",  icon: "ShieldCheck",  color: "teal",
    description: "Cumplimiento normativo",
    requiredPermission: "legal:view_regulatory" },
  // Documentos — manager+, habilitado solo legal+
  { label: "Documentos", href: "/legal/documents",   icon: "FolderOpen",   color: "amber",
    description: "Plantillas y políticas",
    requiredPermission: "legal:view_kpis",
    enabledPermission:  "legal:view_documents",
    disabledMsg: "Acceso restringido al equipo Jurídico" },
  // Contacto — todos
  { label: "Contacto jurídico", href: "/legal/contact", icon: "PhoneCall", color: "green",
    description: "Ext. 1200 · Piso 8" },
];