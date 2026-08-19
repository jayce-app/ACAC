import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { BidPost, ForumPost, BoardPost } from "./content";
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
const FORUM_KEY = "acac-forum-v1";
const LEGACY_FORUM_KEY = "acac-blacklist-v2";
const POSTS_KEY = "acac-board-posts-v1";

const emptyPosts = () =>
  Object.fromEntries(discussionBoards.map((b) => [b.id, [] as BoardPost[]]));

function toForumPost(raw: unknown): ForumPost | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const title = String(item.title ?? item.name ?? "").trim();
  const body = String(item.body ?? item.reason ?? "").trim();
  if (!title && !body) return null;
  const status = item.status;
  return {
    id: String(item.id ?? `forum-${Date.now()}`),
    title: title || "Untitled post",
    body,
    date: String(item.date ?? new Date().toISOString().slice(0, 10)),
    status:
      status === "pending" || status === "approved" || status === "rejected"
        ? status
        : "approved",
  };
}

function loadLocalForum(): ForumPost[] {
  const current = loadJson<unknown[]>(FORUM_KEY, []);
  if (current.length) {
    return current.map(toForumPost).filter((p): p is ForumPost => Boolean(p));
  }
  const legacy = loadJson<unknown[]>(LEGACY_FORUM_KEY, []);
  return legacy.map(toForumPost).filter((p): p is ForumPost => Boolean(p));
}

export function useMemberTools() {
  const { member } = useAuth();
  const usingCloud = isSupabaseConfigured;

  const [bids, setBids] = useState<BidPost[]>(() =>
    usingCloud ? [] : loadJson(BIDS_KEY, []),
  );
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() =>
    usingCloud ? [] : loadLocalForum(),
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

    const [bidsRes, forumRes, postsRes] = await Promise.all([
      supabase
        .from("bids")
        .select("*, profiles:author_id(full_name, company)")
        .order("created_at", { ascending: false }),
      supabase
        .from("blacklist_entries")
        .select("id, name, company, reason, status, created_at")
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

    if (forumRes.data) {
      setForumPosts(
        forumRes.data
          .map((row) =>
            toForumPost({
              id: row.id,
              title: row.name,
              body: [row.company, row.reason].filter(Boolean).join("\n\n"),
              date: String(row.created_at).slice(0, 10),
              status: row.status,
            }),
          )
          .filter((p): p is ForumPost => Boolean(p)),
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
      saveJson(FORUM_KEY, forumPosts);
    }
  }, [forumPosts, usingCloud]);

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

  const submitForumPost = useCallback(
    async (entry: Pick<ForumPost, "title" | "body">) => {
      if (usingCloud && supabase && member?.id) {
        await supabase.from("blacklist_entries").insert({
          party_type: "contractor",
          name: entry.title,
          company: "",
          reason: entry.body,
          reporter_id: member.id,
          status: "approved",
        });
        await refresh();
        return;
      }
      const next: ForumPost = {
        id: `forum-${Date.now()}`,
        title: entry.title,
        body: entry.body,
        date: new Date().toISOString().slice(0, 10),
        status: "approved",
      };
      setForumPosts((prev) => [next, ...prev]);
    },
    [usingCloud, member, refresh],
  );

  const approveForumPost = useCallback(
    async (id: string) => {
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
      setForumPosts((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status: "approved" as const } : entry,
        ),
      );
    },
    [usingCloud, member, refresh],
  );

  const removeForumPost = useCallback(
    async (id: string) => {
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
      setForumPosts((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status: "rejected" as const } : entry,
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

  const liveForumPosts = useMemo(
    () => forumPosts.filter((e) => e.status === "approved"),
    [forumPosts],
  );

  const pendingForumPosts = useMemo(
    () => forumPosts.filter((e) => e.status === "pending"),
    [forumPosts],
  );

  return {
    bids,
    forumPosts,
    liveForumPosts,
    pendingForumPosts,
    postsByBoard,
    loading,
    addBid,
    submitForumPost,
    approveForumPost,
    removeForumPost,
    addBoardPost,
    refresh,
  };
}
