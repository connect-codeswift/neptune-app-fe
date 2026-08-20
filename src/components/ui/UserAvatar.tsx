"use client";

import Image from "next/image";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import { isBlobUrl, isLegacyPublicUrl, isStoredFileId } from "@/lib/files";

export type UserAvatarProps = Readonly<{
  /** Drives the initials fallback, and nothing else — the photo wins when present. */
  name: string;
  /** Stored file id, legacy public URL, blob URL, or plain remote URL. */
  profileUrl?: string | null;
  /** Tailwind size utility for the circle. */
  sizeClassName?: string;
  /** `sizes` hint passed to next/image; keep it near the rendered box. */
  sizes?: string;
  className?: string;
}>;

/**
 * First letter of the first and last word — "Mian Hamid Ur Rehman" → "MR".
 * A single word gives its first two characters, and a blank name gives "?".
 */
export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
}

/**
 * A person's photo, falling back to their initials when there isn't one.
 *
 * `profileUrl` arrives in three shapes depending on when the avatar was
 * uploaded, so the resolution matches `ProfileAvatarUpload`: stored file ids and
 * legacy public URLs go through `ResolvedFileImage` (which fetches the real URL
 * and prefers a thumbnail), everything else renders directly. Remote avatars are
 * `unoptimized` — they sit on hosts outside `next.config.ts` `remotePatterns`.
 */
export function UserAvatar(props: Readonly<UserAvatarProps>) {
  const {
    name,
    profileUrl = null,
    sizeClassName = "size-7",
    sizes = "28px",
    className = "",
  } = props;

  const frameClass = [
    "relative shrink-0 overflow-hidden rounded-full",
    sizeClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const photo = profileUrl?.trim() ?? "";

  if (photo) {
    const isResolvable = isStoredFileId(photo) || isLegacyPublicUrl(photo);
    const rendersDirectly = isBlobUrl(photo) || !isResolvable;

    return (
      <span className={`${frameClass} inline-block`}>
        {rendersDirectly ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes={sizes}
            unoptimized
            className="object-cover"
          />
        ) : (
          <ResolvedFileImage
            fileRef={photo}
            alt=""
            sizes={sizes}
            className="object-cover"
          />
        )}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${frameClass} bg-ehs-light-blue text-ehs-dark-blue text-2.75 inline-flex items-center justify-center font-bold`}
    >
      {userInitials(name)}
    </span>
  );
}
