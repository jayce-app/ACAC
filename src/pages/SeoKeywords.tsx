import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { company } from "../data/content";
import { seoKeywords, seoLocations, seoTopics } from "../data/seo";
import "./SeoKeywords.css";

const MediaConverter = lazy(() =>
  import("../components/MediaConverter").then((m) => ({ default: m.MediaConverter })),
);

/**
 * Crawlable keyword / service-area page.
 * Intentionally omitted from primary navigation; discoverable via sitemap + footer.
 * Also hosts the on-device photo converter tool at the bottom.
 */
export function SeoKeywords() {
  return (
    <div className="seo-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Service coverage</p>
          <h1>Southeast Texas construction resources</h1>
          <p>
            {company.legal} is a Bellville general contractor offering metal buildings, dirt and
            site work, structural steel, and turnkey construction across Southeast Texas.
          </p>
        </div>
      </header>

      <section className="band band--seo" aria-labelledby="seo-topics-title">
        <div className="band__inner">
          <h2 id="seo-topics-title">What we build and where we work</h2>
          {seoTopics.map((topic) => (
            <article key={topic.title} className="seo-topic">
              <h3>{topic.title}</h3>
              <p>{topic.text}</p>
            </article>
          ))}

          <h2>Cities and counties we serve</h2>
          <p>
            Primary service area is roughly 50 miles from {company.address}, {company.city}. We also
            travel for special projects across Southeast Texas.
          </p>
          <ul className="seo-chips">
            {seoLocations.map((place) => (
              <li key={place}>{place}</li>
            ))}
          </ul>

          <h2>Related construction search terms</h2>
          <p>
            Common searches that match our work include metal building contractors, dirt work and
            site preparation, structural steel erection, covered arenas, ranch shops, and turnkey
            general contracting near Bellville and Brenham.
          </p>
          <ul className="seo-keywords">
            {seoKeywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>

          <p className="seo-contact">
            Request a quote:{" "}
            <a href={company.phoneHref}>{company.phone}</a> ·{" "}
            <a href={company.emailHref}>{company.email}</a> ·{" "}
            <Link to="/contact">Contact form</Link> · <Link to="/services">Services</Link>
          </p>

          <section aria-labelledby="media-converter-title">
            <Suspense fallback={<p className="seo-converter-loading">Loading photo converter…</p>}>
              <MediaConverter />
            </Suspense>
          </section>
        </div>
      </section>
    </div>
  );
}
