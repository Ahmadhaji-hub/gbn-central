import { useSyncExternalStore } from "react";
import {
  participants as seedParticipants,
  coaches as seedCoaches,
  departments as seedDepartments,
  type Participant,
  type ParticipantStatus,
} from "./mock-data";

export type Coach = {
  id: string;
  name: string;
  email: string;
  participants: number;
  department: string;
};

export type Department = {
  id: string;
  name: string;
  lead: string;
  members: number;
};

type State = {
  participants: Participant[];
  coaches: Coach[];
  departments: Department[];
};

let state: State = {
  participants: [...seedParticipants],
  coaches: [...seedCoaches],
  departments: [...seedDepartments],
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => {
  // recompute participant counts on coaches
  state = {
    ...state,
    coaches: state.coaches.map((c) => ({
      ...c,
      participants: state.participants.filter((p) => p.coach === c.name).length,
    })),
    departments: state.departments.map((d) => ({
      ...d,
      members: state.participants.filter((p) => p.department === d.name).length,
    })),
  };
  listeners.forEach((l) => l());
};

const getSnapshot = () => state;

export function useAdminStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;

// ---- Participants ----
export const addParticipant = (p: Omit<Participant, "id" | "avatar" | "remainingDays" | "progress" | "submittedDocs"> & Partial<Pick<Participant, "submittedDocs" | "progress">>) => {
  const initials = p.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const remaining = Math.max(0, Math.ceil((+new Date(p.endDate) - Date.now()) / 86400000));
  const np: Participant = {
    id: uid("p"),
    avatar: initials,
    remainingDays: remaining,
    submittedDocs: p.submittedDocs ?? 0,
    progress: p.progress ?? 0,
    ...p,
  } as Participant;
  state = { ...state, participants: [np, ...state.participants] };
  emit();
};

export const updateParticipant = (id: string, patch: Partial<Participant>) => {
  state = {
    ...state,
    participants: state.participants.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p, ...patch };
      if (patch.endDate) {
        next.remainingDays = Math.max(0, Math.ceil((+new Date(patch.endDate) - Date.now()) / 86400000));
      }
      return next;
    }),
  };
  emit();
};

export const deleteParticipant = (id: string) => {
  state = { ...state, participants: state.participants.filter((p) => p.id !== id) };
  emit();
};

// ---- Coaches ----
export const addCoach = (c: Omit<Coach, "id" | "participants">) => {
  state = { ...state, coaches: [{ ...c, id: uid("c"), participants: 0 }, ...state.coaches] };
  emit();
};

export const updateCoach = (id: string, patch: Partial<Coach>) => {
  const prev = state.coaches.find((c) => c.id === id);
  state = {
    ...state,
    coaches: state.coaches.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    // if coach name changed, propagate to participants & departments
    participants:
      prev && patch.name && patch.name !== prev.name
        ? state.participants.map((p) => (p.coach === prev.name ? { ...p, coach: patch.name! } : p))
        : state.participants,
    departments:
      prev && patch.name && patch.name !== prev.name
        ? state.departments.map((d) => (d.lead === prev.name ? { ...d, lead: patch.name! } : d))
        : state.departments,
  };
  emit();
};

export const deleteCoach = (id: string) => {
  const c = state.coaches.find((x) => x.id === id);
  state = {
    ...state,
    coaches: state.coaches.filter((x) => x.id !== id),
    participants: c ? state.participants.map((p) => (p.coach === c.name ? { ...p, coach: "Unassigned" } : p)) : state.participants,
  };
  emit();
};

// ---- Departments ----
export const addDepartment = (d: Omit<Department, "id" | "members">) => {
  state = { ...state, departments: [{ ...d, id: uid("d"), members: 0 }, ...state.departments] };
  emit();
};

export const updateDepartment = (id: string, patch: Partial<Department>) => {
  const prev = state.departments.find((d) => d.id === id);
  state = {
    ...state,
    departments: state.departments.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    participants:
      prev && patch.name && patch.name !== prev.name
        ? state.participants.map((p) => (p.department === prev.name ? { ...p, department: patch.name! } : p))
        : state.participants,
    coaches:
      prev && patch.name && patch.name !== prev.name
        ? state.coaches.map((c) => (c.department === prev.name ? { ...c, department: patch.name! } : c))
        : state.coaches,
  };
  emit();
};

export const deleteDepartment = (id: string) => {
  const d = state.departments.find((x) => x.id === id);
  state = {
    ...state,
    departments: state.departments.filter((x) => x.id !== id),
    participants: d ? state.participants.map((p) => (p.department === d.name ? { ...p, department: "Unassigned" } : p)) : state.participants,
    coaches: d ? state.coaches.map((c) => (c.department === d.name ? { ...c, department: "Unassigned" } : c)) : state.coaches,
  };
  emit();
};

export type { Participant, ParticipantStatus };
