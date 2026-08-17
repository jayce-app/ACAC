import { useState } from "react";
import { Link } from "react-router-dom";
import { projectPhotos } from "../data/projects";
import "./Projects.css";

export function Projects() {
  const [active, setActive] = useState<string | null>(null);

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
            {projectPhotos.map((src) => (
              <li key={src}>
                <button
                  type="button"
                  className="project-tile"
                  onClick={() => setActive(src)}
                  aria-label="View photo larger"
                >
                  <img src={src} alt="" loading="lazy" width={800} height={560} />
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
            <img src={active} alt="" />
          </figure>
        </div>
      ) : null}
    </div>
  );
}
