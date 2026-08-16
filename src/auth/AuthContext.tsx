import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase, type ProfileRow } from "../lib/supabase";

export type ApplicationDetails = {
  yearsInBusiness?: string;
  serviceArea?: string;
  website?: string;
  insuranceNotes?: string;
  licenseNotes?: string;
  aboutWork?: string;
};

export type Member = {
  id?: string;
  email: string;
  password?: string;
  name: string;
  company: string;
  trade: string;
  phone: string;
  status: "approved" | "pending" | "rejected";
  role?: "member" | "admin";
} & ApplicationDetails;

export type ApplicationInput = Omit<Member, "status" | "id" | "role">;

type AuthResult = { ok: boolean; message: string };

type AuthContextValue = {
  member: Member | null;
  members: Member[];
  approvedMembers: Member[];
  pendingMembers: Member[];
  isAdmin: boolean;
  backendReady: boolean;
  usingCloud: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  apply: (data: ApplicationInput) => Promise<AuthResult>;
  approve: (email: string) => Promise<void>;
  reject: (email: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
};

const STORAGE_KEY = "acac-members-v3";
const SESSION_KEY = "acac-session-v3";
const LEGACY_ADMIN_EMAIL = "board@acac.local";

const seedMembers: Member[] = [
  {
    email: LEGACY_ADMIN_EMAIL,
    password: "integrity",
    name: "ACAC Board",
    company: "Austin County Association of Contractors",
    trade: "Association Board",
    phone: "",
    status: "approved",
    role: "admin",
  },
];

function profileToMember(p: ProfileRow): Member {
  return {
    id: p.id,
    email: p.email,
    name: p.full_name,
    company: p.company,
    trade: p.trade,
    phone: p.phone,
    status: p.status === "rejected" ? "rejected" : p.status,
    role: p.role,
    yearsInBusiness: p.years_in_business ?? undefined,
    serviceArea: p.service_area ?? undefined,
    website: p.website ?? undefined,
    insuranceNotes: p.insurance_notes ?? undefined,
    licenseNotes: p.license_notes ?? undefined,
    aboutWork: p.about_work ?? undefined,
  };
}

function isPublicMember(m: Member) {
  return (
    m.status === "approved" &&
    m.role !== "admin" &&
    m.email.toLowerCase() !== LEGACY_ADMIN_EMAIL
  );
}

function loadLocalMembers(): Member[] {
  try {
    localStorage.removeItem("acac-members-v1");
    localStorage.removeItem("acac-session-v1");
    localStorage.removeItem("acac-members-v2");
    localStorage.removeItem("acac-session-v2");
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMembers));
      return seedMembers;
    }
    const list = JSON.parse(raw) as Member[];
    const hasAdmin = list.some((m) => m.email.toLowerCase() === LEGACY_ADMIN_EMAIL);
    return hasAdmin ? list : [...seedMembers, ...list];
  } catch {
    return seedMembers;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const usingCloud = isSupabaseConfigured;
  const [members, setMembers] = useState<Member[]>(() =>
    usingCloud ? [] : loadLocalMembers(),
  );
  const [member, setMember] = useState<Member | null>(null);
  const [backendReady, setBackendReady] = useState(!usingCloud);

  const persistLocal = useCallback((next: Member[]) => {
    setMembers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const refreshMembers = useCallback(async () => {
    if (!usingCloud || !supabase) {
      setMembers(loadLocalMembers());
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setMembers((data as ProfileRow[]).map(profileToMember));
  }, [usingCloud]);

  useEffect(() => {
    if (!usingCloud || !supabase) {
      const email = localStorage.getItem(SESSION_KEY);
      const list = loadLocalMembers();
      setMembers(list);
      setMember(
        email
          ? (list.find((m) => m.email === email && m.status === "approved") ?? null)
          : null,
      );
      setBackendReady(true);
      return;
    }

    let cancelled = false;

    async function boot() {
      const { data: sessionData } = await supabase!.auth.getSession();
      const session = sessionData.session;
      if (session?.user) {
        const { data: profile } = await supabase!
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (!cancelled && profile) {
          const m = profileToMember(profile as ProfileRow);
          if (m.status === "approved") setMember(m);
          else {
            await supabase!.auth.signOut();
            setMember(null);
          }
        }
      }
      await refreshMembers();
      if (!cancelled) setBackendReady(true);
    }

    void boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!session?.user) {
          setMember(null);
          return;
        }
        const { data: profile } = await supabase!
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          const m = profileToMember(profile as ProfileRow);
          if (m.status === "approved") setMember(m);
          else setMember(null);
        }
        await refreshMembers();
      })();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [usingCloud, refreshMembers]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (usingCloud && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error || !data.user) {
          return { ok: false, message: error?.message ?? "Invalid email or password." };
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profileError || !profile) {
          await supabase.auth.signOut();
          return { ok: false, message: "Profile not found. Contact the association." };
        }
        const m = profileToMember(profile as ProfileRow);
        if (m.status !== "approved") {
          await supabase.auth.signOut();
          return {
            ok: false,
            message:
              "Your application is still under review. You will be notified when vetted.",
          };
        }
        setMember(m);
        await refreshMembers();
        return { ok: true, message: "Welcome back." };
      }

      const list = loadLocalMembers();
      const found = list.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
      if (!found || found.password !== password) {
        return { ok: false, message: "Invalid email or password." };
      }
      if (found.status !== "approved") {
        return {
          ok: false,
          message: "Your application is still under review. You will be notified when vetted.",
        };
      }
      localStorage.setItem(SESSION_KEY, found.email);
      setMember(found);
      setMembers(list);
      return { ok: true, message: "Welcome back." };
    },
    [usingCloud, refreshMembers],
  );

  const logout = useCallback(async () => {
    if (usingCloud && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setMember(null);
  }, [usingCloud]);

  const apply = useCallback(
    async (data: ApplicationInput): Promise<AuthResult> => {
      const email = data.email.trim().toLowerCase();
      if (usingCloud && supabase) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password: data.password ?? "",
          options: {
            data: {
              full_name: data.name,
              company: data.company,
              trade: data.trade,
              phone: data.phone,
              years_in_business: data.yearsInBusiness ?? "",
              service_area: data.serviceArea ?? "",
              website: data.website ?? "",
              insurance_notes: data.insuranceNotes ?? "",
              license_notes: data.licenseNotes ?? "",
              about_work: data.aboutWork ?? "",
            },
          },
        });
        if (error) return { ok: false, message: error.message };
        if (signUpData.user?.id) {
          await supabase
            .from("profiles")
            .update({
              years_in_business: data.yearsInBusiness ?? "",
              service_area: data.serviceArea ?? "",
              website: data.website ?? "",
              insurance_notes: data.insuranceNotes ?? "",
              license_notes: data.licenseNotes ?? "",
              about_work: data.aboutWork ?? "",
            })
            .eq("id", signUpData.user.id);
        }
        await refreshMembers();
        return {
          ok: true,
          message:
            "Application received. Our team will vet your credentials before approving membership access.",
        };
      }

      const list = loadLocalMembers();
      if (list.some((m) => m.email.toLowerCase() === email)) {
        return { ok: false, message: "An account with this email already exists." };
      }
      const next: Member = {
        ...data,
        email,
        status: "pending",
        role: "member",
      };
      persistLocal([...list, next]);
      return {
        ok: true,
        message:
          "Application received. Our team will vet your credentials before approving membership access.",
      };
    },
    [usingCloud, persistLocal, refreshMembers],
  );

  const approve = useCallback(
    async (email: string) => {
      if (usingCloud && supabase) {
        await supabase
          .from("profiles")
          .update({ status: "approved" })
          .eq("email", email.toLowerCase());
        await refreshMembers();
        return;
      }
      const list = loadLocalMembers().map((m) =>
        m.email.toLowerCase() === email.toLowerCase()
          ? { ...m, status: "approved" as const }
          : m,
      );
      persistLocal(list);
    },
    [usingCloud, persistLocal, refreshMembers],
  );

  const reject = useCallback(
    async (email: string) => {
      if (usingCloud && supabase) {
        await supabase
          .from("profiles")
          .update({ status: "rejected" })
          .eq("email", email.toLowerCase());
        await refreshMembers();
        return;
      }
      persistLocal(
        loadLocalMembers().filter((m) => m.email.toLowerCase() !== email.toLowerCase()),
      );
    },
    [usingCloud, persistLocal, refreshMembers],
  );

  const approvedMembers = useMemo(() => members.filter(isPublicMember), [members]);
  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === "pending"),
    [members],
  );
  const isAdmin = member?.role === "admin" || member?.email.toLowerCase() === LEGACY_ADMIN_EMAIL;

  const value = useMemo(
    () => ({
      member,
      members,
      approvedMembers,
      pendingMembers,
      isAdmin,
      backendReady,
      usingCloud,
      login,
      logout,
      apply,
      approve,
      reject,
      refreshMembers,
    }),
    [
      member,
      members,
      approvedMembers,
      pendingMembers,
      isAdmin,
      backendReady,
      usingCloud,
      login,
      logout,
      apply,
      approve,
      reject,
      refreshMembers,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
