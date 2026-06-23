import { cn } from "@/lib/utils";
import type { DocRequestStatus, DocPriority } from "@/lib/doc-requests-store";
import { useI18n } from "@/lib/i18n";

const map: Record<DocRequestStatus, { cls: string }> = {
  requested: { cls: "bg-info/10 text-info border-info/20" },
  pending: { cls: "bg-muted text-muted-foreground border-border" },
  submitted: { cls: "bg-primary/10 text-primary border-primary/20" },
  "under-review": { cls: "bg-warning/15 text-warning-foreground dark:text-warning border-warning/30" },
  approved: { cls: "bg-success/15 text-success border-success/30" },
  rejected: { cls: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function DocStatusBadge({ status }: { status: DocRequestStatus }) {
  const { t } = useI18n();
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border",
        m.cls,
      )}
    >
      {t(`doc.status.${status}`)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: DocPriority }) {
  const { t } = useI18n();
  const isUrgent = priority === "urgent";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border",
        isUrgent
          ? "bg-destructive/10 text-destructive border-destructive/30"
          : "bg-muted text-muted-foreground border-border",
      )}
    >
      {t(`doc.priority.${priority}`)}
    </span>
  );
}
