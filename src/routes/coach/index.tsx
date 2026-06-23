import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ParticipantCard, getMonitoring } from "@/components/ParticipantCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { EmptyState } from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n";
import {
  CURRENT_COACH,
  getCoachParticipants,
  getCoachNotifications,
  getUpcomingSessions,
  getRecentActivity,
  recentNotes,
  type CoachingSession,
} from "@/lib/mock-data";
import { Bell, Calendar, FileText, Users, AlertTriangle, CheckCircle2, Info, Plus, Clock, TrendingDown, Inbox, Video, MapPin, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach/")({
  head: () => ({ meta: [{ title: "Coach Dashboard — GBNews" }] }),
  component: CoachDashboard,
});

const myParticipants = getCoachParticipants(CURRENT_COACH);

function CoachDashboard() {
  const { t } = useI18n();
  const monitored = myParticipants.map((p) => ({ p, m: getMonitoring(p) }));
  const delayed = monitored.filter(({ m }) => m.isDelayed || m.isOverdue);
  const upcoming = monitored.filter(({ m }) => m.isDeadlineSoon && !m.isOverdue);
  const pendingDocs = myParticipants.reduce((n, p) => n + (p.requiredDocs - p.submittedDocs), 0);
  const upcomingSessions = getUpcomingSessions({ coach: CURRENT_COACH }, 6);
  const myNotifications = getCoachNotifications(CURRENT_COACH);

  return (
    <AppShell role="coach" title={t("page.coachDashboard")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Users} label={t("stat.assigned")} value={myParticipants.length.toString()} hint={t("hint.activeAtRisk", { active: monitored.filter(({p})=>p.status==="active").length, risk: delayed.length })} />
        <Stat icon={Calendar} label={t("stat.upcomingSessions")} value={upcomingSessions.length.toString()} hint={t("hint.next14days")} />
        <Stat icon={FileText} label={t("stat.pendingDocs")} value={pendingDocs.toString()} hint={t("hint.acrossParticipants")} />
        <Stat icon={Bell} label={t("stat.notifications")} value={myNotifications.length.toString()} hint={t("hint.fromParticipants")} />
      </div>

      {(delayed.length > 0 || upcoming.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {delayed.length > 0 && (
            <AlertPanel
              tone="danger"
              icon={TrendingDown}
              title={`${delayed.length} participant${delayed.length > 1 ? "s" : ""} delayed`}
              description="Behind expected progress or past end date."
              items={delayed.map(({ p, m }) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                meta: m.isOverdue ? "Overdue" : `Behind ${Math.abs(m.delta)}% vs plan`,
              }))}
            />
          )}
          {upcoming.length > 0 && (
            <AlertPanel
              tone="warning"
              icon={Clock}
              title={`${upcoming.length} upcoming deadline${upcoming.length > 1 ? "s" : ""}`}
              description="Programs ending within 14 days."
              items={upcoming.map(({ p }) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                meta: `${p.remainingDays} days left · ends ${p.endDate.slice(5)}`,
              }))}
            />
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section
            title="My participants"
            action={
              <button className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border hover:bg-muted">
                <Plus className="h-3.5 w-3.5" /> Add participant
              </button>
            }
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {myParticipants.map((p) => (
                <ParticipantCard key={p.id} p={p} />
              ))}
            </div>
          </Section>

          <Section title="Recent activity">
            <div className="rounded-2xl border border-border bg-card p-5">
              <ActivityTimeline events={getRecentActivity(8)} />
            </div>
          </Section>

          <Section title="Recent notes">
            {recentNotes.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No notes yet"
                description="Start documenting participant progress with quick notes from their profile."
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                {recentNotes.map((n) => (
                  <div key={n.id} className="p-4 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold shrink-0">
                      {n.participant.split(" ").map((s) => s[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{n.participant}</p>
                        <span className="text-[11px] text-muted-foreground">{n.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section
            title="Upcoming sessions"
            action={
              <Link to="/coach/schedule" className="text-xs text-primary hover:underline">
                Open schedule
              </Link>
            }
          >
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {upcomingSessions.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">No upcoming sessions.</p>
              ) : (
                upcomingSessions.map((s: CoachingSession) => {
                  const p = myParticipants.find((x) => x.id === s.participantId);
                  const Icon = s.type === "video" ? Video : MapPin;
                  return (
                    <Link
                      key={s.id}
                      to="/coach/participants/$id"
                      params={{ id: s.participantId }}
                      className="p-3 flex items-start gap-3 hover:bg-muted/40"
                    >
                      <div className="text-center w-12 shrink-0">
                        <div className="text-[10px] text-muted-foreground uppercase">{s.date.slice(5)}</div>
                        <div className="text-xs font-mono font-semibold tabular-nums">{s.time}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p?.name ?? s.participantId}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{s.objective}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Icon className="h-3 w-3" />
                          {s.type === "video" ? "Video call" : "In-person"}
                          {s.recurring && (
                            <>
                              <Repeat className="h-3 w-3 ml-1" /> {s.recurring}
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </Section>

          <Section
            title="Notifications"
            action={
              <Link to="/coach/notifications" className="text-xs text-primary hover:underline">
                View all
              </Link>
            }
          >
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {myNotifications.slice(0, 5).map((n) => {
                const Icon = n.type === "warning" ? AlertTriangle : n.type === "success" ? CheckCircle2 : Info;
                const color = n.type === "warning" ? "text-warning" : n.type === "success" ? "text-success" : "text-info";
                return (
                  <div key={n.id} className="p-3.5 flex gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Bell; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

function AlertPanel({
  tone,
  icon: Icon,
  title,
  description,
  items,
}: {
  tone: "danger" | "warning";
  icon: typeof Clock;
  title: string;
  description: string;
  items: { id: string; name: string; avatar: string; meta: string }[];
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-warning/40 bg-warning/10",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-8 w-8 rounded-lg grid place-items-center shrink-0",
            tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-warning/25 text-warning-foreground dark:text-warning",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {items.map((it) => (
          <Link
            key={it.id}
            to="/coach/participants/$id"
            params={{ id: it.id }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-card/60 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-card border border-border grid place-items-center text-[10px] font-semibold">
              {it.avatar}
            </div>
            <span className="text-xs font-medium flex-1 truncate">{it.name}</span>
            <span
              className={cn(
                "text-[11px] tabular-nums",
                tone === "danger" ? "text-destructive" : "text-warning-foreground dark:text-warning",
              )}
            >
              {it.meta}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
