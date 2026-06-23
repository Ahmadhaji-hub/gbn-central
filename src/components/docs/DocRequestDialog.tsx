import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { participants } from "@/lib/mock-data";
import {
  createDocRequest,
  getAllDocTypes,
  type DocPriority,
  type RequesterRole,
} from "@/lib/doc-requests-store";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  requesterRole: RequesterRole;
  requesterName: string;
  /** When provided, locks participant select to these participants */
  scopedParticipantIds?: string[];
  /** Optional preselected participant */
  defaultParticipantId?: string;
};

export function DocRequestDialog({
  open,
  onOpenChange,
  requesterRole,
  requesterName,
  scopedParticipantIds,
  defaultParticipantId,
}: Props) {
  const { t } = useI18n();
  const docTypes = getAllDocTypes();
  const visibleParticipants = scopedParticipantIds
    ? participants.filter((p) => scopedParticipantIds.includes(p.id))
    : participants;

  const today = new Date().toISOString().slice(0, 10);
  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [participantId, setParticipantId] = useState(defaultParticipantId ?? visibleParticipants[0]?.id ?? "");
  const [docKey, setDocKey] = useState(docTypes[0].key);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDue);
  const [priority, setPriority] = useState<DocPriority>("normal");

  useEffect(() => {
    if (open) {
      setParticipantId(defaultParticipantId ?? visibleParticipants[0]?.id ?? "");
      setDocKey(docTypes[0].key);
      setDescription("");
      setDueDate(defaultDue);
      setPriority("normal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = () => {
    if (!participantId) {
      toast.error(t("toast.selectParticipant"));
      return;
    }
    if (!docKey) {
      toast.error(t("toast.selectDocumentType"));
      return;
    }
    if (!dueDate || dueDate < today) {
      toast.error(t("toast.validDueDate"));
      return;
    }
    const req = createDocRequest({
      participantId,
      docKey,
      description: description.trim() || undefined,
      dueDate,
      priority,
      requesterRole,
      requesterName,
    });
    const p = participants.find((x) => x.id === participantId);
    toast.success(t("toast.requestedDocument", { doc: t(`doc.type.${req.docKey}`), participant: p?.name ?? t("role.participant") }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("doc.requestTitle")}</DialogTitle>
          <DialogDescription>
            {t("doc.requestDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("field.participant")}>
            <Select value={participantId} onValueChange={setParticipantId}>
              <SelectTrigger>
                <SelectValue placeholder={t("doc.selectParticipant")} />
              </SelectTrigger>
              <SelectContent>
                {visibleParticipants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("field.documentType")}>
            <Select value={docKey} onValueChange={setDocKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {docTypes.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {t(`doc.type.${d.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("field.dueDate")}>
            <Input
              type="date"
              value={dueDate}
              min={today}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label={t("field.priority")}>
            <Select value={priority} onValueChange={(v) => setPriority(v as DocPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{t("doc.priority.normal")}</SelectItem>
                <SelectItem value="urgent">{t("doc.priority.urgent")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label={t("field.instructionsOptional")}>
              <Textarea
                rows={3}
                placeholder={t("doc.instructionsPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("btn.cancel")}
          </Button>
          <Button onClick={submit}>{t("btn.sendRequest")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
