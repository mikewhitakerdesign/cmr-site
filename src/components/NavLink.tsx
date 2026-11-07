"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/** True when `pathname` is `href` or a child route of it (e.g. /hills/x → /hills). */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Internal link that marks itself `aria-current="page"` for the current
 * section. Kept as a tiny client island so the header stays a Server
 * Component (usePathname is client-only).
 */
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  return <Link href={href} aria-current={isActivePath(pathname, href) ? "page" : undefined} {...props} />;
}
