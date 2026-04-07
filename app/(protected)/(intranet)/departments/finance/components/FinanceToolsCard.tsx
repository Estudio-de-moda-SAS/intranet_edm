"use client";

import { useState } from "react";
import {
  Calculator, FileText, TrendingUp, Wrench,
  ChevronUp, ChevronDown, Download, RefreshCw,
} from "lucide-react";

type Tool = "calculator" | "projection" | "report";
type ToolConfig = { id: Tool; label: string; icon: React.ElementType; title: string; description: string };

const TOOLS: ToolConfig[] = [
  { id: "calculator", label: "Cálculo",    icon: Calculator, title: "Calculadora financiera",  description: "Cálculos rápidos de presupuesto y costos." },
  { id: "projection", label: "Proyección", icon: TrendingUp, title: "Proyección financiera",   description: "Estima ingresos y gastos futuros."          },
  { id: "report",     label: "Reporte",    icon: FileText,   title: "Generador de reportes",   description: "Reportes financieros exportables."          },
];

function CollapsePanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden transition-all duration-300 ease-in-out"
         style={{ maxHeight: open ? "700px" : "0px", opacity: open ? 1 : 0 }}>
      {children}
    </div>
  );
}

// ── Calculator ────────────────────────────────────────────────────────────────
function InlineCalculator() {
  const [display,     setDisplay]     = useState("0");
  const [prevValue,   setPrevValue]   = useState<number | null>(null);
  const [operator,    setOperator]    = useState<string | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [expression,  setExpression]  = useState("");

  const inputDigit  = (d: string) => { if (waitingNext) { setDisplay(d); setWaitingNext(false); } else setDisplay(display === "0" ? d : display + d); };
  const inputDecimal = () => { if (waitingNext) { setDisplay("0."); setWaitingNext(false); return; } if (!display.includes(".")) setDisplay(display + "."); };
  const calcOp = (a: number, b: number, op: string) => op === "+" ? a+b : op === "−" ? a-b : op === "×" ? a*b : op === "÷" ? (b !== 0 ? a/b : 0) : b;
  const fmt = (n: number) => Number.isInteger(n) ? n.toLocaleString("es-CO") : parseFloat(n.toFixed(6)).toLocaleString("es-CO");

  const handleOp = (op: string) => {
    const cur = parseFloat(display);
    if (prevValue !== null && !waitingNext) {
      const res = calcOp(prevValue, cur, operator!);
      setDisplay(fmt(res)); setPrevValue(res); setExpression(`${fmt(res)} ${op}`);
    } else { setPrevValue(cur); setExpression(`${display} ${op}`); }
    setOperator(op); setWaitingNext(true);
  };
  const equals = () => {
    if (prevValue === null || !operator) return;
    const res = calcOp(prevValue, parseFloat(display), operator);
    setExpression(`${expression} ${display} =`);
    setDisplay(fmt(res)); setPrevValue(null); setOperator(null); setWaitingNext(true);
  };
  const clear = () => { setDisplay("0"); setPrevValue(null); setOperator(null); setWaitingNext(false); setExpression(""); };

  type V = "fn" | "op" | "digit" | "eq";
  const vs: Record<V, string> = {
    fn:    "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:text-[#adbac7]",
    op:    "bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold dark:bg-violet-500/[0.15] dark:hover:bg-violet-500/[0.25] dark:text-violet-400",
    digit: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 dark:bg-[#1c2128] dark:hover:bg-[#21262d] dark:text-[#e6edf3] dark:border-[#30363d]",
    eq:    "bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600/80 dark:hover:bg-violet-600",
  };
  const Btn = ({ l, v, fn, wide }: { l: string; v: V; fn: () => void; wide?: boolean }) => (
    <button onClick={fn} className={`${vs[v]} ${wide ? "col-span-2" : ""} h-10 rounded-lg text-[13px] font-semibold transition-all active:scale-95`}>{l}</button>
  );

  return (
    <div className="px-3.5 pb-3.5 pt-2">
      <div className="rounded-lg px-3 py-2.5 mb-2.5
                      bg-slate-900 dark:bg-[#0d1117]">
        <p className="text-right text-[9.5px] h-3.5 truncate text-slate-500 dark:text-[#444c56]">{expression || "\u00A0"}</p>
        <p className="text-right text-[22px] font-bold tracking-tight truncate leading-tight text-white dark:text-[#e6edf3]">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <Btn l="AC"  v="fn"    fn={clear} />
        <Btn l="+/−" v="fn"    fn={() => setDisplay((parseFloat(display) * -1).toString())} />
        <Btn l="%"   v="fn"    fn={() => setDisplay((parseFloat(display) / 100).toString())} />
        <Btn l="÷"   v="op"    fn={() => handleOp("÷")} />
        {["7","8","9"].map(d => <Btn key={d} l={d} v="digit" fn={() => inputDigit(d)} />)}
        <Btn l="×" v="op" fn={() => handleOp("×")} />
        {["4","5","6"].map(d => <Btn key={d} l={d} v="digit" fn={() => inputDigit(d)} />)}
        <Btn l="−" v="op" fn={() => handleOp("−")} />
        {["1","2","3"].map(d => <Btn key={d} l={d} v="digit" fn={() => inputDigit(d)} />)}
        <Btn l="+" v="op" fn={() => handleOp("+")} />
        <Btn l="0" v="digit" fn={() => inputDigit("0")} wide />
        <Btn l="." v="digit" fn={inputDecimal} />
        <Btn l="=" v="eq"    fn={equals} />
      </div>
    </div>
  );
}

// ── Projection ────────────────────────────────────────────────────────────────
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function InlineProjection() {
  const [income,  setIncome]  = useState("50000000");
  const [expense, setExpense] = useState("35000000");
  const [growth,  setGrowth]  = useState("5");
  const [n,       setN]       = useState("4");

  const months = Math.min(Math.max(parseInt(n) || 1, 1), 6);
  const inc0   = parseFloat(income)  || 0;
  const exp0   = parseFloat(expense) || 0;
  const gr     = (parseFloat(growth) || 0) / 100;

  const rows = Array.from({ length: months }, (_, i) => {
    const inc = inc0 * Math.pow(1 + gr, i + 1);
    const exp = exp0 * Math.pow(1 + gr * 0.6, i + 1);
    return { month: MONTHS[(new Date().getMonth() + i) % 12]!, inc, exp, util: inc - exp };
  });
  const maxVal   = Math.max(...rows.map(r => r.inc), 1);
  const fmtCOP   = (v: number) => new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  const inputCls = "w-full rounded-lg border px-2.5 py-1.5 text-[12px] outline-none transition-colors focus:ring-2 focus:ring-violet-400 border-slate-200 bg-slate-50 text-slate-800 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5]";

  return (
    <div className="px-3.5 pb-3.5 pt-2 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Ingreso base (COP)", val: income,  set: setIncome  },
          { label: "Gasto base (COP)",   val: expense, set: setExpense },
          { label: "Crecimiento %",      val: growth,  set: setGrowth  },
          { label: "Meses (máx. 6)",     val: n,       set: setN       },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">{label}</p>
            <input type="number" value={val} onChange={e => set(e.target.value)} className={inputCls} />
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="rounded-lg border p-3
                      border-slate-200 bg-slate-50
                      dark:border-[#30363d] dark:bg-[#1c2128]">
        <p className="text-[9.5px] font-semibold uppercase tracking-wide mb-2
                      text-slate-400 dark:text-[#545d68]">Ingresos vs Gastos</p>
        <div className="flex items-end gap-1 h-16">
          {rows.map((r, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "52px" }}>
                <div className="w-full rounded-sm bg-violet-500" style={{ height: `${(r.inc / maxVal) * 44}px`, minHeight: "2px" }} />
                <div className="w-full rounded-sm bg-rose-400" style={{ height: `${(r.exp / maxVal) * 44}px`, minHeight: "2px" }} />
              </div>
              <span className="text-[8.5px] text-slate-400 dark:text-[#545d68]">{r.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[9.5px] text-slate-400 dark:text-[#545d68]"><span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" />Ingresos</span>
          <span className="flex items-center gap-1 text-[9.5px] text-slate-400 dark:text-[#545d68]"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />Gastos</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden
                      border-slate-200 dark:border-[#30363d]">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50
                           dark:border-[#30363d] dark:bg-[#1c2128]">
              {["Mes","Ingresos","Gastos","Utilidad"].map(h => (
                <th key={h} className="px-2 py-1.5 text-left text-[10px] font-semibold
                                       text-slate-400 dark:text-[#545d68]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0
                                     dark:border-[#21262d]">
                <td className="px-2 py-1.5 font-medium text-slate-600 dark:text-[#adbac7]">{r.month}</td>
                <td className="px-2 py-1.5 text-emerald-600 dark:text-emerald-400">${fmtCOP(r.inc)}</td>
                <td className="px-2 py-1.5 text-rose-500 dark:text-rose-400">${fmtCOP(r.exp)}</td>
                <td className={`px-2 py-1.5 font-semibold ${r.util >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-600 dark:text-red-400"}`}>${fmtCOP(r.util)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Report generator ──────────────────────────────────────────────────────────
const SECTIONS_CFG = [
  { id: "summary",  label: "Resumen ejecutivo",  on: true  },
  { id: "income",   label: "Estado de ingresos", on: true  },
  { id: "expenses", label: "Análisis de gastos", on: true  },
  { id: "cashflow", label: "Flujo de caja",       on: false },
  { id: "kpis",     label: "KPIs financieros",    on: true  },
  { id: "forecast", label: "Proyección próxima",  on: false },
];

function InlineReport() {
  const [period,   setPeriod]   = useState("Q1 2025");
  const [format,   setFormat]   = useState<"pdf"|"excel"|"csv">("pdf");
  const [sections, setSections] = useState<Record<string, boolean>>(Object.fromEntries(SECTIONS_CFG.map(s => [s.id, s.on])));
  const [state,    setState]    = useState<"idle"|"loading"|"done">("idle");

  const toggle = (id: string) => setSections(p => ({ ...p, [id]: !p[id] }));
  const count  = Object.values(sections).filter(Boolean).length;
  const generate = () => { setState("loading"); setTimeout(() => setState("done"), 1600); };

  const selectCls = "w-full rounded-lg border px-2.5 py-1.5 text-[12px] outline-none transition-colors focus:ring-2 focus:ring-violet-400 border-slate-200 bg-slate-50 text-slate-800 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5]";

  if (state === "done") return (
    <div className="px-3.5 pb-3.5 pt-2">
      <div className="rounded-lg border p-4 text-center
                      border-emerald-200 bg-emerald-50
                      dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]">
        <div className="flex justify-center mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full
                           bg-emerald-100 dark:bg-emerald-500/[0.15]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </div>
        <p className="text-[13px] font-semibold mb-0.5 text-slate-800 dark:text-[#e6edf3]">Reporte listo</p>
        <p className="text-[11px] mb-3 text-slate-500 dark:text-[#768390]">{period} · {count} secciones · {format.toUpperCase()}</p>
        <div className="flex gap-2">
          <button onClick={() => setState("idle")}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-[11.5px] font-semibold transition-colors
                             border-slate-200 bg-white text-slate-600 hover:bg-slate-50
                             dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7] dark:hover:bg-[#21262d]">
            <RefreshCw className="h-3 w-3" />Nuevo
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11.5px] font-semibold transition-colors
                             bg-violet-600 text-white hover:bg-violet-700">
            <Download className="h-3 w-3" />Descargar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-3.5 pb-3.5 pt-2 space-y-3">
      <div>
        <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">Período</p>
        <select value={period} onChange={e => setPeriod(e.target.value)} className={selectCls}>
          {["Q1 2025","Q2 2025","Q3 2025","Q4 2024","Anual 2024"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-slate-400 dark:text-[#545d68]">Secciones</p>
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">{count} sel.</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {SECTIONS_CFG.map(s => (
            <button key={s.id} onClick={() => toggle(s.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-left transition-all ${
                sections[s.id]
                  ? "bg-violet-50 border border-violet-200 text-violet-700 dark:bg-violet-500/[0.10] dark:border-violet-500/25 dark:text-violet-400"
                  : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-[#444c56]"
              }`}>
              <span className={`flex-shrink-0 h-3 w-3 rounded border flex items-center justify-center ${
                sections[s.id] ? "bg-violet-600 border-violet-600" : "border-slate-300 dark:border-[#444c56]"
              }`}>
                {sections[s.id] && (
                  <svg viewBox="0 0 12 12" className="h-2 w-2">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">Formato</p>
        <div className="flex gap-1.5">
          {(["pdf","excel","csv"] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`flex-1 rounded-lg py-1.5 text-[11.5px] font-semibold transition-all ${
                format === f
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-[#21262d] dark:text-[#545d68] dark:hover:bg-[#30363d] dark:hover:text-[#adbac7]"
              }`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={state === "loading" || count === 0}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all
                   bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
        {state === "loading"
          ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Generando…</>
          : <><FileText className="h-3.5 w-3.5" />Generar reporte</>
        }
      </button>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function FinanceToolsCard() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const toggle = (id: Tool) => setActiveTool(prev => (prev === id ? null : id));

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]">

      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-[14px]
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Wrench className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e6edf3]">
            Herramientas Financieras
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide
                         bg-violet-50 border-violet-100 text-violet-600
                         dark:bg-violet-500/[0.12] dark:border-violet-500/20 dark:text-violet-400">
          3 disponibles
        </span>
      </div>

      {/* Tool rows */}
      <div className="divide-y divide-slate-100 dark:divide-[#21262d]">
        {TOOLS.map((tool) => {
          const isOpen = activeTool === tool.id;
          return (
            <div key={tool.id}>
              <button
                onClick={() => toggle(tool.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isOpen
                    ? "bg-violet-50/70 dark:bg-violet-500/[0.06]"
                    : "hover:bg-slate-50 dark:hover:bg-[#1c2128]"
                }`}
              >
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isOpen
                    ? "bg-violet-100 dark:bg-violet-500/[0.15]"
                    : "bg-slate-100 dark:bg-[#21262d]"
                }`}>
                  <tool.icon className={`h-3.5 w-3.5 transition-colors ${
                    isOpen ? "text-violet-600 dark:text-violet-400" : "text-slate-500 dark:text-[#768390]"
                  }`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12.5px] font-semibold leading-tight ${
                    isOpen ? "text-violet-700 dark:text-violet-400" : "text-slate-700 dark:text-[#cdd9e5]"
                  }`}>
                    {tool.title}
                  </p>
                  <p className="text-[11px] truncate mt-0.5 text-slate-400 dark:text-[#545d68]">
                    {tool.description}
                  </p>
                </div>
                {isOpen
                  ? <ChevronUp   className="h-3.5 w-3.5 flex-shrink-0 text-violet-400 dark:text-violet-500" />
                  : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-[#545d68]" />
                }
              </button>

              <CollapsePanel open={isOpen}>
                <div className="border-t border-violet-100 bg-white
                                dark:border-violet-500/15 dark:bg-[#161b22]">
                  {tool.id === "calculator" && <InlineCalculator />}
                  {tool.id === "projection" && <InlineProjection />}
                  {tool.id === "report"     && <InlineReport />}
                </div>
              </CollapsePanel>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 px-4 py-2.5
                      border-t border-slate-100 dark:border-[#21262d]">
        <span className="h-1.5 w-1.5 rounded-full inline-block bg-violet-300 dark:bg-violet-500/50" />
        <span className="text-[10.5px] text-slate-400 dark:text-[#545d68]">
          {activeTool
            ? `${TOOLS.find(t => t.id === activeTool)?.title} activa`
            : "Selecciona una herramienta"}
        </span>
      </div>
    </div>
  );
}
