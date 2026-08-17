import { Link } from "react-router-dom";
import { useState } from "react";
import { company, featuredServices, process } from "../data/content";
import "./Home.css";

export function Home() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero__media" aria-hidden="true">
          <div className="hero__fallback" />
          <img
            src="/hero.jpg"
            alt=""
            className={heroReady ? "hero__img is-ready" : "hero__img"}
            width={1600}
            height={900}
            onLoad={() => setHeroReady(true)}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p id="hero-brand" className="hero__brand">
            TX Ropers Construction
          </p>
          <h1 className="hero__headline">{company.tagline}</h1>
          <p className="hero__lede">
            Custom residential and commercial construction out of Bellville — metal buildings,
            structural steel, dirt and site work, and turnkey builds across Southeast Texas.
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn--primary">
              Request a quote
            </Link>
            <Link to="/services" className="btn btn--ghost">
              View services
            </Link>
          </div>
        </div>
      </section>

      <section className="band band--services" aria-labelledby="home-services-title">
        <div className="band__inner reveal">
          <div className="section-head">
            <div>
              <p className="eyebrow">What we build</p>
              <h2 id="home-services-title">Metal buildings, steel, and dirt work</h2>
            </div>
            <Link to="/services" className="btn btn--dark">
              All services
            </Link>
          </div>

          <ul className="service-rows">
            {featuredServices.map((service) => (
              <li key={service.id} className="service-row">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--process" aria-labelledby="process-title">
        <div className="band__inner reveal">
          <p className="eyebrow">How a quote starts</p>
          <h2 id="process-title">Simple process, solid build</h2>
          <ol className="process-list">
            {process.map((item) => (
              <li key={item.step} className="process-item">
                <span className="process-item__step" aria-hidden="true">
                  {item.step}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--cta" aria-labelledby="cta-title">
        <div className="band__inner band__cta reveal">
          <div>
            <p className="eyebrow">Ready to start</p>
            <h2 id="cta-title">Tell us what you need built</h2>
            <p>
              {company.serviceArea} Call the office or send a quote request —{" "}
              {company.hours}.
            </p>
          </div>
          <div className="band__cta-actions">
            <a href={company.phoneHref} className="btn btn--primary">
              {company.phone}
            </a>
            <Link to="/contact" className="btn btn--ghost">
              Quote form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
