import { useEffect, useMemo, useState } from "react";
import { DocumentManager } from "./DocumentManager";
import { formatFileSize, isPreviewableMime } from "./documentFiles";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatWhen, kindLabel } from "./format";
import type { InternalDocument } from "./types";

export function EmployeeDocuments() {
  const { documents, isAdmin, getDocumentFileUrl } = useEmployeeAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState("");

  const visible = useMemo(
    () => documents.filter((doc) => doc.published || isAdmin),
    [documents, isAdmin],
  );

  const active = visible.find((doc) => doc.id === activeId) ?? visible[0] ?? null;

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    async function loadUrl(doc: InternalDocument | null) {
      setFileUrl(null);
      setFileError("");
      if (!doc?.fileName && !doc?.filePath) return;
      setFileBusy(true);
      const url = await getDocumentFileUrl(doc);
      if (cancelled) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      if (!url) {
        setFileBusy(false);
        setFileError("Could not open the attached file.");
        return;
      }
      if (url.startsWith("blob:")) revoked = url;
      setFileUrl(url);
      setFileBusy(false);
    }

    void loadUrl(active);
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [active, getDocumentFileUrl]);

  return (
    <div className="emp-stack">
      {isAdmin ? <DocumentManager compact /> : null}

      <div className="emp-docs">
        <section className="emp-card emp-docs__list">
          <p className="eyebrow">Internal</p>
          <h1>Documents</h1>
          <p className="emp-lede">
            {isAdmin
              ? "Crew library of attached SOPs, policies, and forms. Upload files above."
              : "SOPs, policies, and forms for the crew — open or download each file."}
          </p>

          {visible.length === 0 ? (
            <p className="emp-empty">
              {isAdmin
                ? "No documents yet — upload a file above."
                : "No documents published yet."}
            </p>
          ) : (
            <ul className="emp-doc-index">
              {visible.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    className={
                      active?.id === doc.id
                        ? "emp-doc-index__item is-active"
                        : "emp-doc-index__item"
                    }
                    onClick={() => setActiveId(doc.id)}
                  >
                    <span className="emp-doc-index__kind">{kindLabel(doc.kind)}</span>
                    <span className="emp-doc-index__title">{doc.title}</span>
                    {!doc.published ? <span className="emp-pill">Draft</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="emp-card emp-docs__reader">
          {active ? (
            <>
              <p className="eyebrow">{kindLabel(active.kind)}</p>
              <h2>{active.title}</h2>
              <p className="emp-meta">Updated {formatWhen(active.updatedAt)}</p>

              {active.body ? <div className="emp-doc-body">{active.body}</div> : null}

              {active.fileName || active.filePath ? (
                <div className="emp-doc-file">
                  <p className="emp-meta">
                    Attachment: <strong>{active.fileName || "File"}</strong>
                    {active.fileSize != null ? ` · ${formatFileSize(active.fileSize)}` : ""}
                  </p>
                  {fileBusy ? <p className="emp-meta">Preparing file…</p> : null}
                  {fileError ? <p className="emp-error">{fileError}</p> : null}
                  {fileUrl ? (
                    <div className="emp-fence-actions">
                      <a
                        className="btn btn--primary"
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={active.fileName || undefined}
                      >
                        Open / download
                      </a>
                    </div>
                  ) : null}

                  {fileUrl && isPreviewableMime(active.fileMime) ? (
                    active.fileMime?.startsWith("image/") ? (
                      <img
                        className="emp-doc-preview emp-doc-preview--image"
                        src={fileUrl}
                        alt={active.title}
                      />
                    ) : (
                      <iframe
                        className="emp-doc-preview"
                        title={active.title}
                        src={fileUrl}
                      />
                    )
                  ) : null}
                </div>
              ) : (
                <p className="emp-empty">No file attached to this document.</p>
              )}
            </>
          ) : (
            <p className="emp-empty">Select a document to open.</p>
          )}
        </section>
      </div>
    </div>
  );
}
