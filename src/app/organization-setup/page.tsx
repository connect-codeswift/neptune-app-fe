"use client";

import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { CompanySetupStep } from "@/components/organization-setup/CompanySetupStep";
import { InviteTeamStep } from "@/components/organization-setup/InviteTeamStep";
import { ModulesSetupStep } from "@/components/organization-setup/ModulesSetupStep";
import {
  ONBOARDING_STEPS,
  initialModuleState,
  initialSites,
  type ModuleId,
  type ModuleState,
  type SiteInfo,
} from "@/components/organization-setup/constants";
import { useUnloadWarning } from "@/hooks/useUnloadWarning";
import { ShadeBall } from "@/components/ShadeBall";

export default function OrganizationSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationName, setOrganizationName] = useState("");
  const [sites, setSites] = useState<SiteInfo[]>(initialSites);
  const [moduleState, setModuleState] =
    useState<ModuleState>(initialModuleState);
  const [allowLeave, setAllowLeave] = useState(false);

  useUnloadWarning(!allowLeave);

  const handleModuleToggle = (id: ModuleId, checked: boolean) => {
    setModuleState((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden">
      <ShadeBall positionAsClassName="top-[-150px] left-[-150px]" />
      <ShadeBall positionAsClassName="bottom-[-150px] right-[-150px]" />

      <div className="mx-auto flex min-h-0 w-full max-w-[50cqw] flex-1 flex-col items-center gap-[0.8cqw] overflow-hidden py-[1cqw]">
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          ariaLabel="Onboarding progress"
          className="max-w-none shrink-0"
        />

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          {currentStep === 1 ? (
            <CompanySetupStep
              organizationName={organizationName}
              onOrganizationNameChange={setOrganizationName}
              sites={sites}
              onSitesChange={setSites}
              onContinue={() => setCurrentStep(2)}
            />
          ) : null}

          {currentStep === 2 ? (
            <ModulesSetupStep
              moduleState={moduleState}
              onModuleToggle={handleModuleToggle}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
            />
          ) : null}

          {currentStep === 3 ? (
            <InviteTeamStep
              sites={sites}
              moduleState={moduleState}
              onBack={() => setCurrentStep(2)}
              onLeaveSetup={() => setAllowLeave(true)}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
