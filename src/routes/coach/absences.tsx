import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  useAbsences,
  getAbsencesForCoach,
  type AbsenceStatus,
} from "@/lib/absence-store";
import { CURRENT_COACH } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { CalendarOff, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach/absences")({
  head: () => ({ meta: [{ title: "Absence requests — GBNews Coach" }] }),
  component: CoachAbsencesPage,
});

function statusClasses(s: AbsenceStatus) {
  switch (s) {
    case "approved": return "bg-success/15 text-success border-success/20";
    case "rejected": return "bg-destructive/15 text-destructive border-destructive/20";
    case "info-requested": return "bg-info/15 text-info border-info/20";
    default: return "bg-warning/20 text-warning-foreground border-warning/30 dark:text-warning";
  }
}

function CoachAbsencesPage() {
  const { t } = useI18n();
  useAbsences();
  const list = getAbsencesForCoach(CURRENT_COACH).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <AppShell role="coach" title={t("absence.coach.title")}>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <CalendarOff className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t("absence.coach.heading")}</h2>
            <p className="text-[11px] text-muted-foreground">
              {t("absence.coach.subtitle")}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("absence.coach.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-left font-medium py-2.5 px-5">{t("absence.col.participant")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.date")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.period")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.reason")}</th>
                  <th className="text-left font-medium py-2.5 max-w-[320px]">{t("absence.col.message")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.attachment")}</th>
                  <th className="text-left font-medium py-2.5 px-5">{t("absence.col.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 align-top">
                    <td className="py-3 px-5 font-medium">{r.participantName}</td>
                    <td className="text-xs">
                      {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="text-xs">{t(`absence.period.${r.period}`)}</td>
                    <td className="text-xs">{t(`absence.type.${r.type}`)}</td>
                    <td className="text-xs max-w-[320px]"><p className="line-clamp-2">{r.message}</p></td>
                    <td>
                      {r.attachment ? (
                        <a href={r.attachment.dataUrl} download={r.attachment.name}
                           className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          {r.attachment.type.startsWith("image/") ? (
                            <ImageIcon className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                          {t("absence.col.view")}
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        statusClasses(r.status),
                      )}>
                        {t(`absence.status.${r.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground">
          {t("absence.coach.readonlyHint")}
        </p>
      </div>
    </AppShell>
  );
}
