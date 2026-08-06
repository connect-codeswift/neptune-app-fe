"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";
import { getCroppedAvatarFile } from "@/lib/crop-image";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
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
  }>,
) {
  const { profileUrl, initials, sizeClassName = "size-20" } = props;

  if (profileUrl) {
    return (
      <div
        className={[
          "relative shrink-0 overflow-hidden rounded-full",
          sizeClassName,
        ].join(" ")}
      >
        <Image
          src={profileUrl}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "bg-ehs-normal-blue text-ehs-light-text flex shrink-0 items-center justify-center rounded-full text-2xl font-semibold",
        sizeClassName,
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ehs-dark-bg/45 p-4 backdrop-blur-[3px]"
      onClick={isSaving ? undefined : onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="border-ehs-border/60 border-b px-5 py-4">
          <Text
            as="h2"
            id={titleId}
            className="text-ehs-darker text-base font-bold tracking-tight"
          >
            Crop profile photo
          </Text>
        </div>

        <div className="relative h-72 bg-ehs-dark-bg">
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
          <label className="text-ehs-muted-text flex items-center gap-3 text-xs">
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
              className="text-ehs-gray hover:text-ehs-darker rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || !croppedAreaPixels}
              className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-darker rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
    localProfileUrl ??
    profileUrlOverride ??
    avatarQuery.data ??
    null;

  const isBusy =
    uploadMutation.isPending ||
    removeMutation.isPending ||
    avatarQuery.isLoading;

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
      const uploaded = await uploadFileToCloudinary(file);
      const response = await uploadMutation.mutateAsync(uploaded.secureUrl);
      const nextUrl =
        response.dataModel?.profileUrl ??
        (response as { DataModel?: { ProfileUrl?: string | null } }).DataModel
          ?.ProfileUrl ??
        uploaded.secureUrl;

      setLocalProfileUrl(nextUrl ?? uploaded.secureUrl);
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
      <div className="flex items-start gap-5 px-5 py-5">
        <AvatarPreview profileUrl={resolvedProfileUrl} initials={initials} />

        <div className="flex min-w-0 flex-col gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isBusy}
              className="border-ehs-normal-blue text-ehs-normal-blue hover:bg-ehs-light-blue rounded-lg border bg-white px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload Photo
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={isBusy || !resolvedProfileUrl}
              className="text-ehs-gray hover:text-ehs-darker text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
          <Text as="p" className="text-ehs-muted-text text-xs">
            Recommended: 200x200px, JPG or PNG
          </Text>
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
