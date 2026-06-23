import { useSyncExternalStore } from "react";
import { allNotifications, participants, CURRENT_COACH, CURRENT_PARTICIPANT_ID } from "./mock-data";

export type NotifType = "info" | "success" | "warning";
export type Audience = "coach" | "participant" | "admin";

/** Single shared admin recipient identifier */
export const ADMIN_RECIPIENT = "admin";

export interface AppNotification {
  id: string;
  audience: Audience;
  /** coach name (when audience='coach') or participant id (when audience='participant') */
  recipient: string;
  title: string;
  description?: string;
  time: string; // human time
  createdAt: number;
  type: NotifType;
  read: boolean;
  /** Related participant id, if applicable */
  participantId?: string;
  /** Source coach name */
  coach?: string;
  action?: string;
}

// ---------- Seed: convert legacy coach-side notifications ----------

function seed(): AppNotification[] {
  const out: AppNotification[] = [];
  let i = 0;
  const now = Date.now();
  for (const n of allNotifications) {
    const matched = participants.find((p) => n.title.includes(p.name));
    out.push({
      id: `seed_${++i}`,
      audience: "coach",
      recipient: matched?.coach ?? CURRENT_COACH,
      title: n.title,
      time: n.time,
      createdAt: now - i * 60_000,
      type: n.type,
      read: i > 4, // older ones already read
      participantId: matched?.id,
      coach: matched?.coach,
    });
  }
  // A couple of pre-existing participant notifications so the page isn't empty
  out.push({
    id: "pseed_1",
    audience: "participant",
    recipient: CURRENT_PARTICIPANT_ID,
    title: "Your monthly plan was published",
    description: "Fatima Zouhra published your May 2026 coaching plan.",
    time: "Yesterday",
    createdAt: now - 86_400_000,
    type: "info",
    read: true,
    participantId: CURRENT_PARTICIPANT_ID,
    coach: "Fatima Zouhra",
    action: "plan.publish",
  });
  out.push({
    id: "pseed_2",
    audience: "participant",
    recipient: CURRENT_PARTICIPANT_ID,
    title: "Coaching session confirmed — Wed 14:00",
    description: "Security review & advanced track planning · Room 4B",
    time: "1 hr ago",
    createdAt: now - 3_600_000,
    type: "info",
    read: false,
    participantId: CURRENT_PARTICIPANT_ID,
    coach: "Fatima Zouhra",
    action: "session.confirm",
  });
  return out;
}

let items: AppNotification[] = seed();
const listeners = new Set<() => void>();
const emit = () => {
  items = [...items];
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => items;

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let nid = 0;
function newId() {
  return `n_${Date.now().toString(36)}_${++nid}`;
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function pushNotification(n: Omit<AppNotification, "id" | "createdAt" | "time" | "read"> & {
  read?: boolean;
}) {
  const createdAt = Date.now();
  const entry: AppNotification = {
    ...n,
    id: newId(),
    createdAt,
    time: relativeTime(createdAt),
    read: n.read ?? false,
  };
  items = [entry, ...items];
  emit();
}

export function markRead(id: string) {
  let changed = false;
  items = items.map((n) => {
    if (n.id === id && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) emit();
}

export function markAllRead(audience: Audience, recipient: string) {
  let changed = false;
  items = items.map((n) => {
    if (n.audience === audience && n.recipient === recipient && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) emit();
}

export function getNotificationsFor(audience: Audience, recipient: string) {
  return items
    .filter((n) => n.audience === audience && n.recipient === recipient)
    .map((n) => ({ ...n, time: relativeTime(n.createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function unreadCountFor(audience: Audience, recipient: string) {
  return items.filter(
    (n) => n.audience === audience && n.recipient === recipient && !n.read,
  ).length;
}

// -------- High-level helpers used by coach actions --------

export function notifyParticipant(
  participantId: string,
  payload: {
    title: string;
    description?: string;
    type?: NotifType;
    coach?: string;
    action?: string;
  },
) {
  pushNotification({
    audience: "participant",
    recipient: participantId,
    participantId,
    coach: payload.coach ?? CURRENT_COACH,
    title: payload.title,
    description: payload.description,
    type: payload.type ?? "info",
    action: payload.action,
  });
}

export function notifyCoach(
  coachName: string,
  payload: {
    title: string;
    description?: string;
    type?: NotifType;
    participantId?: string;
    action?: string;
  },
) {
  pushNotification({
    audience: "coach",
    recipient: coachName,
    participantId: payload.participantId,
    coach: coachName,
    title: payload.title,
    description: payload.description,
    type: payload.type ?? "info",
    action: payload.action,
  });
}

export function notifyAdmin(payload: {
  title: string;
  description?: string;
  type?: NotifType;
  participantId?: string;
  coach?: string;
  action?: string;
}) {
  pushNotification({
    audience: "admin",
    recipient: ADMIN_RECIPIENT,
    participantId: payload.participantId,
    coach: payload.coach,
    title: payload.title,
    description: payload.description,
    type: payload.type ?? "info",
    action: payload.action,
  });
}
