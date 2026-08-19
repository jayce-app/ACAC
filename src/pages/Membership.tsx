import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { discussionBoards } from "../data/content";
import { useMemberTools } from "../data/useMemberTools";
import "./Membership.css";

type MemberPanel = "discussions" | "bids" | "forum";

export function Membership() {
  const { member, login } = useAuth();
  const {
    bids,
    liveForumPosts,
    postsByBoard,
    addBid,
    submitForumPost,
    addBoardPost,
  } = useMemberTools();
  const [panel, setPanel] = useState<MemberPanel>("bids");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState(discussionBoards[0].id);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [forumNotice, setForumNotice] = useState<string | null>(null);
  const [forumAttest, setForumAttest] = useState(false);

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

  async function onForumPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    if (!forumAttest) {
      setForumNotice("Confirm the attestation before posting.");
      return;
    }
    const data = new FormData(e.currentTarget);
    await submitForumPost({
      title: String(data.get("title")).trim(),
      body: String(data.get("body")).trim(),
    });
    e.currentTarget.reset();
    setForumAttest(false);
    setForumNotice("Posted anonymously. There are no replies or comments on this forum.");
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
              {member.trade ? ` · ${member.trade}` : ""}. Use the bid board, the anonymous member
              forum (post-only), and discussion boards below.
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
                  panel === "forum" ? "boards__nav-btn is-active" : "boards__nav-btn"
                }
                onClick={() => setPanel("forum")}
              >
                Anonymous forum
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

              {panel === "forum" && (
                <>
                  <header className="boards__header">
                    <h2>Anonymous member forum</h2>
                    <p>
                      An open, members-only forum. Posts are anonymous. There are no replies or
                      comments — you can post, and that is it.
                    </p>
                  </header>

                  <div className="legal-callout legal-callout--strong" role="note">
                    <p>
                      <strong>Disclaimer:</strong> ACAC does not bear any responsibility for what is
                      posted on this forum. Posts are the sole responsibility of the individual who
                      submits them. ACAC does not verify, endorse, warrant, or guarantee the accuracy
                      of any post. Use your own judgment and verify information independently before
                      acting.
                    </p>
                  </div>

                  <div className="legal-callout">
                    <p>
                      <strong>Posting rules:</strong> share only firsthand facts you believe are
                      true. Do not include SSNs, bank numbers, medical details, or rumor. False or
                      malicious posts can create legal risk for you. See{" "}
                      <Link to="/terms">Terms</Link>.
                    </p>
                  </div>

                  {forumNotice ? (
                    <p className="form-alert" role="status">
                      {forumNotice}
                    </p>
                  ) : null}

                  <form className="post-form" onSubmit={(e) => void onForumPost(e)}>
                    <label>
                      <span>Title</span>
                      <input name="title" required maxLength={120} />
                    </label>
                    <label>
                      <span>Post</span>
                      <textarea
                        name="body"
                        required
                        rows={5}
                        maxLength={2000}
                        placeholder="Write your notice for fellow members."
                      />
                    </label>
                    <label className="attest-check">
                      <input
                        type="checkbox"
                        checked={forumAttest}
                        onChange={(e) => setForumAttest(e.target.checked)}
                        required
                      />
                      <span>
                        I attest this post is based on firsthand facts I believe are true, does not
                        include sensitive personal data, and is submitted in good faith. I understand
                        my name will not appear, and ACAC is not responsible for this post.
                      </span>
                    </label>
                    <button type="submit" className="btn btn--primary">
                      Post anonymously
                    </button>
                  </form>

                  <h3 className="admin-subhead">Forum posts</h3>
                  <p className="forum-board-note">
                    Anonymous posts only — no replies, no comments, no names.
                  </p>
                  <ul className="post-list">
                    {liveForumPosts.length === 0 ? (
                      <li className="empty-note">No posts yet. Be the first to post.</li>
                    ) : (
                      liveForumPosts.map((entry) => (
                        <li key={entry.id} className="post post--forum">
                          <div className="post__meta">
                            <span className="badge">anonymous</span>
                            <time dateTime={entry.date}>{entry.date}</time>
                          </div>
                          <h3>{entry.title}</h3>
                          <p>{entry.body}</p>
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
