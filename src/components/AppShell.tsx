import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
  Settings,
  LogOut,
  Search,
  Building2,
  BarChart3,
  ClipboardList,
  UserCog,
  CalendarOff,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import gbLogo from "@/assets/gbnews-logo-trimmed.png";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CURRENT_COACH, CURRENT_PARTICIPANT_ID } from "@/lib/mock-data";
import { ADMIN_RECIPIENT } from "@/lib/notifications-store";
import {
  useNotifications,
  getNotificationsFor,
  unreadCountFor,
  markAllRead,
  markRead,
  type Audience,
  type AppNotification,
} from "@/lib/notifications-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

type Role = "admin" | "coach" | "participant";

type NavItem = { to: string; labelKey: string; icon: typeof Users };

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin", labelKey: "nav.overview", icon: LayoutDashboard },
    { to: "/admin/participants", labelKey: "nav.participants", icon: Users },
    { to: "/admin/monitoring", labelKey: "nav.monitoring", icon: ClipboardList },
    { to: "/admin/coaches", labelKey: "nav.coaches", icon: UserCog },
    { to: "/admin/departments", labelKey: "nav.departments", icon: Building2 },
    { to: "/admin/files", labelKey: "nav.files", icon: FileText },
    { to: "/admin/documents", labelKey: "nav.documents", icon: ClipboardList },
    { to: "/admin/absences", labelKey: "nav.absences", icon: CalendarOff },
    { to: "/admin/reports", labelKey: "nav.reports", icon: BarChart3 },
    { to: "/admin/notifications", labelKey: "nav.notifications", icon: Bell },
  ],
  coach: [
    { to: "/coach", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/coach/participants", labelKey: "nav.participants", icon: Users },
    { to: "/coach/files", labelKey: "nav.files", icon: FileText },
    { to: "/coach/documents", labelKey: "nav.documents", icon: ClipboardList },
    { to: "/coach/absences", labelKey: "nav.absences", icon: CalendarOff },
    { to: "/coach/schedule", labelKey: "nav.schedule", icon: Calendar },
    { to: "/coach/notifications", labelKey: "nav.notifications", icon: Bell },
  ],
  participant: [
    { to: "/participant", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/participant/files", labelKey: "nav.myFiles", icon: FileText },
    { to: "/participant/documents", labelKey: "nav.documents", icon: ClipboardList },
    { to: "/participant/absence", labelKey: "nav.absenceRequest", icon: CalendarOff },
    { to: "/participant/schedule", labelKey: "nav.schedule", icon: Calendar },
    { to: "/participant/notifications", labelKey: "nav.notifications", icon: Bell },
  ],
};

const roleUser: Record<Role, { name: string; initials: string }> = {
  admin: { name: "Eva Martín", initials: "EM" },
  coach: { name: "Fatima Zouhra", initials: "FZ" },
  participant: { name: "Ahmad Haji", initials: "AH" },
};

function audienceFor(role: Role): { audience: Audience; recipient: string } {
  if (role === "coach") return { audience: "coach", recipient: CURRENT_COACH };
  if (role === "participant")
    return { audience: "participant", recipient: CURRENT_PARTICIPANT_ID };
  return { audience: "admin", recipient: ADMIN_RECIPIENT };
}

export function AppShell({ role, title, children }: { role: Role; title: string; children: ReactNode }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  const { t } = useI18n();

  const nav = navByRole[role];
  const user = roleUser[role];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <Link to="/" className="flex items-center px-5 h-16 border-b border-sidebar-border">
          <img src={gbLogo} alt="GBNews" className="h-7 w-auto object-contain select-none" draggable={false} />
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item, i) => {
            const Icon = item.icon;
            const overviewPaths = ["/admin", "/coach", "/participant"];
            const active = overviewPaths.includes(item.to)
              ? path === item.to
              : path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={i}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            to={role === "admin" ? "/admin/settings" : role === "coach" ? "/coach/settings" : "/participant/settings"}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          >
            <Settings className="h-4 w-4" /> {t("nav.settings")}
          </Link>
          <Link to="/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
            <LogOut className="h-4 w-4" /> {t("nav.signout")}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center gap-4 px-4 sm:px-6 bg-background/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h1 className="text-base font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">
              {t(`role.${role}`)} {t("role.workspace")}
            </p>
          </div>
          <div className="flex-1 flex justify-center max-w-md mx-auto">
            <div className="relative w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder={t("header.search")}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsBell role={role} />
            <LanguageSwitcher />
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold">
                {user.initials}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-[11px] text-muted-foreground">{t(`role.${role}`)}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}


function resolveNotifTarget(role: Role, n: AppNotification): string {
  const a = n.action ?? "";
  if (role === "admin") {
    if (a.startsWith("absence")) return "/admin/absences";
    if (a.startsWith("doc")) return "/admin/documents";
    if (a.startsWith("file")) return "/admin/files";
    if (n.participantId) return `/admin/participants`;
    return "/admin/notifications";
  }
  if (role === "coach") {
    if (a.startsWith("absence")) return "/coach/absences";
    if (a.startsWith("doc")) return "/coach/documents";
    if (a.startsWith("file")) return "/coach/files";
    if (n.participantId) return `/coach/participants/${n.participantId}`;
    return "/coach/notifications";
  }
  // participant
  if (a.startsWith("absence")) return "/participant/absence";
  if (a.startsWith("doc")) return "/participant/documents";
  if (a.startsWith("file")) return "/participant/files";
  if (a.startsWith("session") || a.startsWith("plan")) return "/participant/schedule";
  return "/participant/notifications";
}

function NotificationsBell({ role }: { role: Role }) {
  useNotifications(); // subscribe
  const { t } = useI18n();
  const router = useRouter();
  const target = audienceFor(role);
  const unread = target ? unreadCountFor(target.audience, target.recipient) : 0;
  const items = target ? getNotificationsFor(target.audience, target.recipient).slice(0, 6) : [];
  const notifPath = role === "coach" ? "/coach/notifications" : role === "participant" ? "/participant/notifications" : "/admin/notifications";

  const handleItemClick = (n: AppNotification) => {
    markRead(n.id);
    const to = resolveNotifTarget(role, n);
    router.navigate({ to: to as never });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted relative cursor-pointer"
        aria-label={t("header.notifications")}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold grid place-items-center animate-scale-in">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden animate-fade-in z-50"
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{t("header.notifications")}</span>
            {unread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                {unread} {t("notif.unread")}
              </span>
            )}
          </div>
          {target && unread > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead(target.audience, target.recipient);
              }}
              className="text-[11px] text-primary hover:underline cursor-pointer"
            >
              {t("header.markAllRead")}
            </button>
          )}
        </div>
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {t("header.noNotifications")}
            </div>
          ) : (
            items.map((n) => {
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
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex gap-2.5 hover:bg-muted/70 transition-colors cursor-pointer focus:outline-none focus:bg-muted",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug">{n.title}</p>
                    {n.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
        {target && (
          <Link
            to={notifPath}
            className="block text-center text-xs text-primary py-2.5 border-t border-border hover:bg-muted/50 cursor-pointer"
          >
            {t("header.viewAll")}
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
