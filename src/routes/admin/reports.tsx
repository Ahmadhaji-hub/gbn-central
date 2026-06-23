import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { participants, coaches, departments } from "@/lib/mock-data";
import { TrendingUp, Download, Users, FileCheck, AlertTriangle, Clock } from "lucide-react";
import { Progress } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — GBNews" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const total = participants.length;
  const active = participants.filter((p) => p.status === "active").length;
  const atRisk = participants.filter((p) => p.status === "at-risk").length;
  const completed = participants.filter((p) => p.status === "completed").length;
  const avgProgress = Math.round(participants.reduce((a, p) => a + p.progress, 0) / total);
  const docCompliance = Math.round(
    (participants.reduce((a, p) => a + p.submittedDocs, 0) /
      participants.reduce((a, p) => a + p.requiredDocs, 0)) * 100,
  );

  return (
    <AppShell role="admin" title="Reports">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Operational reports across all cohorts and departments.</p>
        <button className="text-xs inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-border hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Users} label="Total participants" value={total.toString()} hint={`${active} active`} />
        <Stat icon={FileCheck} label="Doc compliance" value={`${docCompliance}%`} hint="Submitted / required" />
        <Stat icon={AlertTriangle} label="At risk" value={atRisk.toString()} hint="Needs follow-up" />
        <Stat icon={Clock} label="Avg. progress" value={`${avgProgress}%`} hint={`${completed} completed`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Progress by department</h2>
          <div className="space-y-3">
            {departments.map((d) => {
              const inDept = participants.filter((p) => p.department === d.name);
              const value = inDept.length
                ? Math.round(inDept.reduce((a, p) => a + p.progress, 0) / inDept.length)
                : 0;
              return (
                <div key={d.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">{value}%</span>
                  </div>
                  <Progress value={value} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Coach load</h2>
          <div className="space-y-3">
            {coaches.map((c) => {
              const assigned = participants.filter((p) => p.coach === c.name).length;
              return (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.department}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{assigned} participants</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-[11px] text-success inline-flex items-center gap-0.5 mt-0.5">
        <TrendingUp className="h-3 w-3" /> {hint}
      </p>
    </div>
  );
}
