import { useCallback, useEffect, useState } from "react";
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
const BLACKLIST_KEY = "acac-blacklist-v1";
const POSTS_KEY = "acac-board-posts-v1";

const emptyPosts = () =>
  Object.fromEntries(discussionBoards.map((b) => [b.id, [] as BoardPost[]]));

export function useMemberTools() {
  const [bids, setBids] = useState<BidPost[]>(() => loadJson(BIDS_KEY, []));
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() =>
    loadJson(BLACKLIST_KEY, []),
  );
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

  const addBlacklist = useCallback((entry: Omit<BlacklistEntry, "id" | "date">) => {
    const next: BlacklistEntry = {
      ...entry,
      id: `bl-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    setBlacklist((prev) => [next, ...prev]);
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

  return {
    bids,
    blacklist,
    postsByBoard,
    addBid,
    addBlacklist,
    addBoardPost,
  };
}
