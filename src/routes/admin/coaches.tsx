import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CoachFormDialog } from "@/components/admin/CoachFormDialog";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { useAdminStore, deleteCoach, type Coach } from "@/lib/admin-store";
import { Mail, Plus, Pencil, Trash2, Users, Search, UserCog } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coaches")({
  head: () => ({ meta: [{ title: "Coaches — GBNews Admin" }] }),
  component: CoachesPage,
});

function CoachesPage() {
  const coaches = useAdminStore((s) => s.coaches);
  const departments = useAdminStore((s) => s.departments);
  const participants = useAdminStore((s) => s.participants);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [deleting, setDeleting] = useState<Coach | null>(null);
  const [viewing, setViewing] = useState<Coach | null>(null);

  const filtered = useMemo(
    () => coaches.filter((c) => {
      if (dept !== "all" && c.department !== dept) return false;
      if (q && !`${c.name} ${c.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }),
    [coaches, q, dept],
  );

  return (
    <AppShell role="admin" title="Coaches">
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-sm font-semibold">Coaching team</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} of {coaches.length} coaches</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 pl-8 w-56" />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4" /> Add coach
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 grid place-items-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-3"><UserCog className="h-5 w-5 text-muted-foreground" /></div>
            <p className="text-sm font-medium">No coaches found</p>
            <p className="text-xs text-muted-foreground mt-1">Adjust filters or add a new coach.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c) => {
              const assigned = participants.filter((p) => p.coach === c.name);
              return (
                <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground grid place-items-center text-sm font-semibold">
                    {c.name.split(" ").map((s) => s[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {c.email} · {c.department || "Unassigned"}
                    </p>
                  </div>
                  <button onClick={() => setViewing(c)} className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted">
                    <Users className="h-3.5 w-3.5" /> {assigned.length} participants
                  </button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(c); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(c)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CoachFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove ${deleting?.name}?`}
        description="Their assigned participants will be marked Unassigned."
        onConfirm={() => {
          if (deleting) { deleteCoach(deleting.id); toast.success(`Removed ${deleting.name}`); setDeleting(null); }
        }}
      />

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{viewing?.name}</SheetTitle>
            <SheetDescription>{viewing?.department} · {viewing?.email}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <p className="text-xs uppercase text-muted-foreground mb-2">Assigned participants</p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {participants.filter((p) => p.coach === viewing?.name).map((p) => (
                <div key={p.id} className="px-3 py-2.5 flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px] font-semibold">{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.department} · {p.progress}%</p>
                  </div>
                </div>
              ))}
              {viewing && participants.filter((p) => p.coach === viewing.name).length === 0 && (
                <p className="px-3 py-6 text-xs text-center text-muted-foreground">No participants assigned yet.</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
