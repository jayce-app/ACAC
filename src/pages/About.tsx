import { Link } from "react-router-dom";
import { about, company } from "../data/content";
import "./About.css";

const aboutImage =
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80";

export function About() {
  return (
    <div className="about-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Who we are</p>
          <h1>About</h1>
          <p>
            {company.legal} is a Bellville general contractor led by {company.owner} — focused on
            turnkey steel, metal buildings, and custom ranch construction.
          </p>
        </div>
      </header>

      <section className="band band--about-story" aria-labelledby="about-story-title">
        <div className="band__inner about-split reveal">
          <div className="about-split__copy">
            <p className="eyebrow">Our story</p>
            <h2 id="about-story-title">{about.title}</h2>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <figure className="about-split__media">
            <img src={aboutImage} alt="Construction crew working on a framed structure" />
          </figure>
        </div>
      </section>

      <section className="band band--about-area" aria-labelledby="area-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Service area</p>
          <h2 id="area-title">Rooted in Austin County</h2>
          <p className="area-lead">{company.serviceArea}</p>
          <p className="area-address">
            {company.address}
            <br />
            {company.city}
          </p>
          <Link to="/contact" className="btn btn--primary">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
