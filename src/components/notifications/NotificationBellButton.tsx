"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/hooks/use-notification-mutations";
import {
  useNotificationListQuery,
  useUnreadNotificationCountQuery,
} from "@/hooks/use-notification-queries";
import {
  formatNotificationTimestamp,
  mapNotificationDtoToView,
} from "@/services/mappers/notification.mapper";

export type NotificationBellButtonProps = Readonly<{
  buttonClassName?: string;
  iconClassName?: string;
}>;

export function NotificationBellButton(
  props: Readonly<NotificationBellButtonProps>,
) {
  const {
    buttonClassName = "border-ehs-border relative inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm transition-colors hover:bg-ehs-light-bg",
    iconClassName = "text-ehs-darker text-lg",
  } = props;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const unreadCountQuery = useUnreadNotificationCountQuery();
  const listQuery = useNotificationListQuery(open);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadCountQuery.data ?? 0;
  const { refetch: refetchUnreadCount } = unreadCountQuery;
  const notifications = (listQuery.data?.pages ?? [])
    .flatMap((page) => page.data)
    .map(mapNotificationDtoToView);
  const totalRecords = listQuery.data?.pages.at(-1)?.totalRecords ?? 0;
  const hasMore = notifications.length < totalRecords;

  useEffect(() => {
    if (!open) {
      return;
    }

    void refetchUnreadCount();
  }, [open, refetchUnreadCount]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleOpen = () => {
    setOpen((current) => !current);
  };

  const handleMarkRead = (id: number, isRead: boolean) => {
    if (isRead || markReadMutation.isPending) {
      return;
    }
    void markReadMutation.mutateAsync(id);
  };

  const handleMarkAllRead = () => {
    if (unreadCount <= 0 || markAllReadMutation.isPending) {
      return;
    }
    void markAllReadMutation.mutateAsync();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={handleOpen}
        className={buttonClassName}
      >
        <Icon icon="mdi:bell-outline" className={iconClassName} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            className="bg-ehs-red border-ehs-light-text absolute top-2 right-2 h-1.5 w-1.5 rounded-lg border"
            aria-hidden="true"
          />
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-[min(100vw-24px,360px)] overflow-hidden rounded-xl border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_16px_40px_-12px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.08)] px-4 py-3">
            <Text as="h2" className="text-ehs-dark-bg text-sm font-semibold">
              Notifications
            </Text>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount <= 0 || markAllReadMutation.isPending}
              className="text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer text-xs font-semibold disabled:cursor-not-allowed"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                {[0, 1, 2].map((row) => (
                  <span
                    key={row}
                    className="h-14 animate-pulse rounded-lg bg-[rgba(15,23,42,0.06)]"
                  />
                ))}
              </div>
            ) : listQuery.isError ? (
              <div className="text-ehs-muted-text px-4 py-6 text-center text-sm">
                Could not load notifications. Try again in a moment.
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-ehs-muted-text px-4 py-8 text-center text-sm">
                You&apos;re all caught up.
              </div>
            ) : (
              <ul className="divide-y divide-[rgba(15,23,42,0.06)]">
                {notifications.map((notification) => {
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <Text
                          as="p"
                          className={[
                            "text-sm leading-5",
                            notification.isRead
                              ? "text-ehs-gray font-medium"
                              : "text-ehs-dark-bg font-semibold",
                          ].join(" ")}
                        >
                          {notification.title}
                        </Text>
                        <span className="text-ehs-muted-text shrink-0 text-[11px]">
                          {formatNotificationTimestamp(notification.createdAt)}
                        </span>
                      </div>
                      <Text
                        as="p"
                        className="text-ehs-muted-text mt-1 text-xs leading-[18px]"
                      >
                        {notification.message}
                      </Text>
                    </>
                  );

                  return (
                    <li key={notification.id}>
                      {notification.href ? (
                        <Link
                          href={notification.href}
                          onClick={() => {
                            handleMarkRead(notification.id, notification.isRead);
                            setOpen(false);
                          }}
                          className={[
                            "block px-4 py-3 transition-colors hover:bg-[rgba(15,23,42,0.03)]",
                            notification.isRead ? "" : "bg-[rgba(8,145,166,0.04)]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkRead(notification.id, notification.isRead)
                          }
                          className={[
                            "block w-full px-4 py-3 text-left transition-colors hover:bg-[rgba(15,23,42,0.03)]",
                            notification.isRead ? "" : "bg-[rgba(8,145,166,0.04)]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasMore && !listQuery.isLoading && !listQuery.isError ? (
            <div className="border-t border-[rgba(15,23,42,0.08)] px-4 py-3">
              <Button
                type="button"
                variant="tertiary"
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold"
              >
                {listQuery.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}

          {listQuery.isError ? (
            <div className="border-t border-[rgba(15,23,42,0.08)] px-4 py-3">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => void listQuery.refetch()}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold"
              >
                Retry
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
