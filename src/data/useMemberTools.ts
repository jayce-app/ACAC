import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { BidPost, BlacklistEntry, BoardPost } from "./content";
import { discussionBoards } from "./content";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

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
    return { ...entry, status: "pending" as const };
  });
}

export function useMemberTools() {
  const { member } = useAuth();
  const usingCloud = isSupabaseConfigured;

  const [bids, setBids] = useState<BidPost[]>(() =>
    usingCloud ? [] : loadJson(BIDS_KEY, []),
  );
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() =>
    usingCloud
      ? []
      : migrateBlacklist(loadJson<unknown[]>(BLACKLIST_KEY, [])),
  );
  const [postsByBoard, setPostsByBoard] = useState<Record<string, BoardPost[]>>(() =>
    usingCloud ? emptyPosts() : loadJson(POSTS_KEY, emptyPosts()),
  );
  const [loading, setLoading] = useState(usingCloud);

  const refresh = useCallback(async () => {
    if (!usingCloud || !supabase || !member) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [bidsRes, blRes, postsRes] = await Promise.all([
      supabase
        .from("bids")
        .select("*, profiles:author_id(full_name, company)")
        .order("created_at", { ascending: false }),
      supabase
        .from("blacklist_entries")
        .select("*, reporter:reporter_id(full_name, company), reviewer:reviewed_by(full_name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("board_posts")
        .select("*, profiles:author_id(full_name, company)")
        .order("created_at", { ascending: false }),
    ]);

    if (bidsRes.data) {
      setBids(
        bidsRes.data.map((row) => {
          const profile = row.profiles as { full_name?: string; company?: string } | null;
          return {
            id: row.id as string,
            title: row.title as string,
            tradeNeeded: row.trade_needed as string,
            location: row.location as string,
            details: row.details as string,
            contact: row.contact as string,
            author: profile?.full_name ?? "",
            company: profile?.company ?? "",
            date: String(row.created_at).slice(0, 10),
          };
        }),
      );
    }

    if (blRes.data) {
      setBlacklist(
        blRes.data.map((row) => {
          const reporter = row.reporter as { full_name?: string; company?: string } | null;
          const reviewer = row.reviewer as { full_name?: string } | null;
          return {
            id: row.id as string,
            partyType: row.party_type as BlacklistEntry["partyType"],
            name: row.name as string,
            company: (row.company as string) ?? "",
            reason: row.reason as string,
            reportedBy: reporter?.full_name ?? "",
            reportedCompany: reporter?.company ?? "",
            date: String(row.created_at).slice(0, 10),
            status: row.status as BlacklistEntry["status"],
            reviewedBy: reviewer?.full_name,
            reviewedDate: row.reviewed_at ? String(row.reviewed_at).slice(0, 10) : undefined,
          };
        }),
      );
    }

    if (postsRes.data) {
      const grouped = emptyPosts();
      for (const row of postsRes.data) {
        const profile = row.profiles as { full_name?: string; company?: string } | null;
        const boardId = row.board_id as string;
        const post: BoardPost = {
          id: row.id as string,
          author: profile?.full_name ?? "",
          company: profile?.company ?? "",
          title: row.title as string,
          body: row.body as string,
          date: String(row.created_at).slice(0, 10),
        };
        grouped[boardId] = [post, ...(grouped[boardId] ?? [])];
      }
      setPostsByBoard(grouped);
    }

    setLoading(false);
  }, [usingCloud, member]);

  useEffect(() => {
    if (!usingCloud) {
      saveJson(BIDS_KEY, bids);
    }
  }, [bids, usingCloud]);

  useEffect(() => {
    if (!usingCloud) {
      saveJson(BLACKLIST_KEY, blacklist);
    }
  }, [blacklist, usingCloud]);

  useEffect(() => {
    if (!usingCloud) {
      saveJson(POSTS_KEY, postsByBoard);
    }
  }, [postsByBoard, usingCloud]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addBid = useCallback(
    async (bid: Omit<BidPost, "id" | "date">) => {
      if (usingCloud && supabase && member?.id) {
        await supabase.from("bids").insert({
          author_id: member.id,
          title: bid.title,
          trade_needed: bid.tradeNeeded,
          location: bid.location,
          details: bid.details,
          contact: bid.contact,
        });
        await refresh();
        return;
      }
      const next: BidPost = {
        ...bid,
        id: `bid-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      };
      setBids((prev) => [next, ...prev]);
    },
    [usingCloud, member, refresh],
  );

  const submitBlacklist = useCallback(
    async (
      entry: Omit<BlacklistEntry, "id" | "date" | "status" | "reviewedBy" | "reviewedDate">,
    ) => {
      if (usingCloud && supabase && member?.id) {
        await supabase.from("blacklist_entries").insert({
          party_type: entry.partyType,
          name: entry.name,
          company: entry.company,
          reason: entry.reason,
          reporter_id: member.id,
          status: "pending",
        });
        await refresh();
        return;
      }
      const next: BlacklistEntry = {
        ...entry,
        id: `bl-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        status: "pending",
      };
      setBlacklist((prev) => [next, ...prev]);
    },
    [usingCloud, member, refresh],
  );

  const approveBlacklist = useCallback(
    async (id: string, _reviewedBy: string) => {
      if (usingCloud && supabase && member?.id) {
        await supabase
          .from("blacklist_entries")
          .update({
            status: "approved",
            reviewed_by: member.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);
        await refresh();
        return;
      }
      const reviewedDate = new Date().toISOString().slice(0, 10);
      setBlacklist((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, status: "approved" as const, reviewedBy: _reviewedBy, reviewedDate }
            : entry,
        ),
      );
    },
    [usingCloud, member, refresh],
  );

  const rejectBlacklist = useCallback(
    async (id: string, _reviewedBy: string) => {
      if (usingCloud && supabase && member?.id) {
        await supabase
          .from("blacklist_entries")
          .update({
            status: "rejected",
            reviewed_by: member.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);
        await refresh();
        return;
      }
      const reviewedDate = new Date().toISOString().slice(0, 10);
      setBlacklist((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, status: "rejected" as const, reviewedBy: _reviewedBy, reviewedDate }
            : entry,
        ),
      );
    },
    [usingCloud, member, refresh],
  );

  const addBoardPost = useCallback(
    async (boardId: string, post: Omit<BoardPost, "id" | "date">) => {
      if (usingCloud && supabase && member?.id) {
        await supabase.from("board_posts").insert({
          board_id: boardId,
          author_id: member.id,
          title: post.title,
          body: post.body,
        });
        await refresh();
        return;
      }
      const next: BoardPost = {
        ...post,
        id: `${boardId}-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      };
      setPostsByBoard((prev) => ({
        ...prev,
        [boardId]: [next, ...(prev[boardId] ?? [])],
      }));
    },
    [usingCloud, member, refresh],
  );

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
    loading,
    addBid,
    submitBlacklist,
    approveBlacklist,
    rejectBlacklist,
    addBoardPost,
    refresh,
  };
}
