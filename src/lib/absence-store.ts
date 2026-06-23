import { useSyncExternalStore } from "react";
import { participants, CURRENT_PARTICIPANT_ID } from "./mock-data";
import { notifyParticipant, notifyCoach, notifyAdmin } from "./notifications-store";
import { setAttendance } from "./planning-store";

export type AbsenceType =
  | "medical"
  | "personal"
  | "family"
  | "administrative"
  | "other";

export type AbsencePeriod = "morning" | "afternoon" | "full";
export type AbsenceMode = "in-person" | "remote" | "absent";
export type AbsenceStatus = "pending" | "approved" | "rejected" | "info-requested";

export interface AbsenceAttachment {
  name: string;
  type: string;
  /** data URL */
  dataUrl: string;
  size: number;
}

export interface AbsenceRequest {
  id: string;
  participantId: string;
  participantName: string;
  department: string;
  coach: string;
  type: AbsenceType;
  date: string; // YYYY-MM-DD
  period: AbsencePeriod;
  mode: AbsenceMode;
  message: string;
  attachment?: AbsenceAttachment;
  status: AbsenceStatus;
  createdAt: number;
  decidedAt?: number;
  adminNote?: string;
}

let items: AbsenceRequest[] = [];
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

export function useAbsences() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let n = 0;
const newId = () => `abs_${Date.now().toString(36)}_${++n}`;

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function createAbsenceRequest(input: {
  participantId: string;
  type: AbsenceType;
  date: string;
  period: AbsencePeriod;
  mode: AbsenceMode;
  message: string;
  attachment?: AbsenceAttachment;
}): AbsenceRequest {
  const p = participants.find((x) => x.id === input.participantId);
  const req: AbsenceRequest = {
    id: newId(),
    participantId: input.participantId,
    participantName: p?.name ?? "Unknown",
    department: p?.department ?? "—",
    coach: p?.coach ?? "—",
    type: input.type,
    date: input.date,
    period: input.period,
    mode: input.mode,
    message: input.message,
    attachment: input.attachment,
    status: "pending",
    createdAt: Date.now(),
  };
  items = [req, ...items];
  emit();

  // Notify admin + coach
  notifyAdmin({
    type: "info",
    action: "absence.new",
    title: `New absence request — ${req.participantName}`,
    description: `${fmtDate(req.date)} · ${input.period} · ${typeLabel(req.type)}`,
    participantId: req.participantId,
    coach: req.coach,
  });
  notifyCoach(req.coach, {
    type: "info",
    action: "absence.new",
    title: `${req.participantName} requested an absence`,
    description: `${fmtDate(req.date)} · ${input.period}`,
    participantId: req.participantId,
  });
  return req;
}

function applyExcusedAttendance(req: AbsenceRequest) {
  const excused = { mode: "off" as const, status: "excused" as const };
  if (req.period === "morning" || req.period === "full") {
    setAttendance(req.participantId, req.date, { morning: excused });
  }
  if (req.period === "afternoon" || req.period === "full") {
    setAttendance(req.participantId, req.date, { afternoon: excused });
  }
}

export function approveAbsence(id: string, note?: string) {
  const req = items.find((r) => r.id === id);
  if (!req) return;
  items = items.map((r) =>
    r.id === id ? { ...r, status: "approved", decidedAt: Date.now(), adminNote: note } : r,
  );
  emit();
  applyExcusedAttendance({ ...req, status: "approved" });
  notifyParticipant(req.participantId, {
    type: "success",
    action: "absence.approved",
    title: "Absence request approved",
    description: `${fmtDate(req.date)} · ${req.period} — marked as excused.`,
  });
  notifyCoach(req.coach, {
    type: "success",
    action: "absence.approved",
    title: `Absence approved — ${req.participantName}`,
    description: `${fmtDate(req.date)} · ${req.period}`,
    participantId: req.participantId,
  });
}

export function rejectAbsence(id: string, note?: string) {
  const req = items.find((r) => r.id === id);
  if (!req) return;
  items = items.map((r) =>
    r.id === id ? { ...r, status: "rejected", decidedAt: Date.now(), adminNote: note } : r,
  );
  emit();
  notifyParticipant(req.participantId, {
    type: "warning",
    action: "absence.rejected",
    title: "Absence request rejected",
    description: note ? note : `${fmtDate(req.date)} · ${req.period}`,
  });
  notifyCoach(req.coach, {
    type: "warning",
    action: "absence.rejected",
    title: `Absence rejected — ${req.participantName}`,
    description: `${fmtDate(req.date)} · ${req.period}`,
    participantId: req.participantId,
  });
}

export function requestMoreInfo(id: string, note: string) {
  const req = items.find((r) => r.id === id);
  if (!req) return;
  items = items.map((r) =>
    r.id === id ? { ...r, status: "info-requested", adminNote: note } : r,
  );
  emit();
  notifyParticipant(req.participantId, {
    type: "info",
    action: "absence.info",
    title: "More information requested for your absence",
    description: note,
  });
}

export function getAbsencesForParticipant(participantId: string) {
  return items.filter((r) => r.participantId === participantId);
}

export function getAbsencesForCoach(coach: string) {
  return items.filter((r) => r.coach === coach);
}

export function typeLabel(t: AbsenceType): string {
  switch (t) {
    case "medical": return "Medical appointment";
    case "personal": return "Personal reason";
    case "family": return "Family emergency";
    case "administrative": return "Administrative appointment";
    case "other": return "Other";
  }
}

// Seed one example
createAbsenceRequest({
  participantId: CURRENT_PARTICIPANT_ID,
  type: "medical",
  date: new Date(Date.now() + 86_400_000 * 2).toISOString().slice(0, 10),
  period: "morning",
  mode: "remote",
  message: "Doctor appointment scheduled in the morning. Will join sessions remotely after lunch.",
});
