"use client";

import { Fragment, SubmitEvent, useId, useState } from "react";
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
const SITE_NAME_REQUIRED = "Site name is required.";
const REGION_REQUIRED = "Region is required.";
const INDUSTRY_REQUIRED = "Industry is required.";
const COMPANY_SIZE_REQUIRED = "Company size is required.";
const EMPTY_SITE_SUMMARY = "No details added yet";

type SiteFieldErrors = Readonly<{
  siteName?: string;
  region?: string;
  industry?: string;
  companySize?: string;
}>;

type CompanySetupErrors = Readonly<{
  organizationName?: string;
  siteErrorsBySiteId: Record<string, SiteFieldErrors>;
}>;

type SiteInfoFieldsProps = Readonly<{
  site: SiteInfo;
  isRequired: boolean;
  fieldErrors?: SiteFieldErrors;
  onFieldChange: (field: keyof Omit<SiteInfo, "id">, value: string) => void;
}>;

function FieldError(props: Readonly<{ id: string; message?: string }>) {
  const { id, message } = props;

  if (!message) {
    return null;
  }

  return (
    <Text as="p" id={id} className="text-ehs-red text-xs" role="alert">
      {message}
    </Text>
  );
}

function SiteInfoFields(props: Readonly<SiteInfoFieldsProps>) {
  const { site, isRequired, fieldErrors, onFieldChange } = props;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <TextInput
          id={`${site.id}-siteName`}
          name={`${site.id}-siteName`}
          label="Site name"
          placeholder="Leeds Plant"
          value={site.siteName}
          onChange={(e) => onFieldChange("siteName", e.target.value)}
          aria-invalid={fieldErrors?.siteName ? true : undefined}
          aria-describedby={
            fieldErrors?.siteName ? `${site.id}-siteName-error` : undefined
          }
          required={isRequired}
        />
        <FieldError
          id={`${site.id}-siteName-error`}
          message={fieldErrors?.siteName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <TextInput
          id={`${site.id}-region`}
          name={`${site.id}-region`}
          label="Region"
          placeholder="United Kingdom"
          value={site.region}
          onChange={(e) => onFieldChange("region", e.target.value)}
          aria-invalid={fieldErrors?.region ? true : undefined}
          aria-describedby={
            fieldErrors?.region ? `${site.id}-region-error` : undefined
          }
          required={isRequired}
        />
        <FieldError
          id={`${site.id}-region-error`}
          message={fieldErrors?.region}
        />
      </div>
      <div className="flex flex-col gap-1">
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
          aria-invalid={fieldErrors?.industry ? true : undefined}
          aria-describedby={
            fieldErrors?.industry ? `${site.id}-industry-error` : undefined
          }
          required={isRequired}
        />
        <FieldError
          id={`${site.id}-industry-error`}
          message={fieldErrors?.industry}
        />
      </div>
      <div className="flex flex-col gap-1">
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
          aria-invalid={fieldErrors?.companySize ? true : undefined}
          aria-describedby={
            fieldErrors?.companySize
              ? `${site.id}-companySize-error`
              : undefined
          }
          required={isRequired}
        />
        <FieldError
          id={`${site.id}-companySize-error`}
          message={fieldErrors?.companySize}
        />
      </div>
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

  return EMPTY_SITE_SUMMARY;
}

function siteHasPartialInput(site: SiteInfo) {
  return site.siteName.trim().length > 0 || site.region.trim().length > 0;
}

function isSiteRequired(site: SiteInfo, index: number) {
  return index === 0 || siteHasPartialInput(site);
}

function validateSite(site: SiteInfo, index: number): SiteFieldErrors | null {
  if (!isSiteRequired(site, index)) {
    return null;
  }

  const fieldErrors: {
    siteName?: string;
    region?: string;
    industry?: string;
    companySize?: string;
  } = {};

  if (!site.siteName.trim()) {
    fieldErrors.siteName = SITE_NAME_REQUIRED;
  }

  if (!site.region.trim()) {
    fieldErrors.region = REGION_REQUIRED;
  }

  if (!site.industry) {
    fieldErrors.industry = INDUSTRY_REQUIRED;
  }

  if (!site.companySize) {
    fieldErrors.companySize = COMPANY_SIZE_REQUIRED;
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

function getSiteAccordionErrorMessage(fieldErrors?: SiteFieldErrors) {
  if (!fieldErrors) {
    return undefined;
  }

  return (
    fieldErrors.siteName ??
    fieldErrors.region ??
    fieldErrors.industry ??
    fieldErrors.companySize
  );
}

function hasSiteFieldErrors(fieldErrors?: SiteFieldErrors) {
  return Boolean(
    fieldErrors?.siteName ||
    fieldErrors?.region ||
    fieldErrors?.industry ||
    fieldErrors?.companySize,
  );
}

function validateSites(sites: SiteInfo[]) {
  const siteErrorsBySiteId: Record<string, SiteFieldErrors> = {};

  sites.forEach((site, index) => {
    const siteErrors = validateSite(site, index);
    if (siteErrors) {
      siteErrorsBySiteId[site.id] = siteErrors;
    }
  });

  return siteErrorsBySiteId;
}

export type CompanySetupStepProps = Readonly<{
  organizationName: string;
  onOrganizationNameChange: (value: string) => void;
  sites: SiteInfo[];
  onSitesChange: (sites: SiteInfo[]) => void;
  onBack: () => void;
  onContinue: () => void;
}>;

export function CompanySetupStep(props: Readonly<CompanySetupStepProps>) {
  const {
    organizationName,
    onOrganizationNameChange,
    sites,
    onSitesChange,
    onBack,
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

    setErrors((prev) => {
      if (!prev?.siteErrorsBySiteId[siteId]) {
        return prev;
      }

      const siteErrorsBySiteId = { ...prev.siteErrorsBySiteId };
      delete siteErrorsBySiteId[siteId];

      if (
        !prev.organizationName &&
        Object.keys(siteErrorsBySiteId).length === 0
      ) {
        return null;
      }

      return {
        organizationName: prev.organizationName,
        siteErrorsBySiteId,
      };
    });
  };

  const handleRemoveSite = (siteId: string) => {
    onSitesChange(sites.filter((site) => site.id !== siteId));

    if (expandedSiteId === siteId) {
      setExpandedSiteId("");
    }

    setErrors((prev) => {
      if (!prev?.siteErrorsBySiteId[siteId]) {
        return prev;
      }

      const siteErrorsBySiteId = { ...prev.siteErrorsBySiteId };
      delete siteErrorsBySiteId[siteId];

      if (
        !prev.organizationName &&
        Object.keys(siteErrorsBySiteId).length === 0
      ) {
        return null;
      }

      return {
        organizationName: prev.organizationName,
        siteErrorsBySiteId,
      };
    });
  };

  const clearSiteFieldError = (
    siteId: string,
    field: keyof SiteFieldErrors,
    value: string,
  ) => {
    if (!errors?.siteErrorsBySiteId[siteId]?.[field]) {
      return;
    }

    const hasValue =
      field === "industry" || field === "companySize"
        ? Boolean(value)
        : value.trim().length > 0;

    if (!hasValue) {
      return;
    }

    setErrors((prev) => {
      if (!prev) {
        return null;
      }

      const currentSiteErrors = prev.siteErrorsBySiteId[siteId];
      if (!currentSiteErrors?.[field]) {
        return prev;
      }

      const nextSiteErrors = { ...currentSiteErrors };
      delete nextSiteErrors[field];

      const siteErrorsBySiteId = { ...prev.siteErrorsBySiteId };
      if (Object.keys(nextSiteErrors).length === 0) {
        delete siteErrorsBySiteId[siteId];
      } else {
        siteErrorsBySiteId[siteId] = nextSiteErrors;
      }

      if (
        !prev.organizationName &&
        Object.keys(siteErrorsBySiteId).length === 0
      ) {
        return null;
      }

      return {
        organizationName: prev.organizationName,
        siteErrorsBySiteId,
      };
    });
  };

  const handleSiteFieldChange = (
    siteId: string,
    field: keyof Omit<SiteInfo, "id">,
    value: string,
  ) => {
    const siteIndex = sites.findIndex((site) => site.id === siteId);
    const updatedSite =
      siteIndex === -1 ? null : { ...sites[siteIndex], [field]: value };

    onSitesChange(
      sites.map((site) =>
        site.id === siteId ? { ...site, [field]: value } : site,
      ),
    );

    if (
      updatedSite &&
      siteIndex !== -1 &&
      !isSiteRequired(updatedSite, siteIndex)
    ) {
      setErrors((prev) => {
        if (!prev?.siteErrorsBySiteId[siteId]) {
          return prev;
        }

        const siteErrorsBySiteId = { ...prev.siteErrorsBySiteId };
        delete siteErrorsBySiteId[siteId];

        if (
          !prev.organizationName &&
          Object.keys(siteErrorsBySiteId).length === 0
        ) {
          return null;
        }

        return {
          organizationName: prev.organizationName,
          siteErrorsBySiteId,
        };
      });
      return;
    }

    clearSiteFieldError(siteId, field, value);
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
          siteErrorsBySiteId: prev.siteErrorsBySiteId,
        };

        if (Object.keys(next.siteErrorsBySiteId).length === 0) {
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

    if (!organizationName.trim()) {
      setErrors({
        organizationName: ORGANIZATION_NAME_REQUIRED,
        siteErrorsBySiteId: {},
      });
      return;
    }

    const siteErrorsBySiteId = validateSites(sites);

    if (Object.keys(siteErrorsBySiteId).length > 0) {
      setErrors({ siteErrorsBySiteId });

      const firstInvalidSiteId = sites.find(
        (site) => siteErrorsBySiteId[site.id],
      )?.id;

      if (firstInvalidSiteId) {
        setExpandedSiteId(firstInvalidSiteId);
      }

      return;
    }

    setErrors(null);
    onContinue();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-lg font-bold lg:text-2xl">
          Let&apos;s set up your workspace.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text max-w-xl text-xs leading-snug lg:text-sm"
        >
          Tell us about your organisation so Neptune can pre-configure
          compliance templates and defaults for you.
        </Text>
      </div>

      <form
        className="scrollbar-hidden mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-auto py-4"
        noValidate
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
            required
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

        <div className="mt-4 flex flex-col">
          <Accordion>
            {sites.map((site, index) => {
              const isOpen = expandedSiteId === site.id;
              const isPrimary = index === 0;
              const triggerId = `${accordionBaseId}-trigger-${site.id}`;
              const panelId = `${accordionBaseId}-panel-${site.id}`;
              const siteFieldErrors = errors?.siteErrorsBySiteId[site.id];
              const hasError = hasSiteFieldErrors(siteFieldErrors);
              const accordionErrorMessage =
                getSiteAccordionErrorMessage(siteFieldErrors);
              const siteSummary = getSiteSummary(site);
              const isEmptyPrimarySummary =
                isPrimary && siteSummary === EMPTY_SITE_SUMMARY;
              const siteRequired = isSiteRequired(site, index);

              return (
                <Fragment key={site.id}>
                  <AccordionItem
                    triggerId={triggerId}
                    panelId={panelId}
                    isOpen={isOpen}
                    hasError={hasError}
                    onToggle={() => setExpandedSiteId(isOpen ? "" : site.id)}
                    icon={
                      <span
                        aria-hidden="true"
                        className="text-ehs-normal-blue flex size-7 shrink-0 items-center justify-center rounded-full"
                      >
                        <Icon
                          icon="mdi:map-marker-outline"
                          className="text-base"
                        />
                      </span>
                    }
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
                        className={
                          isEmptyPrimarySummary
                            ? "text-ehs-red text-sm"
                            : "text-ehs-muted-text text-sm"
                        }
                      >
                        {siteSummary}
                      </Text>
                    }
                    headerAction={
                      isPrimary ? (
                        <TextButton
                          type="button"
                          onClick={() => handleClearSite(site.id)}
                        >
                          <Icon
                            icon="mdi:trash-can-outline"
                            className="text-sm"
                            aria-hidden="true"
                          />
                          Clear
                        </TextButton>
                      ) : (
                        <TextButton
                          type="button"
                          onClick={() => handleRemoveSite(site.id)}
                        >
                          <Icon
                            icon="mdi:trash-can-outline"
                            className="text-sm"
                            aria-hidden="true"
                          />
                          Remove
                        </TextButton>
                      )
                    }
                  >
                    <SiteInfoFields
                      site={site}
                      isRequired={siteRequired}
                      fieldErrors={isOpen ? siteFieldErrors : undefined}
                      onFieldChange={(field, value) =>
                        handleSiteFieldChange(site.id, field, value)
                      }
                    />
                  </AccordionItem>

                  {accordionErrorMessage && !isOpen ? (
                    <Text as="p" className="text-ehs-red text-xs" role="alert">
                      {accordionErrorMessage}
                    </Text>
                  ) : null}
                </Fragment>
              );
            })}
          </Accordion>
        </div>

        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleAddSite}
            className="border-ehs-normal-blue text-ehs-normal-blue gap-1 border-dashed px-2 py-1 text-xs shadow-none"
          >
            <Icon icon="mdi:plus" className="text-sm" aria-hidden="true" />
            Add another site
          </Button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button type="button" variant="tertiary" onClick={onBack}>
            <Icon
              icon="mdi:chevron-left"
              className="text-lg"
              aria-hidden="true"
            />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-ehs-muted-text hidden items-center gap-2 text-sm lg:flex">
              <span
                aria-hidden="true"
                className="bg-ehs-green size-2 rounded-full"
              />
              <span>Progress saved automatically</span>
            </span>
            <Button type="submit" variant="primary">
              Continue
              <Icon
                icon="mdi:chevron-right"
                className="text-lg"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
