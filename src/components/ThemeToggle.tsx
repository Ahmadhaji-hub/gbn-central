import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useI18n();
  const label = t("header.toggleTheme");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={
        "relative h-9 w-9 grid place-items-center rounded-lg border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors " +
        className
      }
    >
      <Sun
        className={
          "h-[18px] w-[18px] absolute transition-all duration-300 " +
          (isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")
        }
        strokeWidth={1.75}
      />
      <Moon
        className={
          "h-[18px] w-[18px] absolute transition-all duration-300 " +
          (isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0")
        }
        strokeWidth={1.75}
      />
    </button>
  );
}
