import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { discussionBoards, type BlacklistPartyType } from "../data/content";
import { useMemberTools } from "../data/useMemberTools";
import "./Membership.css";

type MemberPanel = "discussions" | "bids" | "blacklist";

export function Membership() {
  const { member, login } = useAuth();
  const {
    bids,
    approvedBlacklist,
    blacklist,
    postsByBoard,
    addBid,
    submitBlacklist,
    addBoardPost,
  } = useMemberTools();
  const [panel, setPanel] = useState<MemberPanel>("bids");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState(discussionBoards[0].id);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [blacklistNotice, setBlacklistNotice] = useState<string | null>(null);
  const [blacklistAttest, setBlacklistAttest] = useState(false);

  const myPendingBlacklist = blacklist.filter(
    (e) =>
      e.status === "pending" &&
      member &&
      e.reportedBy === member.name &&
      e.reportedCompany === member.company,
  );

  const board = useMemo(
    () => discussionBoards.find((b) => b.id === activeBoard) ?? discussionBoards[0],
    [activeBoard],
  );

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const data = new FormData(e.currentTarget);
    const result = await login(String(data.get("email")), String(data.get("password")));
    if (result.ok) setMessage(result.message);
    else setError(result.message);
  }

  async function onBoardPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member || !newTitle.trim() || !newBody.trim()) return;
    await addBoardPost(activeBoard, {
      author: member.name,
      company: member.company,
      title: newTitle.trim(),
      body: newBody.trim(),
    });
    setNewTitle("");
    setNewBody("");
  }

  async function onBid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    const data = new FormData(e.currentTarget);
    await addBid({
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

  async function onBlacklist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    if (!blacklistAttest) {
      setBlacklistNotice("Confirm the attestation before submitting a report.");
      return;
    }
    const data = new FormData(e.currentTarget);
    await submitBlacklist({
      partyType: String(data.get("partyType")) as BlacklistPartyType,
      name: String(data.get("name")).trim(),
      company: String(data.get("company")).trim(),
      reason: String(data.get("reason")).trim(),
      reportedBy: member.name,
      reportedCompany: member.company,
    });
    e.currentTarget.reset();
    setBlacklistAttest(false);
    setBlacklistNotice(
      "Submission received. An admin must approve it before it appears on the shared blacklist.",
    );
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
              {member.trade ? ` · ${member.trade}` : ""}. Post jobs on the bid board, submit
              blacklist reports for admin review, and use the discussion boards below.
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
                      Members-only accountability reports. Submissions stay private to admins until
                      approved. This is not a public complaint board and is not a court finding.
                    </p>
                  </header>

                  <div className="legal-callout">
                    <p>
                      <strong>Defamation &amp; privacy risk:</strong> submit only firsthand facts you
                      believe are true. Do not include SSNs, bank numbers, medical details, or rumor.
                      False or malicious reports can create legal risk for you and for ACAC. See{" "}
                      <Link to="/terms">Terms</Link>.
                    </p>
                  </div>

                  {blacklistNotice ? (
                    <p className="form-alert" role="status">
                      {blacklistNotice}
                    </p>
                  ) : null}

                  <form className="post-form" onSubmit={(e) => void onBlacklist(e)}>
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
                      <span>Factual reason (dates, what happened, documentation if any)</span>
                      <textarea
                        name="reason"
                        required
                        rows={4}
                        maxLength={2000}
                        placeholder="Example: Invoice #1042 unpaid since March 12, 2026 after final walkthrough on job at [city]."
                      />
                    </label>
                    <label className="attest-check">
                      <input
                        type="checkbox"
                        checked={blacklistAttest}
                        onChange={(e) => setBlacklistAttest(e.target.checked)}
                        required
                      />
                      <span>
                        I attest this report is based on firsthand facts I believe are true, does not
                        include sensitive personal data, and is submitted in good faith for member
                        awareness — not to harass or defame.
                      </span>
                    </label>
                    <button type="submit" className="btn btn--primary">
                      Submit for admin review
                    </button>
                  </form>

                  {myPendingBlacklist.length > 0 ? (
                    <>
                      <h3 className="admin-subhead">Your pending submissions</h3>
                      <ul className="post-list">
                        {myPendingBlacklist.map((entry) => (
                          <li key={entry.id} className="post post--blacklist">
                            <div className="post__meta">
                              <span className="badge">{entry.partyType}</span>
                              <span className="badge badge--pending">awaiting admin</span>
                              <time dateTime={entry.date}>{entry.date}</time>
                            </div>
                            <h3>{entry.name}</h3>
                            {entry.company ? (
                              <p className="post__company">{entry.company}</p>
                            ) : null}
                            <p>{entry.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <h3 className="admin-subhead">Approved blacklist</h3>
                  <p className="boards__header" style={{ marginBottom: "0.75rem" }}>
                    Visible to approved members only. Treat as internal awareness — verify before
                    acting.
                  </p>
                  <ul className="post-list">
                    {approvedBlacklist.length === 0 ? (
                      <li className="empty-note">No approved blacklist entries yet.</li>
                    ) : (
                      approvedBlacklist.map((entry) => (
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
          <p className="eyebrow">Members</p>
          <h1>Member login</h1>
          <p>
            Sign in if you are an approved member. New contractors should submit a{" "}
            <Link to="/apply">member application</Link> first.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner auth-panel__inner--solo">
          {(message || error) && (
            <p className={error ? "form-alert form-alert--error" : "form-alert"} role="status">
              {error ?? message}
            </p>
          )}

          <form className="auth-form" onSubmit={(e) => void onLogin(e)}>
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
            <p className="auth-note">
              Need to join? <Link to="/apply">Start a member application</Link>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
