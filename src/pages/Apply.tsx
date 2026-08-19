import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  useAuth,
  type ApplicationInput,
  type ApplicationReference,
} from "../auth/AuthContext";
import { org } from "../data/org";
import { fileToCompressedDataUrl, photosAreUnique } from "../lib/workPhotos";
import "./Membership.css";
import "./Apply.css";

const REFERENCE_COUNT = 5;
const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

const emptyReference = (): ApplicationReference => ({
  name: "",
  company: "",
  phone: "",
  email: "",
});

export function Apply() {
  const { member, apply } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [references, setReferences] = useState<ApplicationReference[]>(() =>
    Array.from({ length: REFERENCE_COUNT }, emptyReference),
  );
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);

  if (member) {
    return <Navigate to="/membership" replace />;
  }

  function updateReference(
    index: number,
    field: keyof ApplicationReference,
    value: string,
  ) {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    );
  }

  async function onPhotosSelected(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setPhotoBusy(true);
    try {
      const incoming = Array.from(files).slice(0, MAX_PHOTOS);
      const compressed = await Promise.all(incoming.map((f) => fileToCompressedDataUrl(f)));
      const next = [...workPhotos, ...compressed].slice(0, MAX_PHOTOS);
      if (next.length < MIN_PHOTOS) {
        setWorkPhotos(next);
        setError(`Please upload at least ${MIN_PHOTOS} unique photos of your work.`);
        return;
      }
      if (!photosAreUnique(next)) {
        setError("Please upload unique photos — the same image cannot be used twice.");
        return;
      }
      setWorkPhotos(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read those photos.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto(index: number) {
    setWorkPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!agreeTerms) {
      setError("Please confirm you agree to the Terms and Privacy Policy.");
      return;
    }

    const cleanedRefs = references.map((ref) => ({
      name: ref.name.trim(),
      company: ref.company.trim(),
      phone: ref.phone.trim(),
      email: ref.email.trim().toLowerCase(),
    }));
    if (
      cleanedRefs.length !== REFERENCE_COUNT ||
      cleanedRefs.some((ref) => !ref.name || !ref.company || !ref.phone || !ref.email)
    ) {
      setError("Please complete all 5 references with name, company, phone, and email.");
      return;
    }
    if (workPhotos.length < MIN_PHOTOS) {
      setError(`Please upload at least ${MIN_PHOTOS} unique photos of your work.`);
      return;
    }
    if (!photosAreUnique(workPhotos)) {
      setError("Please upload unique photos — the same image cannot be used twice.");
      return;
    }

    const data = new FormData(e.currentTarget);
    const payload: ApplicationInput = {
      name: String(data.get("name")).trim(),
      company: String(data.get("company")).trim(),
      trade: String(data.get("trade")).trim(),
      phone: String(data.get("phone")).trim(),
      email: String(data.get("email")).trim(),
      password: String(data.get("password")),
      yearsInBusiness: String(data.get("yearsInBusiness")).trim(),
      serviceArea: String(data.get("serviceArea")).trim(),
      website: String(data.get("website")).trim(),
      insuranceNotes: String(data.get("insuranceNotes")).trim(),
      licenseNotes: String(data.get("licenseNotes")).trim(),
      aboutWork: String(data.get("aboutWork")).trim(),
      references: cleanedRefs,
      workPhotos,
    };
    const result = await apply(payload);
    if (result.ok) {
      setMessage(result.message);
      setSubmitted(true);
      e.currentTarget.reset();
      setAgreeTerms(false);
      setReferences(Array.from({ length: REFERENCE_COUNT }, emptyReference));
      setWorkPhotos([]);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="apply-page">
      <section className="auth-hero">
        <div className="auth-hero__inner">
          <p className="eyebrow">Membership</p>
          <h1>Member application</h1>
          <p>
            Apply to join {org.dbaName}. Members get access to the members lounge, peer best-practice
            sharing, and our curated education calendar. Applications are vetted before lounge
            access and before you appear in the public member directory.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner auth-panel__inner--apply">
          {submitted ? (
            <div className="apply-success">
              <h2>Application received</h2>
              <p>{message}</p>
              <p>
                When approved, sign in from the{" "}
                <Link to="/membership">member login</Link> page.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => setSubmitted(false)}>
                Submit another application
              </button>
            </div>
          ) : (
            <>
              {(message || error) && (
                <p className={error ? "form-alert form-alert--error" : "form-alert"} role="status">
                  {error ?? message}
                </p>
              )}

              <form className="auth-form apply-form" onSubmit={(e) => void onSubmit(e)}>
                <h2 className="apply-section-title">Contact &amp; company</h2>
                <div className="auth-form__grid">
                  <label>
                    <span>Full name</span>
                    <input name="name" required maxLength={120} autoComplete="name" />
                  </label>
                  <label>
                    <span>Company name</span>
                    <input name="company" required maxLength={160} autoComplete="organization" />
                  </label>
                  <label>
                    <span>Primary trade / specialty</span>
                    <input
                      name="trade"
                      required
                      maxLength={120}
                      placeholder="e.g. Electrical, Framing, Concrete"
                    />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input name="phone" type="tel" required maxLength={40} autoComplete="tel" />
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

                <h2 className="apply-section-title">Business details</h2>
                <div className="auth-form__grid">
                  <label>
                    <span>Years in business</span>
                    <input name="yearsInBusiness" required maxLength={40} placeholder="e.g. 8" />
                  </label>
                  <label>
                    <span>Service area</span>
                    <input
                      name="serviceArea"
                      required
                      maxLength={160}
                      placeholder="e.g. Sealy, Bellville, Wallis, Austin County"
                    />
                  </label>
                  <label className="auth-form__full">
                    <span>Website (optional)</span>
                    <input name="website" type="url" maxLength={200} placeholder="https://" />
                  </label>
                  <label className="auth-form__full">
                    <span>Insurance notes (optional)</span>
                    <input
                      name="insuranceNotes"
                      maxLength={240}
                      placeholder="Carrier / general liability notes"
                    />
                  </label>
                  <label className="auth-form__full">
                    <span>License / registration notes (optional)</span>
                    <input
                      name="licenseNotes"
                      maxLength={240}
                      placeholder="Trade licenses, city registrations, etc."
                    />
                  </label>
                </div>

                <label>
                  <span>Tell us about your work and why you want to join</span>
                  <textarea
                    name="aboutWork"
                    required
                    rows={5}
                    maxLength={2000}
                    placeholder="Specialties, typical projects, and how you support ethical practice in Austin County."
                  />
                </label>

                <h2 className="apply-section-title">Professional references</h2>
                <p className="apply-section-note">
                  List 5 references with contact information — customers, suppliers, or trade peers
                  who can speak to your work.
                </p>
                <div className="apply-references">
                  {references.map((ref, index) => (
                    <fieldset key={index} className="apply-reference">
                      <legend>Reference {index + 1}</legend>
                      <div className="auth-form__grid">
                        <label>
                          <span>Full name</span>
                          <input
                            required
                            maxLength={120}
                            value={ref.name}
                            onChange={(e) => updateReference(index, "name", e.target.value)}
                            autoComplete="off"
                          />
                        </label>
                        <label>
                          <span>Company / relationship</span>
                          <input
                            required
                            maxLength={160}
                            value={ref.company}
                            onChange={(e) => updateReference(index, "company", e.target.value)}
                            placeholder="Company or how you know them"
                            autoComplete="off"
                          />
                        </label>
                        <label>
                          <span>Phone</span>
                          <input
                            type="tel"
                            required
                            maxLength={40}
                            value={ref.phone}
                            onChange={(e) => updateReference(index, "phone", e.target.value)}
                            autoComplete="off"
                          />
                        </label>
                        <label>
                          <span>Email</span>
                          <input
                            type="email"
                            required
                            maxLength={160}
                            value={ref.email}
                            onChange={(e) => updateReference(index, "email", e.target.value)}
                            autoComplete="off"
                          />
                        </label>
                      </div>
                    </fieldset>
                  ))}
                </div>

                <h2 className="apply-section-title">Photos of your work</h2>
                <p className="apply-section-note">
                  Upload at least 2 unique photos of completed work (up to {MAX_PHOTOS}). Photos are
                  reviewed with your application and are not shown on the public directory.
                </p>
                <div className="apply-photos">
                  <label className="apply-photos__picker">
                    <span>{photoBusy ? "Processing photos…" : "Choose photos"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={photoBusy || workPhotos.length >= MAX_PHOTOS}
                      onChange={(e) => {
                        void onPhotosSelected(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="apply-photos__count">
                    {workPhotos.length} of {MIN_PHOTOS}+ selected
                    {workPhotos.length < MIN_PHOTOS ? " (minimum not met yet)" : ""}
                  </p>
                  {workPhotos.length > 0 ? (
                    <ul className="apply-photos__grid">
                      {workPhotos.map((src, index) => (
                        <li key={`${index}-${src.slice(-24)}`}>
                          <img src={src} alt={`Work sample ${index + 1}`} />
                          <button type="button" onClick={() => removePhoto(index)}>
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <label className="attest-check">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    I confirm this information is accurate and I agree to the{" "}
                    <Link to="/terms">Terms of Use</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </label>

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={photoBusy}
                >
                  Submit member application
                </button>
                <p className="auth-note">
                  Already applied or approved?{" "}
                  <Link to="/membership">Go to member login</Link>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
