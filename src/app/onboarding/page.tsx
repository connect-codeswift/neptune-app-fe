"use client";

import { useCallback, useEffect, useState } from "react";
import { Stepper } from "@/components/onboarding/Stepper";
import { CompanySetupStep } from "@/components/onboarding/CompanySetupStep";
import {
  InviteTeamStep,
  type Invite,
} from "@/components/onboarding/InviteTeamStep";
import { MobileModulesSetupStep } from "@/components/onboarding/MobileModulesSetupStep";
import { MobileStepper } from "@/components/onboarding/MobileStepper";
import { ModulesSetupStep } from "@/components/onboarding/ModulesSetupStep";
import {
  ONBOARDING_STEPS,
  countActiveMobileModules,
  countActiveModules,
  countConfiguredSites,
  initialMobileModuleState,
  initialModuleState,
  initialSites,
  type MobileModuleId,
  type ModuleId,
} from "@/components/onboarding/constants";
import { SetupCompleteModal } from "@/components/onboarding/SetupCompleteModal";
import { useUnloadWarning } from "@/hooks/useUnloadWarning";
import {
  clearOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
  type OnboardingPersistedState,
} from "@/lib/onboarding-storage";
import { ShadeBall } from "@/components/ShadeBall";
import { Logo } from "@/components/Logo";
import { TextButton } from "@/components/ui/TextButton";
import { useRouter } from "next/navigation";

const defaultOnboardingState: OnboardingPersistedState = {
  currentStep: 1,
  organizationName: "",
  sites: initialSites,
  moduleState: initialModuleState,
  mobileModuleState: initialMobileModuleState,
  invites: [],
};

export default function OrganizationSetupPage() {
  const [onboarding, setOnboarding] = useState(defaultOnboardingState);
  const [stepDirection, setStepDirection] = useState<"left" | "right">("right");
  const [allowLeave, setAllowLeave] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const router = useRouter();

  useUnloadWarning(!allowLeave);

  useEffect(() => {
    const saved = loadOnboardingState();
    if (saved) {
      // Restore client-side progress after hydration from localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setOnboarding(saved);
    }
  }, []);

  useEffect(() => {
    saveOnboardingState(onboarding);
  }, [onboarding]);

  const {
    currentStep,
    organizationName,
    sites,
    moduleState,
    mobileModuleState,
    invites,
  } = onboarding;

  const persistOnboarding = useCallback(
    (patch: Partial<OnboardingPersistedState>) => {
      setOnboarding((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const handleModuleToggle = (id: ModuleId, checked: boolean) => {
    persistOnboarding({
      moduleState: { ...moduleState, [id]: checked },
    });
  };

  const handleMobileModuleToggle = (id: MobileModuleId, checked: boolean) => {
    persistOnboarding({
      mobileModuleState: { ...mobileModuleState, [id]: checked },
    });
  };

  const handleStepChange = (nextStep: number) => {
    if (nextStep === currentStep) {
      return;
    }

    setStepDirection(nextStep > currentStep ? "right" : "left");
    persistOnboarding({ currentStep: nextStep });
  };

  const handleBack = () => {
    handleStepChange(Math.max(1, currentStep - 1));
  };

  const handleSaveAndExit = () => {
    saveOnboardingState(onboarding);
    setAllowLeave(true);
  };

  const getActiveModuleCount = () => {
    if (globalThis.window?.matchMedia("(max-width: 1023px)")?.matches) {
      return countActiveMobileModules(mobileModuleState);
    }

    return countActiveModules(moduleState);
  };

  const handleFinishSetup = () => {
    setAllowLeave(true);
    setShowCompleteModal(true);
  };

  const handleEnterWorkspace = () => {
    clearOnboardingState();
    setAllowLeave(true);
    router.push("/");
  };

  return (
    <main className="bg-ehs-light-bg relative flex min-h-screen w-full flex-col overflow-hidden">
      <ShadeBall
        positionAsClassName="top-[-150px] left-[-150px]"
        size={400}
        blur={80}
      />
      <ShadeBall
        positionAsClassName="top-[-150px] right-[-150px]"
        size={400}
        blur={80}
      />
      <ShadeBall
        positionAsClassName="bottom-[-150px] left-[-150px]"
        size={400}
        blur={80}
      />
      <ShadeBall
        positionAsClassName="bottom-[-150px] right-[-150px]"
        size={400}
        blur={80}
      />

      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col items-center gap-10 px-4 py-8 lg:px-0">
        <div className="grid w-full grid-cols-4 place-items-center gap-4">
          <div className="col-span-1 h-24">
            <Logo text="Workspace setup" />
          </div>
          <div className="col-span-2">
            <Stepper
              steps={ONBOARDING_STEPS}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              ariaLabel="Onboarding progress"
              className="max-w-none shrink-0"
            />

            <MobileStepper
              steps={ONBOARDING_STEPS}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              onBack={currentStep > 1 ? handleBack : undefined}
              ariaLabel="Onboarding progress"
              className="w-full shrink-0 lg:hidden"
            />
          </div>
          <div className="col-span-1 pb-12">
            <TextButton
              type="button"
              onClick={handleSaveAndExit}
              className="text-nowrap"
            >
              Save &amp; exit
            </TextButton>
          </div>
        </div>

        <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
          <div
            key={currentStep}
            className={[
              "flex min-h-0 flex-1 flex-col",
              stepDirection === "right"
                ? "animate-[step-slide-in-from-right_320ms_cubic-bezier(0.22,1,0.36,1)]"
                : "animate-[step-slide-in-from-left_320ms_cubic-bezier(0.22,1,0.36,1)]",
            ].join(" ")}
          >
            {currentStep === 1 ? (
              <CompanySetupStep
                organizationName={organizationName}
                onOrganizationNameChange={(value) =>
                  persistOnboarding({ organizationName: value })
                }
                sites={sites}
                onSitesChange={(nextSites) =>
                  persistOnboarding({ sites: nextSites })
                }
                onBack={() => router.push("/signup")}
                onContinue={() => handleStepChange(2)}
              />
            ) : null}

            {currentStep === 2 ? (
              <>
                <div className="hidden min-h-0 flex-1 flex-col lg:flex">
                  <ModulesSetupStep
                    moduleState={moduleState}
                    onModuleToggle={handleModuleToggle}
                    onBack={handleBack}
                    onContinue={() => handleStepChange(3)}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col lg:hidden">
                  <MobileModulesSetupStep
                    moduleState={mobileModuleState}
                    onModuleToggle={handleMobileModuleToggle}
                    onContinue={() => handleStepChange(3)}
                  />
                </div>
              </>
            ) : null}

            {currentStep === 3 ? (
              <InviteTeamStep
                organizationName={organizationName}
                invites={invites as Invite[]}
                onInvitesChange={(nextInvites) =>
                  persistOnboarding({ invites: nextInvites })
                }
                onBack={() => handleStepChange(2)}
                onLeaveSetup={handleFinishSetup}
              />
            ) : null}
          </div>
        </div>
      </div>

      {showCompleteModal ? (
        <SetupCompleteModal
          organizationName={organizationName}
          siteCount={countConfiguredSites(sites)}
          moduleCount={getActiveModuleCount()}
          invitedCount={invites.length}
          onEnterWorkspace={handleEnterWorkspace}
        />
      ) : null}
    </main>
  );
}
