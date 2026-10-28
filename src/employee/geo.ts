import type { GeoPoint } from "./types";

export async function captureGps(timeoutMs = 12000): Promise<{
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
        maximumAge: 30_000,
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
          ? "Location permission denied."
          : err.code === err.TIMEOUT
            ? "Location timed out."
            : "Could not read GPS."
        : "Could not read GPS.";
    return { point: null, error: message };
  }
}

export function mapsUrl(point: GeoPoint | null | undefined) {
  if (!point) return null;
  return `https://maps.google.com/?q=${point.lat},${point.lng}`;
}

export function formatGps(point: GeoPoint | null | undefined) {
  if (!point) return "No GPS";
  const accuracy =
    point.accuracyM != null ? ` ±${point.accuracyM}m` : "";
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}${accuracy}`;
}
