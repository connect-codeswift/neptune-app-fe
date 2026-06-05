"use client";

import { SubmitEvent, useId, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import {
  COMPANY_SIZE_OPTIONS,
  getIndustryLabel,
  getSiteSectionTitle,
  INDUSTRY_OPTIONS,
  emptySiteInfo,
  type CompanySize,
  type Industry,
  type SiteInfo,
} from "@/components/organization-setup/constants";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { TextButton } from "@/components/ui/TextButton";

const ORGANIZATION_NAME_REQUIRED = "Organization name is required.";
const PRIMARY_REGION_REQUIRED = "Primary region is required.";

type CompanySetupErrors = Readonly<{
  organizationName?: string;
  sites?: string;
  regionBySiteId: Record<string, string>;
}>;

type SiteInfoFieldsProps = Readonly<{
  site: SiteInfo;
  isPrimary: boolean;
  regionError?: string;
  onFieldChange: (field: keyof Omit<SiteInfo, "id">, value: string) => void;
}>;

function SiteInfoFields(props: Readonly<SiteInfoFieldsProps>) {
  const { site, isPrimary, regionError, onFieldChange } = props;

  return (
    <div className="grid grid-cols-1 gap-[0.664cqw] sm:grid-cols-2">
      <SelectInput
        id={`${site.id}-industry`}
        name={`${site.id}-industry`}
        label="Industry"
        placeholder="Select industry"
        options={INDUSTRY_OPTIONS}
        value={site.industry}
        scale="auth"
        onChange={(e) => onFieldChange("industry", e.target.value as Industry)}
      />
      <SelectInput
        id={`${site.id}-companySize`}
        name={`${site.id}-companySize`}
        label="Company size"
        placeholder="Select company size"
        options={COMPANY_SIZE_OPTIONS}
        value={site.companySize}
        scale="auth"
        onChange={(e) =>
          onFieldChange("companySize", e.target.value as CompanySize)
        }
      />
      <div className="flex flex-col gap-[0.264cqw]">
        <TextInput
          id={`${site.id}-region`}
          name={`${site.id}-region`}
          label={isPrimary ? "Primary region" : "Region"}
          placeholder="United Kingdom"
          value={site.region}
          scale="auth"
          onChange={(e) => onFieldChange("region", e.target.value)}
          aria-invalid={regionError ? true : undefined}
          aria-describedby={regionError ? `${site.id}-region-error` : undefined}
        />
        {regionError ? (
          <Text
            as="p"
            id={`${site.id}-region-error`}
            className="text-ehs-red text-[0.864cqw]"
            role="alert"
          >
            {regionError}
          </Text>
        ) : null}
      </div>
      <TextInput
        id={`${site.id}-numberOfEmployees`}
        name={`${site.id}-numberOfEmployees`}
        label="Number of Employees"
        type="number"
        min={0}
        placeholder="250"
        value={site.numberOfEmployees}
        scale="auth"
        onChange={(e) => onFieldChange("numberOfEmployees", e.target.value)}
      />
    </div>
  );
}

function getSiteSummary(site: SiteInfo) {
  if (site.region.trim()) {
    return site.region.trim();
  }

  if (site.industry) {
    return getIndustryLabel(site.industry);
  }

  return "No details added yet";
}

function validateCompanySetup(
  organizationName: string,
  sites: SiteInfo[],
): CompanySetupErrors | null {
  const errors: {
    organizationName?: string;
    sites?: string;
    regionBySiteId: Record<string, string>;
  } = { regionBySiteId: {} };

  if (!organizationName.trim()) {
    errors.organizationName = ORGANIZATION_NAME_REQUIRED;
  }

  const primarySite = sites[0];
  if (primarySite && !primarySite.region.trim()) {
    errors.sites = PRIMARY_REGION_REQUIRED;
    errors.regionBySiteId[primarySite.id] = PRIMARY_REGION_REQUIRED;
  }

  if (errors.organizationName || errors.sites) {
    return errors;
  }

  return null;
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

  const accordionBaseId = useId();
  const [expandedSiteId, setExpandedSiteId] = useState(
    () => sites[0]?.id ?? "",
  );
  const [errors, setErrors] = useState<CompanySetupErrors | null>(null);

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

    if (!errors) {
      return;
    }

    if (field === "region" && value.trim()) {
      setErrors((prev) => {
        if (!prev) {
          return null;
        }

        const regionBySiteId = { ...prev.regionBySiteId };
        delete regionBySiteId[siteId];

        const next: CompanySetupErrors = {
          organizationName: prev.organizationName,
          sites: Object.keys(regionBySiteId).length ? prev.sites : undefined,
          regionBySiteId,
        };

        if (
          !next.organizationName &&
          !next.sites &&
          Object.keys(next.regionBySiteId).length === 0
        ) {
          return null;
        }

        return next;
      });
    }
  };

  const handleOrganizationNameChange = (value: string) => {
    onOrganizationNameChange(value);

    if (errors?.organizationName && value.trim()) {
      setErrors((prev) => {
        if (!prev) {
          return null;
        }

        const next: CompanySetupErrors = {
          organizationName: undefined,
          sites: prev.sites,
          regionBySiteId: prev.regionBySiteId,
        };

        if (
          !next.sites &&
          Object.keys(next.regionBySiteId).length === 0
        ) {
          return null;
        }

        return next;
      });
    }
  };

  const handleAddSite = () => {
    const newSite = emptySiteInfo(globalThis.crypto.randomUUID());
    onSitesChange([...sites, newSite]);
    setExpandedSiteId(newSite.id);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateCompanySetup(organizationName, sites);
    if (validationErrors) {
      setErrors(validationErrors);

      const firstInvalidSiteId = sites.find(
        (site) => validationErrors.regionBySiteId[site.id],
      )?.id;

      if (firstInvalidSiteId) {
        setExpandedSiteId(firstInvalidSiteId);
      }

      return;
    }

    setErrors(null);
    onContinue();
  };

  const primarySiteId = sites[0]?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-[0.264cqw]">
        <Text as="h1" className="text-ehs-darker text-[1.6cqw] font-bold">
          Let&apos;s set up your workspace.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text text-[0.936cqw] leading-snug"
        >
          Tell us about your organisation so Neptune can pre-configure
          compliance templates and defaults for you.
        </Text>
      </div>

      <form
        className="scrollbar-hidden mt-[0.8cqw] flex min-h-0 flex-1 flex-col gap-[0.8cqw] overflow-auto py-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-[0.264cqw]">
          <TextInput
            id="organizationName"
            name="organizationName"
            label="Organization Name"
            placeholder="CodeSwift"
            value={organizationName}
            scale="auth"
            onChange={(e) => handleOrganizationNameChange(e.target.value)}
            aria-invalid={errors?.organizationName ? true : undefined}
            aria-describedby={
              errors?.organizationName ? "organizationName-error" : undefined
            }
          />
          {errors?.organizationName ? (
            <Text
              as="p"
              id="organizationName-error"
              className="text-ehs-red text-[0.864cqw]"
              role="alert"
            >
              {errors.organizationName}
            </Text>
          ) : null}
        </div>

        <div className="flex flex-col gap-[0.264cqw]">
          <Accordion>
            {sites.map((site, index) => {
              const isOpen = expandedSiteId === site.id;
              const triggerId = `${accordionBaseId}-trigger-${site.id}`;
              const panelId = `${accordionBaseId}-panel-${site.id}`;
              const regionError = errors?.regionBySiteId[site.id];
              const hasError = Boolean(regionError);

              return (
                <AccordionItem
                  key={site.id}
                  triggerId={triggerId}
                  panelId={panelId}
                  isOpen={isOpen}
                  hasError={hasError}
                  onToggle={() => setExpandedSiteId(isOpen ? "" : site.id)}
                  title={
                    <Text
                      as="span"
                      className="text-ehs-darker text-[1.064cqw] font-semibold"
                    >
                      {getSiteSectionTitle(index)}
                    </Text>
                  }
                  subtitle={
                    <Text
                      as="span"
                      className="text-ehs-muted-text text-[0.936cqw]"
                    >
                      {getSiteSummary(site)}
                    </Text>
                  }
                  headerAction={
                    <TextButton
                      type="button"
                      scale="auth"
                      onClick={() => handleClearSite(site.id)}
                    >
                      Clear
                    </TextButton>
                  }
                >
                  <SiteInfoFields
                    site={site}
                    isPrimary={index === 0}
                    regionError={isOpen ? regionError : undefined}
                    onFieldChange={(field, value) =>
                      handleSiteFieldChange(site.id, field, value)
                    }
                  />
                </AccordionItem>
              );
            })}
          </Accordion>

          {errors?.sites && expandedSiteId !== primarySiteId ? (
            <Text
              as="p"
              className="text-ehs-red text-[0.864cqw]"
              role="alert"
            >
              {errors.sites}
            </Text>
          ) : null}
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="tertiary"
            scale="auth"
            onClick={handleAddSite}
            className="border-ehs-normal-blue text-ehs-normal-blue gap-[0.4cqw] px-[0.8cqw] py-[0.4cqw] text-[0.8cqw]"
          >
            <Icon
              icon="mdi:plus"
              className="text-[1.064cqw]"
              aria-hidden="true"
            />
            Add Site
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-[0.664cqw] pt-[0.8cqw]">
          <Button type="submit" variant="primary" scale="auth">
            Continue
            <Icon
              icon="mdi:chevron-right"
              className="text-[1.2cqw]"
              aria-hidden="true"
            />
          </Button>
          <Text
            as="p"
            className="text-ehs-muted-text text-[0.936cqw]"
          >
            Step 1 of 3 — Your progress is saved automatically
          </Text>
        </div>
      </form>
    </div>
  );
}
