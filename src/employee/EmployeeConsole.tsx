import { useMemo, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatDuration, formatWhen } from "./format";

export function EmployeeConsole() {
  const { employee, entries, openEntry, clockIn, clockOut } = useEmployeeAuth();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

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
            : "Punch in when you start work. Punch out when you finish."}
        </p>

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
            {busy ? "Saving…" : openEntry ? "Clock out" : "Clock in"}
          </button>
        </form>
        {message ? <p className="emp-flash">{message}</p> : null}
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
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatWhen(entry.clockIn)}</td>
                    <td>{entry.clockOut ? formatWhen(entry.clockOut) : "— open —"}</td>
                    <td>{formatDuration(entry.clockIn, entry.clockOut)}</td>
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
