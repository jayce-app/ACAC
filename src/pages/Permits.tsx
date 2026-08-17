import { permitLinks } from "../data/content";
import "./Permits.css";

export function Permits() {
  return (
    <div className="permits">
      <section className="permits-hero">
        <div className="permits-hero__inner">
          <p className="eyebrow">Resources</p>
          <h1>Permit forms &amp; offices</h1>
          <p>
            Quick links to Austin County and municipal permit pages so contractors can find the
            right applications without hunting across websites.
          </p>
        </div>
      </section>

      <section className="permits-list">
        <div className="permits-list__inner">
          <aside className="permits-811" aria-label="Texas 811 contact">
            <p className="permits-811__label">Before you dig</p>
            <h2>Call 811</h2>
            <p>
              Contact <strong>Texas811</strong> at least two business days before excavating
              (weekends and holidays excluded). It&apos;s free, and it&apos;s the law.
            </p>
            <ul className="permits-811__contacts">
              <li>
                <span>In Texas</span>
                <a href="tel:811">811</a>
              </li>
              <li>
                <span>Out of state</span>
                <a href="tel:+18003448377">1-800-344-8377</a>
              </li>
              <li>
                <span>Online</span>
                <a href="https://www.texas811.org/" target="_blank" rel="noreferrer">
                  texas811.org
                </a>
              </li>
            </ul>
          </aside>

          <p className="permits-note">
            Confirm whether your project sits in city limits or unincorporated county before
            applying. City projects use municipal permitting; county projects generally go through
            Austin County Planning &amp; Development.
          </p>

          <ul>
            {permitLinks.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="permit-link">
                  <span className="permit-link__jurisdiction">{link.jurisdiction}</span>
                  <span className="permit-link__name">{link.name}</span>
                  <span className="permit-link__desc">{link.description}</span>
                  <span className="permit-link__cta">Open website →</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
