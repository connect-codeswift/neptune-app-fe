export type GetNotificationsQueryDto = Readonly<{
  unreadOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}>;
