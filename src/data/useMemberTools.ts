import { useCallback, useEffect, useMemo, useState } from "react";
import type { BidPost, BlacklistEntry, BoardPost } from "./content";
import { discussionBoards } from "./content";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const BIDS_KEY = "acac-bids-v1";
const BLACKLIST_KEY = "acac-blacklist-v2";
const POSTS_KEY = "acac-board-posts-v1";

const emptyPosts = () =>
  Object.fromEntries(discussionBoards.map((b) => [b.id, [] as BoardPost[]]));

function migrateBlacklist(raw: unknown[]): BlacklistEntry[] {
  return raw.map((item) => {
    const entry = item as BlacklistEntry & { status?: string };
    if (entry.status === "pending" || entry.status === "approved" || entry.status === "rejected") {
      return entry as BlacklistEntry;
    }
    // Legacy entries had no status — require fresh admin review.
    return { ...entry, status: "pending" as const };
  });
}

function loadBlacklist(): BlacklistEntry[] {
  try {
    localStorage.removeItem("acac-blacklist-v1");
    const raw = localStorage.getItem(BLACKLIST_KEY);
    if (!raw) return [];
    return migrateBlacklist(JSON.parse(raw) as unknown[]);
  } catch {
    return [];
  }
}

export function useMemberTools() {
  const [bids, setBids] = useState<BidPost[]>(() => loadJson(BIDS_KEY, []));
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() => loadBlacklist());
  const [postsByBoard, setPostsByBoard] = useState<Record<string, BoardPost[]>>(() =>
    loadJson(POSTS_KEY, emptyPosts()),
  );

  useEffect(() => saveJson(BIDS_KEY, bids), [bids]);
  useEffect(() => saveJson(BLACKLIST_KEY, blacklist), [blacklist]);
  useEffect(() => saveJson(POSTS_KEY, postsByBoard), [postsByBoard]);

  const addBid = useCallback((bid: Omit<BidPost, "id" | "date">) => {
    const next: BidPost = {
      ...bid,
      id: `bid-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    setBids((prev) => [next, ...prev]);
  }, []);

  const submitBlacklist = useCallback(
    (entry: Omit<BlacklistEntry, "id" | "date" | "status" | "reviewedBy" | "reviewedDate">) => {
      const next: BlacklistEntry = {
        ...entry,
        id: `bl-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        status: "pending",
      };
      setBlacklist((prev) => [next, ...prev]);
    },
    [],
  );

  const approveBlacklist = useCallback((id: string, reviewedBy: string) => {
    const reviewedDate = new Date().toISOString().slice(0, 10);
    setBlacklist((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: "approved" as const, reviewedBy, reviewedDate }
          : entry,
      ),
    );
  }, []);

  const rejectBlacklist = useCallback((id: string, reviewedBy: string) => {
    const reviewedDate = new Date().toISOString().slice(0, 10);
    setBlacklist((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: "rejected" as const, reviewedBy, reviewedDate }
          : entry,
      ),
    );
  }, []);

  const addBoardPost = useCallback((boardId: string, post: Omit<BoardPost, "id" | "date">) => {
    const next: BoardPost = {
      ...post,
      id: `${boardId}-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    setPostsByBoard((prev) => ({
      ...prev,
      [boardId]: [next, ...(prev[boardId] ?? [])],
    }));
  }, []);

  const approvedBlacklist = useMemo(
    () => blacklist.filter((e) => e.status === "approved"),
    [blacklist],
  );

  const pendingBlacklist = useMemo(
    () => blacklist.filter((e) => e.status === "pending"),
    [blacklist],
  );

  return {
    bids,
    blacklist,
    approvedBlacklist,
    pendingBlacklist,
    postsByBoard,
    addBid,
    submitBlacklist,
    approveBlacklist,
    rejectBlacklist,
    addBoardPost,
  };
}
