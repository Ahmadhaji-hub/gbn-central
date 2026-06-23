import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserCog, GraduationCap, ArrowRight, HeartHandshake, CalendarCheck, ClipboardList, Linkedin, Facebook, Instagram, Globe } from "lucide-react";
import gbLogo from "@/assets/gbnews-logo-trimmed.png";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GBNews — Workforce Reintegration & Coaching Platform" },
      { name: "description", content: "A centralized operational platform supporting participants, coaches, and administrators through workforce reintegration, coaching, and follow-up workflows." },
      { property: "og:title", content: "GBNews — Workforce Reintegration & Coaching Platform" },
      { property: "og:description", content: "Helping participants, coaches, and administrators collaborate through one centralized operational platform." },
    ],
  }),
  component: Landing,
});

const portals = [
  { role: "admin", key: "admin", icon: ShieldCheck, to: "/admin", accent: "from-info/30 to-info/5" },
  { role: "coach", key: "coach", icon: UserCog, to: "/coach", accent: "from-primary/30 to-primary/5" },
  { role: "participant", key: "participant", icon: GraduationCap, to: "/participant", accent: "from-success/30 to-success/5" },
] as const;

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
  { label: "Website", href: "https://gbnews.ch/", icon: Globe },
];

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/75 border-b border-border/50">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto gap-4">
          <Link to="/" className="flex items-center shrink-0" aria-label="GBNews home">
            <img src={gbLogo} alt="GBNews" className="h-7 sm:h-8 w-auto object-contain select-none" draggable={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                   className="h-9 w-9 grid place-items-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="hidden sm:block h-6 w-px bg-border/60 mx-1" />
            <Link to="/login" className="text-sm font-medium px-4 h-9 inline-flex items-center rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors">
              {t("landing.signin")}
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> {t("landing.badge")}
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
          {t("landing.heroTitle1")} <span className="text-primary">{t("landing.heroTitle2")}</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("landing.heroSubtitle")}
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.role} to={p.to}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 hover:border-ring/60 hover:shadow-lg transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-card border border-border grid place-items-center shadow-sm">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold">{t(`landing.portal.${p.key}.title`)}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed min-h-[60px]">{t(`landing.portal.${p.key}.desc`)}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t("landing.enterPortal")} <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
          <Feature icon={HeartHandshake} title={t("landing.feat.coaching.title")} desc={t("landing.feat.coaching.desc")} />
          <Feature icon={CalendarCheck} title={t("landing.feat.schedule.title")} desc={t("landing.feat.schedule.desc")} />
          <Feature icon={ClipboardList} title={t("landing.feat.followup.title")} desc={t("landing.feat.followup.desc")} />
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t("landing.footer")}
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof HeartHandshake; title: string; desc: string }) {
  return (
    <div className="px-2">
      <div className="h-10 w-10 mx-auto rounded-lg bg-accent text-accent-foreground grid place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
