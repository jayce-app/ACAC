import { NavLink } from "react-router-dom";
import { company } from "../data/content";
import "./Layout.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
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
              <img src="/logo.svg" alt="" width={48} height={34} />
            </span>
            <span className="brand-mark__full">
              TX Ropers
              <br />
              Construction
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
            <p className="site-footer__brand">{company.legal}</p>
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
            </p>
          </div>
          <div className="site-footer__links">
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </div>
      </footer>
    </>
  );
}
