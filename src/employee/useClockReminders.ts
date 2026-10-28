import { useEffect, useState } from "react";
import {
  checkClockReminders,
  defaultReminderPrefs,
  ensureNotificationPermission,
  loadReminderPrefs,
  saveReminderPrefs,
} from "./reminders";
import type { ReminderPrefs } from "./types";

export function useClockReminders(input: {
  employeeId: string | null;
  isClockedIn: boolean;
  openClockInIso: string | null;
}) {
  const [prefs, setPrefs] = useState<ReminderPrefs>(defaultReminderPrefs);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default",
  );

  useEffect(() => {
    if (!input.employeeId) return;
    setPrefs(loadReminderPrefs(input.employeeId));
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  }, [input.employeeId]);

  useEffect(() => {
    if (!input.employeeId || !prefs.enabled) return;

    let cancelled = false;

    async function tick() {
      if (cancelled || !input.employeeId) return;
      await checkClockReminders({
        employeeId: input.employeeId,
        prefs,
        isClockedIn: input.isClockedIn,
        openClockInIso: input.openClockInIso,
      });
    }

    void tick();
    const id = window.setInterval(() => void tick(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [input.employeeId, input.isClockedIn, input.openClockInIso, prefs]);

  async function enableNotifications() {
    const next = await ensureNotificationPermission();
    setPermission(next);
    return next;
  }

  function updatePrefs(patch: Partial<ReminderPrefs>) {
    if (!input.employeeId) return;
    const next = { ...prefs, ...patch, enabled: true };
    setPrefs(next);
    saveReminderPrefs(input.employeeId, next);
  }

  return { prefs, permission, enableNotifications, updatePrefs };
}
