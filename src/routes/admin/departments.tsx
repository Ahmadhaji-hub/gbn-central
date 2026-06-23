import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DepartmentFormDialog } from "@/components/admin/DepartmentFormDialog";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  useAdminStore,
  deleteDepartment,
  updateCoach,
  updateParticipant,
  type Department,
} from "@/lib/admin-store";
import { Building2, Plus, Pencil, Trash2, UserMinus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — GBNews Admin" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const departments = useAdminStore((s) => s.departments);
  const coaches = useAdminStore((s) => s.coaches);
  const participants = useAdminStore((s) => s.participants);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [viewing, setViewing] = useState<Department | null>(null);
  const [addCoachId, setAddCoachId] = useState("");
  const [addParticipantId, setAddParticipantId] = useState("");

  return (
    <AppShell role="admin" title="Departments">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">{departments.length} departments managing {participants.length} participants</p>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Create department
        </Button>
      </div>

      {departments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 grid place-items-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-3"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
          <p className="text-sm font-medium">No departments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create one to start grouping coaches and participants.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => {
            const deptCoaches = coaches.filter((c) => c.department === d.name);
            const deptParticipants = participants.filter((p) => p.department === d.name);
            return (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">Lead: {d.lead || "—"}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(d); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleting(d)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-[11px] text-muted-foreground">Coaches</p>
                    <p className="text-lg font-semibold">{deptCoaches.length}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-[11px] text-muted-foreground">Participants</p>
                    <p className="text-lg font-semibold">{deptParticipants.length}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => { setViewing(d); setAddCoachId(""); setAddParticipantId(""); }}>
                  <Users className="h-4 w-4" /> Manage members
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <DepartmentFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="Coaches and participants in this department will be marked Unassigned."
        onConfirm={() => {
          if (deleting) { deleteDepartment(deleting.id); toast.success(`Deleted ${deleting.name}`); setDeleting(null); }
        }}
      />

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewing?.name}</SheetTitle>
            <SheetDescription>Lead: {viewing?.lead || "—"}</SheetDescription>
          </SheetHeader>

          {viewing && (
            <div className="mt-6 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase text-muted-foreground">Coaches</p>
                </div>
                <div className="flex gap-2 mb-2">
                  <Select value={addCoachId} onValueChange={setAddCoachId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Add a coach…" /></SelectTrigger>
                    <SelectContent>
                      {coaches.filter((c) => c.department !== viewing.name).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.department || "Unassigned"})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={!addCoachId} onClick={() => {
                    updateCoach(addCoachId, { department: viewing.name });
                    toast.success("Coach reassigned");
                    setAddCoachId("");
                  }}><UserPlus className="h-4 w-4" /></Button>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {coaches.filter((c) => c.department === viewing.name).map((c) => (
                    <div key={c.id} className="px-3 py-2.5 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px] font-semibold">
                        {c.name.split(" ").map((s) => s[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { updateCoach(c.id, { department: "Unassigned" }); toast.success("Removed from department"); }}>
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {coaches.filter((c) => c.department === viewing.name).length === 0 && (
                    <p className="px-3 py-6 text-xs text-center text-muted-foreground">No coaches assigned.</p>
                  )}
                </div>
              </section>

              <section>
                <p className="text-xs uppercase text-muted-foreground mb-2">Participants</p>
                <div className="flex gap-2 mb-2">
                  <Select value={addParticipantId} onValueChange={setAddParticipantId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Add a participant…" /></SelectTrigger>
                    <SelectContent>
                      {participants.filter((p) => p.department !== viewing.name).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.department})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={!addParticipantId} onClick={() => {
                    updateParticipant(addParticipantId, { department: viewing.name });
                    toast.success("Participant reassigned");
                    setAddParticipantId("");
                  }}><UserPlus className="h-4 w-4" /></Button>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {participants.filter((p) => p.department === viewing.name).map((p) => (
                    <div key={p.id} className="px-3 py-2.5 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px] font-semibold">{p.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">Coach: {p.coach || "Unassigned"}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { updateParticipant(p.id, { department: "Unassigned" }); toast.success("Removed from department"); }}>
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {participants.filter((p) => p.department === viewing.name).length === 0 && (
                    <p className="px-3 py-6 text-xs text-center text-muted-foreground">No participants in this department.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
