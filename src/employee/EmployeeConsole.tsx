import { useMemo, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatDuration, formatGpsShort, formatWhen } from "./format";
import { mapsUrl } from "./geo";
import { useClockReminders } from "./useClockReminders";

export function EmployeeConsole() {
  const { employee, entries, openEntry, clockIn, clockOut } = useEmployeeAuth();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { prefs, permission, enableNotifications, updatePrefs } = useClockReminders({
    employeeId: employee?.id ?? null,
    isClockedIn: Boolean(openEntry),
    openClockInIso: openEntry?.clockIn ?? null,
  });

  const mine = useMemo(
    () => entries.filter((entry) => entry.employeeId === employee?.id).slice(0, 40),
    [entries, employee],
  );

  async function onClock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = openEntry ? await clockOut(note) : await clockIn(note);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setNote("");
  }

  return (
    <div className="emp-stack">
      <section className="emp-card">
        <p className="eyebrow">Time clock</p>
        <h1>{openEntry ? "You are on the clock" : "You are clocked out"}</h1>
        <p className="emp-lede">
          {openEntry
            ? `Started ${formatWhen(openEntry.clockIn)} · running ${formatDuration(openEntry.clockIn, null)}`
            : "Punch in when you start work. Punch out when you finish. GPS is captured with each punch."}
        </p>
        {openEntry?.clockInGeo ? (
          <p className="emp-meta">
            Clock-in GPS:{" "}
            <a href={mapsUrl(openEntry.clockInGeo) ?? undefined} target="_blank" rel="noreferrer">
              {formatGpsShort(openEntry.clockInGeo)}
            </a>
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
            />
          </label>
          <button
            type="submit"
            className={openEntry ? "btn btn--dark" : "btn btn--primary"}
            disabled={busy}
          >
            {busy ? "Getting GPS…" : openEntry ? "Clock out" : "Clock in"}
          </button>
        </form>
        {message ? <p className="emp-flash">{message}</p> : null}
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Punch reminders</h2>
        </div>
        <p className="emp-lede">
          Get reminded to clock in and out. Works best after you install this console on your
          phone (Add to Home Screen). Native phone-app push comes later.
        </p>

        <div className="emp-form">
          <label className="emp-check">
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) => updatePrefs({ enabled: e.target.checked })}
            />
            Enable reminders
          </label>

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
            Weekdays only (Mon–Fri, America/Chicago)
          </label>

          {permission === "unsupported" ? (
            <p className="emp-empty">This browser does not support notifications.</p>
          ) : permission !== "granted" ? (
            <button
              type="button"
              className="btn btn--dark"
              onClick={() => void enableNotifications()}
            >
              Allow notifications
            </button>
          ) : (
            <p className="emp-flash">Notifications allowed.</p>
          )}
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
