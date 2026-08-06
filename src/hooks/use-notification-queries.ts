"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/services/notification.service";

const DEFAULT_PAGE_SIZE = 20;

export const notificationQueryKeys = {
  all: ["notification"] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
  list: (params: { unreadOnly: boolean; pageSize: number }) =>
    [...notificationQueryKeys.all, "list", params] as const,
};

const POLL_INTERVAL_MS = 60_000;

function pollIntervalMs(): number | false {
  if (typeof document !== "undefined" && document.hidden) {
    return false;
  }
  return POLL_INTERVAL_MS;
}

export function useUnreadNotificationCountQuery(enabled = true) {
  const accessTokenState = useHasAccessToken();
  const isReady = accessTokenState === true;

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => getUnreadNotificationCount(),
    enabled: enabled && isReady,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useNotificationListQuery(
  open: boolean,
  options: Readonly<{ unreadOnly?: boolean; pageSize?: number }> = {},
) {
  const accessTokenState = useHasAccessToken();
  const isReady = accessTokenState === true;
  const unreadOnly = options.unreadOnly ?? false;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list({ unreadOnly, pageSize }),
    queryFn: ({ pageParam }) =>
      getNotifications({
        unreadOnly,
        pageNumber: pageParam,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.pageNumber * lastPage.pageSize;
      return loadedCount < lastPage.totalRecords
        ? lastPage.pageNumber + 1
        : undefined;
    },
    enabled: open && isReady,
  });
}
