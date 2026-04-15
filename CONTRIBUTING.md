# Cómo documentar código en este proyecto

La documentación se genera automáticamente con TypeDoc a partir de comentarios
JSDoc en el código. Sigue estas convenciones para mantener consistencia.

---

## Comandos

| Comando | Descripción |
|---|---|
| `npm run docs:generate` | Genera el sitio estático en `docs/` |
| `npm run docs:watch` | Regenera automáticamente al guardar |

---

## Estructura de un comentario

Los comentarios van pegados justo encima de lo que documentan, sin líneas vacías
entre el comentario y el código.

```ts
/**
 * Descripción breve de lo que hace.
 *
 * @param nombre - Descripción del parámetro
 * @returns Descripción de lo que retorna
 *
 * @example
 * ```ts
 * miFuncion("hola") // → "HOLA"
 * ```
 */
export function miFuncion(nombre: string): string {
  return nombre.toUpperCase();
}
```

---

## Etiquetas disponibles

| Etiqueta | Cuándo usarla |
|---|---|
| `@param` | Describir cada parámetro de una función |
| `@returns` | Describir lo que retorna la función |
| `@example` | Agregar un ejemplo de uso |
| `@remarks` | Notas adicionales o contexto importante |
| `@throws` | Si la función puede lanzar un error |
| `@module` | Nombre limpio del módulo (va al inicio del archivo) |

---

## Qué documentar

**Sí documentar:**
- Funciones y métodos exportados
- Interfaces y tipos exportados
- Constantes exportadas con lógica de negocio (`PERMISSION_MAP`, `DEPARTMENTS`, etc.)
- Campos de interfaces que no sean obvios por su nombre

**No es necesario documentar:**
- Variables locales dentro de funciones
- Helpers internos de una sola línea obvios por su nombre
- Archivos de configuración de Next.js o Tailwind

---

## Cómo se ve en la documentación

Un comentario como este en `lib/roles.ts`:

```ts
/**
 * Verifica si un usuario tiene permiso para ejecutar una acción.
 *
 * @param userLevel - Nivel del usuario autenticado
 * @param permission - Permiso requerido en formato `módulo:acción`
 * @returns `true` si el nivel es suficiente
 */
export function can(userLevel: AccessLevel, permission: Permission): boolean {}
```

Genera una página con el nombre de la función, su descripción, una tabla
de parámetros con tipos y descripciones, y el valor de retorno.

---

## Agregar un archivo nuevo a la documentación

Si creas un archivo nuevo que deba aparecer en el sitio, agrégalo en `typedoc.json`:

```json
{
  "entryPoints": [
    "lib/roles.ts",
    "lib/microsoft-graph.ts",
    "tu-archivo-nuevo.ts"
  ]
}
```

Y agrega el `@module` al inicio del archivo con un nombre legible:

```ts
/**
 * @module Nombre del Módulo
 */
```

Luego corre `npm run docs:generate` para ver los cambios.