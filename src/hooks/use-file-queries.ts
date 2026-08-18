"use client";

import { useQuery } from "@tanstack/react-query";
import {
  isBlobUrl,
  isLegacyPublicUrl,
  isStoredFileId,
} from "@/lib/files";
import { getStoredFile } from "@/services/files.service";

export const fileQueryKeys = {
  all: ["files"] as const,
  detail: (fileId: string) => [...fileQueryKeys.all, fileId] as const,
};

/**
 * Signed download URLs last 15 minutes. Keep them in the query cache for 8
 * so a tab left open over a meeting still refreshes before they die.
 */
const FILE_URL_STALE_MS = 8 * 60 * 1000;

export function useStoredFileQuery(fileId: string | null | undefined) {
  const enabled = Boolean(fileId && isStoredFileId(fileId));
  return useQuery({
    queryKey: fileQueryKeys.detail(fileId ?? ""),
    queryFn: () => getStoredFile(fileId!),
    enabled,
    staleTime: FILE_URL_STALE_MS,
    refetchOnWindowFocus: true,
  });
}

/**
 * Resolve a stored attachment: legacy public URL, blob preview, or files-API id.
 * Never persist the returned `url` — signed ones expire.
 */
export function useResolvedFileUrl(ref: string | null | undefined) {
  const trimmed = ref?.trim() || "";
  const storedId = isStoredFileId(trimmed) ? trimmed : null;
  const query = useStoredFileQuery(storedId);

  if (!trimmed) {
    return { url: undefined, thumbnailUrl: undefined, isLoading: false };
  }

  if (isBlobUrl(trimmed) || isLegacyPublicUrl(trimmed)) {
    return { url: trimmed, thumbnailUrl: undefined, isLoading: false };
  }

  if (storedId) {
    return {
      url: query.data?.downloadUrl,
      thumbnailUrl: query.data?.thumbnailUrl ?? undefined,
      isLoading: query.isLoading,
    };
  }

  return { url: trimmed, thumbnailUrl: undefined, isLoading: false };
}
