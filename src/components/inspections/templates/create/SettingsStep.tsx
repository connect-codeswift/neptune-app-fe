"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Switch } from "./Switch";
import {
  ACCESS_LEVELS,
  SITE_OPTIONS,
  type TemplateSettings,
} from "./template-builder-data";

export type SettingsStepProps = Readonly<{
  settings: TemplateSettings;
  onSettingsChange: (settings: TemplateSettings) => void;
}>;

function OptionRow(
  props: Readonly<{
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }>,
) {
  const { label, description, checked, onChange } = props;

  return (
    <div className="bg-ehs-surface flex items-center justify-between gap-3 rounded-lg px-3 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="text-ehs-dark-bg font-bold">{label}</span>
        <span className="text-ehs-muted-text text-sm">{description}</span>
      </span>
      <Switch checked={checked} label={label} onChange={onChange} />
    </div>
  );
}

export function SettingsStep(props: SettingsStepProps) {
  const { settings, onSettingsChange } = props;

  const patch = (change: Partial<TemplateSettings>) => {
    onSettingsChange({ ...settings, ...change });
  };

  const toggleSite = (site: string) => {
    patch({
      sites: settings.sites.includes(site)
        ? settings.sites.filter((entry) => entry !== site)
        : [...settings.sites, site],
    });
  };

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-2">
      {/* Access Level */}
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-5"
      >
        <h2 className="text-ehs-dark-bg text-lg font-bold">Access Level</h2>

        <div
          role="radiogroup"
          aria-label="Access level"
          className="flex flex-col gap-2.5"
        >
          {ACCESS_LEVELS.map((level) => {
            const isSelected = settings.accessLevel === level;

            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => patch({ accessLevel: level })}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  isSelected
                    ? "border-ehs-normal-blue bg-ehs-normal-blue/8"
                    : "border-ehs-border-ink/10 bg-ehs-surface hover:bg-ehs-surface-inverse/5",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-ehs-normal-blue bg-ehs-normal-blue"
                      : "border-ehs-border-ink/25",
                  ].join(" ")}
                >
                  {isSelected ? (
                    <span className="-mt-0.4 bg-ehs-surface flex size-2 flex-col items-center justify-center rounded-full" />
                  ) : null}
                </span>
                <span
                  className={[
                    "font-medium",
                    isSelected ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                  ].join(" ")}
                >
                  {level}
                </span>
              </button>
            );
          })}
        </div>
      </IncidentGlassCard>

      <div className="flex min-w-0 flex-col gap-3.5">
        {/* Site Assignment */}
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-5"
        >
          <h2 className="text-ehs-dark-bg text-lg font-bold">
            Site Assignment
          </h2>

          <div className="flex flex-wrap gap-2">
            {SITE_OPTIONS.map((site) => {
              const isSelected = settings.sites.includes(site);

              return (
                <button
                  key={site}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleSite(site)}
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-1.5 transition-colors",
                    isSelected
                      ? "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-dark-blue font-semibold"
                      : "text-ehs-gray border-ehs-border-ink/10 bg-ehs-surface hover:bg-ehs-surface-inverse/5",
                  ].join(" ")}
                >
                  {site}
                </button>
              );
            })}
          </div>
        </IncidentGlassCard>

        {/* Template Options */}
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-4"
        >
          <h2 className="text-ehs-dark-bg text-lg font-bold">
            Template Options
          </h2>

          <div className="flex flex-col gap-3">
            <OptionRow
              label="Allow Duplication"
              description="Users can create copies of this template"
              checked={settings.allowDuplication}
              onChange={() =>
                patch({ allowDuplication: !settings.allowDuplication })
              }
            />
            <OptionRow
              label="Allow Editing"
              description="Authorized users can modify this template"
              checked={settings.allowEditing}
              onChange={() => patch({ allowEditing: !settings.allowEditing })}
            />
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
