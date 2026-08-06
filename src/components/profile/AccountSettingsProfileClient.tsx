"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import {
  AccountSettingsShell,
  settingsLabelClass,
} from "@/components/profile/AccountSettingsShell";
import {
  DEFAULT_EMERGENCY_CONTACT,
  DEFAULT_PROFILE_FORM,
  DEPARTMENT_OPTIONS,
  NOTIFICATION_PREFERENCES,
  RELATIONSHIP_OPTIONS,
  REPORTS_TO_OPTIONS,
  splitDisplayName,
  type NotificationPreferenceKey,
} from "@/components/profile/account-settings-data";
import { PLACEHOLDER_PERSONAL_INFO } from "@/components/profile/my-profile-data";
import { ToggleSwitch } from "@/components/profile/ToggleSwitch";
import { CardHeading } from "@/components/CardHeading";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { toast } from "@/lib/toast";

type ProfileFormState = Readonly<{
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  department: string;
  siteId: string;
  office: string;
  reportsTo: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAltPhone: string;
  notifications: Record<NotificationPreferenceKey, boolean>;
}>;

function buildInitialFormState(
  displayName: string,
  role: string,
  siteId: number | null,
): ProfileFormState {
  const { firstName, lastName } = splitDisplayName(displayName);

  return {
    firstName,
    lastName,
    phone: DEFAULT_PROFILE_FORM.phone,
    jobTitle: role || DEFAULT_PROFILE_FORM.jobTitle,
    department: DEFAULT_PROFILE_FORM.department,
    siteId: siteId != null ? String(siteId) : "",
    office: DEFAULT_PROFILE_FORM.office,
    reportsTo: DEFAULT_PROFILE_FORM.reportsTo,
    emergencyName: DEFAULT_EMERGENCY_CONTACT.name,
    emergencyRelationship: DEFAULT_EMERGENCY_CONTACT.relationship,
    emergencyPhone: DEFAULT_EMERGENCY_CONTACT.phone,
    emergencyAltPhone: DEFAULT_EMERGENCY_CONTACT.altPhone,
    notifications: Object.fromEntries(
      NOTIFICATION_PREFERENCES.map((pref) => [pref.key, pref.defaultEnabled]),
    ) as Record<NotificationPreferenceKey, boolean>,
  };
}

export function AccountSettingsProfileClient() {
  const { user, sites } = useSessionBootstrap();
  const initialState = useMemo(
    () =>
      buildInitialFormState(
        user.displayName,
        user.role,
        sites.find((site) => site.siteName === user.siteName)?.id ?? sites[0]?.id ?? null,
      ),
    [user.displayName, user.role, user.siteName, sites],
  );
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [savedSnapshot, setSavedSnapshot] =
    useState<ProfileFormState>(initialState);

  const siteOptions = sites.map((site) => ({
    value: String(site.id),
    label: site.siteName,
  }));

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    setSavedSnapshot(form);
    toast.success("Profile settings saved");
  };

  const handleCancel = () => {
    setForm(savedSnapshot);
  };

  return (
    <AccountSettingsShell
      activeTab="profile"
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <div className="grid gap-[14px] lg:grid-cols-2">
        <GlassCard className="gap-0 overflow-hidden p-0">
          <div className="border-ehs-border/60 border-b px-5 py-4">
            <Text
              as="h2"
              className="text-ehs-darker text-base font-bold tracking-tight"
            >
              Profile Photo
            </Text>
          </div>

          <div className="flex items-start gap-5 px-5 py-5">
            <div
              className="bg-ehs-normal-blue text-ehs-light-text flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold"
              aria-hidden="true"
            >
              {user.initials}
            </div>

            <div className="flex min-w-0 flex-col gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="border-ehs-normal-blue text-ehs-normal-blue hover:bg-ehs-light-blue rounded-lg border bg-white px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  className="text-ehs-gray hover:text-ehs-darker text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
              <Text as="p" className="text-ehs-muted-text text-xs">
                Recommended: 200x200px, JPG or PNG
              </Text>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeading title="Emergency Contact" />
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Contact Name"
              labelClassName={settingsLabelClass}
              placeholder="Enter contact name"
              value={form.emergencyName}
              onChange={(event) =>
                updateField("emergencyName", event.target.value)
              }
            />
            <SelectInput
              label="Relationship"
              labelClassName={settingsLabelClass}
              placeholder="Select relationship"
              options={RELATIONSHIP_OPTIONS}
              value={form.emergencyRelationship}
              onChange={(event) =>
                updateField("emergencyRelationship", event.target.value)
              }
            />
            <TextInput
              label="Phone"
              labelClassName={settingsLabelClass}
              placeholder="Enter phone number"
              value={form.emergencyPhone}
              onChange={(event) =>
                updateField("emergencyPhone", event.target.value)
              }
            />
            <TextInput
              label="Alt Phone"
              labelClassName={settingsLabelClass}
              placeholder="Enter alternate phone"
              value={form.emergencyAltPhone}
              onChange={(event) =>
                updateField("emergencyAltPhone", event.target.value)
              }
            />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-[14px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GlassCard>
          <CardHeading title="Personal Information" />
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <TextInput
              label="First Name"
              labelClassName={settingsLabelClass}
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            <TextInput
              label="Last Name"
              labelClassName={settingsLabelClass}
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />

            <div className="sm:col-span-2">
              <TextInput
                label="Email"
                labelClassName={settingsLabelClass}
                placeholder="Enter email"
                value={user.email ?? ""}
                disabled
              />
              <Text as="p" className="text-ehs-muted-text mt-1 text-xs">
                Contact admin to change email
              </Text>
            </div>

            <TextInput
              label="Phone"
              labelClassName={settingsLabelClass}
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
            <TextInput
              label="Job Title"
              labelClassName={settingsLabelClass}
              placeholder="Enter job title"
              value={form.jobTitle}
              onChange={(event) => updateField("jobTitle", event.target.value)}
            />

            <SelectInput
              label="Department"
              labelClassName={settingsLabelClass}
              placeholder="Select department"
              options={DEPARTMENT_OPTIONS}
              value={form.department}
              onChange={(event) => updateField("department", event.target.value)}
            />
            <SelectInput
              label="Site / Location"
              labelClassName={settingsLabelClass}
              placeholder="Select site"
              options={siteOptions}
              value={form.siteId}
              onChange={(event) => updateField("siteId", event.target.value)}
            />

            <TextInput
              label="Employee ID"
              labelClassName={settingsLabelClass}
              placeholder="Employee ID"
              value={PLACEHOLDER_PERSONAL_INFO.employeeId}
              disabled
            />
            <SelectInput
              label="Reports To"
              labelClassName={settingsLabelClass}
              placeholder="Select manager"
              options={REPORTS_TO_OPTIONS}
              value={form.reportsTo}
              onChange={(event) => updateField("reportsTo", event.target.value)}
            />

            <div className="sm:col-span-2">
              <TextInput
                label="Office"
                labelClassName={settingsLabelClass}
                placeholder="Enter office location"
                value={form.office}
                onChange={(event) => updateField("office", event.target.value)}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeading title="Notification Preferences" />
          <div className="divide-ehs-border/60 mt-2 flex flex-col divide-y">
            {NOTIFICATION_PREFERENCES.map((preference) => (
              <div
                key={preference.key}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <Text as="p" className="text-ehs-darker text-sm leading-snug">
                  {preference.label}
                </Text>
                <ToggleSwitch
                  label={preference.label}
                  checked={form.notifications[preference.key]}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      notifications: {
                        ...current.notifications,
                        [preference.key]: checked,
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AccountSettingsShell>
  );
}
