import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { hubDisclaimer } from "../data/content";
import { SetupBanner } from "./SetupBanner";
import "./Layout.css";
import "./Disclaimer.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const { member, logout, isAdmin } = useAuth();

  const links = member
    ? [
        { to: "/", label: "Home", end: true },
        { to: "/members", label: "Members" },
        { to: "/education", label: "Education" },
        { to: "/membership", label: "Lounge" },
        ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
        { to: "/permits", label: "Permits" },
      ]
    : [
        { to: "/", label: "Home", end: true },
        { to: "/members", label: "Members" },
        { to: "/education", label: "Education" },
        { to: "/permits", label: "Permits" },
      ];

  return (
    <>
      <SetupBanner />
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand-mark" aria-label="ACAC home">
            <span className="brand-mark__abbr">ACAC</span>
            <span className="brand-mark__full">
              Austin County
              <br />
              Association of Contractors
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
            {member ? (
              <button
                type="button"
                className="site-nav__cta site-nav__cta--ghost"
                onClick={() => void logout()}
              >
                Sign out
              </button>
            ) : (
              <NavLink to="/membership" className="site-nav__cta">
                Member login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <p className="site-footer__brand">Austin County Association of Contractors</p>
            <p className="site-footer__tag">
              A hub for networking, curated education opportunities, and support across Austin
              County.
            </p>
          </div>
          <div className="site-footer__links">
            <NavLink to="/members">Members</NavLink>
            <NavLink to="/education">Education</NavLink>
            <NavLink to="/apply">Apply</NavLink>
            {member ? <NavLink to="/membership">Lounge</NavLink> : null}
            {isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
            <NavLink to="/permits">Permits</NavLink>
            <NavLink to="/terms">Terms</NavLink>
            <NavLink to="/privacy">Privacy</NavLink>
          </div>
        </div>
        <p className="site-footer__disclaimer">
          {hubDisclaimer.text} <NavLink to="/terms">Terms</NavLink>
        </p>
      </footer>
    </>
  );
}
