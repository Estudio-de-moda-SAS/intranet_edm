import type { LegalDocument } from "@/lib/graph/legal.service";

export async function getLegalDocuments(): Promise<LegalDocument[]> {
  return [
    {
      id: "DOC-001",
      title: "Contrato estándar proveedor",
      category: "contract_template",

      size: "1.2 MB",
      updatedAt: "2026-02-01",

      previewUrl: "/mock-pdfs/contrato-proveedor.pdf",
      downloadUrl: "/mock-pdfs/contrato-proveedor.pdf",

      restricted: false,
      author: "Departamento Jurídico",
      version: "v3.1",
    },

    {
      id: "DOC-002",
      title: "Política de privacidad corporativa",
      category: "policy",

      size: "820 KB",
      updatedAt: "2026-01-12",

      previewUrl: "/mock-pdfs/politica-privacidad.pdf",
      downloadUrl: "/mock-pdfs/politica-privacidad.pdf",

      restricted: false,
      author: "Compliance",
      version: "v2.4",
    },
    {
  id: "DOC-003",
  title: "Modelo de poder notarial general",
  category: "power_of_attorney",
  size: "210 KB",
  updatedAt: "2025-06-15",
  restricted: true,
},

{
  id: "DOC-004",
  title: "Guía de cumplimiento normativo 2025",
  category: "regulatory",
  size: "1.2 MB",
  updatedAt: "2025-06-10",
},

{
  id: "DOC-005",
  title: "Formato de solicitud de revisión legal",
  category: "form",
  size: "95 KB",
  updatedAt: "2025-06-01",
},
  ];
}