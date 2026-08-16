import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Member = {
  email: string;
  password: string;
  name: string;
  company: string;
  trade: string;
  phone: string;
  status: "approved" | "pending";
};

type AuthContextValue = {
  member: Member | null;
  members: Member[];
  approvedMembers: Member[];
  pendingMembers: Member[];
  isAdmin: boolean;
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  apply: (data: Omit<Member, "status">) => { ok: boolean; message: string };
  approve: (email: string) => void;
  reject: (email: string) => void;
};

const STORAGE_KEY = "acac-members-v3";
const SESSION_KEY = "acac-session-v3";
const BOARD_EMAIL = "board@acac.local";

export function isAdminEmail(email: string | undefined | null) {
  return (email ?? "").toLowerCase() === BOARD_EMAIL;
}

/** Known demo / placeholder accounts that must never appear publicly. */
const DEMO_EMAILS = new Set([
  "member@acac.local",
  "marcus@acac.local",
  "elena@acac.local",
  "james@acac.local",
  "devin@acac.local",
]);

/** Board-only login for lounge tools until real contractors are approved. */
const seedMembers: Member[] = [
  {
    email: BOARD_EMAIL,
    password: "integrity",
    name: "ACAC Board",
    company: "Austin County Association of Contractors",
    trade: "Association Board",
    phone: "",
    status: "approved",
  },
];

function isPublicMember(m: Member) {
  return (
    m.status === "approved" &&
    m.email.toLowerCase() !== BOARD_EMAIL &&
    !DEMO_EMAILS.has(m.email.toLowerCase())
  );
}

function sanitizeMembers(list: Member[]): Member[] {
  const cleaned = list.filter((m) => !DEMO_EMAILS.has(m.email.toLowerCase()));
  const hasBoard = cleaned.some((m) => m.email.toLowerCase() === BOARD_EMAIL);
  return hasBoard ? cleaned : [...seedMembers, ...cleaned];
}

function loadMembers(): Member[] {
  try {
    // Drop legacy demo storage from earlier site versions.
    localStorage.removeItem("acac-members-v1");
    localStorage.removeItem("acac-session-v1");
    localStorage.removeItem("acac-members-v2");
    localStorage.removeItem("acac-session-v2");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMembers));
      return seedMembers;
    }
    const sanitized = sanitizeMembers(JSON.parse(raw) as Member[]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch {
    return seedMembers;
  }
}

function loadSession(members: Member[]): Member | null {
  try {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return members.find((m) => m.email === email && m.status === "approved") ?? null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [member, setMember] = useState<Member | null>(() => loadSession(loadMembers()));

  const persist = useCallback((next: Member[]) => {
    const sanitized = sanitizeMembers(next);
    setMembers(sanitized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const found = members.find(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
      );
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
      return { ok: true, message: "Welcome back." };
    },
    [members],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setMember(null);
  }, []);

  const apply = useCallback(
    (data: Omit<Member, "status">) => {
      const email = data.email.trim().toLowerCase();
      if (members.some((m) => m.email.toLowerCase() === email)) {
        return { ok: false, message: "An account with this email already exists." };
      }
      const next: Member = { ...data, email, status: "pending" };
      persist([...members, next]);
      return {
        ok: true,
        message:
          "Application received. Our team will vet your credentials before approving membership access.",
      };
    },
    [members, persist],
  );

  const approve = useCallback(
    (email: string) => {
      persist(
        members.map((m) =>
          m.email.toLowerCase() === email.toLowerCase()
            ? { ...m, status: "approved" as const }
            : m,
        ),
      );
    },
    [members, persist],
  );

  const reject = useCallback(
    (email: string) => {
      persist(members.filter((m) => m.email.toLowerCase() !== email.toLowerCase()));
    },
    [members, persist],
  );

  const approvedMembers = useMemo(() => members.filter(isPublicMember), [members]);

  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === "pending"),
    [members],
  );

  const isAdmin = isAdminEmail(member?.email);

  const value = useMemo(
    () => ({
      member,
      members,
      approvedMembers,
      pendingMembers,
      isAdmin,
      login,
      logout,
      apply,
      approve,
      reject,
    }),
    [
      member,
      members,
      approvedMembers,
      pendingMembers,
      isAdmin,
      login,
      logout,
      apply,
      approve,
      reject,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
