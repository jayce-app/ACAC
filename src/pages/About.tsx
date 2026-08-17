import { useState } from "react";
import { Link } from "react-router-dom";
import { ServiceAreaMap } from "../components/ServiceAreaMap";
import "../components/ServiceAreaMap.css";
import { about, company, credentials, owner } from "../data/content";
import "./About.css";

export function About() {
  const [ownerPhotoReady, setOwnerPhotoReady] = useState(false);

  return (
    <div className="about-page">
      <section className="band band--about-main" aria-labelledby="about-story-title">
        <div className="band__inner about-layout reveal">
          <div className="about-copy">
            <h1 id="about-story-title">{about.title}</h1>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <a
              className="about-social"
              href={company.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="TX Ropers Construction on Facebook"
            >
              <span className="about-social__icon" aria-hidden="true">
                f
              </span>
              Facebook
            </a>
          </div>

          <aside className="about-aside" aria-labelledby="about-contact-title">
            <h2 id="about-contact-title">Contact us for a quote</h2>
            <dl className="about-aside__dl">
              <div>
                <dt>Office phone</dt>
                <dd>
                  <a href={company.phoneHref}>{company.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {company.address}
                  <br />
                  {company.city}
                </dd>
              </div>
              <div>
                <dt>Office hours</dt>
                <dd>
                  {company.hoursWeekday}
                  <br />
                  {company.hoursWeekend}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={company.emailHref}>{company.email}</a>
                </dd>
              </div>
            </dl>
            <Link to="/contact" className="btn btn--primary">
              Request a quote
            </Link>
          </aside>
        </div>
      </section>

      <section className="band band--owner" aria-labelledby="owner-title">
        <div className="band__inner owner-layout reveal">
          <div className="owner-photo">
            {ownerPhotoReady ? null : (
              <div className="owner-photo__placeholder" aria-hidden="true">
                <span>Owner photo</span>
                <span className="owner-photo__hint">Add jayce-johnson.jpg</span>
              </div>
            )}
            <img
              src={owner.image}
              alt={ownerPhotoReady ? `${owner.name}, ${owner.role}` : ""}
              width={480}
              height={600}
              className={ownerPhotoReady ? "is-ready" : undefined}
              onLoad={() => setOwnerPhotoReady(true)}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="owner-copy">
            <p className="eyebrow">Meet the owner</p>
            <h2 id="owner-title">{owner.name}</h2>
            <p className="owner-role">{owner.role}</p>
            <p className="owner-headline">{owner.headline}</p>
            {owner.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--proof" aria-label="Project photo">
        <div className="band__inner">
          <figure className="about-proof reveal">
            <img
              src="/project-stalls.jpg"
              alt="Custom horse stalls built by TX Ropers Construction inside a metal building"
              width={1179}
              height={885}
            />
          </figure>
        </div>
      </section>

      <section className="band band--credentials" aria-labelledby="credentials-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Why choose us</p>
          <h2 id="credentials-title">What sets the work apart</h2>
          <ul className="credential-list">
            {credentials.map((item) => (
              <li key={item.title} className="credential-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--about-area" aria-labelledby="area-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Service area</p>
          <h2 id="area-title">Southeast Texas</h2>
          <p className="area-lead">{company.serviceArea}</p>
          <ServiceAreaMap />
          <Link to="/contact" className="btn btn--primary">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
