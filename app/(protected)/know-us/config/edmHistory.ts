/**
 * @module companyHistory
 * Línea de tiempo histórica de la compañía Estudio de Moda (EDM).
 *
 * @remarks
 * Este módulo define la evolución de la empresa a través de hitos clave,
 * utilizados en la sección "Conoce la Empresa".
 *
 * La información aquí contenida es de carácter corporativo y puede ser
 * reutilizada en diferentes componentes como:
 *
 * - timelines
 * - secciones informativas
 * - presentaciones institucionales
 *
 * Se recomienda mantener esta fuente como la "única verdad" para la historia
 * de la compañía dentro de la aplicación.
 */

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa un hito dentro de la historia de la empresa.
 *
 * @remarks
 * Cada elemento describe un momento clave en la evolución de EDM:
 *
 * - `year`: referencia temporal (puede ser año o rango)
 * - `title`: nombre del hito
 * - `description`: detalle del evento
 */
export type CompanyHistoryItem = {
  year: string;
  title: string;
  description: string;
};

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Línea de tiempo de la empresa.
 *
 * @remarks
 * Contiene los hitos más relevantes desde la fundación hasta la actualidad.
 *
 * Notas:
 *
 * - Se utilizan strings en `year` para permitir flexibilidad
 *   (ej: "2000s", "Hoy").
 * - El orden es cronológico ascendente.
 *
 * En el futuro, estos datos podrían provenir de:
 *
 * - un CMS corporativo
 * - una API institucional
 */
export const companyHistory: readonly CompanyHistoryItem[] = [
  {
    year: "1980",
    title: "Nace Estudio de Moda",
    description:
      "Clara Restrepo y Jaime Álvarez fundan EDM en Medellín con una visión transformadora: innovar en la moda colombiana y ofrecer alternativas únicas para vestirse.",
  },
  {
    year: "1985",
    title: "Llega Marithé + François Girbaud",
    description:
      "EDM trae a Colombia el dúo francés que revolucionaba la industria del jean, dando inicio a su apuesta por marcas internacionales premium.",
  },
  {
    year: "1989",
    title: "DIESEL llega a Colombia",
    description:
      "La marca italiana más disruptiva del portafolio consolida la apuesta de EDM por la moda premium con el respaldo del diseño italiano.",
  },
  {
    year: "2000s",
    title: "Expansión del portafolio",
    description:
      "Se incorporan Kipling, Custo Barcelona y Agua Bendita, ampliando las opciones y consolidando a EDM como la multimarca de moda premium en Colombia.",
  },
  {
    year: "2010s",
    title: "Nace la marca propia Pilatos",
    description:
      "Con el conocimiento acumulado, EDM lanza Pilatos: una propuesta urbana, divertida y exclusiva que hoy es referente en el mercado colombiano.",
  },
  {
    year: "Hoy",
    title: "EDM: familia, pasión y moda",
    description:
      "Con más de 4 canales de distribución, presencia en más de 30 ciudades y los principales marketplaces del país, EDM sigue transformando la moda en Colombia.",
  },
];