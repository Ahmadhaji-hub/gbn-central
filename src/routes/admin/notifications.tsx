import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/NotificationsPage";
import { ADMIN_RECIPIENT } from "@/lib/notifications-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — GBNews" }] }),
  component: AdminNotifications,
});

function AdminNotifications() {
  const { t } = useI18n();
  return (
    <NotificationsPage
      role="admin"
      audience="admin"
      recipient={ADMIN_RECIPIENT}
      intro={t("notif.adminIntro")}
    />
  );
}
