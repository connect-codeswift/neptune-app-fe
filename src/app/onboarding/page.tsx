"use client";

import { useCallback, useEffect, useState } from "react";
import { Stepper } from "@/components/onboarding/Stepper";
import { CompanySetupStep } from "@/components/onboarding/CompanySetupStep";
import {
  InviteTeamStep,
  type Invite,
} from "@/components/onboarding/InviteTeamStep";
import { MobileStepper } from "@/components/onboarding/MobileStepper";
import { ModulesSetupStep } from "@/components/onboarding/ModulesSetupStep";
import {
  ONBOARDING_STEPS,
  countActiveModules,
  countConfiguredSites,
  initialModuleState,
  initialSites,
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
import {
  clearSignupState,
  loadSignupState,
} from "@/lib/signup-storage";
import {
  getMutationErrorMessage,
  useCompleteRegistrationMutation,
} from "@/hooks/use-auth-mutations";
import { ShadeBall } from "@/components/ShadeBall";
import { Logo } from "@/components/Logo";
import { TextButton } from "@/components/ui/TextButton";
import { useRouter } from "next/navigation";

const defaultOnboardingState: OnboardingPersistedState = {
  currentStep: 1,
  organizationName: "",
  sites: initialSites,
  moduleState: initialModuleState,
  invites: [],
};

export default function OrganizationSetupPage() {
  const [onboarding, setOnboarding] = useState(defaultOnboardingState);
  const [stepDirection, setStepDirection] = useState<"left" | "right">("right");
  const [allowLeave, setAllowLeave] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const router = useRouter();
  const completeRegistrationMutation = useCompleteRegistrationMutation();

  useUnloadWarning(!allowLeave);

  useEffect(() => {
    const saved = loadOnboardingState();
    if (saved) {
      // Restore client-side progress after hydration from localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setOnboarding(saved);
    }

    if (!loadSignupState()) {
      router.replace("/signup");
    }
  }, [router]);

  useEffect(() => {
    saveOnboardingState(onboarding);
  }, [onboarding]);

  const {
    currentStep,
    organizationName,
    sites,
    moduleState,
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

  const handleFinishSetup = async () => {
    const signup = loadSignupState();
    if (!signup) {
      router.replace("/signup");
      return;
    }

    try {
      await completeRegistrationMutation.mutateAsync({
        signup,
        onboarding,
      });
      setAllowLeave(true);
      setShowCompleteModal(true);
    } catch {
      // Error state is exposed via completeRegistrationMutation.error
    }
  };

  const handleEnterWorkspace = () => {
    clearOnboardingState();
    clearSignupState();
    setAllowLeave(true);
    router.push("/dashboard");
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
        <div className="grid w-full grid-cols-1 lg:grid-cols-4 place-items-center gap-4">
          <div className="col-span-1 h-24 lg:block hidden">
            <Logo />
          </div>
          <div className="col-span-1 lg:col-span-2">
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
              ariaLabel="Onboarding progress"
              className="w-full shrink-0 lg:hidden"
            />
          </div>
          <div className="col-span-1 hidden pb-12 lg:block">
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
              <ModulesSetupStep
                moduleState={moduleState}
                onModuleToggle={handleModuleToggle}
                onBack={handleBack}
                onContinue={() => handleStepChange(3)}
              />
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
                isSubmitting={completeRegistrationMutation.isPending}
                submitError={
                  completeRegistrationMutation.error
                    ? getMutationErrorMessage(
                        completeRegistrationMutation.error,
                        "Registration failed. Please try again.",
                      )
                    : undefined
                }
              />
            ) : null}
          </div>
        </div>
      </div>

      {showCompleteModal ? (
        <SetupCompleteModal
          organizationName={organizationName}
          siteCount={countConfiguredSites(sites)}
          moduleCount={countActiveModules(moduleState)}
          invitedCount={invites.length}
          onEnterWorkspace={handleEnterWorkspace}
        />
      ) : null}
    </main>
  );
}
