import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Loader2, MapPin, Play, Power, Route as RouteIcon, Truck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TRUCKS, NEIGHBORHOODS } from "@/lib/trucks";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/motorista")({
  head: () => ({ meta: [{ title: "Painel do Motorista — Siga Verde" }] }),
  component: PainelMotorista,
});

function PainelMotorista() {
  const { user } = useAuth();
  const nome = (user?.user_metadata?.full_name as string | undefined) ?? "Motorista";
  const [onShift, setOnShift] = useState(false);
  const [shiftStart, setShiftStart] = useState<Date | null>(null);
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [occurrence, setOccurrence] = useState("");

  // Pick "truck of the day" deterministically from user email
  const truck = TRUCKS[(user?.email?.length ?? 0) % TRUCKS.length];
  const stops = NEIGHBORHOODS.filter((n) => n.truckId === truck.id);

  useEffect(() => {
    if (!sharing) return;
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Não foi possível acessar o GPS"),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [sharing]);

  const startShift = () => { setOnShift(true); setShiftStart(new Date()); setSharing(true); toast.success("Turno iniciado. GPS compartilhado."); };
  const endShift = () => { setOnShift(false); setSharing(false); setShiftStart(null); setCompleted(new Set()); toast.info("Turno encerrado."); };
  const toggleStop = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const reportOccurrence = () => {
    if (occurrence.trim().length < 4) { toast.error("Descreva a ocorrência"); return; }
    toast.success("Ocorrência registrada", { description: occurrence });
    setOccurrence("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-sm text-muted-foreground">Motorista</p>
            <h1 className="font-display text-3xl font-bold">{nome}</h1>
            <p className="mt-1 text-muted-foreground flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" style={{ color: truck.color }} /> {truck.name} · {truck.label}
            </p>
          </div>
          {onShift ? (
            <button onClick={endShift} className="inline-flex items-center gap-2 rounded-xl bg-destructive text-white px-4 py-2.5 text-sm font-semibold shadow-soft hover:opacity-95">
              <Power className="h-4 w-4" /> Encerrar turno
            </button>
          ) : (
            <button onClick={startShift} className="inline-flex items-center gap-2 rounded-xl bg-gradient-eco text-white px-4 py-2.5 text-sm font-semibold shadow-elegant hover:opacity-95">
              <Play className="h-4 w-4" /> Iniciar turno
            </button>
          )}
        </header>

        {onShift && (
          <div className="mt-4 glass rounded-2xl p-4 shadow-soft flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-eco-deep">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eco-mid opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-eco-mid" /></span>
              Em operação
            </span>
            {shiftStart && <span className="text-muted-foreground">Iniciado às {shiftStart.toLocaleTimeString("pt-BR")}</span>}
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {sharing ? (coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : <><Loader2 className="h-3 w-3 animate-spin" /> obtendo GPS...</>) : "GPS pausado"}
            </span>
          </div>
        )}

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-eco-mid" /><h3 className="font-display font-bold">Rota do dia</h3></div>
              <span className="text-xs text-muted-foreground">{completed.size}/{stops.length} concluídos</span>
            </div>
            <ul className="mt-3 space-y-2">
              {stops.map((s) => {
                const done = completed.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => toggleStop(s.id)}
                      disabled={!onShift}
                      className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition disabled:opacity-50 ${done ? "bg-eco-light/20 border-eco-mid" : "bg-secondary border-border hover:bg-white"}`}
                    >
                      <span className="flex items-center gap-3">
                        <CheckCircle2 className={`h-5 w-5 ${done ? "text-eco-deep" : "text-muted-foreground"}`} />
                        <span>
                          <span className="block font-semibold text-sm">{s.name}</span>
                          <span className="block text-[11px] text-muted-foreground">{s.city} · previsto {s.scheduledAt}</span>
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-eco-deep">{done ? "Concluído" : "Pendente"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /><h3 className="font-display font-bold">Reportar ocorrência</h3></div>
            <p className="mt-1 text-xs text-muted-foreground">Vias bloqueadas, problemas mecânicos, descarte irregular, etc.</p>
            <textarea
              value={occurrence}
              onChange={(e) => setOccurrence(e.target.value)}
              rows={4}
              placeholder="Descreva o que aconteceu..."
              className="mt-3 w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-eco-mid focus:ring-2 focus:ring-eco-light/40"
            />
            <button onClick={reportOccurrence} disabled={!onShift} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-eco-deep text-white px-4 py-2 text-sm font-semibold shadow-soft hover:opacity-95 disabled:opacity-50">
              Enviar ocorrência
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
