import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore, addDepartment, updateDepartment, type Department } from "@/lib/admin-store";
import { toast } from "sonner";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; editing?: Department | null };

export function DepartmentFormDialog({ open, onOpenChange, editing }: Props) {
  const coaches = useAdminStore((s) => s.coaches);
  const [form, setForm] = useState({ name: "", lead: "" });

  useEffect(() => {
    if (editing) setForm({ name: editing.name, lead: editing.lead });
    else if (open) setForm({ name: "", lead: "" });
  }, [editing, open]);

  const submit = () => {
    if (!form.name.trim()) return toast.error("Department name is required");
    if (editing) {
      updateDepartment(editing.id, form);
      toast.success(`Updated ${form.name}`);
    } else {
      addDepartment(form);
      toast.success(`Created ${form.name}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit department" : "Create department"}</DialogTitle>
          <DialogDescription>Departments group coaches and participants under a single lead.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Department name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Lead / manager">
            <Select value={form.lead} onValueChange={(v) => setForm({ ...form, lead: v })}>
              <SelectTrigger><SelectValue placeholder="Choose a lead" /></SelectTrigger>
              <SelectContent>
                {coaches.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save" : "Create department"}</Button>
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
