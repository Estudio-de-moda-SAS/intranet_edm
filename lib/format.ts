export function saludo(nombre?: string) {
  const h = new Date().getHours();
  const s =
    h < 12 ? "¡Buenos días" : h < 19 ? "¡Buenas tardes" : "¡Buenas noches";

  return `${s}${nombre ? ", " + nombre : ""}!`;
}

export function fmtFecha(
  fechaISO: string,
  withTime = false,
  locale = "es-CO"
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(fechaISO));
}