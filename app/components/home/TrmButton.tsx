/**
 * @module TrmButton
 * Botón del home que abre un panel con la TRM (tasa de cambio) por divisa.
 *
 * @remarks
 * Puramente visual por ahora: los valores mostrados son mockup, no hay
 * ninguna llamada a un servicio de tasas de cambio. Reutiliza {@link Modal}
 * y el mismo patrón de tarjeta usado en `DepartmentKPIStrip`/`FinanceKPIStrip`
 * para mantener consistencia visual con el resto de la plataforma.
 */

"use client";

import { useState,} from "react";
import { Landmark,} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { useTRMActions } from "@/app/hooks/useTRMActions";
import React from "react";


/**
 * Botón "TRM" del hero del home: abre un modal con 3 tarjetas mockup
 * (USD, EUR, GBP).
 */
export function TrmButton() {
  const [open, setOpen] = useState(false);
  const {concurrences, buildConcurrencesArray} = useTRMActions();

  React.useEffect(() => {
    // Fetch USD concurrences when the component mounts
    buildConcurrencesArray();
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20"
      >
        <Landmark className="h-4 w-4" />
        TRM
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`TRM (${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })})`}
        subtitle=""
        size="4xl"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {concurrences.map((currency) => (
            <div
              key={currency.code}
              className={`flex flex-col gap-3 rounded-xl border border-l-4 ${currency.borderColor} border-slate-200 bg-white p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${currency.iconBg}`}
                  >
                    <currency.icon className={`h-4 w-4 ${currency.iconColor}`} />
                  </span>
                  <p className="text-[11px] font-semibold leading-tight text-slate-500">
                    {currency.name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xl font-bold leading-none text-slate-800">
                  {currency.value}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <p
                    className={`text-[11px] font-semibold leading-tight ${
                      currency.trend === "up"
                        ? "text-emerald-600"
                        : currency.trend === "down"
                          ? "text-rose-600"
                          : "text-slate-400"
                    }`}
                  >
                    {currency.changeValue} hoy
                  </p>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                      currency.trend === "up"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/[0.12] dark:text-emerald-400"
                        : currency.trend === "down"
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-500/[0.12] dark:text-rose-400"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currency.trend === "up" ? "▲ " : currency.trend === "down" ? "▼ " : "— "}
                    {currency.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
