export type ParticipantStatus = "active" | "at-risk" | "completed" | "pending";

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  program: string;
  coach: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  status: ParticipantStatus;
  requiredDocs: number;
  submittedDocs: number;
  progress: number;
  department: string;
}

const initials = (name: string) =>
  name
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]!.toUpperCase())
    .slice(0, 2)
    .join("");

const email = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.+|\.+$/g, "")}@gbnews.org`;

export const participants: Participant[] = [
  // IT — Fatima Zouhra
  {
    id: "p1",
    name: "Ahmad Haji",
    email: email("Ahmad Haji"),
    avatar: initials("Ahmad Haji"),
    program: "IT Onboarding",
    coach: "Fatima Zouhra",
    startDate: "2026-02-01",
    endDate: "2026-08-01",
    remainingDays: 85,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 8,
    progress: 85,
    department: "IT",
  },
  {
    id: "p2",
    name: "Antoine Evray",
    email: email("Antoine Evray"),
    avatar: initials("Antoine Evray"),
    program: "IT Operations",
    coach: "Fatima Zouhra",
    startDate: "2026-01-10",
    endDate: "2026-06-10",
    remainingDays: 33,
    status: "at-risk",
    requiredDocs: 8,
    submittedDocs: 5,
    progress: 35,
    department: "IT",
  },
  {
    id: "p3",
    name: "Benia Mohammed Lamin",
    email: email("Benia Mohammed Lamin"),
    avatar: "BL",
    program: "IT Onboarding",
    coach: "Fatima Zouhra",
    startDate: "2026-04-20",
    endDate: "2026-10-20",
    remainingDays: 165,
    status: "pending",
    requiredDocs: 8,
    submittedDocs: 2,
    progress: 5,
    department: "IT",
  },

  // Administration — Fernanda Guerrero
  {
    id: "p4",
    name: "Vasco Vieira",
    email: email("Vasco Vieira"),
    avatar: initials("Vasco Vieira"),
    program: "Administration Track",
    coach: "Fernanda Guerrero",
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    remainingDays: 68,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 7,
    progress: 60,
    department: "Administration",
  },
  {
    id: "p5",
    name: "Roberto PALMAS",
    email: email("Roberto Palmas"),
    avatar: initials("Roberto Palmas"),
    program: "Administration Track",
    coach: "Fernanda Guerrero",
    startDate: "2025-09-01",
    endDate: "2026-03-01",
    remainingDays: 0,
    status: "completed",
    requiredDocs: 8,
    submittedDocs: 8,
    progress: 100,
    department: "Administration",
  },

  // Project Managing — Soufian HIHI
  {
    id: "p6",
    name: "Nina Nina",
    email: email("Nina Nina"),
    avatar: "NN",
    program: "Project Management Foundations",
    coach: "Soufian HIHI",
    startDate: "2026-02-15",
    endDate: "2026-08-15",
    remainingDays: 99,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 6,
    progress: 50,
    department: "Project Managing",
  },
  {
    id: "p7",
    name: "Elham Elham",
    email: email("Elham Elham"),
    avatar: "EE",
    program: "Project Management Foundations",
    coach: "Soufian HIHI",
    startDate: "2025-11-15",
    endDate: "2026-05-15",
    remainingDays: 7,
    status: "at-risk",
    requiredDocs: 8,
    submittedDocs: 4,
    progress: 62,
    department: "Project Managing",
  },

  // Marketing — Sandrina Barroso
  {
    id: "p8",
    name: "Paul Richard",
    email: email("Paul Richard"),
    avatar: initials("Paul Richard"),
    program: "Marketing Essentials",
    coach: "Sandrina Barroso",
    startDate: "2026-03-01",
    endDate: "2026-09-01",
    remainingDays: 116,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 6,
    progress: 40,
    department: "Marketing",
  },

  // Commerce — Junior Mazolo
  {
    id: "p9",
    name: "Patrick SALIMOU",
    email: email("Patrick Salimou"),
    avatar: initials("Patrick Salimou"),
    program: "Commerce Track",
    coach: "Junior Mazolo",
    startDate: "2026-01-20",
    endDate: "2026-07-20",
    remainingDays: 73,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 7,
    progress: 70,
    department: "Commerce",
  },
  {
    id: "p10",
    name: "Claudin Checks",
    email: email("Claudin Checks"),
    avatar: initials("Claudin Checks"),
    program: "Commerce Track",
    coach: "Junior Mazolo",
    startDate: "2026-02-10",
    endDate: "2026-08-10",
    remainingDays: 94,
    status: "pending",
    requiredDocs: 8,
    submittedDocs: 2,
    progress: 12,
    department: "Commerce",
  },

  // Dev — Régis Boesch
  {
    id: "p11",
    name: "Oleh Didyk",
    email: email("Oleh Didyk"),
    avatar: initials("Oleh Didyk"),
    program: "Engineering Track",
    coach: "Régis Boesch",
    startDate: "2026-01-05",
    endDate: "2026-07-05",
    remainingDays: 58,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 8,
    progress: 80,
    department: "Dev",
  },
  {
    id: "p12",
    name: "Yuri Heymann",
    email: email("Yuri Heymann"),
    avatar: initials("Yuri Heymann"),
    program: "Engineering Track",
    coach: "Régis Boesch",
    startDate: "2026-02-20",
    endDate: "2026-08-20",
    remainingDays: 104,
    status: "active",
    requiredDocs: 8,
    submittedDocs: 6,
    progress: 55,
    department: "Dev",
  },
  {
    id: "p13",
    name: "Romain Romain",
    email: email("Romain Romain"),
    avatar: "RR",
    program: "Engineering Track",
    coach: "Régis Boesch",
    startDate: "2025-12-01",
    endDate: "2026-06-01",
    remainingDays: 24,
    status: "at-risk",
    requiredDocs: 8,
    submittedDocs: 5,
    progress: 45,
    department: "Dev",
  },
];

export const coaches = [
  { id: "c1", name: "Fatima Zouhra", email: email("Fatima Zouhra"), participants: 3, department: "IT" },
  { id: "c2", name: "Fernanda Guerrero", email: email("Fernanda Guerrero"), participants: 2, department: "Administration" },
  { id: "c3", name: "Soufian HIHI", email: email("Soufian Hihi"), participants: 2, department: "Project Managing" },
  { id: "c4", name: "Sandrina Barroso", email: email("Sandrina Barroso"), participants: 1, department: "Marketing" },
  { id: "c5", name: "Junior Mazolo", email: email("Junior Mazolo"), participants: 2, department: "Commerce" },
  { id: "c6", name: "Régis Boesch", email: email("Regis Boesch"), participants: 3, department: "Dev" },
];

export const departments = [
  { id: "d1", name: "IT", lead: "Fatima Zouhra", members: 3 },
  { id: "d2", name: "Administration", lead: "Fernanda Guerrero", members: 2 },
  { id: "d3", name: "Project Managing", lead: "Soufian HIHI", members: 2 },
  { id: "d4", name: "Marketing", lead: "Sandrina Barroso", members: 1 },
  { id: "d5", name: "Commerce", lead: "Junior Mazolo", members: 2 },
  { id: "d6", name: "Dev", lead: "Régis Boesch", members: 3 },
];

export const todaySchedule = [
  { time: "09:00", title: "1:1 with Ahmad Haji", type: "meeting", location: "Room 4B" },
  { time: "10:30", title: "IT operations review", type: "session", location: "Studio A" },
  { time: "12:00", title: "Lunch break", type: "break", location: "—" },
  { time: "13:30", title: "Document review — Antoine Evray", type: "review", location: "Desk" },
  { time: "15:00", title: "Cohort sync — IT department", type: "group", location: "Hall 2" },
  { time: "16:30", title: "Weekly progress notes", type: "admin", location: "Desk" },
];

export const notifications = [
  { id: "n1", title: "Antoine Evray is missing 3 documents", time: "12 min ago", type: "warning" as const },
  { id: "n2", title: "Oleh Didyk uploaded final report", time: "1 hr ago", type: "success" as const },
  { id: "n3", title: "Monthly attendance report ready", time: "3 hr ago", type: "info" as const },
  { id: "n4", title: "Benia Mohammed Lamin accepted invitation", time: "Yesterday", type: "info" as const },
];

export const recentNotes = [
  { id: "nt1", participant: "Ahmad Haji", text: "Excellent progress on the infrastructure module. Ready for advanced track.", date: "Today" },
  { id: "nt2", participant: "Antoine Evray", text: "Follow up on missing NDA, tax form & deposit details.", date: "Yesterday" },
  { id: "nt3", participant: "Benia Mohammed Lamin", text: "Scheduled onboarding kickoff for next Monday.", date: "2 days ago" },
];

export const requiredDocuments = [
  { name: "Signed contract", status: "submitted" },
  { name: "ID verification", status: "submitted" },
  { name: "Tax form W-9", status: "submitted" },
  { name: "Code of conduct", status: "submitted" },
  { name: "Emergency contact", status: "submitted" },
  { name: "Health declaration", status: "submitted" },
  { name: "Confidentiality NDA", status: "submitted" },
  { name: "Direct deposit form", status: "submitted" },
] as const;

export const participantTasks = [
  { id: "t1", title: "Submit confidentiality NDA", due: "Tomorrow", done: false },
  { id: "t2", title: "Complete onboarding module 3", due: "May 14", done: false },
  { id: "t3", title: "Review IT security guidelines", due: "May 16", done: false },
  { id: "t4", title: "Watch ethics training video", due: "May 02", done: true },
  { id: "t5", title: "Upload signed contract", due: "Feb 03", done: true },
];

export const attendanceWeek = [
  { day: "Mon", status: "present" },
  { day: "Tue", status: "present" },
  { day: "Wed", status: "remote" },
  { day: "Thu", status: "present" },
  { day: "Fri", status: "absent" },
  { day: "Sat", status: "off" },
  { day: "Sun", status: "off" },
];

export const monthlyPlan = [
  { week: "Week 1", focus: "Onboarding & documentation", milestone: "Complete intake" },
  { week: "Week 2", focus: "Department fundamentals", milestone: "First deliverable" },
  { week: "Week 3", focus: "Operational shadowing", milestone: "2 supervised tasks" },
  { week: "Week 4", focus: "Mid-program review", milestone: "Coach evaluation" },
];

export type FileKind = "pdf" | "image" | "doc" | "sheet" | "other";

export interface ParticipantFile {
  id: string;
  participantId: string;
  name: string;
  size: string;
  date: string;
  uploadedBy: string;
  category: string;
  kind: FileKind;
  requirementKey?: string;
}

export const requiredDocTypes = [
  { key: "contract", label: "Signed contract", category: "Contract" },
  { key: "id", label: "ID verification", category: "Identity" },
  { key: "tax", label: "Tax form W-9", category: "Financial" },
  { key: "conduct", label: "Code of conduct", category: "Compliance" },
  { key: "emergency", label: "Emergency contact", category: "Personal" },
  { key: "health", label: "Health declaration", category: "Personal" },
  { key: "nda", label: "Confidentiality NDA", category: "Compliance" },
  { key: "deposit", label: "Direct deposit form", category: "Financial" },
] as const;

const docFileNames: Record<string, { name: string; kind: FileKind; size: string; category: string }> = {
  contract: { name: "Signed_Contract.pdf", kind: "pdf", size: "240 KB", category: "Contract" },
  id: { name: "ID_Verification.jpg", kind: "image", size: "1.2 MB", category: "Identity" },
  tax: { name: "TaxForm_W9.pdf", kind: "pdf", size: "108 KB", category: "Financial" },
  conduct: { name: "CodeOfConduct.pdf", kind: "pdf", size: "94 KB", category: "Compliance" },
  emergency: { name: "EmergencyContact.pdf", kind: "pdf", size: "82 KB", category: "Personal" },
  health: { name: "HealthDeclaration.pdf", kind: "pdf", size: "120 KB", category: "Personal" },
  nda: { name: "Confidentiality_NDA.pdf", kind: "pdf", size: "118 KB", category: "Compliance" },
  deposit: { name: "DirectDeposit.pdf", kind: "pdf", size: "60 KB", category: "Financial" },
};

const docOrder = ["contract", "id", "tax", "conduct", "emergency", "health", "nda", "deposit"] as const;

let _fid = 0;
const fid = () => `f${++_fid}`;

function buildFiles(): ParticipantFile[] {
  const list: ParticipantFile[] = [];
  for (const p of participants) {
    const submitted = docOrder.slice(0, p.submittedDocs);
    submitted.forEach((key, i) => {
      const meta = docFileNames[key];
      const day = String(((i * 3) % 27) + 1).padStart(2, "0");
      const monthIdx = (new Date(p.startDate).getMonth() + Math.floor(i / 3)) % 12;
      const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monthIdx];
      list.push({
        id: fid(),
        participantId: p.id,
        name: meta.name,
        size: meta.size,
        date: `${month} ${day}`,
        uploadedBy: p.name,
        category: meta.category,
        kind: meta.kind,
        requirementKey: key,
      });
    });
    // extras for high performers
    if (p.progress >= 70) {
      list.push({
        id: fid(),
        participantId: p.id,
        name: "Portfolio_Sample.pdf",
        size: "3.4 MB",
        date: "Apr 18",
        uploadedBy: p.name,
        category: "Work",
        kind: "pdf",
      });
    }
    if (p.status === "completed") {
      list.push({
        id: fid(),
        participantId: p.id,
        name: "FinalReport.docx",
        size: "210 KB",
        date: "Mar 12",
        uploadedBy: p.name,
        category: "Work",
        kind: "doc",
      });
    }
  }
  return list;
}

export const participantFiles: ParticipantFile[] = buildFiles();

export function getParticipantFiles(participantId: string) {
  return participantFiles.filter((f) => f.participantId === participantId);
}

export function getMissingDocs(participantId: string) {
  const submitted = new Set(
    getParticipantFiles(participantId)
      .map((f) => f.requirementKey)
      .filter(Boolean) as string[],
  );
  return requiredDocTypes.filter((d) => !submitted.has(d.key));
}

export function getDocStatus(participantId: string) {
  const submittedKeys = new Set(
    getParticipantFiles(participantId)
      .map((f) => f.requirementKey)
      .filter(Boolean) as string[],
  );
  return requiredDocTypes.map((d) => ({
    ...d,
    status: submittedKeys.has(d.key) ? ("submitted" as const) : ("missing" as const),
  }));
}

// ------------------------- Activity & Timeline -------------------------

export type ActivityType =
  | "file_uploaded"
  | "file_reviewed"
  | "note_added"
  | "task_completed"
  | "task_assigned"
  | "milestone_reached"
  | "meeting_held"
  | "status_changed"
  | "deadline_alert"
  | "missing_doc"
  | "attendance"
  | "message";

export interface ActivityEvent {
  id: string;
  participantId: string;
  type: ActivityType;
  title: string;
  description?: string;
  actor: string;
  date: string;
  time: string;
}

export const activityLog: ActivityEvent[] = [
  // Ahmad Haji (p1) — high performer
  { id: "a1", participantId: "p1", type: "milestone_reached", title: "Reached 80% completion", description: "Infrastructure module completed.", actor: "System", date: "2026-05-05", time: "10:14" },
  { id: "a2", participantId: "p1", type: "note_added", title: "Coach note added", description: "Excellent progress on infrastructure module.", actor: "Fatima Zouhra", date: "2026-05-04", time: "16:02" },
  { id: "a3", participantId: "p1", type: "file_uploaded", title: "Uploaded Portfolio_Sample.pdf", actor: "Ahmad Haji", date: "2026-04-18", time: "11:48" },
  { id: "a4", participantId: "p1", type: "meeting_held", title: "1:1 with Fatima Zouhra", actor: "Fatima Zouhra", date: "2026-05-06", time: "09:00" },
  { id: "a5", participantId: "p1", type: "attendance", title: "Marked present", actor: "System", date: "2026-05-08", time: "08:45" },

  // Antoine Evray (p2) — at risk
  { id: "a6", participantId: "p2", type: "deadline_alert", title: "Deadline in 33 days", description: "Program ends Jun 10.", actor: "System", date: "2026-05-08", time: "07:00" },
  { id: "a7", participantId: "p2", type: "status_changed", title: "Status changed to At risk", description: "Behind plan by 43%.", actor: "System", date: "2026-05-02", time: "07:01" },
  { id: "a8", participantId: "p2", type: "missing_doc", title: "3 documents still missing", description: "Code of conduct, NDA, deposit form.", actor: "System", date: "2026-05-01", time: "09:12" },
  { id: "a9", participantId: "p2", type: "note_added", title: "Coach note added", description: "Follow up on missing NDA & tax form.", actor: "Fatima Zouhra", date: "2026-05-07", time: "15:40" },

  // Benia (p3) — pending
  { id: "a10", participantId: "p3", type: "status_changed", title: "Invitation accepted", actor: "Benia Mohammed Lamin", date: "2026-04-20", time: "08:15" },
  { id: "a11", participantId: "p3", type: "task_assigned", title: "Assigned: complete intake forms", actor: "Fatima Zouhra", date: "2026-04-20", time: "08:20" },

  // Vasco (p4)
  { id: "a12", participantId: "p4", type: "file_reviewed", title: "Fernanda Guerrero reviewed Code of Conduct", actor: "Fernanda Guerrero", date: "2026-04-22", time: "13:22" },
  { id: "a13", participantId: "p4", type: "milestone_reached", title: "Mid-program review complete", actor: "System", date: "2026-04-30", time: "12:00" },

  // Roberto (p5) — completed
  { id: "a14", participantId: "p5", type: "milestone_reached", title: "Program completed", description: "Final report submitted.", actor: "System", date: "2026-03-01", time: "17:30" },
  { id: "a15", participantId: "p5", type: "file_uploaded", title: "Uploaded FinalReport.docx", actor: "Roberto PALMAS", date: "2026-02-28", time: "16:02" },

  // Nina (p6)
  { id: "a16", participantId: "p6", type: "meeting_held", title: "Project planning workshop", actor: "Soufian HIHI", date: "2026-05-06", time: "11:00" },
  { id: "a17", participantId: "p6", type: "file_uploaded", title: "Uploaded EmergencyContact.pdf", actor: "Nina Nina", date: "2026-03-02", time: "09:30" },

  // Elham (p7) — deadline soon
  { id: "a18", participantId: "p7", type: "deadline_alert", title: "Program ends in 7 days", actor: "System", date: "2026-05-08", time: "07:00" },
  { id: "a19", participantId: "p7", type: "missing_doc", title: "4 documents still missing", actor: "System", date: "2026-05-07", time: "09:12" },

  // Paul (p8)
  { id: "a20", participantId: "p8", type: "file_uploaded", title: "Uploaded TaxForm_W9.pdf", actor: "Paul Richard", date: "2026-04-10", time: "10:11" },

  // Patrick (p9)
  { id: "a21", participantId: "p9", type: "milestone_reached", title: "Reached 70% completion", actor: "System", date: "2026-05-03", time: "12:00" },
  { id: "a22", participantId: "p9", type: "note_added", title: "Coach note added", description: "Strong commercial pipeline. Ready for client meetings.", actor: "Junior Mazolo", date: "2026-05-04", time: "14:00" },

  // Claudin (p10) — inactive
  { id: "a23", participantId: "p10", type: "status_changed", title: "Marked as low engagement", description: "No activity in last 14 days.", actor: "System", date: "2026-05-06", time: "08:00" },
  { id: "a24", participantId: "p10", type: "missing_doc", title: "6 documents still missing", actor: "System", date: "2026-05-05", time: "09:12" },

  // Oleh (p11) — high performer
  { id: "a25", participantId: "p11", type: "milestone_reached", title: "Reached 80% completion", actor: "System", date: "2026-05-07", time: "10:14" },
  { id: "a26", participantId: "p11", type: "file_uploaded", title: "Uploaded Portfolio_Sample.pdf", actor: "Oleh Didyk", date: "2026-04-18", time: "11:48" },

  // Yuri (p12)
  { id: "a27", participantId: "p12", type: "meeting_held", title: "Code review with Régis", actor: "Régis Boesch", date: "2026-05-05", time: "10:00" },

  // Romain (p13) — at risk
  { id: "a28", participantId: "p13", type: "status_changed", title: "Status changed to At risk", description: "Behind plan and 3 docs missing.", actor: "System", date: "2026-05-01", time: "07:01" },
  { id: "a29", participantId: "p13", type: "deadline_alert", title: "Deadline in 24 days", actor: "System", date: "2026-05-08", time: "07:00" },
];

export function getParticipantActivity(participantId: string) {
  return activityLog
    .filter((a) => a.participantId === participantId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1));
}

export function getRecentActivity(limit = 8) {
  return [...activityLog]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1))
    .slice(0, limit);
}

// ------------------------- Extended notifications -------------------------

export const allNotifications = [
  ...notifications,
  { id: "n5", title: "Elham Elham — program ends in 7 days", time: "Today", type: "warning" as const },
  { id: "n6", title: "Yuri Heymann uploaded Source_List.xlsx", time: "2 hr ago", type: "info" as const },
  { id: "n7", title: "Junior Mazolo added a note on Patrick SALIMOU", time: "Yesterday", type: "info" as const },
  { id: "n8", title: "Roberto PALMAS completed his program", time: "2 days ago", type: "success" as const },
  { id: "n9", title: "Claudin Checks flagged for low engagement", time: "2 days ago", type: "warning" as const },
  { id: "n10", title: "Romain Romain is behind plan", time: "Yesterday", type: "warning" as const },
  { id: "n11", title: "Ahmad Haji — coaching session Wed 14:00 confirmed", time: "1 hr ago", type: "info" as const },
  { id: "n12", title: "Antoine Evray — recovery session scheduled Mon 10:00", time: "3 hr ago", type: "warning" as const },
];

// ------------------------- Coach session / coaching plans -------------------------

export const CURRENT_COACH = "Fatima Zouhra";
export const CURRENT_PARTICIPANT_ID = "p1";

export type SessionType = "in-person" | "video";
export type SessionStatus = "scheduled" | "completed" | "missed" | "cancelled";

export interface CoachingSession {
  id: string;
  participantId: string;
  coach: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType;
  location: string;
  objective: string;
  notes?: string;
  status: SessionStatus;
  recurring?: "weekly" | "biweekly" | "monthly";
}

export interface MonthlyPlanEntry {
  id: string;
  participantId: string;
  coach: string;
  month: string;
  focus: string;
  objectives: string[];
  deliverables: string[];
}

const _planMonth = "2026-05";
const _wd = (day: number) => `${_planMonth}-${String(day).padStart(2, "0")}`;

export const coachingSessions: CoachingSession[] = [
  { id: "s1", participantId: "p1", coach: "Fatima Zouhra", date: _wd(6), time: "14:00", duration: 60, type: "in-person", location: "Room 4B", objective: "Infrastructure module wrap-up", notes: "Excellent grasp of CI/CD.", status: "completed", recurring: "weekly" },
  { id: "s2", participantId: "p1", coach: "Fatima Zouhra", date: _wd(13), time: "14:00", duration: 60, type: "in-person", location: "Room 4B", objective: "Security review & advanced track planning", status: "scheduled", recurring: "weekly" },
  { id: "s3", participantId: "p1", coach: "Fatima Zouhra", date: _wd(20), time: "14:00", duration: 60, type: "video", location: "Google Meet", objective: "Mid-program evaluation", status: "scheduled", recurring: "weekly" },
  { id: "s4", participantId: "p1", coach: "Fatima Zouhra", date: _wd(27), time: "14:00", duration: 60, type: "in-person", location: "Room 4B", objective: "Capstone kickoff", status: "scheduled", recurring: "weekly" },
  { id: "s5", participantId: "p2", coach: "Fatima Zouhra", date: _wd(11), time: "10:00", duration: 45, type: "in-person", location: "Room 2A", objective: "Documentation catch-up — NDA, tax form, deposit", status: "scheduled", recurring: "weekly" },
  { id: "s6", participantId: "p2", coach: "Fatima Zouhra", date: _wd(18), time: "10:00", duration: 45, type: "video", location: "Google Meet", objective: "Progress recovery checkpoint", status: "scheduled", recurring: "weekly" },
  { id: "s7", participantId: "p2", coach: "Fatima Zouhra", date: _wd(4), time: "10:00", duration: 45, type: "in-person", location: "Room 2A", objective: "Risk review", notes: "Committed to deliver NDA by Friday.", status: "completed", recurring: "weekly" },
  { id: "s8", participantId: "p3", coach: "Fatima Zouhra", date: _wd(12), time: "11:00", duration: 30, type: "in-person", location: "Room 4B", objective: "Onboarding kickoff", status: "scheduled", recurring: "weekly" },
  { id: "s9", participantId: "p3", coach: "Fatima Zouhra", date: _wd(19), time: "11:00", duration: 30, type: "in-person", location: "Room 4B", objective: "Intake forms walkthrough", status: "scheduled", recurring: "weekly" },
  { id: "s10", participantId: "p4", coach: "Fernanda Guerrero", date: _wd(12), time: "09:30", duration: 45, type: "in-person", location: "Office 1", objective: "Weekly admin review", status: "scheduled", recurring: "weekly" },
  { id: "s11", participantId: "p6", coach: "Soufian HIHI", date: _wd(13), time: "11:00", duration: 60, type: "video", location: "Zoom", objective: "Project planning", status: "scheduled", recurring: "weekly" },
  { id: "s12", participantId: "p11", coach: "Régis Boesch", date: _wd(14), time: "15:00", duration: 60, type: "in-person", location: "Dev Lab", objective: "Code review", status: "scheduled", recurring: "weekly" },
];

export const monthlyPlans: MonthlyPlanEntry[] = [
  { id: "mp1", participantId: "p1", coach: "Fatima Zouhra", month: _planMonth, focus: "Advanced infrastructure & security", objectives: ["Complete security module", "Lead one infra deployment", "Mentor a peer"], deliverables: ["Security audit report", "Deployment runbook", "Capstone proposal"] },
  { id: "mp2", participantId: "p2", coach: "Fatima Zouhra", month: _planMonth, focus: "Documentation recovery & re-engagement", objectives: ["Submit all 3 missing documents", "Restore weekly attendance", "Catch up on module 2"], deliverables: ["NDA + tax form + deposit", "Module 2 exercises"] },
  { id: "mp3", participantId: "p3", coach: "Fatima Zouhra", month: _planMonth, focus: "Foundational onboarding", objectives: ["Complete intake", "Shadow IT operations", "Define learning track"], deliverables: ["Signed intake forms", "Personal learning plan"] },
  { id: "mp4", participantId: "p6", coach: "Soufian HIHI", month: _planMonth, focus: "Project management fundamentals", objectives: ["Run first sprint", "Document one project charter"], deliverables: ["Sprint retro", "Charter doc"] },
];

export function getCoachParticipants(coach: string) {
  return participants.filter((p) => p.coach === coach);
}

export function getCoachSessions(coach: string) {
  return coachingSessions
    .filter((s) => s.coach === coach)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function getParticipantSessions(participantId: string) {
  return coachingSessions
    .filter((s) => s.participantId === participantId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export const TODAY = "2026-05-08";

export function getUpcomingSessions(filter: { coach?: string; participantId?: string }, limit = 10) {
  return coachingSessions
    .filter((s) => {
      if (filter.coach && s.coach !== filter.coach) return false;
      if (filter.participantId && s.participantId !== filter.participantId) return false;
      return s.date >= TODAY && s.status === "scheduled";
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit);
}

export function getParticipantPlan(participantId: string, month = _planMonth) {
  return monthlyPlans.find((m) => m.participantId === participantId && m.month === month);
}

export function getCoachPlans(coach: string, month = _planMonth) {
  return monthlyPlans.filter((m) => m.coach === coach && m.month === month);
}

export function getCoachNotifications(coach: string) {
  const names = new Set(getCoachParticipants(coach).map((p) => p.name));
  return allNotifications.filter((n) => {
    for (const name of names) if (n.title.includes(name)) return true;
    return false;
  });
}

export function getParticipantNotifications(participantId: string) {
  const p = participants.find((x) => x.id === participantId);
  if (!p) return [];
  return allNotifications.filter((n) => n.title.includes(p.name) || n.title.includes(p.coach));
}

