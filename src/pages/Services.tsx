import { Link } from "react-router-dom";
import { commercialServices, residentialServices } from "../data/content";
import "./Services.css";

export function Services() {
  return (
    <div className="services-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">What we build</p>
          <h1>Services</h1>
          <p>
            Custom residential and commercial construction — turnkey when you need it, with a lot
            of the work self-performed by our crew.
          </p>
        </div>
      </header>

      <section className="band band--list" aria-labelledby="residential-title">
        <div className="band__inner reveal">
          <p className="eyebrow">For homeowners &amp; ranch properties</p>
          <h2 id="residential-title">Residential</h2>
          <p className="services-intro">
            General construction, new construction, dirt work, concrete, metal buildings, new
            homes, and barndominiums. Custom work only — we do not do production home builds.
          </p>
          <ul className="services-grid">
            {residentialServices.map((service, index) => (
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

      <section className="band band--commercial" aria-labelledby="commercial-title">
        <div className="band__inner reveal">
          <p className="eyebrow">For businesses &amp; commercial sites</p>
          <h2 id="commercial-title">Commercial</h2>
          <p className="services-intro">
            General construction, new construction, structural steel, metal buildings, metal
            framing, remodeling, and additions — built turnkey with self-performed craft.
          </p>
          <ul className="services-grid">
            {commercialServices.map((service, index) => (
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
          <h2 id="services-cta-title">Request a quote</h2>
          <p>
            Share your name, address, phone, email, and a quick description of what you need built.
          </p>
          <Link to="/contact" className="btn btn--primary">
            Start a project
          </Link>
        </div>
      </section>
    </div>
  );
}
