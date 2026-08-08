import type { GetNotificationsQueryDto } from "@/dtos/req/notification-request.dto";
import type {
  GetNotificationsResponseDto,
  GetUnreadNotificationCountResponseDto,
  MarkAllNotificationsReadResponseDto,
  MarkNotificationReadResponseDto,
  NotificationDto,
  NotificationReadAllResultDto,
  NotificationReadResultDto,
  NotificationUnreadCountDto,
} from "@/dtos/res/notification-response.dto";
import type { PagedDataDto } from "@/dtos/res/api-envelope.dto";
import http from "@/lib/axios";

const NOTIFICATION_LIST_PATH = "/notification";
const NOTIFICATION_UNREAD_COUNT_PATH = "/notification/unread-count";
const NOTIFICATION_READ_ALL_PATH = "/notification/read-all";

function readProp(
  source: Record<string, unknown>,
  camel: string,
  pascal: string,
): unknown {
  return source[camel] ?? source[pascal];
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function coerceNotificationDto(raw: Record<string, unknown>): NotificationDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")) ?? 0,
    type: asString(readProp(raw, "type", "Type")) ?? "",
    title: asString(readProp(raw, "title", "Title")) ?? "",
    message: asString(readProp(raw, "message", "Message")) ?? "",
    entityType: asString(readProp(raw, "entityType", "EntityType")),
    entityId: asNumber(readProp(raw, "entityId", "EntityId")),
    isRead: asBoolean(readProp(raw, "isRead", "IsRead")),
    createdAt: asString(readProp(raw, "createdAt", "CreatedAt")) ?? "",
  };
}

function coercePagedNotifications(
  value: unknown,
): PagedDataDto<NotificationDto> {
  if (!isRecord(value)) {
    return { data: [], pageNumber: 1, pageSize: 20, totalRecords: 0 };
  }

  const rows = readProp(value, "data", "Data");
  const data = Array.isArray(rows)
    ? rows
        .filter(isRecord)
        .map(coerceNotificationDto)
        .filter((row) => row.id > 0)
    : [];

  return {
    data,
    pageNumber:
      asNumber(readProp(value, "pageNumber", "PageNumber")) ?? 1,
    pageSize: asNumber(readProp(value, "pageSize", "PageSize")) ?? 20,
    totalRecords:
      asNumber(readProp(value, "totalRecords", "TotalRecords")) ??
      data.length,
  };
}

function coerceUnreadCount(value: unknown): NotificationUnreadCountDto {
  if (!isRecord(value)) {
    return { count: 0 };
  }

  return {
    count: asNumber(readProp(value, "count", "Count")) ?? 0,
  };
}

function coerceNotificationReadResult(
  value: unknown,
  fallbackId: number,
): NotificationReadResultDto {
  if (!isRecord(value)) {
    return { id: fallbackId, isRead: true, readAt: null };
  }

  return {
    id: asNumber(readProp(value, "id", "Id")) ?? fallbackId,
    // Optimistic default: this is the reply to a mark-as-read call, so a
    // missing field means read. `asBoolean` is non-nullable, so the previous
    // `|| true` swallowed an explicit false instead of defaulting.
    isRead: asBoolean(readProp(value, "isRead", "IsRead") ?? true),
    readAt: asString(readProp(value, "readAt", "ReadAt")),
  };
}

function coerceNotificationReadAllResult(
  value: unknown,
): NotificationReadAllResultDto {
  if (!isRecord(value)) {
    return { updatedCount: 0 };
  }

  return {
    updatedCount:
      asNumber(readProp(value, "updatedCount", "UpdatedCount")) ?? 0,
  };
}

function assertSuccess(
  envelope: {
    success?: boolean;
    Success?: boolean;
    isError?: boolean;
    IsError?: boolean;
    message?: string;
    Message?: string;
  },
  fallback: string,
): void {
  const isError =
    envelope.isError === true ||
    envelope.IsError === true ||
    envelope.success === false ||
    envelope.Success === false;

  if (isError) {
    throw new Error(
      envelope.message?.trim() ||
        envelope.Message?.trim() ||
        fallback,
    );
  }
}

function readEnvelopeDataModel(envelope: unknown): unknown {
  if (!isRecord(envelope)) {
    return null;
  }

  return readProp(envelope, "dataModel", "DataModel");
}

export async function getNotifications(
  query: GetNotificationsQueryDto = {},
): Promise<PagedDataDto<NotificationDto>> {
  const pageNumber = query.pageNumber ?? 1;
  const pageSize = query.pageSize ?? 20;
  const unreadOnly = query.unreadOnly ?? false;

  const { data } = await http.get<GetNotificationsResponseDto>(
    NOTIFICATION_LIST_PATH,
    {
      params: {
        unreadOnly,
        pageNumber,
        pageSize,
      },
    },
  );

  assertSuccess(data, "Could not load notifications.");
  return coercePagedNotifications(readEnvelopeDataModel(data));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await http.get<GetUnreadNotificationCountResponseDto>(
    NOTIFICATION_UNREAD_COUNT_PATH,
  );

  assertSuccess(data, "Could not load unread notification count.");
  return coerceUnreadCount(readEnvelopeDataModel(data)).count;
}

export async function markNotificationRead(
  id: number,
): Promise<NotificationReadResultDto> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Invalid notification id.");
  }

  const { data } = await http.put<MarkNotificationReadResponseDto>(
    `${NOTIFICATION_LIST_PATH}/${encodeURIComponent(String(id))}/read`,
  );

  assertSuccess(data, "Could not mark notification as read.");
  return coerceNotificationReadResult(readEnvelopeDataModel(data), id);
}

export async function markAllNotificationsRead(): Promise<NotificationReadAllResultDto> {
  const { data } = await http.put<MarkAllNotificationsReadResponseDto>(
    NOTIFICATION_READ_ALL_PATH,
  );

  assertSuccess(data, "Could not mark all notifications as read.");
  return coerceNotificationReadAllResult(readEnvelopeDataModel(data));
}
