import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatDuration, formatGpsShort, formatWhen } from "./format";
import { getLocationAccess, mapsUrl, requireGps, type LocationAccess } from "./geo";
import { useClockReminders } from "./useClockReminders";

export function EmployeeConsole() {
  const { employee, entries, openEntry, clockIn, clockOut } = useEmployeeAuth();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [locationAccess, setLocationAccess] = useState<LocationAccess>("prompt");
  const [locationReady, setLocationReady] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { prefs, permission, enableNotifications, updatePrefs } = useClockReminders({
    employeeId: employee?.id ?? null,
    isClockedIn: Boolean(openEntry),
    openClockInIso: openEntry?.clockIn ?? null,
  });

  const notificationsOk = permission === "granted";
  const locationOk = locationReady && locationAccess !== "denied" && locationAccess !== "unsupported";
  const canPunch = notificationsOk && locationOk;

  const mine = useMemo(
    () => entries.filter((entry) => entry.employeeId === employee?.id).slice(0, 40),
    [entries, employee],
  );

  useEffect(() => {
    // Reminders are required for the crew console.
    if (!prefs.enabled) updatePrefs({ enabled: true });
  }, [prefs.enabled, updatePrefs]);

  useEffect(() => {
    void refreshLocationState();
  }, []);

  async function refreshLocationState() {
    const access = await getLocationAccess();
    setLocationAccess(access);
    if (access === "denied" || access === "unsupported") {
      setLocationReady(false);
      setLocationError(
        access === "unsupported"
          ? "This device does not support location."
          : "Location is blocked. Enable it in browser/site settings.",
      );
      return;
    }
    if (access === "granted") {
      const gps = await requireGps();
      setLocationReady(gps.ok);
      setLocationError(gps.ok ? "" : gps.message);
    }
  }

  async function enableLocation() {
    setBusy(true);
    setLocationError("");
    const gps = await requireGps();
    const access = await getLocationAccess();
    setLocationAccess(access);
    setLocationReady(gps.ok);
    setLocationError(gps.ok ? "" : gps.message);
    setBusy(false);
  }

  async function onClock(event: FormEvent) {
    event.preventDefault();
    if (!canPunch) {
      setMessage("Allow notifications and location before clocking in or out.");
      return;
    }
    setBusy(true);
    setMessage("");
    const result = openEntry ? await clockOut(note) : await clockIn(note);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setNote("");
    if (!result.ok && /location|GPS|Notifications/i.test(result.message)) {
      await refreshLocationState();
    }
  }

  return (
    <div className="emp-stack">
      <section className="emp-card">
        <p className="eyebrow">Required permissions</p>
        <h1>Turn on location &amp; notifications</h1>
        <p className="emp-lede">
          TX Ropers requires both before you can clock in or out — so punches are tagged with GPS
          and reminders can reach you.
        </p>

        <ul className="emp-perm-list">
          <li className={notificationsOk ? "is-ok" : "is-blocked"}>
            <strong>Notifications</strong>
            <span>{notificationsOk ? "Allowed" : permission === "denied" ? "Blocked" : "Required"}</span>
            {!notificationsOk && permission !== "unsupported" ? (
              <button
                type="button"
                className="btn btn--dark"
                onClick={() => void enableNotifications()}
              >
                Allow notifications
              </button>
            ) : null}
            {permission === "unsupported" ? (
              <span className="emp-error">Not supported in this browser.</span>
            ) : null}
            {permission === "denied" ? (
              <span className="emp-error">
                Blocked in settings — enable notifications for this site, then reload.
              </span>
            ) : null}
          </li>
          <li className={locationOk ? "is-ok" : "is-blocked"}>
            <strong>Location</strong>
            <span>
              {locationOk
                ? "Ready"
                : locationAccess === "denied"
                  ? "Blocked"
                  : locationAccess === "unsupported"
                    ? "Unavailable"
                    : "Required"}
            </span>
            {!locationOk && locationAccess !== "unsupported" ? (
              <button
                type="button"
                className="btn btn--dark"
                disabled={busy}
                onClick={() => void enableLocation()}
              >
                {busy ? "Checking GPS…" : "Allow location"}
              </button>
            ) : null}
            {locationError ? <span className="emp-error">{locationError}</span> : null}
          </li>
        </ul>
      </section>

      <section className="emp-card">
        <p className="eyebrow">Time clock</p>
        <h1>{openEntry ? "You are on the clock" : "You are clocked out"}</h1>
        <p className="emp-lede">
          {openEntry
            ? `Started ${formatWhen(openEntry.clockIn)} · running ${formatDuration(openEntry.clockIn, null)}`
            : "Punch in when you start work. Punch out when you finish."}
        </p>
        {openEntry?.clockInGeo ? (
          <p className="emp-meta">
            Clock-in GPS:{" "}
            <a href={mapsUrl(openEntry.clockInGeo) ?? undefined} target="_blank" rel="noreferrer">
              {formatGpsShort(openEntry.clockInGeo)}
            </a>
          </p>
        ) : null}

        {!canPunch ? (
          <p className="emp-error">
            Clock buttons stay locked until notifications and location are allowed.
          </p>
        ) : null}

        <form className="emp-form emp-form--inline" onSubmit={(e) => void onClock(e)}>
          <label>
            Optional note
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Job / location"
              maxLength={120}
              disabled={!canPunch || busy}
            />
          </label>
          <button
            type="submit"
            className={openEntry ? "btn btn--dark" : "btn btn--primary"}
            disabled={!canPunch || busy}
          >
            {busy ? "Getting GPS…" : openEntry ? "Clock out" : "Clock in"}
          </button>
        </form>
        {message ? (
          <p className={/required|denied|blocked|Allow|Location|Notifications/i.test(message) ? "emp-error" : "emp-flash"}>
            {message}
          </p>
        ) : null}
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Punch reminders</h2>
        </div>
        <p className="emp-lede">
          Reminders are required. Set your usual clock-in and clock-out times (America/Chicago).
        </p>

        <div className="emp-form">
          <div className="emp-form--inline">
            <label>
              Remind to clock in
              <input
                type="time"
                value={prefs.clockInAt}
                onChange={(e) => updatePrefs({ clockInAt: e.target.value })}
              />
            </label>
            <label>
              Remind to clock out
              <input
                type="time"
                value={prefs.clockOutAt}
                onChange={(e) => updatePrefs({ clockOutAt: e.target.value })}
              />
            </label>
          </div>

          <label>
            Long-shift reminder (hours)
            <input
              type="number"
              min={4}
              max={16}
              step={0.5}
              value={prefs.longShiftHours}
              onChange={(e) =>
                updatePrefs({ longShiftHours: Number(e.target.value) || 8 })
              }
            />
          </label>

          <label className="emp-check">
            <input
              type="checkbox"
              checked={prefs.weekdaysOnly}
              onChange={(e) => updatePrefs({ weekdaysOnly: e.target.checked })}
            />
            Weekdays only (Mon–Fri)
          </label>
        </div>
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Your recent punches</h2>
        </div>
        {mine.length === 0 ? (
          <p className="emp-empty">No punches yet.</p>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>In</th>
                  <th>Out</th>
                  <th>Duration</th>
                  <th>GPS</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatWhen(entry.clockIn)}</td>
                    <td>{entry.clockOut ? formatWhen(entry.clockOut) : "— open —"}</td>
                    <td>{formatDuration(entry.clockIn, entry.clockOut)}</td>
                    <td>
                      {entry.clockInGeo || entry.clockOutGeo ? (
                        <span className="emp-gps-cell">
                          {entry.clockInGeo ? (
                            <a
                              href={mapsUrl(entry.clockInGeo) ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                            >
                              In
                            </a>
                          ) : null}
                          {entry.clockInGeo && entry.clockOutGeo ? " · " : null}
                          {entry.clockOutGeo ? (
                            <a
                              href={mapsUrl(entry.clockOutGeo) ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Out
                            </a>
                          ) : null}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{entry.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
