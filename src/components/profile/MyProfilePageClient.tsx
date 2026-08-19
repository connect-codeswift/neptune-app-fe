"use client";

import { Icon } from "@iconify/react";
import { BreadCrumbTab } from "@/components/BreadCrumbTab";
import { CardHeading } from "@/components/CardHeading";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  PLACEHOLDER_ACTIVITY,
  PLACEHOLDER_CERTIFICATIONS,
  PLACEHOLDER_PERSONAL_INFO,
  type ProfileCertification,
} from "@/components/profile/my-profile-data";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { AvatarPreview } from "@/components/profile/ProfileAvatarUpload";

/** Shared label/value row used by every profile detail card. */
function InfoRow(
  props: Readonly<{ label: string; value: string; valueClassName?: string }>,
) {
  const { label, value, valueClassName = "" } = props;

  return (
    <div className="border-ehs-border/50 flex flex-col gap-0.5 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Text as="span" className="text8 text-ehs-muted-text">
        {label}
      </Text>
      <Text
        as="span"
        className={["text4 text-ehs-darker sm:text-right", valueClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </Text>
    </div>
  );
}

function ProfileMetaItem(
  props: Readonly<{ icon: string; children: string; href?: string }>,
) {
  const { icon, children, href } = props;
  const contentClass =
    "text4 text-ehs-gray inline-flex items-center gap-1.5 transition-colors";

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon
        icon={icon}
        className="text-ehs-muted-text size-4 shrink-0"
        aria-hidden="true"
      />
      {href ? (
        <a href={href} className={`${contentClass} hover:text-ehs-normal-blue`}>
          {children}
        </a>
      ) : (
        <Text as="span" className={contentClass}>
          {children}
        </Text>
      )}
    </span>
  );
}

function CertificationStatusBadge(
  props: Readonly<{ status: ProfileCertification["status"] }>,
) {
  const { status } = props;

  return (
    <IncidentBadge
      label={status}
      tone={status === "Valid" ? "success" : "danger"}
    />
  );
}

function ProfileHeaderSkeleton() {
  return (
    <GlassCard className="gap-4">
      <div className="flex animate-pulse flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="bg-ehs-light-bg size-16 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="bg-ehs-light-bg h-6 w-48 rounded" />
            <div className="bg-ehs-light-bg h-4 w-64 rounded" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function MyProfilePageClient() {
  const { user, isLoading, sites } = useSessionBootstrap();

  const siteLocation =
    sites.find((site) => site.siteName === user.siteName)?.location ??
    user.siteName ??
    "—";
  const department = user.organizationName ?? "Environmental Health";

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <BreadCrumbTab
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Account" },
          ]}
          title="My Profile"
        />

        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <GlassCard className="gap-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <AvatarPreview
                  profileUrl={user.profileUrl}
                  initials={user.initials}
                  sizeClassName="size-16 text3"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text as="h2" className="text3 text-ehs-darker">
                      {user.displayName}
                    </Text>
                    <IncidentBadge label="Active" tone="success" showDot />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <ProfileMetaItem icon="mdi:briefcase-outline">
                      {user.role}
                    </ProfileMetaItem>
                    <ProfileMetaItem icon="mdi:domain">
                      {department}
                    </ProfileMetaItem>
                    <ProfileMetaItem icon="mdi:map-marker-outline">
                      {siteLocation}
                    </ProfileMetaItem>
                    {user.email ? (
                      <ProfileMetaItem
                        icon="mdi:email-outline"
                        href={`mailto:${user.email}`}
                      >
                        {user.email}
                      </ProfileMetaItem>
                    ) : null}
                  </div>
                </div>
              </div>

            </div>
          </GlassCard>
        )}

        <div className="grid gap-3.5 lg:grid-cols-2">
          <GlassCard>
            <CardHeading title="Personal Information" />
            <div className="mt-1">
              <InfoRow
                label="Employee ID"
                value={PLACEHOLDER_PERSONAL_INFO.employeeId}
              />
              <InfoRow
                label="Start Date"
                value={PLACEHOLDER_PERSONAL_INFO.startDate}
              />
              <InfoRow
                label="Reports To"
                value={PLACEHOLDER_PERSONAL_INFO.reportsTo}
              />
              <InfoRow
                label="Direct Reports"
                value={PLACEHOLDER_PERSONAL_INFO.directReports}
              />
              <InfoRow
                label="Employment Type"
                value={PLACEHOLDER_PERSONAL_INFO.employmentType}
              />
              <InfoRow
                label="Office"
                value={PLACEHOLDER_PERSONAL_INFO.office}
              />
            </div>
          </GlassCard>

          <GlassCard className="min-w-0">
            <CardHeading title="Certifications & Training" />
            <div className="-mx-1 mt-1 scrollbar-none overflow-x-auto px-1">
              <table className="w-full min-w-130 border-collapse text-left">
                <thead>
                  <tr className="border-ehs-border/60 border-b">
                    {["Certification", "Issued", "Expires", "Status"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="text6 text-ehs-muted-text pb-2"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {PLACEHOLDER_CERTIFICATIONS.map((cert) => (
                    <tr
                      key={cert.name}
                      className="border-ehs-border/40 border-b last:border-0"
                    >
                      <td className="text4 text-ehs-darker py-3 pr-3">
                        {cert.name}
                      </td>
                      <td className="text4 text-ehs-gray py-3 pr-3">
                        {cert.issued}
                      </td>
                      <td className="text4 text-ehs-gray py-3 pr-3">
                        {cert.expires}
                      </td>
                      <td className="py-3">
                        <CertificationStatusBadge status={cert.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-3.5">
          <GlassCard>
            <CardHeading
              title="Recent Activity"
              subtitle="Your latest actions"
            />
            <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
              {PLACEHOLDER_ACTIVITY.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="bg-ehs-light-bg text-ehs-normal-blue flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon
                      icon={item.icon}
                      className="size-4.5"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Text as="p" className="text4 text-ehs-darker">
                      {item.title}
                    </Text>
                    <Text as="p" className="text8 text-ehs-muted-text mt-0.5">
                      {item.timeAgo}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
