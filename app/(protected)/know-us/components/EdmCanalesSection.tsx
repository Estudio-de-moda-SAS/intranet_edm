// ✅ SERVER COMPONENT

const CANALES = [
  { num: "1", name: "Tiendas propias", desc: "Puntos de venta en los principales centros comerciales del país" },
  { num: "2", name: "Wholesale",       desc: "Socios comerciales con cobertura en más de 50 ciudades"         },
  { num: "3", name: "E-commerce",      desc: "Tienda online propia con envíos a todo Colombia"                },
  { num: "4", name: "Marketplaces",    desc: "Presencia en los principales marketplaces colombianos"          },
];

export function CompanyCanalesSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Canales de distribución
        </p>
      </div>

      <div className="grid grid-cols-4">
        {CANALES.map((canal, i) => (
          <div
            key={canal.num}
            className="px-5 py-6 text-center transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight: i < CANALES.length - 1 ? "0.5px solid rgb(226 232 240)" : "none",
            }}
          >
            <p
              className="mb-1 text-[36px] font-black leading-none text-violet-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {canal.num}
            </p>
            <p className="mb-1 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              {canal.name}
            </p>
            <p className="text-[11px] leading-[1.45] text-slate-400">
              {canal.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}