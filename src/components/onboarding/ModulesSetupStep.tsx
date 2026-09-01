"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Text } from "@/components/Text";
import {
  hasActiveModule,
  MODULES,
  type ModuleId,
  type ModuleState,
} from "@/components/onboarding/constants";
import { Button } from "@/components/ui/Button";
import { CheckboxInput } from "@/components/inputs/CheckboxInput";

const MODULE_REQUIRED_MESSAGE = "Select at least one module to continue.";

export type ModulesSetupStepProps = Readonly<{
  moduleState: ModuleState;
  onModuleToggle: (id: ModuleId, checked: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}>;

export function ModulesSetupStep(props: Readonly<ModulesSetupStepProps>) {
  const { moduleState, onModuleToggle, onBack, onContinue } = props;
  const [error, setError] = useState("");

  const handleModuleToggle = (id: ModuleId, checked: boolean) => {
    setError("");
    onModuleToggle(id, checked);
  };

  const handleContinue = () => {
    if (!hasActiveModule(moduleState)) {
      setError(MODULE_REQUIRED_MESSAGE);
      return;
    }

    onContinue();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Which modules do you need?
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text max-w-xl text-sm leading-snug"
        >
          Pick the areas to switch on for your team. You can add or remove
          modules anytime in settings.
        </Text>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-0 md:grid-cols-2 md:gap-y-4">
        {MODULES.map((module) => {
          const isActive = moduleState[module.id];

          return (
            <li key={module.id}>
              <CheckboxInput
                variant="tile"
                boxPosition="end"
                size="lg"
                icon={module.icon}
                label={module.title}
                description={
                  "description" in module ? module.description : undefined
                }
                checked={isActive}
                onChange={(next) => handleModuleToggle(module.id, next)}
                // The framing is responsive here — a divider list on mobile,
                // cards from md up — so it replaces the default tile chrome.
                tileClassName={[
                  "border-ehs-border flex w-full items-center justify-between gap-3 py-4 text-left",
                  "max-md:border-b max-md:last:border-b-0",
                  "md:rounded-xl md:border md:px-4",
                  isActive
                    ? "md:border-ehs-normal-blue/40 md:bg-ehs-light-blue"
                    : "md:border-ehs-border md:bg-ehs-surface",
                ].join(" ")}
              />
            </li>
          );
        })}
      </ul>

      {error ? (
        <Text as="p" className="text-ehs-red mt-2 text-sm" role="alert">
          {error}
        </Text>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <Button type="button" variant="tertiary" onClick={onBack}>
          <Icon
            icon="mdi:chevron-left"
            className="text-lg"
            aria-hidden="true"
          />
          Back
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-ehs-muted-text hidden items-center gap-2 text-sm lg:flex">
            <span
              aria-hidden="true"
              className="bg-ehs-green size-2 rounded-full"
            />
            <span>Progress saved automatically</span>
          </span>
          <Button type="submit" variant="primary" onClick={handleContinue}>
            Continue
            <Icon
              icon="mdi:chevron-right"
              className="text-lg"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
