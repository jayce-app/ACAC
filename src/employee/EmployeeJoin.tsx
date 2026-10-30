import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { company } from "../data/content";
import { useEmployeeAuth } from "./EmployeeAuth";
import type { EmployeeInvite } from "./types";

export function EmployeeJoin() {
  const { backendReady, employee, lookupInvite, acceptInvite } = useEmployeeAuth();
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() || "";

  const [invite, setInvite] = useState<EmployeeInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!token) {
        if (!cancelled) {
          setInvite(null);
          setLoading(false);
        }
        return;
      }
      const found = await lookupInvite(token);
      if (!cancelled) {
        setInvite(found);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, lookupInvite]);

  if (employee && done) return <Navigate to="/employee/console" replace />;
  if (employee && !done) return <Navigate to="/employee/console" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    const result = await acceptInvite(token, password);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setDone(true);
  }

  if (!backendReady || loading) {
    return <p className="emp-loading">Checking invite…</p>;
  }

  if (!token || !invite) {
    return (
      <section className="emp-card emp-card--narrow">
        <p className="eyebrow">TX Ropers Construction</p>
        <h1>Invite not found</h1>
        <p className="emp-lede">
          This invite link is missing, expired, or already used. Ask your admin for a new one.
        </p>
        <p className="emp-back">
          <Link to="/employee">← Employee sign-in</Link>
        </p>
      </section>
    );
  }

  if (done) {
    return (
      <section className="emp-card emp-card--narrow">
        <p className="eyebrow">TX Ropers Construction</p>
        <h1>You&apos;re set</h1>
        <p className="emp-lede">{message || "Account ready."}</p>
        <p className="emp-back">
          <Link to="/employee">Continue to sign-in →</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="emp-card emp-card--narrow">
      <p className="eyebrow">TX Ropers Construction</p>
      <h1>Join the crew</h1>
      <p className="emp-lede">
        Welcome, <strong>{invite.name}</strong>. Set a password for{" "}
        <strong>{invite.email}</strong> to open the employee console.
      </p>

      <form className="emp-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {message ? (
          <p className={/created|in\.|Welcome/i.test(message) ? "emp-flash" : "emp-error"}>
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="emp-back">
        <Link to="/">← Back to {company.name}</Link>
      </p>
    </section>
  );
}
