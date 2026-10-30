import type { EmployeeInvite } from "./types";

export function inviteIsOpen(invite: EmployeeInvite, now = new Date()) {
  if (invite.acceptedAt) return false;
  return new Date(invite.expiresAt).getTime() > now.getTime();
}

export function inviteJoinPath(token: string) {
  return `/employee/join?token=${encodeURIComponent(token)}`;
}

export function inviteJoinUrl(token: string) {
  if (typeof window === "undefined") return inviteJoinPath(token);
  return `${window.location.origin}${inviteJoinPath(token)}`;
}

export function expiresInDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
