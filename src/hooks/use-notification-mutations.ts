"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { PagedDataDto } from "@/dtos/res/api-envelope.dto";
import type { NotificationDto } from "@/dtos/res/notification-response.dto";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import { notificationQueryKeys } from "@/hooks/use-notification-queries";

type NotificationListCache = InfiniteData<PagedDataDto<NotificationDto>>;

async function invalidateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.unreadCount(),
    }),
    queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.all,
    }),
  ]);
}

const notificationListQueryFilter = {
  queryKey: [...notificationQueryKeys.all, "list"] as const,
};

function markNotificationReadInListCache(
  cache: NotificationListCache | undefined,
  id: number,
): NotificationListCache | undefined {
  if (!cache) {
    return cache;
  }

  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      data: page.data.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    })),
  };
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.all,
      });

      const previousUnread = queryClient.getQueryData<number>(
        notificationQueryKeys.unreadCount(),
      );
      const previousLists = queryClient.getQueriesData<NotificationListCache>(
        notificationListQueryFilter,
      );

      if (typeof previousUnread === "number" && previousUnread > 0) {
        queryClient.setQueryData(
          notificationQueryKeys.unreadCount(),
          previousUnread - 1,
        );
      }

      queryClient.setQueriesData<NotificationListCache>(
        notificationListQueryFilter,
        (cache) => markNotificationReadInListCache(cache, id),
      );

      return { previousUnread, previousLists };
    },
    onError: (_error, _id, context) => {
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(
          notificationQueryKeys.unreadCount(),
          context.previousUnread,
        );
      }

      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: async () => {
      await invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.all,
      });

      const previousUnread = queryClient.getQueryData<number>(
        notificationQueryKeys.unreadCount(),
      );
      const previousLists = queryClient.getQueriesData<NotificationListCache>(
        notificationListQueryFilter,
      );

      queryClient.setQueryData(notificationQueryKeys.unreadCount(), 0);

      queryClient.setQueriesData<NotificationListCache>(
        notificationListQueryFilter,
        (cache) => {
          if (!cache) {
            return cache;
          }

          return {
            ...cache,
            pages: cache.pages.map((page) => ({
              ...page,
              data: page.data.map((notification) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        },
      );

      return { previousUnread, previousLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(
          notificationQueryKeys.unreadCount(),
          context.previousUnread,
        );
      }

      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: async () => {
      await invalidateNotificationQueries(queryClient);
    },
  });
}
