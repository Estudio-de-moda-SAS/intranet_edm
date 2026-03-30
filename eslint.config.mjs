import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  // ─── Bases (tu configuración original) ────────────────────────
  ...nextVitals,   // reglas de Next.js + performance (LCP, CLS, etc.)
  ...nextTs,       // reglas de @typescript-eslint recomendadas

  // ─── Prettier — debe ir después de las bases ──────────────────
  // desactiva las reglas de ESLint que chocarían con el formato de Prettier
  { name: "prettier", rules: { "prettier/prettier": "error" } },

  // ─── Reglas personalizadas ────────────────────────────────────
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",           // prohibe 'any' — usa tipos reales
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },                           // parámetros con _ se permiten ignorar
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },                            // import type { User } en vez de import { User }
      ],
      "@typescript-eslint/no-floating-promises": "error",      // toda promesa debe tener await o .catch()

      // React
      "react/self-closing-comp": "error",                      // <Comp /> en vez de <Comp></Comp>
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },                 // sin llaves innecesarias en JSX
      ],

      // Calidad general
      "no-console": ["warn", { allow: ["warn", "error"] }],    // console.log en producción = warning
      "prefer-const": "error",                                  // usa const cuando la variable no cambia
      "no-var": "error",                                        // prohibe var, solo let y const
      "eqeqeq": ["error", "always"],                           // === en vez de ==, siempre
    },
  },

  // ─── Exclusiones (tu configuración original + extras) ─────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "public/**",
  ]),
])

export default eslintConfig
