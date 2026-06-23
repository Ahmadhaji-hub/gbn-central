import { useSyncExternalStore } from "react";
import {
  coachingSessions as seedSessions,
  monthlyPlans as seedPlans,
  participants,
  TODAY,
  type CoachingSession,
  type MonthlyPlanEntry,
  type SessionType,
  type SessionStatus,
} from "./mock-data";
import { notifyParticipant } from "./notifications-store";

function fmtHumanDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
function modeLabel(m: AttendanceMode) {
  return m === "in-person" ? "in-person" : m === "remote" ? "remote" : "off";
}

// ---------------- Types ----------------

export type AttendanceMode = "in-person" | "remote" | "off";
export type AttendanceStatus = "planned" | "present" | "absent" | "excused";

export interface AttendanceHalf {
  mode: AttendanceMode;
  status: AttendanceStatus;
}

export interface AttendanceDay {
  participantId: string;
  date: string; // YYYY-MM-DD
  morning: AttendanceHalf;
  afternoon: AttendanceHalf;
  note?: string;
}

export type { CoachingSession, MonthlyPlanEntry, SessionType, SessionStatus };

type State = {
  sessions: CoachingSession[];
  plans: MonthlyPlanEntry[];
  attendance: AttendanceDay[];
};

// ---------------- Seed attendance ----------------

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function startOfWeek(date = new Date(TODAY + "T00:00:00")) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - day);
  return d;
}

export function weekDays(start: Date): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return isoDate(d);
  });
}

const PATTERNS: Record<string, [AttendanceMode, AttendanceMode][]> = {
  // mon..fri pairs of [morning, afternoon]
  hybrid_a: [
    ["in-person", "remote"],
    ["in-person", "in-person"],
    ["remote", "remote"],
    ["in-person", "remote"],
    ["remote", "off"],
  ],
  hybrid_b: [
    ["remote", "in-person"],
    ["in-person", "in-person"],
    ["in-person", "remote"],
    ["remote", "in-person"],
    ["in-person", "off"],
  ],
  onsite: [
    ["in-person", "in-person"],
    ["in-person", "in-person"],
    ["in-person", "in-person"],
    ["in-person", "in-person"],
    ["in-person", "off"],
  ],
  remote: [
    ["remote", "remote"],
    ["remote", "remote"],
    ["remote", "remote"],
    ["remote", "remote"],
    ["remote", "off"],
  ],
};

const PARTICIPANT_PATTERN: Record<string, keyof typeof PATTERNS> = {
  p1: "hybrid_a", p2: "hybrid_b", p3: "onsite",
  p4: "onsite", p5: "remote",
  p6: "hybrid_a", p7: "hybrid_b",
  p8: "hybrid_a",
  p9: "onsite", p10: "remote",
  p11: "hybrid_b", p12: "remote", p13: "hybrid_a",
};

function seedAttendance(): AttendanceDay[] {
  const out: AttendanceDay[] = [];
  const start = startOfWeek();
  const days = weekDays(start);
  for (const p of participants) {
    const pat = PATTERNS[PARTICIPANT_PATTERN[p.id] ?? "hybrid_a"];
    days.forEach((date, i) => {
      const [m, a] = pat[i];
      const past = date < TODAY;
      const status: AttendanceStatus = past
        ? p.status === "at-risk" && i === 1
          ? "absent"
          : "present"
        : "planned";
      out.push({
        participantId: p.id,
        date,
        morning: { mode: m, status: m === "off" ? "excused" : status },
        afternoon: { mode: a, status: a === "off" ? "excused" : status },
      });
    });
  }
  return out;
}

// ---------------- Store ----------------

let state: State = {
  sessions: [...seedSessions],
  plans: [...seedPlans],
  attendance: seedAttendance(),
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => {
  state = { ...state };
  listeners.forEach((l) => l());
};
const getSnapshot = () => state;

export function usePlanning() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---------------- Sessions ----------------

let sid = seedSessions.length;
const newId = (prefix: string) => `${prefix}${++sid}_${Date.now().toString(36)}`;

export function createSession(s: Omit<CoachingSession, "id">) {
  state.sessions = [...state.sessions, { ...s, id: newId("s") }];
  emit();
  notifyParticipant(s.participantId, {
    coach: s.coach,
    type: "info",
    action: "session.create",
    title: `New coaching session — ${fmtHumanDate(s.date)} ${s.time}`,
    description: `${s.coach} scheduled a ${s.type === "video" ? "video" : "in-person"} session: ${s.objective}`,
  });
}
export function updateSession(id: string, patch: Partial<CoachingSession>) {
  const before = state.sessions.find((s) => s.id === id);
  state.sessions = state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s));
  emit();
  if (!before) return;
  const after = { ...before, ...patch };
  if (patch.status === "completed") {
    notifyParticipant(after.participantId, {
      coach: after.coach,
      type: "success",
      action: "session.completed",
      title: `Session marked attended — ${fmtHumanDate(after.date)}`,
      description: after.objective,
    });
  } else if (patch.date || patch.time || patch.location || patch.type) {
    notifyParticipant(after.participantId, {
      coach: after.coach,
      type: "info",
      action: "session.update",
      title: `Coaching session moved to ${fmtHumanDate(after.date)} ${after.time}`,
      description: `${after.type === "video" ? "Video call" : "In-person"} · ${after.location}`,
    });
  } else if (patch.notes !== undefined) {
    notifyParticipant(after.participantId, {
      coach: after.coach,
      type: "info",
      action: "session.note",
      title: `${after.coach} added coaching notes`,
      description: after.notes,
    });
  }
}
export function deleteSession(id: string) {
  const before = state.sessions.find((s) => s.id === id);
  state.sessions = state.sessions.filter((s) => s.id !== id);
  emit();
  if (before) {
    notifyParticipant(before.participantId, {
      coach: before.coach,
      type: "warning",
      action: "session.delete",
      title: `Coaching session cancelled — ${fmtHumanDate(before.date)} ${before.time}`,
      description: before.objective,
    });
  }
}

// ---------------- Plans ----------------

export function upsertPlan(plan: Omit<MonthlyPlanEntry, "id"> & { id?: string }) {
  const existing = state.plans.find(
    (p) => p.participantId === plan.participantId && p.month === plan.month,
  );
  if (existing) {
    state.plans = state.plans.map((p) =>
      p.id === existing.id ? { ...existing, ...plan, id: existing.id } : p,
    );
  } else {
    state.plans = [...state.plans, { ...plan, id: newId("mp") }];
  }
  emit();
  notifyParticipant(plan.participantId, {
    coach: plan.coach,
    type: "info",
    action: "plan.update",
    title: existing
      ? `${plan.coach} updated your monthly plan`
      : `${plan.coach} published your monthly plan`,
    description: plan.focus,
  });
}

// ---------------- Attendance ----------------

export function getAttendance(participantId: string, date: string): AttendanceDay {
  return (
    state.attendance.find((a) => a.participantId === participantId && a.date === date) ?? {
      participantId,
      date,
      morning: { mode: "in-person", status: "planned" },
      afternoon: { mode: "in-person", status: "planned" },
    }
  );
}

export function setAttendance(
  participantId: string,
  date: string,
  patch: Partial<Omit<AttendanceDay, "participantId" | "date">>,
) {
  const idx = state.attendance.findIndex(
    (a) => a.participantId === participantId && a.date === date,
  );
  if (idx === -1) {
    state.attendance = [
      ...state.attendance,
      { ...getAttendance(participantId, date), ...patch },
    ];
  } else {
    const cur = state.attendance[idx];
    state.attendance = [
      ...state.attendance.slice(0, idx),
      { ...cur, ...patch, morning: { ...cur.morning, ...(patch.morning ?? {}) }, afternoon: { ...cur.afternoon, ...(patch.afternoon ?? {}) } },
      ...state.attendance.slice(idx + 1),
    ];
  }
  emit();
  const updated = state.attendance.find(
    (a) => a.participantId === participantId && a.date === date,
  )!;
  if (patch.note !== undefined) {
    notifyParticipant(participantId, {
      type: "info",
      action: "attendance.note",
      title: `Coach added a note for ${fmtHumanDate(date)}`,
      description: patch.note,
    });
  } else {
    notifyParticipant(participantId, {
      type:
        patch.morning?.status === "absent" || patch.afternoon?.status === "absent"
          ? "warning"
          : "info",
      action: "attendance.update",
      title: `Attendance updated — ${fmtHumanDate(date)}`,
      description: `Morning ${modeLabel(updated.morning.mode)} (${updated.morning.status}) · Afternoon ${modeLabel(updated.afternoon.mode)} (${updated.afternoon.status})`,
    });
  }
}

export function getWeekAttendance(participantId: string, weekStart: Date) {
  return weekDays(weekStart).map((d) => getAttendance(participantId, d));
}
