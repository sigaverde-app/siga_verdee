import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/mapa", label: "Mapa ao Vivo" },
  { to: "/academia", label: "Academia Verde" },
  { to: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-eco shadow-soft transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5 text-white" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">
              Siga<span className="text-gradient-eco">Verde</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Smart City
            </span>
          </div>
        </Link>

        {/* DESKTOP */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const active = path === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}

                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 bg-gradient-eco rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  path === item.to
                    ? "bg-secondary text-primary"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}