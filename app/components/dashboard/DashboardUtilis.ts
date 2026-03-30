export function calculateInsight(data: Record<string, unknown>[], dataKey = "value"): string {
  if (!data?.length) return "Sin datos suficientes para generar un análisis.";

  const first = Number(data[0]?.[dataKey]) || 0;
  const last  = Number(data[data.length - 1]?.[dataKey]) || 0;
  const diff  = last - first;
  const pct   = first ? Math.abs(Math.round((diff / first) * 100)) : 0;

  if (diff > 0) return `El rendimiento muestra una tendencia positiva de ${pct}% durante el periodo analizado.`;
  if (diff < 0) return `Se observa una disminución del ${pct}% comparado con el inicio del periodo.`;
  return "El rendimiento se ha mantenido estable durante el periodo.";
}