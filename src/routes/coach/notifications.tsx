import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/NotificationsPage";
import { CURRENT_COACH } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/coach/notifications")({
  head: () => ({ meta: [{ title: "Notifications — GBNews" }] }),
  component: CoachNotifications,
});

function CoachNotifications() {
  const { t } = useI18n();
  return (
    <NotificationsPage
      role="coach"
      audience="coach"
      recipient={CURRENT_COACH}
      intro={t("notif.coachIntro")}
    />
  );
}
