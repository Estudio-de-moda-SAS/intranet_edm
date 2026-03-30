// app/components/ui/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function NavLink({ href, children, className = "", activeClassName = "" }: NavLinkProps) {
  const pathname = usePathname();
  const [isPending] = useTransition();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={true} // precarga la página en background
      className={`
        ${className}
        ${isActive ? activeClassName : ""}
        ${isPending ? "opacity-60" : "opacity-100"}
        transition-opacity duration-150
      `}
    >
      {children}
    </Link>
  );
}