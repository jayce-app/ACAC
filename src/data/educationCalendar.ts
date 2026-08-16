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
};

/** Curated third-party opportunities — ACAC does not teach these courses. */
export const educationEvents: EducationEvent[] = [
  {
    id: "osha10-austin-aug",
    title: "OSHA 10-Hour Construction Class (English)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — all trades",
    startDate: "2026-08-06",
    endDate: "2026-08-07",
    location: "Austin, TX (Barbara Jordan Building)",
    format: "In person",
    cost: "Free (advanced registration required)",
    summary:
      "Two-day OSHA-authorized construction safety class for Texas residents and workers. Covers OSHA standards and hazard awareness for construction employers and employees.",
    url: "https://www.tdi.texas.gov/alert/event/2026/08/dwc0806.html",
  },
  {
    id: "osha10-austin-es-aug",
    title: "OSHA 10-Hour Construction Class (Spanish)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — all trades",
    startDate: "2026-08-11",
    endDate: "2026-08-12",
    location: "Austin, TX",
    format: "In person",
    cost: "Free / low-cost (registration required)",
    summary:
      "Spanish-language OSHA 10-Hour Construction training through DWC’s public safety calendar.",
    url: "https://www.tdi.texas.gov/wc/events/index.html",
  },
  {
    id: "osha30-satx-aug",
    title: "OSHA 30-Hour Construction Class (English)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — supervisors & leads",
    startDate: "2026-08-17",
    endDate: "2026-08-21",
    location: "San Antonio, TX",
    format: "In person",
    cost: "$30",
    summary:
      "Five-day OSHA 30-Hour Construction course for employers and employees covering construction safety essentials and hazard reduction.",
    url: "https://www.tdi.texas.gov/alert/event/2026/08/dwc0817.html",
  },
  {
    id: "phcc-plbg-ce-aug",
    title: "2026 Live Online Plumbing Continuing Education",
    organizer: "PHCC of Texas",
    tradeFocus: "Plumbing CE",
    startDate: "2026-08-18",
    endDate: "2026-08-20",
    location: "Live online (Texas)",
    format: "Online",
    cost: "See PHCC registration",
    summary:
      "Live online plumbing continuing education sessions for Texas plumbers. Check PHCC for textbook, Zoom requirements, and TSBPE credit details.",
    url: "https://phcc-tx.org/events/event_list.asp",
  },
  {
    id: "tacca-satx-ce",
    title: "TACCA HVAC Continuing Education (TDLR-approved)",
    organizer: "Texas Air Conditioning Contractors Association",
    tradeFocus: "HVAC / ACR",
    startDate: "2026-08-14",
    location: "San Antonio, TX",
    format: "In person",
    cost: "See TACCA registration",
    summary:
      "TDLR-approved 8-hour continuing education with laws and rules for Texas ACR licensees.",
    url: "https://www.tacca.org/page/CE",
  },
  {
    id: "osha10-austin-sep",
    title: "OSHA 10-Hour Construction Class (English)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — all trades",
    startDate: "2026-09-14",
    endDate: "2026-09-15",
    location: "Austin, TX",
    format: "In person",
    cost: "Free / low-cost (registration required)",
    summary:
      "Additional Austin OSHA 10-Hour Construction session on the DWC safety training calendar.",
    url: "https://www.tdi.texas.gov/wc/events/index.html",
  },
  {
    id: "abc-ctx-scheduling",
    title: "Superintendents Academy: Construction Planning & Scheduling",
    organizer: "ABC Central Texas",
    tradeFocus: "Field supervision / project scheduling",
    startDate: "2026-09-15",
    location: "Central Texas (ABC chapter)",
    format: "In person",
    cost: "$125 (ABC members; reservations required)",
    summary:
      "Critical-path planning and scheduling for commercial projects — developing schedules, identifying critical path, and monitoring progress.",
    url: "https://members.abccentraltexas.org/ap/Events/Register/aZFQj8lsvCqCZ",
  },
  {
    id: "osha30-houston-sep",
    title: "OSHA 30-Hour Construction Class (English)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — supervisors & leads",
    startDate: "2026-09-14",
    endDate: "2026-09-18",
    location: "Houston, TX",
    format: "In person",
    cost: "$30",
    summary:
      "Houston OSHA 30-Hour Construction course through Texas DWC. Advanced registration required.",
    url: "https://www.tdi.texas.gov/wc/safety/30hrconstrclas.html",
  },
  {
    id: "tacca-houston-ce",
    title: "TACCA HVAC Continuing Education (TDLR-approved)",
    organizer: "Texas Air Conditioning Contractors Association",
    tradeFocus: "HVAC / ACR",
    startDate: "2026-10-03",
    location: "Houston, TX",
    format: "In person",
    cost: "See TACCA registration",
    summary:
      "Houston TDLR-approved HVAC continuing education session listed on TACCA’s CE calendar.",
    url: "https://www.tacca.org/page/CE",
  },
  {
    id: "osha30-austin-oct",
    title: "OSHA 30-Hour Construction Class (English)",
    organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
    tradeFocus: "Jobsite safety — supervisors & leads",
    startDate: "2026-10-05",
    endDate: "2026-10-09",
    location: "Austin, TX",
    format: "In person",
    cost: "$30",
    summary:
      "Austin OSHA 30-Hour Construction course — useful for Austin County crews within driving distance.",
    url: "https://www.tdi.texas.gov/wc/safety/30hrconstrclas.html",
  },
];

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
