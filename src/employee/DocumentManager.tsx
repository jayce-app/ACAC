import { useEffect, useState, type FormEvent } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatWhen, kindLabel } from "./format";
import type { InternalDocument } from "./types";

type DocDraft = {
  kind: InternalDocument["kind"];
  title: string;
  body: string;
  published: boolean;
};

const emptyDraft: DocDraft = {
  kind: "announcement",
  title: "",
  body: "",
  published: true,
};

type Props = {
  /** Compact layout for the Documents reader page */
  compact?: boolean;
};

export function DocumentManager({ compact = false }: Props) {
  const { documents, createDocument, updateDocument, deleteDocument } = useEmployeeAuth();
  const [draft, setDraft] = useState<DocDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    const doc = documents.find((d) => d.id === editingId);
    if (!doc) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  }, [documents, editingId]);

  function startEdit(doc: InternalDocument) {
    setEditingId(doc.id);
    setDraft({
      kind: doc.kind,
      title: doc.title,
      body: doc.body,
      published: doc.published,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setMessage("");
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = editingId
      ? await updateDocument(editingId, draft)
      : await createDocument(draft);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) resetForm();
  }

  async function onDelete(doc: InternalDocument) {
    if (!window.confirm(`Delete “${doc.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const result = await deleteDocument(doc.id);
    setBusy(false);
    setMessage(result.message);
    if (editingId === doc.id) resetForm();
  }

  return (
    <section className={compact ? "emp-card emp-doc-manager" : "emp-card"}>
      <div className="emp-section-head">
        <h2>{editingId ? "Edit document" : "Add a document"}</h2>
      </div>
      <p className="emp-lede">
        Post announcements, SOPs, and policies for the crew. Drafts stay admin-only until you
        publish them.
      </p>

      <form className="emp-form" onSubmit={(e) => void onSave(e)}>
        <label>
          Type
          <select
            value={draft.kind}
            onChange={(e) =>
              setDraft((p) => ({ ...p, kind: e.target.value as InternalDocument["kind"] }))
            }
          >
            <option value="announcement">Announcement</option>
            <option value="sop">SOP</option>
            <option value="policy">Policy</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="Document title"
            required
          />
        </label>
        <label>
          Body
          <textarea
            value={draft.body}
            onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value }))}
            rows={compact ? 8 : 10}
            placeholder="Write the document content…"
            required
          />
        </label>
        <label className="emp-check">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft((p) => ({ ...p, published: e.target.checked }))}
          />
          Publish now (visible to crew)
        </label>

        {message ? (
          <p
            className={
              /saved|updated|deleted/i.test(message) ? "emp-flash" : "emp-error"
            }
          >
            {message}
          </p>
        ) : null}

        <div className="emp-fence-actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Saving…" : editingId ? "Update document" : "Save document"}
          </button>
          {editingId ? (
            <button type="button" className="btn btn--dark" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="emp-section-head" style={{ marginTop: "1.5rem" }}>
        <h2>All documents</h2>
      </div>
      {documents.length === 0 ? (
        <p className="emp-empty">No documents yet. Add your first SOP or announcement above.</p>
      ) : (
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
              <div className="emp-fence-row-actions">
                <button type="button" className="emp-linkish" onClick={() => startEdit(doc)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="emp-linkish"
                  onClick={() =>
                    void updateDocument(doc.id, { published: !doc.published })
                  }
                >
                  {doc.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="emp-linkish"
                  onClick={() => void onDelete(doc)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
