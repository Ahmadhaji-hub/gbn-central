import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FileLibrary } from "@/components/FileLibrary";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/participant/files")({
  head: () => ({ meta: [{ title: "My files — GBNews" }] }),
  component: ParticipantFiles,
});

function ParticipantFiles() {
  const { t } = useI18n();
  return (
    <AppShell role="participant" title={t("p.myFilesTitle")}>
      <FileLibrary mode="participant" participantId="p1" title={t("p.myDocuments")} />
    </AppShell>
  );
}
