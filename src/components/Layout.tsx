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
            <img
              className="brand-mark__logo"
              src={company.logo}
              alt={company.name}
              width={420}
              height={120}
            />
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
            <img
              className="site-footer__logo"
              src={company.logo}
              alt={company.legal}
              width={420}
              height={120}
            />
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
            <NavLink to="/copyright">Copyright</NavLink>
          </div>
        </div>
        <p className="site-footer__crawl">
          <NavLink to="/copyright">© {new Date().getFullYear()} {company.legal}. All rights reserved.</NavLink>
          {" · "}
          <a href="/southeast-texas-construction">Southeast Texas construction resources</a>
          {" · "}
          <a href="/southeast-texas-construction#media-converter-title">Photo dump</a>
        </p>
      </footer>
    </>
  );
}
