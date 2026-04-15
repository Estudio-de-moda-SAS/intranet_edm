/**
 * @module CompanyOrgSection
 * Sección de estructura organizacional de la compañía.
 *
 * @remarks
 * Este componente presenta una representación visual simplificada
 * del organigrama corporativo dentro de la sección "Conoce la Empresa".
 *
 * La versión actual funciona como placeholder estructural e incluye:
 *
 * - nivel superior de liderazgo
 * - áreas funcionales principales
 * - canales de distribución
 *
 * Es un **Server Component**, adecuado mientras el organigrama sea
 * estático o de baja complejidad.
 *
 * Si en el futuro el organigrama requiere:
 *
 * - interactividad
 * - expand/collapse
 * - navegación jerárquica
 * - drag/zoom
 *
 * se recomienda mover la capa visual a un Client Component especializado.
 */

// ✅ SERVER COMPONENT

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Estructura opcional para un organigrama externo.
 *
 * @remarks
 * Actualmente este tipo es un placeholder, ya que la implementación visual
 * todavía no consume datos dinámicos. Se deja preparado para futuras
 * integraciones desde CMS, backend o servicio corporativo.
 */
type OrgChartData = unknown;

/**
 * Props del componente {@link CompanyOrgSection}.
 *
 * @property orgChart Estructura de organigrama opcional para futuras integraciones.
 */
type CompanyOrgSectionProps = {
  orgChart?: OrgChartData;
};

/**
 * Props del subcomponente {@link OrgNode}.
 *
 * @property label Etiqueta principal del nodo.
 * @property sublabel Texto secundario opcional.
 * @property level Nivel jerárquico del nodo en el organigrama.
 */
type OrgNodeProps = {
  label: string;
  sublabel?: string;
  level: "top" | "mid";
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de organigrama corporativo.
 *
 * @param props Propiedades del componente.
 * @returns Vista simplificada de la estructura organizacional.
 *
 * @remarks
 * Esta implementación actual representa un organigrama estático dividido en:
 *
 * 1. **Nivel superior**
 *    - cofundadores
 *
 * 2. **Nivel medio**
 *    - áreas funcionales principales
 *
 * 3. **Canales de distribución**
 *    - unidades de negocio operativas
 *
 * El prop `orgChart` aún no se utiliza directamente; se reserva para una futura
 * versión orientada a datos dinámicos.
 *
 * @example
 * ```tsx
 * <CompanyOrgSection />
 * ```
 */
export function CompanyOrgSection({
  orgChart: _,
}: CompanyOrgSectionProps) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="inline-block h-5 w-1 rounded-full bg-[#2563a8]" />
        Estructura Organizacional
      </h2>

      {/* Placeholder del organigrama */}
      <div className="flex flex-col items-center gap-4 py-4">

        {/* ---------------------------------------------------------- */}
        {/* Nivel 1: liderazgo                                         */}
        {/* ---------------------------------------------------------- */}
        <OrgNode
          label="Co-Fundadores"
          sublabel="Clara Restrepo · Jaime Álvarez"
          level="top"
        />

        {/* ---------------------------------------------------------- */}
        {/* Nivel 2: áreas principales                                 */}
        {/* ---------------------------------------------------------- */}
        <div className="w-px h-6 bg-gray-300" />
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Comercial",
            "Operaciones",
            "Talento Humano",
            "Marketing",
            "Tecnología",
            "Finanzas",
          ].map((area) => (
            <OrgNode key={area} label={area} level="mid" />
          ))}
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Canales de distribución                                    */}
        {/* ---------------------------------------------------------- */}
        <div className="mt-4 w-full">
          <p className="text-xs font-semibold text-center text-gray-400 uppercase tracking-widest mb-3">
            Canales de distribución
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Tiendas propias",
              "Wholesale",
              "E-commerce",
              "Marketplaces",
            ].map((channel) => (
              <span
                key={channel}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-[#1e4976]"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponente interno                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Nodo visual del organigrama.
 *
 * @param props Propiedades del nodo.
 * @returns Tarjeta visual representando una unidad jerárquica.
 *
 * @remarks
 * Este subcomponente encapsula la representación visual de cada nodo
 * del organigrama y diferencia estilos según el nivel jerárquico:
 *
 * - `top`: liderazgo superior
 * - `mid`: áreas funcionales
 *
 * También admite un `sublabel` opcional para mostrar contexto adicional.
 */
function OrgNode({
  label,
  sublabel,
  level,
}: OrgNodeProps) {
  /**
   * Estilo base compartido entre nodos.
   */
  const baseStyles =
    "rounded-xl border px-4 py-2.5 text-center shadow-sm transition-shadow hover:shadow-md";

  /**
   * Estilo específico según el nivel jerárquico.
   */
  const levelStyles =
    level === "top"
      ? `${baseStyles} bg-[#1e4976] text-white border-[#1a3a5c] min-w-[180px]`
      : `${baseStyles} bg-white text-gray-700 border-gray-200 text-sm min-w-[120px]`;

  return (
    <div className={levelStyles}>
      <p className="font-semibold text-sm">{label}</p>
      {sublabel && (
        <p className="text-xs opacity-70 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}