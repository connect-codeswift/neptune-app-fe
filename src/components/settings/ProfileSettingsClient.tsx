"use client";

import { Icon } from "@iconify/react";
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
import { useMyProfileQuery } from "@/hooks/use-user-queries";
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

/**
 * The phone format the API enforces: an optional `+`, then 8-15 digits, nothing else.
 * `^\+?[1-9]\d{7,14}$` on `UpdateUserProfileDto.ContactNo`.
 */
const API_PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;

/**
 * People type phone numbers with spaces, brackets and dashes; the API rejects all of them.
 * Stripping the punctuation is the difference between "saved" and a 400 the user cannot act on.
 */
function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d]/g, "");

  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

function buildInitialFormState(
  displayName: string,
  jobTitle: string | null,
  contactNo: string | null,
): ProfileFormState {
  const { firstName, lastName } = splitDisplayName(displayName);

  return {
    firstName,
    lastName,
    // The stored number, not the placeholder. Seeding this with sample data meant an untouched
    // Save wrote a stranger's number onto the account.
    phone: contactNo ?? "",
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

/** The muted line under a field explaining why it is the way it is. */
function FieldNote(props: Readonly<{ children: string }>) {
  const { children } = props;

  return (
    <Text as="p" className="text8 text-ehs-muted-text mt-1">
      {children}
    </Text>
  );
}

export function ProfileSettingsClient() {
  const { user, sites } = useSessionBootstrap();
  const currentUser = getCurrentUser();
  const updateProfile = useUpdateMyProfileMutation();
  const myProfileQuery = useMyProfileQuery(currentUser.userId);

  const initialState = useMemo(
    () =>
      buildInitialFormState(
        user.displayName,
        user.jobTitle,
        myProfileQuery.data?.contactNo ?? null,
      ),
    [user.displayName, user.jobTitle, myProfileQuery.data?.contactNo],
  );
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [savedSnapshot, setSavedSnapshot] =
    useState<ProfileFormState>(initialState);
  const [isEditing, setIsEditing] = useState(false);

  // The stored values arrive after first paint. Adopting them while the user is not editing
  // keeps the fields honest without ever overwriting something they are part-way through
  // typing — which is why this is keyed on `isEditing` rather than done in an effect.
  const [adoptedKey, setAdoptedKey] = useState("");
  const storedKey = `${user.displayName}|${user.jobTitle ?? ""}|${myProfileQuery.data?.contactNo ?? ""}`;
  if (!isEditing && adoptedKey !== storedKey) {
    setAdoptedKey(storedKey);
    setForm(initialState);
    setSavedSnapshot(initialState);
  }

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

  const isDirty =
    form.firstName !== savedSnapshot.firstName ||
    form.lastName !== savedSnapshot.lastName ||
    form.phone !== savedSnapshot.phone;

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

    const phone = normalizePhone(form.phone);

    if (phone !== "" && !API_PHONE_PATTERN.test(phone)) {
      toast.error(
        "Enter a valid phone number.",
        "8 to 15 digits, optionally starting with +.",
      );
      return;
    }

    try {
      // Name and phone only. Job title and sites are administrator-managed here, and office,
      // department and reports-to are still placeholder data this screen does not persist —
      // sending any of them would either overwrite a value the user cannot see or 400.
      await updateProfile.mutateAsync({ fullName, contactNo: phone });

      const saved = { ...form, phone };
      setForm(saved);
      setSavedSnapshot(saved);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save your profile. Try again.");
    }
  };

  const handleSave = () => {
    void saveProfile();
  };

  const handleCancel = () => {
    setForm(savedSnapshot);
    setIsEditing(false);
  };

  return (
    /* No Save in the page header: only one card on this tab is editable, and a header button
       implied the whole page was. Save lives in that card, and appears only once something has
       actually changed. */
    <SettingsShell activeSection="profile">
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
          <CardHeading
            title="Personal Information"
            subtitle={
              isEditing
                ? "Change your name or phone number, then save."
                : "Your name and phone number. The rest is managed for you."
            }
            action={
              isEditing ? null : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text7 text-ehs-normal-blue hover:bg-ehs-normal-blue/10 rounded-2.5 inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-2.5 py-1.5 transition-colors"
                >
                  <Icon
                    icon="mdi:pencil-outline"
                    className="size-4"
                    aria-hidden="true"
                  />
                  Edit
                </button>
              )
            }
          />

          <div className="mt-1 grid gap-4 sm:grid-cols-2">
            <TextInput
              label="First name"
              labelClassName={settingsLabelClass}
              placeholder="Enter first name"
              value={form.firstName}
              disabled={!isEditing || updateProfile.isPending}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            <TextInput
              label="Last name"
              labelClassName={settingsLabelClass}
              placeholder="Enter last name"
              value={form.lastName}
              disabled={!isEditing || updateProfile.isPending}
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
              <FieldNote>Contact your administrator to change this.</FieldNote>
            </div>

            <div>
              <TextInput
                label="Phone"
                labelClassName={settingsLabelClass}
                placeholder="Enter phone number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                disabled={!isEditing || updateProfile.isPending}
                onChange={(event) => updateField("phone", event.target.value)}
              />
              {isEditing ? (
                <FieldNote>
                  Digits only, optionally starting with +. Spaces and brackets
                  are removed when saved.
                </FieldNote>
              ) : null}
            </div>

            <div>
              {/* Job title is the administrator's to set: it appears against this person all
                  over the app — approvals, sign-offs, the sidebar — so it is a statement about
                  their position, not a field they describe themselves in. */}
              <TextInput
                label="Job title"
                labelClassName={settingsLabelClass}
                placeholder="Not set"
                value={form.jobTitle}
                disabled
              />
              <FieldNote>Set by your administrator.</FieldNote>
            </div>

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
              <FieldNote>
                Managed by your administrator. Switch your active site from the
                header.
              </FieldNote>
            </div>

            <div className="sm:col-span-2">
              <TextInput
                label="Office"
                labelClassName={settingsLabelClass}
                placeholder="Not set"
                value={form.office}
                disabled
              />
            </div>
          </div>

          {isEditing ? (
            /* Appears only in edit mode, and only commits when something actually changed —
               a Save that is always present invites a save that writes nothing. */
            <div className="border-ehs-border mt-2 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
              {isDirty ? null : (
                <Text as="p" className="text8 text-ehs-muted-text mr-auto">
                  Nothing changed yet.
                </Text>
              )}

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
                disabled={!isDirty}
                isLoading={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
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
