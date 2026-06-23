import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  FileWarning,
  CheckCircle2,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Progress, StatusBadge } from "./StatusBadge";
import { getMonitoring } from "./ParticipantCard";
import type { Participant } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Filter = "all" | "delayed" | "deadline" | "docs" | "active" | "completed";
type SortKey = "name" | "remaining" | "progress" | "docs";

export function MonitoringTable({
  participants,
  scope,
}: {
  participants: Participant[];
  scope: "admin" | "coach";
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "remaining",
    dir: "asc",
  });

  const enriched = useMemo(
    () => participants.map((p) => ({ p, m: getMonitoring(p) })),
    [participants],
  );

  const counts = useMemo(() => {
    const delayed = enriched.filter(({ m }) => m.isDelayed || m.isOverdue).length;
    const deadline = enriched.filter(({ m }) => m.isDeadlineSoon && !m.isOverdue).length;
    const docs = enriched.filter(({ m }) => m.missing > 0).length;
    const active = enriched.filter(({ p }) => p.status === "active").length;
    const completed = enriched.filter(({ p }) => p.status === "completed").length;
    const onTrack = enriched.filter(
      ({ m, p }) => !m.isDelayed && !m.isOverdue && p.status !== "completed",
    ).length;
    return { delayed, deadline, docs, active, completed, onTrack, total: enriched.length };
  }, [enriched]);

  const filtered = useMemo(() => {
    let rows = enriched;
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        ({ p }) =>
          p.name.toLowerCase().includes(q) ||
          p.program.toLowerCase().includes(q) ||
          p.coach.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q),
      );
    }
    if (filter === "delayed") rows = rows.filter(({ m }) => m.isDelayed || m.isOverdue);
    if (filter === "deadline") rows = rows.filter(({ m }) => m.isDeadlineSoon && !m.isOverdue);
    if (filter === "docs") rows = rows.filter(({ m }) => m.missing > 0);
    if (filter === "active") rows = rows.filter(({ p }) => p.status === "active");
    if (filter === "completed") rows = rows.filter(({ p }) => p.status === "completed");

    const dir = sort.dir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.p.name.localeCompare(b.p.name) * dir;
        case "remaining":
          return (a.p.remainingDays - b.p.remainingDays) * dir;
        case "progress":
          return (a.p.progress - b.p.progress) * dir;
        case "docs":
          return (a.m.missing - b.m.missing) * dir;
      }
    });
    return rows;
  }, [enriched, query, filter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const chips: { key: Filter; label: string; count: number; tone?: "danger" | "warning" }[] = [
    { key: "all", label: t("mon.filter.all"), count: counts.total },
    { key: "delayed", label: t("mon.filter.delayed"), count: counts.delayed, tone: "danger" },
    { key: "deadline", label: t("mon.filter.deadline"), count: counts.deadline, tone: "warning" },
    { key: "docs", label: t("mon.filter.docs"), count: counts.docs, tone: "warning" },
    { key: "active", label: t("mon.filter.active"), count: counts.active },
    { key: "completed", label: t("mon.filter.completed"), count: counts.completed },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label={t("stat.total")} value={counts.total} hint={`${counts.active} ${t("status.active").toLowerCase()}`} />
        <Kpi
          label={t("stat.onTrack")}
          value={counts.onTrack}
          hint={t("hint.meetingPlan")}
          tone="success"
          icon={CheckCircle2}
        />
        <Kpi
          label={t("stat.delayed")}
          value={counts.delayed}
          hint={t("hint.behindOrOverdue")}
          tone="danger"
          icon={TrendingDown}
        />
        <Kpi
          label={t("stat.deadline14d")}
          value={counts.deadline}
          hint={t("hint.endingSoon")}
          tone="warning"
          icon={Clock}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-b border-border">
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("mon.search")}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border transition-colors",
                  filter === c.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border hover:bg-muted",
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "tabular-nums px-1.5 rounded text-[10px]",
                    filter === c.key
                      ? "bg-background/20"
                      : c.tone === "danger"
                      ? "bg-destructive/15 text-destructive"
                      : c.tone === "warning"
                      ? "bg-warning/20 text-warning-foreground dark:text-warning"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <Th onClick={() => toggleSort("name")}>{t("mon.col.participant")}</Th>
                <Th>{t("mon.col.status")}</Th>
                {scope === "admin" && <Th>{t("mon.col.coach")}</Th>}
                <Th>{t("mon.col.timeline")}</Th>
                <Th onClick={() => toggleSort("remaining")} align="right">
                  {t("mon.col.daysLeft")}
                </Th>
                <Th onClick={() => toggleSort("progress")}>{t("mon.col.completion")}</Th>
                <Th onClick={() => toggleSort("docs")}>{t("mon.col.documents")}</Th>
                <Th>{t("mon.col.alerts")}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ p, m }) => {
                const flags = monitoringFlags(p, m, t);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/coach/participants/$id"
                        params={{ id: p.id }}
                        className="flex items-center gap-3 group"
                      >
                        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground grid place-items-center text-[11px] font-semibold">
                          {p.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate group-hover:underline">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {p.program} · {p.department}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    {scope === "admin" && (
                      <td className="px-4 py-3 text-muted-foreground">{p.coach}</td>
                    )}
                    <td className="px-4 py-3 text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                      {p.startDate} <span className="opacity-50">→</span> {p.endDate}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums font-medium",
                        m.isOverdue && "text-destructive",
                        m.isDeadlineSoon && !m.isOverdue && "text-warning-foreground dark:text-warning",
                      )}
                    >
                      {m.isOverdue ? t("alert.overdue") : t("alert.daysLeft", { n: p.remainingDays })}
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="tabular-nums font-medium">{p.progress}%</span>
                        <span
                          className={cn(
                            "tabular-nums text-[10px]",
                            m.delta < 0 ? "text-destructive" : "text-success",
                          )}
                        >
                          {m.delta > 0 ? "+" : ""}
                          {t("mon.versusPlan", { d: m.delta })}
                        </span>
                      </div>
                      <Progress
                        value={p.progress}
                        expected={m.expectedProgress}
                        tone={m.delta < -15 ? "danger" : m.delta < -5 ? "warning" : "default"}
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="tabular-nums">
                          <span className="font-medium">{p.submittedDocs}</span>
                          <span className="text-muted-foreground">/{p.requiredDocs}</span>
                        </span>
                        {m.missing > 0 ? (
                          <span className="text-destructive text-[10px]">{t("mon.missing", { n: m.missing })}</span>
                        ) : (
                          <span className="text-success text-[10px]">{t("mon.complete")}</span>
                        )}
                      </div>
                      <Progress
                        value={m.docsPct}
                        tone={m.docsCritical ? "danger" : m.missing > 0 ? "warning" : "success"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {flags.length === 0 ? (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        ) : (
                          flags.map((f) => {
                            const Icon = f.icon;
                            return (
                              <span
                                key={f.label}
                                title={f.label}
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
                                  f.tone === "danger"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-warning/15 text-warning-foreground dark:text-warning border-warning/30",
                                )}
                              >
                                <Icon className="h-3 w-3" />
                                {f.label}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={scope === "admin" ? 8 : 7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {t("mon.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function monitoringFlags(
  p: Participant,
  m: ReturnType<typeof getMonitoring>,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const flags: { tone: "danger" | "warning"; label: string; icon: typeof Clock }[] = [];
  if (m.isOverdue) flags.push({ tone: "danger", label: t("alert.overdue"), icon: AlertTriangle });
  if (m.isDelayed && !m.isOverdue)
    flags.push({ tone: "danger", label: t("alert.behind", { p: Math.abs(m.delta) }), icon: TrendingDown });
  if (m.isDeadlineSoon && !m.isOverdue)
    flags.push({ tone: "warning", label: t("alert.daysLeft", { n: p.remainingDays }), icon: Clock });
  if (m.docsCritical) flags.push({ tone: "warning", label: t("mon.docsLabel", { n: m.missing }), icon: FileWarning });
  return flags;
}

function Th({
  children,
  onClick,
  align = "left",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn("px-4 py-2.5 font-medium", align === "right" ? "text-right" : "text-left")}
    >
      {onClick ? (
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {children}
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: typeof Clock;
}) {
  const toneCls = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning-foreground dark:text-warning",
    danger: "text-destructive",
  }[tone];
  const bgCls = {
    default: "bg-muted",
    success: "bg-success/15",
    warning: "bg-warning/20",
    danger: "bg-destructive/15",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {Icon && (
          <span className={cn("h-7 w-7 rounded-lg grid place-items-center", bgCls, toneCls)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight tabular-nums", toneCls)}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}
