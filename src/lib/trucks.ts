// Simulated trucks for the live tracking demo (Ipu / Pires Ferreira region)
export type TruckType = "comum" | "seletiva" | "apoio";

export interface TruckDef {
  id: string;
  name: string;
  type: TruckType;
  label: string;
  color: string;
  speedKmh: number;
  route: [number, number][]; // [lat, lng]
  regions: string[];
}

export interface Neighborhood {
  id: string;
  name: string;
  city: "Ipu" | "Pires Ferreira";
  center: [number, number];
  radiusKm: number; // visual radius
  scheduledAt: string; // hh:mm
  truckId: string;
}

// Loose, hand-tuned routes around Ipu (-4.321, -40.713) and Pires Ferreira (-4.254, -40.649)
export const TRUCKS: TruckDef[] = [
  {
    id: "SV-01",
    name: "Caminhão 01",
    type: "comum",
    label: "Coleta Comum",
    color: "#1B5E20",
    speedKmh: 28,
    regions: ["Centro de Ipu", "Bairro Aroeiras", "Av. Principal"],
    route: [
      [-4.3211, -40.7128],
      [-4.3185, -40.7095],
      [-4.3142, -40.7048],
      [-4.3098, -40.6995],
      [-4.3052, -40.6940],
      [-4.3010, -40.6885],
      [-4.2965, -40.6830],
      [-4.2920, -40.6775],
      [-4.2880, -40.6720],
      [-4.2840, -40.6680],
      [-4.2800, -40.6650],
      [-4.2750, -40.6620],
      [-4.2710, -40.6595],
      [-4.2670, -40.6560],
      [-4.2620, -40.6530],
      [-4.2570, -40.6500],
      [-4.2536, -40.6494],
    ],
  },
  {
    id: "SV-02",
    name: "Caminhão 02",
    type: "seletiva",
    label: "Coleta Seletiva",
    color: "#0288D1",
    speedKmh: 22,
    regions: ["Cohab", "Vila São José", "Praça da Matriz"],
    route: [
      [-4.3050, -40.6800],
      [-4.3020, -40.6770],
      [-4.2980, -40.6740],
      [-4.2940, -40.6720],
      [-4.2900, -40.6700],
      [-4.2860, -40.6680],
      [-4.2820, -40.6660],
      [-4.2780, -40.6640],
      [-4.2740, -40.6620],
      [-4.2700, -40.6595],
      [-4.2660, -40.6580],
      [-4.2620, -40.6560],
      [-4.2580, -40.6535],
      [-4.2540, -40.6510],
      [-4.2510, -40.6485],
      [-4.2470, -40.6460],
      [-4.2440, -40.6440],
    ],
  },
  {
    id: "SV-03",
    name: "Caminhão 03",
    type: "apoio",
    label: "Apoio Operacional",
    color: "#81C784",
    speedKmh: 35,
    regions: ["BR-222", "Distrito Industrial", "Zona Rural"],
    route: [
      [-4.2850, -40.6900],
      [-4.2825, -40.6870],
      [-4.2800, -40.6840],
      [-4.2780, -40.6810],
      [-4.2760, -40.6780],
      [-4.2745, -40.6750],
      [-4.2730, -40.6720],
      [-4.2720, -40.6690],
      [-4.2710, -40.6660],
      [-4.2705, -40.6630],
      [-4.2700, -40.6600],
      [-4.2710, -40.6570],
      [-4.2730, -40.6540],
      [-4.2755, -40.6515],
      [-4.2785, -40.6495],
      [-4.2820, -40.6478],
      [-4.2860, -40.6470],
    ],
  },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "n1", name: "Centro de Ipu", city: "Ipu", center: [-4.3211, -40.7128], radiusKm: 0.5, scheduledAt: "07:30", truckId: "SV-01" },
  { id: "n2", name: "Bairro Aroeiras", city: "Ipu", center: [-4.3098, -40.6995], radiusKm: 0.45, scheduledAt: "08:15", truckId: "SV-01" },
  { id: "n3", name: "Cohab", city: "Ipu", center: [-4.3050, -40.6800], radiusKm: 0.4, scheduledAt: "08:50", truckId: "SV-02" },
  { id: "n4", name: "Vila São José", city: "Ipu", center: [-4.2900, -40.6700], radiusKm: 0.4, scheduledAt: "09:30", truckId: "SV-02" },
  { id: "n5", name: "Distrito Industrial", city: "Ipu", center: [-4.2780, -40.6810], radiusKm: 0.5, scheduledAt: "10:10", truckId: "SV-03" },
  { id: "n6", name: "Praça da Matriz", city: "Pires Ferreira", center: [-4.2620, -40.6560], radiusKm: 0.35, scheduledAt: "10:45", truckId: "SV-02" },
  { id: "n7", name: "Centro de Pires Ferreira", city: "Pires Ferreira", center: [-4.2536, -40.6494], radiusKm: 0.45, scheduledAt: "11:20", truckId: "SV-01" },
  { id: "n8", name: "Zona Rural Norte", city: "Pires Ferreira", center: [-4.2440, -40.6440], radiusKm: 0.6, scheduledAt: "12:00", truckId: "SV-03" },
];

// ───────── Geometry helpers ─────────
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function routeLengthKm(route: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) total += haversineKm(route[i], route[i + 1]);
  return total;
}

// Linear interpolation along the polyline, looped (ping-pong)
export function interpolateRoute(route: [number, number][], t: number): [number, number] {
  if (route.length < 2) return route[0];
  const looped = t % 2;
  const pp = looped > 1 ? 2 - looped : looped;
  const total = route.length - 1;
  const f = pp * total;
  const i = Math.min(Math.floor(f), total - 1);
  const local = f - i;
  const [aLat, aLng] = route[i];
  const [bLat, bLng] = route[i + 1];
  return [aLat + (bLat - aLat) * local, aLng + (bLng - aLng) * local];
}

export interface RouteProgress {
  pos: [number, number];
  percent: number; // 0-100 of current direction
  done: [number, number][];
  current: [number, number][]; // small segment around vehicle
  future: [number, number][];
  distDoneKm: number;
  distRemainingKm: number;
  distTotalKm: number;
  etaMin: number;
  direction: "indo" | "voltando";
}

export function routeProgress(truck: TruckDef, t: number): RouteProgress {
  const route = truck.route;
  const looped = t % 2;
  const reversed = looped > 1;
  const pp = reversed ? 2 - looped : looped;
  const directionalRoute = reversed ? [...route].reverse() : route;

  const total = directionalRoute.length - 1;
  const f = pp * total;
  const i = Math.min(Math.floor(f), total - 1);
  const local = f - i;
  const [aLat, aLng] = directionalRoute[i];
  const [bLat, bLng] = directionalRoute[i + 1];
  const pos: [number, number] = [aLat + (bLat - aLat) * local, aLng + (bLng - aLng) * local];

  const done = [...directionalRoute.slice(0, i + 1), pos];
  const current = [pos, directionalRoute[i + 1]];
  const future = directionalRoute.slice(i + 1);

  const distTotalKm = routeLengthKm(directionalRoute);
  const distDoneKm = routeLengthKm(done);
  const distRemainingKm = Math.max(0, distTotalKm - distDoneKm);
  const etaMin = (distRemainingKm / truck.speedKmh) * 60;

  return {
    pos,
    percent: Math.round((distDoneKm / distTotalKm) * 100),
    done,
    current,
    future,
    distDoneKm,
    distRemainingKm,
    distTotalKm,
    etaMin,
    direction: reversed ? "voltando" : "indo",
  };
}

export function nextRegion(truck: TruckDef, t: number): string {
  const pp = (t % 2) > 1 ? "voltando" : "indo";
  const idx = Math.floor((t % 1) * truck.regions.length);
  return `${truck.regions[idx] ?? truck.regions[0]} (${pp})`;
}

// Neighborhood status, based on the assigned truck's progress
export type NeighborhoodStatus = "atendido" | "em-atendimento" | "pendente";

export function neighborhoodStatus(n: Neighborhood, truckPos: [number, number], progressPercent: number, allNeighborhoods: Neighborhood[]): NeighborhoodStatus {
  const distKm = haversineKm(n.center, truckPos);
  if (distKm < 0.6) return "em-atendimento";
  // Rank neighborhoods of this truck by scheduledAt, mark earlier ones as done according to progress
  const peers = allNeighborhoods.filter((x) => x.truckId === n.truckId).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const idx = peers.findIndex((p) => p.id === n.id);
  const cutoff = Math.floor((progressPercent / 100) * peers.length);
  return idx < cutoff ? "atendido" : "pendente";
}
