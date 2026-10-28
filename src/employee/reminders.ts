import type { ReminderPrefs } from "./types";

const PREFS_KEY = "txr-reminder-prefs-v1";
const FIRED_KEY = "txr-reminder-fired-v1";

export const defaultReminderPrefs: ReminderPrefs = {
  /** Always on for TX Ropers crew punches. */
  enabled: true,
  clockInAt: "07:45",
  clockOutAt: "17:00",
  longShiftHours: 8,
  weekdaysOnly: true,
};

export function loadReminderPrefs(employeeId: string): ReminderPrefs {
  try {
    const raw = localStorage.getItem(`${PREFS_KEY}:${employeeId}`);
    if (!raw) return { ...defaultReminderPrefs };
    return { ...defaultReminderPrefs, ...(JSON.parse(raw) as ReminderPrefs) };
  } catch {
    return { ...defaultReminderPrefs };
  }
}

export function saveReminderPrefs(employeeId: string, prefs: ReminderPrefs) {
  localStorage.setItem(`${PREFS_KEY}:${employeeId}`, JSON.stringify(prefs));
}

function chicagoParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return {
    weekday: get("weekday"),
    hhmm: `${hour}:${get("minute")}`,
    dayKey: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function alreadyFired(key: string) {
  try {
    const map = JSON.parse(localStorage.getItem(FIRED_KEY) || "{}") as Record<string, string>;
    return Boolean(map[key]);
  } catch {
    return false;
  }
}

function markFired(key: string) {
  try {
    const map = JSON.parse(localStorage.getItem(FIRED_KEY) || "{}") as Record<string, string>;
    map[key] = new Date().toISOString();
    // prune old keys
    const keys = Object.keys(map);
    if (keys.length > 60) {
      keys
        .sort((a, b) => (map[a] ?? "").localeCompare(map[b] ?? ""))
        .slice(0, keys.length - 40)
        .forEach((k) => delete map[k]);
    }
    localStorage.setItem(FIRED_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export async function showEmployeeNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    tag,
    icon: "/favicon.png",
    badge: "/favicon.png",
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    }
  } catch {
    // fall through
  }

  new Notification(title, options);
}

async function notify(title: string, body: string, tag: string) {
  await showEmployeeNotification(title, body, tag);
}

export type ReminderCheckInput = {
  employeeId: string;
  prefs: ReminderPrefs;
  isClockedIn: boolean;
  openClockInIso: string | null;
};

/** Evaluate reminders once. Safe to call every minute. */
export async function checkClockReminders(input: ReminderCheckInput) {
  if (!input.prefs.enabled) return;

  const { weekday, hhmm, dayKey } = chicagoParts();
  if (input.prefs.weekdaysOnly && (weekday === "Sat" || weekday === "Sun")) return;

  const inKey = `${input.employeeId}:in:${dayKey}`;
  const outKey = `${input.employeeId}:out:${dayKey}`;
  const longKey = `${input.employeeId}:long:${dayKey}`;

  if (
    !input.isClockedIn &&
    hhmm >= input.prefs.clockInAt &&
    hhmm <= addMinutes(input.prefs.clockInAt, 20) &&
    !alreadyFired(inKey)
  ) {
    await notify(
      "Clock in reminder",
      "Time to clock in for TX Ropers Construction.",
      "txr-clock-in",
    );
    markFired(inKey);
  }

  if (
    input.isClockedIn &&
    hhmm >= input.prefs.clockOutAt &&
    hhmm <= addMinutes(input.prefs.clockOutAt, 30) &&
    !alreadyFired(outKey)
  ) {
    await notify(
      "Clock out reminder",
      "Remember to clock out when you finish.",
      "txr-clock-out",
    );
    markFired(outKey);
  }

  if (input.isClockedIn && input.openClockInIso) {
    const hours =
      (Date.now() - new Date(input.openClockInIso).getTime()) / (1000 * 60 * 60);
    if (hours >= input.prefs.longShiftHours && !alreadyFired(longKey)) {
      await notify(
        "Long shift reminder",
        `You've been clocked in about ${Math.floor(hours)} hours. Clock out if you're done.`,
        "txr-long-shift",
      );
      markFired(longKey);
    }
  }
}

function addMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}
