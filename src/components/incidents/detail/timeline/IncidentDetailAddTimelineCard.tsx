"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_TEXTAREA_CLASS } from "@/components/ui/field-styles";
import { toast } from "@/lib/toast";

export type IncidentDetailAddTimelineCardProps = Readonly<{
  onAddPost?: (text: string) => void;
  className?: string;
}>;

export function IncidentDetailAddTimelineCard(
  props: Readonly<IncidentDetailAddTimelineCardProps>,
) {
  const { onAddPost, className = "" } = props;
  const [text, setText] = useState("");

  const handlePost = () => {
    if (!text.trim()) {
      toast.error("Empty note", "Please type a message before posting.");
      return;
    }
    if (onAddPost) {
      onAddPost(text);
    } else {
      toast.success(
        "Update Posted",
        "Your status update has been successfully added to the timeline.",
      );
    }
    setText("");
  };

  const handleAttachPhoto = () => {
    toast.info(
      "Photo attachment coming soon",
      "This feature is being developed.",
    );
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      incidentGlassCardClassName="gap-2.5"
      className={className}
    >
      <Text as="h3" className="text-ehs-dark-bg text3">
        Add to timeline
      </Text>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a note or status update…"
        className={FIELD_TEXTAREA_CLASS}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAttachPhoto}
          className="rounded-2.5 text5 text-ehs-dark-bg backdrop-blur-1.5 inline-flex min-w-0 flex-1 items-center justify-center gap-2 border border-white/90 bg-[rgba(255,255,255,0.62)] px-3.75 pt-2.5 pb-[11px] transition-colors hover:bg-white/80"
        >
          <Icon
            icon="mdi:camera-outline"
            className="size-3.25"
            aria-hidden="true"
          />
          Photo
        </button>

        <button
          type="button"
          onClick={handlePost}
          className="rounded-2.5 bg-ehs-normal-blue text5 text-ehs-light-text hover:bg-ehs-normal-blue-active relative inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-3.75 pt-2.5 pb-[11px] shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors"
        >
          <Icon icon="mdi:check" className="size-3.25" aria-hidden="true" />
          Post
        </button>
      </div>
    </IncidentGlassCard>
  );
}
