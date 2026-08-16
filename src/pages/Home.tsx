import { Link } from "react-router-dom";
import { company, process, services } from "../data/content";
import "./Home.css";

const featured = services.slice(0, 3);

export function Home() {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero__media" aria-hidden="true">
          <img
            src="/hero.jpg"
            alt=""
            className="hero__img"
            width={1536}
            height={1024}
          />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p id="hero-brand" className="hero__brand">
            TX Ropers Construction
          </p>
          <h1 className="hero__headline">{company.tagline}</h1>
          <p className="hero__lede">
            Turnkey metal buildings, barndominiums, and site work out of Bellville — built for
            how Texas actually works.
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

      <section className="band band--promise" aria-labelledby="promise-title">
        <div className="band__inner reveal">
          <p className="eyebrow">What we stand for</p>
          <h2 id="promise-title">One crew. One build. Done right.</h2>
          <p className="lead">
            From scraped pad to custom stalls and living space, TX Ropers takes turnkey projects
            across Austin County so you are not coordinating a dozen trades yourself.
          </p>
        </div>
      </section>

      <section className="band band--services" aria-labelledby="home-services-title">
        <div className="band__inner reveal">
          <div className="section-head">
            <div>
              <p className="eyebrow">Core work</p>
              <h2 id="home-services-title">Built for shops, ranches, and living space</h2>
            </div>
            <Link to="/services" className="btn btn--dark">
              All services
            </Link>
          </div>

          <ul className="service-rows">
            {featured.map((service) => (
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
          <p className="eyebrow">How a job runs</p>
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
              Serving {company.serviceArea} Reach {company.owner} directly, or send a project note.
            </p>
          </div>
          <div className="band__cta-actions">
            <a href={company.phoneHref} className="btn btn--primary">
              {company.phone}
            </a>
            <Link to="/contact" className="btn btn--ghost">
              Contact form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
