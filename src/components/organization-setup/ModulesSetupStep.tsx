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
      <div className="flex flex-col gap-[0.264cqw]">
        <Text as="h1" className="text-ehs-darker text-[1.6cqw] font-bold">
          Activate your modules.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text text-[0.936cqw] leading-snug"
        >
          Toggle the EHSS modules your organisation needs. You can activate or
          deactivate modules at any time.
        </Text>
      </div>

      <ul className="mt-[0.8cqw] flex flex-col gap-[0.5cqw]">
        {MODULES.map((module) => {
          const isActive = moduleState[module.id];

          return (
            <li
              key={module.id}
              className={[
                "flex items-center justify-between gap-[0.664cqw] rounded-xl border px-[0.8cqw] py-[0.536cqw] transition-colors",
                isActive
                  ? "border-ehs-light-blue-active/60 bg-ehs-light-blue/40"
                  : "border-ehs-border bg-white",
              ].join(" ")}
            >
              <div className="min-w-0 flex flex-col gap-[0.136cqw]">
                <Text
                  as="h2"
                  className="text-ehs-darker text-[0.936cqw] font-semibold leading-snug"
                >
                  {module.title}
                </Text>
                <Text as="p" className="text-ehs-muted-text text-[0.864cqw] leading-snug">
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
        <Text
          as="p"
          className="text-ehs-red mt-[0.536cqw] text-[0.936cqw]"
          role="alert"
        >
          {error}
        </Text>
      ) : null}

      <div className="mt-[0.8cqw] flex items-center justify-between gap-[0.664cqw]">
        <button
          type="button"
          onClick={onBack}
          className="text-ehs-gray rounded-lg border-ehs-border hover:text-ehs-darker cursor-pointer border px-[0.8cqw] py-[0.4cqw] text-[0.936cqw] font-medium transition-colors"
        >
          Back
        </button>
        <Button
          type="button"
          variant="primary"
          scale="auth"
          onClick={handleContinue}
          disabled={!hasActiveModule(moduleState)}
        >
          Continue
          <Icon
            icon="mdi:chevron-right"
            className="text-[1.2cqw]"
            aria-hidden="true"
          />
        </Button>
      </div>

      <Text
        as="p"
        className="text-ehs-muted-text mt-[0.8cqw] text-center text-[0.936cqw]"
      >
        Step 2 of 3 · Your progress is saved automatically
      </Text>
    </>
  );
}
