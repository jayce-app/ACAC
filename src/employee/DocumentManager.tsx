import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ACCEPTED_DOC_TYPES,
  formatFileSize,
  MAX_DOC_BYTES,
} from "./documentFiles";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatWhen, kindLabel } from "./format";
import type { DocumentKind } from "../lib/supabase";
import type { InternalDocument } from "./types";

type DocDraft = {
  kind: DocumentKind;
  title: string;
  body: string;
  published: boolean;
  file: File | null;
};

const emptyDraft: DocDraft = {
  kind: "sop",
  title: "",
  body: "",
  published: true,
  file: null,
};

type Props = {
  /** Compact layout for the Documents reader page */
  compact?: boolean;
};

export function DocumentManager({ compact = false }: Props) {
  const { documents, createDocument, updateDocument, deleteDocument } = useEmployeeAuth();
  const [draft, setDraft] = useState<DocDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingId) return;
    const doc = documents.find((d) => d.id === editingId);
    if (!doc) {
      setEditingId(null);
      setDraft(emptyDraft);
      setExistingFileName(null);
    }
  }, [documents, editingId]);

  function startEdit(doc: InternalDocument) {
    setEditingId(doc.id);
    setDraft({
      kind: doc.kind,
      title: doc.title,
      body: doc.body,
      published: doc.published,
      file: null,
    });
    setExistingFileName(doc.fileName);
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setExistingFileName(null);
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPickFile(file: File | null) {
    if (!file) {
      setDraft((p) => ({ ...p, file: null }));
      return;
    }
    setDraft((p) => ({
      ...p,
      file,
      title: p.title.trim() ? p.title : file.name.replace(/\.[^.]+$/, ""),
    }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!editingId && !draft.file) {
      setMessage("Attach a file to upload.");
      return;
    }
    if (editingId && !draft.file && !existingFileName) {
      setMessage("Attach a file to upload.");
      return;
    }

    setBusy(true);
    setMessage("");
    const result = editingId
      ? await updateDocument(editingId, {
          kind: draft.kind,
          title: draft.title,
          body: draft.body,
          published: draft.published,
          file: draft.file,
        })
      : await createDocument({
          kind: draft.kind,
          title: draft.title,
          body: draft.body,
          published: draft.published,
          file: draft.file,
        });
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
        <h2>{editingId ? "Edit document" : "Upload a document"}</h2>
      </div>
      <p className="emp-lede">
        Attach PDFs, Word/Excel files, or images (SOPs, policies, forms). Optional note for the
        crew. Max {formatFileSize(MAX_DOC_BYTES)}.
      </p>

      <form className="emp-form" onSubmit={(e) => void onSave(e)}>
        <label>
          Type
          <select
            value={draft.kind}
            onChange={(e) =>
              setDraft((p) => ({ ...p, kind: e.target.value as DocumentKind }))
            }
          >
            <option value="sop">SOP</option>
            <option value="policy">Policy</option>
            <option value="announcement">Announcement</option>
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
          File
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_DOC_TYPES}
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            required={!editingId}
          />
        </label>
        {draft.file ? (
          <p className="emp-meta">
            Selected: {draft.file.name} ({formatFileSize(draft.file.size)})
          </p>
        ) : existingFileName ? (
          <p className="emp-meta">
            Current file: {existingFileName}
            {editingId ? " — choose a new file to replace it." : ""}
          </p>
        ) : null}

        <label>
          Optional note
          <textarea
            value={draft.body}
            onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value }))}
            rows={compact ? 3 : 4}
            placeholder="Short note for the crew (optional)"
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
              /uploaded|updated|deleted/i.test(message) ? "emp-flash" : "emp-error"
            }
          >
            {message}
          </p>
        ) : null}

        <div className="emp-fence-actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Saving…" : editingId ? "Update document" : "Upload document"}
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
        <p className="emp-empty">No documents yet. Upload your first file above.</p>
      ) : (
        <ul className="emp-admin-docs">
          {documents.map((doc) => (
            <li key={doc.id}>
              <div>
                <strong>{doc.title}</strong>
                <span>
                  {kindLabel(doc.kind)} · {doc.published ? "Published" : "Draft"} ·{" "}
                  {doc.fileName
                    ? `${doc.fileName}${doc.fileSize != null ? ` (${formatFileSize(doc.fileSize)})` : ""}`
                    : "No file"}{" "}
                  · {formatWhen(doc.updatedAt)}
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
