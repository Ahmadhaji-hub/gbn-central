import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonitoringTable } from "@/components/MonitoringTable";
import { CURRENT_COACH, getCoachParticipants } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/coach/monitoring")({
  head: () => ({ meta: [{ title: "My Participants — GBNews" }] }),
  component: CoachMonitoring,
});

function CoachMonitoring() {
  const { t } = useI18n();
  const mine = getCoachParticipants(CURRENT_COACH);
  return (
    <AppShell role="coach" title={t("page.participantMonitoring")}>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          {t("mon.intro")}
        </p>
      </div>
      <MonitoringTable participants={mine} scope="coach" />
    </AppShell>
  );
}
