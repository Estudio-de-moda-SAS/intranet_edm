export function IntranetDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* cuadrado grande */}
      <div className="absolute top-6 left-6 w-16 h-16 bg-violet-200/30 rounded-xl rotate-12" />

      {/* cuadrado medio */}
      <div className="absolute bottom-10 right-8 w-24 h-24 bg-violet-300/20 rounded-2xl -rotate-6" />

      {/* cuadrado pequeño */}
      <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-violet-400/20 rounded-lg" />

      {/* cuadrado adicional estilo dashboard */}
      <div className="absolute bottom-4 left-12 w-8 h-8 bg-violet-200/30 rounded-md rotate-45" />
    </div>
  );
}