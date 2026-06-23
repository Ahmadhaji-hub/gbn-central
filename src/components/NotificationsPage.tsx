import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import {
  useNotifications,
  getNotificationsFor,
  markAllRead,
  markRead,
  unreadCountFor,
  type Audience,
} from "@/lib/notifications-store";
import { useI18n } from "@/lib/i18n";
import { Bell, AlertTriangle, CheckCircle2, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Filter = "all" | "unread" | "read";

export function NotificationsPage({
  role,
  audience,
  recipient,
  intro,
}: {
  role: "admin" | "coach" | "participant";
  audience: Audience;
  recipient: string;
  intro: string;
}) {
  useNotifications();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");

  const all = getNotificationsFor(audience, recipient);
  const unread = unreadCountFor(audience, recipient);
  const notifs = all.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.read,
  );

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t("notif.filter.all"), count: all.length },
    { key: "unread", label: t("notif.filter.unread"), count: unread },
    { key: "read", label: t("notif.filter.read"), count: all.length - unread },
  ];

  return (
    <AppShell role={role} title={t("notif.title")}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">{intro}</p>
        {unread > 0 && (
          <button
            onClick={() => markAllRead(audience, recipient)}
            className="h-9 px-3 inline-flex items-center gap-1.5 text-xs rounded-lg border border-border hover:bg-muted"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("header.markAllRead")}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-muted w-fit">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "h-8 px-3 text-xs rounded-md inline-flex items-center gap-1.5 transition-colors",
              filter === f.key
                ? "bg-background shadow-sm font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                filter === f.key ? "bg-primary/15 text-primary" : "bg-background/60",
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon={Bell} title={t("notif.empty.title")} description={t("notif.empty.desc")} />
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border max-w-3xl">
          {notifs.map((n) => {
            const Icon =
              n.type === "warning" ? AlertTriangle : n.type === "success" ? CheckCircle2 : Info;
            const color =
              n.type === "warning"
                ? "text-warning"
                : n.type === "success"
                  ? "text-success"
                  : "text-info";
            return (
              <button
                type="button"
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  "w-full text-left p-4 flex gap-3 hover:bg-muted/40 transition-colors",
                  !n.read && "bg-primary/5",
                )}
              >
                <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug font-medium">{n.title}</p>
                  {n.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
