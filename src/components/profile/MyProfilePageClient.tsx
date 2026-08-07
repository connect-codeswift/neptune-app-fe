"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { BreadCrumbTab } from "@/components/BreadCrumbTab";
import { CardHeading } from "@/components/CardHeading";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  formatPermissionLabel,
  PLACEHOLDER_ACTIVITY,
  PLACEHOLDER_ASSIGNED_PERMISSIONS,
  PLACEHOLDER_CERTIFICATIONS,
  PLACEHOLDER_PERSONAL_INFO,
  type ProfileCertification,
} from "@/components/profile/my-profile-data";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { AvatarPreview } from "@/components/profile/ProfileAvatarUpload";

function ProfileDetailRow(
  props: Readonly<{ label: string; value: string }>,
) {
  const { label, value } = props;

  return (
    <div className="border-ehs-border/60 grid grid-cols-1 items-center gap-1 border-b py-4 last:border-b-0 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
      <Text as="span" className="text-ehs-muted-text text-sm">
        {label}
      </Text>
      <Text
        as="span"
        className="text-ehs-darker text-sm font-bold sm:text-right"
      >
        {value}
      </Text>
    </div>
  );
}

function PermissionsAccessCard(
  props: Readonly<{
    role: string;
    permissionLabels: readonly string[];
  }>,
) {
  const { role, permissionLabels } = props;
  const displayedPermissions =
    permissionLabels.length > 0
      ? permissionLabels
      : [...PLACEHOLDER_ASSIGNED_PERMISSIONS];

  return (
    <GlassCard className="gap-0 overflow-hidden p-0">
      <div className="border-ehs-border/60 border-b px-6 py-4">
        <Text
          as="h2"
          className="text-ehs-darker text-base font-bold tracking-tight"
        >
          Permissions & Access
        </Text>
      </div>

      <div className="px-6">
        <ProfileDetailRow label="System Role" value={role} />
        <ProfileDetailRow
          label="Access Level"
          value="Level 3 (Full EHS Module Access)"
        />

        <div className="border-ehs-border/60 border-b py-4">
          <Text as="p" className="text-ehs-muted-text text-sm">
            Assigned Permissions
          </Text>
          <div className="mt-3 flex flex-wrap gap-2">
            {displayedPermissions.map((permission) => (
              <span
                key={permission}
                className="bg-ehs-light-bg text-ehs-gray rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-ehs-border/60 border-t px-6">
        <ProfileDetailRow label="Last Login" value="Today at 9:42 AM" />
        <ProfileDetailRow
          label="Account Created"
          value={PLACEHOLDER_PERSONAL_INFO.startDate}
        />
      </div>
    </GlassCard>
  );
}

function InfoRow(
  props: Readonly<{ label: string; value: string; valueClassName?: string }>,
) {
  const { label, value, valueClassName = "" } = props;

  return (
    <div className="border-ehs-border/50 flex flex-col gap-0.5 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Text as="span" className="text-ehs-muted-text text-sm">
        {label}
      </Text>
      <Text
        as="span"
        className={[
          "text-ehs-darker text-sm font-medium sm:text-right",
          valueClassName,
        ]
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
    "text-ehs-gray inline-flex items-center gap-1.5 text-sm transition-colors";

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon
        icon={icon}
        className="text-ehs-muted-text shrink-0 text-base"
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
      className="text-xs font-semibold"
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
  const { user, permissions, isLoading, sites } = useSessionBootstrap();

  const permissionLabels = Array.from(permissions).map((permission) =>
    formatPermissionLabel(permission),
  );
  const siteLocation =
    sites.find((site) => site.siteName === user.siteName)?.location ??
    user.siteName ??
    "—";
  const department = user.organizationName ?? "Environmental Health";

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-[14px] px-4 pt-4 pb-8">
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <AvatarPreview
                  profileUrl={user.profileUrl}
                  initials={user.initials}
                  sizeClassName="size-16 text-xl"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text
                      as="h2"
                      className="text-ehs-darker text-xl font-bold tracking-tight"
                    >
                      {user.displayName}
                    </Text>
                    <IncidentBadge
                      label="Active"
                      tone="success"
                      showDot
                      className="text-xs font-semibold"
                    />
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

              <Link
                href="/dashboard/my-profile/settings"
                className="btn-sweep bg-ehs-normal-blue text-ehs-light-text inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-md shadow-ehs-normal-blue/60 transition-colors hover:bg-ehs-normal-blue-hover"
              >
                Settings
                <Icon
                  icon="mdi:arrow-right"
                  className="text-base"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </GlassCard>
        )}

        <div className="grid gap-[14px] lg:grid-cols-2">
          <GlassCard>
            <CardHeading title="Personal Information" />
            <div className="mt-1">
              <InfoRow label="Employee ID" value={PLACEHOLDER_PERSONAL_INFO.employeeId} />
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
            <div className="scrollbar-none mt-1 -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-ehs-border/60 border-b">
                    {["Certification", "Issued", "Expires", "Status"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="text-ehs-muted-text pb-2 text-xs font-semibold tracking-wide uppercase"
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
                      <td className="text-ehs-darker py-3 pr-3 text-sm font-medium">
                        {cert.name}
                      </td>
                      <td className="text-ehs-gray py-3 pr-3 text-sm">
                        {cert.issued}
                      </td>
                      <td className="text-ehs-gray py-3 pr-3 text-sm">
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

        <div className="grid gap-[14px] lg:grid-cols-2">
          <PermissionsAccessCard
            role={user.role}
            permissionLabels={permissionLabels}
          />

          <GlassCard>
            <CardHeading title="Recent Activity" subtitle="Your latest actions" />
            <div className="divide-ehs-border/60 mt-1 flex flex-col divide-y">
              {PLACEHOLDER_ACTIVITY.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="bg-ehs-light-bg text-ehs-normal-blue flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon
                      icon={item.icon}
                      className="text-lg"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Text
                      as="p"
                      className="text-ehs-darker text-sm leading-snug font-medium"
                    >
                      {item.title}
                    </Text>
                    <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
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
