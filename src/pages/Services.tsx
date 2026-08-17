import { Link } from "react-router-dom";
import { commercialServices, crewApproach, residentialServices } from "../data/content";
import "./Services.css";

export function Services() {
  return (
    <div className="services-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">What we build</p>
          <h1>Services</h1>
          <p>
            Custom residential and commercial construction across Southeast Texas — led by our
            in-house crew, with the trades network to cover full-scope general construction.
          </p>
        </div>
      </header>

      <section className="band band--crew" aria-labelledby="crew-title">
        <div className="band__inner reveal">
          <p className="eyebrow">How we work</p>
          <h2 id="crew-title">{crewApproach.title}</h2>
          <p className="crew-lead">{crewApproach.text}</p>
        </div>
      </section>

      <section className="band band--list" aria-labelledby="residential-title">
        <div className="band__inner reveal">
          <p className="eyebrow">For homeowners &amp; ranch properties</p>
          <h2 id="residential-title">Residential</h2>
          <p className="services-intro">
            General construction, new construction, metal buildings, and dirt and site work.
            Custom work only — we do not do production home builds.
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
            framing, dirt and site work, remodeling, and additions — delivered turnkey with our
            crew at the center of the job.
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
