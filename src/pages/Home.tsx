import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { about, goals, vision } from "../data/content";
import "./Home.css";

const heroImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80";

export function Home() {
  const { approvedMembers } = useAuth();

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero__media" aria-hidden="true">
          <img src={heroImage} alt="" className="hero__img" />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p id="hero-brand" className="hero__brand">
            Austin County Association of Contractors
          </p>
          <h1 className="hero__headline">Integrity built into every job.</h1>
          <p className="hero__lede">
            A vetted hub for contractors and community — networking, education, and ethical
            practice across Austin County.
          </p>
          <div className="hero__actions">
            <Link to="/membership" className="btn btn--primary">
              Apply for membership
            </Link>
            <Link to="/members" className="btn btn--ghost">
              View members
            </Link>
          </div>
        </div>
      </section>

      <section className="band band--vision" aria-labelledby="vision-title">
        <div className="band__inner reveal">
          <p className="eyebrow">Our commitment</p>
          <h2 id="vision-title">{vision.title}</h2>
          <p className="lead">{vision.text}</p>
        </div>
      </section>

      <section className="band band--about" aria-labelledby="about-title">
        <div className="band__inner band__split reveal">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 id="about-title">{about.title}</h2>
          </div>
          <div className="about-copy">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--goals" aria-labelledby="goals-title">
        <div className="band__inner reveal">
          <p className="eyebrow">What we work toward</p>
          <h2 id="goals-title">Goals</h2>
          <ol className="goal-list">
            {goals.map((goal, i) => (
              <li key={goal.title} className="goal-item">
                <span className="goal-item__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{goal.title}</h3>
                  <p>{goal.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--ads" aria-labelledby="ads-title">
        <div className="band__inner reveal">
          <div className="ads-head">
            <div>
              <p className="eyebrow">Public directory</p>
              <h2 id="ads-title">Our members</h2>
              <p className="ads-lede">
                Only vetted ACAC professionals appear on this list. As members are approved, they
                will show here for the community to find.
              </p>
            </div>
            <Link to="/members" className="btn btn--primary">
              Full member list
            </Link>
          </div>

          {approvedMembers.length === 0 ? (
            <p className="ads-empty">
              No members listed yet. Contractors who pass our vetting will appear here.
            </p>
          ) : (
            <ul className="ad-grid home-member-list">
              {approvedMembers.map((m) => (
                <li key={m.email} className="ad-tile">
                  <p className="ad-tile__trade">{m.trade}</p>
                  <h3>{m.company}</h3>
                  <p className="ad-tile__owner">{m.name}</p>
                  {m.phone ? (
                    <a className="ad-tile__phone" href={`tel:${m.phone.replace(/\D/g, "")}`}>
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
