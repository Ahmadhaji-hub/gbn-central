import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/SettingsPage";

export const Route = createFileRoute("/participant/settings")({
  component: () => <SettingsPage role="participant" />,
});
