import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { discussionBoards, type BoardPost } from "../data/content";
import "./Membership.css";

type Tab = "login" | "apply";

export function Membership() {
  const { member, login, apply } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState(discussionBoards[0].id);
  const [postsByBoard, setPostsByBoard] = useState<Record<string, BoardPost[]>>(() =>
    Object.fromEntries(discussionBoards.map((b) => [b.id, b.posts])),
  );
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const board = useMemo(
    () => discussionBoards.find((b) => b.id === activeBoard) ?? discussionBoards[0],
    [activeBoard],
  );

  function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const data = new FormData(e.currentTarget);
    const result = login(String(data.get("email")), String(data.get("password")));
    if (result.ok) setMessage(result.message);
    else setError(result.message);
  }

  function onApply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const data = new FormData(e.currentTarget);
    const result = apply({
      email: String(data.get("email")),
      password: String(data.get("password")),
      name: String(data.get("name")),
      company: String(data.get("company")),
      trade: String(data.get("trade")),
      phone: String(data.get("phone")),
    });
    if (result.ok) {
      setMessage(result.message);
      setTab("login");
      e.currentTarget.reset();
    } else {
      setError(result.message);
    }
  }

  function onPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member || !newTitle.trim() || !newBody.trim()) return;
    const post: BoardPost = {
      id: `${activeBoard}-${Date.now()}`,
      author: member.name,
      company: member.company,
      title: newTitle.trim(),
      body: newBody.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setPostsByBoard((prev) => ({
      ...prev,
      [activeBoard]: [post, ...(prev[activeBoard] ?? [])],
    }));
    setNewTitle("");
    setNewBody("");
  }

  if (member) {
    return (
      <div className="membership membership--member">
        <section className="member-hero">
          <div className="member-hero__inner">
            <p className="eyebrow">Members only</p>
            <h1>Welcome, {member.name}</h1>
            <p>
              {member.company} · {member.trade}. Discussion boards below are reserved for vetted
              members.
            </p>
          </div>
        </section>

        <section className="boards">
          <div className="boards__inner">
            <aside className="boards__nav" aria-label="Discussion boards">
              {discussionBoards.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={
                    b.id === activeBoard ? "boards__nav-btn is-active" : "boards__nav-btn"
                  }
                  onClick={() => setActiveBoard(b.id)}
                >
                  {b.name}
                </button>
              ))}
            </aside>

            <div className="boards__panel">
              <header className="boards__header">
                <h2>{board.name}</h2>
                <p>{board.description}</p>
              </header>

              <form className="post-form" onSubmit={onPost}>
                <label>
                  <span>Title</span>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  <span>Post</span>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    required
                    rows={4}
                    maxLength={2000}
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  Publish to board
                </button>
              </form>

              <ul className="post-list">
                {(postsByBoard[activeBoard] ?? []).map((post) => (
                  <li key={post.id} className="post">
                    <div className="post__meta">
                      <strong>{post.author}</strong>
                      <span>{post.company}</span>
                      <time dateTime={post.date}>{post.date}</time>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="membership">
      <section className="auth-hero">
        <div className="auth-hero__inner">
          <p className="eyebrow">Membership</p>
          <h1>Join the vetted network</h1>
          <p>
            Apply to become a member, or sign in to access discussion boards, accountability
            tools, and specialty showcases reserved for approved professionals.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="auth-tabs" role="tablist" aria-label="Membership forms">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "login"}
              className={tab === "login" ? "is-active" : undefined}
              onClick={() => {
                setTab("login");
                setError(null);
                setMessage(null);
              }}
            >
              Member login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "apply"}
              className={tab === "apply" ? "is-active" : undefined}
              onClick={() => {
                setTab("apply");
                setError(null);
                setMessage(null);
              }}
            >
              Application
            </button>
          </div>

          {(message || error) && (
            <p className={error ? "form-alert form-alert--error" : "form-alert"} role="status">
              {error ?? message}
            </p>
          )}

          {tab === "login" ? (
            <form className="auth-form" onSubmit={onLogin}>
              <label>
                <span>Email</span>
                <input name="email" type="email" required autoComplete="username" />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" required autoComplete="current-password" />
              </label>
              <button type="submit" className="btn btn--primary">
                Sign in
              </button>
              <p className="auth-hint">
                Demo member: <code>member@acac.local</code> / <code>integrity</code>
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={onApply}>
              <div className="auth-form__grid">
                <label>
                  <span>Full name</span>
                  <input name="name" required />
                </label>
                <label>
                  <span>Company</span>
                  <input name="company" required />
                </label>
                <label>
                  <span>Primary trade / specialty</span>
                  <input name="trade" required />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" type="tel" required />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <label>
                  <span>Create password</span>
                  <input name="password" type="password" required minLength={6} autoComplete="new-password" />
                </label>
              </div>
              <p className="auth-note">
                Applications are reviewed through our vetting system. Membership is reserved for
                professionals who demonstrate responsibility and ethical practice.
              </p>
              <button type="submit" className="btn btn--primary">
                Submit application
              </button>
            </form>
          )}

          <aside className="locked-preview" aria-label="Members-only preview">
            <h2>Behind the login</h2>
            <ul>
              {discussionBoards.map((b) => (
                <li key={b.id}>
                  <strong>{b.name}</strong>
                  <span>{b.description}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
