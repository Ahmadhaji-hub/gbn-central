import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/NotificationsPage";
import { CURRENT_PARTICIPANT_ID } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/participant/notifications")({
  head: () => ({ meta: [{ title: "Notifications — GBNews" }] }),
  component: ParticipantNotifications,
});

function ParticipantNotifications() {
  const { t } = useI18n();
  return (
    <NotificationsPage
      role="participant"
      audience="participant"
      recipient={CURRENT_PARTICIPANT_ID}
      intro={t("notif.participantIntro")}
    />
  );
}
