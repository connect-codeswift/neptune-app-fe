"use client";

import { useQuery } from "@tanstack/react-query";
import { isBlobUrl, isLegacyPublicUrl, isStoredFileId } from "@/lib/files";
import { getStoredFile } from "@/services/files.service";

/** Last path segment of a public url, so a legacy row still reads like a file listing. */
function fileNameFromUrl(url: string): string {
  const withoutQuery = url.split("?")[0] ?? url;
  return withoutQuery.split("/").pop() || "file";
}

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
    return {
      url: undefined,
      previewUrl: undefined,
      thumbnailUrl: undefined,
      fileName: undefined,
      mimeType: undefined,
      isLoading: false,
    };
  }

  if (isBlobUrl(trimmed) || isLegacyPublicUrl(trimmed)) {
    // A public url is already viewable, so it serves as its own preview.
    return {
      url: trimmed,
      previewUrl: trimmed,
      thumbnailUrl: undefined,
      fileName: fileNameFromUrl(trimmed),
      mimeType: undefined,
      isLoading: false,
    };
  }

  if (storedId) {
    return {
      url: query.data?.downloadUrl,
      previewUrl: query.data?.previewUrl ?? undefined,
      thumbnailUrl: query.data?.thumbnailUrl ?? undefined,
      // The stored name is the only place a files-API ref carries one — the ref itself
      // is a bare uuid, which is what review screens were showing as the filename.
      fileName: query.data?.fileName,
      mimeType: query.data?.mimeType,
      isLoading: query.isLoading,
    };
  }

  return {
    url: trimmed,
    previewUrl: trimmed,
    thumbnailUrl: undefined,
    fileName: undefined,
    mimeType: undefined,
    isLoading: false,
  };
}

/** True when the resolved file can be shown as an image: a picture, or a PDF's thumbnail. */
export function canPreviewResolvedFile(
  mimeType: string | undefined,
  thumbnailUrl: string | undefined,
): boolean {
  return Boolean(thumbnailUrl) || Boolean(mimeType?.startsWith("image/"));
}
