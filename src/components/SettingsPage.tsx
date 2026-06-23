import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { User, Palette, Bell, Lock, Building2, GraduationCap } from "lucide-react";

type Role = "admin" | "coach" | "participant";

const profiles: Record<Role, { name: string; email: string; phone: string }> = {
  admin: { name: "Eva Martín", email: "eva.martin@gbnews.org", phone: "+41 22 555 0142" },
  coach: { name: "Fatima Zouhra", email: "fatima.zouhra@gbnews.org", phone: "+41 22 555 0188" },
  participant: { name: "Ahmad Haji", email: "ahmad.haji@gbnews.org", phone: "+41 78 555 0211" },
};

type Tab = "profile" | "preferences" | "notifications" | "security" | "organization" | "coaching";

export function SettingsPage({ role }: { role: Role }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { id: Tab; labelKey: string; icon: typeof User }[] = [
    { id: "profile", labelKey: "settings.tab.profile", icon: User },
    { id: "preferences", labelKey: "settings.tab.preferences", icon: Palette },
    { id: "notifications", labelKey: "settings.tab.notifications", icon: Bell },
    { id: "security", labelKey: "settings.tab.security", icon: Lock },
    ...(role === "admin"
      ? [{ id: "organization" as Tab, labelKey: "settings.tab.organization", icon: Building2 }]
      : []),
    ...(role === "coach"
      ? [{ id: "coaching" as Tab, labelKey: "settings.tab.coaching", icon: GraduationCap }]
      : []),
  ];

  return (
    <AppShell role={role} title={t("settings.title")}>
      <div className="max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </header>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tb) => {
              const Icon = tb.icon;
              const active = tab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left whitespace-nowrap",
                    active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(tb.labelKey)}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {tab === "profile" && <ProfileSection role={role} />}
            {tab === "preferences" && <PreferencesSection />}
            {tab === "notifications" && <NotificationsSection role={role} />}
            {tab === "security" && <SecuritySection />}
            {tab === "organization" && role === "admin" && <OrganizationSection />}
            {tab === "coaching" && role === "coach" && <CoachingSection />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-background border border-input focus:border-ring focus:outline-none text-sm";

function SaveButton() {
  const { t } = useI18n();
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={() => toast.success(t("settings.saved"))}
        className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        {t("btn.saveChanges")}
      </button>
    </div>
  );
}

function ProfileSection({ role }: { role: Role }) {
  const { t } = useI18n();
  const p = profiles[role];
  return (
    <Card title={t("settings.profile.title")} desc={t("settings.profile.desc")}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("settings.profile.fullName")}>
          <input className={inputCls} defaultValue={p.name} />
        </Field>
        <Field label={t("settings.profile.email")}>
          <input className={inputCls} defaultValue={p.email} type="email" />
        </Field>
        <Field label={t("settings.profile.phone")}>
          <input className={inputCls} defaultValue={p.phone} />
        </Field>
        <Field label={t("settings.profile.role")}>
          <input className={inputCls} defaultValue={t(`role.${role}`)} disabled />
        </Field>
      </div>
      <SaveButton />
    </Card>
  );
}

function PreferencesSection() {
  const { t } = useI18n();
  return (
    <Card title={t("settings.prefs.title")} desc={t("settings.prefs.desc")}>
      <Field label={t("settings.prefs.language")}>
        <LanguageSwitcher />
      </Field>
      <Field label={t("settings.prefs.theme")}>
        <ThemeToggle />
      </Field>
      <Field label={t("settings.prefs.timezone")}>
        <select className={inputCls} defaultValue="Europe/Zurich">
          <option>Europe/Zurich</option>
          <option>Europe/Paris</option>
          <option>Europe/London</option>
          <option>UTC</option>
        </select>
      </Field>
    </Card>
  );
}

function ThemeToggle() {
  const { t } = useI18n();
  const { isDark, setTheme } = useTheme();
  return (
    <div className="inline-flex p-1 rounded-lg bg-muted">
      {[
        { v: false, label: t("settings.prefs.theme.light") },
        { v: true, label: t("settings.prefs.theme.dark") },
      ].map((opt) => (
        <button
          key={String(opt.v)}
          onClick={() => setTheme(opt.v ? "dark" : "light")}
          className={cn(
            "px-3 h-8 rounded-md text-sm transition-colors",
            isDark === opt.v ? "bg-card shadow-sm font-medium" : "text-muted-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          on ? "bg-primary" : "bg-muted",
        )}
        aria-pressed={on}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform",
            on ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function NotificationsSection({ role }: { role: Role }) {
  const { t } = useI18n();
  return (
    <Card title={t("settings.notif.title")} desc={t("settings.notif.desc")}>
      <div className="divide-y divide-border">
        <Toggle label={t("settings.notif.email")} defaultChecked />
        <Toggle label={t("settings.notif.push")} defaultChecked />
        <Toggle label={t("settings.notif.weekly")} />
        <Toggle label={t("settings.notif.docs")} defaultChecked />
        {role !== "admin" && <Toggle label={t("settings.notif.sessions")} defaultChecked />}
      </div>
      <SaveButton />
    </Card>
  );
}

function SecuritySection() {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <Card title={t("settings.security.title")} desc={t("settings.security.desc")}>
        <Field label={t("settings.security.currentPassword")}>
          <input className={inputCls} type="password" defaultValue="••••••••" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("settings.security.newPassword")}>
            <input className={inputCls} type="password" />
          </Field>
          <Field label={t("settings.security.confirmPassword")}>
            <input className={inputCls} type="password" />
          </Field>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => toast.success(t("settings.saved"))}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            {t("settings.security.update")}
          </button>
        </div>
      </Card>
      <Card title={t("settings.security.twoFA")} desc={t("settings.security.twoFADesc")}>
        <Toggle label={t("settings.security.twoFA")} />
      </Card>
    </div>
  );
}

function OrganizationSection() {
  const { t } = useI18n();
  return (
    <Card title={t("settings.org.title")} desc={t("settings.org.desc")}>
      <Field label={t("settings.org.name")}>
        <input className={inputCls} defaultValue="GBNews Operations" />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("settings.org.defaultLang")}>
          <select className={inputCls} defaultValue="en">
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </Field>
        <Field label={t("settings.org.weekStart")}>
          <select className={inputCls} defaultValue="mon">
            <option value="mon">{t("settings.org.weekStart.mon")}</option>
            <option value="sun">{t("settings.org.weekStart.sun")}</option>
          </select>
        </Field>
      </div>
      <SaveButton />
    </Card>
  );
}

function CoachingSection() {
  const { t } = useI18n();
  return (
    <Card title={t("settings.coaching.title")} desc={t("settings.coaching.desc")}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("settings.coaching.defaultDuration")}>
          <input className={inputCls} type="number" defaultValue={45} />
        </Field>
        <Field label={t("settings.coaching.defaultMode")}>
          <select className={inputCls} defaultValue="in-person">
            <option value="in-person">{t("att.mode.in-person")}</option>
            <option value="remote">{t("att.mode.remote")}</option>
          </select>
        </Field>
      </div>
      <div className="divide-y divide-border">
        <Toggle label={t("settings.coaching.availability")} defaultChecked />
        <Toggle label={t("settings.coaching.autoReminders")} defaultChecked />
      </div>
      <SaveButton />
    </Card>
  );
}
