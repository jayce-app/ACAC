import { Link } from "react-router-dom";
import { about, company, credentials } from "../data/content";
import "./About.css";

export function About() {
  return (
    <div className="about-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Who we are</p>
          <h1>About</h1>
          <p>
            {company.legal} — owned by {company.owner}. General contractor serving Southeast Texas
            from Bellville.
          </p>
        </div>
      </header>

      <section className="band band--about-story" aria-labelledby="about-story-title">
        <div className="band__inner about-story reveal">
          <p className="eyebrow">Our story</p>
          <h2 id="about-story-title">{about.title}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="band band--credentials" aria-labelledby="credentials-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Why choose us</p>
          <h2 id="credentials-title">Credentials that matter on the job</h2>
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
          <p className="eyebrow">Service area &amp; shop</p>
          <h2 id="area-title">Southeast Texas</h2>
          <p className="area-lead">{company.serviceArea}</p>
          <p className="area-address">
            {company.address}
            <br />
            {company.city}
            <br />
            <span className="area-hours">{company.hours}</span>
          </p>
          <Link to="/contact" className="btn btn--primary">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
