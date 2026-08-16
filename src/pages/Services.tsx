import { Link } from "react-router-dom";
import { services } from "../data/content";
import "./Services.css";

export function Services() {
  return (
    <div className="services-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">What we build</p>
          <h1>Services</h1>
          <p>
            Turnkey metal buildings, barndominiums, structural steel, and site work — plus the
            custom interiors that make a structure actually usable.
          </p>
        </div>
      </header>

      <section className="band band--list" aria-labelledby="services-list-title">
        <div className="band__inner reveal">
          <h2 id="services-list-title" className="sr-only">
            Service list
          </h2>
          <ul className="services-grid">
            {services.map((service, index) => (
              <li key={service.id} className="services-item">
                <span className="services-item__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--services-cta" aria-labelledby="services-cta-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Next step</p>
          <h2 id="services-cta-title">Got a pad, a plan, or just an idea?</h2>
          <p>We will walk the site with you and map a clear path from dirt to done.</p>
          <Link to="/contact" className="btn btn--primary">
            Start a project
          </Link>
        </div>
      </section>
    </div>
  );
}
