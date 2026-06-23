import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonitoringTable } from "@/components/MonitoringTable";
import { CURRENT_COACH, getCoachParticipants } from "@/lib/mock-data";

export const Route = createFileRoute("/coach/participants/")({
  head: () => ({ meta: [{ title: "My Participants — GBNews" }] }),
  component: CoachParticipants,
});

function CoachParticipants() {
  const mine = getCoachParticipants(CURRENT_COACH);
  return (
    <AppShell role="coach" title="My Participants">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {mine.length} assigned participant{mine.length === 1 ? "" : "s"} in your departments.
        </p>
      </div>
      <MonitoringTable participants={mine} scope="coach" />
    </AppShell>
  );
}
