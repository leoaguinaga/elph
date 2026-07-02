import React from "react";
import { CTAButton } from "./CTAButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[rgba(17,19,24,0.9)] backdrop-blur-[10px] border-b border-border">
      <div className="max-w-300 mx-auto px-6 md:px-12 h-18 flex items-center justify-between">
        <span className="text-[17px] font-bold tracking-[-0.02em] text-t1">
          Elph
        </span>
        <nav className="flex gap-1 md:gap-2 items-center">
          <div className="hidden md:flex gap-1">
            {[
              ["Producto", "#producto"],
              ["Cómo funciona", "#como-funciona"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="btn-ghost text-sm">
                {label}
              </a>
            ))}
          </div>
          <CTAButton className="btn-ghost text-xs md:text-sm px-3 md:px-4 py-2">
            Iniciar sesión
          </CTAButton>
          <CTAButton className="btn-primary text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 ml-1">
            Probar gratis
          </CTAButton>
        </nav>
      </div>
    </header>
  );
}
