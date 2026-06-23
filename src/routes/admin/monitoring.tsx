import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MonitoringTable } from "@/components/MonitoringTable";
import { participants } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/monitoring")({
  head: () => ({ meta: [{ title: "Participant Monitoring — GBNews" }] }),
  component: AdminMonitoring,
});

function AdminMonitoring() {
  const { t } = useI18n();
  return (
    <AppShell role="admin" title={t("page.participantMonitoring")}>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          {t("mon.intro")}
        </p>
      </div>
      <MonitoringTable participants={participants} scope="admin" />
    </AppShell>
  );
}
