import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import {
  CURRENT_COACH,
  getCoachParticipants,
  TODAY,
} from "@/lib/mock-data";
import {
  usePlanning,
  startOfWeek,
  weekDays,
  setAttendance,
  createSession,
  updateSession,
  deleteSession,
  upsertPlan,
  type AttendanceMode,
  type AttendanceStatus,
  type CoachingSession,
} from "@/lib/planning-store";
import {
  Calendar as CalIcon,
  Video,
  MapPin,
  Repeat,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Wifi,
  CheckCircle2,
  XCircle,
  Clock,
  StickyNote,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/coach/schedule")({
  head: () => ({ meta: [{ title: "Coaching Schedule — GBNews" }] }),
  component: CoachSchedule,
});

type Tab = "week" | "month" | "sessions";

function CoachSchedule() {
  const [tab, setTab] = useState<Tab>("week");
  const myParticipants = getCoachParticipants(CURRENT_COACH);

  return (
    <AppShell role="coach" title="Planning & Attendance">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <p className="text-sm text-muted-foreground">
          Plan attendance, define monthly objectives, and run coaching sessions for your{" "}
          {myParticipants.length} participants.
        </p>
        <div className="sm:ml-auto inline-flex rounded-lg border border-border overflow-hidden text-xs">
          {(
            [
              { k: "week", l: "This Week's Attendance" },
              { k: "month", l: "Monthly Plan" },
              { k: "sessions", l: "Coaching Sessions" },
            ] as { k: Tab; l: string }[]
          ).map((o) => (
            <button
              key={o.k}
              onClick={() => setTab(o.k)}
              className={cn(
                "h-9 px-3",
                tab === o.k ? "bg-muted font-medium" : "hover:bg-muted/60",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {tab === "week" && <WeeklyAttendance />}
      {tab === "month" && <MonthlyPlanner />}
      {tab === "sessions" && <SessionsBoard />}
    </AppShell>
  );
}

// ============================================================
// Weekly Attendance
// ============================================================

function WeeklyAttendance() {
  usePlanning();
  const [offset, setOffset] = useState(0);
  const ps = getCoachParticipants(CURRENT_COACH);

  const weekStart = useMemo(() => {
    const d = startOfWeek();
    d.setDate(d.getDate() + offset * 7);
    return d;
  }, [offset]);
  const days = weekDays(weekStart);

  const label = `${fmtDate(days[0])} – ${fmtDate(days[4])}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold">{label}</h3>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {offset !== 0 && (
            <button
              onClick={() => setOffset(0)}
              className="text-xs text-primary hover:underline ml-1"
            >
              Back to current week
            </button>
          )}
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
          <Legend />
        </div>
      </div>

      {ps.length === 0 ? (
        <EmptyState icon={CalIcon} title="No participants assigned" />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground w-56 sticky left-0 bg-muted/50">
                    Participant
                  </th>
                  {days.map((d) => (
                    <th key={d} className="px-3 py-3 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div>{dayName(d)}</div>
                          <div className="text-[10px] font-normal opacity-70">
                            {fmtDay(d)}
                          </div>
                        </div>
                        {d === TODAY && (
                          <span className="text-[9px] uppercase bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ps.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px] font-semibold">
                          {p.avatar}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to="/coach/participants/$id"
                            params={{ id: p.id }}
                            className="text-sm font-medium hover:underline truncate block"
                          >
                            {p.name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {p.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    {days.map((d) => (
                      <td key={d} className="px-2 py-2">
                        <DayCell participantId={p.id} date={d} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Legend() {
  return (
    <>
      <span className="inline-flex items-center gap-1">
        <Home className="h-3 w-3" /> In-person
      </span>
      <span className="inline-flex items-center gap-1">
        <Wifi className="h-3 w-3" /> Remote
      </span>
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-success" /> Present
      </span>
      <span className="inline-flex items-center gap-1">
        <XCircle className="h-3 w-3 text-destructive" /> Absent
      </span>
    </>
  );
}

function DayCell({ participantId, date }: { participantId: string; date: string }) {
  const { attendance } = usePlanning();
  const day =
    attendance.find((a) => a.participantId === participantId && a.date === date) ??
    null;
  const morning = day?.morning ?? { mode: "in-person" as const, status: "planned" as const };
  const afternoon = day?.afternoon ?? { mode: "in-person" as const, status: "planned" as const };
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteVal, setNoteVal] = useState(day?.note ?? "");

  return (
    <div className="rounded-lg border border-border p-1.5 min-w-[140px] space-y-1">
      <HalfRow
        icon={Sun}
        label="AM"
        half={morning}
        onMode={(m) =>
          setAttendance(participantId, date, { morning: { ...morning, mode: m } })
        }
        onStatus={(s) =>
          setAttendance(participantId, date, { morning: { ...morning, status: s } })
        }
      />
      <HalfRow
        icon={Moon}
        label="PM"
        half={afternoon}
        onMode={(m) =>
          setAttendance(participantId, date, { afternoon: { ...afternoon, mode: m } })
        }
        onStatus={(s) =>
          setAttendance(participantId, date, { afternoon: { ...afternoon, status: s } })
        }
      />
      <button
        onClick={() => {
          setNoteVal(day?.note ?? "");
          setNoteOpen(true);
        }}
        className={cn(
          "w-full text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground",
          day?.note && "text-foreground",
        )}
      >
        <StickyNote className="h-3 w-3" />
        <span className="truncate">{day?.note || "Add note"}</span>
      </button>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Day note · {fmtDate(date)}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteVal}
            onChange={(e) => setNoteVal(e.target.value)}
            placeholder="e.g. Late arrival – traffic, working from co-working space..."
            rows={4}
          />
          <DialogFooter>
            <button
              onClick={() => setNoteOpen(false)}
              className="h-9 px-3 text-sm rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setAttendance(participantId, date, { note: noteVal });
                setNoteOpen(false);
                toast.success("Note saved");
              }}
              className="h-9 px-3 text-sm rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HalfRow({
  icon: Icon,
  label,
  half,
  onMode,
  onStatus,
}: {
  icon: typeof Sun;
  label: string;
  half: { mode: AttendanceMode; status: AttendanceStatus };
  onMode: (m: AttendanceMode) => void;
  onStatus: (s: AttendanceStatus) => void;
}) {
  const modeColor =
    half.mode === "in-person"
      ? "bg-info/10 text-info"
      : half.mode === "remote"
        ? "bg-warning/10 text-warning"
        : "bg-muted text-muted-foreground";
  const statusColor =
    half.status === "present"
      ? "text-success"
      : half.status === "absent"
        ? "text-destructive"
        : half.status === "excused"
          ? "text-muted-foreground"
          : "text-foreground/60";

  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground w-7">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <select
        value={half.mode}
        onChange={(e) => onMode(e.target.value as AttendanceMode)}
        className={cn(
          "h-6 px-1 rounded text-[10px] border-0 focus:ring-1 focus:ring-ring flex-1",
          modeColor,
        )}
      >
        <option value="in-person">In-person</option>
        <option value="remote">Remote</option>
        <option value="off">Off</option>
      </select>
      <select
        value={half.status}
        onChange={(e) => onStatus(e.target.value as AttendanceStatus)}
        className={cn(
          "h-6 px-1 rounded text-[10px] bg-transparent border border-border focus:ring-1 focus:ring-ring",
          statusColor,
        )}
      >
        <option value="planned">Planned</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="excused">Excused</option>
      </select>
    </div>
  );
}

// ============================================================
// Monthly Planner
// ============================================================

function MonthlyPlanner() {
  const { plans } = usePlanning();
  const ps = getCoachParticipants(CURRENT_COACH);
  const [editing, setEditing] = useState<string | null>(null);
  const month = "2026-05";

  return (
    <section>
      <h3 className="text-sm font-semibold mb-3">
        Monthly plans · {fmtMonth(month)}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {ps.map((p) => {
          const plan = plans.find((m) => m.participantId === p.id && m.month === month);
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.program}</p>
                </div>
                <button
                  onClick={() => setEditing(p.id)}
                  className="h-8 px-2.5 inline-flex items-center gap-1 text-xs rounded-lg border border-border hover:bg-muted"
                >
                  <Edit3 className="h-3 w-3" /> {plan ? "Edit" : "Create"}
                </button>
              </div>
              {plan ? (
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Focus
                    </p>
                    <p className="text-sm font-medium">{plan.focus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Objectives
                    </p>
                    <ul className="text-sm space-y-0.5 mt-0.5">
                      {plan.objectives.map((o, i) => (
                        <li key={i} className="flex gap-2">
                          <CheckCircle2 className="h-3 w-3 text-success mt-1 shrink-0" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Deliverables
                    </p>
                    <ul className="text-sm space-y-0.5 mt-0.5">
                      {plan.deliverables.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">
                  No monthly plan defined yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <PlanEditor
          participantId={editing}
          month={month}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function PlanEditor({
  participantId,
  month,
  onClose,
}: {
  participantId: string;
  month: string;
  onClose: () => void;
}) {
  const { plans } = usePlanning();
  const existing = plans.find(
    (p) => p.participantId === participantId && p.month === month,
  );
  const [focus, setFocus] = useState(existing?.focus ?? "");
  const [objectives, setObjectives] = useState((existing?.objectives ?? []).join("\n"));
  const [deliverables, setDeliverables] = useState(
    (existing?.deliverables ?? []).join("\n"),
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Monthly plan · {fmtMonth(month)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Focus</label>
            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Advanced infrastructure & security"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Objectives (one per line)</label>
            <Textarea
              rows={4}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Deliverables (one per line)</label>
            <Textarea
              rows={4}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="h-9 px-3 text-sm rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={() => {
              upsertPlan({
                id: existing?.id,
                participantId,
                coach: CURRENT_COACH,
                month,
                focus,
                objectives: objectives.split("\n").map((s) => s.trim()).filter(Boolean),
                deliverables: deliverables
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              toast.success("Monthly plan saved");
              onClose();
            }}
            className="h-9 px-3 text-sm rounded-lg bg-primary text-primary-foreground"
          >
            Save plan
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Sessions board
// ============================================================

function SessionsBoard() {
  const { sessions } = usePlanning();
  const ps = getCoachParticipants(CURRENT_COACH);
  const allowedIds = new Set(ps.map((p) => p.id));
  const mine = sessions.filter((s) => s.coach === CURRENT_COACH && allowedIds.has(s.participantId));
  const [filter, setFilter] = useState<"upcoming" | "completed" | "all">("upcoming");
  const [editing, setEditing] = useState<CoachingSession | "new" | null>(null);

  const filtered = mine.filter((s) => {
    if (filter === "upcoming") return s.date >= TODAY && s.status === "scheduled";
    if (filter === "completed") return s.status === "completed";
    return true;
  });

  const grouped = useMemo(() => {
    const m = new Map<string, CoachingSession[]>();
    for (const s of filtered) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="inline-flex rounded-lg border border-border overflow-hidden text-xs">
          {(["upcoming", "completed", "all"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "h-8 px-3 capitalize",
                filter === k ? "bg-muted font-medium" : "hover:bg-muted/60",
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing("new")}
          className="h-9 inline-flex items-center gap-1.5 px-3 text-xs rounded-lg bg-primary text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> New session
        </button>
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={CalIcon} title="No sessions in this view" />
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold mb-2">{fmtDate(date)}</p>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                {items.map((s) => (
                  <SessionRow
                    key={s.id}
                    s={s}
                    participantName={ps.find((p) => p.id === s.participantId)?.name ?? s.participantId}
                    onEdit={() => setEditing(s)}
                    onAttended={() => {
                      updateSession(s.id, { status: "completed" });
                      toast.success("Marked as attended");
                    }}
                    onDelete={() => {
                      deleteSession(s.id);
                      toast.success("Session deleted");
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <SessionEditor
          session={editing === "new" ? null : editing}
          participants={ps}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function SessionRow({
  s,
  participantName,
  onEdit,
  onAttended,
  onDelete,
}: {
  s: CoachingSession;
  participantName: string;
  onEdit: () => void;
  onAttended: () => void;
  onDelete: () => void;
}) {
  const Icon = s.type === "video" ? Video : MapPin;
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="text-center w-14 shrink-0">
        <div className="text-sm font-mono font-semibold tabular-nums">{s.time}</div>
        <div className="text-[10px] text-muted-foreground">{s.duration}min</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{participantName}</span>
          <span
            className={cn(
              "text-[10px] uppercase px-1.5 py-0.5 rounded",
              s.status === "completed"
                ? "bg-success/10 text-success"
                : s.status === "missed"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-info/10 text-info",
            )}
          >
            {s.status}
          </span>
          {s.recurring && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Repeat className="h-3 w-3" /> {s.recurring}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{s.objective}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3" /> {s.type === "video" ? "Video call" : "In-person"} ·{" "}
            {s.location}
          </span>
          {s.notes && <span className="italic truncate">"{s.notes}"</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {s.status === "scheduled" && (
          <ActionBtn icon={CheckCircle2} label="Mark attended" onClick={onAttended} />
        )}
        <ActionBtn icon={Edit3} label="Edit" onClick={onEdit} />
        <ActionBtn icon={Trash2} label="Delete" onClick={onDelete} />
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Clock;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground"
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function SessionEditor({
  session,
  participants,
  onClose,
}: {
  session: CoachingSession | null;
  participants: ReturnType<typeof getCoachParticipants>;
  onClose: () => void;
}) {
  const [participantId, setParticipantId] = useState(session?.participantId ?? participants[0]?.id ?? "");
  const [date, setDate] = useState(session?.date ?? TODAY);
  const [time, setTime] = useState(session?.time ?? "14:00");
  const [duration, setDuration] = useState(session?.duration ?? 60);
  const [type, setType] = useState<CoachingSession["type"]>(session?.type ?? "video");
  const [location, setLocation] = useState(session?.location ?? "Google Meet");
  const [objective, setObjective] = useState(session?.objective ?? "");
  const [notes, setNotes] = useState(session?.notes ?? "");
  const [recurring, setRecurring] = useState<CoachingSession["recurring"] | "none">(
    session?.recurring ?? "weekly",
  );

  const save = () => {
    const payload = {
      participantId,
      coach: CURRENT_COACH,
      date,
      time,
      duration: Number(duration),
      type,
      location,
      objective,
      notes: notes || undefined,
      status: session?.status ?? ("scheduled" as const),
      recurring: recurring === "none" ? undefined : (recurring as CoachingSession["recurring"]),
    };
    if (session) {
      updateSession(session.id, payload);
      toast.success("Session updated");
    } else {
      createSession(payload);
      toast.success("Session created");
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{session ? "Edit session" : "New coaching session"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Participant</label>
            <select
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Duration (min)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CoachingSession["type"])}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="video">Video call</option>
                <option value="in-person">In-person</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Recurring</label>
              <select
                value={recurring ?? "none"}
                onChange={(e) =>
                  setRecurring(e.target.value as CoachingSession["recurring"] | "none")
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="none">One-off</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Objective</label>
            <Input value={objective} onChange={(e) => setObjective(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Notes</label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="h-9 px-3 text-sm rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={save}
            className="h-9 px-3 text-sm rounded-lg bg-primary text-primary-foreground"
          >
            Save session
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Date helpers
// ============================================================

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function fmtDay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
function dayName(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
}
function fmtMonth(m: string) {
  return new Date(m + "-01T00:00:00").toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
