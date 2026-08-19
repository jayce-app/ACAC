import generated from "./educationGenerated.json";
import manual from "./educationManual.json";

export type EducationEvent = {
  id: string;
  title: string;
  organizer: string;
  tradeFocus: string;
  startDate: string;
  endDate?: string;
  location: string;
  format: "In person" | "Online" | "Hybrid";
  cost: string;
  summary: string;
  url: string;
  source?: string;
};

type ManualEvent = Omit<EducationEvent, "format"> & {
  format: EducationEvent["format"];
};

/** ISO timestamp from the last successful `npm run update:education` run. */
export const educationCalendarLastUpdated: string =
  typeof generated.lastUpdated === "string" ? generated.lastUpdated : "";

/**
 * Curated third-party opportunities — ACAC does not teach these courses.
 * Auto-updated DWC/TACCA listings are merged with manually curated hubs.
 */
export const educationEvents: EducationEvent[] = (() => {
  const auto = (generated.events ?? []) as EducationEvent[];
  const curated = (manual as ManualEvent[]).map((event) => ({
    ...event,
    source: event.source ?? "manual",
  }));
  const byId = new Map<string, EducationEvent>();
  for (const event of [...auto, ...curated]) {
    byId.set(event.id, event);
  }
  return [...byId.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
})();

export const educationResourceLinks = [
  {
    name: "Texas DWC OSHA safety training calendar",
    description: "Official low-cost OSHA 10/30 construction classes across Texas.",
    url: "https://www.tdi.texas.gov/wc/events/index.html",
  },
  {
    name: "PHCC of Texas class schedule",
    description: "Plumbing and HVAC continuing education and test prep statewide.",
    url: "https://phcc-tx.org/events/event_list.asp",
  },
  {
    name: "TACCA continuing education",
    description: "TDLR-approved HVAC/ACR CE courses and license prep.",
    url: "https://www.tacca.org/page/CE",
  },
  {
    name: "AGC Houston education",
    description: "Project management, supervision, lean, BIM, and Texas construction law courses.",
    url: "https://agchouston.org/education",
  },
  {
    name: "ABC Central Texas events",
    description: "Central Texas contractor training and superintendent academies.",
    url: "https://www.abccentraltexas.org/",
  },
  {
    name: "ABC Greater Houston schools & training",
    description: "Craft training and NCCER-aligned workforce pathways in the Houston area.",
    url: "https://www.abchouston.org/schools-training/",
  },
  {
    name: "Austin Community College — construction CE",
    description: "Continuing education pathways including plumbing/construction intro courses.",
    url: "https://continue.austincc.edu/",
  },
  {
    name: "Blinn College workforce & welding",
    description: "Nearby workforce training (Brenham / Sealy / RELLIS area), including welding.",
    url: "https://www.blinn.edu/workforce/index.html",
  },
];
