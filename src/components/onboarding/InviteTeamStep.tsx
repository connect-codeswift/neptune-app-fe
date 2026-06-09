"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Text } from "@/components/Text";
import {
  getCompanySizeLabel,
  getIndustryLabel,
  getSiteSectionTitle,
  MODULES,
  type ModuleState,
  type SiteInfo,
} from "@/components/onboarding/constants";
import { EmailInput } from "@/components/inputs/EmailInput";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextButton } from "@/components/ui/TextButton";

type InviteRow = Readonly<{
  id: string;
  email: string;
}>;

const initialInvites: InviteRow[] = [
  { id: "invite-1", email: "" },
  { id: "invite-2", email: "" },
  { id: "invite-3", email: "" },
];

function createInviteRow(): InviteRow {
  return {
    id: globalThis.crypto.randomUUID(),
    email: "",
  };
}

function displaySummaryValue(value: string) {
  return value.trim() || "Not set";
}

type SummaryFieldProps = Readonly<{
  label: string;
  value: string;
}>;

function SummaryField(props: SummaryFieldProps) {
  const { label, value } = props;

  return (
    <div className="flex flex-col gap-1">
      <Text
        as="p"
        className="text-ehs-muted-text text-xs font-medium tracking-wide uppercase"
      >
        {label}
      </Text>
      <Text as="p" className="text-ehs-darker text-sm font-semibold">
        {value}
      </Text>
    </div>
  );
}

function getSiteDetailFields(site: SiteInfo) {
  return [
    {
      label: "Site name",
      value: displaySummaryValue(site.siteName),
    },
    {
      label: "Region",
      value: displaySummaryValue(site.region),
    },
    {
      label: "Industry",
      value: getIndustryLabel(site.industry),
    },
    {
      label: "Company size",
      value: getCompanySizeLabel(site.companySize),
    },
  ] as const;
}

type SiteSummarySectionProps = Readonly<{
  site: SiteInfo;
  index: number;
}>;

function SiteSummarySection(props: SiteSummarySectionProps) {
  const { site, index } = props;

  return (
    <div className="flex flex-col gap-2">
      <Text as="h3" className="text-ehs-darker text-sm font-semibold">
        {getSiteSectionTitle(index)}
      </Text>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {getSiteDetailFields(site).map((field) => (
          <SummaryField
            key={`${site.id}-${field.label}`}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </div>
  );
}

export type InviteTeamStepProps = Readonly<{
  sites: SiteInfo[];
  moduleState: ModuleState;
  onBack: () => void;
  onLeaveSetup: () => void;
}>;

export function InviteTeamStep(props: Readonly<InviteTeamStepProps>) {
  const { sites, moduleState, onBack, onLeaveSetup } = props;
  const [invites, setInvites] = useState<InviteRow[]>(initialInvites);

  const activatedModules = MODULES.filter(
    (module) => moduleState[module.id],
  ).map((module) => module.title);

  const handleInviteChange = (id: string, email: string) => {
    setInvites((prev) =>
      prev.map((invite) => (invite.id === id ? { ...invite, email } : invite)),
    );
  };

  const handleAddInvite = () => {
    setInvites((prev) => [...prev, createInviteRow()]);
  };

  const handleRemoveInvite = (id: string) => {
    setInvites((prev) =>
      prev.length > 1 ? prev.filter((invite) => invite.id !== id) : prev,
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Invite your team.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text text-sm leading-snug"
        >
          Add colleagues now or skip and invite them later from your workspace
          settings.
        </Text>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {invites.map((invite, index) => (
          <div key={invite.id} className="flex items-center gap-1.5">
            <EmailInput
              id={`${invite.id}-email`}
              name={`invite-email-${index}`}
              placeholder="colleague@company.com"
              value={invite.email}
              onChange={(e) => handleInviteChange(invite.id, e.target.value)}
              className="min-w-0 flex-1"
            />
            <IconButton
              type="button"
              variant="ghost"
              aria-label={`Remove invite ${index + 1}`}
              onClick={() => handleRemoveInvite(invite.id)}
              className="text-ehs-red hover:text-ehs-red hover:bg-ehs-red/10 shrink-0"
            >
              <Icon icon="mdi:trash-can-outline" aria-hidden="true" />
            </IconButton>
          </div>
        ))}

        <TextButton
          type="button"
          onClick={handleAddInvite}
          className="gap-1"
        >
          <Icon
            icon="mdi:plus"
            className="text-sm"
            aria-hidden="true"
          />
          Add another
        </TextButton>
      </div>

      <section className="border-ehs-border mt-2 overflow-hidden rounded-xl border">
        <div className="bg-ehs-light-bg px-2 py-1.5">
          <Text
            as="h2"
            className="text-ehs-darker text-sm font-semibold"
          >
            Your configuration summary
          </Text>
        </div>

        <div className="flex flex-col gap-2 bg-white px-2 py-2">
          {sites.map((site, index) => (
            <SiteSummarySection key={site.id} site={site} index={index} />
          ))}

          <div className="flex flex-col gap-1">
            <Text
              as="p"
              className="text-ehs-muted-text text-xs font-medium tracking-wide uppercase"
            >
              {`Activated modules (${activatedModules.length})`}
            </Text>
            <ul className="flex flex-wrap gap-1.5">
              {activatedModules.map((module) => (
                <li
                  key={module}
                  className="bg-ehs-light-blue text-ehs-normal-blue rounded-md px-2 py-1 text-sm font-medium"
                >
                  {module}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-ehs-gray hover:text-ehs-darker border-ehs-border cursor-pointer rounded-lg border px-2 py-1 text-sm font-medium transition-colors"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLeaveSetup}
            className="text-ehs-gray hover:text-ehs-darker cursor-pointer text-sm font-medium transition-colors"
          >
            Skip invite
          </button>
          <Button
            type="button"
            variant="primary"
            onClick={onLeaveSetup}
          >
            Go to dashboard
          </Button>
        </div>
      </div>

      <Text
        as="p"
        className="text-ehs-muted-text mt-2 text-center text-sm"
      >
        Step 3 of 3 · Your progress is saved automatically
      </Text>
    </>
  );
}
