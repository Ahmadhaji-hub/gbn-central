import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FileLibrary } from "@/components/FileLibrary";
import { CURRENT_COACH, getCoachParticipants } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/coach/files")({
  head: () => ({ meta: [{ title: "Participant files — GBNews" }] }),
  component: CoachFiles,
});

function CoachFiles() {
  const { t } = useI18n();
  const ids = getCoachParticipants(CURRENT_COACH).map((p) => p.id);
  return (
    <AppShell role="coach" title={t("page.participantFiles")}>
      <FileLibrary
        mode="coach"
        title={t("file.coachTitle", { coach: CURRENT_COACH })}
        allowedParticipantIds={ids}
      />
    </AppShell>
  );
}
