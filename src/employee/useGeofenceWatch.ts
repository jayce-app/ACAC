import { useEffect, useRef, useState } from "react";
import { evaluateGeofences, notifyGeofenceCrossings } from "./geofence";
import type { Geofence } from "./types";

/**
 * Watch the device GPS while the employee console is open and fire
 * enter/exit notifications for admin-defined geofences.
 *
 * Browsers only deliver reliable geolocation while the page/PWA is open.
 * A later native shell can reuse the same fence list for true background fences.
 */
export function useGeofenceWatch(input: {
  employeeId: string | null;
  fences: Geofence[];
  isClockedIn: boolean;
  enabled: boolean;
}) {
  const [watching, setWatching] = useState(false);
  const [lastError, setLastError] = useState("");
  const [insideCount, setInsideCount] = useState(0);
  const clockedInRef = useRef(input.isClockedIn);
  const fencesRef = useRef(input.fences);

  clockedInRef.current = input.isClockedIn;
  fencesRef.current = input.fences;

  useEffect(() => {
    if (!input.enabled || !input.employeeId) {
      setWatching(false);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLastError("GPS is not available on this device.");
      setWatching(false);
      return;
    }

    let cancelled = false;
    const employeeId = input.employeeId;

    async function onPosition(position: GeolocationPosition) {
      if (cancelled) return;
      const point = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6)),
      };
      const active = fencesRef.current.filter((f) => f.active);
      if (!active.length) {
        setInsideCount(0);
        return;
      }
      const { events, inside } = evaluateGeofences({
        employeeId,
        point,
        fences: active,
      });
      setInsideCount(Object.values(inside).filter(Boolean).length);
      setLastError("");
      if (events.length) {
        await notifyGeofenceCrossings({
          employeeId,
          events,
          isClockedIn: clockedInRef.current,
        });
      }
    }

    function onError(err: GeolocationPositionError) {
      if (cancelled) return;
      if (err.code === err.PERMISSION_DENIED) {
        setLastError("Location permission denied — geofence alerts paused.");
      } else if (err.code === err.TIMEOUT) {
        setLastError("Waiting for a GPS fix…");
      } else {
        setLastError("Could not read GPS for geofences.");
      }
    }

    setWatching(true);
    const watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 20_000,
      timeout: 25_000,
    });

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, [input.enabled, input.employeeId]);

  return { watching, lastError, insideCount };
}
