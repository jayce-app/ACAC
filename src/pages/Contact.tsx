import { useState, type FormEvent } from "react";
import { company } from "../data/content";
import "./Contact.css";

export function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="contact-page">
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Talk to the crew</p>
          <h1>Contact</h1>
          <p>
            Call {company.owner} or send a note about your build. We respond to projects across
            Austin County and nearby towns.
          </p>
        </div>
      </header>

      <section className="band band--contact" aria-labelledby="contact-details-title">
        <div className="band__inner contact-layout reveal">
          <div className="contact-details">
            <h2 id="contact-details-title">Direct lines</h2>
            <dl className="contact-dl">
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={company.phoneHref}>{company.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{company.owner}</dd>
              </div>
              <div>
                <dt>Shop</dt>
                <dd>
                  {company.address}
                  <br />
                  {company.city}
                </dd>
              </div>
              <div>
                <dt>Service area</dt>
                <dd>{company.serviceArea}</dd>
              </div>
            </dl>
          </div>

          <div className="contact-form-wrap">
            <h2>Project inquiry</h2>
            {sent ? (
              <p className="contact-success" role="status">
                Thanks — your message is ready to send. For the fastest reply, call{" "}
                <a href={company.phoneHref}>{company.phone}</a>.
              </p>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" autoComplete="tel" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label>
                  Project details
                  <textarea
                    name="details"
                    rows={5}
                    required
                    placeholder="Metal building, barndo, site work, timeline..."
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  Send inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
