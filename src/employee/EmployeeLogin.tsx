import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { company } from "../data/content";
import { useEmployeeAuth } from "./EmployeeAuth";

export function EmployeeLogin() {
  const { backendReady, employee, login, usingCloud } = useEmployeeAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/employee/console";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!backendReady) return <p className="emp-loading">Loading employee console…</p>;
  if (employee) return <Navigate to={from} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) setMessage(result.message);
  }

  return (
    <section className="emp-card emp-card--narrow">
      <p className="eyebrow">TX Ropers Construction</p>
      <h1>Employee sign-in</h1>
      <p className="emp-lede">
        Clock in and out, review your hours, and read internal SOPs and announcements.
      </p>

      <form className="emp-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {message ? <p className="emp-error">{message}</p> : null}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {!usingCloud ? (
        <div className="emp-demo">
          <p>
            <strong>Local demo mode</strong> — Supabase is not configured yet. Use:
          </p>
          <ul>
            <li>
              Admin: <code>admin@txropersconstruction.com</code> / <code>ropers2026</code>
            </li>
            <li>
              Crew: <code>crew@txropersconstruction.com</code> / <code>crew2026</code>
            </li>
          </ul>
        </div>
      ) : null}

      <p className="emp-back">
        <Link to="/">← Back to {company.name}</Link>
      </p>
    </section>
  );
}
