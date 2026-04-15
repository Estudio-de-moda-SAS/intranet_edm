/**
 * @module ProductMetricsCard
 * Tarjeta de métricas clave del módulo de Producto.
 *
 * @remarks
 * Este componente renderiza un bloque visual con indicadores resumidos
 * de adopción y engagement del producto durante un periodo reciente.
 *
 * Su objetivo es ofrecer una lectura rápida del desempeño del área
 * a través de métricas estratégicas relacionadas con:
 * - retención de usuarios
 * - tiempo hasta obtención de valor
 * - adopción de funcionalidades
 * - churn mensual
 *
 * La información mostrada es estática y actúa como mock dentro de la intranet.
 * En una implementación productiva, estos datos podrían provenir de:
 * - herramientas de analítica de producto
 * - plataformas de eventos
 * - dashboards de negocio
 * - servicios internos de reporting
 */

// app/product/components/ProductMetricsCard.tsx
// CLIENT COMPONENT — Métricas de adopción y engagement
"use client";

import { BarChart2 } from "lucide-react";

/**
 * Representa una métrica resumida del área de Producto.
 *
 * @remarks
 * Este tipo modela la información mínima necesaria para renderizar
 * una tarjeta de métrica dentro del panel de indicadores del módulo.
 *
 * Cada métrica incluye:
 * - una etiqueta descriptiva
 * - el valor principal visible
 * - un texto de contexto o variación comparativa
 * - un porcentaje de llenado visual
 * - una clase de color para la barra de progreso
 *
 * El campo `fill` no necesariamente representa el valor exacto mostrado
 * en `value`, sino una referencia visual utilizada para la barra inferior.
 *
 * @property label Nombre corto de la métrica.
 * @property value Valor principal mostrado al usuario.
 * @property subtext Texto complementario de contexto, comparación o meta.
 * @property fill Porcentaje de llenado de la barra visual.
 * @property color Clase utilitaria para el color de la barra.
 */
type Metric = {
  label:    string;
  value:    string;
  subtext:  string;
  fill:     number; // % for spark bar
  color:    string;
};

/**
 * Dataset estático de métricas del módulo de Producto.
 *
 * @remarks
 * Este arreglo contiene indicadores mock utilizados para poblar
 * la tarjeta de métricas del dashboard.
 *
 * Las métricas incluidas representan dimensiones frecuentes
 * en analítica de producto, tales como:
 * - retención
 * - adopción
 * - tiempo hasta valor
 * - churn
 *
 * Cada elemento se renderiza como una subtarjeta con:
 * - encabezado
 * - valor principal
 * - subtexto contextual
 * - barra de representación visual
 */
const METRICS: Metric[] = [
  { label: "Retención D30",      value: "58%",     subtext: "+3 pp MoM",      fill: 58, color: "bg-sky-400"     },
  { label: "Time to value",      value: "4.2 min", subtext: "−0.8 min MoM",   fill: 72, color: "bg-indigo-400"  },
  { label: "Feature adoption",   value: "41%",     subtext: "top 5 features", fill: 41, color: "bg-violet-400"  },
  { label: "Churn mensual",      value: "1.8%",    subtext: "objetivo < 2%",  fill: 82, color: "bg-emerald-400" },
];

/**
 * Tarjeta de métricas estratégicas del área de Producto.
 *
 * @returns Un componente visual con métricas resumidas de adopción y engagement.
 *
 * @remarks
 * Este componente presenta un conjunto de indicadores compactos
 * orientados a la lectura ejecutiva del desempeño del producto.
 *
 * Cada métrica se muestra como una tarjeta secundaria con:
 * - nombre abreviado
 * - valor principal destacado
 * - contexto comparativo o meta
 * - barra inferior de apoyo visual
 *
 * La tarjeta está pensada para ofrecer una lectura rápida
 * y facilitar el monitoreo de señales clave de negocio o producto
 * en un periodo reciente.
 *
 * El componente resulta útil para:
 * - dashboards ejecutivos
 * - resúmenes de performance del producto
 * - paneles de seguimiento de engagement
 * - vistas operativas de analítica de producto
 *
 * @example
 * ```tsx
 * <ProductMetricsCard />
 * ```
 */
export default function ProductMetricsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
          <BarChart2 className="h-3.5 w-3.5 text-indigo-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Métricas de producto</h2>
          <p className="text-[11px] text-slate-400">Adopción y engagement · últimos 30 días</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
          >
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">
              {m.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 leading-none">{m.value}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{m.subtext}</p>
            <div className="mt-2 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color}`}
                style={{ width: `${m.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}