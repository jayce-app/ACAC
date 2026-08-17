import { NavLink } from "react-router-dom";
import { company } from "../data/content";
import "./Layout.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand-mark" aria-label={`${company.name} home`}>
            <span className="brand-mark__icon" aria-hidden="true">
              <img src="/logo.png" alt="" width={44} height={44} />
            </span>
            <span className="brand-mark__word">
              <span className="brand-mark__name">TX Ropers</span>
              <span className="brand-mark__trade">Construction</span>
            </span>
          </NavLink>

          <nav className="site-nav" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? "site-nav__link is-active" : "site-nav__link"
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a href={company.phoneHref} className="site-nav__cta">
              Call now
            </a>
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <div className="site-footer__brand-row">
              <span className="site-footer__mark" aria-hidden="true">
                <img src="/logo-mark.png" alt="" width={48} height={48} />
              </span>
              <p className="site-footer__brand">{company.legal}</p>
            </div>
            <p className="site-footer__tag">
              Custom residential and commercial construction — Bellville, Southeast Texas.
            </p>
            <p className="site-footer__meta">
              {company.address}, {company.city}
              <br />
              <a href={company.phoneHref}>{company.phone}</a>
              {" · "}
              <a href={company.emailHref}>{company.email}</a>
              <br />
              {company.hours}
              <br />
              <a href={company.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            </p>
          </div>
          <div className="site-footer__links">
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </div>
        <p className="site-footer__crawl">
          <a href="/southeast-texas-construction">Southeast Texas construction resources</a>
        </p>
      </footer>
    </>
  );
}
