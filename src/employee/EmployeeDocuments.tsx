import { useMemo, useState } from "react";
import { useEmployeeAuth } from "./EmployeeAuth";
import { formatWhen, kindLabel } from "./format";

export function EmployeeDocuments() {
  const { documents, isAdmin } = useEmployeeAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = useMemo(
    () => documents.filter((doc) => doc.published || isAdmin),
    [documents, isAdmin],
  );

  const active = visible.find((doc) => doc.id === activeId) ?? visible[0] ?? null;

  return (
    <div className="emp-docs">
      <section className="emp-card emp-docs__list">
        <p className="eyebrow">Internal</p>
        <h1>Documents</h1>
        <p className="emp-lede">Announcements, SOPs, and policies for the crew.</p>

        {visible.length === 0 ? (
          <p className="emp-empty">No documents published yet.</p>
        ) : (
          <ul className="emp-doc-index">
            {visible.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  className={
                    active?.id === doc.id ? "emp-doc-index__item is-active" : "emp-doc-index__item"
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
            <div className="emp-doc-body">{active.body}</div>
          </>
        ) : (
          <p className="emp-empty">Select a document to read.</p>
        )}
      </section>
    </div>
  );
}
