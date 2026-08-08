"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { useCreateWalkTalkMutation } from "@/hooks/use-walk-talk-mutations";
import { toAssigneeOptions, userNameFor } from "@/lib/map-user";
import { toCreateWalkTalkRequest } from "@/lib/map-walk-talk";
import { toast } from "@/lib/toast";
import { LogWalkTalkHeader } from "./LogWalkTalkHeader";
import {
  buildWalkTalkFollowUpSchema,
  createWalkTalkLogValues,
  walkTalkDetailsSchema,
  walkTalkNotesSchema,
  walkTalkParticipantsSchema,
  type FollowUpAction,
} from "./walk-talk-form-schema";

const WALK_TALK_ROUTE = "/dashboard/walk-talk";
const DETAILS_FORM_ID = "walk-talk-details-form";
const PARTICIPANTS_FORM_ID = "walk-talk-participants-form";
const NOTES_FORM_ID = "walk-talk-notes-form";
const FOLLOW_UP_FORM_ID = "walk-talk-follow-up-form";
const FORMS_TO_VALIDATE = 4;

const fieldLabelClass = [
  "[&_label]:text-sm",
  "[&_label]:font-semibold",
  "[&_label]:tracking-[0.24px]",
  "[&_label]:text-[#566072]",
  "[&_label]:uppercase",
].join(" ");

function SectionTitle(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <h2 className="text-ehs-dark-bg text-[13px] font-bold md:text-lg">
      {children}
    </h2>
  );
}

function followUpFromValues(values: FormValues): FollowUpAction {
  return {
    assignedTo: String(values.assignedTo ?? ""),
    dueDate: String(values.dueDate ?? ""),
    action: String(values.action ?? ""),
  };
}

function isFollowUpEmpty(action: FollowUpAction): boolean {
  return (
    action.assignedTo.trim() === "" &&
    action.dueDate.trim() === "" &&
    action.action.trim() === ""
  );
}

function asStringList(value: FormValues[string] | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string")
    : [];
}

export function LogWalkTalkContent() {
  const router = useRouter();
  const createWalkTalk = useCreateWalkTalkMutation();
  const usersQuery = useUserDropdownQuery();

  const assigneeOptions = useMemo(
    () => toAssigneeOptions(usersQuery.data?.dataModel ?? []),
    [usersQuery.data?.dataModel],
  );
  const followUpSchema = useMemo(
    () => buildWalkTalkFollowUpSchema(assigneeOptions),
    [assigneeOptions],
  );
  const assigneeLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of assigneeOptions) {
      map.set(option.value, option.label);
    }
    return map;
  }, [assigneeOptions]);

  const valuesRef = useRef<FormValues | null>(null);
  if (valuesRef.current === null) {
    valuesRef.current = createWalkTalkLogValues();
  }
  const [values, setValues] = useState<FormValues>(createWalkTalkLogValues);
  const [savedActions, setSavedActions] = useState<FollowUpAction[]>([]);

  const updateValues = (partial: FormValues) => {
    // Each FormBuilder only owns its fields; merge into the shared map
    // (participants stays a string[] as names are added via chips).
    const merged = { ...(valuesRef.current ?? values), ...partial };
    valuesRef.current = merged;
    setValues(merged);
  };

  const validatedCountRef = useRef(0);

  const persistWalkTalk = () => {
    const currentValues = valuesRef.current ?? values;

    const payload = toCreateWalkTalkRequest(currentValues, savedActions);
    if (!payload) {
      toast.error("Fill in all required fields before submitting.");
      return;
    }

    createWalkTalk.mutate(payload, {
      onSuccess: () => {
        toast.success("Walk-and-Talk submitted");
        router.push(WALK_TALK_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the Walk-and-Talk. Please try again.",
          ),
        );
      },
    });
  };

  const handleFormValid = () => {
    validatedCountRef.current += 1;
    if (validatedCountRef.current >= FORMS_TO_VALIDATE) {
      validatedCountRef.current = 0;
      persistWalkTalk();
    }
  };

  const saveAll = () => {
    if (createWalkTalk.isPending) return;

    validatedCountRef.current = 0;
    for (const id of [
      DETAILS_FORM_ID,
      PARTICIPANTS_FORM_ID,
      NOTES_FORM_ID,
      FOLLOW_UP_FORM_ID,
    ]) {
      const form = document.getElementById(id);
      if (form instanceof HTMLFormElement) form.requestSubmit();
    }
  };

  const addFollowUpAction = () => {
    const draft = followUpFromValues(valuesRef.current ?? values);
    if (isFollowUpEmpty(draft)) {
      toast.info("Fill in a follow-up action before adding another");
      return;
    }

    const cleared: FormValues = {
      ...(valuesRef.current ?? values),
      assignedTo: "",
      dueDate: "",
      action: "",
    };
    valuesRef.current = cleared;
    setValues(cleared);
    setSavedActions((prev) => [...prev, draft]);
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LogWalkTalkHeader />

      <div className="mx-auto flex w-full max-w-183 flex-col gap-3.5">
        {/* Walk-and-Talk Details */}
        <IncidentGlassCard
          paddingClassName="p-4 md:p-[22px]"
          className="relative z-10 min-w-0"
          incidentGlassCardClassName="gap-4 md:gap-[18px]"
        >
          <SectionTitle>Walk-and-Talk Details</SectionTitle>
          <FormBuilder
            schema={walkTalkDetailsSchema}
            initialValues={{
              observer: values.observer,
              date: values.date,
              location: values.location,
              topic: values.topic,
            }}
            formId={DETAILS_FORM_ID}
            hideActions
            onChange={updateValues}
            onSubmit={handleFormValid}
            className={["gap-4", "[&>div]:gap-x-3.5", fieldLabelClass].join(
              " ",
            )}
          />
        </IncidentGlassCard>

        {/* Participants */}
        <IncidentGlassCard
          paddingClassName="p-4 md:p-[22px]"
          className="min-w-0"
          incidentGlassCardClassName="gap-3"
        >
          <SectionTitle>Participants</SectionTitle>
          <FormBuilder
            schema={walkTalkParticipantsSchema}
            initialValues={{ participants: values.participants }}
            formId={PARTICIPANTS_FORM_ID}
            hideActions
            onChange={updateValues}
            onSubmit={handleFormValid}
            className={[
              "gap-4",
              "[&_label]:hidden",
              // Match Figma's solid teal Participants "Add" button.
              "[&_.flex.items-center.gap-2>button]:bg-ehs-normal-blue",
              "[&_.flex.items-center.gap-2>button]:text-white",
              "[&_.flex.items-center.gap-2>button]:hover:bg-ehs-normal-blue-hover",
              "[&_.flex.items-center.gap-2>button]:rounded-xl",
            ].join(" ")}
          />
        </IncidentGlassCard>

        {/* Discussion Notes */}
        <IncidentGlassCard
          paddingClassName="p-4 md:p-[22px]"
          className="min-w-0"
          incidentGlassCardClassName="gap-3"
        >
          <SectionTitle>Discussion Notes</SectionTitle>
          <FormBuilder
            schema={walkTalkNotesSchema}
            initialValues={{ notes: values.notes }}
            formId={NOTES_FORM_ID}
            hideActions
            onChange={updateValues}
            onSubmit={handleFormValid}
            className={[
              "gap-4",
              "[&_label]:hidden",
              "[&_textarea]:min-h-32",
              "[&_textarea]:bg-white/62",
              "[&_textarea]:text-base",
            ].join(" ")}
          />
        </IncidentGlassCard>

        {/* Follow-Up Actions */}
        <IncidentGlassCard
          paddingClassName="p-4 md:p-[22px]"
          className="min-w-0"
          incidentGlassCardClassName="gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Follow-Up Actions</SectionTitle>
            <button
              type="button"
              onClick={addFollowUpAction}
              className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover shrink-0 cursor-pointer text-[13px] font-bold transition-colors md:rounded-lg md:bg-ehs-normal-blue/14 md:px-3 md:py-1.5 md:text-sm md:font-semibold md:hover:bg-ehs-normal-blue/20"
            >
              + Add Action
            </button>
          </div>

          {savedActions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {savedActions.map((entry, index) => (
                <li
                  key={`${entry.action}-${String(index)}`}
                  className="border-ehs-border flex items-start justify-between gap-3 rounded-[10px] border bg-white/62 px-3.5 py-2.5"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-ehs-dark-bg text-sm font-medium">
                      {entry.action || `Action ${String(index + 1)}`}
                    </span>
                    <span className="text-ehs-muted-text text-xs">
                      {[
                        entry.assignedTo
                          ? userNameFor(assigneeLookup, entry.assignedTo)
                          : "Unassigned",
                        entry.dueDate || "No due date",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove action ${String(index + 1)}`}
                    onClick={() => {
                      setSavedActions((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    className="text-ehs-muted-text hover:text-ehs-red shrink-0 cursor-pointer rounded-md p-1 transition-colors"
                  >
                    <Icon
                      icon="mdi:close"
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <FormBuilder
            key={`follow-up-${String(savedActions.length)}-${String(assigneeOptions.length)}`}
            schema={followUpSchema}
            initialValues={{
              assignedTo: values.assignedTo,
              dueDate: values.dueDate,
              action: values.action,
            }}
            formId={FOLLOW_UP_FORM_ID}
            hideActions
            onChange={updateValues}
            onSubmit={handleFormValid}
            className={[
              "gap-3.5",
              "[&>div]:gap-x-3.5",
              "[&_label]:hidden",
            ].join(" ")}
          />
        </IncidentGlassCard>

        {/* Footer — full-width Cancel + Submit on mobile (Figma 6415:35020) */}
        <div className="flex items-center gap-3 md:justify-end md:gap-2.5">
          <Button
            type="button"
            variant="tertiary"
            onClick={() => router.push(WALK_TALK_ROUTE)}
            className="h-11 flex-1 rounded-xl border-0 bg-transparent px-4 py-2.5 text-sm font-bold text-[#566072] md:h-auto md:flex-none md:rounded-[10px] md:border md:border-slate-900/14 md:bg-white/62 md:text-base md:font-medium md:text-[#2a3446]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            isLoading={createWalkTalk.isPending}
            onClick={saveAll}
            className="h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-bold shadow-[0px_4px_6px_rgba(8,145,166,0.15)] md:h-auto md:flex-none md:rounded-[10px] md:px-5 md:text-base md:font-semibold md:shadow-[0px_6px_18px_-6px_#0891a6]"
          >
            {createWalkTalk.isPending
              ? "Submitting..."
              : "Submit Walk-and-Talk"}
          </Button>
        </div>
      </div>
    </div>
  );
}
