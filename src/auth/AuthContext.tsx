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
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  apply: (data: Omit<Member, "status">) => { ok: boolean; message: string };
};

const STORAGE_KEY = "acac-members-v1";
const SESSION_KEY = "acac-session-v1";

const seedMembers: Member[] = [
  {
    email: "member@acac.local",
    password: "integrity",
    name: "Marcus Hale",
    company: "Lone Star Framing Co.",
    trade: "Residential Framing",
    phone: "(979) 555-0142",
    status: "approved",
  },
];

function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMembers));
      return seedMembers;
    }
    return JSON.parse(raw) as Member[];
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
    setMembers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

  const value = useMemo(
    () => ({ member, members, login, logout, apply }),
    [member, members, login, logout, apply],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
