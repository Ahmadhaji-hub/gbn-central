import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import {
  useDocRequests,
  getRequestsByRequester,
  reviewDocRequest,
  deleteDocRequest,
  type DocRequest,
} from "@/lib/doc-requests-store";
import { CURRENT_COACH, participants, getCoachParticipants } from "@/lib/mock-data";
import { DocStatusBadge, PriorityBadge } from "@/components/docs/DocStatusBadge";
import { DocRequestDialog } from "@/components/docs/DocRequestDialog";
import { DocReviewDialog } from "@/components/docs/DocUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Inbox, Plus, Clock, Search, Trash2, Eye } from "lucide-react";

export const Route = createFileRoute("/coach/documents")({
  head: () => ({ meta: [{ title: "Document requests — GBNews" }] }),
  component: CoachDocuments,
});

function CoachDocuments() {
  useDocRequests();
  const requests = getRequestsByRequester("coach", CURRENT_COACH);
  const myParticipants = getCoachParticipants(CURRENT_COACH);
  const myParticipantIds = myParticipants.map((p) => p.id);

  const [createOpen, setCreateOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [active, setActive] = useState<DocRequest | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "submitted" | "approved">("all");

  const filtered = requests.filter((r) => {
    if (filter === "open" && !["requested", "pending", "rejected"].includes(r.status)) return false;
    if (filter === "submitted" && !["submitted", "under-review"].includes(r.status)) return false;
    if (filter === "approved" && r.status !== "approved") return false;
    if (!query) return true;
    const p = participants.find((x) => x.id === r.participantId);
    const q = query.toLowerCase();
    return r.docLabel.toLowerCase().includes(q) || p?.name.toLowerCase().includes(q);
  });

  const openReview = (r: DocRequest) => {
    setActive(r);
    setReviewOpen(true);
  };

  return (
    <AppShell role="coach" title="Document requests">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Request documents from your participants and review their submissions.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New request
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search document or participant…"
            className="pl-9 h-9"
          />
        </div>
        {(["all", "open", "submitted", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 h-9 rounded-lg border ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : f === "open" ? "Awaiting upload" : f === "submitted" ? "To review" : "Approved"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No document requests"
          description="Use the New request button to ask one of your participants for a document."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {filtered.map((r) => (
            <Row key={r.id} r={r} onReview={openReview} />
          ))}
        </div>
      )}

      <DocRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        requesterRole="coach"
        requesterName={CURRENT_COACH}
        scopedParticipantIds={myParticipantIds}
      />
      <DocReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        request={active}
        reviewer={CURRENT_COACH}
        onReview={(action, comment) => {
          if (active) reviewDocRequest(active.id, action, CURRENT_COACH, comment);
        }}
      />
    </AppShell>
  );
}

function Row({ r, onReview }: { r: DocRequest; onReview: (r: DocRequest) => void }) {
  const p = participants.find((x) => x.id === r.participantId);
  const last = r.uploads[0];
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{r.docLabel}</p>
          <DocStatusBadge status={r.status} />
          <PriorityBadge priority={r.priority} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {p?.name ?? "—"} · {p?.department}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Due {r.dueDate}
          </span>
          {last && (
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" /> {last.fileName} · {last.uploadedAtLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {(r.status === "submitted" || r.status === "under-review" || r.status === "approved" || r.status === "rejected") && r.uploads.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => onReview(r)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Review
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => deleteDocRequest(r.id)}
          aria-label="Delete request"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
