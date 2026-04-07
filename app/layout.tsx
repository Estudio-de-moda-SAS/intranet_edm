import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "../providers";

export const metadata: Metadata = {
  title: {
    default:  "Intranet · Estudio de Moda S.A.S.",
    template: "%s · Intranet",
  },
  description: "Plataforma interna corporativa de Estudio de Moda S.A.S.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// Script que corre ANTES del render para evitar flash de light → dark.
// Lee localStorage sincrónicamente y aplica clases al <html> inmediatamente.
const ANTI_FOUC_SCRIPT = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('edm_intranet_settings') || '{}');
    var t = (s.appearance && s.appearance.theme) || 'light';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme:dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    var fs = s.accessibility && s.accessibility.fontSize;
    if (fs && fs !== 'md') {
      var m = { sm: '14px', lg: '18px', xl: '20px' };
      if (m[fs]) document.documentElement.style.fontSize = m[fs];
    }
    if (s.appearance && s.appearance.density && s.appearance.density !== 'default') {
      document.documentElement.setAttribute('data-density', s.appearance.density);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        {/* Anti-FOUC: aplica dark mode / font size / densidad antes del primer paint */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="
          min-h-screen bg-slate-50 text-slate-800 antialiased font-sans
          selection:bg-violet-200 selection:text-violet-900
        "
        style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}