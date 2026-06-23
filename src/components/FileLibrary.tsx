import { useMemo, useState } from "react";
import {
  Search,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FileIcon,
  Folder,
  Filter,
  Grid3x3,
  List as ListIcon,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";
import {
  participants,
  participantFiles as allFiles,
  requiredDocTypes,
  getParticipantFiles,
  getDocStatus,
  type ParticipantFile,
  type FileKind,
} from "@/lib/mock-data";
import { Progress } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Mode = "admin" | "coach" | "participant";

const kindMeta: Record<
  FileKind,
  { icon: typeof FileText; tint: string; label: string }
> = {
  pdf: { icon: FileText, tint: "bg-destructive/10 text-destructive", label: "PDF" },
  image: { icon: ImageIcon, tint: "bg-info/10 text-info", label: "Image" },
  doc: { icon: FileText, tint: "bg-primary/10 text-primary", label: "Doc" },
  sheet: { icon: FileSpreadsheet, tint: "bg-success/10 text-success", label: "Sheet" },
  other: { icon: FileIcon, tint: "bg-muted text-muted-foreground", label: "File" },
};

export interface FileLibraryProps {
  mode: Mode;
  /** When provided, library is scoped to a single participant. */
  participantId?: string;
  /** Optional whitelist of participant IDs (e.g. coach scope). */
  allowedParticipantIds?: string[];
  title?: string;
}

export function FileLibrary({ mode, participantId, allowedParticipantIds, title }: FileLibraryProps) {
  const { t } = useI18n();
  const scoped = participantId !== undefined;
  const allowed = allowedParticipantIds ? new Set(allowedParticipantIds) : null;

  const visibleParticipants = useMemo(
    () => (allowed ? participants.filter((p) => allowed.has(p.id)) : participants),
    [allowed],
  );

  const baseFiles = useMemo(
    () =>
      scoped
        ? getParticipantFiles(participantId!)
        : allowed
          ? allFiles.filter((f) => allowed.has(f.participantId))
          : allFiles,
    [participantId, scoped, allowed],
  );

  const [query, setQuery] = useState("");
  const [activeParticipant, setActiveParticipant] = useState<string | "all">("all");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [view, setView] = useState<"grid" | "list">("list");
  const [preview, setPreview] = useState<ParticipantFile | null>(null);

  const categories = useMemo(() => {
    const s = new Set<string>();
    baseFiles.forEach((f) => s.add(f.category));
    return Array.from(s).sort();
  }, [baseFiles]);

  const filtered = useMemo(() => {
    return baseFiles.filter((f) => {
      if (!scoped && activeParticipant !== "all" && f.participantId !== activeParticipant) return false;
      if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (query) {
        const q = query.toLowerCase();
        const part = participants.find((p) => p.id === f.participantId)?.name ?? "";
        if (
          !f.name.toLowerCase().includes(q) &&
          !f.category.toLowerCase().includes(q) &&
          !part.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [baseFiles, activeParticipant, activeCategory, query, scoped]);

  const canUpload = mode === "admin" || mode === "coach" || mode === "participant";

  // Missing docs panel data
  const missingPanel = useMemo(() => {
    if (scoped) {
      return [{ id: participantId!, name: participants.find((p) => p.id === participantId)?.name ?? "", status: getDocStatus(participantId!) }];
    }
    return visibleParticipants.map((p) => ({
      id: p.id,
      name: p.name,
      status: getDocStatus(p.id),
    }));
  }, [scoped, participantId, visibleParticipants]);

  const totalRequired = requiredDocTypes.length * (scoped ? 1 : visibleParticipants.length);
  const totalMissing = missingPanel.reduce(
    (acc, p) => acc + p.status.filter((s) => s.status === "missing").length,
    0,
  );
  const compliancePct = Math.round(((totalRequired - totalMissing) / totalRequired) * 100);

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{t("section.library")}</p>
          {!scoped && (
            <>
              <SidebarGroup label={t("section.people")}>
                <SidebarItem
                  active={activeParticipant === "all"}
                  onClick={() => setActiveParticipant("all")}
                  icon={Folder}
                  label={t("file.allParticipants")}
                  count={baseFiles.length}
                />
                {visibleParticipants.map((p) => {
                  const c = baseFiles.filter((f) => f.participantId === p.id).length;
                  return (
                    <SidebarItem
                      key={p.id}
                      active={activeParticipant === p.id}
                      onClick={() => setActiveParticipant(p.id)}
                      icon={Folder}
                      label={p.name}
                      count={c}
                    />
                  );
                })}
              </SidebarGroup>
            </>
          )}
          <SidebarGroup label={t("section.documentType")}>
            <SidebarItem
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              icon={Filter}
              label={t("file.allTypes")}
            />
            {categories.map((c) => {
              const count = baseFiles.filter(
                (f) =>
                  (scoped || activeParticipant === "all" || f.participantId === activeParticipant) &&
                  f.category === c,
              ).length;
              return (
                <SidebarItem
                  key={c}
                  active={activeCategory === c}
                  onClick={() => setActiveCategory(c)}
                  icon={Filter}
                  label={t(`doc.category.${c}`)}
                  count={count}
                />
              );
            })}
          </SidebarGroup>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">{t("section.documentCompliance")}</p>
            <span className="text-xs font-medium">{compliancePct}%</span>
          </div>
          <Progress
            value={compliancePct}
            tone={compliancePct >= 90 ? "success" : compliancePct >= 60 ? "warning" : "danger"}
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            {t("file.missingOfRequired", { missing: totalMissing, required: totalRequired })}
          </p>
        </div>
      </aside>

      {/* Main */}
      <section className="space-y-4 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold mr-auto">{title ?? t("file.title")}</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("file.searchLong")}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:outline-none"
            />
          </div>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "h-9 w-9 grid place-items-center",
                view === "list" ? "bg-muted" : "hover:bg-muted/60",
              )}
              aria-label={t("btn.listView")}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "h-9 w-9 grid place-items-center border-l border-border",
                view === "grid" ? "bg-muted" : "hover:bg-muted/60",
              )}
              aria-label={t("btn.gridView")}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
          {canUpload && (
            <button className="h-9 inline-flex items-center gap-1.5 px-3 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90">
              <Upload className="h-3.5 w-3.5" /> {t("file.upload")}
            </button>
          )}
        </div>

        {/* Missing required docs banner */}
        {totalMissing > 0 && (
          <MissingDocsPanel mode={mode} scoped={scoped} data={missingPanel} />
        )}

        {/* Files */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <FileIcon className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium mt-2">{t("file.noFound")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("file.tryDifferent")}
            </p>
          </div>
        ) : view === "list" ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground bg-muted/40">
              <span>{t("file.name")}</span>
              {!scoped && <span>{t("file.participant")}</span>}
              <span>{t("file.type")}</span>
              <span>{t("file.modified")}</span>
              {scoped && <span>{t("file.uploadedBy")}</span>}
              <span></span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((f) => {
                const meta = kindMeta[f.kind];
                const Icon = meta.icon;
                const part = participants.find((p) => p.id === f.participantId);
                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-muted/40 group"
                  >
                    <button
                      onClick={() => setPreview(f)}
                      className="flex items-center gap-3 min-w-0 text-left"
                    >
                      <div className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", meta.tint)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground md:hidden truncate">
                          {part?.name ?? "—"} · {t(`doc.category.${f.category}`)} · {f.date}
                        </p>
                      </div>
                    </button>
                    {!scoped && (
                      <span className="hidden md:block text-xs text-muted-foreground truncate">
                        {part?.name ?? "—"}
                      </span>
                    )}
                    <span className="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground w-fit">
                      {t(`doc.category.${f.category}`)}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">
                      {f.date} · {f.size}
                    </span>
                    {scoped && (
                      <span className="hidden md:block text-xs text-muted-foreground truncate">
                        {f.uploadedBy}
                      </span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreview(f)}
                        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"
                        aria-label={t("file.preview")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"
                        aria-label={t("file.download")}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((f) => {
              const meta = kindMeta[f.kind];
              const Icon = meta.icon;
              const part = participants.find((p) => p.id === f.participantId);
              return (
                <button
                  key={f.id}
                  onClick={() => setPreview(f)}
                  className="text-left rounded-2xl border border-border bg-card p-4 hover:shadow-sm hover:border-ring/30 transition"
                >
                  <div className={cn("h-10 w-10 rounded-lg grid place-items-center mb-3", meta.tint)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {part?.name ?? f.category}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                    <span>{f.size}</span>
                    <span>{f.date}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <PreviewDialog file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 px-2 mb-1">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: typeof Folder;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {typeof count === "number" && (
        <span className="text-[10px] tabular-nums opacity-70">{count}</span>
      )}
    </button>
  );
}

function MissingDocsPanel({
  mode,
  scoped,
  data,
}: {
  mode: Mode;
  scoped: boolean;
  data: { id: string; name: string; status: { key: string; label: string; status: "submitted" | "missing" }[] }[];
}) {
  const { t } = useI18n();
  const items = data
    .map((p) => ({
      ...p,
      missing: p.status.filter((s) => s.status === "missing"),
    }))
    .filter((p) => p.missing.length > 0);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-warning/15 grid place-items-center shrink-0">
          <AlertCircle className="h-4 w-4 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {scoped ? t("file.missingRequired") : t("file.participantsMissing", { n: items.length })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mode === "participant"
              ? t("file.uploadToComplete")
              : t("file.followUpMissing")}
          </p>
          <div className="mt-3 space-y-2">
            {items.slice(0, scoped ? 8 : 5).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-card border border-border"
              >
                {!scoped && (
                  <span className="text-xs font-medium mr-1">{p.name}</span>
                )}
                {p.missing.map((m) => (
                  <span
                    key={m.key}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20"
                  >
                    <X className="h-3 w-3" />
                    {t(`doc.type.${m.key}`)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewDialog({ file, onClose }: { file: ParticipantFile | null; onClose: () => void }) {
  const { t } = useI18n();
  if (!file) return null;
  const meta = kindMeta[file.kind];
  const Icon = meta.icon;
  const part = participants.find((p) => p.id === file.participantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className={cn("h-9 w-9 rounded-lg grid place-items-center", meta.tint)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {part?.name ?? "—"} · {t(`doc.category.${file.category}`)} · {t("file.uploadedByLine", { name: file.uploadedBy })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"
            aria-label={t("btn.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 bg-muted/30">
          <div className="aspect-[4/3] rounded-xl border border-dashed border-border bg-card grid place-items-center">
            <div className="text-center">
              <div className={cn("h-14 w-14 rounded-2xl mx-auto grid place-items-center", meta.tint)}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium mt-3">{t("file.previewTitle", { type: t(`file.kind.${file.kind}`) })}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {file.size} · {file.date}
              </p>
              {file.requirementKey && (
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("file.requiredDocument")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button onClick={onClose} className="h-9 px-3 text-xs rounded-lg hover:bg-muted">
            {t("btn.close")}
          </button>
          <button className="h-9 inline-flex items-center gap-1.5 px-3 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90">
            <Download className="h-3.5 w-3.5" /> {t("file.download")}
          </button>
        </div>
      </div>
    </div>
  );
}
