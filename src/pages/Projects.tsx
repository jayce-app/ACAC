import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mergeProjectMedia, type ProjectMedia } from "../data/projects";
import "./Projects.css";

function isProjectMedia(value: unknown): value is ProjectMedia {
  if (!value || typeof value !== "object") return false;
  const item = value as ProjectMedia;
  return (
    typeof item.src === "string" &&
    item.src.startsWith("/projects/") &&
    (item.type === "image" || item.type === "video")
  );
}

export function Projects() {
  const [active, setActive] = useState<ProjectMedia | null>(null);
  const [dumped, setDumped] = useState<ProjectMedia[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const res = await fetch(`/projects/manifest.json?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        const items = Array.isArray(data)
          ? data
          : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
            ? (data as { items: unknown[] }).items
            : [];
        if (!cancelled) {
          setDumped(items.filter(isProjectMedia));
        }
      } catch {
        // Static hosting without a manifest is fine — curated list still shows.
      }
    }

    void loadManifest();
    const onFocus = () => void loadManifest();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const gallery = useMemo(() => {
    const merged = mergeProjectMedia(dumped);
    return merged.filter((item) => !hidden.has(item.src));
  }, [dumped, hidden]);

  function hideItem(src: string) {
    setHidden((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }

  return (
    <div className="projects-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Our work</p>
          <h1>Projects</h1>
          <p>A look at jobs across Southeast Texas. Click any photo to enlarge.</p>
        </div>
      </header>

      <section className="band band--projects" aria-labelledby="projects-gallery-title">
        <div className="band__inner reveal">
          <h2 id="projects-gallery-title" className="sr-only">
            Project photos
          </h2>

          <ul className="projects-grid">
            {gallery.map((item) => (
              <li key={item.id || item.src}>
                <button
                  type="button"
                  className="project-tile"
                  onClick={() => setActive(item)}
                  aria-label="View photo larger"
                >
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    width={800}
                    height={560}
                    onError={() => hideItem(item.src)}
                  />
                </button>
              </li>
            ))}
          </ul>

          <div className="projects-cta">
            <Link to="/contact" className="btn btn--primary">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      {active ? (
        <div
          className="project-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Project photo"
          onClick={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActive(null);
          }}
        >
          <button
            type="button"
            className="project-lightbox__close"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <figure
            className="project-lightbox__figure"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={active.src} alt="" />
          </figure>
        </div>
      ) : null}
    </div>
  );
}
