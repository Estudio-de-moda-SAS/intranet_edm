// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] animate-pulse">
      {/* Hero skeleton */}
      <div className="h-48 bg-gradient-to-br from-white via-violet-50/60 to-purple-100/70 border-b border-violet-100/80" />
      
      {/* KPI strip skeleton */}
      <div className="px-4 lg:px-14 -mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-7">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white border border-slate-200 shadow-sm" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-64 rounded-2xl bg-white border border-slate-200" />
            <div className="h-48 rounded-2xl bg-white border border-slate-200" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="h-40 rounded-2xl bg-white border border-slate-200" />
            <div className="h-40 rounded-2xl bg-white border border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}