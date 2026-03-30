import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  kpis: {
    gmvMes:             "$198K",
    ordenesOnline:      "2,341",
    tasaConversion:     "3.8%",
    tasaDevolucion:     "2.1%",
    productosActivos:   "1,847",
    calificacionMedia:  "4.7★",
    uptimePlataforma:   "98%",
    alertasActivas:     "4",
  },
  orders: [
    { id: "o1", client: "María López",    product: "Zapatillas Run X", amount: "$129", status: "En tránsito", date: "2026-03-08" },
    { id: "o2", client: "Carlos Ruiz",    product: "Camiseta Dry Fit", amount: "$45",  status: "Pendiente",   date: "2026-03-09" },
    { id: "o3", client: "Ana Martínez",   product: "Mochila Urban",    amount: "$89",  status: "Entregado",   date: "2026-03-07" },
    { id: "o4", client: "Luis Herrera",   product: "Short Training",   amount: "$38",  status: "Cancelado",   date: "2026-03-06" },
  ],
  catalog: [
    { id: "c1", name: "Zapatillas Run X",  stock: 142, price: "$129", status: "Activo",     category: "Calzado"    },
    { id: "c2", name: "Camiseta Dry Fit",  stock: 0,   price: "$45",  status: "Sin stock",  category: "Ropa"       },
    { id: "c3", name: "Mochila Urban",     stock: 58,  price: "$89",  status: "Activo",     category: "Accesorios" },
    { id: "c4", name: "Short Training",    stock: 23,  price: "$38",  status: "Activo",     category: "Ropa"       },
  ],
  reviews: [
    { id: "r1", product: "Zapatillas Run X", rating: 5, author: "María L.", comment: "Excelente calidad y comodidad." },
    { id: "r2", product: "Mochila Urban",    rating: 4, author: "Carlos R.", comment: "Muy buena, espaciosa y resistente." },
    { id: "r3", product: "Camiseta Dry Fit", rating: 5, author: "Ana M.",   comment: "Perfecta para entrenar." },
  ],
  alerts: [
    { id: "al1", message: "34 productos con stock bajo (<5 unidades)", severity: "high"   },
    { id: "al2", message: "Tasa de abandono de carrito subió al 68%",  severity: "medium" },
    { id: "al3", message: "2 órdenes sin procesar hace +24h",          severity: "high"   },
    { id: "al4", message: "Certificado SSL vence en 12 días",          severity: "low"    },
  ],
};

export async function getEcommerceData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

  // Alertas desde tareas importantes en To Do
const tasks = await getHighPriorityTasks(token)

const alerts = tasks.map(t => ({
  id:       t.id,
  message:  t.title,
  severity: "high" as const,
}))

  return {
    ...shared,
    // KPIs, orders, catalog y reviews vienen de tu plataforma e-commerce
    // cuando tengas la integración, los agregas aquí
    kpis:    MOCK_DATA.kpis,
    orders:  MOCK_DATA.orders,
    catalog: MOCK_DATA.catalog,
    reviews: MOCK_DATA.reviews,
    alerts:  alerts.length > 0 ? alerts : MOCK_DATA.alerts,
  };
}

export type EcommerceData = Awaited<ReturnType<typeof getEcommerceData>>;