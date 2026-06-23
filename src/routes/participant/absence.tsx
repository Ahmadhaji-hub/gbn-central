import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAbsenceRequest,
  useAbsences,
  getAbsencesForParticipant,
  type AbsenceType,
  type AbsencePeriod,
  type AbsenceMode,
  type AbsenceAttachment,
} from "@/lib/absence-store";
import { CURRENT_PARTICIPANT_ID } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { CalendarOff, Paperclip, FileText, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/participant/absence")({
  head: () => ({ meta: [{ title: "Absence request — GBNews" }] }),
  component: AbsencePage,
});

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

function statusClasses(s: string) {
  switch (s) {
    case "approved":
      return "bg-success/15 text-success border-success/20";
    case "rejected":
      return "bg-destructive/15 text-destructive border-destructive/20";
    case "info-requested":
      return "bg-info/15 text-info border-info/20";
    default:
      return "bg-warning/20 text-warning-foreground border-warning/30 dark:text-warning";
  }
}

function AbsencePage() {
  const { t } = useI18n();
  useAbsences();
  const mine = getAbsencesForParticipant(CURRENT_PARTICIPANT_ID);

  const [type, setType] = useState<AbsenceType>("medical");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<AbsencePeriod>("morning");
  const [mode, setMode] = useState<AbsenceMode>("absent");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<AbsenceAttachment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFile(f: File | null) {
    if (!f) return setAttachment(null);
    const ok =
      f.type === "application/pdf" || f.type.startsWith("image/");
    if (!ok) {
      toast.error(t("absence.file.invalidType"));
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error(t("absence.file.tooLarge"));
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setAttachment({ name: f.name, type: f.type, dataUrl, size: f.size });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t("absence.form.messageRequired"));
      return;
    }
    setSubmitting(true);
    createAbsenceRequest({
      participantId: CURRENT_PARTICIPANT_ID,
      type,
      date,
      period,
      mode,
      message: message.trim(),
      attachment: attachment ?? undefined,
    });
    toast.success(t("absence.form.submitted"));
    setMessage("");
    setAttachment(null);
    setSubmitting(false);
  }

  return (
    <AppShell role="participant" title={t("absence.page.title")}>
      <div className="grid lg:grid-cols-5 gap-6">
        <form
          onSubmit={submit}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 space-y-5"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t("absence.form.title")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("absence.form.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("absence.field.type")}>
              <Select value={type} onValueChange={(v) => setType(v as AbsenceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">{t("absence.type.medical")}</SelectItem>
                  <SelectItem value="personal">{t("absence.type.personal")}</SelectItem>
                  <SelectItem value="family">{t("absence.type.family")}</SelectItem>
                  <SelectItem value="administrative">{t("absence.type.administrative")}</SelectItem>
                  <SelectItem value="other">{t("absence.type.other")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("absence.field.date")}>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>

            <Field label={t("absence.field.period")}>
              <Select value={period} onValueChange={(v) => setPeriod(v as AbsencePeriod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{t("absence.period.morning")}</SelectItem>
                  <SelectItem value="afternoon">{t("absence.period.afternoon")}</SelectItem>
                  <SelectItem value="full">{t("absence.period.full")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("absence.field.mode")}>
              <Select value={mode} onValueChange={(v) => setMode(v as AbsenceMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">{t("absence.mode.inPerson")}</SelectItem>
                  <SelectItem value="remote">{t("absence.mode.remote")}</SelectItem>
                  <SelectItem value="absent">{t("absence.mode.absent")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("absence.field.message")}>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("absence.field.messagePlaceholder")}
              maxLength={1000}
            />
          </Field>

          <Field label={t("absence.field.attachment")}>
            {attachment ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                {attachment.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm flex-1 truncate">{attachment.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {(attachment.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                <Paperclip className="h-4 w-4" />
                <span>{t("absence.field.attachmentHint")}</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {t("absence.form.submit")}
            </Button>
          </div>
        </form>

        <aside className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">{t("absence.history.title")}</h2>
          {mine.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("absence.history.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {mine.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-border p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        statusClasses(r.status),
                      )}
                    >
                      {t(`absence.status.${r.status}`)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t(`absence.type.${r.type}`)} · {t(`absence.period.${r.period}`)}
                  </p>
                  <p className="text-xs line-clamp-2">{r.message}</p>
                  {r.adminNote && (
                    <p className="text-[11px] text-info">
                      {t("absence.adminNote")}: {r.adminNote}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
