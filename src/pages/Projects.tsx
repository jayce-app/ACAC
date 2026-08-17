import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { projectCategories, projects, type Project } from "../data/projects";
import "./Projects.css";

export function Projects() {
  const [filter, setFilter] = useState<(typeof projectCategories)[number]>("All");
  const [active, setActive] = useState<Project | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <div className="projects-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Our work</p>
          <h1>Projects</h1>
          <p>
            Completed metal buildings, interiors, and site work across Southeast Texas. Click a
            photo to view it larger.
          </p>
        </div>
      </header>

      <section className="band band--projects" aria-labelledby="projects-gallery-title">
        <div className="band__inner reveal">
          <div className="projects-toolbar">
            <h2 id="projects-gallery-title" className="sr-only">
              Project gallery
            </h2>
            <div className="projects-filters" role="group" aria-label="Filter by category">
              {projectCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    filter === category ? "projects-filter is-active" : "projects-filter"
                  }
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="projects-empty">
              No projects in this category yet. Add photos under{" "}
              <code>public/projects/</code> and list them in <code>src/data/projects.ts</code>.
            </p>
          ) : (
            <ul className="projects-grid">
              {visible.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    className="project-tile"
                    onClick={() => setActive(project)}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      width={800}
                      height={560}
                    />
                    <span className="project-tile__meta">
                      <span className="project-tile__category">{project.category}</span>
                      <span className="project-tile__title">{project.title}</span>
                      {project.location ? (
                        <span className="project-tile__location">{project.location}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="projects-upload-note">
            To add more photos, place files in <code>public/projects/</code> and add an entry in{" "}
            <code>src/data/projects.ts</code>. See that folder’s README for steps.
          </p>

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
          aria-label={active.title}
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
            <img src={active.image} alt={active.title} />
            <figcaption>
              <strong>{active.title}</strong>
              {active.location ? ` — ${active.location}` : ""}
              {active.blurb ? <span>{active.blurb}</span> : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
