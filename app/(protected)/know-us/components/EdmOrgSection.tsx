// ✅ SERVER COMPONENT
// Si el organigrama es complejo/interactivo, mueve la parte visual a un Client Component.

type Props = { orgChart?: any };

export function CompanyOrgSection({ orgChart: _ }: Props) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="inline-block h-5 w-1 rounded-full bg-[#2563a8]" />
        Estructura Organizacional
      </h2>

      {/* Placeholder — reemplaza con tu componente de organigrama real */}
      <div className="flex flex-col items-center gap-4 py-4">

        {/* Nivel 1 */}
        <OrgNode label="Co-Fundadores" sublabel="Clara Restrepo · Jaime Álvarez" level="top" />

        {/* Nivel 2 */}
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

        {/* Canales de distribución */}
        <div className="mt-4 w-full">
          <p className="text-xs font-semibold text-center text-gray-400 uppercase tracking-widest mb-3">
            Canales de distribución
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Tiendas propias", "Wholesale", "E-commerce", "Marketplaces"].map((canal) => (
              <span
                key={canal}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-[#1e4976]"
              >
                {canal}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Sub-componente interno ──────────────────────────────────────

function OrgNode({
  label,
  sublabel,
  level,
}: {
  label: string;
  sublabel?: string;
  level: "top" | "mid";
}) {
  const base =
    "rounded-xl border px-4 py-2.5 text-center shadow-sm transition-shadow hover:shadow-md";
  const styles =
    level === "top"
      ? `${base} bg-[#1e4976] text-white border-[#1a3a5c] min-w-[180px]`
      : `${base} bg-white text-gray-700 border-gray-200 text-sm min-w-[120px]`;

  return (
    <div className={styles}>
      <p className="font-semibold text-sm">{label}</p>
      {sublabel && <p className="text-xs opacity-70 mt-0.5">{sublabel}</p>}
    </div>
  );
}
