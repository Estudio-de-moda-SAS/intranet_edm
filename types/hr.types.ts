/**
 * @module types/hr-apps
 * Tipos para el sistema de accesos rápidos y aplicaciones del
 * departamento de Recursos Humanos de la intranet EDM.
 *
 * @remarks
 * Define la paleta de colores compartida entre departamentos y la
 * estructura de los ítems de navegación del panel de apps de RRHH.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Paleta de colores corporativos disponibles para los ítems de
 * navegación y accesos rápidos de la intranet EDM.
 *
 * @remarks
 * Cada valor corresponde a una clase de color de Tailwind CSS aplicada
 * al ícono y borde del ítem. La asignación de color a cada ítem es
 * responsabilidad del archivo de configuración de cada departamento.
 *
 * | Valor    | Uso sugerido                        |
 * |----------|-------------------------------------|
 * | `purple` | Acciones de configuración o admin   |
 * | `teal`   | Acciones de agenda o calendario     |
 * | `blue`   | Acciones de información o consulta  |
 * | `green`  | Acciones de aprobación o éxito      |
 * | `amber`  | Acciones de alerta o pendiente      |
 * | `coral`  | Acciones de contacto o comunicación |
 * | `pink`   | Acciones de bienestar o cultura     |
 * | `rose`   | Acciones de urgencia o atención     |
 */
export type AppColor =
  | "purple"
  | "teal"
  | "blue"
  | "green"
  | "amber"
  | "coral"
  | "pink"
  | "rose";

/**
 * Nombres de íconos de Lucide React disponibles para los ítems de
 * navegación del departamento de Recursos Humanos.
 *
 * @remarks
 * Cada valor corresponde al nombre en camelCase del ícono en la
 * librería `lucide-react`. El componente de UI resuelve el ícono
 * concreto a partir de este string en tiempo de renderizado.
 *
 * Si se necesita un ícono adicional, debe agregarse aquí y estar
 * disponible en la versión de `lucide-react` instalada en el proyecto.
 *
 * | Valor           | Ícono                              |
 * |-----------------|------------------------------------|
 * | `users`         | Grupo de personas                  |
 * | `calendarDays`  | Calendario con días                |
 * | `fileText`      | Documento de texto                 |
 * | `heartHandshake`| Apretón de manos con corazón       |
 * | `award`         | Premio o reconocimiento            |
 * | `barChart3`     | Gráfica de barras                  |
 * | `graduationCap` | Birrete de graduación              |
 * | `briefcase`     | Maletín de trabajo                 |
 * | `clipboardList` | Portapapeles con lista             |
 * | `userPlus`      | Agregar usuario                    |
 * | `clock`         | Reloj                              |
 * | `shieldCheck`   | Escudo con verificación            |
 */
export type HRIconName =
  | "users"
  | "calendarDays"
  | "fileText"
  | "heartHandshake"
  | "award"
  | "barChart3"
  | "graduationCap"
  | "briefcase"
  | "clipboardList"
  | "userPlus"
  | "clock"
  | "shieldCheck";

/**
 * Ítem de navegación del panel de aplicaciones del departamento de
 * Recursos Humanos.
 *
 * @remarks
 * Representa un acceso directo a una funcionalidad o sección del módulo
 * de RRHH. Se usa para construir el grid de apps en la página del
 * departamento y en los quick links de la intranet.
 *
 * El campo `id` es opcional para permitir definir ítems inline sin
 * necesidad de asignar un identificador cuando no se requiere gestión
 * de estado por ítem.
 */
export type HRAppItem = {
  /**
   * Identificador único del ítem.
   * `undefined` si el ítem se define inline y no requiere identificación.
   */
  id?: string;

  /** Texto descriptivo del acceso directo mostrado bajo el ícono. */
  label: string;

  /**
   * Descripción extendida del acceso directo para mostrar en tooltip
   * o subtítulo.
   * `undefined` si el ítem no tiene descripción adicional.
   */
  description?: string;

  /** Ruta interna de la funcionalidad a la que apunta el ítem. */
  href: string;

  /** Nombre del ícono de Lucide React a renderizar. */
  icon: HRIconName;

  /** Color del ícono y decoración visual del ítem según {@link AppColor}. */
  color: AppColor;
};