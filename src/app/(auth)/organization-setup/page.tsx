"use client";

import { useState } from "react";
import { LogoIcon } from "@/components/LogoIcon";
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
    <main className="from-ehs-light-blue min-h-screen bg-linear-to-b via-white to-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <LogoIcon />
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          ariaLabel="Onboarding progress"
          className="max-w-none"
        />

        <div className="w-full rounded-2xl bg-white p-12 shadow-lg">
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
