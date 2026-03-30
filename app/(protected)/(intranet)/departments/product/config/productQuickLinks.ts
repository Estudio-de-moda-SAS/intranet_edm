// app/product/config/productQuickLinks.ts

export type QuickLink = {
  label:    string;
  href:     string;
  icon:     string; // Lucide icon name as string, resolved in QuickLinksSection
  external?: boolean;
};

export const productQuickLinks: QuickLink[] = [
  { label: "Roadmap público",         href: "/product/roadmap",              icon: "Map"         },
  { label: "Board de sprints",        href: "/product/sprints",              icon: "LayoutGrid"  },
  { label: "Repositorio de diseños",  href: "https://figma.com/team/acme",   icon: "Figma",      external: true },
  { label: "User research & hallazgos", href: "/product/research",           icon: "Users"       },
  { label: "Feature flags",           href: "/product/flags",                icon: "ToggleLeft"  },
  { label: "Changelog",               href: "/product/changelog",            icon: "ScrollText"  },
  { label: "OKRs de producto",        href: "/product/okrs",                 icon: "Target"      },
  { label: "Documentación técnica",   href: "https://docs.acme.com",         icon: "BookOpen",   external: true },
];
