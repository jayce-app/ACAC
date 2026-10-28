import type { GeoPoint } from "./types";

export type LocationAccess = "granted" | "prompt" | "denied" | "unsupported";

export async function getLocationAccess(): Promise<LocationAccess> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";

  try {
    const permissions = navigator.permissions;
    if (permissions?.query) {
      const status = await permissions.query({ name: "geolocation" as PermissionName });
      if (status.state === "granted") return "granted";
      if (status.state === "denied") return "denied";
      return "prompt";
    }
  } catch {
    // Permissions API not available for geolocation on some browsers (notably older Safari).
  }

  return "prompt";
}

export async function captureGps(timeoutMs = 15000): Promise<{
  point: GeoPoint | null;
  error?: string;
}> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { point: null, error: "GPS is not available on this device." };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 15_000,
      });
    });

    return {
      point: {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6)),
        accuracyM:
          typeof position.coords.accuracy === "number"
            ? Math.round(position.coords.accuracy)
            : null,
        capturedAt: new Date(position.timestamp).toISOString(),
      },
    };
  } catch (err) {
    const message =
      err instanceof GeolocationPositionError
        ? err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Turn location on for this site and try again."
          : err.code === err.TIMEOUT
            ? "Location timed out. Move outdoors or wait for GPS, then try again."
            : "Could not read GPS. Try again."
        : "Could not read GPS. Try again.";
    return { point: null, error: message };
  }
}

/** Request location by performing a live GPS read (required before punching). */
export async function requireGps(): Promise<{ ok: true; point: GeoPoint } | { ok: false; message: string }> {
  const gps = await captureGps();
  if (!gps.point) {
    return { ok: false, message: gps.error || "Location is required to clock in or out." };
  }
  return { ok: true, point: gps.point };
}

export function mapsUrl(point: GeoPoint | null | undefined) {
  if (!point) return null;
  return `https://maps.google.com/?q=${point.lat},${point.lng}`;
}

export function formatGps(point: GeoPoint | null | undefined) {
  if (!point) return "No GPS";
  const accuracy = point.accuracyM != null ? ` ±${point.accuracyM}m` : "";
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}${accuracy}`;
}
