import { Link } from "@tanstack/react-router";
import { Leaf, Mail, MapPin, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-eco shadow-soft">
                <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold">Siga<span className="text-gradient-eco">Verde</span></span>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Plataforma inteligente de rastreamento da coleta urbana. Acompanhe a coleta. Transforme o futuro.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Plataforma</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/mapa" className="hover:text-primary">Mapa ao Vivo</Link></li>
              <li><Link to="/academia" className="hover:text-primary">Academia Verde</Link></li>
              <li><Link to="/sobre" className="hover:text-primary">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Contato</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /><span>Ipu · Pires Ferreira, CE</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span>contato@sigaverde.app</span></li>
              <li className="flex items-center gap-2"><Github className="h-4 w-4 shrink-0" /><span>github.com/sigaverde</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Siga Verde. Todos os direitos reservados.</p>
          <p>Versão demonstração · GPS simulado para fins de apresentação</p>
        </div>
      </div>
    </footer>
  );
}
