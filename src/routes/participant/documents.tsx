import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import {
  useDocRequests,
  getRequestsForParticipant,
  type DocRequest,
} from "@/lib/doc-requests-store";
import { CURRENT_PARTICIPANT_ID } from "@/lib/mock-data";
import { DocStatusBadge, PriorityBadge } from "@/components/docs/DocStatusBadge";
import { DocUploadDialog } from "@/components/docs/DocUploadDialog";
import { Button } from "@/components/ui/button";
import { FileText, Inbox, Clock, MessageSquare, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/participant/documents")({
  head: () => ({ meta: [{ title: "Document requests — GBNews" }] }),
  component: ParticipantDocuments,
});

function ParticipantDocuments() {
  const { t } = useI18n();
  useDocRequests();
  const requests = getRequestsForParticipant(CURRENT_PARTICIPANT_ID);
  const [active, setActive] = useState<DocRequest | null>(null);
  const [open, setOpen] = useState(false);

  const open_ = (r: DocRequest) => {
    setActive(r);
    setOpen(true);
  };

  const pending = requests.filter((r) => r.status === "requested" || r.status === "pending" || r.status === "rejected");
  const inReview = requests.filter((r) => r.status === "submitted" || r.status === "under-review");
  const done = requests.filter((r) => r.status === "approved");

  return (
    <AppShell role="participant" title={t("doc.requests")}>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        {t("doc.requestIntroParticipant")}
      </p>

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("doc.noRequestsParticipant")}
          description={t("doc.noRequestsParticipantDesc")}
        />
      ) : (
        <div className="space-y-8">
          <Section title={t("doc.actionRequired")} tone="warning" items={pending} onUpload={open_} emptyHint={t("doc.nothingToUpload")} />
          <Section title={t("doc.awaitingReview")} tone="info" items={inReview} onUpload={open_} emptyHint={t("doc.noneUnderReview")} />
          <Section title={t("doc.approved")} tone="success" items={done} onUpload={open_} emptyHint={t("doc.noneApproved")} />
        </div>
      )}

      <DocUploadDialog open={open} onOpenChange={setOpen} request={active} />
    </AppShell>
  );
}

function Section({
  title,
  tone,
  items,
  onUpload,
  emptyHint,
}: {
  title: string;
  tone: "warning" | "info" | "success";
  items: DocRequest[];
  onUpload: (r: DocRequest) => void;
  emptyHint: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              tone === "warning" ? "bg-warning" : tone === "success" ? "bg-success" : "bg-info",
            )}
          />
          {title}
          <span className="text-[11px] font-normal text-muted-foreground">({items.length})</span>
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{emptyHint}</p>
      ) : (
        <div className="grid gap-3">
          {items.map((r) => (
            <RequestCard key={r.id} r={r} onUpload={onUpload} />
          ))}
        </div>
      )}
    </section>
  );
}

function RequestCard({ r, onUpload }: { r: DocRequest; onUpload: (r: DocRequest) => void }) {
  const { t } = useI18n();
  const overdue = r.status !== "approved" && new Date(r.dueDate) < new Date();
  const lastUpload = r.uploads[0];
  const lastReview = r.reviews[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">{t(`doc.type.${r.docKey}`)}</p>
            <DocStatusBadge status={r.status} />
            <PriorityBadge priority={r.priority} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t("doc.requestedBy", { name: r.requesterName, role: t(`misc.role.${r.requesterRole}`) })}
          </p>
          {r.description && (
            <p className="text-xs text-foreground/80 mt-2 leading-snug">{r.description}</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("doc.due", { date: r.dueDate })}
              {overdue && <span className="ml-1 text-destructive font-semibold">· {t("doc.overdue")}</span>}
            </span>
            {lastUpload && (
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" /> {lastUpload.fileName} · {lastUpload.uploadedAtLabel}
              </span>
            )}
          </div>

          {(r.uploads.length > 1 || r.reviews.length > 0) && (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-[11px] text-primary inline-flex items-center gap-1 select-none">
                <History className="h-3 w-3" /> {t("doc.history", { n: r.uploads.length + r.reviews.length })}
              </summary>
              <ul className="mt-2 space-y-1.5 border-l-2 border-border pl-3">
                {r.reviews.map((rv) => (
                  <li key={rv.id} className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{rv.reviewer}</span> {rv.action}
                    {rv.comment && (
                      <span className="ml-1 italic">— "{rv.comment}"</span>
                    )}
                    <span className="ml-1">· {rv.atLabel}</span>
                  </li>
                ))}
                {r.uploads.map((u) => (
                  <li key={u.id} className="text-[11px] text-muted-foreground">
                    {t("doc.uploaded", { file: "" })}<span className="font-medium text-foreground">{u.fileName}</span> · {u.uploadedAtLabel}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {lastReview?.comment && r.status === "rejected" && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-destructive mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-destructive">{t("doc.reviewerComment")}</p>
                <p className="text-xs text-foreground/80">{lastReview.comment}</p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {r.status === "approved" ? (
            <span className="text-[11px] text-success font-semibold">✓ {t("btn.done")}</span>
          ) : (
            <Button size="sm" onClick={() => onUpload(r)}>
              {r.uploads.length > 0 ? t("btn.replace") : t("file.upload")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
