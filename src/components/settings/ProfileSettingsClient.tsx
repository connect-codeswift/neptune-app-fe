"use client";

import { useMemo, useState } from "react";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { SettingsShell } from "@/components/settings/SettingsShell";
import {
  DEFAULT_EMERGENCY_CONTACT,
  DEFAULT_PROFILE_FORM,
  NOTIFICATION_PREFERENCES,
  splitDisplayName,
  type NotificationPreferenceKey,
} from "@/components/settings/profile-settings-data";
import { ToggleSwitch } from "@/components/profile/ToggleSwitch";
import { CardHeading } from "@/components/CardHeading";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
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

/** Sentence-case form labels, matching the other settings tabs. */
const settingsLabelClass = "text7 text-ehs-darker block";

export function ProfileSettingsClient() {
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
    <SettingsShell
      activeSection="profile"
      actions={
        <>
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateProfile.isPending}
            className="text4 text-ehs-darker hover:text-ehs-gray cursor-pointer bg-transparent px-1 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <Button
            type="button"
            variant="primary"
            className="text4 rounded-lg px-5 py-2.5"
            onClick={handleSave}
            isLoading={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <GlassCard>
        <CardHeading title="Profile Photo" />
        <ProfileAvatarUpload
          userId={currentUser.userId}
          initials={user.initials}
          profileUrl={user.profileUrl}
        />
      </GlassCard>

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GlassCard>
          <CardHeading title="Personal Information" />
          <div className="mt-1 grid gap-4 sm:grid-cols-2">
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
              <Text as="p" className="text8 text-ehs-muted-text mt-1">
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
              <Text as="p" className="text8 text-ehs-muted-text mt-1">
                Managed by administrator. Switch your active site from the
                header.
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
          <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
            {NOTIFICATION_PREFERENCES.map((preference) => (
              <div
                key={preference.key}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <Text as="p" className="text4 text-ehs-darker">
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
    </SettingsShell>
  );
}
