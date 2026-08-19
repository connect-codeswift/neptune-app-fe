"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Icon } from "@iconify/react";
import Cropper, { type Area } from "react-easy-crop";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import { getCroppedAvatarFile } from "@/lib/crop-image";
import { isBlobUrl, isLegacyPublicUrl, isStoredFileId } from "@/lib/files";
import { uploadFile } from "@/lib/upload-file";
import {
  useProfileAvatarQuery,
  useRemoveProfileAvatarMutation,
  useUploadProfileAvatarMutation,
} from "@/hooks/use-profile-avatar";
import { toast } from "@/lib/toast";

const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg";

type ProfileAvatarUploadProps = Readonly<{
  userId: number;
  initials: string;
  /** When set, overrides the query result (e.g. session bootstrap). */
  profileUrl?: string | null;
}>;

function AvatarPreview(
  props: Readonly<{
    profileUrl: string | null;
    initials: string;
    sizeClassName?: string;
    isBusy?: boolean;
  }>,
) {
  const {
    profileUrl,
    initials,
    sizeClassName = "size-20",
    isBusy = false,
  } = props;

  const frameClass = [
    "relative shrink-0 overflow-hidden rounded-full ring-4 ring-ehs-light-bg shadow-sm transition-opacity",
    sizeClassName,
    isBusy ? "opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (profileUrl) {
    const useResolved =
      isStoredFileId(profileUrl) || isLegacyPublicUrl(profileUrl);
    return (
      <div className={frameClass}>
        {isBlobUrl(profileUrl) || !useResolved ? (
          <Image
            src={profileUrl}
            alt=""
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <ResolvedFileImage
            fileRef={profileUrl}
            alt=""
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        frameClass,
        "bg-ehs-normal-blue text1 text-ehs-on-accent flex items-center justify-center",
      ].join(" ")}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function AvatarCropModal(
  props: Readonly<{
    imageSrc: string;
    onClose: () => void;
    onConfirm: (file: File) => Promise<void>;
    isSaving: boolean;
  }>,
) {
  const { imageSrc, onClose, onConfirm, isSaving } = props;
  const titleId = useId();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSaving, onClose]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    try {
      const file = await getCroppedAvatarFile(imageSrc, croppedAreaPixels);
      await onConfirm(file);
    } catch {
      toast.error("Could not crop image. Please try again.");
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="bg-ehs-surface-inverse/45 backdrop-blur-0.75 fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={isSaving ? undefined : onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="bg-ehs-surface flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-xl"
      >
        <div className="border-ehs-border/60 border-b px-5 py-4">
          <Text as="h2" id={titleId} className="text3 text-ehs-darker">
            Crop profile photo
          </Text>
        </div>

        <div className="bg-ehs-canvas-dark relative h-72">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="border-ehs-border/60 flex flex-col gap-3 border-t px-5 py-4">
          <label className="text8 text-ehs-muted-text flex items-center gap-3">
            <span className="shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
              disabled={isSaving}
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text4 text-ehs-gray hover:text-ehs-darker rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || !croppedAreaPixels}
              className="bg-ehs-normal-blue text4 text-ehs-on-accent hover:bg-ehs-darker rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save photo"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProfileAvatarUpload(props: ProfileAvatarUploadProps) {
  const { userId, initials, profileUrl: profileUrlOverride } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [localProfileUrl, setLocalProfileUrl] = useState<string | null>(null);

  const avatarQuery = useProfileAvatarQuery(userId);
  const uploadMutation = useUploadProfileAvatarMutation();
  const removeMutation = useRemoveProfileAvatarMutation();

  const resolvedProfileUrl =
    localProfileUrl ?? profileUrlOverride ?? avatarQuery.data ?? null;

  /**
   * Only mutations disable the control. React Query's `isLoading` is idle on
   * the server and true on the first client paint, which mismatched hydration
   * (`disabled={null}` vs `disabled={true}` plus a loading overlay).
   */
  const isBusy = uploadMutation.isPending || removeMutation.isPending;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please choose a JPG or PNG image.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
  };

  const closeCropModal = () => {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc(null);
  };

  const handleCropConfirm = async (file: File) => {
    try {
      const uploaded = await uploadFile(file, { module: "Profile" });
      const response = await uploadMutation.mutateAsync(uploaded.fileId);
      const nextUrl =
        response.dataModel?.profileUrl ??
        (response as { DataModel?: { ProfileUrl?: string | null } }).DataModel
          ?.ProfileUrl ??
        uploaded.fileId;

      setLocalProfileUrl(nextUrl ?? uploaded.fileId);
      toast.success("Profile photo updated");
      closeCropModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload photo.";
      toast.error(message);
    }
  };

  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync();
      setLocalProfileUrl(null);
      toast.success("Profile photo removed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove photo.";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="mt-1 flex flex-col gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isBusy}
          className="group relative mx-auto shrink-0 sm:mx-0"
          aria-label="Change profile photo"
        >
          <AvatarPreview
            profileUrl={resolvedProfileUrl}
            initials={initials}
            sizeClassName="size-24"
            isBusy={isBusy}
          />
          <span className="bg-ehs-surface-inverse/55 text-ehs-light-text absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 disabled:opacity-0">
            <Icon icon="mdi:camera-outline" className="size-6" aria-hidden />
          </span>
          {isBusy ? (
            <span className="border-ehs-normal-blue bg-ehs-surface/70 absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed">
              <Icon
                icon="mdi:loading"
                className="text-ehs-normal-blue size-6 animate-spin"
                aria-hidden
              />
            </span>
          ) : null}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-3 text-center sm:text-left">
          <div>
            <Text as="p" className="text5 text-ehs-darker">
              {resolvedProfileUrl ? "Update your photo" : "Add a profile photo"}
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text mt-1">
              Shown on your profile, sidebar, and anywhere your name appears in
              Neptune.
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isBusy}
              className="bg-ehs-normal-blue text4 text-ehs-on-accent hover:bg-ehs-darker inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon="mdi:upload-outline" className="size-4" aria-hidden />
              {resolvedProfileUrl ? "Change photo" : "Upload photo"}
            </button>
            {resolvedProfileUrl ? (
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={isBusy}
                className="border-ehs-border/60 text4 text-ehs-gray hover:text-ehs-red hover:border-ehs-red/30 bg-ehs-surface inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon="mdi:trash-can-outline"
                  className="size-4"
                  aria-hidden
                />
                Remove
              </button>
            ) : null}
          </div>

          <div className="text8 text-ehs-muted-text flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:image-outline" className="size-3.5" aria-hidden />
              JPG or PNG
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:crop-square" className="size-3.5" aria-hidden />
              Square, min 200×200
            </span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        onChange={handleFileChange}
      />

      {cropImageSrc ? (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onClose={closeCropModal}
          onConfirm={handleCropConfirm}
          isSaving={uploadMutation.isPending}
        />
      ) : null}
    </>
  );
}

export { AvatarPreview };
