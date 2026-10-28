import type { Employee, Geofence, InternalDocument, TimeEntry } from "./types";

const EMPLOYEES_KEY = "txr-employees-v1";
const ENTRIES_KEY = "txr-time-entries-v1";
const DOCS_KEY = "txr-documents-v1";
const FENCES_KEY = "txr-geofences-v1";
const SESSION_KEY = "txr-employee-session-v1";

const seedEmployees: Employee[] = [
  {
    id: "local-admin",
    email: "admin@txropersconstruction.com",
    password: "ropers2026",
    name: "Jayce Johnson",
    phone: "979-353-1292",
    role: "admin",
    status: "active",
  },
  {
    id: "local-crew",
    email: "crew@txropersconstruction.com",
    password: "crew2026",
    name: "Crew Member",
    phone: "",
    role: "employee",
    status: "active",
  },
];

const seedDocuments: InternalDocument[] = [
  {
    id: "doc-welcome",
    kind: "announcement",
    title: "Welcome to the employee console",
    body: "Use this console to clock in and out, review your hours, and read company SOPs and announcements. Ask Jayce if you need an account reset.",
    published: true,
    authorId: "local-admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sop-safety",
    kind: "sop",
    title: "Jobsite safety basics",
    body: "Wear required PPE. Call before you dig. Report hazards to the lead immediately. No one clocks out until tools and materials are secured.",
    published: true,
    authorId: "local-admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadEmployees(): Employee[] {
  const list = readJson<Employee[]>(EMPLOYEES_KEY, []);
  if (!list.length) {
    writeJson(EMPLOYEES_KEY, seedEmployees);
    return seedEmployees;
  }
  return list;
}

export function saveEmployees(list: Employee[]) {
  writeJson(EMPLOYEES_KEY, list);
}

export function loadEntries(): TimeEntry[] {
  return readJson<TimeEntry[]>(ENTRIES_KEY, []);
}

export function saveEntries(list: TimeEntry[]) {
  writeJson(ENTRIES_KEY, list);
}

export function loadDocuments(): InternalDocument[] {
  const list = readJson<InternalDocument[]>(DOCS_KEY, []);
  if (!list.length) {
    writeJson(DOCS_KEY, seedDocuments);
    return seedDocuments;
  }
  return list;
}

export function saveDocuments(list: InternalDocument[]) {
  writeJson(DOCS_KEY, list);
}

const seedGeofences: Geofence[] = [
  {
    id: "fence-shop",
    name: "Bellville shop / yard",
    // Approximate — admin should refine with “Use my location” on site
    lat: 29.9508,
    lng: -96.2572,
    radiusM: 200,
    active: true,
    notifyEnter: true,
    notifyExit: true,
    createdBy: "local-admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadGeofences(): Geofence[] {
  const list = readJson<Geofence[] | null>(FENCES_KEY, null);
  if (list == null) {
    writeJson(FENCES_KEY, seedGeofences);
    return seedGeofences;
  }
  return list;
}

export function saveGeofences(list: Geofence[]) {
  writeJson(FENCES_KEY, list);
}

export function loadSessionEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionEmail(email: string | null) {
  if (!email) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, email);
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
