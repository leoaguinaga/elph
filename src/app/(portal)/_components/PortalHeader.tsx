"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/split",     label: "Mi Split" },
  { href: "/exercises", label: "Ejercicios" },
  { href: "/progress",  label: "Progreso" },
  { href: "/profile",   label: "Perfil" },
];

export function PortalHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-[rgba(17,19,24,0.9)] backdrop-blur-[10px] border-b border-border">
      <div className="max-w-[1280px] mx-auto px-12 h-16 flex items-center justify-between">
        <span className="text-xl font-extrabold tracking-[-0.01em] text-t1">
          Elph
        </span>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-sm px-3.5 py-2 rounded-lg transition-colors duration-150",
                  isActive
                    ? "font-medium text-t1"
                    : "font-normal text-t2 hover:text-t1",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
