"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
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
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-[10px]"
      className={className}
    >
      <Text
        as="h3"
        className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
      >
        Add to timeline
      </Text>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a note or status update…"
        className="min-h-[72px] w-full resize-none rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-[13px] py-4 text-[13px] leading-normal text-[#0b1320] outline-none backdrop-blur-[5px] transition placeholder:text-[#8892a3] focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAttachPhoto}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] border border-white/90 bg-[rgba(255,255,255,0.62)] px-[15px] pt-[10px] pb-[10.5px] text-[13px] font-bold text-[#0b1320] backdrop-blur-[6px] transition-colors hover:bg-white/80"
        >
          <Icon icon="mdi:camera-outline" className="size-[13px]" aria-hidden="true" />
          Photo
        </button>

        <button
          type="button"
          onClick={handlePost}
          className="relative inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#0891a6] px-[15px] pt-[10px] pb-[10.5px] text-[13px] font-bold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition-colors hover:bg-[#067485]"
        >
          <Icon icon="mdi:check" className="size-[13px]" aria-hidden="true" />
          Post
        </button>
      </div>
    </IncidentGlassCard>
  );
}
