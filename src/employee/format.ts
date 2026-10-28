export function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDuration(clockIn: string, clockOut: string | null) {
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  const start = new Date(clockIn).getTime();
  const mins = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatGpsShort(point: { lat: number; lng: number; accuracyM?: number | null } | null | undefined) {
  if (!point) return "—";
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}

export function kindLabel(kind: string) {
  switch (kind) {
    case "announcement":
      return "Announcement";
    case "sop":
      return "SOP";
    case "policy":
      return "Policy";
    default:
      return "Document";
  }
}
