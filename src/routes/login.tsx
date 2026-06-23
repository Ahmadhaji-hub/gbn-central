import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import gbLogo from "@/assets/gbnews-logo-trimmed.png";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — GBNews Operations" },
      { name: "description", content: "Sign in to the GBNews internal operations platform." },
    ],
  }),
  component: LoginPage,
});

const roles = [
  { id: "admin", to: "/admin" },
  { id: "coach", to: "/coach" },
  { id: "participant", to: "/participant" },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [role, setRole] = useState<(typeof roles)[number]>(roles[1]);
  const roleLabel = t(`role.${role.id}`);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
        <Link to="/" className="inline-flex items-center" aria-label="GBNews home">
          <span className="inline-flex items-center rounded-lg border border-primary-foreground/15 bg-primary-foreground/[0.06] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm">
            <img src={gbLogo} alt="GBNews" className="h-6 w-auto object-contain select-none brightness-0 invert" draggable={false} />
          </span>
        </Link>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight leading-tight max-w-md">
            {t("login.tagline")}
          </h2>
          <p className="mt-4 text-sm opacity-80 max-w-md">{t("login.taglineDesc")}</p>
        </div>
        <span className="text-xs opacity-70">{t("login.copyright")}</span>
      </div>

      <div className="flex flex-col p-6 sm:p-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("login.back")}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <Link to="/" className="lg:hidden flex items-center justify-center mb-6" aria-label="GBNews home">
              <img src={gbLogo} alt="GBNews" className="h-8 w-auto object-contain select-none" draggable={false} />
            </Link>
            <h1 className="text-2xl font-semibold">{t("login.welcome")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>

            <div className="mt-6 grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r)}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${role.id === r.id ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
                >
                  {t(`role.${r.id}`)}
                </button>
              ))}
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: role.to });
              }}
            >
              <div>
                <label className="text-xs font-medium text-foreground">{t("login.email")}</label>
                <input
                  type="email"
                  defaultValue={`${role.id}@gbnews.org`}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg bg-background border border-input focus:border-ring focus:outline-none text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-foreground">{t("login.password")}</label>
                  <a className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">{t("login.forgot")}</a>
                </div>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="mt-1.5 w-full h-10 px-3 rounded-lg bg-background border border-input focus:border-ring focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                {t("login.signinAs", { role: roleLabel })}
              </button>
              <p className="text-[11px] text-center text-muted-foreground">
                {t("login.demoNote", { role: roleLabel })}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
