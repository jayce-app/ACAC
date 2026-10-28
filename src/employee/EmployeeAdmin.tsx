import { useMemo, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatDuration, formatWhen, kindLabel } from "./format";
import { mapsUrl } from "./geo";
import type { InternalDocument } from "./types";

export function EmployeeAdmin() {
  const {
    employees,
    entries,
    documents,
    createDocument,
    updateDocument,
    setEmployeeStatus,
  } = useEmployeeAuth();

  const [kind, setKind] = useState<InternalDocument["kind"]>("announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const openPunches = useMemo(
    () => entries.filter((entry) => !entry.clockOut),
    [entries],
  );

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await createDocument({ kind, title, body, published });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) {
      setTitle("");
      setBody("");
      setPublished(true);
      setKind("announcement");
    }
  }

  return (
    <div className="emp-stack">
      <section className="emp-card">
        <p className="eyebrow">Admin</p>
        <h1>Crew overview</h1>
        <p className="emp-lede">
          Review who is on the clock, manage documents, and activate or deactivate accounts.
        </p>
        <div className="emp-stats">
          <div>
            <strong>{employees.filter((e) => e.status === "active").length}</strong>
            <span>Active employees</span>
          </div>
          <div>
            <strong>{openPunches.length}</strong>
            <span>Currently clocked in</span>
          </div>
          <div>
            <strong>{documents.length}</strong>
            <span>Documents</span>
          </div>
        </div>
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>All time punches</h2>
        </div>
        {entries.length === 0 ? (
          <p className="emp-empty">No punches logged yet.</p>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Duration</th>
                  <th>GPS</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 100).map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.employeeName || entry.employeeId}</td>
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

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Employees</h2>
        </div>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {employees.map((person) => (
                <tr key={person.id}>
                  <td>{person.name}</td>
                  <td>{person.email}</td>
                  <td>{person.role}</td>
                  <td>{person.status}</td>
                  <td>
                    {person.status === "active" ? (
                      <button
                        type="button"
                        className="emp-linkish"
                        onClick={() => void setEmployeeStatus(person.id, "inactive")}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="emp-linkish"
                        onClick={() => void setEmployeeStatus(person.id, "active")}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Publish a document</h2>
        </div>
        <form className="emp-form" onSubmit={(e) => void onCreate(e)}>
          <label>
            Type
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as InternalDocument["kind"])}
            >
              <option value="announcement">Announcement</option>
              <option value="sop">SOP</option>
              <option value="policy">Policy</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              required
            />
          </label>
          <label className="emp-check">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publish now
          </label>
          {message ? <p className="emp-flash">{message}</p> : null}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Saving…" : "Save document"}
          </button>
        </form>

        <ul className="emp-admin-docs">
          {documents.map((doc) => (
            <li key={doc.id}>
              <div>
                <strong>{doc.title}</strong>
                <span>
                  {kindLabel(doc.kind)} · {doc.published ? "Published" : "Draft"} ·{" "}
                  {formatWhen(doc.updatedAt)}
                </span>
              </div>
              <button
                type="button"
                className="emp-linkish"
                onClick={() =>
                  void updateDocument(doc.id, { published: !doc.published })
                }
              >
                {doc.published ? "Unpublish" : "Publish"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
