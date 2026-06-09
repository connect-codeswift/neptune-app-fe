"use client";

import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { CompanySetupStep } from "@/components/onboarding/CompanySetupStep";
import { InviteTeamStep } from "@/components/onboarding/InviteTeamStep";
import { MobileModulesSetupStep } from "@/components/onboarding/MobileModulesSetupStep";
import { MobileStepper } from "@/components/onboarding/MobileStepper";
import { ModulesSetupStep } from "@/components/onboarding/ModulesSetupStep";
import {
  ONBOARDING_STEPS,
  initialMobileModuleState,
  initialModuleState,
  initialSites,
  type MobileModuleId,
  type MobileModuleState,
  type ModuleId,
  type ModuleState,
  type SiteInfo,
} from "@/components/onboarding/constants";
import { useUnloadWarning } from "@/hooks/useUnloadWarning";
import { ShadeBall } from "@/components/ShadeBall";

export default function OrganizationSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationName, setOrganizationName] = useState("");
  const [sites, setSites] = useState<SiteInfo[]>(initialSites);
  const [moduleState, setModuleState] =
    useState<ModuleState>(initialModuleState);
  const [mobileModuleState, setMobileModuleState] =
    useState<MobileModuleState>(initialMobileModuleState);
  const [allowLeave, setAllowLeave] = useState(false);

  useUnloadWarning(!allowLeave);

  const handleModuleToggle = (id: ModuleId, checked: boolean) => {
    setModuleState((prev) => ({ ...prev, [id]: checked }));
  };

  const handleMobileModuleToggle = (id: MobileModuleId, checked: boolean) => {
    setMobileModuleState((prev) => ({ ...prev, [id]: checked }));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden">
      <ShadeBall positionAsClassName="top-[-150px] left-[-150px]" />
      <ShadeBall positionAsClassName="bottom-[-150px] right-[-150px]" />

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col items-center gap-2 overflow-hidden px-4 py-2 lg:px-0">
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          ariaLabel="Onboarding progress"
          className="max-w-none shrink-0"
        />

        <MobileStepper
          currentStep={currentStep}
          totalSteps={ONBOARDING_STEPS.length}
          onBack={currentStep > 1 ? handleBack : undefined}
          ariaLabel="Onboarding progress"
          className="w-full shrink-0 lg:hidden"
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
            <>
              <div className="hidden min-h-0 flex-1 flex-col lg:flex">
                <ModulesSetupStep
                  moduleState={moduleState}
                  onModuleToggle={handleModuleToggle}
                  onBack={handleBack}
                  onContinue={() => setCurrentStep(3)}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col lg:hidden">
                <MobileModulesSetupStep
                  moduleState={mobileModuleState}
                  onModuleToggle={handleMobileModuleToggle}
                  onContinue={() => setCurrentStep(3)}
                />
              </div>
            </>
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
