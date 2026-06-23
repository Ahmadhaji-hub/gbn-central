import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center",
        className,
      )}
    >
      <div className="mx-auto h-10 w-10 rounded-xl bg-muted grid place-items-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mt-3">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card animate-pulse"
        >
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-muted" />
            <div className="h-2 w-1/3 rounded bg-muted/70" />
          </div>
          <div className="h-2 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
