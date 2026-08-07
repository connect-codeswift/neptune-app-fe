"use client";

import { useMemo, useState } from "react";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
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
import { useUpdateMyProfileMutation } from "@/hooks/use-profile-avatar";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";

type ProfileFormState = Readonly<{
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  department: string;
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
  jobTitle: string | null,
): ProfileFormState {
  const { firstName, lastName } = splitDisplayName(displayName);

  return {
    firstName,
    lastName,
    phone: DEFAULT_PROFILE_FORM.phone,
    // Blank rather than the role when unset. The sidebar falls back to the role for display,
    // but seeding it here would make an untouched Save write the role in as a job title.
    jobTitle: jobTitle ?? "",
    department: DEFAULT_PROFILE_FORM.department,
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
  const currentUser = getCurrentUser();
  const updateProfile = useUpdateMyProfileMutation();
  const initialState = useMemo(
    () => buildInitialFormState(user.displayName, user.jobTitle),
    [user.displayName, user.jobTitle],
  );
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [savedSnapshot, setSavedSnapshot] =
    useState<ProfileFormState>(initialState);

  const assignedSiteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: String(site.id),
        label: site.siteName,
      })),
    [sites],
  );
  const assignedSiteIds = useMemo(
    () => assignedSiteOptions.map((site) => site.value),
    [assignedSiteOptions],
  );

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    if (updateProfile.isPending) {
      return;
    }

    const fullName = [form.firstName, form.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");

    if (!fullName) {
      toast.error("Enter a first or last name.");
      return;
    }

    try {
      // Only the fields the API actually stores. Phone, department, office and reports-to are
      // still placeholder data on this screen, and sending the seeded phone number would fail
      // the backend's format check.
      await updateProfile.mutateAsync({
        fullName,
        jobTitle: form.jobTitle.trim(),
      });
      setSavedSnapshot(form);
      toast.success("Profile settings saved");
    } catch {
      toast.error("Could not save your profile. Try again.");
    }
  };

  const handleSave = () => {
    void saveProfile();
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
      <div className="grid gap-[14px]">
        <GlassCard className="gap-0 overflow-hidden p-0">
          <div className="border-ehs-border/60 border-b px-5 py-4">
            <Text
              as="h2"
              className="text-ehs-darker text-base font-bold tracking-tight"
            >
              Profile Photo
            </Text>
          </div>

          <ProfileAvatarUpload
            userId={currentUser.userId}
            initials={user.initials}
            profileUrl={user.profileUrl}
          />
        </GlassCard>

        {/* <GlassCard>
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
        </GlassCard> */}
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

            <div className="sm:col-span-2">
              <MultiSelectInput
                label="Sites"
                labelClassName={settingsLabelClass}
                placeholder="No sites assigned"
                options={assignedSiteOptions}
                value={assignedSiteIds}
                onChange={() => undefined}
                disabled
              />
              <Text as="p" className="text-ehs-muted-text mt-1 text-xs">
                Managed by administrator. Switch your
                active site from the header.
              </Text>
            </div>

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
