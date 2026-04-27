/**
 * @module FinanceToolsCard
 * Tarjeta interactiva de herramientas del módulo financiero.
 *
 * @remarks
 * Este archivo define un conjunto de utilidades visuales e interactivas
 * orientadas al dominio financiero, agrupadas dentro de una única tarjeta:
 *
 * - calculadora financiera básica
 * - proyección simple de ingresos, gastos y utilidad
 * - generador simulado de reportes financieros
 *
 * El componente principal actúa como contenedor de experiencia y controla
 * qué herramienta se encuentra activa o expandida en cada momento.
 *
 * Además, el archivo incluye:
 *
 * - tipos de dominio para herramientas, operadores y formatos
 * - configuraciones estáticas para herramientas y secciones
 * - componentes auxiliares internos para colapso y renderizado parcial
 *
 * Aunque actualmente todo se mantiene en un solo archivo por simplicidad,
 * su estructura ya separa responsabilidades de forma interna para facilitar
 * una futura extracción hacia componentes más pequeños y escalables.
 */

"use client";

import { useState } from "react";
import {
  Calculator,
  FileText,
  TrendingUp,
  Wrench,
  ChevronUp,
  ChevronDown,
  Download,
  RefreshCw,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos y contratos                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Identificadores de herramientas disponibles dentro de la tarjeta financiera.
 *
 * @remarks
 * Este tipo controla:
 *
 * - la configuración del catálogo de herramientas
 * - el estado de la herramienta activa
 * - el renderizado condicional de cada panel expandible
 */
type Tool = "calculator" | "projection" | "report";

/**
 * Operadores soportados por la calculadora financiera.
 *
 * @remarks
 * Se restringe a un conjunto cerrado de símbolos para mejorar
 * la seguridad de tipos y evitar valores arbitrarios.
 */
type CalculatorOperator = "+" | "−" | "×" | "÷";

/**
 * Variantes visuales disponibles para los botones de la calculadora.
 *
 * @remarks
 * Cada variante representa un grupo funcional distinto:
 *
 * - `fn`: acciones auxiliares
 * - `op`: operadores matemáticos
 * - `digit`: entrada numérica
 * - `eq`: acción principal de resultado
 */
type CalculatorButtonVariant = "fn" | "op" | "digit" | "eq";

/**
 * Formatos de salida soportados por el generador de reportes.
 *
 * @remarks
 * Actualmente se usan como selección visual de mock UI,
 * aunque en una futura integración podrían enlazarse con
 * lógica real de exportación.
 */
type ReportFormat = "pdf" | "excel" | "csv";

/**
 * Estados de flujo del generador de reportes.
 *
 * @remarks
 * Modela el ciclo de vida simplificado del proceso:
 *
 * - reposo inicial
 * - carga / generación
 * - resultado listo
 */
type ReportState = "idle" | "loading" | "done";

/**
 * Identificadores posibles de las secciones del reporte financiero.
 *
 * @remarks
 * Se usa para tipar de forma estricta la estructura de selección
 * de secciones y evitar claves arbitrarias.
 */
type ReportSectionId =
  | "summary"
  | "income"
  | "expenses"
  | "cashflow"
  | "kpis"
  | "forecast";

/**
 * Estructura de configuración para una herramienta financiera.
 *
 * @property id Identificador único de la herramienta.
 * @property label Etiqueta corta de referencia.
 * @property icon Ícono representativo de la herramienta.
 * @property title Título descriptivo mostrado al usuario.
 * @property description Resumen breve de la funcionalidad.
 */
type ToolConfig = {
  id: Tool;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
};

/**
 * Propiedades del panel colapsable.
 *
 * @property open Determina si el contenido debe mostrarse expandido.
 * @property children Contenido interno que será renderizado en el panel.
 */
type CollapsePanelProps = {
  open: boolean;
  children: React.ReactNode;
};

/**
 * Propiedades del botón reutilizable de la calculadora.
 *
 * @property label Texto visible del botón.
 * @property variant Variante visual del botón.
 * @property onClick Acción ejecutada al hacer clic.
 * @property wide Indica si el botón ocupa dos columnas del grid.
 */
type CalculatorButtonProps = {
  label: string;
  variant: CalculatorButtonVariant;
  onClick: () => void;
  wide?: boolean;
};

/**
 * Estructura de una fila proyectada en la herramienta de simulación financiera.
 *
 * @property month Mes abreviado asociado a la fila.
 * @property inc Ingresos proyectados para el mes.
 * @property exp Gastos proyectados para el mes.
 * @property util Utilidad estimada, calculada como ingreso menos gasto.
 */
type ProjectionRow = {
  month: string;
  inc: number;
  exp: number;
  util: number;
};

/**
 * Estructura de configuración de una sección del reporte financiero.
 *
 * @property id Identificador único de la sección.
 * @property label Nombre visible de la sección.
 * @property on Estado inicial de activación.
 */
type ReportSectionConfig = {
  id: ReportSectionId;
  label: string;
  on: boolean;
};

/* -------------------------------------------------------------------------- */
/* Configuración general                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Catálogo de herramientas financieras disponibles en la tarjeta.
 *
 * @remarks
 * Esta configuración centraliza la metadata visual y funcional de cada
 * herramienta, permitiendo renderizar filas de manera declarativa.
 */
const TOOLS: ToolConfig[] = [
  {
    id: "calculator",
    label: "Cálculo",
    icon: Calculator,
    title: "Calculadora financiera",
    description: "Cálculos rápidos de presupuesto y costos.",
  },
  {
    id: "projection",
    label: "Proyección",
    icon: TrendingUp,
    title: "Proyección financiera",
    description: "Estima ingresos y gastos futuros.",
  },
  {
    id: "report",
    label: "Reporte",
    icon: FileText,
    title: "Generador de reportes",
    description: "Reportes financieros exportables.",
  },
];

/**
 * Abreviaturas mensuales utilizadas para la proyección financiera.
 *
 * @remarks
 * Estas etiquetas se usan en:
 *
 * - el gráfico comparativo
 * - la tabla de resultados
 */
const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Configuración base de secciones disponibles para el generador de reportes.
 *
 * @remarks
 * Define el conjunto de bloques que el usuario puede activar o desactivar
 * antes de simular la exportación del reporte.
 */
const SECTIONS_CFG: ReportSectionConfig[] = [
  { id: "summary", label: "Resumen ejecutivo", on: true },
  { id: "income", label: "Estado de ingresos", on: true },
  { id: "expenses", label: "Análisis de gastos", on: true },
  { id: "cashflow", label: "Flujo de caja", on: false },
  { id: "kpis", label: "KPIs financieros", on: true },
  { id: "forecast", label: "Proyección próxima", on: false },
];

/* -------------------------------------------------------------------------- */
/* Utilidades internas                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Ejecuta una operación aritmética básica entre dos operandos.
 *
 * @param a Primer operando.
 * @param b Segundo operando.
 * @param op Operador matemático a aplicar.
 *
 * @returns El resultado numérico de la operación.
 *
 * @remarks
 * En caso de división por cero, la función retorna `0` como valor
 * de seguridad para evitar estados inválidos en la interfaz.
 */
function calculateOperation(
  a: number,
  b: number,
  op: CalculatorOperator
): number {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b !== 0 ? a / b : 0;
    default:
      return b;
  }
}

/**
 * Formatea un número para su visualización en la calculadora.
 *
 * @param value Número a formatear.
 *
 * @returns Valor convertido a texto con formato local colombiano.
 *
 * @remarks
 * Los enteros se presentan con separadores de miles.
 * Los decimales se limitan a seis cifras para evitar ruido visual.
 */
function formatCalculatorValue(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString("es-CO")
    : parseFloat(value.toFixed(6)).toLocaleString("es-CO");
}

/**
 * Formatea un valor monetario en notación compacta para la UI.
 *
 * @param value Valor numérico a convertir.
 *
 * @returns Representación abreviada del monto.
 *
 * @remarks
 * Se usa principalmente en la tabla y la proyección visual del módulo.
 */
function formatCompactCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Genera las filas proyectadas de ingresos, gastos y utilidad.
 *
 * @param income Ingreso base.
 * @param expense Gasto base.
 * @param growth Tasa de crecimiento en escala decimal.
 * @param months Cantidad de meses a proyectar.
 *
 * @returns Lista de filas proyectadas para la visualización.
 *
 * @remarks
 * La lógica actual usa una simulación simple:
 *
 * - ingresos crecen con la tasa completa
 * - gastos crecen al 60% de dicha tasa
 *
 * Esto representa un escenario básico de expansión controlada.
 */
function buildProjectionRows(
  income: number,
  expense: number,
  growth: number,
  months: number
): ProjectionRow[] {
  return Array.from({ length: months }, (_, i) => {
    const inc = income * Math.pow(1 + growth, i + 1);
    const exp = expense * Math.pow(1 + growth * 0.6, i + 1);

    return {
      month: MONTHS[(new Date().getMonth() + i) % 12]!,
      inc,
      exp,
      util: inc - exp,
    };
  });
}

/**
 * Construye el estado inicial de selección de secciones del reporte.
 *
 * @returns Objeto tipado con el estado inicial de cada sección.
 */
function buildInitialSections(): Record<ReportSectionId, boolean> {
  return Object.fromEntries(
    SECTIONS_CFG.map((section) => [section.id, section.on])
  ) as Record<ReportSectionId, boolean>;
}

/* -------------------------------------------------------------------------- */
/* Componentes auxiliares                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Panel colapsable con transición de altura y opacidad.
 *
 * @param props Propiedades del componente.
 *
 * @returns Contenedor animado para mostrar u ocultar contenido.
 *
 * @remarks
 * Este componente se usa para desplegar la herramienta activa dentro
 * de la tarjeta principal sin necesidad de crear una abstracción externa.
 */
function CollapsePanel({ open, children }: CollapsePanelProps) {
  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: open ? "700px" : "0px", opacity: open ? 1 : 0 }}
    >
      {children}
    </div>
  );
}

/**
 * Botón reutilizable para la cuadrícula de la calculadora.
 *
 * @param props Propiedades visuales y funcionales del botón.
 *
 * @returns Botón estilizado según la variante indicada.
 *
 * @remarks
 * Este componente encapsula la presentación de los controles de la
 * calculadora, manteniendo consistencia entre acciones numéricas,
 * operadores y funciones auxiliares.
 */
function CalculatorButton({
  label,
  variant,
  onClick,
  wide,
}: CalculatorButtonProps) {
  /**
   * Mapa de estilos por variante visual.
   */
  const variantStyles: Record<CalculatorButtonVariant, string> = {
    fn: "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:text-[#adbac7]",
    op: "bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold dark:bg-violet-500/[0.15] dark:hover:bg-violet-500/[0.25] dark:text-violet-400",
    digit:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 dark:bg-[#1c2128] dark:hover:bg-[#21262d] dark:text-[#e6edf3] dark:border-[#30363d]",
    eq: "bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600/80 dark:hover:bg-violet-600",
  };

  return (
    <button
      onClick={onClick}
      className={`${variantStyles[variant]} ${wide ? "col-span-2" : ""} h-10 rounded-lg text-[13px] font-semibold transition-all active:scale-95`}
    >
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Calculadora                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Calculadora financiera compacta para operaciones rápidas.
 *
 * @returns Herramienta interactiva de cálculo aritmético básico.
 *
 * @remarks
 * Este componente mantiene internamente:
 *
 * - valor actual en pantalla
 * - operando previo
 * - operador activo
 * - control de espera del siguiente valor
 * - expresión mostrada al usuario
 *
 * Está orientado a cálculos rápidos dentro de la UI y no pretende
 * reemplazar una calculadora científica o financiera avanzada.
 */
function InlineCalculator() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<CalculatorOperator | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [expression, setExpression] = useState("");

  /**
   * Inserta un dígito en el display actual.
   *
   * @param digit Dígito seleccionado por el usuario.
   */
  const inputDigit = (digit: string) => {
    if (waitingNext) {
      setDisplay(digit);
      setWaitingNext(false);
      return;
    }

    setDisplay(display === "0" ? digit : display + digit);
  };

  /**
   * Inserta el separador decimal en el número actual.
   *
   * @remarks
   * Si se espera un nuevo operando, se inicializa directamente como `0.`
   * para mantener un flujo de escritura natural.
   */
  const inputDecimal = () => {
    if (waitingNext) {
      setDisplay("0.");
      setWaitingNext(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  /**
   * Procesa la selección de un operador matemático.
   *
   * @param nextOperator Operador seleccionado por el usuario.
   *
   * @remarks
   * Si ya existe una operación pendiente y el usuario no está escribiendo
   * un nuevo valor, se encadena el cálculo inmediatamente.
   */
  const handleOperator = (nextOperator: CalculatorOperator) => {
    const currentValue = parseFloat(display);

    if (prevValue !== null && operator && !waitingNext) {
      const result = calculateOperation(prevValue, currentValue, operator);
      const formatted = formatCalculatorValue(result);

      setDisplay(formatted);
      setPrevValue(result);
      setExpression(`${formatted} ${nextOperator}`);
    } else {
      setPrevValue(currentValue);
      setExpression(`${display} ${nextOperator}`);
    }

    setOperator(nextOperator);
    setWaitingNext(true);
  };

  /**
   * Resuelve la operación pendiente y muestra el resultado.
   *
   * @remarks
   * Si no existe una operación válida en curso, no ejecuta ninguna acción.
   */
  const resolveOperation = () => {
    if (prevValue === null || !operator) return;

    const result = calculateOperation(prevValue, parseFloat(display), operator);

    setExpression(`${expression} ${display} =`);
    setDisplay(formatCalculatorValue(result));
    setPrevValue(null);
    setOperator(null);
    setWaitingNext(true);
  };

  /**
   * Reinicia completamente el estado de la calculadora.
   */
  const clearCalculator = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingNext(false);
    setExpression("");
  };

  /**
   * Invierte el signo del valor mostrado actualmente.
   */
  const toggleSign = () => {
    setDisplay((parseFloat(display) * -1).toString());
  };

  /**
   * Convierte el valor actual a porcentaje.
   */
  const convertToPercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
  };

  return (
    <div className="px-3.5 pb-3.5 pt-2">
      <div
        className="rounded-lg px-3 py-2.5 mb-2.5
                      bg-slate-900 dark:bg-[#0d1117]"
      >
        <p className="text-right text-[9.5px] h-3.5 truncate text-slate-500 dark:text-[#444c56]">
          {expression || "\u00A0"}
        </p>
        <p className="text-right text-[22px] font-bold tracking-tight truncate leading-tight text-white dark:text-[#e6edf3]">
          {display}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <CalculatorButton
          label="AC"
          variant="fn"
          onClick={clearCalculator}
        />
        <CalculatorButton label="+/−" variant="fn" onClick={toggleSign} />
        <CalculatorButton label="%" variant="fn" onClick={convertToPercent} />
        <CalculatorButton
          label="÷"
          variant="op"
          onClick={() => handleOperator("÷")}
        />

        {["7", "8", "9"].map((digit) => (
          <CalculatorButton
            key={digit}
            label={digit}
            variant="digit"
            onClick={() => inputDigit(digit)}
          />
        ))}
        <CalculatorButton
          label="×"
          variant="op"
          onClick={() => handleOperator("×")}
        />

        {["4", "5", "6"].map((digit) => (
          <CalculatorButton
            key={digit}
            label={digit}
            variant="digit"
            onClick={() => inputDigit(digit)}
          />
        ))}
        <CalculatorButton
          label="−"
          variant="op"
          onClick={() => handleOperator("−")}
        />

        {["1", "2", "3"].map((digit) => (
          <CalculatorButton
            key={digit}
            label={digit}
            variant="digit"
            onClick={() => inputDigit(digit)}
          />
        ))}
        <CalculatorButton
          label="+"
          variant="op"
          onClick={() => handleOperator("+")}
        />

        <CalculatorButton
          label="0"
          variant="digit"
          onClick={() => inputDigit("0")}
          wide
        />
        <CalculatorButton label="." variant="digit" onClick={inputDecimal} />
        <CalculatorButton
          label="="
          variant="eq"
          onClick={resolveOperation}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Proyección                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Herramienta compacta de proyección financiera.
 *
 * @returns Simulador visual de ingresos, gastos y utilidad estimada.
 *
 * @remarks
 * Este componente permite ingresar:
 *
 * - ingreso base
 * - gasto base
 * - crecimiento porcentual
 * - cantidad de meses a proyectar
 *
 * Con esos valores genera:
 *
 * - un gráfico comparativo sencillo
 * - una tabla resumida por período
 *
 * La lógica es deliberadamente simple y está pensada como
 * demostración visual de comportamiento financiero.
 */
function InlineProjection() {
  const [income, setIncome] = useState("50000000");
  const [expense, setExpense] = useState("35000000");
  const [growth, setGrowth] = useState("5");
  const [monthsInput, setMonthsInput] = useState("4");

  /**
   * Cantidad de meses a proyectar, limitada entre 1 y 6.
   */
  const months = Math.min(Math.max(parseInt(monthsInput) || 1, 1), 6);

  /**
   * Ingreso base convertido a número.
   */
  const baseIncome = parseFloat(income) || 0;

  /**
   * Gasto base convertido a número.
   */
  const baseExpense = parseFloat(expense) || 0;

  /**
   * Tasa de crecimiento expresada en valor decimal.
   */
  const growthRate = (parseFloat(growth) || 0) / 100;

  /**
   * Filas proyectadas para la tabla y el gráfico.
   */
  const rows = buildProjectionRows(
    baseIncome,
    baseExpense,
    growthRate,
    months
  );

  /**
   * Valor máximo usado para escalar visualmente las barras.
   */
  const maxValue = Math.max(...rows.map((row) => row.inc), 1);

  /**
   * Clases compartidas para los campos de entrada numérica.
   */
  const inputClassName =
    "w-full rounded-lg border px-2.5 py-1.5 text-[12px] outline-none transition-colors focus:ring-2 focus:ring-violet-400 border-slate-200 bg-slate-50 text-slate-800 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5]";

  return (
    <div className="px-3.5 pb-3.5 pt-2 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Ingreso base (COP)", value: income, setValue: setIncome },
          {
            label: "Gasto base (COP)",
            value: expense,
            setValue: setExpense,
          },
          { label: "Crecimiento %", value: growth, setValue: setGrowth },
          {
            label: "Meses (máx. 6)",
            value: monthsInput,
            setValue: setMonthsInput,
          },
        ].map(({ label, value, setValue }) => (
          <div key={label}>
            <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">
              {label}
            </p>
            <input
              type="number"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={inputClassName}
            />
          </div>
        ))}
      </div>

      <div
        className="rounded-lg border p-3
                      border-slate-200 bg-slate-50
                      dark:border-[#30363d] dark:bg-[#1c2128]"
      >
        <p
          className="text-[9.5px] font-semibold uppercase tracking-wide mb-2
                      text-slate-400 dark:text-[#545d68]"
        >
          Ingresos vs Gastos
        </p>

        <div className="flex items-end gap-1 h-16">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-0.5"
            >
              <div
                className="w-full flex flex-col gap-0.5 justify-end"
                style={{ height: "52px" }}
              >
                <div
                  className="w-full rounded-sm bg-violet-500"
                  style={{
                    height: `${(row.inc / maxValue) * 44}px`,
                    minHeight: "2px",
                  }}
                />
                <div
                  className="w-full rounded-sm bg-rose-400"
                  style={{
                    height: `${(row.exp / maxValue) * 44}px`,
                    minHeight: "2px",
                  }}
                />
              </div>
              <span className="text-[8.5px] text-slate-400 dark:text-[#545d68]">
                {row.month}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[9.5px] text-slate-400 dark:text-[#545d68]">
            <span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" />
            Ingresos
          </span>
          <span className="flex items-center gap-1 text-[9.5px] text-slate-400 dark:text-[#545d68]">
            <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />
            Gastos
          </span>
        </div>
      </div>

      <div
        className="rounded-lg border overflow-hidden
                      border-slate-200 dark:border-[#30363d]"
      >
        <table className="w-full text-[11px]">
          <thead>
            <tr
              className="border-b border-slate-200 bg-slate-50
                           dark:border-[#30363d] dark:bg-[#1c2128]"
            >
              {["Mes", "Ingresos", "Gastos", "Utilidad"].map((header) => (
                <th
                  key={header}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold
                                       text-slate-400 dark:text-[#545d68]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0
                                     dark:border-[#21262d]"
              >
                <td className="px-2 py-1.5 font-medium text-slate-600 dark:text-[#adbac7]">
                  {row.month}
                </td>
                <td className="px-2 py-1.5 text-emerald-600 dark:text-emerald-400">
                  ${formatCompactCOP(row.inc)}
                </td>
                <td className="px-2 py-1.5 text-rose-500 dark:text-rose-400">
                  ${formatCompactCOP(row.exp)}
                </td>
                <td
                  className={`px-2 py-1.5 font-semibold ${
                    row.util >= 0
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${formatCompactCOP(row.util)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Generador de reportes                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Generador simplificado de reportes financieros.
 *
 * @returns Herramienta de selección de período, formato y secciones.
 *
 * @remarks
 * Este componente simula un flujo de generación de reportes
 * mediante una interfaz de selección y estados visuales.
 *
 * Actualmente no existe una exportación real de archivos, por lo que:
 *
 * - no se genera un PDF real
 * - no se descarga un Excel real
 * - no hay conexión con backend
 *
 * Su objetivo actual es representar la experiencia de uso
 * y preparar la estructura para futuras integraciones.
 */
function InlineReport() {
  const [period, setPeriod] = useState("Q1 2025");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [sections, setSections] = useState<Record<ReportSectionId, boolean>>(
    buildInitialSections()
  );
  const [state, setState] = useState<ReportState>("idle");

  /**
   * Alterna el estado de una sección del reporte.
   *
   * @param sectionId Identificador de la sección a modificar.
   */
  const toggleSection = (sectionId: ReportSectionId) => {
    setSections((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId],
    }));
  };

  /**
   * Cantidad total de secciones seleccionadas.
   */
  const selectedCount = Object.values(sections).filter(Boolean).length;

  /**
   * Inicia la simulación de generación del reporte.
   *
   * @remarks
   * Cambia el estado a `loading` y luego a `done` tras un retardo
   * para representar visualmente un procesamiento asíncrono.
   */
  const generateReport = () => {
    setState("loading");
    setTimeout(() => setState("done"), 1600);
  };

  /**
   * Restablece el flujo del generador al estado inicial visual.
   */
  const resetGenerator = () => {
    setState("idle");
  };

  /**
   * Clases base compartidas para el control de selección de período.
   */
  const selectClassName =
    "w-full rounded-lg border px-2.5 py-1.5 text-[12px] outline-none transition-colors focus:ring-2 focus:ring-violet-400 border-slate-200 bg-slate-50 text-slate-800 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5]";

  if (state === "done") {
    return (
      <div className="px-3.5 pb-3.5 pt-2">
        <div
          className="rounded-lg border p-4 text-center
                      border-emerald-200 bg-emerald-50
                      dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]"
        >
          <div className="flex justify-center mb-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full
                           bg-emerald-100 dark:bg-emerald-500/[0.15]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          <p className="text-[13px] font-semibold mb-0.5 text-slate-800 dark:text-[#e6edf3]">
            Reporte listo
          </p>
          <p className="text-[11px] mb-3 text-slate-500 dark:text-[#768390]">
            {period} · {selectedCount} secciones · {format.toUpperCase()}
          </p>

          <div className="flex gap-2">
            <button
              onClick={resetGenerator}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-[11.5px] font-semibold transition-colors
                             border-slate-200 bg-white text-slate-600 hover:bg-slate-50
                             dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7] dark:hover:bg-[#21262d]"
            >
              <RefreshCw className="h-3 w-3" />
              Nuevo
            </button>

            <button
              className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11.5px] font-semibold transition-colors
                             bg-violet-600 text-white hover:bg-violet-700"
            >
              <Download className="h-3 w-3" />
              Descargar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3.5 pb-3.5 pt-2 space-y-3">
      <div>
        <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">
          Período
        </p>
        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className={selectClassName}
        >
          {["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2024", "Anual 2024"].map(
            (item) => (
              <option key={item}>{item}</option>
            )
          )}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-slate-400 dark:text-[#545d68]">
            Secciones
          </p>
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
            {selectedCount} sel.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1">
          {SECTIONS_CFG.map((section) => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-left transition-all ${
                sections[section.id]
                  ? "bg-violet-50 border border-violet-200 text-violet-700 dark:bg-violet-500/[0.10] dark:border-violet-500/25 dark:text-violet-400"
                  : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-[#444c56]"
              }`}
            >
              <span
                className={`flex-shrink-0 h-3 w-3 rounded border flex items-center justify-center ${
                  sections[section.id]
                    ? "bg-violet-600 border-violet-600"
                    : "border-slate-300 dark:border-[#444c56]"
                }`}
              >
                {sections[section.id] && (
                  <svg viewBox="0 0 12 12" className="h-2 w-2">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="truncate">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium mb-1 text-slate-400 dark:text-[#545d68]">
          Formato
        </p>
        <div className="flex gap-1.5">
          {(["pdf", "excel", "csv"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFormat(item)}
              className={`flex-1 rounded-lg py-1.5 text-[11.5px] font-semibold transition-all ${
                format === item
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-[#21262d] dark:text-[#545d68] dark:hover:bg-[#30363d] dark:hover:text-[#adbac7]"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generateReport}
        disabled={state === "loading" || selectedCount === 0}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all
                   bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {state === "loading" ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Generando…
          </>
        ) : (
          <>
            <FileText className="h-3.5 w-3.5" />
            Generar reporte
          </>
        )}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta principal de herramientas financieras.
 *
 * @returns Panel interactivo con acceso a calculadora, proyección y reportes.
 *
 * @remarks
 * Este componente funciona como contenedor maestro del módulo y coordina:
 *
 * - la visualización del encabezado
 * - la lista de herramientas disponibles
 * - el estado de expansión de cada herramienta
 * - el renderizado condicional del contenido activo
 *
 * La implementación mantiene una sola herramienta abierta a la vez,
 * mejorando la legibilidad del panel y reduciendo el ruido visual.
 *
 * Aunque actualmente todas las subherramientas residen en este mismo archivo,
 * la estructura interna ya permite migrarlas más adelante a componentes
 * dedicados sin afectar el contrato principal del módulo.
 *
 * @example
 * ```tsx
 * <FinanceToolsCard />
 * ```
 */
export default function FinanceToolsCard() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  /**
   * Alterna la herramienta activa del módulo.
   *
   * @param toolId Identificador de la herramienta seleccionada.
   *
   * @remarks
   * Si el usuario selecciona la misma herramienta activa, esta se colapsa.
   * Si selecciona una distinta, se expande y reemplaza la anterior.
   */
  const toggleTool = (toolId: Tool) => {
    setActiveTool((previous) => (previous === toolId ? null : toolId));
  };

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]"
    >
      <div
        className="flex items-center justify-between px-[18px] py-[14px]
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]"
          >
            <Wrench className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>

          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e6edf3]">
            Herramientas Financieras
          </h3>
        </div>

        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide
                         bg-violet-50 border-violet-100 text-violet-600
                         dark:bg-violet-500/[0.12] dark:border-violet-500/20 dark:text-violet-400"
        >
          3 disponibles
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-[#21262d]">
        {TOOLS.map((tool) => {
          const isOpen = activeTool === tool.id;

          return (
            <div key={tool.id}>
              <button
                onClick={() => toggleTool(tool.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isOpen
                    ? "bg-violet-50/70 dark:bg-violet-500/[0.06]"
                    : "hover:bg-slate-50 dark:hover:bg-[#1c2128]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isOpen
                      ? "bg-violet-100 dark:bg-violet-500/[0.15]"
                      : "bg-slate-100 dark:bg-[#21262d]"
                  }`}
                >
                  <tool.icon
                    className={`h-3.5 w-3.5 transition-colors ${
                      isOpen
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-500 dark:text-[#768390]"
                    }`}
                  />
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12.5px] font-semibold leading-tight ${
                      isOpen
                        ? "text-violet-700 dark:text-violet-400"
                        : "text-slate-700 dark:text-[#cdd9e5]"
                    }`}
                  >
                    {tool.title}
                  </p>
                  <p className="text-[11px] truncate mt-0.5 text-slate-400 dark:text-[#545d68]">
                    {tool.description}
                  </p>
                </div>

                {isOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 text-violet-400 dark:text-violet-500" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-[#545d68]" />
                )}
              </button>

              <CollapsePanel open={isOpen}>
                <div
                  className="border-t border-violet-100 bg-white
                                dark:border-violet-500/15 dark:bg-[#161b22]"
                >
                  {tool.id === "calculator" && <InlineCalculator />}
                  {tool.id === "projection" && <InlineProjection />}
                  {tool.id === "report" && <InlineReport />}
                </div>
              </CollapsePanel>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center gap-1.5 px-4 py-2.5
                      border-t border-slate-100 dark:border-[#21262d]"
      >
        <span className="h-1.5 w-1.5 rounded-full inline-block bg-violet-300 dark:bg-violet-500/50" />
        <span className="text-[10.5px] text-slate-400 dark:text-[#545d68]">
          {activeTool
            ? `${TOOLS.find((tool) => tool.id === activeTool)?.title} activa`
            : "Selecciona una herramienta"}
        </span>
      </div>
    </div>
  );
}