"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
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
      toast.success("Update Posted", "Your status update has been successfully added to the timeline.");
    }
    setText("");
  };

  const handleAttachPhoto = () => {
    toast.info("Photo attachment coming soon", "This feature is being developed.");
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg pb-2.5 text-[15px] font-bold"
      >
        Add to timeline
      </Text>

      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note or status update..."
          className="w-full min-h-[68px] border border-[rgba(15,23,42,0.08)] focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 rounded-[10px] p-2.5 text-[12px] bg-white/70 outline-none transition-all placeholder:text-ehs-muted-text focus:ring-2 resize-none"
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAttachPhoto}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold border border-[rgba(15,23,42,0.08)] bg-white/70 hover:bg-white rounded-[6px] px-3 py-1.5 transition-colors text-ehs-gray"
          >
            <Icon icon="mdi:camera-outline" className="size-3.5" />
            <span>Photo</span>
          </button>

          <Button
            type="button"
            variant="primary"
            onClick={handlePost}
            className="rounded-[6px] px-4 py-1.5 text-[12px] font-bold shadow-[0px_4px_12px_-4px_#0891a6]"
          >
            <Icon icon="mdi:check" className="size-3.5" />
            <span>Post</span>
          </Button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
