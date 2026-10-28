import { showEmployeeNotification } from "./reminders";
import type { Geofence } from "./types";

const STATE_KEY = "txr-geofence-state-v1";
const COOLDOWN_MS = 10 * 60 * 1000; // avoid re-notifying the same crossing quickly

export type GeofenceInsideMap = Record<string, boolean>;

type FiredMap = Record<string, string>;

function loadInsideMap(employeeId: string): GeofenceInsideMap {
  try {
    const raw = localStorage.getItem(`${STATE_KEY}:inside:${employeeId}`);
    if (!raw) return {};
    return JSON.parse(raw) as GeofenceInsideMap;
  } catch {
    return {};
  }
}

function saveInsideMap(employeeId: string, map: GeofenceInsideMap) {
  localStorage.setItem(`${STATE_KEY}:inside:${employeeId}`, JSON.stringify(map));
}

function loadFired(): FiredMap {
  try {
    return JSON.parse(localStorage.getItem(`${STATE_KEY}:fired`) || "{}") as FiredMap;
  } catch {
    return {};
  }
}

function markFired(key: string) {
  const map = loadFired();
  map[key] = new Date().toISOString();
  const keys = Object.keys(map);
  if (keys.length > 80) {
    keys
      .sort((a, b) => (map[a] ?? "").localeCompare(map[b] ?? ""))
      .slice(0, keys.length - 50)
      .forEach((k) => delete map[k]);
  }
  localStorage.setItem(`${STATE_KEY}:fired`, JSON.stringify(map));
}

function recentlyFired(key: string) {
  const at = loadFired()[key];
  if (!at) return false;
  return Date.now() - new Date(at).getTime() < COOLDOWN_MS;
}

/** Haversine distance in meters. */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Exit hysteresis so GPS jitter near the edge does not flip-flop. */
export function exitRadiusMeters(fence: Geofence) {
  return fence.radiusM + Math.max(25, Math.round(fence.radiusM * 0.15));
}

export function isInsideFence(
  point: { lat: number; lng: number },
  fence: Geofence,
  previouslyInside: boolean,
): boolean {
  const d = distanceMeters(point, { lat: fence.lat, lng: fence.lng });
  if (previouslyInside) return d <= exitRadiusMeters(fence);
  return d <= fence.radiusM;
}

export type GeofenceEvent = {
  fence: Geofence;
  kind: "enter" | "exit";
  distanceM: number;
};

/**
 * Compare current GPS to active fences and previous inside/outside state.
 * Returns crossing events and the updated inside map (also persisted).
 */
export function evaluateGeofences(input: {
  employeeId: string;
  point: { lat: number; lng: number };
  fences: Geofence[];
}): { events: GeofenceEvent[]; inside: GeofenceInsideMap } {
  const prev = loadInsideMap(input.employeeId);
  const next: GeofenceInsideMap = { ...prev };
  const events: GeofenceEvent[] = [];

  for (const fence of input.fences) {
    if (!fence.active) {
      delete next[fence.id];
      continue;
    }
    const wasInside = Boolean(prev[fence.id]);
    const nowInside = isInsideFence(input.point, fence, wasInside);
    next[fence.id] = nowInside;
    const distanceM = Math.round(
      distanceMeters(input.point, { lat: fence.lat, lng: fence.lng }),
    );

    if (!wasInside && nowInside) {
      events.push({ fence, kind: "enter", distanceM });
    } else if (wasInside && !nowInside) {
      events.push({ fence, kind: "exit", distanceM });
    }
  }

  // Drop state for fences that no longer exist
  const ids = new Set(input.fences.map((f) => f.id));
  for (const id of Object.keys(next)) {
    if (!ids.has(id)) delete next[id];
  }

  saveInsideMap(input.employeeId, next);
  return { events, inside: next };
}

export async function notifyGeofenceCrossings(input: {
  employeeId: string;
  events: GeofenceEvent[];
  isClockedIn: boolean;
}) {
  for (const event of input.events) {
    const { fence, kind } = event;
    const fireKey = `${input.employeeId}:${fence.id}:${kind}`;
    if (recentlyFired(fireKey)) continue;

    if (kind === "enter" && fence.notifyEnter) {
      if (input.isClockedIn) continue;
      await showEmployeeNotification(
        `Arrived: ${fence.name}`,
        "You're at a jobsite fence. Clock in when you start work.",
        `txr-geo-enter-${fence.id}`,
      );
      markFired(fireKey);
    }

    if (kind === "exit" && fence.notifyExit) {
      if (!input.isClockedIn) continue;
      await showEmployeeNotification(
        `Left: ${fence.name}`,
        "You left a jobsite fence. Clock out if you're done for the day.",
        `txr-geo-exit-${fence.id}`,
      );
      markFired(fireKey);
    }
  }
}

export function formatRadius(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km`;
  return `${Math.round(meters)} m`;
}
