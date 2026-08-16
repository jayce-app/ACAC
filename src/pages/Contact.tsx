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
          <p className="eyebrow">Request a quote</p>
          <h1>Contact</h1>
          <p>
            Call the office or fill out the form with your name, address, phone, email, and a quick
            description of what you are inquiring about.
          </p>
        </div>
      </header>

      <section className="band band--contact" aria-labelledby="contact-details-title">
        <div className="band__inner contact-layout reveal">
          <div className="contact-details">
            <h2 id="contact-details-title">Office</h2>
            <dl className="contact-dl">
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={company.phoneHref}>{company.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={company.emailHref}>{company.email}</a>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  {company.address}
                  <br />
                  {company.city}
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>
                  {company.hoursWeekday}
                  <br />
                  {company.hoursWeekend}
                </dd>
              </div>
              <div>
                <dt>Service area</dt>
                <dd>{company.serviceArea}</dd>
              </div>
            </dl>
          </div>

          <div className="contact-form-wrap">
            <h2>Quote request</h2>
            {sent ? (
              <p className="contact-success" role="status">
                Thanks — your quote request is ready. For the fastest reply, call the office at{" "}
                <a href={company.phoneHref}>{company.phone}</a> or email{" "}
                <a href={company.emailHref}>{company.email}</a>.
              </p>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label>
                  Address
                  <input name="address" type="text" autoComplete="street-address" required />
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
                  What are you inquiring about?
                  <textarea
                    name="details"
                    rows={5}
                    required
                    placeholder="Quick description of the project..."
                  />
                </label>
                <button type="submit" className="btn btn--primary">
                  Submit quote request
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
