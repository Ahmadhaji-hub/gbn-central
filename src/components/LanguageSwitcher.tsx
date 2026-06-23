import { Check } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

const LANGS: { code: Lang; native: string; flag: string }[] = [
  { code: "en", native: "English", flag: "🇬🇧" },
  { code: "fr", native: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const current = LANGS.find((l) => l.code === lang)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-9 pl-2.5 pr-2 rounded-lg inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors data-[state=open]:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label={t("header.language")}
        title={t("header.language")}
      >
        <span className="text-[15px] leading-none">{current.flag}</span>
        <span className="uppercase tracking-wide font-semibold text-[12px]">{lang}</span>
        <svg className="h-3 w-3 text-muted-foreground/70" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-52 p-1.5 overflow-hidden border-border/60 shadow-xl rounded-xl"
      >
        {LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                active ? "bg-muted text-foreground" : "hover:bg-muted/60 text-foreground/80",
              )}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="flex-1 text-sm font-medium">{l.native}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {l.code}
              </span>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
