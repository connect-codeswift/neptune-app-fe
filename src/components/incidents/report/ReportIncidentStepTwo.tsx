"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  INITIAL_TREATMENT_OPTIONS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
  YES_NO_OPTIONS,
  type ReportIncidentFormState,
  type ReportPhotoFile,
} from "@/components/incidents/report/report-incident-data";
import {
  ReportSelectField,
  ReportTextareaField,
  ReportTextField,
} from "@/components/incidents/report/ReportFormField";
import { ReportPhotosField } from "@/components/incidents/report/ReportPhotosField";

export type ReportIncidentStepTwoProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepTwo(
  props: Readonly<ReportIncidentStepTwoProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;
  const photos = form.photos ?? [];

  const removePhoto = (id: string) => {
    onChange({
      photos: photos.filter((photo) => photo.id !== id),
    });
  };

  const addPhoto = () => {
    if (photos.length >= 10) {
      return;
    }
    const nextIndex = photos.length + 1;
    const photo: ReportPhotoFile = {
      id: `img-new-${String(Date.now())}`,
      name: `IMG_${String(2210 + nextIndex)}`,
      sizeLabel: "1 MB",
    };
    onChange({ photos: [...photos, photo] });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
            >
              Step 2
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[22px] font-bold tracking-[-0.44px]"
            >
              Incident details
            </Text>
            <Text as="p" className="text-ehs-gray text-[12px]">
              Describe what happened and capture treatment, mechanism, and
              nature of injury.
            </Text>
          </div>

          <ReportTextareaField
            className="pt-[22px]"
            label="Describe incident in detail"
            required
            trailingHint="Events before, during & after."
            value={form.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Describe what happened…"
          />

          <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-[18px] sm:grid-cols-2">
            <div className="pb-[18px]">
              <ReportSelectField
                label="Initial Treatment"
                required
                value={form.initialTreatment}
                onChange={(event) =>
                  onChange({ initialTreatment: event.target.value })
                }
                options={[...INITIAL_TREATMENT_OPTIONS]}
              />
            </div>
            <div className="pb-[18px]">
              <ReportSelectField
                label="Was Secondary Treatment Sought"
                required
                value={form.secondaryTreatment}
                onChange={(event) =>
                  onChange({
                    secondaryTreatment: event.target.value as "Yes" | "No",
                  })
                }
                options={[...YES_NO_OPTIONS]}
              />
            </div>
            <div className="pb-[18px]">
              <ReportSelectField
                label="Mechanism of Injury"
                required
                value={form.mechanismOfInjury}
                onChange={(event) =>
                  onChange({ mechanismOfInjury: event.target.value })
                }
                options={[...MECHANISM_OPTIONS]}
              />
            </div>
            <div className="pb-[18px]">
              <ReportSelectField
                label="Nature of Injury"
                required
                value={form.natureOfInjury}
                onChange={(event) =>
                  onChange({ natureOfInjury: event.target.value })
                }
                options={[...NATURE_OF_INJURY_OPTIONS]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 py-[18px] sm:grid-cols-2">
            <ReportTextField
              label="Object Involved"
              required
              trailingHint="ⓘ What caused the injury"
              value={form.objectInvolved}
              onChange={(event) =>
                onChange({ objectInvolved: event.target.value })
              }
              placeholder="Object or equipment involved"
            />
            <ReportSelectField
              label="OSHA Notification Required?"
              value={form.oshaNotificationRequired}
              onChange={(event) =>
                onChange({
                  oshaNotificationRequired: event.target.value as "Yes" | "No",
                })
              }
              options={[...YES_NO_OPTIONS]}
            />
          </div>

          <ReportPhotosField
            photos={photos}
            onRemove={removePhoto}
            onAdd={addPhoto}
          />

          <ReportTextField
            className="pt-[18px]"
            label="Witnesses"
            trailingHint="Names or employee IDs, comma-separated."
            value={form.witnesses}
            onChange={(event) => onChange({ witnesses: event.target.value })}
            placeholder="Name or employee ID"
          />
        </div>

        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-[10px] border-[rgba(15,23,42,0.14)] px-[15px] py-2.5 text-[13px] font-bold text-[#2a3446]"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-[10.8px]">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={onContinue}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
            >
              Continue
              <Icon
                icon="mdi:chevron-right"
                className="size-[13px]"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
