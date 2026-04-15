/**
 * @module EcommerceSidebarCards
 * Tarjetas laterales del canal E-Commerce dentro del módulo de Retail.
 *
 * @remarks
 * Este archivo agrupa componentes secundarios de apoyo para la vista
 * del canal e-commerce, orientados al monitoreo rápido de señales
 * de experiencia de cliente y de operación digital.
 *
 * Actualmente incluye:
 * - {@link EcommerceReviewsCard}: resumen de reseñas recientes de clientes
 * - {@link EcommerceAlertsCard}: alertas operativas del canal online
 *
 * Estos componentes están pensados para mostrarse en la columna lateral
 * del dashboard de e-commerce, permitiendo una lectura inmediata de:
 * - percepción del cliente sobre productos comprados
 * - volumen de reseñas negativas
 * - incidentes o riesgos operativos del canal digital
 *
 * La información mostrada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían integrarse con:
 * - plataformas de e-commerce
 * - servicios de reviews y reputación
 * - monitoreo de inventario y checkout
 * - analítica de performance digital
 */

import { Star, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";

// ── Reviews ───────────────────────────────────────────────────────

/**
 * Representa una reseña reciente de un cliente en el canal e-commerce.
 *
 * @remarks
 * Este tipo modela la información necesaria para renderizar
 * una reseña breve dentro del panel lateral del dashboard.
 *
 * Cada reseña incluye:
 * - nombre resumido del cliente
 * - producto reseñado
 * - calificación numérica
 * - comentario corto
 * - momento relativo de publicación
 * - iniciales para avatar visual
 * - tono base para gradiente del avatar
 *
 * @property customer Nombre abreviado del cliente.
 * @property product Nombre del producto reseñado.
 * @property rating Calificación numérica de 1 a 5.
 * @property comment Comentario breve del usuario.
 * @property time Marca temporal relativa.
 * @property initials Iniciales usadas como avatar textual.
 * @property hue Tono base usado para el gradiente visual del avatar.
 */
type Review = {
  customer: string;
  product: string;
  rating: number;
  comment: string;
  time: string;
  initials: string;
  hue: number;
};

/**
 * Dataset estático de reseñas recientes.
 *
 * @remarks
 * Este arreglo contiene ejemplos representativos de reseñas
 * recientes del canal online.
 *
 * Incluye tanto opiniones positivas como negativas para permitir:
 * - calcular calificación promedio
 * - identificar señales de insatisfacción
 * - validar la visualización de estados de rating
 */
const REVIEWS: Review[] = [
  { customer: "Laura M.",  product: "Camisa Lino Premium",  rating: 5, comment: "Excelente calidad, llegó antes de lo esperado.", time: "Hace 1h",  initials: "LM", hue: 280 },
  { customer: "Carlos R.", product: "Jean Skinny",          rating: 4, comment: "Buen producto, el color es igual al de la foto.", time: "Hace 3h",  initials: "CR", hue: 200 },
  { customer: "Ana G.",    product: "Vestido Floral Midi",  rating: 2, comment: "La talla no corresponde a la guía.",             time: "Hace 5h",  initials: "AG", hue: 340 },
  { customer: "Diego P.",  product: "Blazer Negro",         rating: 5, comment: "Impecable presentación, muy elegante.",          time: "Ayer",     initials: "DP", hue: 160 },
];

/**
 * Renderiza una fila visual de estrellas para representar una calificación.
 *
 * @param props Propiedades del componente.
 * @param props.rating Valor numérico de la calificación.
 * @returns Un conjunto de cinco estrellas con relleno parcial según el rating.
 *
 * @remarks
 * Este subcomponente se utiliza dentro de la tarjeta de reseñas
 * para expresar visualmente la puntuación otorgada por el cliente.
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
    </div>
  );
}

/**
 * Tarjeta de reseñas recientes del canal e-commerce.
 *
 * @returns Un componente visual con reseñas recientes y métricas resumidas.
 *
 * @remarks
 * Este componente presenta una vista compacta de reseñas recientes
 * de clientes, con foco en reputación y experiencia de compra.
 *
 * Además del listado, calcula dos indicadores relevantes:
 * - promedio de calificación (`avgRating`)
 * - número de reseñas negativas (`negCount`)
 *
 * En este contexto, se consideran negativas las reseñas
 * con calificación menor o igual a 2.
 *
 * Esta tarjeta resulta útil para:
 * - seguimiento de satisfacción del cliente
 * - identificación temprana de problemas en producto
 * - monitoreo de reputación del canal online
 *
 * @example
 * ```tsx
 * <EcommerceReviewsCard />
 * ```
 */
export function EcommerceReviewsCard() {
  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const negCount  = REVIEWS.filter((r) => r.rating <= 2).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
            <Star className="h-3.5 w-3.5 text-amber-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Reseñas Recientes</h3>
          <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
            ★ {avgRating}
          </span>
        </div>
        {negCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
            {negCount} negativas
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50">
        {REVIEWS.map((r, i) => (
          <li key={i} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, hsl(${r.hue},65%,55%), hsl(${r.hue + 20},60%,45%))` }}
              >
                {r.initials}
              </div>
              <span className="text-[12px] font-semibold text-slate-700">{r.customer}</span>
              <StarRating rating={r.rating} />
              <span className="ml-auto text-[10px] text-slate-400 shrink-0">{r.time}</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mb-0.5">{r.product}</p>
            <p className="text-[12px] text-slate-500 leading-snug line-clamp-2">{r.comment}</p>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 px-5 py-3">
        <Link href="/ecommerce/resenas" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">
          <MessageSquare className="h-3 w-3" /> Ver todas las reseñas
        </Link>
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────────

/**
 * Representa una alerta operativa del canal e-commerce.
 *
 * @property message Descripción resumida de la alerta.
 * @property severity Nivel de severidad de la alerta.
 *
 * @remarks
 * Este tipo modela eventos o señales operativas que requieren atención
 * dentro del canal digital, como problemas de stock, abandono,
 * latencia o reseñas pendientes.
 */
type EAlert = {
  message: string;
  severity: "high" | "medium" | "low";
};

/**
 * Dataset estático de alertas del canal e-commerce.
 *
 * @remarks
 * Este arreglo agrupa alertas representativas de la operación digital,
 * utilizadas para poblar la tarjeta lateral de alertas.
 *
 * Incluye escenarios como:
 * - productos sin stock
 * - subida de abandono
 * - problemas de pasarela
 * - stock bajo
 * - cupones próximos al límite
 * - reseñas negativas sin respuesta
 */
const ALERTS: EAlert[] = [
  { message: "12 productos sin stock con tráfico activo",      severity: "high"   },
  { message: "Tasa de abandono subió 3pts esta semana",        severity: "high"   },
  { message: "Pasarela de pago con latencia elevada",          severity: "high"   },
  { message: "38 productos con stock bajo (<10 uds.)",         severity: "medium" },
  { message: "Cupón PROMO10 al 90% del límite de uso",         severity: "medium" },
  { message: "3 reseñas negativas sin responder (+24h)",       severity: "medium" },
];

/**
 * Configuración visual asociada a cada nivel de severidad.
 *
 * @remarks
 * Este objeto centraliza la semántica visual de las alertas,
 * definiendo para cada nivel:
 * - color del punto indicador
 * - estilo del badge
 * - color del texto
 * - etiqueta visible
 */
const SEV = {
  high:   { dot: "bg-rose-400",  badge: "bg-rose-50 border-rose-100",   text: "text-rose-600",   label: "Alta"  },
  medium: { dot: "bg-amber-400", badge: "bg-amber-50 border-amber-100", text: "text-amber-600",  label: "Media" },
  low:    { dot: "bg-slate-300", badge: "bg-slate-50 border-slate-200", text: "text-slate-500",  label: "Baja"  },
};

/**
 * Tarjeta de alertas operativas del canal e-commerce.
 *
 * @returns Un componente visual con alertas resumidas del canal online.
 *
 * @remarks
 * Este componente presenta una lista compacta de alertas relevantes
 * para la operación del e-commerce.
 *
 * Calcula además el número de alertas de severidad alta (`highCount`)
 * para destacarlas en el encabezado del panel.
 *
 * Esta tarjeta resulta útil para:
 * - visibilidad operativa rápida
 * - seguimiento de riesgos del canal digital
 * - detección temprana de fricción en conversión o inventario
 *
 * @example
 * ```tsx
 * <EcommerceAlertsCard />
 * ```
 */
export function EcommerceAlertsCard() {
  const highCount = ALERTS.filter((a) => a.severity === "high").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Bell className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Alertas</h3>
        </div>
        {highCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
            {highCount} urgentes
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50">
        {ALERTS.map((a, i) => {
          const cfg = SEV[a.severity];
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
              <span className="flex-1 text-[12px] text-slate-700 leading-snug">{a.message}</span>
              <span className={`shrink-0 rounded-full border px-2 py-px text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}