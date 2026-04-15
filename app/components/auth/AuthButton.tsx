/**
 * @module AuthButton
 * Componente cliente encargado de gestionar la autenticación del usuario
 * mediante NextAuth.
 *
 * @remarks
 * Este archivo implementa un botón de autenticación condicional que cambia
 * su comportamiento según el estado de sesión del usuario.
 *
 * Su responsabilidad incluye:
 *
 * - Consultar la sesión activa mediante {@link useSession}.
 * - Mostrar un mensaje de bienvenida cuando el usuario ha iniciado sesión.
 * - Permitir el cierre de sesión mediante {@link signOut}.
 * - Permitir el inicio de sesión corporativo mediante {@link signIn}.
 *
 * Actualmente utiliza el proveedor `"azure-ad"` para el proceso de login,
 * por lo que está orientado a autenticación corporativa.
 */

"use client";

import { signIn, signOut, useSession } from "next-auth/react";

/**
 * Componente cliente que renderiza un botón de autenticación dinámico.
 *
 * @returns Interfaz de autenticación según el estado actual de la sesión.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Consulta la sesión actual con {@link useSession}.
 * 2. Si existe una sesión activa, muestra un saludo personalizado
 *    con el nombre del usuario y un botón de cierre de sesión.
 * 3. Si no existe sesión, muestra un botón para iniciar sesión
 *    con el proveedor corporativo `"azure-ad"`.
 *
 * Este componente funciona como un punto de entrada simple para la
 * autenticación del usuario dentro de la interfaz.
 */
export default function AuthButton() {
  /**
   * Sesión actual del usuario autenticado.
   *
   * @remarks
   * Se obtiene mediante el hook {@link useSession}, que permite conocer
   * si existe una sesión activa y acceder a la información básica del usuario.
   */
  const { data: session } = useSession();

  /**
   * Renderizado condicional para usuarios autenticados.
   *
   * @remarks
   * Cuando la sesión existe:
   *
   * - Se muestra un mensaje de bienvenida.
   * - Se intenta mostrar el nombre del usuario autenticado.
   * - Se habilita un botón para cerrar sesión mediante {@link signOut}.
   */
  if (session) {
    return (
      <>
        <p>Bienvenido {session.user?.name}</p>
        <button onClick={() => signOut()}>
          Logout
        </button>
      </>
    );
  }

  /**
   * Renderizado para usuarios no autenticados.
   *
   * @remarks
   * Cuando no existe una sesión activa, se muestra un botón que inicia
   * el flujo de autenticación corporativa usando el proveedor `"azure-ad"`.
   */
  return (
    <button onClick={() => signIn("azure-ad")}>
      Login corporativo
    </button>
  );
}