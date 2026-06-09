import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bell, Clock, Crosshair, Gauge, Leaf, Locate, MapPin, Navigation, Recycle, Search, Truck, Wrench, Zap } from "lucide-react";
import { TRUCKS, NEIGHBORHOODS, routeProgress, haversineKm, neighborhoodStatus } from "@/lib/trucks";

const LiveMap = lazy(() => import("@/components/live-map").then((m) => ({ default: m.LiveMap })));

export const Route = createFileRoute("/mapa")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mapa ao Vivo da Coleta de Lixo — Ipu e Pires Ferreira | Siga Verde" },
      { name: "description", content: "Acompanhe em tempo real os caminhões de coleta de lixo em Ipu e Pires Ferreira no mapa OpenStreetMap. Veja rotas, ETA e o status de cada bairro." },
      { name: "keywords", content: "coleta de lixo Ipu, coleta seletiva Pires Ferreira, caminhão de lixo tempo real, OpenStreetMap, Siga Verde" },
      { property: "og:title", content: "Mapa ao Vivo — Siga Verde" },
      { property: "og:description", content: "Veja onde está o caminhão da coleta agora." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://siga-verde-map.lovable.app/mapa" },
    ],
    links: [{ rel: "canonical", href: "https://siga-verde-map.lovable.app/mapa" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Rastreamento da Coleta Urbana — Siga Verde",
          serviceType: "Coleta de resíduos urbanos",
          areaServed: [
            { "@type": "City", name: "Ipu", addressRegion: "CE", addressCountry: "BR" },
            { "@type": "City", name: "Pires Ferreira", addressRegion: "CE", addressCountry: "BR" },
          ],
          provider: { "@type": "Organization", name: "Siga Verde" },
        }),
      },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const [now, setNow] = useState(new Date());
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [focusPos, setFocusPos] = useState<[number, number] | null>(null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [proximity, setProximity] = useState<string | null>(null);

  useEffect(() => {
    const i = setInterval(() => { setNow(new Date()); setTick((x) => x + 1); }, 1000);
    return () => clearInterval(i);
  }, []);

  // Live truck snapshots for the side panel (independent of map states for simplicity)
  const truckSnaps = useMemo(() => {
    const t0 = Date.now();
    return TRUCKS.map((truck, idx) => {
      const t = ((t0 / 1000 + idx * 40) / 180) % 2;
      return { truck, progress: routeProgress(truck, t), t };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Proximity alert: if user has location & a truck < 400m
  useEffect(() => {
    if (!userPos) return;
    const near = truckSnaps.find((s) => haversineKm(s.progress.pos, userPos) < 0.4);
    setProximity(near ? near.truck.name : null);
  }, [userPos, truckSnaps]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Array<{ kind: "bairro" | "rua"; label: string; subtitle: string; pos: [number, number]; truckId?: string }>;
    const hits: Array<{ kind: "bairro" | "rua"; label: string; subtitle: string; pos: [number, number]; truckId?: string }> = [];
    NEIGHBORHOODS.forEach((n) => {
      if (n.name.toLowerCase().includes(q) || n.city.toLowerCase().includes(q)) {
        hits.push({ kind: "bairro", label: n.name, subtitle: `${n.city} · ${n.scheduledAt}`, pos: n.center, truckId: n.truckId });
      }
    });
    TRUCKS.forEach((t) => {
      t.regions.forEach((r, i) => {
        if (r.toLowerCase().includes(q)) {
          hits.push({ kind: "rua", label: r, subtitle: `${t.label} · ${t.name}`, pos: t.route[Math.min(i * 4, t.route.length - 1)], truckId: t.id });
        }
      });
    });
    return hits.slice(0, 6);
  }, [query]);

  const handleWhereIsMyTruck = () => {
    // Pick truck nearest to user (or first), focus + follow
    const target = userPos
      ? [...truckSnaps].sort((a, b) => haversineKm(a.progress.pos, userPos) - haversineKm(b.progress.pos, userPos))[0]
      : truckSnaps[0];
    setFocusPos(target.progress.pos);
    setFollowId(target.truck.id);
  };

  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        setUserPos(pos);
        setFocusPos(pos);
      },
      () => {
        // fallback: center on Ipu
        const fallback: [number, number] = [-4.321, -40.713];
        setUserPos(fallback);
        setFocusPos(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const stats = [
    { label: "Caminhões em operação", value: String(TRUCKS.length), icon: Truck, accent: "text-eco-deep" },
    { label: "Coletas hoje", value: "127", icon: Activity, accent: "text-smart-blue" },
    { label: "Km percorridos", value: truckSnaps.reduce((a, s) => a + s.progress.distDoneKm, 0).toFixed(0), icon: Gauge, accent: "text-eco-mid" },
    { label: "CO₂ economizado", value: "412kg", icon: Leaf, accent: "text-eco-deep" },
    { label: "Bairros atendidos", value: String(NEIGHBORHOODS.length), icon: MapPin, accent: "text-smart-blue" },
  ];

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-secondary">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Carregando mapa...</div>}>
        <LiveMap
          focusedTruckId={null}
          focusPos={focusPos}
          followTruckId={followId}
          userPos={userPos}
          onSelect={(s) => setFollowId(s.truck.id)}
        />
      </Suspense>

      {/* Top bar */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-[400] flex flex-wrap justify-between gap-3">
        <div className="glass pointer-events-auto rounded-2xl px-4 py-2.5 shadow-elegant flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eco-mid opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-eco-mid" />
          </span>
          <span className="text-sm font-semibold">Ao Vivo</span>
          <span className="text-xs text-muted-foreground">· {now.toLocaleTimeString("pt-BR")}</span>
        </div>

        {/* Search */}
        <div className="glass pointer-events-auto rounded-2xl px-3 py-2 shadow-elegant flex-1 max-w-md min-w-[240px] relative">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bairro ou rua..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 glass rounded-xl shadow-elegant overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setFocusPos(r.pos); if (r.truckId) setFollowId(r.truckId); setQuery(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/70 border-b border-border/40 last:border-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-eco-mid" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.label}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{r.subtitle}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass pointer-events-auto hidden md:flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-elegant">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Ipu · Pires Ferreira · CE</span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="absolute left-4 top-20 z-[400] flex flex-col gap-2">
        <button
          onClick={handleWhereIsMyTruck}
          className="pointer-events-auto rounded-2xl bg-gradient-eco text-white px-4 py-2.5 shadow-elegant flex items-center gap-2 text-sm font-semibold hover:opacity-95 transition"
        >
          <Navigation className="h-4 w-4" /> Onde está meu caminhão?
        </button>
        <button
          onClick={handleLocateMe}
          className="pointer-events-auto rounded-2xl glass px-4 py-2.5 shadow-elegant flex items-center gap-2 text-sm font-medium hover:bg-white/90 transition"
        >
          <Locate className="h-4 w-4 text-smart-blue" /> Minha localização
        </button>
        {followId && (
          <button
            onClick={() => setFollowId(null)}
            className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-2 shadow-soft flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Crosshair className="h-3.5 w-3.5" /> Parar de seguir
          </button>
        )}
      </div>

      {/* Proximity alert */}
      {proximity && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[500] pointer-events-auto animate-fade-up">
          <div className="glass rounded-2xl px-4 py-3 shadow-elegant flex items-center gap-3 border-l-4 border-eco-mid">
            <Bell className="h-5 w-5 text-eco-deep" />
            <div className="text-sm">
              <div className="font-semibold">{proximity} está próximo!</div>
              <div className="text-xs text-muted-foreground">A coleta está chegando perto de você.</div>
            </div>
          </div>
        </div>
      )}

      {/* Side dashboard */}
      <aside className="absolute right-4 top-20 bottom-4 z-[400] w-[340px] max-w-[calc(100vw-2rem)] hidden lg:flex flex-col gap-3 overflow-y-auto">
        <div className="glass rounded-2xl p-4 shadow-elegant animate-fade-up">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Zap className="h-3.5 w-3.5" /> Painel em tempo real
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/70 p-3 border border-border/60">
                <s.icon className={`h-4 w-4 ${s.accent}`} />
                <div className="mt-2 text-xl font-bold font-display">{s.value}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-elegant animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm">Frota ativa</h3>
            <span className="text-[11px] text-muted-foreground">{TRUCKS.length} unidades</span>
          </div>
          <div className="mt-3 space-y-2">
            {truckSnaps.map((s) => {
              const Icon = s.truck.type === "comum" ? Truck : s.truck.type === "seletiva" ? Recycle : Wrench;
              const isFollowing = followId === s.truck.id;
              return (
                <button
                  key={s.truck.id}
                  onClick={() => { setFocusPos(s.progress.pos); setFollowId(s.truck.id); }}
                  className={`w-full text-left flex items-start gap-3 rounded-xl p-3 border transition ${isFollowing ? "bg-eco-light/20 border-eco-mid" : "bg-white/70 border-border/60 hover:bg-white/95"}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: s.truck.color }}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{s.truck.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-eco-light/30 text-eco-deep">{s.truck.id}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{s.truck.label}</div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-gray-200/70 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.progress.percent}%`, background: s.truck.color }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>{s.progress.percent}% · {s.progress.distRemainingKm.toFixed(1)} km</span>
                      <span>ETA {Math.max(1, Math.round(s.progress.etaMin))} min</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-elegant animate-fade-up">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-smart-blue" />
            <h3 className="font-display font-bold text-sm">Bairros & status</h3>
          </div>
          <div className="mt-3 space-y-1.5">
            {NEIGHBORHOODS.map((n) => {
              const assigned = truckSnaps.find((s) => s.truck.id === n.truckId);
              const status = assigned ? neighborhoodStatus(n, assigned.progress.pos, assigned.progress.percent, NEIGHBORHOODS) : "pendente";
              const dot = status === "atendido" ? "bg-eco-deep" : status === "em-atendimento" ? "bg-orange-500 animate-pulse" : "bg-slate-400";
              const label = status === "atendido" ? "Atendido" : status === "em-atendimento" ? "Em atendimento" : "Pendente";
              return (
                <button
                  key={n.id}
                  onClick={() => setFocusPos(n.center)}
                  className="w-full text-left flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 border border-border/60 hover:bg-white/95"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{n.name}</div>
                      <div className="text-[10px] text-muted-foreground">{n.city} · {label}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-eco-deep">{n.scheduledAt}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Roteamento simulado via OpenStreetMap para demonstração.</p>
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      <div className="lg:hidden absolute bottom-4 left-4 right-4 z-[400] glass rounded-2xl p-3 shadow-elegant">
        <div className="flex gap-2 overflow-x-auto">
          {truckSnaps.map((s) => {
            const Icon = s.truck.type === "comum" ? Truck : s.truck.type === "seletiva" ? Recycle : Wrench;
            return (
              <button
                key={s.truck.id}
                onClick={() => { setFocusPos(s.progress.pos); setFollowId(s.truck.id); }}
                className="shrink-0 rounded-xl bg-white/80 p-2.5 border border-border/60 min-w-[170px] text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: s.truck.color }}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="text-xs font-semibold">{s.truck.name}</div>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{s.progress.percent}% · ETA {Math.round(s.progress.etaMin)} min</div>
                <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.progress.percent}%`, background: s.truck.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
