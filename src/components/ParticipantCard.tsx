import { Link } from "@tanstack/react-router";
import { Calendar, FileCheck2, FileWarning, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Progress, StatusBadge } from "./StatusBadge";
import type { Participant } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

function daysBetween(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function getMonitoring(p: Participant) {
  const total = daysBetween(p.startDate, p.endDate);
  const elapsed = Math.max(0, total - p.remainingDays);
  const expectedProgress = Math.round((elapsed / total) * 100);
  const delta = p.progress - expectedProgress;
  const missing = p.requiredDocs - p.submittedDocs;
  const docsPct = Math.round((p.submittedDocs / p.requiredDocs) * 100);

  const isDelayed = delta <= -15 || p.status === "at-risk";
  const isDeadlineSoon = p.remainingDays > 0 && p.remainingDays <= 14;
  const isOverdue = p.remainingDays <= 0 && p.status !== "completed";
  const docsCritical = missing >= 3;

  return { total, elapsed, expectedProgress, delta, missing, docsPct, isDelayed, isDeadlineSoon, isOverdue, docsCritical };
}

export function ParticipantCard({ p }: { p: Participant }) {
  const { t } = useI18n();
  const m = getMonitoring(p);

  const flags: { tone: "danger" | "warning"; label: string; icon: typeof Clock }[] = [];
  if (m.isOverdue) flags.push({ tone: "danger", label: t("alert.overdue"), icon: AlertTriangle });
  if (m.isDelayed && !m.isOverdue) flags.push({ tone: "danger", label: t("alert.behind", { p: Math.abs(m.delta) }), icon: TrendingUp });
  if (m.isDeadlineSoon && !m.isOverdue) flags.push({ tone: "warning", label: t("alert.daysLeft", { n: p.remainingDays }), icon: Clock });
  if (m.docsCritical) flags.push({ tone: "warning", label: t("alert.docsMissing", { n: m.missing }), icon: FileWarning });

  const accentBar =
    p.status === "at-risk" || m.isOverdue
      ? "bg-destructive"
      : m.isDeadlineSoon || m.docsCritical
      ? "bg-warning"
      : p.status === "completed"
      ? "bg-info"
      : "bg-success";

  return (
    <Link
      to="/coach/participants/$id"
      params={{ id: p.id }}
      className="group relative block rounded-2xl border border-border bg-card hover:border-ring/60 hover:shadow-sm transition-all overflow-hidden"
    >
      <span className={cn("absolute left-0 top-0 bottom-0 w-0.5", accentBar)} />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-full bg-accent text-accent-foreground grid place-items-center text-sm font-semibold shrink-0">
            {p.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold truncate">{p.name}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{p.program}</p>
          </div>
        </div>

        {flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {flags.map((f) => {
              const Icon = f.icon;
              return (
                <span
                  key={f.label}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                    f.tone === "danger"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-warning/15 text-warning-foreground dark:text-warning border-warning/30",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Cell label={t("misc.start")} value={p.startDate.slice(5)} />
          <Cell label={t("misc.end")} value={p.endDate.slice(5)} />
          <Cell
            label={t("misc.daysLeft")}
            value={p.remainingDays.toString()}
            tone={m.isOverdue ? "danger" : m.isDeadlineSoon ? "warning" : "default"}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground">{t("misc.completion")}</span>
            <span className="font-medium tabular-nums">
              {p.progress}%
              {m.delta !== 0 && (
                <span className={cn("ml-1.5 text-[10px]", m.delta < 0 ? "text-destructive" : "text-success")}>
                  {m.delta > 0 ? "+" : ""}
                  {t("mon.versusPlan", { d: m.delta })}
                </span>
              )}
            </span>
          </div>
          <Progress value={p.progress} expected={m.expectedProgress} tone={m.delta < -15 ? "danger" : m.delta < -5 ? "warning" : "default"} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground">{t("misc.documents")}</span>
            <span className="tabular-nums text-muted-foreground">
              <span className="text-foreground font-medium">{p.submittedDocs}</span>/{p.requiredDocs}
              {m.missing > 0 && (
                <span className="ml-1.5 text-destructive">· {t("mon.missing", { n: m.missing })}</span>
              )}
            </span>
          </div>
          <Progress value={m.docsPct} tone={m.docsCritical ? "danger" : m.missing > 0 ? "warning" : "success"} />
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FileCheck2 className="h-3 w-3" /> {p.submittedDocs} {t("misc.submitted")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {p.coach}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Cell({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-lg py-2",
        tone === "danger" ? "bg-destructive/10" : tone === "warning" ? "bg-warning/15" : "bg-muted/60",
      )}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-xs font-semibold mt-0.5 tabular-nums",
          tone === "danger" && "text-destructive",
          tone === "warning" && "text-warning-foreground dark:text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}
