"use client";

import { useState } from "react";
import { TextInput } from "@/components/inputs/TextInput";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { CardHeading } from "@/components/CardHeading";
import {
  AccountSettingsShell,
  settingsLabelClass,
} from "@/components/profile/AccountSettingsShell";
import { ToggleSwitch } from "@/components/profile/ToggleSwitch";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export function AccountSettingsSecurityClient() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  /**
   * There is no change-password endpoint yet — auth.service only exposes the
   * OTP reset used by the forgot-password flow. This form previously validated
   * the fields, cleared them and toasted "Password updated" without calling
   * anything, so a user had every reason to believe their password had
   * changed. Disabled until an endpoint exists rather than left to mislead.
   */
  const canChangePassword = false;

  return (
    <AccountSettingsShell activeTab="security" showActions={false}>
      <GlassCard>
        <CardHeading
          title="Change Password"
          subtitle={
            'Changing your password here isn\'t available yet. Use "Forgot password" on the sign-in page to reset it by email.'
          }
        />

        <div className="mt-1 grid max-w-xl gap-4">
          <TextInput
            label="Current Password"
            labelClassName={settingsLabelClass}
            placeholder="Enter current password"
            type="password"
            value={currentPassword}
            disabled={!canChangePassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <TextInput
            label="New Password"
            labelClassName={settingsLabelClass}
            placeholder="Enter new password"
            type="password"
            value={newPassword}
            disabled={!canChangePassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextInput
            label="Confirm Password"
            labelClassName={settingsLabelClass}
            placeholder="Re-enter new password"
            type="password"
            value={confirmPassword}
            disabled={!canChangePassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <Button
          type="button"
          variant="primary"
          className="text4 mt-1 w-fit rounded-lg px-4 py-2"
          disabled={!canChangePassword}
        >
          Update Password
        </Button>
      </GlassCard>

      <GlassCard>
        <CardHeading
          title="Two-Factor Authentication (2FA)"
          subtitle="Requires a verification code during login to secure account access."
        />

        <div className="divide-ehs-border/50 mt-1 flex flex-col divide-y">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text as="p" className="text4 text-ehs-darker">
                Enable two-factor authentication
              </Text>
              <IncidentBadge
                label={twoFactorEnabled ? "ENABLED" : "DISABLED"}
                tone={twoFactorEnabled ? "success" : "muted"}
              />
            </div>
            <ToggleSwitch
              label="Two-factor authentication"
              checked={twoFactorEnabled}
              onChange={setTwoFactorEnabled}
            />
          </div>
        </div>
      </GlassCard>
    </AccountSettingsShell>
  );
}
