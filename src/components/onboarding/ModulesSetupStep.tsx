"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Text } from "@/components/Text";
import {
  countActiveModules,
  hasActiveModule,
  MODULES,
  type ModuleId,
  type ModuleState,
} from "@/components/onboarding/constants";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/Check";

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

  const activeModuleCount = countActiveModules(moduleState);

  const handleModuleToggle = (id: ModuleId, checked: boolean) => {
    if (!checked && activeModuleCount === 1 && moduleState[id]) {
      setError(MODULE_REQUIRED_MESSAGE);
      return;
    }

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
    <>
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

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4">
        {MODULES.map((module) => {
          const isActive = moduleState[module.id];

          return (
            <li key={module.id}>
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={`${isActive ? "Deselect" : "Select"} ${module.title}`}
                onClick={() => handleModuleToggle(module.id, !isActive)}
                className={[
                  "focus-visible:ring-ehs-normal-blue/20 cursor-pointer flex h-full w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "border-ehs-normal-blue/40 bg-ehs-light-blue"
                    : "border-ehs-border bg-white",
                ].join(" ")}
              >
                <span className="border-ehs-border flex size-13 shrink-0 items-center justify-center rounded-2xl border bg-white">
                  <Icon
                    icon={module.icon}
                    className="text-ehs-gray text-2xl"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <Text
                    as="span"
                    className="text-ehs-darker block text-sm leading-snug font-semibold lg:text-base"
                  >
                    {module.title}
                  </Text>
                  <Text
                    as="span"
                    className="text-ehs-muted-text block text-xs leading-snug lg:text-sm"
                  >
                    {module.description}
                  </Text>
                </div>
                <Check checked={isActive} />
              </button>
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
          <span className="text-ehs-muted-text flex items-center gap-2 text-sm">
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
    </>
  );
}
