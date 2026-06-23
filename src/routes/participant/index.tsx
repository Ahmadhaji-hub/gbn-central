import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Progress } from "@/components/StatusBadge";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import {
  participantTasks,
  getParticipantFiles,
  getMissingDocs,
  getParticipantActivity,
  participants,
  CURRENT_PARTICIPANT_ID,
  getParticipantSessions,
  getParticipantPlan,
  getParticipantNotifications,
  TODAY,
} from "@/lib/mock-data";
import { Bell, Calendar, CheckSquare, FileText, AlertTriangle, CheckCircle2, Info, ArrowRight, Clock, Video, MapPin, Repeat, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/participant/")({
  head: () => ({ meta: [{ title: "My Workspace — GBNews" }] }),
  component: ParticipantDashboard,
});

function translateDue(due: string, t: (k: string, v?: Record<string, string | number>) => string) {
  if (due === "Tomorrow") return t("due.tomorrow");
  return due;
}

function translateTaskTitle(id: string, fallback: string, t: (k: string) => string) {
  const key = `task.${id}`;
  const v = t(key);
  return v === key ? fallback : v;
}

function ParticipantDashboard() {
  const { t, locale } = useI18n();
  return (
    <AppShell role="participant" title={t("page.participantWorkspace")}>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-primary/5 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("welcome.back", { name: t("p.welcomeName") })}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t("p.welcomeIntro")}</p>
          </div>
          <div className="sm:ml-auto w-full sm:w-72">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{t("welcome.programProgress")}</span>
              <span className="font-medium">85%</span>
            </div>
            <Progress value={85} />
            <p className="text-[11px] text-muted-foreground mt-2">{t("p.daysRemainingLine")}</p>
          </div>
        </div>
      </div>

      {(() => {
        const me = participants.find((p) => p.id === "p1")!;
        const missing = getMissingDocs("p1");
        const alerts: { tone: "danger" | "warning"; icon: typeof Clock; title: string; hint: string }[] = [];
        if (me.remainingDays <= 45) alerts.push({ tone: "warning", icon: Clock, title: t("p.daysRemaining", { n: me.remainingDays }), hint: t("p.programEnds", { date: me.endDate }) });
        if (missing.length > 0) alerts.push({ tone: "danger", icon: AlertTriangle, title: t("p.docsMissing", { n: missing.length }), hint: missing.map((m) => m.label).slice(0, 2).join(", ") + (missing.length > 2 ? "…" : "") });
        const upcomingTask = participantTasks.find((tk) => !tk.done);
        if (upcomingTask) alerts.push({ tone: "warning", icon: CheckSquare, title: t("p.taskDue", { title: translateTaskTitle(upcomingTask.id, upcomingTask.title, t) }), hint: t("p.due", { date: translateDue(upcomingTask.due, t) }) });
        if (alerts.length === 0) return null;
        return (
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border p-4 flex items-start gap-3",
                  a.tone === "danger" ? "border-destructive/30 bg-destructive/5" : "border-warning/40 bg-warning/10",
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                  a.tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-warning/25 text-warning-foreground dark:text-warning",
                )}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.hint}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {(() => {
        const upcoming = getParticipantSessions(CURRENT_PARTICIPANT_ID).filter((s) => s.date >= TODAY && s.status === "scheduled");
        const myNotifs = getParticipantNotifications(CURRENT_PARTICIPANT_ID);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat icon={FileText} label={t("stat.myFiles")} value={getParticipantFiles(CURRENT_PARTICIPANT_ID).length.toString()} />
            <Stat icon={CheckSquare} label={t("stat.openTasks")} value={participantTasks.filter((tk) => !tk.done).length.toString()} />
            <Stat icon={Calendar} label={t("stat.upcomingSessions")} value={upcoming.length.toString()} />
            <Stat icon={Bell} label={t("stat.notifications")} value={myNotifs.length.toString()} />
          </div>
        );
      })()}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t("section.myTasks")}>
            <div className="space-y-2">
              {participantTasks.map((tk) => (
                <label key={tk.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 cursor-pointer">
                  <input type="checkbox" defaultChecked={tk.done} className="mt-0.5 accent-primary" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${tk.done ? "line-through text-muted-foreground" : "font-medium"}`}>{translateTaskTitle(tk.id, tk.title, t)}</p>
                    <p className="text-[11px] text-muted-foreground">{t("p.due", { date: translateDue(tk.due, t) })}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card
            title={t("section.myFiles")}
            action={
              <Link
                to="/participant/files"
                className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border hover:bg-muted"
              >
                {t("btn.openLibrary")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {getParticipantFiles("p1").slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-3">
                  <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">{f.category} · {f.size} · {f.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t("section.requiredDocs")}>
            <div className="grid sm:grid-cols-2 gap-2">
              {(() => {
                const missing = new Set<string>(getMissingDocs("p1").map((m) => m.key));
                return [
                  ...getMissingDocs("p1").map((d) => ({ key: d.key, label: d.label, status: "missing" as const })),
                  ...getParticipantFiles("p1")
                    .filter((f) => f.requirementKey && !missing.has(f.requirementKey))
                    .map((f) => ({ key: f.requirementKey!, label: f.name, status: "submitted" as const })),
                ].map((d) => (
                  <div key={d.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
                    {d.status === "submitted" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm flex-1">{d.label}</span>
                    <span className={`text-[10px] uppercase ${d.status === "submitted" ? "text-success" : "text-destructive"}`}>
                      {d.status === "submitted" ? t("doc.submitted") : t("doc.missing")}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </Card>

          <Card title={t("section.myActivity")}>
            <ActivityTimeline events={getParticipantActivity("p1")} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t("section.myCoach")}>
            {(() => {
              const me = participants.find((p) => p.id === CURRENT_PARTICIPANT_ID)!;
              const next = getParticipantSessions(CURRENT_PARTICIPANT_ID).find((s) => s.date >= TODAY && s.status === "scheduled");
              return (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{me.coach}</p>
                    <p className="text-[11px] text-muted-foreground">{t("p.deptSuffix", { dept: me.department })}</p>
                    {next && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("p.next", {
                          date: new Date(next.date + "T00:00:00").toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" }),
                          time: next.time,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </Card>

          <Card
            title={t("section.upcomingCoaching")}
            action={
              <Link to="/participant/schedule" className="text-xs text-primary hover:underline">
                {t("sched.viewSchedule")}
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {getParticipantSessions(CURRENT_PARTICIPANT_ID)
                .filter((s) => s.date >= TODAY && s.status === "scheduled")
                .slice(0, 4)
                .map((s) => {
                  const Icon = s.type === "video" ? Video : MapPin;
                  return (
                    <div key={s.id} className="py-3 flex items-start gap-3">
                      <div className="text-center w-12 shrink-0">
                        <div className="text-[10px] uppercase text-muted-foreground">{s.date.slice(5)}</div>
                        <div className="text-xs font-mono font-semibold">{s.time}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.objective}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Icon className="h-3 w-3" />
                          {s.type === "video" ? t("sched.video") : t("sched.inPerson")} · {s.location}
                          {s.recurring && (
                            <>
                              <Repeat className="h-3 w-3 ml-1" />
                              {t(`p.recurring.${s.recurring}`)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {(() => {
            const plan = getParticipantPlan(CURRENT_PARTICIPANT_ID);
            if (!plan) return null;
            return (
              <Card title={t("section.thisMonthPlan")}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("field.focus")}</p>
                <p className="text-sm font-medium">{plan.focus}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-3">{t("field.objectives")}</p>
                <ul className="mt-1 space-y-1">
                  {plan.objectives.map((o, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mt-1 shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })()}

          <Card
            title={t("notif.title")}
            action={
              <Link to="/participant/notifications" className="text-xs text-primary hover:underline">
                {t("btn.viewAll")}
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {getParticipantNotifications(CURRENT_PARTICIPANT_ID).slice(0, 5).map((n) => {
                const Icon = n.type === "warning" ? AlertTriangle : n.type === "success" ? CheckCircle2 : Info;
                const color = n.type === "warning" ? "text-warning" : n.type === "success" ? "text-success" : "text-info";
                return (
                  <div key={n.id} className="py-3 flex gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
