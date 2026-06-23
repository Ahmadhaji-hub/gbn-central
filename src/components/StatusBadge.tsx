import { cn } from "@/lib/utils";
import type { ParticipantStatus } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

const styles: Record<ParticipantStatus, string> = {
  active: "bg-success/15 text-success border-success/20",
  "at-risk": "bg-destructive/15 text-destructive border-destructive/20",
  completed: "bg-info/15 text-info border-info/20",
  pending: "bg-warning/20 text-warning-foreground border-warning/30 dark:text-warning",
};

const labelKeys: Record<ParticipantStatus, string> = {
  active: "status.active",
  "at-risk": "status.atRisk",
  completed: "status.completed",
  pending: "status.pending",
};

export function StatusBadge({ status }: { status: ParticipantStatus }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border", styles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(labelKeys[status])}
    </span>
  );
}

type ProgressTone = "default" | "success" | "warning" | "danger";

const toneClass: Record<ProgressTone, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

export function Progress({
  value,
  expected,
  tone = "default",
  className,
}: {
  value: number;
  expected?: number;
  tone?: ProgressTone;
  className?: string;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative h-1.5 w-full rounded-full bg-muted overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all", toneClass[tone])}
        style={{ width: `${v}%` }}
      />
      {typeof expected === "number" && (
        <span
          className="absolute top-0 bottom-0 w-px bg-foreground/40"
          style={{ left: `${Math.min(100, Math.max(0, expected))}%` }}
          aria-label={`Expected ${expected}%`}
        />
      )}
    </div>
  );
}
