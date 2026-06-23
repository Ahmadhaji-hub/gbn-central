import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore, addParticipant, updateParticipant, type Participant, type ParticipantStatus } from "@/lib/admin-store";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Participant | null;
};

const empty = {
  name: "",
  email: "",
  program: "",
  coach: "",
  department: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  requiredDocs: 6,
  status: "pending" as ParticipantStatus,
};

export function ParticipantFormDialog({ open, onOpenChange, editing }: Props) {
  const coaches = useAdminStore((s) => s.coaches);
  const departments = useAdminStore((s) => s.departments);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email,
        program: editing.program,
        coach: editing.coach,
        department: editing.department,
        startDate: editing.startDate,
        endDate: editing.endDate,
        requiredDocs: editing.requiredDocs,
        status: editing.status,
      });
    } else if (open) {
      setForm(empty);
    }
  }, [editing, open]);

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (editing) {
      updateParticipant(editing.id, form);
      toast.success(`Updated ${form.name}`);
    } else {
      addParticipant(form);
      toast.success(`Added ${form.name}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit participant" : "Add new participant"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update participant details, assignments, and status." : "Create a participant and assign them to a department and coach."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Program">
            <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ParticipantStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At risk</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Department">
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Coach">
            <Select value={form.coach} onValueChange={(v) => setForm({ ...form, coach: v })}>
              <SelectTrigger><SelectValue placeholder="Assign coach" /></SelectTrigger>
              <SelectContent>
                {coaches.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End date">
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
          <Field label="Required documents">
            <Input
              type="number"
              min={0}
              value={form.requiredDocs}
              onChange={(e) => setForm({ ...form, requiredDocs: Number(e.target.value) })}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create participant"}</Button>
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
