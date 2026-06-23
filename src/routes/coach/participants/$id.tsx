import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Progress, StatusBadge } from "@/components/StatusBadge";
import {
  participants,
  attendanceWeek,
  monthlyPlan,
  participantTasks,
  recentNotes,
  getParticipantActivity,
} from "@/lib/mock-data";
import { FileLibrary } from "@/components/FileLibrary";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { getMonitoring } from "@/components/ParticipantCard";
import { ArrowLeft, Mail, Plus, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach/participants/$id")({
  head: ({ params }) => ({ meta: [{ title: `Participant ${params.id} — GBNews` }] }),
  loader: ({ params }) => {
    const p = participants.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { participant: p };
  },
  component: ParticipantProfile,
});

function ParticipantProfile() {
  const { participant: p } = Route.useLoaderData();
  const m = getMonitoring(p);
  const activity = getParticipantActivity(p.id);

  return (
    <AppShell role="coach" title="Participant profile">
      <Link to="/coach" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground grid place-items-center text-lg font-semibold">
            {p.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold">{p.name}</h1>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{p.program} · {p.department}</p>
            <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {p.email}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center sm:text-right">
            <Stat label="Start" value={p.startDate.slice(5)} />
            <Stat label="End" value={p.endDate.slice(5)} />
            <Stat label="Days left" value={p.remainingDays.toString()} />
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-medium">
              {p.progress}%
              <span className={cn("ml-2 text-[11px]", m.delta < 0 ? "text-destructive" : "text-success")}>
                {m.delta > 0 ? "+" : ""}{m.delta}% vs plan
              </span>
            </span>
          </div>
          <Progress value={p.progress} expected={m.expectedProgress} tone={m.delta < -15 ? "danger" : m.delta < -5 ? "warning" : "default"} />
        </div>
      </div>

      {(m.isOverdue || m.isDeadlineSoon || m.missing > 0) && (
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {(m.isOverdue || m.isDeadlineSoon) && (
            <AlertTile
              tone={m.isOverdue ? "danger" : "warning"}
              icon={Clock}
              title={m.isOverdue ? "Program overdue" : `Ends in ${p.remainingDays} days`}
              hint={`Ends ${p.endDate}`}
            />
          )}
          {m.missing > 0 && (
            <AlertTile
              tone="danger"
              icon={AlertTriangle}
              title={`${m.missing} required document${m.missing > 1 ? "s" : ""} missing`}
              hint={`${p.submittedDocs}/${p.requiredDocs} submitted`}
            />
          )}
          {m.delta < -5 && (
            <AlertTile
              tone="warning"
              icon={AlertTriangle}
              title={`Behind plan by ${Math.abs(m.delta)}%`}
              hint={`Expected ${m.expectedProgress}% · actual ${p.progress}%`}
            />
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Activity timeline">
            <ActivityTimeline events={activity} />
          </Card>

          <Card title="Files & required documents">
            <FileLibrary mode="coach" participantId={p.id} title={`${p.name}'s files`} />
          </Card>

          <Card title="Monthly plan">
            <div className="space-y-2">
              {monthlyPlan.map((m) => (
                <div key={m.week} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                  <div className="text-xs font-medium w-16">{m.week}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.focus}</p>
                    <p className="text-[11px] text-muted-foreground">Milestone: {m.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Notes" action={<button className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border hover:bg-muted"><Plus className="h-3.5 w-3.5" /> New note</button>}>
            <div className="space-y-3">
              {recentNotes.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{n.participant}</p>
                    <span className="text-[11px] text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="text-sm mt-1">{n.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="This week's attendance">
            <div className="grid grid-cols-7 gap-1.5">
              {attendanceWeek.map((d) => {
                const color =
                  d.status === "present" ? "bg-success/20 text-success" :
                  d.status === "remote" ? "bg-info/20 text-info" :
                  d.status === "absent" ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground";
                return (
                  <div key={d.day} className={`rounded-lg p-2 text-center ${color}`}>
                    <p className="text-[10px] uppercase font-medium">{d.day}</p>
                    <p className="text-[10px] mt-1 capitalize">{d.status}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-lg font-semibold">92%</p>
                <p className="text-[11px] text-muted-foreground">Month attendance</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-lg font-semibold">3</p>
                <p className="text-[11px] text-muted-foreground">Late arrivals</p>
              </div>
            </div>
          </Card>

          <Card title="Tasks">
            <div className="space-y-2">
              {participantTasks.map((t) => (
                <label key={t.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 cursor-pointer">
                  <input type="checkbox" defaultChecked={t.done} className="mt-0.5 accent-primary" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    <p className="text-[11px] text-muted-foreground">Due {t.due}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card title="Progress tracking">
            <div className="space-y-3">
              {[
                { label: "Onboarding", value: 100 },
                { label: "Department fundamentals", value: 80 },
                { label: "Operational shadowing", value: 55 },
                { label: "Mid-program review", value: 20 },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{p.label}</span>
                    <span className="text-muted-foreground">{p.value}%</span>
                  </div>
                  <Progress value={p.value} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
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

function AlertTile({
  tone,
  icon: Icon,
  title,
  hint,
}: {
  tone: "danger" | "warning";
  icon: typeof Clock;
  title: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex items-start gap-3",
        tone === "danger" ? "border-destructive/30 bg-destructive/5" : "border-warning/40 bg-warning/10",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-lg grid place-items-center shrink-0",
          tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-warning/25 text-warning-foreground dark:text-warning",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
