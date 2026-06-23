import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Progress, StatusBadge } from "@/components/StatusBadge";
import { useAdminStore } from "@/lib/admin-store";
import { Users, UserCog, Building2, FileText, TrendingUp, Download, Search, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — GBNews Operations" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useI18n();
  const participants = useAdminStore((s) => s.participants);
  const coaches = useAdminStore((s) => s.coaches);
  const departments = useAdminStore((s) => s.departments);
  const active = participants.filter((p) => p.status === "active").length;
  const atRisk = participants.filter((p) => p.status === "at-risk").length;
  const totalFiles = 248;

  return (
    <AppShell role="admin" title={t("page.adminOverview")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Users} label={t("stat.participants")} value={participants.length.toString()} hint={t("hint.activeAtRisk", { active, risk: atRisk })} />
        <Stat icon={UserCog} label={t("stat.coaches")} value={coaches.length.toString()} hint={t("hint.allDepartments")} />
        <Stat icon={Building2} label={t("stat.departments")} value={departments.length.toString()} hint={t("hint.activeLeads", { n: 5 })} />
        <Stat icon={FileText} label={t("stat.filesStored")} value={totalFiles.toString()} hint={t("hint.thisWeek", { n: 12 })} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{t("section.allParticipants")}</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input placeholder={t("misc.search")} className="h-8 pl-8 pr-3 text-xs rounded-lg bg-muted border border-transparent focus:border-ring focus:outline-none w-44" />
              </div>
              <Link to="/admin/participants" className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border hover:bg-muted">
                <Plus className="h-3.5 w-3.5" /> {t("btn.manage")}
              </Link>
              <button className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border hover:bg-muted">
                <Download className="h-3.5 w-3.5" /> {t("btn.export")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-left font-medium py-2.5 px-5">{t("mon.col.participant")}</th>
                  <th className="text-left font-medium py-2.5">{t("mon.col.coach")}</th>
                  <th className="text-left font-medium py-2.5">{t("mon.col.status")}</th>
                  <th className="text-left font-medium py-2.5 w-32">{t("misc.overallProgress")}</th>
                  <th className="text-left font-medium py-2.5">{t("misc.docs")}</th>
                  <th className="text-left font-medium py-2.5 px-5">{t("misc.daysLeft")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground grid place-items-center text-[11px] font-semibold">{p.avatar}</div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{p.coach}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="w-20" />
                        <span className="text-[11px] text-muted-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="text-xs">{p.submittedDocs}/{p.requiredDocs}</td>
                    <td className="text-xs px-5">{p.remainingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <Card title={t("section.attendanceOverview")}>
            <div className="space-y-3">
              {departments.slice(0, 4).map((d) => {
                const value = 70 + ((d.id.charCodeAt(1) * 7) % 25);
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
          </Card>

          <Card title={t("section.analytics")}>
            <div className="grid grid-cols-2 gap-3">
              <Mini label={t("stat.completionRate")} value="87%" trend="+4%" />
              <Mini label={t("stat.onTimeDocs")} value="74%" trend="+2%" />
              <Mini label={t("stat.avgProgress")} value="58%" trend="+6%" />
              <Mini label={t("stat.activeCohorts")} value="12" trend="+1" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={t("section.coaches")}>
          <div className="divide-y divide-border">
            {coaches.map((c) => (
              <div key={c.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold">
                  {c.name.split(" ").map((s) => s[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.email} · {c.department}</p>
                </div>
                <span className="text-xs text-muted-foreground">{t("hint.participantCount", { n: c.participants })}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("section.departments")}>
          <div className="divide-y divide-border">
            {departments.map((d) => (
              <div key={d.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t("misc.lead", { name: d.lead })}</p>
                </div>
                <span className="text-xs text-muted-foreground">{t("hint.memberCount", { n: d.members })}</span>
              </div>
            ))}
          </div>
        </Card>
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
      <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

function Mini({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
      <p className="text-[10px] text-success inline-flex items-center gap-0.5 mt-0.5">
        <TrendingUp className="h-3 w-3" /> {trend}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
