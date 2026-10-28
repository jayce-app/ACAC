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
  isSupabaseConfigured,
  supabase,
  type DocumentRow,
  type EmployeeRow,
  type TimeEntryRow,
} from "../lib/supabase";
import { captureGps } from "./geo";
import {
  loadDocuments,
  loadEmployees,
  loadEntries,
  loadSessionEmail,
  newId,
  saveDocuments,
  saveEmployees,
  saveEntries,
  saveSessionEmail,
} from "./localStore";
import type { AuthResult, Employee, GeoPoint, InternalDocument, TimeEntry } from "./types";

type EmployeeAuthValue = {
  backendReady: boolean;
  usingCloud: boolean;
  employee: Employee | null;
  isAdmin: boolean;
  employees: Employee[];
  entries: TimeEntry[];
  documents: InternalDocument[];
  openEntry: TimeEntry | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clockIn: (note?: string) => Promise<AuthResult>;
  clockOut: (note?: string) => Promise<AuthResult>;
  refresh: () => Promise<void>;
  createDocument: (input: {
    kind: InternalDocument["kind"];
    title: string;
    body: string;
    published: boolean;
  }) => Promise<AuthResult>;
  updateDocument: (
    id: string,
    patch: Partial<Pick<InternalDocument, "kind" | "title" | "body" | "published">>,
  ) => Promise<AuthResult>;
  setEmployeeStatus: (id: string, status: Employee["status"]) => Promise<AuthResult>;
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
  };
}

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const usingCloud = isSupabaseConfigured;
  const [backendReady, setBackendReady] = useState(!usingCloud);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [documents, setDocuments] = useState<InternalDocument[]>([]);

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

      const gps = await captureGps();
      const geoSuffix = gps.error ? ` (${gps.error})` : "";

      if (usingCloud && supabase) {
        const { error } = await supabase.from("time_entries").insert({
          employee_id: employee.id,
          note: note.trim(),
          clock_in_lat: gps.point?.lat ?? null,
          clock_in_lng: gps.point?.lng ?? null,
          clock_in_accuracy_m: gps.point?.accuracyM ?? null,
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return {
          ok: true,
          message: gps.point ? "Clocked in with GPS." : `Clocked in${geoSuffix}`,
        };
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
      return {
        ok: true,
        message: gps.point ? "Clocked in with GPS." : `Clocked in${geoSuffix}`,
      };
    },
    [employee, openEntry, usingCloud, refreshCloud, refreshLocal],
  );

  const clockOut = useCallback(
    async (note = ""): Promise<AuthResult> => {
      if (!employee) return { ok: false, message: "Not signed in." };
      if (!openEntry) return { ok: false, message: "Not clocked in." };

      const gps = await captureGps();
      const geoSuffix = gps.error ? ` (${gps.error})` : "";
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
            clock_out_lat: gps.point?.lat ?? null,
            clock_out_lng: gps.point?.lng ?? null,
            clock_out_accuracy_m: gps.point?.accuracyM ?? null,
          })
          .eq("id", openEntry.id)
          .is("clock_out", null);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return {
          ok: true,
          message: gps.point ? "Clocked out with GPS." : `Clocked out${geoSuffix}`,
        };
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
      return {
        ok: true,
        message: gps.point ? "Clocked out with GPS." : `Clocked out${geoSuffix}`,
      };
    },
    [employee, openEntry, usingCloud, refreshCloud, refreshLocal],
  );

  const createDocument = useCallback(
    async (input: {
      kind: InternalDocument["kind"];
      title: string;
      body: string;
      published: boolean;
    }): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }
      if (!input.title.trim()) return { ok: false, message: "Title is required." };

      if (usingCloud && supabase) {
        const { error } = await supabase.from("documents").insert({
          kind: input.kind,
          title: input.title.trim(),
          body: input.body.trim(),
          published: input.published,
          author_id: employee.id,
        });
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Document saved." };
      }

      const now = new Date().toISOString();
      const doc: InternalDocument = {
        id: newId("doc"),
        kind: input.kind,
        title: input.title.trim(),
        body: input.body.trim(),
        published: input.published,
        authorId: employee.id,
        createdAt: now,
        updatedAt: now,
      };
      saveDocuments([doc, ...loadDocuments()]);
      refreshLocal();
      return { ok: true, message: "Document saved." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
  );

  const updateDocument = useCallback(
    async (
      id: string,
      patch: Partial<Pick<InternalDocument, "kind" | "title" | "body" | "published">>,
    ): Promise<AuthResult> => {
      if (!employee || employee.role !== "admin") {
        return { ok: false, message: "Admin only." };
      }

      if (usingCloud && supabase) {
        const { error } = await supabase.from("documents").update(patch).eq("id", id);
        if (error) return { ok: false, message: error.message };
        await refreshCloud();
        return { ok: true, message: "Document updated." };
      }

      const next = loadDocuments().map((doc) =>
        doc.id === id
          ? { ...doc, ...patch, updatedAt: new Date().toISOString() }
          : doc,
      );
      saveDocuments(next);
      refreshLocal();
      return { ok: true, message: "Document updated." };
    },
    [employee, usingCloud, refreshCloud, refreshLocal],
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

  const value = useMemo<EmployeeAuthValue>(
    () => ({
      backendReady,
      usingCloud,
      employee,
      isAdmin,
      employees,
      entries,
      documents,
      openEntry,
      login,
      logout,
      clockIn,
      clockOut,
      refresh,
      createDocument,
      updateDocument,
      setEmployeeStatus,
    }),
    [
      backendReady,
      usingCloud,
      employee,
      isAdmin,
      employees,
      entries,
      documents,
      openEntry,
      login,
      logout,
      clockIn,
      clockOut,
      refresh,
      createDocument,
      updateDocument,
      setEmployeeStatus,
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
