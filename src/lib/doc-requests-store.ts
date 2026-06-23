import { useSyncExternalStore } from "react";
import { participants, requiredDocTypes, CURRENT_COACH } from "./mock-data";
import { pushNotification } from "./notifications-store";

export type DocPriority = "normal" | "urgent";
export type DocRequestStatus =
  | "requested"
  | "pending"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected";

export type RequesterRole = "admin" | "coach";

export interface DocRequestUpload {
  id: string;
  fileName: string;
  size: string;
  uploadedAt: number;
  uploadedAtLabel: string;
  participantNote?: string;
}

export interface DocReviewEntry {
  id: string;
  at: number;
  atLabel: string;
  reviewer: string;
  action: "approved" | "rejected" | "re-upload" | "comment";
  comment?: string;
}

export interface DocRequest {
  id: string;
  participantId: string;
  docKey: string; // requirement key (matches requiredDocTypes)
  docLabel: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: DocPriority;
  requesterRole: RequesterRole;
  requesterName: string;
  status: DocRequestStatus;
  createdAt: number;
  uploads: DocRequestUpload[];
  reviews: DocReviewEntry[];
}

// ---- additional types beyond required catalog ----
export const extraDocTypes: { key: string; label: string; category: string }[] = [
  { key: "passport", label: "Passport copy", category: "Identity" },
  { key: "cv", label: "CV / Resume", category: "Personal" },
  { key: "portfolio", label: "Portfolio", category: "Work" },
  { key: "evaluation", label: "Evaluation form", category: "Compliance" },
];

export function getAllDocTypes() {
  return [
    ...requiredDocTypes.map((d) => ({ key: d.key, label: d.label, category: d.category })),
    ...extraDocTypes,
  ];
}

// ---- store ----

let _id = 0;
const nid = () => `dr_${Date.now().toString(36)}_${++_id}`;

const fmtTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

function seed(): DocRequest[] {
  const now = Date.now();
  return [
    {
      id: nid(),
      participantId: "p1",
      docKey: "nda",
      docLabel: "Confidentiality NDA",
      description: "Please sign and return the latest NDA (v3.2).",
      dueDate: "2026-05-12",
      priority: "urgent",
      requesterRole: "coach",
      requesterName: "Fatima Zouhra",
      status: "requested",
      createdAt: now - 3 * 3_600_000,
      uploads: [],
      reviews: [],
    },
    {
      id: nid(),
      participantId: "p1",
      docKey: "passport",
      docLabel: "Passport copy",
      description: "Color scan, both pages.",
      dueDate: "2026-05-20",
      priority: "normal",
      requesterRole: "admin",
      requesterName: "Eva Martín",
      status: "submitted",
      createdAt: now - 2 * 86_400_000,
      uploads: [
        {
          id: "u_seed_1",
          fileName: "Ahmad_Passport.pdf",
          size: "1.4 MB",
          uploadedAt: now - 86_400_000,
          uploadedAtLabel: "1d ago",
        },
      ],
      reviews: [],
    },
    {
      id: nid(),
      participantId: "p2",
      docKey: "tax",
      docLabel: "Tax form W-9",
      dueDate: "2026-05-15",
      priority: "urgent",
      requesterRole: "coach",
      requesterName: "Fatima Zouhra",
      status: "requested",
      createdAt: now - 5 * 3_600_000,
      uploads: [],
      reviews: [],
    },
  ];
}

let items: DocRequest[] = seed();
const listeners = new Set<() => void>();
const emit = () => {
  items = [...items];
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => items;

export function useDocRequests() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getRequestsForParticipant(participantId: string) {
  return items
    .filter((r) => r.participantId === participantId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getRequestsByRequester(role: RequesterRole, name: string) {
  return items
    .filter((r) => r.requesterRole === role && r.requesterName === name)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllRequests() {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export function getRequest(id: string) {
  return items.find((r) => r.id === id);
}

// ---- actions ----

export function createDocRequest(input: {
  participantId: string;
  docKey: string;
  description?: string;
  dueDate: string;
  priority: DocPriority;
  requesterRole: RequesterRole;
  requesterName: string;
}) {
  const all = getAllDocTypes();
  const meta = all.find((d) => d.key === input.docKey);
  const docLabel = meta?.label ?? input.docKey;
  const req: DocRequest = {
    id: nid(),
    participantId: input.participantId,
    docKey: input.docKey,
    docLabel,
    description: input.description,
    dueDate: input.dueDate,
    priority: input.priority,
    requesterRole: input.requesterRole,
    requesterName: input.requesterName,
    status: "requested",
    createdAt: Date.now(),
    uploads: [],
    reviews: [],
  };
  items = [req, ...items];
  emit();

  pushNotification({
    audience: "participant",
    recipient: input.participantId,
    participantId: input.participantId,
    coach: input.requesterRole === "coach" ? input.requesterName : undefined,
    title: `${input.requesterName} requested your ${docLabel}`,
    description: input.description ?? `Due ${input.dueDate} · ${input.priority === "urgent" ? "Urgent" : "Normal"}`,
    type: input.priority === "urgent" ? "warning" : "info",
    action: "doc.request",
  });

  return req;
}

export function uploadDocForRequest(
  requestId: string,
  upload: { fileName: string; size: string; participantNote?: string },
) {
  const r = items.find((x) => x.id === requestId);
  if (!r) return;
  const now = Date.now();
  const u: DocRequestUpload = {
    id: `u_${now.toString(36)}`,
    fileName: upload.fileName,
    size: upload.size || "—",
    uploadedAt: now,
    uploadedAtLabel: fmtTime(now),
    participantNote: upload.participantNote,
  };
  items = items.map((x) =>
    x.id === requestId
      ? { ...x, uploads: [u, ...x.uploads], status: "submitted" as DocRequestStatus }
      : x,
  );
  emit();

  const participant = participants.find((p) => p.id === r.participantId);
  // Notify requester
  if (r.requesterRole === "coach") {
    pushNotification({
      audience: "coach",
      recipient: r.requesterName,
      participantId: r.participantId,
      title: `${participant?.name ?? "Participant"} uploaded the requested ${r.docLabel}`,
      description: `${u.fileName} · ${u.size}`,
      type: "success",
      action: "doc.uploaded",
    });
  }
  // (admin notifications can be inspected via the admin doc requests page)
}

export function reviewDocRequest(
  requestId: string,
  action: "approve" | "reject" | "re-upload" | "comment",
  reviewer: string,
  comment?: string,
) {
  const r = items.find((x) => x.id === requestId);
  if (!r) return;
  const now = Date.now();
  const entry: DocReviewEntry = {
    id: `rv_${now.toString(36)}`,
    at: now,
    atLabel: fmtTime(now),
    reviewer,
    action: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "re-upload" ? "re-upload" : "comment",
    comment,
  };
  let nextStatus: DocRequestStatus = r.status;
  if (action === "approve") nextStatus = "approved";
  else if (action === "reject") nextStatus = "rejected";
  else if (action === "re-upload") nextStatus = "pending";

  items = items.map((x) =>
    x.id === requestId
      ? { ...x, status: nextStatus, reviews: [entry, ...x.reviews] }
      : x,
  );
  emit();

  const participant = participants.find((p) => p.id === r.participantId);
  if (action === "approve") {
    pushNotification({
      audience: "participant",
      recipient: r.participantId,
      participantId: r.participantId,
      coach: r.requesterRole === "coach" ? r.requesterName : undefined,
      title: `${reviewer} approved your ${r.docLabel}`,
      description: comment,
      type: "success",
      action: "doc.approved",
    });
  } else if (action === "reject") {
    pushNotification({
      audience: "participant",
      recipient: r.participantId,
      participantId: r.participantId,
      coach: r.requesterRole === "coach" ? r.requesterName : undefined,
      title: `${reviewer} rejected your ${r.docLabel}`,
      description: comment ?? "Please review and re-upload.",
      type: "warning",
      action: "doc.rejected",
    });
  } else if (action === "re-upload") {
    pushNotification({
      audience: "participant",
      recipient: r.participantId,
      participantId: r.participantId,
      coach: r.requesterRole === "coach" ? r.requesterName : undefined,
      title: `${reviewer} requested a re-upload of ${r.docLabel}`,
      description: comment,
      type: "warning",
      action: "doc.reupload",
    });
  } else if (action === "comment") {
    pushNotification({
      audience: "participant",
      recipient: r.participantId,
      participantId: r.participantId,
      coach: r.requesterRole === "coach" ? r.requesterName : undefined,
      title: `${reviewer} commented on your ${r.docLabel}`,
      description: comment,
      type: "info",
      action: "doc.comment",
    });
  }
  void participant;
}

export function deleteDocRequest(id: string) {
  items = items.filter((r) => r.id !== id);
  emit();
}

export const _test_default_requester = CURRENT_COACH;
