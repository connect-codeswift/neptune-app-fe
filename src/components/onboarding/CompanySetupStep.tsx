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
} from "@/components/onboarding/constants";
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
  regionError?: string;
  onFieldChange: (field: keyof Omit<SiteInfo, "id">, value: string) => void;
}>;

function SiteInfoFields(props: Readonly<SiteInfoFieldsProps>) {
  const { site, regionError, onFieldChange } = props;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <TextInput
        id={`${site.id}-siteName`}
        name={`${site.id}-siteName`}
        label="Site name"
        placeholder="Leeds Plant"
        value={site.siteName}
        onChange={(e) => onFieldChange("siteName", e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <TextInput
          id={`${site.id}-region`}
          name={`${site.id}-region`}
          label="Region"
          placeholder="United Kingdom"
          value={site.region}
          onChange={(e) => onFieldChange("region", e.target.value)}
          aria-invalid={regionError ? true : undefined}
          aria-describedby={regionError ? `${site.id}-region-error` : undefined}
        />
        {regionError ? (
          <Text
            as="p"
            id={`${site.id}-region-error`}
            className="text-ehs-red text-xs"
            role="alert"
          >
            {regionError}
          </Text>
        ) : null}
      </div>
      <SelectInput
        id={`${site.id}-industry`}
        name={`${site.id}-industry`}
        label="Industry"
        placeholder="Select industry"
        options={INDUSTRY_OPTIONS}
        value={site.industry}
        onChange={(e) => onFieldChange("industry", e.target.value as Industry)}
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
    </div>
  );
}

function getSiteSummary(site: SiteInfo) {
  if (site.siteName.trim()) {
    return site.siteName.trim();
  }

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

        if (!next.sites && Object.keys(next.regionBySiteId).length === 0) {
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
      <div className="flex shrink-0 flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Let&apos;s set up your workspace.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text text-sm leading-snug"
        >
          Tell us about your organisation so Neptune can pre-configure
          compliance templates and defaults for you.
        </Text>
      </div>

      <form
        className="scrollbar-hidden mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-auto py-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1">
          <TextInput
            id="organizationName"
            name="organizationName"
            label="Organization Name"
            placeholder="CodeSwift"
            value={organizationName}
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
              className="text-ehs-red text-xs"
              role="alert"
            >
              {errors.organizationName}
            </Text>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
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
                      className="text-ehs-darker text-sm font-semibold"
                    >
                      {getSiteSectionTitle(index)}
                    </Text>
                  }
                  subtitle={
                    <Text
                      as="span"
                      className="text-ehs-muted-text text-sm"
                    >
                      {getSiteSummary(site)}
                    </Text>
                  }
                  headerAction={
                    <TextButton
                      type="button"
                      onClick={() => handleClearSite(site.id)}
                    >
                      Clear
                    </TextButton>
                  }
                >
                  <SiteInfoFields
                    site={site}
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
            <Text as="p" className="text-ehs-red text-xs" role="alert">
              {errors.sites}
            </Text>
          ) : null}
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleAddSite}
            className="border-ehs-normal-blue text-ehs-normal-blue gap-1 px-2 py-1 text-xs"
          >
            <Icon
              icon="mdi:plus"
              className="text-sm"
              aria-hidden="true"
            />
            Add Site
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Button type="submit" variant="primary">
            Continue
            <Icon
              icon="mdi:chevron-right"
              className="text-lg"
              aria-hidden="true"
            />
          </Button>
          <Text as="p" className="text-ehs-muted-text text-sm">
            Step 1 of 3 — Your progress is saved automatically
          </Text>
        </div>
      </form>
    </div>
  );
}
