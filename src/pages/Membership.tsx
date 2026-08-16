import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { discussionBoards, type BlacklistPartyType } from "../data/content";
import { useMemberTools } from "../data/useMemberTools";
import "./Membership.css";

type Tab = "login" | "apply";
type MemberPanel = "discussions" | "bids" | "blacklist" | "approvals";

export function Membership() {
  const { member, login, apply, pendingMembers, approve } = useAuth();
  const { bids, blacklist, postsByBoard, addBid, addBlacklist, addBoardPost } = useMemberTools();
  const [tab, setTab] = useState<Tab>("login");
  const [panel, setPanel] = useState<MemberPanel>("bids");
  const isBoard = member?.email.toLowerCase() === "board@acac.local";
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState(discussionBoards[0].id);
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

  function onBoardPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member || !newTitle.trim() || !newBody.trim()) return;
    addBoardPost(activeBoard, {
      author: member.name,
      company: member.company,
      title: newTitle.trim(),
      body: newBody.trim(),
    });
    setNewTitle("");
    setNewBody("");
  }

  function onBid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    const data = new FormData(e.currentTarget);
    addBid({
      title: String(data.get("title")).trim(),
      tradeNeeded: String(data.get("tradeNeeded")).trim(),
      location: String(data.get("location")).trim(),
      details: String(data.get("details")).trim(),
      contact: String(data.get("contact")).trim(),
      author: member.name,
      company: member.company,
    });
    e.currentTarget.reset();
  }

  function onBlacklist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    const data = new FormData(e.currentTarget);
    addBlacklist({
      partyType: String(data.get("partyType")) as BlacklistPartyType,
      name: String(data.get("name")).trim(),
      company: String(data.get("company")).trim(),
      reason: String(data.get("reason")).trim(),
      reportedBy: member.name,
      reportedCompany: member.company,
    });
    e.currentTarget.reset();
  }

  if (member) {
    return (
      <div className="membership membership--member">
        <section className="member-hero">
          <div className="member-hero__inner">
            <p className="eyebrow">Members Lounge</p>
            <h1>Welcome, {member.name}</h1>
            <p>
              {member.company}
              {member.trade ? ` · ${member.trade}` : ""}. Post jobs on the bid board, add
              blacklist entries, and use the discussion boards below.
            </p>
          </div>
        </section>

        <section className="boards">
          <div className="boards__inner boards__inner--tools">
            <aside className="boards__nav" aria-label="Members Lounge">
              <button
                type="button"
                className={panel === "bids" ? "boards__nav-btn is-active" : "boards__nav-btn"}
                onClick={() => setPanel("bids")}
              >
                Bid board
              </button>
              <button
                type="button"
                className={
                  panel === "blacklist" ? "boards__nav-btn is-active" : "boards__nav-btn"
                }
                onClick={() => setPanel("blacklist")}
              >
                Blacklist
              </button>
              <button
                type="button"
                className={
                  panel === "discussions" ? "boards__nav-btn is-active" : "boards__nav-btn"
                }
                onClick={() => setPanel("discussions")}
              >
                Discussion boards
              </button>
              {isBoard ? (
                <button
                  type="button"
                  className={
                    panel === "approvals" ? "boards__nav-btn is-active" : "boards__nav-btn"
                  }
                  onClick={() => setPanel("approvals")}
                >
                  Approve applications
                  {pendingMembers.length > 0 ? ` (${pendingMembers.length})` : ""}
                </button>
              ) : null}
            </aside>

            <div className="boards__panel">
              {panel === "bids" && (
                <>
                  <header className="boards__header">
                    <h2>Bid board</h2>
                    <p>
                      Post jobs for fellow members to bid on — trade needed, location, and how to
                      reach you.
                    </p>
                  </header>

                  <form className="post-form" onSubmit={onBid}>
                    <div className="auth-form__grid">
                      <label>
                        <span>Job title</span>
                        <input name="title" required maxLength={120} />
                      </label>
                      <label>
                        <span>Trade needed</span>
                        <input name="tradeNeeded" required maxLength={80} placeholder="e.g. Electrical" />
                      </label>
                      <label>
                        <span>Location</span>
                        <input name="location" required maxLength={120} placeholder="e.g. Sealy, TX" />
                      </label>
                      <label>
                        <span>Contact for bids</span>
                        <input name="contact" required maxLength={120} placeholder="Phone or email" />
                      </label>
                    </div>
                    <label>
                      <span>Job details</span>
                      <textarea name="details" required rows={4} maxLength={2000} />
                    </label>
                    <button type="submit" className="btn btn--primary">
                      Post job
                    </button>
                  </form>

                  <ul className="post-list">
                    {bids.length === 0 ? (
                      <li className="empty-note">No jobs posted yet. Be the first to add one.</li>
                    ) : (
                      bids.map((bid) => (
                        <li key={bid.id} className="post">
                          <div className="post__meta">
                            <strong>{bid.author}</strong>
                            <span>{bid.company}</span>
                            <time dateTime={bid.date}>{bid.date}</time>
                          </div>
                          <h3>{bid.title}</h3>
                          <p className="post__tags">
                            <span>{bid.tradeNeeded}</span>
                            <span>{bid.location}</span>
                          </p>
                          <p>{bid.details}</p>
                          <p className="post__contact">Contact: {bid.contact}</p>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}

              {panel === "blacklist" && (
                <>
                  <header className="boards__header">
                    <h2>Blacklist</h2>
                    <p>
                      Add customers or contractors with a clear reason. Facts only — this list is
                      for member awareness and accountability.
                    </p>
                  </header>

                  <form className="post-form" onSubmit={onBlacklist}>
                    <div className="auth-form__grid">
                      <label>
                        <span>Type</span>
                        <select name="partyType" required defaultValue="customer">
                          <option value="customer">Customer</option>
                          <option value="contractor">Contractor</option>
                        </select>
                      </label>
                      <label>
                        <span>Name</span>
                        <input name="name" required maxLength={120} />
                      </label>
                      <label className="auth-form__full">
                        <span>Company (if any)</span>
                        <input name="company" maxLength={120} />
                      </label>
                    </div>
                    <label>
                      <span>Why they are on the blacklist</span>
                      <textarea name="reason" required rows={4} maxLength={2000} />
                    </label>
                    <button type="submit" className="btn btn--primary">
                      Add to blacklist
                    </button>
                  </form>

                  <ul className="post-list">
                    {blacklist.length === 0 ? (
                      <li className="empty-note">No blacklist entries yet.</li>
                    ) : (
                      blacklist.map((entry) => (
                        <li key={entry.id} className="post post--blacklist">
                          <div className="post__meta">
                            <span className="badge">{entry.partyType}</span>
                            <time dateTime={entry.date}>{entry.date}</time>
                            <span>
                              Reported by {entry.reportedBy}
                              {entry.reportedCompany ? ` · ${entry.reportedCompany}` : ""}
                            </span>
                          </div>
                          <h3>{entry.name}</h3>
                          {entry.company ? <p className="post__company">{entry.company}</p> : null}
                          <p>{entry.reason}</p>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}

              {panel === "approvals" && isBoard && (
                <>
                  <header className="boards__header">
                    <h2>Approve applications</h2>
                    <p>
                      Vet applicants, then approve them. Approved members can log in and appear on
                      the public Members page.
                    </p>
                  </header>
                  <ul className="post-list">
                    {pendingMembers.length === 0 ? (
                      <li className="empty-note">No pending applications.</li>
                    ) : (
                      pendingMembers.map((app) => (
                        <li key={app.email} className="post">
                          <h3>{app.company}</h3>
                          <p>
                            {app.name} · {app.trade}
                            {app.phone ? ` · ${app.phone}` : ""}
                          </p>
                          <p>{app.email}</p>
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => approve(app.email)}
                          >
                            Approve member
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}

              {panel === "discussions" && (
                <>
                  <div className="discussion-subnav" role="tablist" aria-label="Discussion boards">
                    {discussionBoards.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={
                          b.id === activeBoard
                            ? "discussion-subnav__btn is-active"
                            : "discussion-subnav__btn"
                        }
                        onClick={() => setActiveBoard(b.id)}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>

                  <header className="boards__header">
                    <h2>{board.name}</h2>
                    <p>{board.description}</p>
                  </header>

                  <form className="post-form" onSubmit={onBoardPost}>
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
                    {(postsByBoard[activeBoard] ?? []).length === 0 ? (
                      <li className="empty-note">No posts yet on this board.</li>
                    ) : (
                      (postsByBoard[activeBoard] ?? []).map((post) => (
                        <li key={post.id} className="post">
                          <div className="post__meta">
                            <strong>{post.author}</strong>
                            <span>{post.company}</span>
                            <time dateTime={post.date}>{post.date}</time>
                          </div>
                          <h3>{post.title}</h3>
                          <p>{post.body}</p>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
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
          <h1>Enter the Members Lounge</h1>
          <p>
            Apply to become a member, or sign in to the lounge for the bid board, blacklist, and
            discussion boards reserved for approved professionals.
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
                Board login: <code>board@acac.local</code> / <code>integrity</code>
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
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <p className="auth-note">
                Applications are reviewed through our vetting system. Approved members appear in the
                public member directory.
              </p>
              <button type="submit" className="btn btn--primary">
                Submit application
              </button>
            </form>
          )}

          <aside className="locked-preview" aria-label="Members Lounge preview">
            <h2>Inside the Members Lounge</h2>
            <ul>
              <li>
                <strong>Bid board</strong>
                <span>Post jobs and invite fellow members to bid.</span>
              </li>
              <li>
                <strong>Blacklist</strong>
                <span>Add customers or contractors and document why.</span>
              </li>
              <li>
                <strong>Discussion boards</strong>
                <span>Networking, best practices, and specialty showcase.</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
