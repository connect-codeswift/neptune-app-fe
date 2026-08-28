"use client";

import { Icon } from "@iconify/react";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import {
  canPreviewResolvedFile,
  useResolvedFileUrl,
} from "@/hooks/use-file-queries";

/**
 * One attachment. Its own component because the resolve hook cannot run inside the list `map`,
 * and each file resolves independently — a stored ref is a bare uuid, so the thumbnail, the
 * name and both urls all come from `GET /files/{fileId}`.
 *
 * Same split as the CAPA attachment rows: the tile opens `previewUrl` (served inline) and the
 * button beside it saves via `url` (served as an attachment). Two urls because the disposition
 * is signed into each — the bucket is a different origin, so a `download` attribute is ignored.
 */
function AttachmentTile(props: Readonly<{ fileRef: string; index: number }>) {
  const { fileRef, index } = props;
  const { previewUrl, url, thumbnailUrl, mimeType, fileName } =
    useResolvedFileUrl(fileRef);
  const label = fileName?.trim() || `Attachment ${String(index + 1)}`;
  const isVideo = mimeType?.startsWith("video/") === true;

  // A video has no thumbnail, so it gets the play glyph rather than a broken frame.
  const face = canPreviewResolvedFile(mimeType, thumbnailUrl) ? (
    <ResolvedFileImage
      fileRef={fileRef}
      alt={label}
      sizes="112px"
      className="object-cover"
    />
  ) : (
    <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue flex size-full items-center justify-center">
      <Icon
        icon={isVideo ? "mdi:play-circle-outline" : "lucide:image"}
        className="size-7"
        aria-hidden
      />
    </span>
  );

  return (
    <div className="flex w-28 shrink-0 flex-col gap-1">
      {previewUrl ? (
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label}`}
          className="border-ehs-border hover:border-ehs-normal-blue relative size-28 overflow-hidden rounded-xl border transition-colors"
        >
          {face}
        </a>
      ) : (
        <span className="border-ehs-border relative size-28 overflow-hidden rounded-xl border">
          {face}
        </span>
      )}

      {url ? (
        <a
          href={url}
          aria-label={`Download ${label}`}
          className="text-ehs-muted-text hover:text-ehs-normal-blue inline-flex items-center gap-1 self-start transition-colors"
        >
          <Icon icon="mdi:tray-arrow-down" className="size-3.5" aria-hidden />
          <span className="text8">Download</span>
        </a>
      ) : null}
    </div>
  );
}

/**
 * Attachments on a hazard or near miss. Both store a list of file references; a record from
 * before that held a single one, which the API already widens into a one-item list, so this
 * renders either without knowing the difference.
 */
export function PhotoEvidence(props: Readonly<{ refs: readonly string[] }>) {
  const { refs } = props;

  if (refs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {refs.map((fileRef, index) => (
        <AttachmentTile key={fileRef} fileRef={fileRef} index={index} />
      ))}
    </div>
  );
}
