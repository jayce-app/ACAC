import { Link } from "react-router-dom";
import { crewApproach, serviceGroups } from "../data/content";
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

      <section className="band band--list" aria-labelledby="services-groups-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Capabilities</p>
          <h2 id="services-groups-title">What we take on</h2>
          <p className="services-intro">
            Residential and commercial under the same roof — grouped by the work we actually do,
            not a long list of overlapping titles.
          </p>
          <ul className="services-groups">
            {serviceGroups.map((group, index) => (
              <li key={group.id} className="services-group">
                <span className="services-group__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="services-group__body">
                  <h3>{group.title}</h3>
                  <p>{group.text}</p>
                  <ul className="services-group__includes">
                    {group.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
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
