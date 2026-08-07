import type { NotificationDto } from "@/dtos/res/notification-response.dto";

export type NotificationViewModel = Readonly<{
  id: number;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
  href: string | null;
}>;

export function notificationHref(
  entityType: string | null | undefined,
  entityId: number | null | undefined,
): string | null {
  if (entityId == null || entityId <= 0 || !entityType?.trim()) {
    return null;
  }

  const type = entityType.trim();
  const id = encodeURIComponent(String(entityId));

  switch (type) {
    case "Hazard":
      return `/dashboard/hazard/${id}`;
    case "Capa":
      return "/dashboard/capa";
    case "Audit":
      return "/dashboard/audits";
    case "AuditFinding":
      return `/dashboard/audits/findings/${id}`;
    case "Compliance":
      return `/dashboard/regulatory-compliance/${id}`;
    case "Incident":
      return `/dashboard/incidents/${id}`;
    case "NearMiss":
      return `/dashboard/near-miss/${id}`;
    default:
      return null;
  }
}

export function mapNotificationDtoToView(
  dto: NotificationDto,
): NotificationViewModel {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    entityType: dto.entityType,
    entityId: dto.entityId,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
    href: notificationHref(dto.entityType, dto.entityId),
  };
}

export function formatNotificationTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
