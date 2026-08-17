import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMemberTools } from "../data/useMemberTools";
import "./Membership.css";
import "./Admin.css";

type AdminPanel = "applications" | "blacklist";

export function Admin() {
  const { member, isAdmin, pendingMembers, approve, reject } = useAuth();
  const {
    pendingBlacklist,
    approvedBlacklist,
    approveBlacklist,
    rejectBlacklist,
  } = useMemberTools();
  const [panel, setPanel] = useState<AdminPanel>("applications");

  if (!member) {
    return <Navigate to="/membership" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/membership" replace />;
  }

  return (
    <div className="membership membership--member admin-page">
      <section className="member-hero">
        <div className="member-hero__inner">
          <p className="eyebrow">Admin console</p>
          <h1>Association admin</h1>
          <p>
            Approve membership applications and moderate the anonymous blacklist board.
          </p>
        </div>
      </section>

      <section className="boards">
        <div className="boards__inner boards__inner--tools">
          <aside className="boards__nav" aria-label="Admin console">
            <button
              type="button"
              className={panel === "applications" ? "boards__nav-btn is-active" : "boards__nav-btn"}
              onClick={() => setPanel("applications")}
            >
              Approve applications
              {pendingMembers.length > 0 ? ` (${pendingMembers.length})` : ""}
            </button>
            <button
              type="button"
              className={panel === "blacklist" ? "boards__nav-btn is-active" : "boards__nav-btn"}
              onClick={() => setPanel("blacklist")}
            >
              Blacklist board
              {pendingBlacklist.length > 0 ? ` (${pendingBlacklist.length})` : ""}
            </button>
          </aside>

          <div className="boards__panel">
            {panel === "applications" && (
              <>
                <header className="boards__header">
                  <h2>Approve applications</h2>
                  <p>
                    Vet applicants, then approve or decline. Approved members can log in and appear
                    on the public Members page.
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
                        {app.yearsInBusiness || app.serviceArea ? (
                          <p>
                            {app.yearsInBusiness ? `${app.yearsInBusiness} years in business` : ""}
                            {app.yearsInBusiness && app.serviceArea ? " · " : ""}
                            {app.serviceArea ? `Service area: ${app.serviceArea}` : ""}
                          </p>
                        ) : null}
                        {app.website ? <p>Website: {app.website}</p> : null}
                        {app.insuranceNotes ? <p>Insurance: {app.insuranceNotes}</p> : null}
                        {app.licenseNotes ? <p>Licenses: {app.licenseNotes}</p> : null}
                        {app.aboutWork ? <p>{app.aboutWork}</p> : null}
                        {app.references && app.references.length > 0 ? (
                          <div className="admin-refs">
                            <h4>References</h4>
                            <ol>
                              {app.references.map((ref, i) => (
                                <li key={`${ref.email}-${i}`}>
                                  <strong>{ref.name}</strong>
                                  {ref.company ? ` · ${ref.company}` : ""}
                                  <br />
                                  {ref.phone}
                                  {ref.email ? ` · ${ref.email}` : ""}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : null}
                        {app.workPhotos && app.workPhotos.length > 0 ? (
                          <div className="admin-photos">
                            <h4>Work photos ({app.workPhotos.length})</h4>
                            <ul className="admin-photos__grid">
                              {app.workPhotos.map((src, i) => (
                                <li key={`${i}-${src.slice(-20)}`}>
                                  <a href={src} target="_blank" rel="noreferrer">
                                    <img src={src} alt={`Applicant work sample ${i + 1}`} />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => void approve(app.email)}
                          >
                            Approve member
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost-dark"
                            onClick={() => void reject(app.email)}
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}

            {panel === "blacklist" && (
              <>
                <header className="boards__header">
                  <h2>Anonymous blacklist board</h2>
                  <p>
                    Members post anonymously with no replies or comments. ACAC does not bear
                    responsibility for post content. Use remove for abuse, sensitive data, or clear
                    misuse. Submitter identity is for moderation only — it is never shown on the
                    member board.
                  </p>
                </header>

                {pendingBlacklist.length > 0 ? (
                  <>
                    <h3 className="admin-subhead">Legacy pending items</h3>
                    <ul className="post-list">
                      {pendingBlacklist.map((entry) => (
                        <li key={entry.id} className="post post--blacklist">
                          <div className="post__meta">
                            <span className="badge">{entry.partyType}</span>
                            <span className="badge badge--pending">pending</span>
                            <time dateTime={entry.date}>{entry.date}</time>
                            <span>
                              Submitted by {entry.reportedBy}
                              {entry.reportedCompany ? ` · ${entry.reportedCompany}` : ""}
                            </span>
                          </div>
                          <h3>{entry.name}</h3>
                          {entry.company ? <p className="post__company">{entry.company}</p> : null}
                          <p>{entry.reason}</p>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="btn btn--primary"
                              onClick={() => void approveBlacklist(entry.id, member.name)}
                            >
                              Publish to board
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost-dark"
                              onClick={() => void rejectBlacklist(entry.id, member.name)}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <h3 className="admin-subhead">Live board posts</h3>
                <ul className="post-list">
                  {approvedBlacklist.length === 0 ? (
                    <li className="empty-note">No live blacklist posts yet.</li>
                  ) : (
                    approvedBlacklist.map((entry) => (
                      <li key={entry.id} className="post post--blacklist">
                        <div className="post__meta">
                          <span className="badge">{entry.partyType}</span>
                          <span className="badge">anonymous on board</span>
                          <time dateTime={entry.date}>{entry.date}</time>
                          <span>
                            Moderator view — {entry.reportedBy}
                            {entry.reportedCompany ? ` · ${entry.reportedCompany}` : ""}
                          </span>
                        </div>
                        <h3>{entry.name}</h3>
                        {entry.company ? <p className="post__company">{entry.company}</p> : null}
                        <p>{entry.reason}</p>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="btn btn--ghost-dark"
                            onClick={() => void rejectBlacklist(entry.id, member.name)}
                          >
                            Remove from board
                          </button>
                        </div>
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
