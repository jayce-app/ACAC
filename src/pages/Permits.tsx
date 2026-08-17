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
