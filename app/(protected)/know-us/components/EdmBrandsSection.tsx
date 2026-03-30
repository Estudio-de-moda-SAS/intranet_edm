// ✅ SERVER COMPONENT

const BRANDS = [
  { name: "Diesel",               origin: "Italia",            since: "EDM desde 1989" },
  { name: "Kipling",              origin: "Bélgica",           since: "EDM desde 2000" },
  { name: "Superdry",             origin: "Reino Unido",       since: "EDM portafolio" },
  { name: "Marithé F. Girbaud",  origin: "Francia",           since: "EDM desde 1985" },
  { name: "Pilatos",              origin: "Colombia · Propia", since: "Marca EDM"      },
];

export function CompanyBrandsSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Portafolio de marcas
        </p>
      </div>

      <div className="grid grid-cols-5">
        {BRANDS.map((brand, i) => (
          <div
            key={brand.name}
            className="px-4 py-6 text-center transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight: i < BRANDS.length - 1 ? "0.5px solid rgb(226 232 240)" : "none",
            }}
          >
            <p
              className="mb-1 text-[15px] font-bold leading-snug text-slate-700 dark:text-slate-200"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {brand.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {brand.origin}
            </p>
            <p className="mt-1 text-[11px] font-medium text-violet-600">
              {brand.since}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}