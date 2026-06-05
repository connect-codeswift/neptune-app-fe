"use client";

import { type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import {
  COMPANY_SIZE_OPTIONS,
  getSiteSectionTitle,
  INDUSTRY_OPTIONS,
  emptySiteInfo,
  type CompanySize,
  type Industry,
  type SiteInfo,
} from "@/components/organization-setup/constants";
import { Button } from "@/components/ui/Button";
import { TextButton } from "@/components/ui/TextButton";

type SiteInfoSectionProps = Readonly<{
  site: SiteInfo;
  title: string;
  isPrimary: boolean;
  onClear: () => void;
  onFieldChange: (field: keyof Omit<SiteInfo, "id">, value: string) => void;
}>;

function SiteInfoSection(props: Readonly<SiteInfoSectionProps>) {
  const { site, title, isPrimary, onClear, onFieldChange } = props;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Text as="h2" className="text-ehs-darker text-base font-semibold">
          {title}
        </Text>
        <TextButton type="button" onClick={onClear}>
          Clear
        </TextButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectInput
          id={`${site.id}-industry`}
          name={`${site.id}-industry`}
          label="Industry"
          placeholder="Select industry"
          options={INDUSTRY_OPTIONS}
          value={site.industry}
          onChange={(e) =>
            onFieldChange("industry", e.target.value as Industry)
          }
        />
        <SelectInput
          id={`${site.id}-companySize`}
          name={`${site.id}-companySize`}
          label="Company size"
          placeholder="Select company size"
          options={COMPANY_SIZE_OPTIONS}
          value={site.companySize}
          onChange={(e) =>
            onFieldChange("companySize", e.target.value as CompanySize)
          }
        />
        <TextInput
          id={`${site.id}-region`}
          name={`${site.id}-region`}
          label={isPrimary ? "Primary region" : "Region"}
          placeholder="United Kingdom"
          value={site.region}
          onChange={(e) => onFieldChange("region", e.target.value)}
          required={isPrimary}
        />
        <TextInput
          id={`${site.id}-numberOfEmployees`}
          name={`${site.id}-numberOfEmployees`}
          label="Number of Employees"
          type="number"
          min={0}
          placeholder="250"
          value={site.numberOfEmployees}
          onChange={(e) => onFieldChange("numberOfEmployees", e.target.value)}
        />
      </div>
    </section>
  );
}

export type CompanySetupStepProps = Readonly<{
  organizationName: string;
  onOrganizationNameChange: (value: string) => void;
  sites: SiteInfo[];
  onSitesChange: (sites: SiteInfo[]) => void;
  onContinue: () => void;
}>;

export function CompanySetupStep(props: Readonly<CompanySetupStepProps>) {
  const {
    organizationName,
    onOrganizationNameChange,
    sites,
    onSitesChange,
    onContinue,
  } = props;

  const handleClearSite = (siteId: string) => {
    onSitesChange(
      sites.map((site) =>
        site.id === siteId ? { ...site, ...emptySiteInfo(siteId) } : site,
      ),
    );
  };

  const handleSiteFieldChange = (
    siteId: string,
    field: keyof Omit<SiteInfo, "id">,
    value: string,
  ) => {
    onSitesChange(
      sites.map((site) =>
        site.id === siteId ? { ...site, [field]: value } : site,
      ),
    );
  };

  const handleAddSite = () => {
    onSitesChange([...sites, emptySiteInfo(globalThis.crypto.randomUUID())]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <>
      <div className="space-y-2">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Let&apos;s set up your workspace.
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm leading-relaxed">
          Tell us about your organisation so Neptune can pre-configure compliance
          templates and defaults for you.
        </Text>
      </div>

      <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
        <TextInput
          id="organizationName"
          name="organizationName"
          label="Organization Name"
          placeholder="CodeSwift"
          value={organizationName}
          onChange={(e) => onOrganizationNameChange(e.target.value)}
          required
        />

        <div className="space-y-8">
          {sites.map((site, index) => (
            <SiteInfoSection
              key={site.id}
              site={site}
              title={getSiteSectionTitle(index)}
              isPrimary={index === 0}
              onClear={() => handleClearSite(site.id)}
              onFieldChange={(field, value) =>
                handleSiteFieldChange(site.id, field, value)
              }
            />
          ))}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleAddSite}
              className="border-ehs-normal-blue text-ehs-normal-blue gap-1.5 px-3 py-1.5 text-xs"
            >
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              Add Site
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="shadow-ehs-normal-blue/25 shadow-md"
        >
          Continue
          <Icon icon="mdi:chevron-right" className="text-lg" aria-hidden="true" />
        </Button>
      </form>

      <Text as="p" className="text-ehs-muted-text mt-8 text-center text-sm">
        Step 1 of 3 — Your progress is saved automatically
      </Text>
    </>
  );
}
