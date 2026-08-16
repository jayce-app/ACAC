import { Link } from "react-router-dom";
import {
  educationEvents,
  educationResourceLinks,
  type EducationEvent,
} from "../data/educationCalendar";
import "./Education.css";

function formatDateRange(event: EducationEvent) {
  const start = new Date(`${event.startDate}T12:00:00`);
  const end = event.endDate ? new Date(`${event.endDate}T12:00:00`) : null;
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (!end || event.endDate === event.startDate) {
    return start.toLocaleDateString("en-US", opts);
  }
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

function tradeCategory(tradeFocus: string): string {
  const t = tradeFocus.toLowerCase();
  if (t.includes("plumb")) return "plumbing";
  if (t.includes("hvac") || t.includes("acr")) return "hvac";
  if (t.includes("electr")) return "electrical";
  if (t.includes("safety") || t.includes("osha")) return "safety";
  return "general";
}

function categoryLabel(category: string): string {
  switch (category) {
    case "plumbing":
      return "Plumbing";
    case "hvac":
      return "HVAC";
    case "electrical":
      return "Electrical";
    case "safety":
      return "Safety";
    default:
      return "General";
  }
}

function EventCard({ event }: { event: EducationEvent }) {
  const category = tradeCategory(event.tradeFocus);

  return (
    <article className="edu-event">
      <div className="edu-event-date">
        <span className="edu-event-month">
          {new Date(`${event.startDate}T12:00:00`).toLocaleDateString("en-US", {
            month: "short",
          })}
        </span>
        <span className="edu-event-day">
          {new Date(`${event.startDate}T12:00:00`).getDate()}
        </span>
        {event.endDate && event.endDate !== event.startDate ? (
          <span className="edu-event-range">multi-day</span>
        ) : null}
      </div>
      <div className="edu-event-body">
        <div className="edu-event-meta">
          <span className={`edu-tag edu-tag-${category}`}>{categoryLabel(category)}</span>
          <span className="edu-provider">{event.organizer}</span>
        </div>
        <h2>{event.title}</h2>
        <p className="edu-when">{formatDateRange(event)}</p>
        <p className="edu-where">
          {event.location} · {event.format} · {event.cost}
        </p>
        <p>{event.summary}</p>
        <div className="edu-event-actions">
          <a href={event.url} target="_blank" rel="noreferrer">
            View details / register
          </a>
        </div>
      </div>
    </article>
  );
}

export function Education() {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...educationEvents]
    .filter((event) => (event.endDate ?? event.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="page education-page">
      <header className="edu-hero">
        <p className="eyebrow">Education calendar</p>
        <h1>Construction trade learning opportunities</h1>
        <p className="lede">
          ACAC does not teach courses directly. We curate and share seminars,
          CE classes, and safety training offered by established trade
          organizations, colleges, and state agencies so Austin County
          contractors can keep skills and licenses current.
        </p>
      </header>

      <section className="edu-disclaimer" aria-label="About this calendar">
        <p>
          Listings are third-party opportunities. Dates, fees, and seats change
          — always confirm on the provider&apos;s site before registering. ACAC
          does not sponsor, warranty, or guarantee these programs.
        </p>
      </section>

      <section className="edu-upcoming" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading">Upcoming sessions</h2>
        <p className="section-intro">
          Focused on Texas construction trades — OSHA/safety, plumbing CE,
          HVAC CE, and association scheduling. Check back as we add more
          local and regional options.
        </p>
        {sorted.length === 0 ? (
          <p className="section-intro">
            No dated sessions listed right now. Use the hubs below for current
            schedules, or suggest a class for us to add.
          </p>
        ) : (
          <div className="edu-event-list">
            {sorted.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="edu-hubs" aria-labelledby="hubs-heading">
        <h2 id="hubs-heading">Ongoing education hubs</h2>
        <p className="section-intro">
          These organizations regularly post new seminars and classes. Bookmark
          them for the latest schedules.
        </p>
        <ul className="edu-hub-list">
          {educationResourceLinks.map((hub) => (
            <li key={hub.name}>
              <a href={hub.url} target="_blank" rel="noreferrer">
                {hub.name}
              </a>
              <p>{hub.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="edu-suggest">
        <h2>Know a class we should list?</h2>
        <p>
          Members and partners can tip us off to trade seminars, apprentice
          programs, and CE courses that serve Austin County contractors.
        </p>
        <div className="cta-row">
          <a
            className="btn btn-primary"
            href="mailto:board@acac.local?subject=Education%20calendar%20suggestion"
          >
            Suggest an opportunity
          </a>
          <Link className="btn btn-ghost" to="/membership">
            Member lounge
          </Link>
        </div>
      </section>
    </div>
  );
}
