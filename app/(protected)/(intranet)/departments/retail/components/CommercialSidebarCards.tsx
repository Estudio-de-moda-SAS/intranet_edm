/**
 * @module CommercialSidebarCards
 * Tarjetas laterales del canal Comercial dentro del módulo de Retail.
 *
 * @remarks
 * Este archivo agrupa componentes secundarios de apoyo para la vista
 * del canal comercial, orientados al seguimiento rápido de:
 * - alertas operativas o de riesgo comercial
 * - metas mensuales del equipo
 *
 * Actualmente incluye:
 * - {@link CommercialAlertsCard}: lista de alertas relevantes del frente comercial
 * - {@link CommercialGoalsCard}: seguimiento visual del avance de metas mensuales
 *
 * Estos componentes están pensados para mostrarse en la columna lateral
 * del dashboard comercial, ofreciendo visibilidad inmediata sobre:
 * - pendientes críticos
 * - riesgos de seguimiento
 * - vencimientos próximos
 * - progreso frente a objetivos clave
 *
 * La información mostrada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - CRM comercial
 * - sistemas de pedidos B2B
 * - tableros de metas
 * - herramientas de seguimiento de cuentas y oportunidades
 */

import { Bell, Target, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

// ── Alerts ────────────────────────────────────────────────────────

/**
 * Representa una alerta del canal comercial.
 *
 * @property message Descripción resumida de la alerta.
 * @property severity Nivel de severidad asociado a la alerta.
 *
 * @remarks
 * Este tipo modela eventos o situaciones que requieren atención
 * dentro del frente comercial, como:
 * - pedidos sin confirmar
 * - oportunidades próximas a vencer
 * - cuentas sin seguimiento
 * - desviaciones frente a metas
 */
type Alert = {
  message: string;
  severity: "high" | "medium" | "low";
};

/**
 * Dataset estático de alertas comerciales.
 *
 * @remarks
 * Este arreglo contiene ejemplos representativos de alertas relevantes
 * para el equipo comercial.
 *
 * Incluye distintos escenarios operativos, como:
 * - retrasos en confirmación de pedidos
 * - clientes sin contacto reciente
 * - metas próximas a cierre
 * - propuestas con vencimiento cercano
 */
const ALERTS: Alert[] = [
  { message: "3 pedidos sin confirmar hace +48h",      severity: "high"   },
  { message: "Meta mensual al 87% — faltan 5 días",    severity: "medium" },
  { message: "Cliente Arturo Calle sin contacto 15d",  severity: "high"   },
  { message: "Stock bajo en 4 referencias clave",      severity: "medium" },
  { message: "Propuesta OC-2024-0830 vence mañana",    severity: "medium" },
];

/**
 * Configuración visual asociada a cada nivel de severidad.
 *
 * @remarks
 * Este objeto centraliza la representación visual de las alertas
 * según su severidad.
 *
 * Para cada nivel se define:
 * - color del punto indicador
 * - estilo del badge
 * - color de texto
 * - etiqueta visible
 *
 * Esto permite mantener consistencia visual entre estados
 * y simplifica el renderizado del listado.
 */
const SEV = {
  high:   { dot: "bg-rose-400",   badge: "bg-rose-50 border-rose-100",   text: "text-rose-600",  label: "Alta"  },
  medium: { dot: "bg-amber-400",  badge: "bg-amber-50 border-amber-100", text: "text-amber-600", label: "Media" },
  low:    { dot: "bg-slate-300",  badge: "bg-slate-50 border-slate-100", text: "text-slate-500", label: "Baja"  },
};

/**
 * Tarjeta de alertas del canal comercial.
 *
 * @returns Un componente visual con alertas relevantes del frente comercial.
 *
 * @remarks
 * Este componente presenta una lista compacta de alertas operativas
 * o estratégicas asociadas al canal comercial.
 *
 * Calcula además el número de alertas de severidad alta (`highCount`)
 * para destacarlas en el encabezado del panel.
 *
 * La tarjeta resulta útil para:
 * - priorización de pendientes críticos
 * - seguimiento de oportunidades sensibles al tiempo
 * - detección temprana de riesgos de gestión comercial
 *
 * @example
 * ```tsx
 * <CommercialAlertsCard />
 * ```
 */
export function CommercialAlertsCard() {
  const highCount = ALERTS.filter((a) => a.severity === "high").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Bell className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Alertas Comerciales</h3>
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

// ── Goals ─────────────────────────────────────────────────────────

/**
 * Representa una meta mensual del canal comercial.
 *
 * @property label Nombre o descripción de la meta.
 * @property current Valor actual alcanzado.
 * @property target Valor objetivo esperado.
 * @property unit Unidad visual o semántica de la métrica.
 * @property color Clase visual aplicada a la barra de progreso.
 *
 * @remarks
 * Este tipo modela objetivos clave del frente comercial,
 * permitiendo comparar avance actual frente a meta.
 */
type Goal = {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
};

/**
 * Dataset estático de metas mensuales del frente comercial.
 *
 * @remarks
 * Este arreglo define los principales objetivos visibles en la tarjeta
 * de metas del mes.
 *
 * Incluye métricas representativas como:
 * - ventas mensuales
 * - adquisición de nuevos clientes
 * - tasa de cierre
 * - NPS
 */
const GOALS: Goal[] = [
  { label: "Ventas mensuales", current: 348, target: 400, unit: "k", color: "bg-emerald-500" },
  { label: "Nuevos clientes",  current: 28,  target: 40,  unit: "",  color: "bg-violet-500"  },
  { label: "Tasa de cierre",   current: 34,  target: 40,  unit: "%", color: "bg-sky-500"     },
  { label: "NPS",              current: 72,  target: 80,  unit: "",  color: "bg-amber-500"   },
];

/**
 * Tarjeta de seguimiento de metas mensuales del canal comercial.
 *
 * @returns Un componente visual con barras de avance por objetivo comercial.
 *
 * @remarks
 * Este componente presenta una vista compacta del progreso
 * frente a metas estratégicas del mes.
 *
 * Para cada meta se calcula el porcentaje de avance (`pct`)
 * a partir de la relación `current / target`, y se representa:
 * - valor actual
 * - valor objetivo
 * - barra de progreso
 * - porcentaje de cumplimiento
 * - valor faltante para alcanzar la meta
 *
 * La tarjeta resulta útil para:
 * - seguimiento ejecutivo de desempeño comercial
 * - revisión rápida de cumplimiento
 * - identificación de objetivos rezagados
 *
 * @example
 * ```tsx
 * <CommercialGoalsCard />
 * ```
 */
export function CommercialGoalsCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Metas del Mes</h3>
        </div>
        <Link href="/comercial/metas" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-600 transition-colors">
          Detalle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {GOALS.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);

          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-slate-700">{g.label}</span>
                <span className="text-[12px] font-bold text-slate-800 tabular-nums">
                  {g.current}{g.unit} <span className="font-normal text-slate-400">/ {g.target}{g.unit}</span>
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${g.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>

              <div className="mt-0.5 flex items-center justify-between">
                <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${pct >= 90 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-rose-500"}`}>
                  <TrendingUp className="h-2.5 w-2.5" />{pct}%
                </span>
                <span className="text-[10px] text-slate-400">Falta: {g.target - g.current}{g.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}