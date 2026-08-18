import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

export type NotificationDto = {
  id: number;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationUnreadCountDto = {
  count: number;
};

export type NotificationReadResultDto = {
  id: number;
  isRead: boolean;
  readAt: string | null;
};

export type NotificationReadAllResultDto = {
  updatedCount: number;
};

export type GetNotificationsResponseDto =
  ApiEnvelopeDto<PagedDataDto<NotificationDto> | null>;

export type GetUnreadNotificationCountResponseDto =
  ApiEnvelopeDto<NotificationUnreadCountDto | null>;

export type MarkNotificationReadResponseDto =
  ApiEnvelopeDto<NotificationReadResultDto | null>;

export type MarkAllNotificationsReadResponseDto =
  ApiEnvelopeDto<NotificationReadAllResultDto | null>;
