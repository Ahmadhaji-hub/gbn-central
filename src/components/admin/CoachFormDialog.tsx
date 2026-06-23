import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore, addCoach, updateCoach, type Coach } from "@/lib/admin-store";
import { toast } from "sonner";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; editing?: Coach | null };

const empty = { name: "", email: "", department: "" };

export function CoachFormDialog({ open, onOpenChange, editing }: Props) {
  const departments = useAdminStore((s) => s.departments);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) setForm({ name: editing.name, email: editing.email, department: editing.department });
    else if (open) setForm(empty);
  }, [editing, open]);

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and email are required");
    if (editing) {
      updateCoach(editing.id, form);
      toast.success(`Updated ${form.name}`);
    } else {
      addCoach(form);
      toast.success(`Added coach ${form.name}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit coach" : "Add new coach"}</DialogTitle>
          <DialogDescription>Manage coach profile and department assignment.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Department">
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save" : "Create coach"}</Button>
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
