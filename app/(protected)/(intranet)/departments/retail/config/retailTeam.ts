// config/retailTeam.ts
// Tipo alineado exactamente con DepartmentMember de DepartmentTeamSection.

export type DepartmentMember = {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  description?: string;
  linkedin?: string;
  email?: string;
};

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