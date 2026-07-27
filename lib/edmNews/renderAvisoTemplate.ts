// lib/edmNews/renderAvisoTemplate.ts
/**
 * @module renderAvisoTemplate
 * Genera el HTML de la plantilla "Aviso Importante" a partir de datos
 * simples (título + cuerpo de texto).
 *
 * @remarks
 * El HTML resultante usa estilos inline a propósito — se inyecta tal
 * cual en el carrusel del Home vía dangerouslySetInnerHTML, sin pasar
 * por el compilador de Tailwind del proyecto.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface RenderAvisoParams {
  title: string;
  body: string;
}

/**
 * Renderiza la plantilla "Aviso Importante" como HTML autocontenido.
 *
 * @param params.title - Título del aviso.
 * @param params.body - Cuerpo de texto; los párrafos se separan por
 *   líneas en blanco dobles (igual que un textarea normal).
 * @returns HTML listo para guardar en `content_html`.
 */
export function renderAvisoImportanteHtml({ title, body }: RenderAvisoParams): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0;font-size:14px;line-height:1.6;color:#333333;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  return `<div style="font-family:'DM Sans',sans-serif;height:100%;display:flex;flex-direction:column;background:#ffffff;">
    <div style="background:#1F3A5F;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
      <span style="color:#ffffff;font-weight:700;font-size:13px;letter-spacing:0.05em;">EDM NEWS</span>
      <span style="background:#D6336C;color:#ffffff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:0.05em;">AVISO</span>
    </div>
    <div style="flex:1;padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-start;gap:14px;overflow-y:auto;">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#12233A;">${escapeHtml(title)}</h2>
      ${paragraphs}
    </div>
    <div style="background:#12233A;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;">
      <span style="color:#ffffff;font-size:11px;font-weight:600;">ESTUDIO DE MODA</span>
      <span style="color:#cfd8e3;font-size:11px;">@EDM.BEHAPPY</span>
    </div>
  </div>`;
}