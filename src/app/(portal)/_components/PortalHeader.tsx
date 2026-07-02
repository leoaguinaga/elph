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
    <header className="sticky top-0 z-50 bg-[rgba(17,19,24,0.9)] backdrop-blur-[10px] border-b border-border w-full">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-12 h-16 flex items-center justify-between gap-4">
        <span className="text-xl font-extrabold tracking-[-0.02em] text-t1 flex-shrink-0">
          Elph
        </span>

        <nav className="flex items-center gap-0.5 md:gap-1 overflow-x-auto md:overflow-visible scrollbar-none -mr-4 pr-4 md:mr-0 md:pr-0">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-xs md:text-sm px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-lg transition-colors duration-150 flex-shrink-0",
                  isActive
                    ? "font-medium text-t1 bg-surface-2/65"
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
