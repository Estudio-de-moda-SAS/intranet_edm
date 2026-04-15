/**
 * @module retailTeam
 * Configuración del equipo del departamento de Retail.
 *
 * @remarks
 * Este módulo define la estructura de los miembros del equipo de Retail
 * y provee un listado estático utilizado en la intranet.
 *
 * La información aquí contenida es consumida por componentes como:
 * - Secciones de equipo
 * - Tarjetas de colaboradores
 * - Directorios internos
 *
 * El equipo está organizado por frentes operativos principales:
 * - Dirección
 * - Canal Comercial (B2B)
 * - E-Commerce
 * - Tiendas físicas
 *
 * ⚠️ Actualmente es un dataset estático.
 * En producción podría integrarse con:
 * - Directorios corporativos (LDAP, Azure AD)
 * - Sistemas de recursos humanos
 */

// config/retailTeam.ts

/**
 * Representa un miembro del equipo de Retail.
 *
 * @property id Identificador único del colaborador.
 * @property name Nombre completo.
 * @property role Cargo o rol dentro del área.
 * @property image URL de la imagen de perfil (opcional).
 * @property description Descripción breve del rol o responsabilidades (opcional).
 * @property linkedin Perfil profesional (opcional).
 * @property email Correo corporativo (opcional).
 *
 * @remarks
 * Este tipo está alineado con los requerimientos del componente
 * de presentación de equipos, permitiendo una integración directa
 * con secciones reutilizables de la intranet.
 */
export type DepartmentMember = {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  description?: string;
  linkedin?: string;
  email?: string;
};

/**
 * Listado de miembros del equipo de Retail.
 *
 * @remarks
 * Este arreglo contiene los datos estáticos del equipo,
 * organizados por áreas funcionales del negocio:
 *
 * - Dirección: liderazgo estratégico del área
 * - Comercial: gestión de cuentas y ventas B2B
 * - E-Commerce: canal digital y marketing
 * - Tiendas: operación física y experiencia en punto de venta
 *
 * Permite alimentar componentes como:
 * - {@link DepartmentTeamSection}
 * - vistas de equipo por departamento
 * - directorios internos
 *
 * @example
 * ```ts
 * retailTeam.map(member => member.name);
 * ```
 */
export const retailTeam: DepartmentMember[] = [
  // ── Dirección ────────────────────────────────────────────────
  {
    id:          "elena-martinez",
    name:        "Elena Martínez",
    role:        "Directora de Retail",
    email:       "e.martinez@empresa.com",
    description: "Responsable de los 3 canales de venta. Estrategia P&L y objetivos cross-canal.",
    image:       null,
  },

  // ── Canal Comercial ───────────────────────────────────────────
  {
    id:          "carlos-ruiz",
    name:        "Carlos Ruiz",
    role:        "Key Account Manager",
    email:       "c.ruiz@empresa.com",
    description: "Gestión de grandes cuentas B2B y pipeline comercial.",
    image:       null,
  },
  {
    id:          "sofia-blanco",
    name:        "Sofía Blanco",
    role:        "Sales Executive",
    email:       "s.blanco@empresa.com",
    description: "Prospección, CRM y demos de producto para clientes corporativos.",
    image:       null,
  },
  {
    id:          "marcos-gil",
    name:        "Marcos Gil",
    role:        "Inside Sales",
    email:       "m.gil@empresa.com",
    description: "Gestión de inbound, llamadas de seguimiento y cierre de oportunidades.",
    image:       null,
  },

  // ── Canal E-Commerce ──────────────────────────────────────────
  {
    id:          "lucia-torres",
    name:        "Lucía Torres",
    role:        "E-Commerce Manager",
    email:       "l.torres@empresa.com",
    description: "Responsable de GMV, conversión y experiencia de compra online.",
    image:       null,
  },
  {
    id:          "andres-vega",
    name:        "Andrés Vega",
    role:        "Digital Marketing",
    email:       "a.vega@empresa.com",
    description: "SEO, SEM y campañas de email. ROAS objetivo 4x.",
    image:       null,
  },
  {
    id:          "paula-sanz",
    name:        "Paula Sanz",
    role:        "Catalog & Content",
    email:       "p.sanz@empresa.com",
    description: "Gestión del catálogo online, fotografía de producto y fichas técnicas.",
    image:       null,
  },

  // ── Canal Tiendas ─────────────────────────────────────────────
  {
    id:          "david-mora",
    name:        "David Mora",
    role:        "Retail Operations Manager",
    email:       "d.mora@empresa.com",
    description: "Supervisión operativa de las 8 tiendas físicas y KPIs de red.",
    image:       null,
  },
  {
    id:          "isabel-fuentes",
    name:        "Isabel Fuentes",
    role:        "Store Manager · Centro",
    email:       "i.fuentes@empresa.com",
    description: "Gestión de la tienda flagship con equipo de 12 personas.",
    image:       null,
  },
  {
    id:          "roberto-leal",
    name:        "Roberto Leal",
    role:        "Visual Merchandising",
    email:       "r.leal@empresa.com",
    description: "Escaparates, layout de tienda y PLV para toda la red.",
    image:       null,
  },
];