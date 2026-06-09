"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Text } from "@/components/Text";
import {
  countActiveMobileModules,
  hasActiveMobileModule,
  MOBILE_MODULES,
  type MobileModuleId,
  type MobileModuleState,
} from "@/components/onboarding/constants";
import { Button } from "@/components/ui/Button";

const MODULE_REQUIRED_MESSAGE = "Select at least one module to continue.";

type MobileToggleProps = Readonly<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
}>;

function MobileToggle(props: Readonly<MobileToggleProps>) {
  const { id, checked, onChange, "aria-label": ariaLabel } = props;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20",
        checked ? "bg-ehs-normal-blue" : "bg-ehs-border",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

export type MobileModulesSetupStepProps = Readonly<{
  moduleState: MobileModuleState;
  onModuleToggle: (id: MobileModuleId, checked: boolean) => void;
  onContinue: () => void;
}>;

export function MobileModulesSetupStep(
  props: Readonly<MobileModulesSetupStepProps>,
) {
  const { moduleState, onModuleToggle, onContinue } = props;
  const [error, setError] = useState("");

  const activeModuleCount = countActiveMobileModules(moduleState);

  const handleModuleToggle = (id: MobileModuleId, checked: boolean) => {
    if (!checked && activeModuleCount === 1 && moduleState[id]) {
      setError(MODULE_REQUIRED_MESSAGE);
      return;
    }

    setError("");
    onModuleToggle(id, checked);
  };

  const handleContinue = () => {
    if (!hasActiveMobileModule(moduleState)) {
      setError(MODULE_REQUIRED_MESSAGE);
      return;
    }

    onContinue();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Safety Modules
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm">
          Select the modules for your workspace.
        </Text>
      </div>

      <ul className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {MOBILE_MODULES.map((module, index) => (
          <li
            key={module.id}
            className={[
              "flex items-center justify-between gap-3 py-4",
              index < MOBILE_MODULES.length - 1 ? "border-ehs-border border-b" : "",
            ].join(" ")}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Icon
                icon={module.icon}
                className="text-ehs-gray shrink-0 text-xl"
                aria-hidden="true"
              />
              <Text
                as="span"
                className="text-ehs-darker text-sm font-medium"
              >
                {module.title}
              </Text>
            </div>
            <MobileToggle
              id={`mobile-${module.id}`}
              checked={moduleState[module.id]}
              onChange={(checked) => handleModuleToggle(module.id, checked)}
              aria-label={`Toggle ${module.title}`}
            />
          </li>
        ))}
      </ul>

      {error ? (
        <Text as="p" className="text-ehs-red mt-2 text-sm" role="alert">
          {error}
        </Text>
      ) : null}

      <div className="mt-6 shrink-0 pt-2">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleContinue}
          disabled={!hasActiveMobileModule(moduleState)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
