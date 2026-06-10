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
  image?: string;
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
    title: "Fundación de Estudio de Moda",
    description:
      "Nace la compañía en los años 80's en una casa en Medellín, marcando el inicio de una iniciativa que se convertiría en referente de la moda colombiana.",
  },

  {
    year: "1981",
    title: "Creación de US Wear",
    description:
      "En 1981, Estudio de Moda dio un paso clave en su evolución al crear la marca US Wear. Ese mismo año, trasladó su sede a una nueva casa en Medellín, afirmando así una etapa de crecimiento y expansión.",
  },

  {
    year: "1982",
    title: "Comercialización Chopper",
    description:
      "Chopper, marca brasilera, fue la primera licencia internacional obtenida. Se inaugura la tienda multimarca, estableciendo un modelo comercial innovador en el país. Ese mismo año, la compañía realizó un nuevo cambio de sede, acompañando su crecimiento y potenciando su operación.",
  image: "/images/history/Chopper.png",
    },

  {
    year: "1984",
    title: "Creación de Pilatos",
    description:
      "Se inaugura la tienda multimarca Pilatos, cimentando un modelo comercial innovador en el país.",
    image: "/images/history/Pilatos.jpg",
  },

  {
    year: "1985",
    title: "Llegada de Marithé + François Girbaud",
    description:
      "Se incorpora al portafolio Marithé + François Girbaud, aportando una visión vanguardista que eleva el reconocimiento de la compañía en el mercado de la moda en Colombia.",
    image: "/images/history/MGirbaud.webp",
  },

  {
    year: "1989",
    title: "Llegada de Diesel",
    description:
      "Un hito estratégico que amplía la oferta del portafolio con la incorporación de Diesel, potenciando el liderazgo de la compañía y elevando el estándar de la moda en Colombia con una oferta global.",
    image: "/images/history/Diesel.png",
  },

  {
    year: "1991",
    title: "Comercialización de Soviet",
    description:
      "Se da inicio a la comercialización de Soviet, sumando una nueva alternativa al portafolio que refuerza el lugar de la compañía y aporta frescura e innovación al mercado de la moda.",
    image: "/images/history/Soviet.webp",
  },

  {
    year: "2000",
    title: "Llegan Kipling y Custo Barcelona",
    description:
      "Se inició la comercialización de las marcas Kipling y Custo Barcelona, enriqueciendo el portafolio de la organización e impulsando su crecimiento con alternativas globales de alto valor y reconocimiento internacional.",
    image: "/images/history/Kipling.webp",
  },

  {
    year: "2006",
    title: "Creación de New Project",
    description:
      "EDM desarrolla su marca propia New Project, demostrando capacidad para crear y gestionar iniciativas de moda propias.",
    image: "/images/history/project.jpeg",
  },

  {
    year: "2011",
    title: "Llegan Celio y Superdry",
    description:
      "Se amplía el portafolio con nuevas marcas internacionales, afianzando el perfil como distribuidor de moda premium.",
    image: "/images/history/Superdry.png",
  },

  {
    year: "2018",
    title: "Expansión Nacional",
    description:
      "Apertura de más de 15 tiendas a nivel nacional, ampliando la presencia de la compañía en el país.",
  },

  {
    year: "2019",
    title: "Nueva Sede Corporativa",
    description:
      "Traslado a nuevas oficinas en Medellín, reflejando el crecimiento y madurez de EDM.",
  },

  {
  year: "Hoy",
  title: "Más de 45 años transformando la moda",
  description:
    "La incorporación de marcas internacionales representó un punto de inflexión para EDM, ampliando su portafolio, elevando los estándares del negocio y consolidando su reconocimiento como referente de la moda en Colombia. Con el tiempo, la organización evolucionó hacia una estructura más sólida y sostenible, con unidades de negocio definidas y una visión enfocada en maximizar el valor de sus marcas. Hoy, ese legado continúa impulsando el crecimiento, la innovación y el compromiso de seguir transformando la moda en el país.",
  image: "/brand/edmicon.png",
  },
];