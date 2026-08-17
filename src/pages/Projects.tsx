import { useState } from "react";
import { Link } from "react-router-dom";
import { projectMedia, type ProjectMedia } from "../data/projects";
import "./Projects.css";

export function Projects() {
  const [active, setActive] = useState<ProjectMedia | null>(null);

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
            {projectMedia.map((item) => (
              <li key={item.type === "photo" ? item.src : item.src}>
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
