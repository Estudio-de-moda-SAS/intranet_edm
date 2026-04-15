// app/product/config/productQuickLinks.ts 

/**
 * @module productQuickLinks
 * Enlaces rápidos del módulo de Producto.
 *
 * @remarks
 * Este archivo define accesos directos a herramientas, vistas y recursos clave
 * utilizados por el equipo de Producto dentro del dashboard.
 *
 * Los enlaces pueden ser:
 * - Internos: rutas dentro de la aplicación
 * - Externos: herramientas externas como Figma o documentación
 *
 * Son consumidos típicamente por componentes como {@link QuickLinksSection},
 * donde se renderizan como accesos visuales (cards o botones).
 */

/**
 * Estructura de un enlace rápido del módulo de Producto.
 *
 * @remarks
 * Define la información necesaria para renderizar un acceso directo
 * dentro del dashboard.
 *
 * @property label - Texto visible del enlace
 * @property href - Ruta o URL de destino
 * @property icon - Nombre del ícono de Lucide como string (resuelto dinámicamente en {@link QuickLinksSection})
 * @property external - Indica si el enlace es externo (abre en nueva pestaña)
 */
export type QuickLink = {
  label:    string;
  href:     string;
  icon:     string; // Lucide icon name as string, resolved in QuickLinksSection
  external?: boolean;
};

/**
 * Lista de enlaces rápidos del módulo de Producto.
 *
 * @remarks
 * Proporciona accesos directos a herramientas clave del flujo de trabajo del equipo:
 *
 * - Planeación: roadmap, sprints, OKRs
 * - Diseño: repositorio en Figma
 * - Investigación: user research
 * - Desarrollo: feature flags, changelog
 * - Documentación técnica
 *
 * ⚠️ Dataset estático.
 * En producción podría ser dinámico según:
 * - Rol del usuario
 * - Permisos (AccessLevel)
 * - Configuración remota
 *
 * @example
 * ```tsx
 * <QuickLinksSection links={productQuickLinks} />
 * ```
 */
export const productQuickLinks: QuickLink[] = [
  { label: "Roadmap público",           href: "/product/roadmap",    icon: "Map"        },
  { label: "Board de sprints",          href: "/product/sprints",    icon: "LayoutGrid" },
  { label: "Repositorio de diseños",    href: "https://figma.com/team/acme", icon: "Figma",      external: true },
  { label: "User research & hallazgos", href: "/product/research",   icon: "Users"      },
  { label: "Feature flags",             href: "/product/flags",      icon: "ToggleLeft" },
  { label: "Changelog",                 href: "/product/changelog",  icon: "ScrollText" },
  { label: "OKRs de producto",          href: "/product/okrs",       icon: "Target"     },
  { label: "Documentación técnica",     href: "https://docs.acme.com", icon: "BookOpen", external: true },
];