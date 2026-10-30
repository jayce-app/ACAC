import type { Employee, EmployeeInvite, Geofence, InternalDocument, TimeEntry } from "./types";

const EMPLOYEES_KEY = "txr-employees-v1";
const ENTRIES_KEY = "txr-time-entries-v1";
const DOCS_KEY = "txr-documents-v1";
const FENCES_KEY = "txr-geofences-v1";
const INVITES_KEY = "txr-employee-invites-v1";
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

const seedDocuments: InternalDocument[] = [];

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
  const list = readJson<InternalDocument[] | null>(DOCS_KEY, null);
  if (list == null) {
    writeJson(DOCS_KEY, seedDocuments);
    return seedDocuments;
  }
  return list.map((doc) => ({
    ...doc,
    fileName: doc.fileName ?? null,
    fileMime: doc.fileMime ?? null,
    fileSize: doc.fileSize ?? null,
    filePath: doc.filePath ?? null,
  }));
}

export function saveDocuments(list: InternalDocument[]) {
  writeJson(DOCS_KEY, list);
}

const seedGeofences: Geofence[] = [
  {
    id: "fence-shop",
    name: "Bellville shop / yard",
    address: "3016 Newsom Rd, Bellville, TX 77418",
    // Approximate — admin can re-look up the address or use GPS on site
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
  // Backfill address for fences saved before the address field existed
  return list.map((fence) => ({
    ...fence,
    address: typeof fence.address === "string" ? fence.address : "",
  }));
}

export function saveGeofences(list: Geofence[]) {
  writeJson(FENCES_KEY, list);
}

export function loadInvites(): EmployeeInvite[] {
  return readJson<EmployeeInvite[]>(INVITES_KEY, []);
}

export function saveInvites(list: EmployeeInvite[]) {
  writeJson(INVITES_KEY, list);
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

export function newInviteToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
