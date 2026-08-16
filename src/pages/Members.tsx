import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Members.css";

export function Members() {
  const { approvedMembers } = useAuth();

  return (
    <div className="members-page">
      <section className="members-hero">
        <div className="members-hero__inner">
          <p className="eyebrow">Public directory</p>
          <h1>Our members</h1>
          <p>
            Only professionals vetted through our system appear here. Hire with confidence — these
            are contractors who stand behind ethical practice in Austin County.
          </p>
        </div>
      </section>

      <section className="members-list">
        <div className="members-list__inner">
          {approvedMembers.length === 0 ? (
            <div className="members-empty">
              <h2>Member list coming soon</h2>
              <p>
                We are building our roster of vetted contractors. If you are a professional ready to
                be listed, apply for membership.
              </p>
              <Link to="/apply" className="btn btn--primary">
                Apply for membership
              </Link>
            </div>
          ) : (
            <ul className="member-directory">
              {approvedMembers.map((m) => (
                <li key={m.email} className="member-row">
                  <div>
                    <p className="member-row__trade">{m.trade}</p>
                    <h2>{m.company}</h2>
                    <p className="member-row__name">{m.name}</p>
                  </div>
                  {m.phone ? (
                    <a className="member-row__phone" href={`tel:${m.phone.replace(/\D/g, "")}`}>
                      {m.phone}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
