/**
 * @module Card
 * Conjunto de componentes base para construir tarjetas reutilizables.
 *
 * @remarks
 * Este archivo define una API compuesta (Card + subcomponentes)
 * para estructurar contenido en bloques visuales consistentes.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Contenedor principal de tarjeta.
 *
 * @remarks
 * Provee estilos base (bordes, fondo, sombra) y permite composición
 * con los subcomponentes: Header, Content y Footer.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-white text-black shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * Sección superior de la tarjeta.
 *
 * @remarks
 * Usada para títulos, subtítulos o encabezados.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Título principal de la tarjeta.
 *
 * @remarks
 * Generalmente usado dentro de {@link CardHeader}.
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Descripción secundaria de la tarjeta.
 *
 * @remarks
 * Complementa al título con texto adicional.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Contenido principal de la tarjeta.
 *
 * @remarks
 * Área donde se renderiza la información central.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * Pie de la tarjeta.
 *
 * @remarks
 * Usado para acciones, botones o información adicional.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};