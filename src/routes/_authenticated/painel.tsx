import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Calendar, History, MapPin, Search, Truck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TRUCKS, NEIGHBORHOODS } from "@/lib/trucks";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel do Cidadão — Siga Verde" }] }),
  component: PainelCidadao,
});

function PainelCidadao() {
  const { user } = useAuth();
  const nome = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "Cidadão";

  const cards = [
    { to: "/mapa", icon: MapPin, title: "Mapa ao vivo", desc: "Veja onde está o caminhão agora", accent: "from-eco-deep to-eco-mid" },
    { to: "/mapa", icon: Truck, title: "Rotas dos caminhões", desc: "Trajeto completo e tempo estimado", accent: "from-smart-blue to-eco-mid" },
    { to: "/mapa", icon: Calendar, title: "Cronograma", desc: "Horário de coleta por bairro", accent: "from-eco-mid to-eco-light" },
    { to: "/mapa", icon: Search, title: "Pesquisar bairro", desc: "Encontre seu bairro no mapa", accent: "from-eco-light to-smart-blue" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="animate-fade-up">
          <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            <span className="text-gradient-eco">{nome}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Acompanhe a coleta urbana em Ipu e Pires Ferreira em tempo real.</p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.title} to={c.to} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-elegant hover:-translate-y-1">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} shadow-soft`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-3 font-display font-bold">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-eco-mid" /><h3 className="font-display font-bold">Notificações</h3></div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-lg bg-eco-light/15 p-3 border border-eco-light/40">🚛 Caminhão SV-01 a 4 min do Centro de Ipu</li>
              <li className="rounded-lg bg-secondary p-3">📅 Coleta seletiva amanhã às 08:50 — Cohab</li>
              <li className="rounded-lg bg-secondary p-3">♻️ Nova matéria na Academia Verde sobre compostagem</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2"><History className="h-4 w-4 text-eco-mid" /><h3 className="font-display font-bold">Histórico de coleta</h3></div>
            <ul className="mt-3 space-y-2 text-sm">
              {NEIGHBORHOODS.slice(0, 5).map((n) => (
                <li key={n.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                  <span>{n.name}</span>
                  <span className="text-xs text-muted-foreground">{n.scheduledAt} · {n.truckId}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Frota ativa: {TRUCKS.length} caminhões</p>
          </div>
        </section>
      </div>
    </div>
  );
}
