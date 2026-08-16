import { Link } from "react-router-dom";
import { about, goals, vision } from "../data/content";
import "./Home.css";

const heroImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80";

export function Home() {
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
              <p className="eyebrow">Find a pro</p>
              <h2 id="ads-title">Public member directory</h2>
              <p className="ads-lede">
                Browse vetted ACAC members by trade. Member advertising opportunities will open as
                our roster grows — we will reach out to contractors interested in joining.
              </p>
            </div>
            <Link to="/members" className="btn btn--primary">
              View members
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
