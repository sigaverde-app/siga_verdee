import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  TRUCKS,
  NEIGHBORHOODS,
  routeProgress,
  neighborhoodStatus,
  nextRegion,
  type TruckDef,
  type RouteProgress,
  type Neighborhood,
} from "@/lib/trucks";
import { Activity, Gauge, Leaf, MapPin, Recycle, Truck, Wrench } from "lucide-react";

const CENTER: [number, number] = [-4.287, -40.681];

/* =========================
   ICONS
========================= */

function truckIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:${color}33;animation:pulse-ring 2s ease-out infinite;"></div>
        <div style="position:absolute;inset:6px;border-radius:9999px;background:${color};box-shadow:0 6px 20px ${color}66;display:flex;align-items:center;justify-content:center;border:2px solid white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:#0288D1;border:3px solid white;box-shadow:0 4px 12px rgba(2,136,209,.6);"></div>`,
  });
}

function typeIcon(type: TruckDef["type"]) {
  if (type === "comum") return Truck;
  if (type === "seletiva") return Recycle;
  return Wrench;
}

/* =========================
   COLORS
========================= */

const NEIGHBORHOOD_COLORS: Record<string, string> = {
  atendido: "#1B5E20",
  "em-atendimento": "#F57C00",
  pendente: "#90A4AE",
};

/* =========================
   FIT MAP
========================= */

function FitOnce() {
  const map = useMap();

  useEffect(() => {
    const all: [number, number][] = TRUCKS.flatMap((t) => t.route);
    map.fitBounds(L.latLngBounds(all).pad(0.15));
  }, [map]);

  return null;
}

/* =========================
   MAP CONTROLLER
========================= */

function MapController({
  focus,
  follow,
  followPos,
}: {
  focus?: [number, number];
  follow?: boolean;
  followPos?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (focus) map.flyTo(focus, 15, { duration: 1.2 });
  }, [focus, map]);

  useEffect(() => {
    if (follow && followPos) {
      map.panTo(followPos, { animate: true });
    }
  }, [follow, followPos, map]);

  return null;
}

/* =========================
   SIMULAÇÃO MELHORADA
========================= */

export interface TruckState {
  truck: TruckDef;
  pos: [number, number];
  t: number;
  progress: RouteProgress;
  status: "Em operação" | "Em deslocamento";
  speed: number;
  updatedAt: Date;
}

export function useTruckSimulation(): TruckState[] {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const prevPosRef = useRef<Map<string, [number, number]>>(new Map());

  return useMemo(() => {
    const now = Date.now();

    return TRUCKS.map((truck, idx) => {
      // 🚛 movimento contínuo suave
      const speedFactor = 0.00003;
      const offset = idx * 0.18;

      const t = (now * speedFactor + offset) % 1;

      const progress = routeProgress(truck, t);

      const current = progress.pos;

      // 🌊 suavização (interpolação)
      const prev = prevPosRef.current.get(truck.id);

      const pos: [number, number] = prev
        ? [
            prev[0] + (current[0] - prev[0]) * 0.2,
            prev[1] + (current[1] - prev[1]) * 0.2,
          ]
        : current;

      prevPosRef.current.set(truck.id, pos);

      const speed =
        truck.speedKmh + Math.sin(now / 4000 + idx) * 6;

      return {
        truck,
        pos,
        t,
        progress,
        status: (idx + tick) % 5 === 0 ? "Em deslocamento" : "Em operação",
        speed: Math.round(Math.max(15, speed)),
        updatedAt: new Date(),
      };
    });
  }, [tick]);
}

/* =========================
   LIVE MAP
========================= */

interface LiveMapProps {
  onSelect?: (s: TruckState) => void;
  focusedTruckId?: string | null;
  focusPos?: [number, number] | null;
  followTruckId?: string | null;
  userPos?: [number, number] | null;
}

export function LiveMap({
  onSelect,
  focusedTruckId,
  focusPos,
  followTruckId,
  userPos,
}: LiveMapProps) {
  const states = useTruckSimulation();

  const focusState = focusedTruckId
    ? states.find((s) => s.truck.id === focusedTruckId)
    : null;

  const followState = followTruckId
    ? states.find((s) => s.truck.id === followTruckId)
    : null;

  const focusTarget = focusPos ?? focusState?.pos;

  return (
    <MapContainer
      center={CENTER}
      zoom={13}
      className="h-full w-full"
      zoomControl
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <FitOnce />
      <MapController
        focus={focusTarget ?? undefined}
        follow={!!followState}
        followPos={followState?.pos}
      />

      {/* ================= NEIGHBORHOODS ================= */}
      {NEIGHBORHOODS.map((n) => {
        const assigned = states.find((s) => s.truck.id === n.truckId);

        const status = assigned
          ? neighborhoodStatus(
              n,
              assigned.pos,
              assigned.progress.percent,
              NEIGHBORHOODS
            )
          : "pendente";

        const color = NEIGHBORHOOD_COLORS[status];

        return (
          <Circle
            key={n.id}
            center={n.center}
            radius={n.radiusKm * 1000}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: status === "em-atendimento" ? 0.25 : 0.12,
              weight: 2,
              dashArray: status === "pendente" ? "4 4" : undefined,
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-sm">{n.name}</div>
                <div className="text-xs text-gray-500">{n.city}</div>
              </div>
            </Popup>
          </Circle>
        );
      })}

      {/* ================= ROUTES ================= */}
      {states.map((s) => (
        <Fragment key={s.truck.id}>
          <Polyline positions={s.progress.future} pathOptions={{ color: "#90A4AE", weight: 4, opacity: 0.5 }} />
          <Polyline positions={s.progress.done} pathOptions={{ color: s.truck.color, weight: 5 }} />
          <Polyline positions={s.progress.current} pathOptions={{ color: "#F57C00", weight: 6 }} />
        </Fragment>
      ))}

      {/* ================= USER ================= */}
      {userPos && (
        <Marker position={userPos} icon={userIcon()}>
          <Popup>Sua localização</Popup>
        </Marker>
      )}

      {/* ================= TRUCKS ================= */}
      {states.map((s) => {
        const Icon = typeIcon(s.truck.type);

        return (
          <Marker
            key={s.truck.id}
            position={s.pos}
            icon={truckIcon(s.truck.color)}
            eventHandlers={{ click: () => onSelect?.(s) }}
          >
            <Popup>
              <div className="min-w-[220px]">
                <div className="font-semibold">{s.truck.name}</div>
                <div className="text-xs text-gray-500">{s.truck.label}</div>

                <div className="mt-2 text-xs flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  {s.status}
                </div>

                <div className="text-xs flex items-center gap-2">
                  <Gauge className="h-3 w-3" />
                  {s.speed} km/h
                </div>

                <div className="text-xs flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {nextRegion(s.truck, s.t)}
                </div>

                <div className="mt-2 text-xs">
                  Progresso: {s.progress.percent}%
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}