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
} from "@/components/organization-setup/constants";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";

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
      <div className="space-y-2">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Activate your modules.
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm leading-relaxed">
          Toggle the EHSS modules your organisation needs. You can activate or
          deactivate modules at any time.
        </Text>
      </div>

      <ul className="mt-8 space-y-3">
        {MODULES.map((module) => {
          const isActive = moduleState[module.id];

          return (
            <li
              key={module.id}
              className={[
                "flex items-center justify-between gap-4 rounded-xl border px-4 py-4 transition-colors",
                isActive
                  ? "border-ehs-light-blue-active/60 bg-ehs-light-blue/40"
                  : "border-ehs-border bg-white",
              ].join(" ")}
            >
              <div className="min-w-0 space-y-1">
                <Text as="h2" className="text-ehs-darker text-sm font-semibold">
                  {module.title}
                </Text>
                <Text as="p" className="text-ehs-muted-text text-sm">
                  {module.description}
                </Text>
              </div>
              <Toggle
                id={module.id}
                checked={moduleState[module.id]}
                onChange={(checked) => handleModuleToggle(module.id, checked)}
                aria-label={`Toggle ${module.title}`}
              />
            </li>
          );
        })}
      </ul>

      {error ? (
        <Text as="p" className="text-ehs-red mt-4 text-sm" role="alert">
          {error}
        </Text>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-ehs-gray border-ehs-border hover:text-ehs-darker cursor-pointer border px-4 py-2 text-sm font-medium transition-colors"
        >
          Back
        </button>
        <Button
          type="button"
          variant="primary"
          className="shadow-ehs-normal-blue/25 shadow-md"
          onClick={handleContinue}
          disabled={!hasActiveModule(moduleState)}
        >
          Continue
          <Icon
            icon="mdi:chevron-right"
            className="text-lg"
            aria-hidden="true"
          />
        </Button>
      </div>

      <Text as="p" className="text-ehs-muted-text mt-8 text-center text-sm">
        Step 2 of 3 · Your progress is saved automatically
      </Text>
    </>
  );
}
