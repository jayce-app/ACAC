import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

/** Deterministic 0–1 generator so a visit keeps one shuffle. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rand: () => number) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const current = items[i];
    const swap = items[j];
    if (current === undefined || swap === undefined) continue;
    items[i] = swap;
    items[j] = current;
  }
  return items;
}

export function Projects() {
  const [active, setActive] = useState<ProjectMedia | null>(null);
  const [dumped, setDumped] = useState<ProjectMedia[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000_000));

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

  const items = useMemo(() => mergeProjectMedia(dumped), [dumped]);
  const srcKey = useMemo(
    () =>
      items
        .map((item) => item.src)
        .slice()
        .sort()
        .join("\0"),
    [items],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const scattered = useMemo(() => {
    const rand = mulberry32(seed);
    const shuffled = shuffleInPlace([...itemsRef.current], rand);
    const ratios = ["3 / 4", "4 / 3", "1 / 1", "5 / 4"];
    return shuffled.map((item) => {
      const rotate = rand() * 34 - 17;
      const dx = rand() * 36 - 18;
      const dy = rand() * 30 - 15;
      const width = 132 + Math.floor(rand() * 86);
      const z = 1 + Math.floor(rand() * 24);
      const ratio = ratios[Math.floor(rand() * ratios.length)] ?? "4 / 3";
      return {
        item,
        style: {
          "--rot": `${rotate.toFixed(2)}deg`,
          "--dx": `${dx.toFixed(1)}px`,
          "--dy": `${dy.toFixed(1)}px`,
          "--w": `${width}px`,
          "--z": String(z),
          "--ratio": ratio,
        } as CSSProperties,
      };
    });
  }, [srcKey, seed]);

  const gallery = useMemo(
    () => scattered.filter((entry) => !hidden.has(entry.item.src)),
    [scattered, hidden],
  );

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

          <ul className="projects-pile">
            {gallery.map(({ item, style }) => (
              <li key={item.id || item.src} style={style}>
                <button
                  type="button"
                  className="project-print"
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
