/**
 * @module api/legal
 * Cliente de API para el módulo de Documentos Legales de la intranet EDM.
 *
 * @remarks
 * Provee acceso a la biblioteca de documentos jurídicos del departamento
 * Legal. Actualmente retorna datos mock mientras se obtienen los permisos
 * de SharePoint necesarios para la integración con Microsoft Graph.
 *
 * Los documentos con `restricted: true` requieren nivel de acceso
 * `legal` para ser descargados — la restricción debe aplicarse en el
 * componente consumidor usando {@link can} de `roles.ts`.
 *
 * @example
 * ```ts
 * const documents = await getLegalDocuments();
 * const accessible = documents.filter(d => !d.restricted || can(level, 'legal:download'));
 * ```
 */

import type { LegalDocument } from "@/lib/graph/departments/legal.service";

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Obtiene la biblioteca de documentos legales disponibles para el
 * colaborador autenticado.
 *
 * @remarks
 * Retorna el catálogo completo incluyendo documentos restringidos
 * (`restricted: true`). El filtrado por nivel de acceso es
 * responsabilidad del componente consumidor — esta función devuelve
 * siempre todos los documentos para permitir mostrar los restringidos
 * con candado en la UI.
 *
 * Los campos `previewUrl` y `downloadUrl` son opcionales: los documentos
 * sin ellos solo pueden listarse pero no previsualizarse ni descargarse
 * desde la intranet.
 *
 * ⏳ Pendiente de reemplazar con llamada real a SharePoint:
 * `GET /sites/{site-id}/lists/{legal-library-id}/items`
 *
 * @returns Array de {@link LegalDocument} con el catálogo completo de
 *   documentos jurídicos, ordenados por fecha de actualización descendente.
 *
 * @example
 * ```ts
 * const docs = await getLegalDocuments();
 *
 * // Separar accesibles de restringidos para la UI:
 * const open       = docs.filter(d => !d.restricted);
 * const restricted = docs.filter(d => d.restricted);
 * ```
 */
export async function getLegalDocuments(): Promise<LegalDocument[]> {
  return [
    {
      id:          "DOC-001",
      title:       "Contrato estándar proveedor",
      category:    "contract_template",
      size:        "1.2 MB",
      updatedAt:   "2026-02-01",
      previewUrl:  "/mock-pdfs/contrato-proveedor.pdf",
      downloadUrl: "/mock-pdfs/contrato-proveedor.pdf",
      restricted:  false,
      author:      "Departamento Jurídico",
      version:     "v3.1",
    },
    {
      id:          "DOC-002",
      title:       "Política de privacidad corporativa",
      category:    "policy",
      size:        "820 KB",
      updatedAt:   "2026-01-12",
      previewUrl:  "/mock-pdfs/politica-privacidad.pdf",
      downloadUrl: "/mock-pdfs/politica-privacidad.pdf",
      restricted:  false,
      author:      "Compliance",
      version:     "v2.4",
    },
    {
      id:        "DOC-003",
      title:     "Modelo de poder notarial general",
      category:  "power_of_attorney",
      size:      "210 KB",
      updatedAt: "2025-06-15",
      restricted: true,
    },
    {
      id:        "DOC-004",
      title:     "Guía de cumplimiento normativo 2025",
      category:  "regulatory",
      size:      "1.2 MB",
      updatedAt: "2025-06-10",
    },
    {
      id:        "DOC-005",
      title:     "Formato de solicitud de revisión legal",
      category:  "form",
      size:      "95 KB",
      updatedAt: "2025-06-01",
    },
  ];
}