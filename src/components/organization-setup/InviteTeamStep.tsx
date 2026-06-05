"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Text } from "@/components/Text";
import {
  getIndustryLabel,
  getRegionSummaryLabel,
  MODULES,
  type ModuleState,
  type SiteInfo,
} from "@/components/organization-setup/constants";
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
    <div className="space-y-1">
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
      label: "Industry",
      value: getIndustryLabel(site.industry),
    },
    {
      label: "Number of employees",
      value: displaySummaryValue(site.numberOfEmployees),
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
    <div className="space-y-6">
      <SummaryField
        label={getRegionSummaryLabel(index)}
        value={displaySummaryValue(site.region)}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
      <div className="space-y-2">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Invite your team.
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm leading-relaxed">
          Add colleagues now or skip and invite them later from your workspace
          settings.
        </Text>
      </div>

      <div className="mt-8 space-y-3">
        {invites.map((invite, index) => (
          <div key={invite.id} className="flex items-center gap-3">
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

        <TextButton type="button" onClick={handleAddInvite} className="gap-1.5">
          <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
          Add another
        </TextButton>
      </div>

      <section className="border-ehs-border mt-8 overflow-hidden rounded-xl border">
        <div className="bg-ehs-light-bg px-4 py-3">
          <Text as="h2" className="text-ehs-darker text-sm font-semibold">
            Your configuration summary
          </Text>
        </div>

        <div className="space-y-6 bg-white px-4 py-5">
          {sites.map((site, index) => (
            <SiteSummarySection key={site.id} site={site} index={index} />
          ))}

          <div className="space-y-3">
            <Text
              as="p"
              className="text-ehs-muted-text text-xs font-medium tracking-wide uppercase"
            >
              {`Activated modules (${activatedModules.length})`}
            </Text>
            <ul className="flex flex-wrap gap-2">
              {activatedModules.map((module) => (
                <li
                  key={module}
                  className="bg-ehs-light-blue text-ehs-normal-blue rounded-md px-3 py-1 text-sm font-medium"
                >
                  {module}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-ehs-gray hover:text-ehs-darker border-ehs-border cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          Back
        </button>
        <div className="flex items-center gap-8">
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
            className="shadow-ehs-normal-blue/25 shadow-md"
            onClick={onLeaveSetup}
          >
            Go to dashboard
          </Button>
        </div>
      </div>

      <Text as="p" className="text-ehs-muted-text mt-8 text-center text-sm">
        Step 3 of 3 · Your progress is saved automatically
      </Text>
    </>
  );
}
