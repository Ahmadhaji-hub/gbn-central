import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Progress, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParticipantFormDialog } from "@/components/admin/ParticipantFormDialog";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { useAdminStore, deleteParticipant, type Participant } from "@/lib/admin-store";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/participants")({
  head: () => ({ meta: [{ title: "Participants — GBNews Admin" }] }),
  component: ParticipantsPage,
});

function ParticipantsPage() {
  const { t } = useI18n();
  const participants = useAdminStore((s) => s.participants);
  const departments = useAdminStore((s) => s.departments);
  const coaches = useAdminStore((s) => s.coaches);

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [deleting, setDeleting] = useState<Participant | null>(null);

  const filtered = useMemo(
    () =>
      participants.filter((p) => {
        if (dept !== "all" && p.department !== dept) return false;
        if (status !== "all" && p.status !== status) return false;
        if (q && !`${p.name} ${p.email} ${p.coach}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [participants, q, dept, status],
  );

  return (
    <AppShell role="admin" title={t("nav.participants")}>
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-sm font-semibold">{t("section.allParticipants")}</h2>
            <p className="text-xs text-muted-foreground">{t("hint.shownOf", { shown: filtered.length, total: participants.length })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("mon.search")} className="h-9 pl-8 w-60" />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("hint.allDepartments")}</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("mon.filter.all")}</SelectItem>
                <SelectItem value="active">{t("status.active")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="at-risk">{t("status.atRisk")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4" /> {t("btn.addParticipant")}
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 grid place-items-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-3"><Users className="h-5 w-5 text-muted-foreground" /></div>
            <p className="text-sm font-medium">{t("admin.noParticipants")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("admin.noParticipantsDesc")}</p>
            <Button size="sm" className="mt-4" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4" /> {t("btn.addParticipant")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="text-left font-medium py-2.5 px-5">{t("mon.col.participant")}</th>
                  <th className="text-left font-medium py-2.5">{t("misc.department")}</th>
                  <th className="text-left font-medium py-2.5">{t("misc.coach")}</th>
                  <th className="text-left font-medium py-2.5">{t("misc.dates")}</th>
                  <th className="text-left font-medium py-2.5">{t("mon.col.status")}</th>
                  <th className="text-left font-medium py-2.5 w-32">{t("misc.overallProgress")}</th>
                  <th className="text-left font-medium py-2.5">{t("misc.docs")}</th>
                  <th className="text-right font-medium py-2.5 px-5">{t("misc.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground grid place-items-center text-[11px] font-semibold">{p.avatar}</div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{p.department}</td>
                    <td className="text-xs text-muted-foreground">{p.coach || <span className="italic">{t("misc.unassigned")}</span>}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{p.startDate} → {p.endDate}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="w-20" />
                        <span className="text-[11px] text-muted-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="text-xs">{p.submittedDocs}/{p.requiredDocs}</td>
                    <td className="text-right px-5 whitespace-nowrap">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(p)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mt-3">
        {t("hint.operatingAcross", { departments: departments.length, coaches: coaches.length })}
      </p>

      <ParticipantFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.deleteParticipantTitle", { name: deleting?.name ?? "" })}
        description={t("admin.deleteParticipantDesc")}
        onConfirm={() => {
          if (deleting) {
            deleteParticipant(deleting.id);
            toast.success(t("toast.removed", { name: deleting.name }));
            setDeleting(null);
          }
        }}
      />
    </AppShell>
  );
}
