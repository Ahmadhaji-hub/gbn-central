import {
  FileUp,
  FileCheck2,
  StickyNote,
  CheckCircle2,
  ListChecks,
  Award,
  Users,
  RefreshCw,
  Clock,
  AlertTriangle,
  CalendarCheck2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/lib/mock-data";
import { EmptyState } from "./EmptyState";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const meta: Record<
  ActivityType,
  { icon: LucideIcon; tone: "default" | "success" | "warning" | "danger" | "info" }
> = {
  file_uploaded: { icon: FileUp, tone: "info" },
  file_reviewed: { icon: FileCheck2, tone: "success" },
  note_added: { icon: StickyNote, tone: "default" },
  task_completed: { icon: CheckCircle2, tone: "success" },
  task_assigned: { icon: ListChecks, tone: "default" },
  milestone_reached: { icon: Award, tone: "success" },
  meeting_held: { icon: Users, tone: "info" },
  status_changed: { icon: RefreshCw, tone: "warning" },
  deadline_alert: { icon: Clock, tone: "warning" },
  missing_doc: { icon: AlertTriangle, tone: "danger" },
  attendance: { icon: CalendarCheck2, tone: "default" },
  message: { icon: MessageSquare, tone: "default" },
};

const toneStyle = {
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
} as const;

function fmtDate(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: "short", day: "2-digit" });
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const { t, locale } = useI18n();
  if (events.length === 0) {
    return (
      <EmptyState
        title={t("act.empty.title")}
        description={t("act.empty.desc")}
      />
    );
  }

  return (
    <ol className="relative">
      <span className="absolute left-[15px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {events.map((e, idx) => {
        const m = meta[e.type];
        const Icon = m.icon;
        return (
          <li key={e.id} className={cn("relative pl-10", idx < events.length - 1 && "pb-5")}>
            <span
              className={cn(
                "absolute left-0 top-0 h-8 w-8 rounded-full grid place-items-center border",
                toneStyle[m.tone],
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-sm font-medium leading-tight">{e.title}</p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {fmtDate(e.date, locale)} · {e.time}
              </span>
            </div>
            {e.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{e.description}</p>
            )}
            <p className="text-[11px] text-muted-foreground/80 mt-1">{t("act.by")} {e.actor}</p>
          </li>
        );
      })}
    </ol>
  );
}
