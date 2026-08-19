"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useResolvedFileUrl } from "@/hooks/use-file-queries";

export type ResolvedFileImageProps = Readonly<{
  fileRef: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  unoptimized?: boolean;
}>;

/** Renders a stored fileId or a legacy public URL as a Next image. */
export function ResolvedFileImage(props: Readonly<ResolvedFileImageProps>) {
  const {
    fileRef,
    alt,
    fill = true,
    sizes,
    className,
    unoptimized = true,
  } = props;
  const { url, thumbnailUrl, isLoading } = useResolvedFileUrl(fileRef);
  const src = thumbnailUrl || url;

  if (isLoading || !src) {
    return (
      <span className="bg-ehs-light-bg/80 text-ehs-muted-text flex size-full items-center justify-center">
        <Icon
          icon={isLoading ? "mdi:loading" : "mdi:image-outline"}
          className={isLoading ? "size-5 animate-spin" : "size-5"}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      unoptimized={unoptimized}
      className={className}
    />
  );
}
