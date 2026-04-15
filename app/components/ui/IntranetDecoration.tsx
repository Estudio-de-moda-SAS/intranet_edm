/**
 * @module IntranetDecoration
 * Elemento decorativo para fondos de secciones en la intranet.
 *
 * @remarks
 * Este componente renderiza figuras geométricas (cuadrados) con
 * diferentes tamaños, posiciones y rotaciones para aportar
 * dinamismo visual sin interferir con la interacción del usuario.
 */

/**
 * Renderiza un conjunto de elementos decorativos posicionados de forma absoluta.
 *
 * @returns Capa decorativa no interactiva.
 *
 * @remarks
 * Características:
 * - Usa `pointer-events-none` para no afectar la interacción.
 * - Se posiciona con `absolute` ocupando todo el contenedor padre.
 * - Incluye múltiples figuras con opacidad y rotación para dar profundidad.
 */
export function IntranetDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cuadrado grande */}
      <div className="absolute top-6 left-6 w-16 h-16 bg-violet-200/30 rounded-xl rotate-12" />

      {/* Cuadrado medio */}
      <div className="absolute bottom-10 right-8 w-24 h-24 bg-violet-300/20 rounded-2xl -rotate-6" />

      {/* Cuadrado pequeño central */}
      <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-violet-400/20 rounded-lg" />

      {/* Cuadrado adicional estilo dashboard */}
      <div className="absolute bottom-4 left-12 w-8 h-8 bg-violet-200/30 rounded-md rotate-45" />
    </div>
  );
}