import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FileLibrary } from "@/components/FileLibrary";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/files")({
  head: () => ({ meta: [{ title: "File management — GBNews" }] }),
  component: AdminFiles,
});

function AdminFiles() {
  const { t } = useI18n();
  return (
    <AppShell role="admin" title={t("nav.files")}>
      <FileLibrary mode="admin" title={t("section.organizationFiles")} />
    </AppShell>
  );
}
