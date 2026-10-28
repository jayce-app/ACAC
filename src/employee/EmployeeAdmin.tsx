import { useMemo, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatDuration, formatWhen, kindLabel } from "./format";
import { formatRadius } from "./geofence";
import { mapsUrl, requireGps } from "./geo";
import type { Geofence, GeofenceInput, InternalDocument } from "./types";

const emptyFenceForm: GeofenceInput = {
  name: "",
  lat: 29.9508,
  lng: -96.2572,
  radiusM: 200,
  active: true,
  notifyEnter: true,
  notifyExit: true,
};

export function EmployeeAdmin() {
  const {
    employees,
    entries,
    documents,
    geofences,
    createDocument,
    updateDocument,
    setEmployeeStatus,
    createGeofence,
    updateGeofence,
    deleteGeofence,
  } = useEmployeeAuth();

  const [kind, setKind] = useState<InternalDocument["kind"]>("announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [fenceForm, setFenceForm] = useState<GeofenceInput>(emptyFenceForm);
  const [editingFenceId, setEditingFenceId] = useState<string | null>(null);
  const [fenceMessage, setFenceMessage] = useState("");
  const [fenceBusy, setFenceBusy] = useState(false);

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

  function startEditFence(fence: Geofence) {
    setEditingFenceId(fence.id);
    setFenceForm({
      name: fence.name,
      lat: fence.lat,
      lng: fence.lng,
      radiusM: fence.radiusM,
      active: fence.active,
      notifyEnter: fence.notifyEnter,
      notifyExit: fence.notifyExit,
    });
    setFenceMessage("");
  }

  function resetFenceForm() {
    setEditingFenceId(null);
    setFenceForm(emptyFenceForm);
    setFenceMessage("");
  }

  async function useMyLocationForFence() {
    setFenceBusy(true);
    setFenceMessage("");
    const gps = await requireGps();
    setFenceBusy(false);
    if (!gps.ok) {
      setFenceMessage(gps.message);
      return;
    }
    setFenceForm((prev) => ({ ...prev, lat: gps.point.lat, lng: gps.point.lng }));
    setFenceMessage("Center set from your current GPS.");
  }

  async function onSaveFence(event: FormEvent) {
    event.preventDefault();
    setFenceBusy(true);
    const result = editingFenceId
      ? await updateGeofence(editingFenceId, fenceForm)
      : await createGeofence(fenceForm);
    setFenceBusy(false);
    setFenceMessage(result.message);
    if (result.ok) resetFenceForm();
  }

  async function onDeleteFence(id: string, name: string) {
    if (!window.confirm(`Delete geofence “${name}”?`)) return;
    setFenceBusy(true);
    const result = await deleteGeofence(id);
    setFenceBusy(false);
    setFenceMessage(result.message);
    if (editingFenceId === id) resetFenceForm();
  }

  return (
    <div className="emp-stack">
      <section className="emp-card">
        <p className="eyebrow">Admin</p>
        <h1>Crew overview</h1>
        <p className="emp-lede">
          Review who is on the clock, manage jobsite geofences, documents, and accounts.
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
            <strong>{geofences.filter((f) => f.active).length}</strong>
            <span>Active geofences</span>
          </div>
          <div>
            <strong>{documents.length}</strong>
            <span>Documents</span>
          </div>
        </div>
      </section>

      <section className="emp-card">
        <div className="emp-section-head">
          <h2>Geofences</h2>
        </div>
        <p className="emp-lede">
          When a crew member with the console open crosses a fence, they get a notification to
          clock in (enter) or clock out (exit). Refine the center with GPS while standing on site.
        </p>

        <form className="emp-form" onSubmit={(e) => void onSaveFence(e)}>
          <label>
            Fence name
            <input
              value={fenceForm.name}
              onChange={(e) => setFenceForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Shop / yard, jobsite name…"
              required
            />
          </label>

          <div className="emp-form--inline">
            <label>
              Latitude
              <input
                type="number"
                step="0.000001"
                value={fenceForm.lat}
                onChange={(e) =>
                  setFenceForm((p) => ({ ...p, lat: Number(e.target.value) }))
                }
                required
              />
            </label>
            <label>
              Longitude
              <input
                type="number"
                step="0.000001"
                value={fenceForm.lng}
                onChange={(e) =>
                  setFenceForm((p) => ({ ...p, lng: Number(e.target.value) }))
                }
                required
              />
            </label>
          </div>

          <div className="emp-form--inline">
            <label>
              Radius (meters)
              <input
                type="number"
                min={50}
                max={5000}
                step={10}
                value={fenceForm.radiusM}
                onChange={(e) =>
                  setFenceForm((p) => ({ ...p, radiusM: Number(e.target.value) || 200 }))
                }
                required
              />
            </label>
            <div className="emp-fence-actions">
              <button
                type="button"
                className="btn btn--dark"
                disabled={fenceBusy}
                onClick={() => void useMyLocationForFence()}
              >
                {fenceBusy ? "Reading GPS…" : "Use my location"}
              </button>
              <a
                className="emp-linkish"
                href={mapsUrl({ lat: fenceForm.lat, lng: fenceForm.lng, accuracyM: null, capturedAt: "" }) ?? undefined}
                target="_blank"
                rel="noreferrer"
              >
                Preview on map
              </a>
            </div>
          </div>

          <div className="emp-fence-checks">
            <label className="emp-check">
              <input
                type="checkbox"
                checked={fenceForm.active}
                onChange={(e) => setFenceForm((p) => ({ ...p, active: e.target.checked }))}
              />
              Active
            </label>
            <label className="emp-check">
              <input
                type="checkbox"
                checked={fenceForm.notifyEnter}
                onChange={(e) =>
                  setFenceForm((p) => ({ ...p, notifyEnter: e.target.checked }))
                }
              />
              Notify to clock in on enter
            </label>
            <label className="emp-check">
              <input
                type="checkbox"
                checked={fenceForm.notifyExit}
                onChange={(e) =>
                  setFenceForm((p) => ({ ...p, notifyExit: e.target.checked }))
                }
              />
              Notify to clock out on exit
            </label>
          </div>

          {fenceMessage ? (
            <p
              className={
                /saved|updated|deleted|Center set/i.test(fenceMessage)
                  ? "emp-flash"
                  : "emp-error"
              }
            >
              {fenceMessage}
            </p>
          ) : null}

          <div className="emp-fence-actions">
            <button type="submit" className="btn btn--primary" disabled={fenceBusy}>
              {fenceBusy
                ? "Saving…"
                : editingFenceId
                  ? "Update geofence"
                  : "Add geofence"}
            </button>
            {editingFenceId ? (
              <button type="button" className="btn btn--dark" onClick={resetFenceForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        {geofences.length === 0 ? (
          <p className="emp-empty">No geofences yet. Add the shop or a jobsite above.</p>
        ) : (
          <ul className="emp-fence-list">
            {geofences.map((fence) => (
              <li key={fence.id}>
                <div>
                  <strong>
                    {fence.name}
                    {!fence.active ? " (inactive)" : ""}
                  </strong>
                  <span>
                    {formatRadius(fence.radiusM)} ·{" "}
                    <a
                      href={mapsUrl({
                        lat: fence.lat,
                        lng: fence.lng,
                        accuracyM: null,
                        capturedAt: "",
                      }) ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {fence.lat.toFixed(5)}, {fence.lng.toFixed(5)}
                    </a>
                    {" · "}
                    {[
                      fence.notifyEnter ? "enter → clock in" : null,
                      fence.notifyExit ? "exit → clock out" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "alerts off"}
                  </span>
                </div>
                <div className="emp-fence-row-actions">
                  <button
                    type="button"
                    className="emp-linkish"
                    onClick={() => startEditFence(fence)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="emp-linkish"
                    onClick={() => void onDeleteFence(fence.id, fence.name)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
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
