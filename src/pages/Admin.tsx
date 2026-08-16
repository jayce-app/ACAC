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
            Approve membership applications and review blacklist submissions before they appear in
            the Members Lounge.
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
              Blacklist submissions
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
                  <h2>Blacklist submissions</h2>
                  <p>
                    Approve only factual, good-faith reports. Reject rumor, insults, sensitive
                    personal data (SSNs, bank/medical info), or anything that looks retaliatory.
                    Approval means members may see it internally — it is not a legal judgment.
                  </p>
                </header>

                <h3 className="admin-subhead">Pending review</h3>
                <ul className="post-list">
                  {pendingBlacklist.length === 0 ? (
                    <li className="empty-note">No pending blacklist submissions.</li>
                  ) : (
                    pendingBlacklist.map((entry) => (
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
                            Approve for blacklist
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost-dark"
                            onClick={() => void rejectBlacklist(entry.id, member.name)}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                <h3 className="admin-subhead">Approved blacklist</h3>
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
                            Submitted by {entry.reportedBy}
                            {entry.reviewedBy ? ` · Approved by ${entry.reviewedBy}` : ""}
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
          </div>
        </div>
      </section>
    </div>
  );
}
