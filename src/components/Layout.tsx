import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Layout.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/members", label: "Members" },
  { to: "/membership", label: "Lounge" },
  { to: "/permits", label: "Permits" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { member, logout } = useAuth();

  return (
    <>
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
              <button type="button" className="site-nav__cta site-nav__cta--ghost" onClick={logout}>
                Sign out
              </button>
            ) : (
              <NavLink to="/membership" className="site-nav__cta">
                Lounge login
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
              Elevating integrity through networking, education, and support.
            </p>
          </div>
          <div className="site-footer__links">
            <NavLink to="/members">Members</NavLink>
            <NavLink to="/membership">Lounge</NavLink>
            <NavLink to="/permits">Permits</NavLink>
          </div>
        </div>
      </footer>
    </>
  );
}
