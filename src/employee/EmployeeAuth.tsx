import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EMPLOYEE_DOCS_BUCKET,
  isSupabaseConfigured,
  supabase,
  type DocumentRow,
  type EmployeeInviteRow,
  type EmployeeRow,
  type GeofenceRow,
  type TimeEntryRow,
} from "../lib/supabase";
import {
  deleteLocalDocumentBlob,
  loadLocalDocumentBlob,
  saveLocalDocumentBlob,
  validateDocumentFile,
} from "./documentFiles";
import { requireGps } from "./geo";
import { expiresInDays, inviteIsOpen, inviteJoinUrl } from "./invites";
import {
  loadDocuments,
  loadEmployees,
  loadEntries,
  loadGeofences,
  loadInvites,
  loadSessionEmail,
  newId,
  newInviteToken,
  saveDocuments,
  saveEmployees,
  saveEntries,
  saveGeofences,
  saveInvites,
  saveSessionEmail,
} from "./localStore";
import type {
  AuthResult,
  CreateCrewInput,
  DocumentWriteInput,
  Employee,
  EmployeeInvite,
  Geofence,
  GeofenceInput,
  GeoPoint,
  InternalDocument,
  TimeEntry,
} from "./types";

type EmployeeAuthValue = {
  backendReady: boolean;
  usingCloud: boolean;
  employee: Employee | null;
  isAdmin: boolean;
  employees: Employee[];
  entries: TimeEntry[];
  documents: InternalDocument[];
  geofences: Geofence[];
  invites: EmployeeInvite[];
  openEntry: TimeEntry | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clockIn: (note?: string) => Promise<AuthResult>;
  clockOut: (note?: string) => Promise<AuthResult>;
  refresh: () => Promise<void>;
  createDocument: (input: DocumentWriteInput) => Promise<AuthResult>;
  updateDocument: (
    id: string,
    patch: Partial<Omit<DocumentWriteInput, "file">> & { file?: File | null },
  ) => Promise<AuthResult>;
  deleteDocument: (id: string) => Promise<AuthResult>;
  /** Returns a temporary URL to open/download the attachment */
  getDocumentFileUrl: (doc: InternalDocument) => Promise<string | null>;
  setEmployeeStatus: (id: string, status: Employee["status"]) => Promise<AuthResult>;
  createGeofence: (input: GeofenceInput) => Promise<AuthResult>;
  updateGeofence: (id: string, input: GeofenceInput) => Promise<AuthResult>;
  deleteGeofence: (id: string) => Promise<AuthResult>;
  /** Admin: create crew account (local) and/or invite link */
  inviteCrew: (input: CreateCrewInput) => Promise<AuthResult>;
  revokeInvite: (id: string) => Promise<AuthResult>;
  lookupInvite: (token: string) => Promise<EmployeeInvite | null>;
  acceptInvite: (token: string, password: string) => Promise<AuthResult>;
};

const EmployeeAuthContext = createContext<EmployeeAuthValue | null>(null);

function rowToEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone,
    role: row.role,
    status: row.status,
  };
}

function geoFromRow(
  lat?: number | null,
  lng?: number | null,
  accuracy?: number | null,
  at?: string | null,
): GeoPoint | null {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    lat,
    lng,
    accuracyM: typeof accuracy === "number" ? accuracy : null,
    capturedAt: at || new Date().toISOString(),
  };
}

function rowToEntry(row: TimeEntryRow, name?: string): TimeEntry {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: name,
    clockIn: row.clock_in,
    clockOut: row.clock_out,
    note: row.note,
    clockInGeo: geoFromRow(
      row.clock_in_lat,
      row.clock_in_lng,
      row.clock_in_accuracy_m,
      row.clock_in,
    ),
    clockOutGeo: geoFromRow(
      row.clock_out_lat,
      row.clock_out_lng,
      row.clock_out_accuracy_m,
      row.clock_out,
    ),
  };
}

function rowToDocument(row: DocumentRow): InternalDocument {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    published: row.published,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileName: row.file_name ?? null,
    fileMime: row.file_mime ?? null,
    fileSize: typeof row.file_size === "number" ? row.file_size : null,
    filePath: row.file_path ?? null,
  };
}

function safeStorageFileName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120) || "document";
}

function rowToInvite(row: EmployeeInviteRow): EmployeeInvite {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone,
    role: row.role,
    token: row.token,
    createdBy: row.created_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
  };
}

function rowToGeofence(row: GeofenceRow): Geofence {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? "",
    lat: row.lat,
    lng: row.lng,
    radiusM: row.radius_m,
    active: row.active,
    notifyEnter: row.notify_enter,
    notifyExit: row.notify_exit,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateGeofenceInput(input: GeofenceInput): string | null {
  if (!input.name.trim()) return "Fence name is required.";
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    return "Latitude must be between -90 and 90.";
  }
  if (!Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
    return "Longitude must be between -180 and 180.";
  }
  if (!Number.isFinite(input.radiusM) || input.radiusM < 50 || input.radiusM > 5000) {
    return "Radius must be between 50 and 5,000 meters.";
  }
  return null;
}

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const usingCloud = isSupabaseConfigured;
  const [backendReady, setBackendReady] = useState(!usingCloud);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [documents, setDocuments] = useState<InternalDocument[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [invites, setInvites] = useState<EmployeeInvite[]>([]);

  const isAdmin = employee?.role === "admin";

  const refreshLocal = useCallback(() => {
    const list = loadEmployees();
    setEmployees(list);
    const email = loadSessionEmail();
    const current =
      email != null
        ? (list.find((e) => e.email === email && e.status === "active") ?? null)
        : null;
    setEmployee(current);
    const allEntries = loadEntries();
    const names = new Map(list.map((e) => [e.id, e.name]));
    setEntries(
      allEntries
        .map((entry) => ({ ...entry, employeeName: names.get(entry.employeeId) }))
        .sort((a, b) => b.clockIn.localeCompare(a.clockIn)),
    );
    setDocuments(
      loadDocuments().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
    setGeofences(
      loadGeofences().sort((a, b) => a.name.localeCompare(b.name)),
    );
    setInvites(
      loadInvites().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }, []);

  const refreshCloud = useCallback(async () => {
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setEmployee(null);
      setEmployees([]);
      setEntries([]);
      setDocuments([]);
      setGeofences([]);
      setInvites([]);
      return;
    }

    const { data: profile } = await supabase
      .from("employees")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (profile as EmployeeRow).status !== "active") {
      await supabase.auth.signOut();
      setEmployee(null);
      return;
    }

    const me = rowToEmployee(profile as EmployeeRow);
    setEmployee(me);

    const { data: roster } = await supabase.from("employees").select("*").order("full_name");
    const rosterList = ((roster as EmployeeRow[] | null) ?? []).map(rowToEmployee);
    setEmployees(rosterList);
    const names = new Map(rosterList.map((e) => [e.id, e.name]));

    const { data: punches } = await supabase
      .from("time_entries")
      .select("*")
      .order("clock_in", { ascending: false })
      .limit(500);
    setEntries(
      ((punches as TimeEntryRow[] | null) ?? []).map((row) =>
        rowToEntry(row, names.get(row.employee_id)),
      ),
    );

    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });
    setDocuments(((docs as DocumentRow[] | null) ?? []).map(rowToDocument));

    const { data: fences } = await supabase
      .from("geofences")
      .select("*")
      .order("name", { ascending: true });
    setGeofences(((fences as GeofenceRow[] | null) ?? []).map(rowToGeofence));

    if (me.role === "admin") {
      const { data: inviteRows } = await supabase
        .from("employee_invites")
        .select("*")
        .order("created_at", { ascending: false });
      setInvites(((inviteRows as EmployeeInviteRow[] | null) ?? []).map(rowToInvite));
    } else {
      setInvites([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (usingCloud) await refreshCloud();
    else refreshLocal();
  }, [usingCloud, refreshCloud, refreshLocal]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (usingCloud) {
        await refreshCloud();
        if (!cancelled) setBackendReady(true);
        const { data } = supabase!.auth.onAuthStateChange(() => {
          void refreshCloud();
        });
        return () => data.subscription.unsubscribe();
      }
      refreshLocal();
      setBackendReady(true);
      return undefined;
    }
    const cleanup = boot();
    return () => {
      cancelled = true;
      void cleanup.then((fn) => fn?.());
    };
  }, [usingCloud, refreshCloud, refreshLocal]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, message: "Enter email and password." };
      }

      if (usingCloud && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalized,
          password,
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Signed in." };
      }

      const list = loadEmployees();
      const match = list.find(
        (e) =>
          e.email.toLowerCase() === normalized &&
          e.password === password &&
          e.status === "active",
      );
      if (!match) return { ok: false, message: "Invalid email or password." };
      saveSessionEmail(match.email);
      refreshLocal();
      return { ok: true, message: "Signed in." };
    },
    [usingCloud, refreshCloud, refreshLocal],
  );

  const logout = useCallback(async () => {
    if (usingCloud && supabase) await supabase.auth.signOut();
    saveSessionEmail(null);
    setEmployee(null);
    if (!usingCloud) refreshLocal();
  }, [usingCloud, refreshLocal]);

  const openEntry = useMemo(() => {
    if (!employee) return null;
    return entries.find((e) => e.employeeId === employee.id && !e.clockOut) ?? null;
  }, [employee, entries]);

  const clockIn = useCallback(
    async (note = ""): Promise<AuthResult> => {
      if (!employee) return { ok: false, message: "Not signed in." };
      if (openEntry) return { ok: false, message: "Already clocked in." };

      if (typeof Notification === "undefined" || Notification.permission !== "granted") {
        return {
          ok: false,
          message: "Notifications are required. Allow notifications before clocking in.",
        };
      }

      const gps = await requireGps();
      if (!gps.ok) return { ok: false, message: gps.message };

      if (usingCloud && supabase) {
        const { error } = await supabase.from("time_entries").insert({
          employee_id: employee.id,
          note: note.trim(),
          clock_in_lat: gps.point.lat,
          clock_in_lng: gps.point.lng,
          clock_in_accuracy_m: gps.point.accuracyM,
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Clocked in with GPS." };
      }

      const next: TimeEntry = {
        id: newId("punch"),
        employeeId: employee.id,
        employeeName: employee.name,
        clockIn: new Date().toISOString(),
        clockOut: null,
        note: note.trim(),
        clockInGeo: gps.point,
        clockOutGeo: null,
      };
      saveEntries([next, ...loadEntries()]);
      refreshLocal();
      return { ok: true, message: "Clocked in with GPS." };
    },
    [employee, openEntry, usingCloud, refreshCloud, refreshLocal],
  );

  const clockOut = useCallback(
    async (note = ""): Promise<AuthResult> => {
      if (!employee) return { ok: false, message: "Not signed in." };
      if (!openEntry) return { ok: false, message: "Not clocked in." };

      if (typeof Notification === "undefined" || Notification.permission !== "granted") {
        return {
          ok: false,
          message: "Notifications are required. Allow notifications before clocking out.",
        };
      }

      const gps = await requireGps();
      if (!gps.ok) return { ok: false, message: gps.message };

      const mergedNote = note.trim()
        ? [openEntry.note, note.trim()].filter(Boolean).join(" · ")
        : openEntry.note;
      const clockOutIso = new Date().toISOString();

      if (usingCloud && supabase) {
        const { error } = await supabase
          .from("time_entries")
          .update({
            clock_out: clockOutIso,
            note: mergedNote,
            clock_out_lat: gps.point.lat,
            clock_out_lng: gps.point.lng,
            clock_out_accuracy_m: gps.point.accuracyM,
          })
          .eq("id", openEntry.id)
          .is("clock_out", null);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Clocked out with GPS." };
      }

      const next = loadEntries().map((entry) =>
        entry.id === openEntry.id
          ? {
              ...entry,
              clockOut: clockOutIso,
              note: mergedNote,
              clockOutGeo: gps.point,
            }
          : entry,
      );
      saveEntries(next);
      refreshLocal();
      return { ok: true, message: "Clocked out with GPS." };
    },
    [employee, openEntry, usingCloud, refreshCloud, refreshLocal],
  );

  const createDocument = useCallback(
    async (input: DocumentWriteInput): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      if (!input.title.trim()) return { ok: false, message: "Title is required." };
      if (!input.file) return { ok: false, message: "Attach a file to upload." };
      const fileError = validateDocumentFile(input.file);
      if (fileError) return { ok: false, message: fileError };

      if (usingCloud && supabase) {
        const docId = crypto.randomUUID();
        const filePath = `${employee.id}/${docId}/${safeStorageFileName(input.file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(EMPLOYEE_DOCS_BUCKET)
          .upload(filePath, input.file, {
            contentType: input.file.type || "application/octet-stream",
            upsert: false,
          });
        if (uploadError) return { ok: false, message: uploadError.message };

        const { error } = await supabase.from("documents").insert({
          id: docId,
          kind: input.kind,
          title: input.title.trim(),
          body: input.body.trim(),
          published: input.published,
          author_id: employee.id,
          file_name: input.file.name,
          file_mime: input.file.type || "application/octet-stream",
          file_size: input.file.size,
          file_path: filePath,
        });
        if (error) {
          await supabase.storage.from(EMPLOYEE_DOCS_BUCKET).remove([filePath]);
          return { ok: false, message: error.message };
        }
        await refreshCloud();
        return { ok: true, message: "Document uploaded." };
      }

      const now = new Date().toISOString();
      const id = newId("doc");
      await saveLocalDocumentBlob(id, input.file);
      const doc: InternalDocument = {
        id,
        kind: input.kind,
        title: input.title.trim(),
        body: input.body.trim(),
        published: input.published,
        authorId: employee.id,
        createdAt: now,
        updatedAt: now,
        fileName: input.file.name,
        fileMime: input.file.type || "application/octet-stream",
        fileSize: input.file.size,
        filePath: id,
      };
      saveDocuments([doc, ...loadDocuments()]);
      refreshLocal();
      return { ok: true, message: "Document uploaded." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const updateDocument = useCallback(
    async (
      id: string,
      patch: Partial<Omit<DocumentWriteInput, "file">> & { file?: File | null },
    ): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      if (patch.title !== undefined && !patch.title.trim()) {
        return { ok: false, message: "Title is required." };
      }
      if (patch.file) {
        const fileError = validateDocumentFile(patch.file);
        if (fileError) return { ok: false, message: fileError };
      }

      const existing =
        (usingCloud
          ? null
          : loadDocuments().find((doc) => doc.id === id)) ??
        documents.find((doc) => doc.id === id) ??
        null;

      if (usingCloud && supabase) {
        const cloudPatch: Record<string, unknown> = {};
        if (patch.kind !== undefined) cloudPatch.kind = patch.kind;
        if (patch.title !== undefined) cloudPatch.title = patch.title.trim();
        if (patch.body !== undefined) cloudPatch.body = patch.body.trim();
        if (patch.published !== undefined) cloudPatch.published = patch.published;

        let newPath: string | null = null;
        const oldPath = existing?.filePath ?? null;

        if (patch.file) {
          newPath = `${employee.id}/${id}/${safeStorageFileName(patch.file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(EMPLOYEE_DOCS_BUCKET)
            .upload(newPath, patch.file, {
              contentType: patch.file.type || "application/octet-stream",
              upsert: true,
            });
          if (uploadError) return { ok: false, message: uploadError.message };
          cloudPatch.file_name = patch.file.name;
          cloudPatch.file_mime = patch.file.type || "application/octet-stream";
          cloudPatch.file_size = patch.file.size;
          cloudPatch.file_path = newPath;
        }

        const { error } = await supabase.from("documents").update(cloudPatch).eq("id", id);
        if (error) {
          if (newPath) await supabase.storage.from(EMPLOYEE_DOCS_BUCKET).remove([newPath]);
          return { ok: false, message: error.message };
        }
        if (oldPath && newPath && oldPath !== newPath) {
          await supabase.storage.from(EMPLOYEE_DOCS_BUCKET).remove([oldPath]);
        }
        await refreshCloud();
        return { ok: true, message: "Document updated." };
      }

      if (patch.file) {
        await saveLocalDocumentBlob(id, patch.file);
      }

      const next = loadDocuments().map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
              ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
              ...(patch.body !== undefined ? { body: patch.body.trim() } : {}),
              ...(patch.published !== undefined ? { published: patch.published } : {}),
              ...(patch.file
                ? {
                    fileName: patch.file.name,
                    fileMime: patch.file.type || "application/octet-stream",
                    fileSize: patch.file.size,
                    filePath: id,
                  }
                : {}),
              updatedAt: new Date().toISOString(),
            }
          : doc,
      );
      saveDocuments(next);
      refreshLocal();
      return { ok: true, message: "Document updated." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal, documents],
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }

      const existing = documents.find((doc) => doc.id === id) ?? null;

      if (usingCloud && supabase) {
        if (existing?.filePath) {
          await supabase.storage.from(EMPLOYEE_DOCS_BUCKET).remove([existing.filePath]);
        }
        const { error } = await supabase.from("documents").delete().eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Document deleted." };
      }

      await deleteLocalDocumentBlob(id);
      saveDocuments(loadDocuments().filter((doc) => doc.id !== id));
      refreshLocal();
      return { ok: true, message: "Document deleted." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal, documents],
  );

  const getDocumentFileUrl = useCallback(
    async (doc: InternalDocument): Promise<string | null> => {
      if (!doc.filePath && !doc.fileName) return null;

      if (usingCloud && supabase && doc.filePath) {
        const { data, error } = await supabase.storage
          .from(EMPLOYEE_DOCS_BUCKET)
          .createSignedUrl(doc.filePath, 60 * 60);
        if (error || !data?.signedUrl) return null;
        return data.signedUrl;
      }

      const blob = await loadLocalDocumentBlob(doc.filePath || doc.id);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    },
    [usingCloud],
  );

  const setEmployeeStatus = useCallback(
    async (id: string, status: Employee["status"]): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }

      if (usingCloud && supabase) {
        const { error } = await supabase.from("employees").update({ status }).eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Employee updated." };
      }

      const next = loadEmployees().map((e) => (e.id === id ? { ...e, status } : e));
      saveEmployees(next);
      refreshLocal();
      return { ok: true, message: "Employee updated." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const createGeofence = useCallback(
    async (input: GeofenceInput): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      const invalid = validateGeofenceInput(input);
      if (invalid) return { ok: false, message: invalid };

      if (usingCloud && supabase) {
        const { error } = await supabase.from("geofences").insert({
          name: input.name.trim(),
          address: input.address.trim(),
          lat: input.lat,
          lng: input.lng,
          radius_m: Math.round(input.radiusM),
          active: input.active,
          notify_enter: input.notifyEnter,
          notify_exit: input.notifyExit,
          created_by: employee.id,
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Geofence saved." };
      }

      const now = new Date().toISOString();
      const fence: Geofence = {
        id: newId("fence"),
        name: input.name.trim(),
        address: input.address.trim(),
        lat: Number(input.lat.toFixed(6)),
        lng: Number(input.lng.toFixed(6)),
        radiusM: Math.round(input.radiusM),
        active: input.active,
        notifyEnter: input.notifyEnter,
        notifyExit: input.notifyExit,
        createdBy: employee.id,
        createdAt: now,
        updatedAt: now,
      };
      saveGeofences([fence, ...loadGeofences()]);
      refreshLocal();
      return { ok: true, message: "Geofence saved." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const updateGeofence = useCallback(
    async (id: string, input: GeofenceInput): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      const invalid = validateGeofenceInput(input);
      if (invalid) return { ok: false, message: invalid };

      if (usingCloud && supabase) {
        const { error } = await supabase
          .from("geofences")
          .update({
            name: input.name.trim(),
            address: input.address.trim(),
            lat: input.lat,
            lng: input.lng,
            radius_m: Math.round(input.radiusM),
            active: input.active,
            notify_enter: input.notifyEnter,
            notify_exit: input.notifyExit,
          })
          .eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Geofence updated." };
      }

      const next = loadGeofences().map((fence) =>
        fence.id === id
          ? {
              ...fence,
              name: input.name.trim(),
              address: input.address.trim(),
              lat: Number(input.lat.toFixed(6)),
              lng: Number(input.lng.toFixed(6)),
              radiusM: Math.round(input.radiusM),
              active: input.active,
              notifyEnter: input.notifyEnter,
              notifyExit: input.notifyExit,
              updatedAt: new Date().toISOString(),
            }
          : fence,
      );
      saveGeofences(next);
      refreshLocal();
      return { ok: true, message: "Geofence updated." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const deleteGeofence = useCallback(
    async (id: string): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }

      if (usingCloud && supabase) {
        const { error } = await supabase.from("geofences").delete().eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Geofence deleted." };
      }

      saveGeofences(loadGeofences().filter((fence) => fence.id !== id));
      refreshLocal();
      return { ok: true, message: "Geofence deleted." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const inviteCrew = useCallback(
    async (input: CreateCrewInput): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      const email = input.email.trim().toLowerCase();
      const name = input.name.trim();
      const phone = input.phone.trim();
      if (!name) return { ok: false, message: "Name is required." };
      if (!email) return { ok: false, message: "Email is required." };

      if (usingCloud && supabase) {
        const token = newInviteToken();
        const { error } = await supabase.from("employee_invites").insert({
          email,
          full_name: name,
          phone,
          role: input.role,
          token,
          created_by: employee.id,
          expires_at: expiresInDays(14),
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return {
          ok: true,
          message: "Invite created. Copy the link and send it to the crew member.",
          inviteUrl: inviteJoinUrl(token),
        };
      }

      const password = input.password?.trim() || "";
      if (password.length < 6) {
        return { ok: false, message: "Temporary password must be at least 6 characters." };
      }
      const existing = loadEmployees();
      if (existing.some((e) => e.email.toLowerCase() === email)) {
        return { ok: false, message: "That email already has an account." };
      }

      const token = newInviteToken();
      const now = new Date().toISOString();
      const person: Employee = {
        id: newId("emp"),
        email,
        name,
        phone,
        role: input.role,
        status: "active",
        password,
      };
      saveEmployees([person, ...existing]);

      const invite: EmployeeInvite = {
        id: newId("invite"),
        email,
        name,
        phone,
        role: input.role,
        token,
        createdBy: employee.id,
        createdAt: now,
        expiresAt: expiresInDays(14),
        acceptedAt: null,
        tempPassword: password,
      };
      saveInvites([invite, ...loadInvites()]);
      refreshLocal();
      return {
        ok: true,
        message: `Crew account created. They can sign in now, or use the invite link to set their own password.`,
        inviteUrl: inviteJoinUrl(token),
      };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const revokeInvite = useCallback(
    async (id: string): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }

      if (usingCloud && supabase) {
        const { error } = await supabase.from("employee_invites").delete().eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Invite revoked." };
      }

      saveInvites(loadInvites().filter((invite) => invite.id !== id));
      refreshLocal();
      return { ok: true, message: "Invite removed." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const lookupInvite = useCallback(
    async (token: string): Promise<EmployeeInvite | null> => {
      const cleaned = token.trim();
      if (!cleaned) return null;

      if (usingCloud && supabase) {
        const { data, error } = await supabase
          .from("employee_invites")
          .select("*")
          .eq("token", cleaned)
          .maybeSingle();
        if (error || !data) return null;
        const invite = rowToInvite(data as EmployeeInviteRow);
        return inviteIsOpen(invite) ? invite : null;
      }

      const invite = loadInvites().find((row) => row.token === cleaned) ?? null;
      if (!invite || !inviteIsOpen(invite)) return null;
      return invite;
    },
    [usingCloud],
  );

  const acceptInvite = useCallback(
    async (token: string, password: string): Promise<AuthResult> => {
      const cleaned = token.trim();
      if (!cleaned) return { ok: false, message: "Missing invite token." };
      if (password.trim().length < 6) {
        return { ok: false, message: "Password must be at least 6 characters." };
      }

      if (usingCloud && supabase) {
        const { data, error } = await supabase
          .from("employee_invites")
          .select("*")
          .eq("token", cleaned)
          .maybeSingle();
        if (error || !data) return { ok: false, message: "Invite not found." };
        const invite = rowToInvite(data as EmployeeInviteRow);
        if (!inviteIsOpen(invite)) {
          return { ok: false, message: "This invite is expired or already used." };
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: invite.email,
          password: password.trim(),
          options: {
            data: {
              full_name: invite.name,
              phone: invite.phone,
              role: invite.role,
            },
          },
        });
        if (signUpError) return { ok: false, message: signUpError.message };

        await supabase
          .from("employee_invites")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", invite.id);

        await refreshCloud();
        return {
          ok: true,
          message: "Account created. If email confirmation is required, check your inbox, then sign in.",
        };
      }

      const invitesLocal = loadInvites();
      const invite = invitesLocal.find((row) => row.token === cleaned) ?? null;
      if (!invite || !inviteIsOpen(invite)) {
        return { ok: false, message: "This invite is expired or already used." };
      }

      const people = loadEmployees();
      const match = people.find((e) => e.email.toLowerCase() === invite.email.toLowerCase());
      if (match) {
        saveEmployees(
          people.map((e) =>
            e.id === match.id ? { ...e, password: password.trim(), status: "active" } : e,
          ),
        );
      } else {
        saveEmployees([
          {
            id: newId("emp"),
            email: invite.email.toLowerCase(),
            name: invite.name,
            phone: invite.phone,
            role: invite.role,
            status: "active",
            password: password.trim(),
          },
          ...people,
        ]);
      }

      saveInvites(
        invitesLocal.map((row) =>
          row.id === invite.id ? { ...row, acceptedAt: new Date().toISOString() } : row,
        ),
      );
      saveSessionEmail(invite.email.toLowerCase());
      refreshLocal();
      return { ok: true, message: "You're in. Welcome to the employee console." };
    },
    [usingCloud, refreshCloud, refreshLocal],
  );

  const value = useMemo<EmployeeAuthValue>(
    () => ({
      backendReady,
      usingCloud,
      employee,
      isAdmin,
      employees,
      entries,
      documents,
      geofences,
      invites,
      openEntry,
      login,
      logout,
      clockIn,
      clockOut,
      refresh,
      createDocument,
      updateDocument,
      deleteDocument,
      getDocumentFileUrl,
      setEmployeeStatus,
      createGeofence,
      updateGeofence,
      deleteGeofence,
      inviteCrew,
      revokeInvite,
      lookupInvite,
      acceptInvite,
    }),
    [
      backendReady,
      usingCloud,
      employee,
      isAdmin,
      employees,
      entries,
      documents,
      geofences,
      invites,
      openEntry,
      login,
      logout,
      clockIn,
      clockOut,
      refresh,
      createDocument,
      updateDocument,
      deleteDocument,
      getDocumentFileUrl,
      setEmployeeStatus,
      createGeofence,
      updateGeofence,
      deleteGeofence,
      inviteCrew,
      revokeInvite,
      lookupInvite,
      acceptInvite,
    ],
  );

  return (
    <EmployeeAuthContext.Provider value={value}>{children}</EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error("useEmployeeAuth must be used inside EmployeeAuthProvider");
  return ctx;
}
