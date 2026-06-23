import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadDocForRequest, type DocRequest } from "@/lib/doc-requests-store";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  request: DocRequest | null;
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocUploadDialog({ open, onOpenChange, request }: Props) {
  const { t } = useI18n();
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setNote("");
    }
  }, [open, request?.id]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({ name: f.name, size: fmtSize(f.size) });
  };

  const submit = () => {
    if (!request) return;
    if (!file) {
      toast.error(t("toast.chooseFile"));
      return;
    }
    uploadDocForRequest(request.id, {
      fileName: file.name,
      size: file.size,
      participantNote: note.trim() || undefined,
    });
    toast.success(t("toast.uploadedFile", { file: file.name }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("doc.uploadTitle", { doc: request ? t(`doc.type.${request.docKey}`) : t("misc.documents").toLowerCase() })}</DialogTitle>
          <DialogDescription>
            {request?.description ?? t("doc.uploadFallback")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-muted/40 transition-colors p-6 flex flex-col items-center gap-2 text-center"
          >
            {file ? (
              <>
                <FileText className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium truncate max-w-full">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{file.size} · {t("doc.replaceFile")}</p>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">{t("doc.chooseFile")}</p>
                <p className="text-[11px] text-muted-foreground">{t("doc.fileFormats")}</p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={onPick}
          />

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-medium text-muted-foreground">{t("field.noteForCoach")}</span>
            <Textarea
              rows={3}
              placeholder={t("doc.notePlaceholder")}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("btn.cancel")}
          </Button>
          <Button onClick={submit}>{t("btn.submitDocument")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ReviewProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  request: DocRequest | null;
  reviewer: string;
  onReview: (
    action: "approve" | "reject" | "re-upload" | "comment",
    comment?: string,
  ) => void;
};

export function DocReviewDialog({ open, onOpenChange, request, onReview }: ReviewProps) {
  const { t } = useI18n();
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) setComment("");
  }, [open, request?.id]);

  if (!request) return null;
  const last = request.uploads[0];

  const act = (action: "approve" | "reject" | "re-upload" | "comment") => {
    if ((action === "reject" || action === "re-upload") && !comment.trim()) {
      toast.error(t("toast.reviewCommentRequired"));
      return;
    }
    onReview(action, comment.trim() || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("doc.reviewTitle", { doc: t(`doc.type.${request.docKey}`) })}</DialogTitle>
          <DialogDescription>
            {t("doc.reviewDesc")}
          </DialogDescription>
        </DialogHeader>

        {last ? (
          <div className="rounded-lg border border-border p-3 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{last.fileName}</p>
              <p className="text-[11px] text-muted-foreground">
                {last.size} · {t("doc.uploadedAt", { date: last.uploadedAtLabel })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("doc.noFileUploaded")}</p>
        )}

        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-medium text-muted-foreground">{t("field.reviewComment")}</span>
          <Textarea
            rows={3}
            placeholder={t("doc.reviewPlaceholder")}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => act("comment")}>
            {t("btn.justComment")}
          </Button>
          <Button variant="outline" onClick={() => act("re-upload")}>
            {t("btn.requestReupload")}
          </Button>
          <Button variant="destructive" onClick={() => act("reject")}>
            {t("btn.reject")}
          </Button>
          <Button onClick={() => act("approve")}>{t("btn.approve")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
