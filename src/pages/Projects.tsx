import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mergeProjectMedia, projectMedia, type ProjectMedia } from "../data/projects";
import "./Projects.css";

type ManifestPhoto = { type: "photo"; src: string };

function isManifestPhoto(value: unknown): value is ManifestPhoto {
  if (!value || typeof value !== "object") return false;
  const item = value as ManifestPhoto;
  return item.type === "photo" && typeof item.src === "string" && item.src.startsWith("/projects/");
}

export function Projects() {
  const [active, setActive] = useState<ProjectMedia | null>(null);
  const [dumped, setDumped] = useState<ManifestPhoto[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const res = await fetch(`/projects/manifest.json?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setDumped(data.filter(isManifestPhoto));
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
    const merged = mergeProjectMedia([dumped, projectMedia]);
    return merged.filter((item) => {
      const key = item.type === "photo" ? item.src : item.src;
      return !hidden.has(key);
    });
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
          <p>A look at jobs across Southeast Texas. Click any photo or clip to enlarge.</p>
        </div>
      </header>

      <section className="band band--projects" aria-labelledby="projects-gallery-title">
        <div className="band__inner reveal">
          <h2 id="projects-gallery-title" className="sr-only">
            Project photos
          </h2>

          <ul className="projects-grid">
            {gallery.map((item) => (
              <li key={item.type === "photo" ? item.src : `${item.src}-video`}>
                <button
                  type="button"
                  className={item.type === "video" ? "project-tile project-tile--video" : "project-tile"}
                  onClick={() => setActive(item)}
                  aria-label={item.type === "video" ? "Play video" : "View photo larger"}
                >
                  <img
                    src={item.type === "photo" ? item.src : item.poster}
                    alt=""
                    loading="lazy"
                    width={800}
                    height={560}
                    onError={() => hideItem(item.src)}
                  />
                  {item.type === "video" ? (
                    <span className="project-tile__play" aria-hidden="true">
                      Play
                    </span>
                  ) : null}
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
          aria-label={active.type === "video" ? "Project video" : "Project photo"}
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
            {active.type === "photo" ? (
              <img src={active.src} alt="" />
            ) : (
              <video
                src={active.src}
                poster={active.poster}
                controls
                autoPlay
                playsInline
              />
            )}
          </figure>
        </div>
      ) : null}
    </div>
  );
}
