import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  approveAbsence,
  rejectAbsence,
  requestMoreInfo,
  useAbsences,
  getAbsencesForParticipant,
  type AbsenceRequest,
  type AbsenceStatus,
} from "@/lib/absence-store";
import { participants } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { Check, X, MessageSquare, Paperclip, FileText, Image as ImageIcon, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/absences")({
  head: () => ({ meta: [{ title: "Absence requests — GBNews Admin" }] }),
  component: AdminAbsencesPage,
});

function statusClasses(s: AbsenceStatus) {
  switch (s) {
    case "approved": return "bg-success/15 text-success border-success/20";
    case "rejected": return "bg-destructive/15 text-destructive border-destructive/20";
    case "info-requested": return "bg-info/15 text-info border-info/20";
    default: return "bg-warning/20 text-warning-foreground border-warning/30 dark:text-warning";
  }
}

// Access store snapshot via hook (re-renders on change)
function useAllAbsences(): AbsenceRequest[] {
  useAbsences();
  return participants.flatMap((p) => getAbsencesForParticipant(p.id));
}

function AdminAbsencesPage() {
  const { t } = useI18n();
  const all = useAllAbsences();
  const [filter, setFilter] = useState<AbsenceStatus | "all">("all");
  const [active, setActive] = useState<AbsenceRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "info" | null>(null);
  const [note, setNote] = useState("");

  const list = useMemo(
    () => all.filter((r) => (filter === "all" ? true : r.status === filter))
      .sort((a, b) => b.createdAt - a.createdAt),
    [all, filter],
  );

  function openAction(req: AbsenceRequest, type: "approve" | "reject" | "info") {
    setActive(req);
    setActionType(type);
    setNote("");
  }

  function commit() {
    if (!active || !actionType) return;
    if (actionType === "approve") approveAbsence(active.id, note || undefined);
    if (actionType === "reject") rejectAbsence(active.id, note || undefined);
    if (actionType === "info") {
      if (!note.trim()) {
        toast.error(t("absence.admin.noteRequired"));
        return;
      }
      requestMoreInfo(active.id, note.trim());
    }
    toast.success(t("absence.admin.done"));
    setActive(null);
    setActionType(null);
  }

  return (
    <AppShell role="admin" title={t("absence.admin.title")}>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <CalendarOff className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{t("absence.admin.heading")}</h2>
              <p className="text-[11px] text-muted-foreground">
                {t("absence.admin.subtitle", { n: list.length })}
              </p>
            </div>
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as AbsenceStatus | "all")}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("absence.filter.all")}</SelectItem>
              <SelectItem value="pending">{t("absence.status.pending")}</SelectItem>
              <SelectItem value="approved">{t("absence.status.approved")}</SelectItem>
              <SelectItem value="rejected">{t("absence.status.rejected")}</SelectItem>
              <SelectItem value="info-requested">{t("absence.status.info-requested")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("absence.admin.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-left font-medium py-2.5 px-5">{t("absence.col.participant")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.department")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.date")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.period")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.reason")}</th>
                  <th className="text-left font-medium py-2.5 max-w-[280px]">{t("absence.col.message")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.attachment")}</th>
                  <th className="text-left font-medium py-2.5">{t("absence.col.status")}</th>
                  <th className="text-right font-medium py-2.5 px-5">{t("absence.col.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 align-top">
                    <td className="py-3 px-5">
                      <p className="font-medium">{r.participantName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.coach}</p>
                    </td>
                    <td className="text-xs text-muted-foreground">{r.department}</td>
                    <td className="text-xs">
                      {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="text-xs">{t(`absence.period.${r.period}`)}</td>
                    <td className="text-xs">{t(`absence.type.${r.type}`)}</td>
                    <td className="text-xs max-w-[280px]">
                      <p className="line-clamp-2">{r.message}</p>
                    </td>
                    <td>
                      {r.attachment ? (
                        <a
                          href={r.attachment.dataUrl}
                          download={r.attachment.name}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
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
                    <td>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        statusClasses(r.status),
                      )}>
                        {t(`absence.status.${r.status}`)}
                      </span>
                    </td>
                    <td className="px-5 text-right">
                      {r.status === "pending" || r.status === "info-requested" ? (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => openAction(r, "info")}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => openAction(r, "reject")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => openAction(r, "approve")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {t("absence.admin.decided")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && t("absence.admin.approveTitle")}
              {actionType === "reject" && t("absence.admin.rejectTitle")}
              {actionType === "info" && t("absence.admin.infoTitle")}
            </DialogTitle>
            <DialogDescription>
              {active && `${active.participantName} — ${new Date(active.date + "T00:00:00").toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          {active?.attachment && (
            <a
              href={active.attachment.dataUrl}
              download={active.attachment.name}
              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {active.attachment.name}
            </a>
          )}
          <Textarea
            placeholder={
              actionType === "info"
                ? t("absence.admin.notePlaceholderRequired")
                : t("absence.admin.notePlaceholder")
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              {t("btn.cancel")}
            </Button>
            <Button
              onClick={commit}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {actionType === "approve" && t("btn.approve")}
              {actionType === "reject" && t("btn.reject")}
              {actionType === "info" && t("absence.admin.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
