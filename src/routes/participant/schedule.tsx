import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_PARTICIPANT_ID, participants, TODAY } from "@/lib/mock-data";
import {
  usePlanning,
  startOfWeek,
  weekDays,
  type AttendanceMode,
  type AttendanceStatus,
} from "@/lib/planning-store";
import {
  Calendar,
  Video,
  MapPin,
  Repeat,
  CheckCircle2,
  Sun,
  Moon,
  Home,
  Wifi,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/participant/schedule")({
  head: () => ({ meta: [{ title: "My Schedule — GBNews" }] }),
  component: ParticipantSchedule,
});

function ParticipantSchedule() {
  const { t, locale } = useI18n();
  const { sessions, plans, attendance } = usePlanning();
  const me = participants.find((p) => p.id === CURRENT_PARTICIPANT_ID)!;
  const mySessions = sessions
    .filter((s) => s.participantId === CURRENT_PARTICIPANT_ID)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = mySessions.filter((s) => s.date >= TODAY && s.status === "scheduled");
  const past = mySessions.filter((s) => s.date < TODAY || s.status === "completed");
  const plan = plans.find((m) => m.participantId === CURRENT_PARTICIPANT_ID && m.month === "2026-05");

  const [offset, setOffset] = useState(0);
  const weekStart = useMemo(() => {
    const d = startOfWeek();
    d.setDate(d.getDate() + offset * 7);
    return d;
  }, [offset]);
  const days = weekDays(weekStart);
  const myWeek = days.map(
    (d) =>
      attendance.find((a) => a.participantId === CURRENT_PARTICIPANT_ID && a.date === d) ?? null,
  );

  const nextWhen = upcoming[0]
    ? formatDay(upcoming[0].date, locale) + " · " + upcoming[0].time
    : t("p.tbd");

  return (
    <AppShell role="participant" title={t("page.mySchedule")}>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-primary/5 p-5 mb-6">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("p.coach")}</p>
        <h2 className="text-base font-semibold mt-0.5">{me.coach}</h2>
        <p className="text-xs text-muted-foreground">{t("p.recurringIntro", { when: nextWhen })}</p>
      </div>

      {/* Weekly attendance */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{t("p.myWeeklyAttendance")}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="h-7 w-7 grid place-items-center rounded-lg border border-border hover:bg-muted"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground px-1 min-w-[140px] text-center">
              {fmtDay(days[0], locale)} – {fmtDay(days[4], locale)}
            </span>
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="h-7 w-7 grid place-items-center rounded-lg border border-border hover:bg-muted"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {days.map((d, i) => (
            <DayCard key={d} date={d} day={myWeek[i]} />
          ))}
        </div>
      </section>

      {plan && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t("p.monthlyPlanFor", { month: formatMonth(plan.month, locale) })}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("field.focus")}</p>
              <p className="text-sm font-medium mt-1">{plan.focus}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-4">
                {t("field.objectives")}
              </p>
              <ul className="mt-1 space-y-1">
                {plan.objectives.map((o, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-1 shrink-0" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("field.deliverables")}
              </p>
              <ul className="mt-1 space-y-1">
                {plan.deliverables.map((d, i) => (
                  <li key={i} className="text-sm">
                    • {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3">{t("p.upcomingSessions")}</h3>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={t("p.noUpcomingTitle")}
            description={t("p.noUpcomingDesc")}
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {upcoming.map((s) => (
              <SessionLine key={s.id} s={s} tone="upcoming" />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-3">{t("p.pastSessions")}</h3>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("p.noPastSessions")}</p>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {past.map((s) => (
              <SessionLine key={s.id} s={s} tone="past" />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function DayCard({
  date,
  day,
}: {
  date: string;
  day: { morning: { mode: AttendanceMode; status: AttendanceStatus }; afternoon: { mode: AttendanceMode; status: AttendanceStatus }; note?: string } | null;
}) {
  const { t, locale } = useI18n();
  const isToday = date === TODAY;
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3",
        isToday ? "border-primary/40 ring-1 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{dayName(date, locale)}</p>
          <p className="text-sm font-semibold">{fmtDay(date, locale)}</p>
        </div>
        {isToday && (
          <span className="text-[9px] uppercase bg-primary/15 text-primary px-1.5 py-0.5 rounded">
            {t("p.todayBadge")}
          </span>
        )}
      </div>
      <HalfBadge label={t("att.am")} icon={Sun} half={day?.morning} />
      <div className="h-1.5" />
      <HalfBadge label={t("att.pm")} icon={Moon} half={day?.afternoon} />
      {day?.note && (
        <p className="text-[10px] text-muted-foreground italic mt-2 line-clamp-2">"{day.note}"</p>
      )}
    </div>
  );
}

function HalfBadge({
  label,
  icon: Icon,
  half,
}: {
  label: string;
  icon: typeof Sun;
  half?: { mode: AttendanceMode; status: AttendanceStatus };
}) {
  const { t } = useI18n();
  if (!half) return null;
  const ModeIcon = half.mode === "in-person" ? Home : half.mode === "remote" ? Wifi : Clock;
  const StatusIcon =
    half.status === "present"
      ? CheckCircle2
      : half.status === "absent"
        ? XCircle
        : Clock;
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
          half.mode === "in-person"
            ? "bg-info/10 text-info"
            : half.mode === "remote"
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground",
        )}
      >
        <ModeIcon className="h-3 w-3" />
        {half.mode === "off" ? t("att.off") : half.mode === "in-person" ? t("att.onSite") : t("att.remote")}
      </span>
      <StatusIcon
        className={cn(
          "h-3 w-3",
          half.status === "present"
            ? "text-success"
            : half.status === "absent"
              ? "text-destructive"
              : "text-muted-foreground",
        )}
      />
    </div>
  );
}

function SessionLine({
  s,
  tone,
}: {
  s: ReturnType<typeof usePlanning>["sessions"][number];
  tone: "upcoming" | "past";
}) {
  const { t, locale } = useI18n();
  const Icon = s.type === "video" ? Video : MapPin;
  const recurringLabel = s.recurring ? t(`p.recurring.${s.recurring}`) : "";
  const statusLabel = t(`status.${s.status === "scheduled" ? "scheduled" : s.status === "completed" ? "completed" : s.status === "missed" ? "missed" : "cancelled"}`);
  return (
    <div className="p-4 flex items-start gap-4">
      <div className="text-center w-16 shrink-0">
        <div className="text-[10px] uppercase text-muted-foreground">{fmtDay(s.date, locale)}</div>
        <div className="text-sm font-mono font-semibold tabular-nums">{s.time}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{s.objective}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3" /> {s.type === "video" ? t("sched.video") : t("sched.inPerson")} ·{" "}
            {s.location}
          </span>
          {s.recurring && (
            <span className="inline-flex items-center gap-1">
              <Repeat className="h-3 w-3" /> {recurringLabel}
            </span>
          )}
        </div>
        {s.notes && <p className="text-[11px] italic text-muted-foreground mt-1">"{s.notes}"</p>}
      </div>
      <span
        className={cn(
          "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded h-fit",
          tone === "upcoming" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground",
        )}
      >
        {statusLabel}
      </span>
    </div>
  );
}

function formatDay(date: string, locale: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function fmtDay(date: string, locale: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}
function dayName(date: string, locale: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(locale, { weekday: "short" });
}
function formatMonth(month: string, locale: string) {
  return new Date(month + "-01T00:00:00").toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}
